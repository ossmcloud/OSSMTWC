/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_utils.js', '../data/oTWC_equipment.js', '../data/oTWC_equipAction.js', './oTWC_eqTmeGroup.js'],
    (core, coreSql, recu, twcUtils, twcEquipment, twcEqAct, twcTmeg) => {

        // @@NOTE: one-off backfill of the TME Group (TMEG, custrecord_twc_equip_tme_group) on the existing equipment (see modules/oTWC_eqTmeGroup.js)
        //          run by svc/oTWC_eqTmeGroup_svc.js
        //          idempotent and restartable: each run works out the full target map with SQL only, then writes only the mismatches
        //          phase 1 writes the TMEs, phase 2 the children (ATME / Feeder), each by id ascending (rows <= lastId of the current phase are skipped)
        const UNITS_RESERVE = 50;
        const PAGE_SIZE = 5000;

        // @@HARDCODED: equipment class internal ids (same as EQ_CLASS_ENUM in data/oTWC_equipmentUI.js)
        const EQ_CLASS = twcUtils.SrfStepType;

        // ---------------------------------------------------------------------------------------------
        // @@NOTE: SuiteQL returns at most 5000 rows per query: page manually by id (stop on an empty page, so a lower cap in coreSql.run does not lose rows)
        function selectAllPaged(buildSql) {
            var res = []; var fromId = 0;
            while (true) {
                var rows = coreSql.run(buildSql(fromId)) || [];
                if (rows.length == 0) { break; }
                var lastId = parseInt(rows[rows.length - 1].id);
                // @@NOTE: the id is not unique in every query (swap pairs: one Swap Licence action may join several Swap Unlicence actions)
                //          the page may cut the rows of the last id: drop them and read them again with the next page (unless the whole page is that id)
                var keep = rows.filter(r => parseInt(r.id) != lastId);
                if (keep.length > 0) { rows = keep; lastId = parseInt(rows[rows.length - 1].id); }
                core.array.each(rows, r => { res.push(r); });
                if (!lastId || lastId <= fromId) { break; }
                fromId = lastId;
            }
            return res;
        }

        // all equipment: { id, eq_class, parent_tme, tme_group }
        function loadEquipment() {
            return selectAllPaged(fromId => `
                select  eq.id, eq.${twcEquipment.Fields.EQUIPMENT_CLASS} as eq_class, eq.${twcEquipment.Fields.PARENT_TME_ID} as parent_tme, eq.${twcEquipment.Fields.TME_GROUP} as tme_group
                from    ${twcEquipment.Type} eq
                where   eq.id > ${fromId}
                order by eq.id
                fetch first ${PAGE_SIZE} rows only
            `);
        }

        // @@NOTE: TME swap pairs: Swap Licence (new kit) and Swap Unlicence (old kit) actions on the same SRF item, both equipment TME class
        //          returns { id (Swap Licence action id), new_eq, old_eq } ordered by Swap Licence action id
        //          all action statuses are included (a cancelled swap still related the two TMEs)
        function loadTmeSwapPairs() {
            return selectAllPaged(fromId => `
                select  new_ea.id, new_ea.${twcEqAct.Fields.EA_EQUIPMENT} as new_eq, old_ea.${twcEqAct.Fields.EA_EQUIPMENT} as old_eq
                from    ${twcEqAct.Type} new_ea
                join    ${twcEqAct.Type} old_ea on old_ea.${twcEqAct.Fields.EA_SRF_ITEM} = new_ea.${twcEqAct.Fields.EA_SRF_ITEM} and old_ea.${twcEqAct.Fields.EA_TYPE} = ${twcUtils.EqActionType.SwapUnlicence}
                join    ${twcEquipment.Type} new_eq on new_eq.id = new_ea.${twcEqAct.Fields.EA_EQUIPMENT}
                join    ${twcEquipment.Type} old_eq on old_eq.id = old_ea.${twcEqAct.Fields.EA_EQUIPMENT}
                where   new_ea.id > ${fromId}
                and     new_ea.${twcEqAct.Fields.EA_TYPE} = ${twcUtils.EqActionType.SwapLicence}
                and     new_eq.${twcEquipment.Fields.EQUIPMENT_CLASS} = ${EQ_CLASS.TME}
                and     old_eq.${twcEquipment.Fields.EQUIPMENT_CLASS} = ${EQ_CLASS.TME}
                order by new_ea.id, old_ea.id
                fetch first ${PAGE_SIZE} rows only
            `);
        }

        // ---------------------------------------------------------------------------------------------
        // @@NOTE: works out the target TMEG of every TME and child: { tmes: [{ id, current, target }], children: [...], stats }
        //          - TMEs linked by swaps (union-find, so cycles in bad data cannot loop) form a chain; chain root = the TME that is never a swap-in
        //            (lowest id if more than one, lowest id of the chain if none - cycle); every TME of the chain gets the root existing TMEG || fmt(root)
        //            (if TMEs of the chain have different existing TMEGs, the root's wins)
        //          - any other TME: existing TMEG || fmt(id)
        //          - ATME / Feeder with a parent TME: the target of the parent; GIE and children with no (TME) parent: unchanged
        function computeTargets() {
            var equipment = loadEquipment();
            var byId = {};
            core.array.each(equipment, e => { e.id = parseInt(e.id); byId[e.id] = e; });

            // union-find over the swapped TMEs
            var ufParent = {};
            function find(x) {
                var root = x;
                while (ufParent[root] !== undefined && ufParent[root] != root) { root = ufParent[root]; }
                // path compression
                while (ufParent[x] !== undefined && ufParent[x] != root) { var next = ufParent[x]; ufParent[x] = root; x = next; }
                return root;
            }
            function union(a, b) {
                if (ufParent[a] === undefined) { ufParent[a] = a; }
                if (ufParent[b] === undefined) { ufParent[b] = b; }
                var ra = find(a); var rb = find(b);
                if (ra == rb) { return; }
                if (ra < rb) { ufParent[rb] = ra; } else { ufParent[ra] = rb; }
            }

            var swapIn = {};
            var pairs = loadTmeSwapPairs();
            core.array.each(pairs, p => {
                var newEq = parseInt(p.new_eq); var oldEq = parseInt(p.old_eq);
                if (!newEq || !oldEq || newEq == oldEq) { return; }
                if (!byId[newEq] || !byId[oldEq]) { return; }
                swapIn[newEq] = true;
                union(newEq, oldEq);
            });

            // chains: union-find set -> members
            var chains = {};
            for (var k in ufParent) {
                var id = parseInt(k);
                var set = find(id);
                if (!chains[set]) { chains[set] = []; }
                chains[set].push(id);
            }

            var chainTarget = {};
            var stats = { tmes: 0, chains: 0, longestChain: 0, children: 0, tmeMismatches: 0, childMismatches: 0, conflicts: 0 };
            for (var set in chains) {
                var members = chains[set].sort((a, b) => a - b);
                var roots = members.filter(m => !swapIn[m]);
                var root = roots.length > 0 ? roots[0] : members[0];
                if (roots.length == 0) { core.logError('TMEG-BACKFILL', `swap cycle with no root TME: ${members.join(',')}, using ${root}`); }
                var target = byId[root].tme_group || twcTmeg.fmt(root);
                var groups = {};
                core.array.each(members, m => {
                    chainTarget[m] = target;
                    if (byId[m].tme_group) { groups[byId[m].tme_group] = true; }
                });
                if (Object.keys(groups).length > 1) { stats.conflicts++; }
                stats.chains++;
                if (members.length > stats.longestChain) { stats.longestChain = members.length; }
            }

            var tmeTarget = {};
            var tmes = []; var children = [];
            core.array.each(equipment, e => {
                if (!twcTmeg.isTme(e.eq_class)) { return; }
                var target = chainTarget[e.id] || e.tme_group || twcTmeg.fmt(e.id);
                tmeTarget[e.id] = target;
                tmes.push({ id: e.id, current: e.tme_group || '', target: target });
                stats.tmes++;
                if ((e.tme_group || '') != target) { stats.tmeMismatches++; }
            });
            core.array.each(equipment, e => {
                if (!twcTmeg.isChild(e.eq_class)) { return; }
                var parentId = parseInt(e.parent_tme);
                // @@NOTE: a child with no parent, or whose parent is not a TME (bad data), keeps the TMEG it has
                if (!parentId || !tmeTarget[parentId]) { return; }
                var target = tmeTarget[parentId];
                children.push({ id: e.id, current: e.tme_group || '', target: target });
                stats.children++;
                if ((e.tme_group || '') != target) { stats.childMismatches++; }
            });

            // already in id order (equipment loaded ordered by id), sort anyway to be safe
            tmes.sort((a, b) => a.id - b.id);
            children.sort((a, b) => a.id - b.id);
            return { tmes: tmes, children: children, stats: stats };
        }

        // ---------------------------------------------------------------------------------------------
        // options: { phase: 1 | 2 (default 1), lastId: resume cursor of that phase, dryRun: no writes, only logs the counts }
        // @@NOTE: returns { updated, errors, mismatches, restart } - restart = { phase, lastId } when it stopped because of governance (the scheduled script restarts from there), null when done
        function backfill(options) {
            options = options || {};
            var startPhase = parseInt(options.phase) == 2 ? 2 : 1;
            var fromId = parseInt(options.lastId) || 0;
            var res = { updated: 0, errors: 0, mismatches: 0, restart: null };

            var data = computeTargets();
            var s = data.stats;
            core.logDebug('TMEG-BACKFILL', `${options.dryRun ? 'DRY RUN - ' : ''}TMEs: ${s.tmes}, chains: ${s.chains}, longest chain: ${s.longestChain}, chains with different TMEGs: ${s.conflicts}, children: ${s.children}, mismatches phase 1 (TMEs): ${s.tmeMismatches}, mismatches phase 2 (children): ${s.childMismatches}`);
            if (options.dryRun) {
                res.mismatches = s.tmeMismatches + s.childMismatches;
                return res;
            }

            var phases = [{ phase: 1, rows: data.tmes }, { phase: 2, rows: data.children }];
            for (var p = 0; p < phases.length; p++) {
                var ph = phases[p];
                if (ph.phase < startPhase) { continue; }
                var skipTo = ph.phase == startPhase ? fromId : 0;
                var lastId = skipTo;
                for (var i = 0; i < ph.rows.length; i++) {
                    var r = ph.rows[i];
                    if (r.id <= skipTo) { continue; }
                    if (r.current == r.target) { lastId = r.id; continue; }
                    if (core.env.units() < UNITS_RESERVE) { res.restart = { phase: ph.phase, lastId: lastId }; return res; }
                    res.mismatches++;

                    try {
                        recu.submit(twcEquipment.Type, r.id, twcEquipment.Fields.TME_GROUP, r.target);
                        res.updated++;
                    } catch (error) {
                        res.errors++;
                        core.logError('TMEG-BACKFILL', `equipment ${r.id} (phase ${ph.phase}): ${error.message}`);
                    }
                    lastId = r.id;
                }
            }
            return res;
        }

        return {
            computeTargets: computeTargets,
            backfill: backfill,
        }
    });
