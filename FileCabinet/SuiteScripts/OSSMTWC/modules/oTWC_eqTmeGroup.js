/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_utils.js', '../data/oTWC_equipment.js', '../data/oTWC_equipAction.js'],
    (core, coreSql, recu, twcUtils, twcEquipment, twcEqAct) => {

        // @@NOTE: TME Group (TMEG) - equipment field custrecord_twc_equip_tme_group (twcEquipment.Fields.TME_GROUP)
        //          value: 'TMEG-' + internal id of the ROOT TME, zero padded to 7 digits (e.g. TMEG-0001234)
        //          - set on the TME and on all its children (ATME / Feeder), GIE has no TMEG
        //          - a swap-in TME inherits the TMEG of the TME it replaces (the swap-out TME)
        //          so PARENT_TME_ID is the CURRENT parent / child relation while the TMEG links all TMEs (and their children) that were ever related
        //          - a TME TMEG never changes once set (only the one-off backfill, modules/oTWC_eqTmeGroupBackfill.js run by svc/oTWC_eqTmeGroup_svc.js, may correct it)
        //          - a child takes the TMEG of its (current) parent TME, a child without a parent keeps the TMEG it has
        //          maintained by: modules/oTWC_srfWorkflowEngine.js (initEquipment, SRF submit - main path)
        //                         oTWC_equipment_ue.js (fallback: native forms, SAF move, data migration, xedit)
        //                         ui/modules/oTWC_siteAccessUtils.js (moveAtmeToSwappedTme)
        const PREFIX = 'TMEG-';

        // @@HARDCODED: equipment class internal ids (same as twcUtils.SrfStepType / EQ_CLASS_ENUM in data/oTWC_equipmentUI.js)
        const EQ_CLASS = twcUtils.SrfStepType;

        function fmt(id) {
            var n = parseInt(id);
            if (!n) { return null; }
            // @@NOTE: pad, never truncate (an id longer than 7 digits gives a longer TMEG)
            return PREFIX + String(n).padStart(7, '0');
        }

        function isTme(eqClass) { return parseInt(eqClass) == EQ_CLASS.TME; }
        function isChild(eqClass) { return parseInt(eqClass) == EQ_CLASS.ATME || parseInt(eqClass) == EQ_CLASS.FEEDER; }

        // returns { id, eq_class, parent_tme, tme_group } for the given equipment id (null if not found)
        function getEqInfo(id) {
            id = parseInt(id);
            if (!id) { return null; }
            return coreSql.first(`
                select  eq.id, eq.${twcEquipment.Fields.EQUIPMENT_CLASS} as eq_class, eq.${twcEquipment.Fields.PARENT_TME_ID} as parent_tme, eq.${twcEquipment.Fields.TME_GROUP} as tme_group
                from    ${twcEquipment.Type} eq
                where   eq.id = ${id}
            `);
        }

        // @@NOTE: the swap-out TME of a swap-in TME: the Swap Unlicence action on the same SRF item as the (Swap Licence) action that created the swap-in equipment
        //         do NOT go through the equipment of the Swap Licence action (EA_EQUIPMENT): it is set only after the swap-in equipment is saved
        //         returns { id, tme_group } or null if the action is not a Swap Licence or the swapped out equipment is not a TME
        function findSwappedOutTme(swapLicenceEaId) {
            swapLicenceEaId = parseInt(swapLicenceEaId);
            if (!swapLicenceEaId) { return null; }
            return coreSql.first(`
                select  old_eq.id, old_eq.${twcEquipment.Fields.TME_GROUP} as tme_group
                from    ${twcEqAct.Type} new_ea
                join    ${twcEqAct.Type} old_ea on old_ea.${twcEqAct.Fields.EA_SRF_ITEM} = new_ea.${twcEqAct.Fields.EA_SRF_ITEM} and old_ea.${twcEqAct.Fields.EA_TYPE} = ${twcUtils.EqActionType.SwapUnlicence}
                join    ${twcEquipment.Type} old_eq on old_eq.id = old_ea.${twcEqAct.Fields.EA_EQUIPMENT}
                where   new_ea.id = ${swapLicenceEaId}
                and     new_ea.${twcEqAct.Fields.EA_TYPE} = ${twcUtils.EqActionType.SwapLicence}
                and     old_eq.${twcEquipment.Fields.EQUIPMENT_CLASS} = ${EQ_CLASS.TME}
            `);
        }

        // TMEG of a TME: { tmeGroup, stampOldTmeId }
        //  - existing value is kept
        //  - a swap-in TME (assocEaId = its Swap Licence action) inherits the swap-out TME TMEG (or fmt(swap-out id) if that TME has none yet: stampOldTmeId is then returned so the caller can stamp it)
        //  - otherwise fmt(own id) (null if the TME has no id yet - new record: the caller must set it after save)
        function resolveForTme(options) {
            if (options.tmeGroup) { return { tmeGroup: options.tmeGroup }; }
            if (options.assocEaId) {
                var oldTme = findSwappedOutTme(options.assocEaId);
                if (oldTme && oldTme.id != options.id) {
                    if (oldTme.tme_group) { return { tmeGroup: oldTme.tme_group }; }
                    return { tmeGroup: fmt(oldTme.id), stampOldTmeId: oldTme.id };
                }
            }
            return { tmeGroup: fmt(options.id) };
        }

        // TMEG of a child (ATME / Feeder): the TMEG of its parent TME (resolved if the parent has none yet, e.g. data not backfilled: fmt(parent id))
        function resolveForChild(parentId) {
            var parent = getEqInfo(parentId);
            if (!parent) { return null; }
            return parent.tme_group || fmt(parent.id);
        }

        // sets the TMEG on a TME (if not set) and on all its children whose TMEG differs
        // returns the number of records updated (2 units per submit + 10 for the query)
        function stampTmeAndChildren(tmeId, tmeGroup) {
            tmeId = parseInt(tmeId);
            if (!tmeId || !tmeGroup) { return 0; }
            var updated = 0;
            var rows = coreSql.run(`
                select  eq.id, eq.${twcEquipment.Fields.TME_GROUP} as tme_group
                from    ${twcEquipment.Type} eq
                where   (eq.id = ${tmeId} or eq.${twcEquipment.Fields.PARENT_TME_ID} = ${tmeId})
                and     eq.${twcEquipment.Fields.EQUIPMENT_CLASS} in (${EQ_CLASS.TME}, ${EQ_CLASS.ATME}, ${EQ_CLASS.FEEDER})
            `);
            core.array.each(rows, r => {
                if (r.tme_group == tmeGroup) { return; }
                // @@NOTE: a TME TMEG never changes once set
                if (r.id == tmeId && r.tme_group) { return; }
                recu.submit(twcEquipment.Type, r.id, twcEquipment.Fields.TME_GROUP, tmeGroup);
                updated++;
            });
            return updated;
        }

        return {
            PREFIX: PREFIX,
            fmt: fmt,
            isTme: isTme,
            isChild: isChild,
            getEqInfo: getEqInfo,
            findSwappedOutTme: findSwappedOutTme,
            resolveForTme: resolveForTme,
            resolveForChild: resolveForChild,
            stampTmeAndChildren: stampTmeAndChildren,
        }
    });
