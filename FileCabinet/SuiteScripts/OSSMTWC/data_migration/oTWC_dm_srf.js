/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix data migration: SRF import handler (SPEC_v1.2 §6.2)
//         steps (in order): srf, items, itemParents (import only), reviews, sds, actions, actionLinks (import only)
//         SDS items: @@TODO add the step when the Radix extract is available (SPEC §6.2.5, Q24)
//         every child row resolves its SRF by Radix Id among all migrated SRFs (dry run: also the SRFs of the srf file)
//         no SRF workflow records are created (Q14); records are created with their final status in one save (no status change emails)
define(['N/record', '../data/oTWC_srf.js', '../data/oTWC_srfItem.js', '../data/oTWC_srfReview.js', '../data/oTWC_sds.js', '../data/oTWC_equipAction.js', '../data/oTWC_equipment.js', '../data/oTWC_utils.js',
    './oTWC_dm_config.js', './oTWC_dm_csv.js', './oTWC_dm_lookups.js', './oTWC_dm_runs.js'],
    (record, twcSrf, twcSrfItem, twcSrfReview, twcSds, twcEqAction, twcEquipment, twcUtils, dmConfig, dmCsv, dmLookups, dmRuns) => {

        const Result = dmConfig.Result;
        const Mode = dmConfig.Mode;
        const DRY_RUN_ID = '(dry run)';

        // ---------------------------------------------------------------------------------------------
        // source columns
        // ---------------------------------------------------------------------------------------------
        const C_SRF = {
            NEXUS_ID: 'ID',
            RADIX_ID: 'Radix SRF ID',
            SRF_TYPE: 'SRF Type',
            REVENUE_IMPACTING: 'Revenue Impacting',
            OPERATOR_SITE_ID: 'Operator Site ID',
            SITE: 'Site',
            CUSTOMER: 'Customer',
            // @@NOTE: the Radix header spans two lines
            SUBMITTED_BY: 'SRF Submitted By\n(RADIX Profile ID)',
            APPLICATION_DATE: 'Application Date',
            APPLICATION_REFERENCE: 'Application Reference',
            POWER_FROM_TL: 'Power Supply Requested from TL',
            ALTERNATE_POWER_SUPPLIER: 'Alternate Power Supplier',
            OWN_SUPPLY_ESB: 'Application for own supply made to ESB',
            POWER_NOTES: 'Power Notes',
            STATUS: 'SRF Status',
            REQUESTED_DATE: 'SRF Requested Date',
            INITIAL_REVIEW_COMMENTS: 'Initial Review Comments',
            PLANNED_INSTALL_DATE: 'Customer Planned Install Date',
            FEEDBACK_LOOP_ITERATIONS: 'Feedback Loop Iterations',
            APPROVAL_DATE: 'SRF Approval Date',
            WORKS_PERMITTED_DATE: 'Works Permitted Date',
            TO_BE_BILLED: 'To be Billed',
            BILL_FROM: 'Bill From',
            CONDITIONS: 'SRF Conditions',
            TL_DRAWING_REQUESTED: 'TL Drawing Requested',
            TL_DRAWING_ASSIGNED_TO: 'TL Drawing Assigned To',
            TL_DRAWING_UPLOADED: 'TL Drawing Uploaded',
            LICENCE_MECHANISM: 'Licence Mechanism',
            LICENCE_REQUESTED: 'Licence Requested',
            PACK_PRODUCED: 'Licence Pack Produced',
            PACK_REVIEWER: 'Licence Pack Reviewer',
            PACK_REVIEWED: 'Licence Pack Reviewed',
            PACK_ISSUED: 'Licence Pack Issued',
            PACK_SIGNED: 'Licence Pack Signed',
            PACK_SIGNED_BY: 'Licence Pack Signed By',
            PACK_EXECUTED: 'Licence Pack Executed',
            PACK_EXECUTED_BY: 'Licence Pack Executed By',
            NOTES: 'SRF Notes'
        }

        const C_ITEM = {
            SRF: 'SRF',
            REQUEST_TYPE: 'Request Type',
            STEP_TYPE: 'Step Type',
            ITEM_TYPE: 'Item Type',
            LIBRARY_ENTRY: 'Equipment Library Entry',
            EQUIPMENT_ID: 'Equipment ID',
            PARENT_TME_ID: 'Parent TME ID',
            STRUCTURE: 'Structure',
            DESCRIPTION: 'Description',
            MAKE: 'Make',
            MODEL: 'Model',
            LENGTH_MM: 'Length (mm)',
            WIDTH_MM: 'Width (mm)',
            HEIGHT_DEPTH_MM: 'Height/Depth (mm)',
            HEIGHT_ON_TOWER: 'Height on Tower (m)',
            WEIGHT_KG: 'Weight (kg)',
            VOLTAGE_TYPE: 'Voltage Type',
            AZIMUTH: 'Azimuth',
            B_END: 'B-End',
            CUSTOMER_REF: 'Customer Ref',
            INVENTORY_FLAG: 'Inventory Flag',
            FEEDER_TYPE: 'Feeder Type',
            GIE_LOCATION: 'GIE Location',
            ANTENNA_LOCATION: 'Modified Antenna Location'
        }

        const C_REV = {
            SRF: 'SRF',
            ITERATION: 'Review Iteration',
            SUBMISSION_DATE: 'Submission Date',
            CUSTOMER_COMMENTS: 'Customer Submission Comments',
            TL_COMMENTS: 'TL Review Comments',
            TL_RESULT: 'TL Review Result',
            TL_COMPLETE: 'TL Review Complete',
            SA_REQUIRED: 'Structural Analysis Required',
            SA_REQ_PLANNED: 'SA Requested Planned',
            SA_REQ_ACTUAL: 'SA Requested Actual',
            SA_COMP_PLANNED: 'SA Complete Planned',
            SA_COMP_ACTUAL: 'SA Complete Actual',
            SPACE_PASSED: 'Space Check Passed',
            SPACE_COMMENTS: 'Space Check Comments',
            SVC_REQUESTED: 'TL Services Requested',
            SVC_REQ_PLANNED: 'Services Requested Planned',
            SVC_REQ_ACTUAL: 'Services Requested Actual',
            SVC_COMP_PLANNED: 'Services Complete Planned',
            SVC_COMP_ACTUAL: 'Services Complete Actual',
            FAC_PASSED: 'Facilities Check Passed',
            FAC_COMMENTS: 'Facilities Check Comments',
            FP_REQUIRED: 'Full Planning Required',
            FP_REQ_PLANNED: 'FP Requested Planned',
            FP_REQ_ACTUAL: 'FP Requested Actual',
            FP_COMP_PLANNED: 'FP Complete Planned',
            FP_COMP_ACTUAL: 'FP Complete Actual',
            EST_PASSED: 'Estates Check Passed',
            EST_COMMENTS: 'Estates Check Comments',
            PRICING_REQUIRED: 'Pricing Required',
            FEE_REDUCTION: 'Fee Reduction',
            FEE_UPLIFT: 'Fee Uplift',
            NEW_FEE: 'New Licence Fee',
            FEE_BREAKDOWN: 'Fee Change Breakdown',
            ACC_PASSED: 'Customer Accounts Check Passed',
            ACC_COMMENTS: 'Customer Accounts Check Comments'
        }

        const C_SDS = {
            RADIX_ID: 'RADIX SDS ID',
            SRF: 'SRF (RADIX SRF ID)',
            SITE: 'Site',
            CUSTOMER: 'Customer',
            STATUS: 'Status',
            COMMENCEMENT_DATE: 'Commencment Date',
            DRAWING_REFERENCE: 'Drawing Reference',
            INCLUDE_MAP: 'Include License Map',
            ADDITIONAL_CONDITIONS: 'Additional SRF Coniditons',
            POWER_COMMENTS: 'Power Supply Comments',
            FIBRE_RIGHTS: 'Fibre Rights',
            FIBRE_ROUTE_REF: 'Fibre Duct Route Reference',
            FIBRE_PROVIDER: 'Fibre Provider',
            FIBRE_OTHER_PROVIDER: 'Fibre Other Provider',
            FIBRE_NOTES: 'Fibre Notes',
            PREVIOUS_FEE: 'Previous License Fee',
            FEE_REDUCTION: 'Fee Reduction',
            FEE_UPLIFT: 'Fee Uplift',
            NEW_FEE: 'New License Fee',
            FEE_BREAKDOWN: 'Fee Charge Break Down',
            TEMPLATE: 'Agreement Template',
            CONDITIONS: 'Agreement Conditions',
            CONDITIONS_DATA: 'Agreement Conditions Data'
        }

        const C_EA = {
            NEXUS_ID: 'Internal ID',
            RADIX_ID: 'ID',
            EQUIPMENT: 'EA Equipment (RADIX Equip ID)',
            SRF: 'EA SRF',
            SRF_ITEM: 'EA SRF Item',
            TYPE: 'EA Type',
            RELATED_EA: 'Related EA',
            STATUS: 'EA Status'
        }

        // @@NOTE: Radix values spelled differently in Nexus (matched on the lookup key)
        const SDS_STATUS_ALIAS = { 'superceded': 'Superseded' };

        // @@NOTE: SRF statuses from which an SDS is expected (status consistency warning, Q2)
        const LICENCE_STAGE_STATUS = [twcUtils.SrfStatus.LicenceRequested, twcUtils.SrfStatus.LicenceIssued, twcUtils.SrfStatus.LicenceSigned, twcUtils.SrfStatus.LicenceExecuted, twcUtils.SrfStatus.Completed];

        // @@NOTE: SRF item request type => expected EA types (lookup keys of the names), as oTWC_siteRequestUtils.js: saveEqActions creates them
        const EXPECTED_EA_TYPES = { 'install': ['licence'], 'remove': ['unlicence'], 'swap': ['swap unlicence', 'swap licence'] };

        // @@NOTE: NetSuite text field limits; longer values are cut with a warning
        const TEXT_LIMITS = { text: 300, textarea: 4000 };

        // ---------------------------------------------------------------------------------------------
        // helpers
        // ---------------------------------------------------------------------------------------------
        function txt(row, col) { return dmCsv.text(row[col]); }

        // @@NOTE: SPEC Q9: '0' is also empty for these text columns
        function txt0(row, col) {
            var v = dmCsv.text(row[col]);
            return v === '0' ? null : v;
        }

        // @@NOTE: 'TKY1017 : Derryquin' => site code TKY1017
        function siteCode(value) {
            return (value || '').split(':')[0].trim() || null;
        }

        function itemKey(srfRid, eqRid) { return `${srfRid}-${eqRid}`; }

        function message(notes, warnings) {
            return notes.concat(warnings.map(w => { return `WARNING: ${w}`; })).join('; ');
        }

        function nexusIdCheck(row, column) {
            var nexusId = dmCsv.text(row[column]);
            if (nexusId) { throw new dmCsv.RowError(`${column}: row already linked to Nexus record ${nexusId}`); }
        }

        function duplicate(map, rid, ctx, recordType) {
            var existing = map.find(rid);
            if (existing.length == 0) { return null; }
            var msg = existing[0].run == ctx.runName ? 'duplicate in the file (or already created by this run before a restart)' : `already in Nexus${existing[0].run ? ' (run ' + existing[0].run + ')' : ''}`;
            return { result: Result.SKIPPED_DUPLICATE, radixId: rid, nsRecordType: recordType, nsId: existing.map(e => { return e.id; }).join('|'), message: msg };
        }

        // @@NOTE: cuts text values longer than the field allows (field type from the persistent FieldsInfo)
        function fit(B, values, warnings) {
            for (var k in B.FieldsInfo) {
                var info = B.FieldsInfo[k];
                var limit = TEXT_LIMITS[info.type];
                var value = values[info.name];
                if (!limit || typeof value != 'string' || value.length <= limit) { continue; }
                values[info.name] = value.substring(0, limit);
                warnings.push(`${k}: text cut to ${limit} characters (was ${value.length})`);
            }
        }

        function create(B, values, rid, ctx) {
            var rec = record.create({ type: B.Type });
            for (var fieldId in values) {
                if (values[fieldId] === null || values[fieldId] === undefined) { continue; }
                rec.setValue({ fieldId: fieldId, value: values[fieldId] });
            }
            rec.setValue({ fieldId: B.Fields.RADIX_ID, value: rid });
            rec.setValue({ fieldId: B.Fields.RADIX_MIGRATED, value: true });
            rec.setValue({ fieldId: B.Fields.RADIX_IMPORT_RUN, value: ctx.runName });
            return rec.save({ enableSourcing: false, ignoreMandatoryFields: true });
        }

        function update(recordType, id, values) {
            record.submitFields({ type: recordType, id: id, values: values, options: { enableSourcing: false, ignoreMandatoryFields: true } });
        }

        // @@NOTE: date/time fields (Licence Pack Signed / Executed): the date is used as is (Q8), set at 12:00 so no timezone shift can move it to another day
        function dateTime(value, column) {
            var d = dmCsv.date(value, column);
            if (d) { d.setHours(12); }
            return d;
        }

        // @@NOTE: the one record created by this run for a Radix Id (steps updating links only touch records of the run)
        function mine(map, rid, ctx, column) {
            var rows = map.find(rid).filter(e => { return e.run == ctx.runName; });
            if (rows.length > 1) { throw new dmCsv.RowError(`${column}: ${rows.length} records created by this run for '${rid}'`); }
            return rows[0] || null;
        }

        // ---------------------------------------------------------------------------------------------
        // lookups: lists are loaded once per execution, record maps (by Radix Id) once per step (they change from step to step)
        // ---------------------------------------------------------------------------------------------
        function lists(ctx) {
            if (ctx.cache.srfLists) { return ctx.cache.srfLists; }
            var EQ = twcEquipment.Fields;
            var executor = dmLookups.runAll(`select id from employee where custentity_twc_can_execute_pack = 'T' order by id`)[0];
            var L = {
                company: dmLookups.byName('company', 'customrecord_twc_company'),
                site: dmLookups.byName('site', 'customrecord_twc_site', { code: 'custrecord_twc_site_id' }, 'code'),
                infra: dmLookups.byName('infrastructure', 'customrecord_twc_infra', { site: 'custrecord_twc_infra_site' }),
                // @@NOTE: profiles by Radix id (SPEC Q17)
                profile: dmLookups.byName('profile', 'customrecord_twc_prof', { radixnum: 'custrecord_twc_prof_radix_entry_num' }, 'radixnum'),
                srfType: dmLookups.byName('SRF type', 'customrecord_twc_srf_type'),
                revenueImpact: dmLookups.byName('revenue impacting value', 'customrecord_twc_srf_revenue_impact'),
                srfStatus: dmLookups.byName('SRF status', 'customrecord_twc_srf_status'),
                licenceMechanism: dmLookups.byName('licence mechanism', 'customrecord_twc_lic_mech'),
                requestType: dmLookups.byName('request type', 'customrecord_twc_srf_itm_req_type'),
                eqClass: dmLookups.byName('equipment class', 'customrecord_twc_eq_class'),
                eqType: dmLookups.byName('equipment type', 'customrecord_twc_eq_type', { eqclass: 'custrecord_twc_eq_type_class' }),
                libraryEntry: dmLookups.byName('equipment library entry', 'customrecord_twc_eq_lib'),
                voltageType: dmLookups.byName('voltage type', 'customrecord_twc_equip_voltage_type'),
                inventoryFlag: dmLookups.byName('inventory flag', 'customrecord_twc_srf_itm_inv_flag'),
                feederType: dmLookups.byName('feeder type', 'customrecord_twc_srf_itm_typ_opt'),
                antennaLocation: dmLookups.byName('antenna location', 'customrecord_twc_srf_itm_loc_type'),
                reviewResult: dmLookups.byName('TL review result', 'customrecord_twc_tl_review_result'),
                sdsStatus: dmLookups.byName('SDS status', 'customrecord_twc_sds_status'),
                fibreProvider: dmLookups.byName('fibre provider', 'customrecord_twc_infra_fibre_svc_provide'),
                agreementCondition: dmLookups.byName('agreement condition', 'customrecord_twc_agreement_cond'),
                eaType: dmLookups.byName('EA type', 'customrecord_twc_eq_action_type'),
                eaStatus: dmLookups.byName('EA status', 'customrecord_twc_eq_action_sts'),
                // @@NOTE: SPEC Q20: 'Licence Pack Executed By' is an employee field: the first employee who can execute packs
                packExecutor: executor ? executor.id : null,
                // @@NOTE: all Nexus equipment with a Radix Id (assoc = Associated Equip Action, step actionLinks keeps it up to date)
                equipment: new dmLookups.LookupMap('equipment', dmLookups.runAll(`
                    select  id, name, ${EQ.RADIX_EQUIPMENT_TABLE_ROW} as radixid, ${EQ.ASSOCIATED_EQUIP_ACTIONS} as assoc
                    from    ${twcEquipment.Type}
                    where   ${EQ.RADIX_EQUIPMENT_TABLE_ROW} is not null
                `), 'radixid')
            };
            ctx.cache.srfLists = L;
            return L;
        }

        // @@NOTE: migrated records of a type by Radix Id, extra = additional select columns
        function radixMap(label, B, extra) {
            var F = B.Fields;
            return new dmLookups.LookupMap(label, dmLookups.runAll(`
                select  id, ${F.RADIX_ID} as radixid, ${F.RADIX_IMPORT_RUN} as run ${extra ? ', ' + extra : ''}
                from    ${B.Type}
                where   ${F.RADIX_ID} is not null
            `), 'radixid');
        }

        // @@NOTE: rows of another file grouped by a column (lookup key)
        function groupBy(ctx, fileKey, column) {
            var cacheKey = `group:${fileKey}:${column}`;
            if (!ctx.cache[cacheKey]) {
                var g = {};
                ctx.loadFile(fileKey).forEach(r => {
                    var k = dmCsv.key(dmCsv.text(r[column]));
                    if (!k) { return; }
                    if (!g[k]) { g[k] = []; }
                    g[k].push(r);
                });
                ctx.cache[cacheKey] = g;
            }
            return ctx.cache[cacheKey];
        }

        // @@NOTE: SRFs by Radix Id; children (withFile) in a dry run also accept the SRFs of the srf file, as they are not created
        //         in an import the children only see the SRFs created in Nexus: map.fileRows (srf file row no. by Radix Id) lets
        //         resolveSrf() tell 'SRF row failed in step srf' from 'SRF not in the srf file'
        function srfMap(ctx, withFile) {
            var F = twcSrf.Fields;
            var map = radixMap('SRF', twcSrf, `name, ${F.SITE} as site`);
            if (withFile) {
                var L = lists(ctx);
                map.fileRows = {};
                ctx.loadFile('srf').forEach((r, i) => {
                    var rid = txt(r, C_SRF.RADIX_ID);
                    if (!rid) { return; }
                    // @@NOTE: same row no. as the run log (header is line 1)
                    if (!map.fileRows[dmCsv.key(rid)]) { map.fileRows[dmCsv.key(rid)] = i + 2; }
                    if (!ctx.dryRun || map.find(rid).length > 0) { return; }
                    var site = L.site.find(siteCode(txt(r, C_SRF.SITE)));
                    map.add(rid, { id: DRY_RUN_ID, radixid: rid, name: null, site: site.length == 1 ? site[0].id : null, run: ctx.runName });
                });
            }
            return map;
        }

        // @@NOTE: the SRF row of a child (item, review, SDS, EA); an SRF that is in the srf file but not in Nexus failed (or was skipped) in step srf
        function resolveSrf(ctx, srfRid, column) {
            var map = ctx.maps.srf;
            var rowNo = map.fileRows ? map.fileRows[dmCsv.key(srfRid)] : null;
            if (srfRid && rowNo && map.find(srfRid).length == 0) {
                throw new dmCsv.RowError(`${column}: SRF '${srfRid}' is in the SRF file (row ${rowNo}) but was not created: see the error of that row in step srf`);
            }
            return map.resolveRow(srfRid, column);
        }

        // @@NOTE: SRF items by Radix Id {srf}-{equipment}, with the request type name (EA consistency warning)
        function itemMap(ctx, withFile) {
            var F = twcSrfItem.Fields;
            var map = radixMap('SRF item', twcSrfItem, `BUILTIN.DF(${F.REQUEST_TYPE}) as reqtype`);
            if (withFile && ctx.dryRun) {
                ctx.loadFile('srf_items').forEach(r => {
                    var srfRid = txt(r, C_ITEM.SRF);
                    var eqRid = txt(r, C_ITEM.EQUIPMENT_ID);
                    if (!srfRid || !eqRid) { return; }
                    var rid = itemKey(srfRid, eqRid);
                    if (map.find(rid).length > 0) { return; }
                    map.add(rid, { id: DRY_RUN_ID, radixid: rid, reqtype: txt(r, C_ITEM.REQUEST_TYPE), run: ctx.runName });
                });
            }
            return map;
        }

        function eaMap(ctx) {
            return radixMap('equipment action', twcEqAction, `${twcEqAction.Fields.EA_TYPE} as eatype`);
        }

        // @@NOTE: step prepare: lists + the record maps the step needs (fresh per step)
        function prepare(maps) {
            return (ctx) => {
                lists(ctx);
                ctx.maps = {};
                for (var k in maps) { ctx.maps[k] = maps[k](ctx); }
            };
        }

        // ---------------------------------------------------------------------------------------------
        // step 'srf'
        // ---------------------------------------------------------------------------------------------
        function srfRadixId(row) { return txt(row, C_SRF.RADIX_ID); }

        // @@NOTE: SPEC Q22: the SRF structure is not in the Radix SRF extract, it is taken from the SRF items when they are all on one structure
        function srfStructure(rid, siteId, code, L, ctx, warnings) {
            var names = {};
            (groupBy(ctx, 'srf_items', C_ITEM.SRF)[dmCsv.key(rid)] || []).forEach(r => {
                var s = txt(r, C_ITEM.STRUCTURE);
                if (s) { names[dmCsv.key(s)] = s; }
            });
            var list = Object.keys(names).map(k => { return names[k]; });
            if (list.length == 0) { return null; }
            if (list.length > 1) {
                warnings.push(`SRF items on ${list.length} structures (${list.join(', ')}): structure left empty`);
                return null;
            }
            try {
                if (!siteId) { return L.infra.resolve(list[0], 'Structure (from SRF items)'); }
                return L.infra.resolve(list[0], 'Structure (from SRF items)', r => { return String(r.site) == String(siteId); }, `on site ${code}`);
            } catch (error) {
                if (!(error instanceof dmCsv.RowError)) { throw error; }
                warnings.push(`${error.message}: structure left empty`);
                return null;
            }
        }

        function processSrf(row, ctx) {
            var L = lists(ctx);
            var M = ctx.maps;
            var F = twcSrf.Fields;
            var C = C_SRF;
            var rid = dmCsv.required(srfRadixId(row), C.RADIX_ID);
            nexusIdCheck(row, C.NEXUS_ID);
            var dup = duplicate(M.srf, rid, ctx, twcSrf.Type);
            if (dup) { return dup; }

            var get = dmCsv.collector();
            var notes = [];
            var warnings = [];
            var v = {};
            var t = (col) => { return txt(row, col); };
            var profile = (col) => { return get(() => { return L.profile.resolve(t(col), col); }); };
            var date = (col) => { return get(() => { return dmCsv.date(row[col], col); }); };
            var bool = (col) => { return get(() => { return dmCsv.bool(row[col], col); }); };

            // @@NOTE: NAME is not set: NetSuite auto-numbering (SPEC Q18)
            var code = siteCode(t(C.SITE));
            v[F.SITE] = get(() => { return L.site.resolve(dmCsv.required(code, C.SITE), C.SITE); });
            v[F.CUSTOMER] = get(() => { return L.company.resolve(dmCsv.required(t(C.CUSTOMER), C.CUSTOMER), C.CUSTOMER); });
            v[F.STRUCTURE] = v[F.SITE] || !code ? srfStructure(rid, v[F.SITE], code, L, ctx, warnings) : null;
            v[F.SRF_TYPE] = get(() => { return L.srfType.resolve(t(C.SRF_TYPE), C.SRF_TYPE); });
            v[F.REVENUE_IMPACTING] = get(() => { return L.revenueImpact.resolve(t(C.REVENUE_IMPACTING), C.REVENUE_IMPACTING); });
            v[F.OPERATOR_SITE_ID] = txt0(row, C.OPERATOR_SITE_ID);
            v[F.SRF_SUBMITTED_BY] = profile(C.SUBMITTED_BY);

            v[F.APPLICATION_DATE] = date(C.APPLICATION_DATE);
            v[F.APPLICATION_REFERENCE] = t(C.APPLICATION_REFERENCE);
            v[F.POWER_SUPPLY_REQUESTED_FROM_TL] = bool(C.POWER_FROM_TL);
            v[F.ALTERNATE_POWER_SUPPLIER] = t(C.ALTERNATE_POWER_SUPPLIER);
            v[F.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB] = bool(C.OWN_SUPPLY_ESB);
            v[F.POWER_NOTES] = t(C.POWER_NOTES);

            var status = get(() => { return L.srfStatus.resolve(dmCsv.required(t(C.STATUS), C.STATUS), C.STATUS); });
            v[F.SRF_STATUS] = status;
            v[F.SRF_REQUESTED_DATE] = date(C.REQUESTED_DATE);
            v[F.INITIAL_REVIEW_COMMENTS] = t(C.INITIAL_REVIEW_COMMENTS);
            v[F.CUSTOMER_PLANNED_INSTALL_DATE] = date(C.PLANNED_INSTALL_DATE);
            v[F.FEEDBACK_LOOP_ITERATIONS] = get(() => { return dmCsv.integer(row[C.FEEDBACK_LOOP_ITERATIONS], C.FEEDBACK_LOOP_ITERATIONS); });
            v[F.SRF_APPROVAL_DATE] = date(C.APPROVAL_DATE);
            v[F.WORKS_PERMITTED_DATE] = date(C.WORKS_PERMITTED_DATE);
            v[F.TO_BE_BILLED] = bool(C.TO_BE_BILLED);
            v[F.BILL_FROM] = date(C.BILL_FROM);
            v[F.SRF_CONDITIONS] = t(C.CONDITIONS);

            v[F.TL_DRAWING_REQUESTED] = bool(C.TL_DRAWING_REQUESTED);
            v[F.TL_DRAWING_ASSIGNED_TO] = profile(C.TL_DRAWING_ASSIGNED_TO);
            v[F.TL_DRAWING_UPLOADED] = date(C.TL_DRAWING_UPLOADED);

            v[F.LICENCE_MECHANISM] = get(() => { return L.licenceMechanism.resolve(t(C.LICENCE_MECHANISM), C.LICENCE_MECHANISM); });
            v[F.LICENCE_REQUESTED] = date(C.LICENCE_REQUESTED);
            v[F.LICENCE_PACK_PRODUCED] = date(C.PACK_PRODUCED);
            v[F.LICENCE_PACK_REVIEWER] = profile(C.PACK_REVIEWER);
            v[F.LICENCE_PACK_REVIEWED] = date(C.PACK_REVIEWED);
            v[F.LICENCE_PACK_ISSUED] = date(C.PACK_ISSUED);
            v[F.LICENCE_PACK_SIGNED] = get(() => { return dateTime(row[C.PACK_SIGNED], C.PACK_SIGNED); });
            v[F.LICENCE_PACK_SIGNED_BY] = profile(C.PACK_SIGNED_BY);
            v[F.LICENCE_PACK_EXECUTED] = get(() => { return dateTime(row[C.PACK_EXECUTED], C.PACK_EXECUTED); });

            // @@NOTE: SPEC Q20: employee field, Radix gives a profile id => the first employee who can execute packs
            var executedBy = t(C.PACK_EXECUTED_BY);
            if (executedBy) {
                if (L.packExecutor) {
                    v[F.LICENCE_PACK_EXECUTED_BY] = L.packExecutor;
                    notes.push(`${C.PACK_EXECUTED_BY}: Radix profile ${executedBy} set to employee ${L.packExecutor}`);
                } else {
                    warnings.push(`${C.PACK_EXECUTED_BY}: no employee can execute packs, left empty (Radix profile ${executedBy})`);
                }
            }

            // @@NOTE: SPEC Q23
            v[F.TL_NOTES] = t(C.NOTES);

            // @@NOTE: status consistency warnings (SPEC Q2): the children are imported anyway
            if (status) {
                if (status != twcUtils.SrfStatus.SRFCancelled && !groupBy(ctx, 'srf_items', C_ITEM.SRF)[dmCsv.key(rid)]) { warnings.push('no SRF items in the SRF items file'); }
                if (LICENCE_STAGE_STATUS.indexOf(Number(status)) >= 0 && !groupBy(ctx, 'sds', C_SDS.SRF)[dmCsv.key(rid)]) { warnings.push(`SRF status '${t(C.STATUS)}' but no SDS in the SDS file`); }
            }

            if (get.errors.length > 0) { throw new dmCsv.RowError(get.errors.join('; ')); }
            fit(twcSrf, v, warnings);

            if (ctx.dryRun) {
                M.srf.add(rid, { id: DRY_RUN_ID, radixid: rid, run: ctx.runName });
                return { result: Result.VALID, radixId: rid, nsRecordType: twcSrf.Type, message: message(notes, warnings) };
            }
            var id = create(twcSrf, v, rid, ctx);
            M.srf.add(rid, { id: id, radixid: rid, run: ctx.runName });
            return { result: Result.CREATED, radixId: rid, nsRecordType: twcSrf.Type, nsId: id, message: message(notes, warnings) };
        }

        // ---------------------------------------------------------------------------------------------
        // step 'items'
        // ---------------------------------------------------------------------------------------------
        function itemRadixId(row) {
            var srfRid = txt(row, C_ITEM.SRF);
            var eqRid = txt(row, C_ITEM.EQUIPMENT_ID);
            return srfRid && eqRid ? itemKey(srfRid, eqRid) : null;
        }

        function processItem(row, ctx) {
            var L = lists(ctx);
            var M = ctx.maps;
            var F = twcSrfItem.Fields;
            var C = C_ITEM;
            var srfRid = dmCsv.required(txt(row, C.SRF), C.SRF);
            var eqRid = dmCsv.required(txt(row, C.EQUIPMENT_ID), C.EQUIPMENT_ID);
            var rid = itemKey(srfRid, eqRid);
            var dup = duplicate(M.item, rid, ctx, twcSrfItem.Type);
            if (dup) { return dup; }

            var get = dmCsv.collector();
            var warnings = [];
            var v = {};
            var t = (col) => { return txt(row, col); };
            var num = (col) => { return get(() => { return dmCsv.number(row[col], col); }); };
            var int = (col) => { return get(() => { return dmCsv.integer(row[col], col); }); };

            var srf = get(() => { return resolveSrf(ctx, srfRid, C.SRF); });
            var eq = get(() => { return L.equipment.resolveRow(eqRid, C.EQUIPMENT_ID); });
            v[F.SRF] = srf ? srf.id : null;
            v[F.EQUIPMENT_ID] = eq ? eq.id : null;
            // @@NOTE: the item is named after its equipment, as the portal does (SPEC Q18)
            v[F.NAME] = eq ? eq.name : null;

            v[F.REQUEST_TYPE] = get(() => { return L.requestType.resolve(dmCsv.required(t(C.REQUEST_TYPE), C.REQUEST_TYPE), C.REQUEST_TYPE); });
            var className = t(C.STEP_TYPE);
            v[F.STEP_TYPE] = get(() => { return L.eqClass.resolve(dmCsv.required(className, C.STEP_TYPE), C.STEP_TYPE); });
            v[F.ITEM_TYPE] = get(() => {
                if (!v[F.STEP_TYPE]) { return L.eqType.resolve(t(C.ITEM_TYPE), C.ITEM_TYPE); }
                return L.eqType.resolve(t(C.ITEM_TYPE), C.ITEM_TYPE, r => { return String(r.eqclass) == String(v[F.STEP_TYPE]); }, `for class ${className}`);
            });
            v[F.EQUIPMENT_LIBRARY] = get(() => { return L.libraryEntry.resolve(t(C.LIBRARY_ENTRY), C.LIBRARY_ENTRY); });
            // @@NOTE: parent TME equipment (a TME points to itself, as the portal copies the equipment's parent); TMI_ID_SRF is set by step itemParents
            v[F.TME_ID] = get(() => { return L.equipment.resolve(t(C.PARENT_TME_ID), C.PARENT_TME_ID); });
            v[F.STRUCTURE] = get(() => {
                if (!srf || !srf.site) { return L.infra.resolve(t(C.STRUCTURE), C.STRUCTURE); }
                return L.infra.resolve(t(C.STRUCTURE), C.STRUCTURE, r => { return String(r.site) == String(srf.site); }, 'on the SRF site');
            });

            v[F.DESCRIPTION] = t(C.DESCRIPTION);
            v[F.MAKE] = t(C.MAKE);
            v[F.MODEL] = t(C.MODEL);
            v[F.LENGTH_MM] = int(C.LENGTH_MM);
            v[F.WIDTH_MM] = int(C.WIDTH_MM);
            v[F.DEPTH_MM] = int(C.HEIGHT_DEPTH_MM);
            v[F.HEIGHT_ON_TOWER] = num(C.HEIGHT_ON_TOWER);
            v[F.WEIGHT_KG] = num(C.WEIGHT_KG);
            v[F.AZIMUTH] = num(C.AZIMUTH);
            v[F.VOLTAGE_TYPE] = get(() => { return L.voltageType.resolve(t(C.VOLTAGE_TYPE), C.VOLTAGE_TYPE); });
            v[F.B_END] = t(C.B_END);
            v[F.CUSTOMER_REF] = t(C.CUSTOMER_REF);
            v[F.INVENTORY_FLAG] = get(() => { return L.inventoryFlag.resolve(t(C.INVENTORY_FLAG), C.INVENTORY_FLAG); });
            v[F.FEEDER_TYPE] = get(() => { return L.feederType.resolve(t(C.FEEDER_TYPE), C.FEEDER_TYPE); });
            v[F.GIE_LOCATION] = t(C.GIE_LOCATION);
            v[F.MODIFIED_ANTENNA_LOCATION] = get(() => { return L.antennaLocation.resolve(t(C.ANTENNA_LOCATION), C.ANTENNA_LOCATION); });

            if (get.errors.length > 0) { throw new dmCsv.RowError(get.errors.join('; ')); }
            fit(twcSrfItem, v, warnings);

            if (ctx.dryRun) {
                M.item.add(rid, { id: DRY_RUN_ID, radixid: rid, run: ctx.runName });
                return { result: Result.VALID, radixId: rid, nsRecordType: twcSrfItem.Type, message: message([], warnings) };
            }
            var id = create(twcSrfItem, v, rid, ctx);
            M.item.add(rid, { id: id, radixid: rid, run: ctx.runName });
            return { result: Result.CREATED, radixId: rid, nsRecordType: twcSrfItem.Type, nsId: id, message: message([], warnings) };
        }

        // ---------------------------------------------------------------------------------------------
        // step 'itemParents' (import only, SPEC Q21): ATME / FEEDER items => the TME item of the same SRF (TMI_ID_SRF)
        // ---------------------------------------------------------------------------------------------
        function processItemParent(row, ctx) {
            var M = ctx.maps;
            var C = C_ITEM;
            var rid = itemRadixId(row);
            if (!rid) { return { result: Result.SKIPPED, message: 'no SRF / Equipment ID' }; }
            var item = mine(M.item, rid, ctx, C.EQUIPMENT_ID);
            if (!item) { return { result: Result.SKIPPED, radixId: rid, message: 'SRF item not created by this run' }; }

            var eqRid = txt(row, C.EQUIPMENT_ID);
            var parentRid = txt(row, C.PARENT_TME_ID);
            if (dmCsv.key(txt(row, C.STEP_TYPE)) == 'tme' || !parentRid || dmCsv.key(parentRid) == dmCsv.key(eqRid)) {
                return { result: Result.SKIPPED, radixId: rid, nsRecordType: twcSrfItem.Type, nsId: item.id, message: 'TME or no parent TME' };
            }
            var parents = M.item.find(itemKey(txt(row, C.SRF), parentRid));
            if (parents.length == 0) { return { result: Result.SKIPPED, radixId: rid, nsRecordType: twcSrfItem.Type, nsId: item.id, message: `parent TME ${parentRid} is not an item of this SRF` }; }
            if (parents.length > 1) { throw new dmCsv.RowError(`${C.PARENT_TME_ID}: ${parents.length} SRF items for TME ${parentRid} on this SRF`); }

            update(twcSrfItem.Type, item.id, { [twcSrfItem.Fields.TMI_ID_SRF]: parents[0].id });
            return { result: Result.UPDATED, radixId: rid, nsRecordType: twcSrfItem.Type, nsId: item.id, message: `TME item ${parents[0].id} (equipment ${parentRid})` };
        }

        // ---------------------------------------------------------------------------------------------
        // step 'reviews'
        // ---------------------------------------------------------------------------------------------
        function reviewRadixId(row) {
            var srfRid = txt(row, C_REV.SRF);
            var iteration = txt(row, C_REV.ITERATION);
            return srfRid && iteration !== null ? `${srfRid}-${iteration}` : null;
        }

        function processReview(row, ctx) {
            var L = lists(ctx);
            var M = ctx.maps;
            var F = twcSrfReview.Fields;
            var C = C_REV;
            var srfRid = dmCsv.required(txt(row, C.SRF), C.SRF);
            var iteration = dmCsv.required(dmCsv.integer(row[C.ITERATION], C.ITERATION), C.ITERATION);
            var rid = `${srfRid}-${iteration}`;
            var dup = duplicate(M.review, rid, ctx, twcSrfReview.Type);
            if (dup) { return dup; }

            var get = dmCsv.collector();
            var warnings = [];
            var v = {};
            var t = (col) => { return txt(row, col); };
            var date = (col) => { return get(() => { return dmCsv.date(row[col], col); }); };
            var bool = (col) => { return get(() => { return dmCsv.bool(row[col], col); }); };
            var num = (col) => { return get(() => { return dmCsv.number(row[col], col); }); };

            var srf = get(() => { return resolveSrf(ctx, srfRid, C.SRF); });
            v[F.SRF] = srf ? srf.id : null;
            // @@NOTE: same naming as oTWC_srfWorkflowEngine.js (SPEC Q18)
            v[F.NAME] = srf && srf.name ? `R${srf.name}_${iteration}` : null;
            v[F.REVIEW_ITERATION] = iteration;
            v[F.SUBMISSION_DATE] = date(C.SUBMISSION_DATE);
            v[F.CUSTOMER_SUBMISSION_COMMENTS] = t(C.CUSTOMER_COMMENTS);
            v[F.TL_REVIEW_COMMENTS] = t(C.TL_COMMENTS);
            v[F.TL_REVIEW_RESULT] = get(() => { return L.reviewResult.resolve(t(C.TL_RESULT), C.TL_RESULT); });
            v[F.TL_REVIEW_COMPLETE] = date(C.TL_COMPLETE);

            v[F.STRUCTURAL_ANALYSIS_REQUIRED] = bool(C.SA_REQUIRED);
            v[F.SA_REQUESTED_PLANNED] = date(C.SA_REQ_PLANNED);
            v[F.SA_REQUESTED_ACTUAL] = date(C.SA_REQ_ACTUAL);
            v[F.SA_COMPLETE_PLANNED] = date(C.SA_COMP_PLANNED);
            v[F.SA_COMPLETE_ACTUAL] = date(C.SA_COMP_ACTUAL);
            v[F.SPACE_CHECK_PASSED] = bool(C.SPACE_PASSED);
            v[F.SPACE_CHECK_COMMENTS] = t(C.SPACE_COMMENTS);
            v[F.TL_SERVICES_REQUESTED] = bool(C.SVC_REQUESTED);
            v[F.SERVICES_REQUESTED_PLANNED] = date(C.SVC_REQ_PLANNED);
            v[F.SERVICES_REQUESTED_ACTUAL] = date(C.SVC_REQ_ACTUAL);
            v[F.SERVICES_COMPLETE_PLANNED] = date(C.SVC_COMP_PLANNED);
            v[F.SERVICES_COMPLETE_ACTUAL] = date(C.SVC_COMP_ACTUAL);
            v[F.FACILITIES_CHECK_PASSED] = bool(C.FAC_PASSED);
            v[F.FACILITIES_CHECK_COMMENTS] = t(C.FAC_COMMENTS);
            v[F.FULL_PLANNING_REQUIRED] = bool(C.FP_REQUIRED);
            v[F.FP_REQUESTED_PLANNED] = date(C.FP_REQ_PLANNED);
            v[F.FP_REQUESTED_ACTUAL] = date(C.FP_REQ_ACTUAL);
            v[F.FP_COMPLETE_PLANNED] = date(C.FP_COMP_PLANNED);
            v[F.FP_COMPLETE_ACTUAL] = date(C.FP_COMP_ACTUAL);
            v[F.ESTATES_CHECK_PASSED] = bool(C.EST_PASSED);
            v[F.ESTATES_CHECK_COMMENTS] = t(C.EST_COMMENTS);
            v[F.PRICING_REQUIRED] = bool(C.PRICING_REQUIRED);
            v[F.FEE_REDUCTION] = num(C.FEE_REDUCTION);
            v[F.FEE_UPLIFT] = num(C.FEE_UPLIFT);
            v[F.NEW_LICENCE_FEE] = num(C.NEW_FEE);
            v[F.FEE_CHANGE_BREAKDOWN] = txt0(row, C.FEE_BREAKDOWN);
            v[F.CUSTOMER_ACCOUNTS_CHECK_PASSED] = bool(C.ACC_PASSED);
            v[F.CUSTOMER_ACCOUNTS_CHECK_COMMENTS] = t(C.ACC_COMMENTS);

            if (get.errors.length > 0) { throw new dmCsv.RowError(get.errors.join('; ')); }
            fit(twcSrfReview, v, warnings);

            if (ctx.dryRun) {
                M.review.add(rid, { id: DRY_RUN_ID, radixid: rid, run: ctx.runName });
                return { result: Result.VALID, radixId: rid, nsRecordType: twcSrfReview.Type, message: message([], warnings) };
            }
            var id = create(twcSrfReview, v, rid, ctx);
            M.review.add(rid, { id: id, radixid: rid, run: ctx.runName });
            return { result: Result.CREATED, radixId: rid, nsRecordType: twcSrfReview.Type, nsId: id, message: message([], warnings) };
        }

        // ---------------------------------------------------------------------------------------------
        // step 'sds'
        // ---------------------------------------------------------------------------------------------
        function sdsRadixId(row) { return txt(row, C_SDS.RADIX_ID); }

        function conditionRefs(row) {
            return (txt(row, C_SDS.CONDITIONS) || '').split('|').map(c => { return c.trim(); }).filter(c => { return c; });
        }

        function processSds(row, ctx) {
            var L = lists(ctx);
            var M = ctx.maps;
            var F = twcSds.Fields;
            var C = C_SDS;
            var rid = dmCsv.required(sdsRadixId(row), C.RADIX_ID);
            var dup = duplicate(M.sds, rid, ctx, twcSds.Type);
            if (dup) { return dup; }

            var get = dmCsv.collector();
            var warnings = [];
            var v = {};
            var t = (col) => { return txt(row, col); };
            var bool = (col) => { return get(() => { return dmCsv.bool(row[col], col); }); };
            var num = (col) => { return get(() => { return dmCsv.number(row[col], col); }); };

            var srf = get(() => { return resolveSrf(ctx, dmCsv.required(t(C.SRF), C.SRF), C.SRF); });
            v[F.SRF] = srf ? srf.id : null;
            // @@NOTE: same naming as oTWC_sdsEngine.js (SPEC Q18)
            v[F.NAME] = srf && srf.name ? srf.name.replace('SRF', 'SDS') : null;

            var code = siteCode(t(C.SITE));
            v[F.SITE] = get(() => { return L.site.resolve(code, C.SITE); });
            if (v[F.SITE] && srf && srf.site && String(srf.site) != String(v[F.SITE])) { warnings.push(`${C.SITE}: ${code} is not the SRF site`); }
            v[F.CUSTOMER] = get(() => { return L.company.resolve(t(C.CUSTOMER), C.CUSTOMER); });
            v[F.STATUS] = get(() => {
                var status = dmCsv.required(t(C.STATUS), C.STATUS);
                return L.sdsStatus.resolve(SDS_STATUS_ALIAS[dmCsv.key(status)] || status, C.STATUS);
            });
            v[F.COMMENCMENT_DATE] = get(() => { return dmCsv.date(row[C.COMMENCEMENT_DATE], C.COMMENCEMENT_DATE); });
            v[F.DRAWING_REFERENCE] = txt0(row, C.DRAWING_REFERENCE);
            v[F.INCLUDE_LICENSE_MAP] = bool(C.INCLUDE_MAP);
            v[F.ADDITIONAL_SRF_CONIDITONS] = t(C.ADDITIONAL_CONDITIONS);
            v[F.POWER_SUPPLY_COMMENTS] = t(C.POWER_COMMENTS);
            v[F.FIBRE_RIGHTS] = bool(C.FIBRE_RIGHTS);
            v[F.FIBRE_DUCT_ROUTE_REFERENCE] = t(C.FIBRE_ROUTE_REF);
            v[F.FIBRE_PROVIDER] = get(() => { return L.fibreProvider.resolve(t(C.FIBRE_PROVIDER), C.FIBRE_PROVIDER); });
            v[F.FIBRE_OTHER_PROVIDER] = t(C.FIBRE_OTHER_PROVIDER);
            v[F.FIBRE_NOTES] = t(C.FIBRE_NOTES);
            v[F.PREVIOUS_LICENSE_FEE] = num(C.PREVIOUS_FEE);
            v[F.FEE_REDUCTION] = num(C.FEE_REDUCTION);
            v[F.FEE_UPLIFT] = num(C.FEE_UPLIFT);
            v[F.NEW_LICENSE_FEE] = num(C.NEW_FEE);
            v[F.FEE_CHARGE_BREAK_DOWN] = t(C.FEE_BREAKDOWN);

            // @@NOTE: SPEC Q7: agreement template through AGREEMENT_TEMPLATE_MAP, conditions by name; anything unmatched is left out with a warning
            var template = t(C.TEMPLATE);
            if (template) {
                var templateId = dmConfig.AGREEMENT_TEMPLATE_MAP[template];
                if (templateId) { v[F.AGREEMENT_TEMPLATE] = templateId; } else { warnings.push(`${C.TEMPLATE}: '${template}' not mapped (AGREEMENT_TEMPLATE_MAP), left empty`); }
            }
            var conditions = [];
            conditionRefs(row).forEach(ref => {
                var found = L.agreementCondition.find(ref);
                if (found.length == 1) { conditions.push(found[0].id); } else { warnings.push(`${C.CONDITIONS}: ${found.length == 0 ? 'no' : found.length} agreement condition(s) found for '${ref}', left out`); }
            });
            if (conditions.length > 0) { v[F.AGREEMENT_CONDITIONS] = conditions; }
            if (t(C.CONDITIONS_DATA)) { warnings.push(`${C.CONDITIONS_DATA}: not imported (keys are Radix condition ids, SPEC Q7)`); }

            if (get.errors.length > 0) { throw new dmCsv.RowError(get.errors.join('; ')); }
            fit(twcSds, v, warnings);

            if (ctx.dryRun) {
                M.sds.add(rid, { id: DRY_RUN_ID, radixid: rid, run: ctx.runName });
                return { result: Result.VALID, radixId: rid, nsRecordType: twcSds.Type, message: message([], warnings) };
            }
            var id = create(twcSds, v, rid, ctx);
            M.sds.add(rid, { id: id, radixid: rid, run: ctx.runName });
            return { result: Result.CREATED, radixId: rid, nsRecordType: twcSds.Type, nsId: id, message: message([], warnings) };
        }

        // @@NOTE: SPEC Q7 value list: {runName}_values.csv with every distinct agreement template / condition of the SDS file and whether it matched
        //         rebuilt from the whole file, so it is the same however many times the step restarted
        function finishSds(ctx) {
            var L = lists(ctx);
            var values = {};
            var add = (type, value, matched, nsId) => {
                var k = `${type}|${value}`;
                if (!values[k]) { values[k] = { type: type, value: value, rows: 0, matched: matched, nsId: nsId }; }
                values[k].rows++;
            };
            ctx.rows.forEach(r => {
                var template = txt(r, C_SDS.TEMPLATE);
                if (template) {
                    var templateId = dmConfig.AGREEMENT_TEMPLATE_MAP[template];
                    add('Agreement Template', template, templateId ? 'mapped' : 'not mapped', templateId || '');
                }
                conditionRefs(r).forEach(ref => {
                    var found = L.agreementCondition.find(ref);
                    add('Agreement Condition', ref, found.length == 1 ? 'found' : (found.length == 0 ? 'not found' : `${found.length} found`), found.map(f => { return f.id; }).join('|'));
                });
            });
            var lines = [dmCsv.toCsvLine(['type', 'radix value', 'rows', 'match', 'nexus id'])];
            Object.keys(values).sort().forEach(k => {
                var x = values[k];
                lines.push(dmCsv.toCsvLine([x.type, x.value, x.rows, x.matched, x.nsId]));
            });
            dmRuns.saveFile(ctx.state.folderId, `${ctx.runName}_values.csv`, lines.join('\r\n'));
        }

        // ---------------------------------------------------------------------------------------------
        // step 'actions'
        // ---------------------------------------------------------------------------------------------
        function eaRadixId(row) { return txt(row, C_EA.RADIX_ID); }

        function processAction(row, ctx) {
            var L = lists(ctx);
            var M = ctx.maps;
            var F = twcEqAction.Fields;
            var C = C_EA;
            nexusIdCheck(row, C.NEXUS_ID);
            var rid = dmCsv.required(eaRadixId(row), C.RADIX_ID);
            var dup = duplicate(M.ea, rid, ctx, twcEqAction.Type);
            if (dup) { return dup; }

            var get = dmCsv.collector();
            var warnings = [];
            var v = {};
            var t = (col) => { return txt(row, col); };

            // @@NOTE: the Radix ref is the name (SPEC Q10)
            v[F.NAME] = rid;
            var eqRid = t(C.EQUIPMENT);
            var srfRid = t(C.SRF);
            v[F.EA_EQUIPMENT] = get(() => { return L.equipment.resolve(dmCsv.required(eqRid, C.EQUIPMENT), C.EQUIPMENT); });
            v[F.EA_SRF] = get(() => { var srf = resolveSrf(ctx, dmCsv.required(srfRid, C.SRF), C.SRF); return srf ? srf.id : null; });
            var type = get(() => { return L.eaType.resolveRow(dmCsv.required(t(C.TYPE), C.TYPE), C.TYPE); });
            v[F.EA_TYPE] = type ? type.id : null;
            v[F.EA_STATUS] = get(() => { return L.eaStatus.resolve(dmCsv.required(t(C.STATUS), C.STATUS), C.STATUS); });

            // @@NOTE: EA SRF Item is empty in the Radix extract: the item is found from SRF + equipment
            if (srfRid && eqRid) {
                var items = M.item.find(itemKey(srfRid, eqRid));
                if (items.length == 1) {
                    v[F.EA_SRF_ITEM] = items[0].id;
                    var expected = EXPECTED_EA_TYPES[dmCsv.key(items[0].reqtype)];
                    if (type && expected && expected.indexOf(dmCsv.key(type.name)) < 0) { warnings.push(`${C.TYPE} '${type.name}' does not match the SRF item request type '${items[0].reqtype}'`); }
                } else {
                    warnings.push(`${items.length == 0 ? 'no' : items.length} SRF item(s) for SRF ${srfRid} / equipment ${eqRid}: ${C.SRF_ITEM} left empty`);
                }
            }
            // @@NOTE: EA SAF is set by the SAF import, Related EA by step actionLinks

            if (get.errors.length > 0) { throw new dmCsv.RowError(get.errors.join('; ')); }
            fit(twcEqAction, v, warnings);

            if (ctx.dryRun) {
                M.ea.add(rid, { id: DRY_RUN_ID, radixid: rid, run: ctx.runName, eatype: v[F.EA_TYPE] });
                return { result: Result.VALID, radixId: rid, nsRecordType: twcEqAction.Type, message: message([], warnings) };
            }
            var id = create(twcEqAction, v, rid, ctx);
            M.ea.add(rid, { id: id, radixid: rid, run: ctx.runName, eatype: v[F.EA_TYPE] });
            return { result: Result.CREATED, radixId: rid, nsRecordType: twcEqAction.Type, nsId: id, message: message([], warnings) };
        }

        // ---------------------------------------------------------------------------------------------
        // step 'actionLinks' (import only): Related EA, and the equipment Associated Equip Action (SPEC Q19)
        // ---------------------------------------------------------------------------------------------
        function processActionLink(row, ctx) {
            var L = lists(ctx);
            var M = ctx.maps;
            var C = C_EA;
            var rid = eaRadixId(row);
            if (!rid) { return { result: Result.SKIPPED, message: 'no EA ID' }; }
            var ea = mine(M.ea, rid, ctx, C.RADIX_ID);
            if (!ea) { return { result: Result.SKIPPED, radixId: rid, message: 'equipment action not created by this run' }; }

            var results = [];
            var relatedRid = txt(row, C.RELATED_EA);
            if (relatedRid) {
                var relatedId = M.ea.resolve(relatedRid, C.RELATED_EA);
                update(twcEqAction.Type, ea.id, { [twcEqAction.Fields.RELATED_EA]: relatedId });
                results.push({ result: Result.UPDATED, radixId: rid, nsRecordType: twcEqAction.Type, nsId: ea.id, message: `related EA ${relatedRid} = ${relatedId}` });
            }

            // @@NOTE: as oTWC_srfWorkflowEngine.js does for the equipment of an install: Associated Equip Action = its Licence EA, only when empty
            var eaType = Number(ea.eatype);
            if (eaType == twcUtils.EqActionType.Licence || eaType == twcUtils.EqActionType.SwapLicence) {
                var eqs = L.equipment.find(txt(row, C.EQUIPMENT));
                if (eqs.length == 1 && !eqs[0].assoc) {
                    update(twcEquipment.Type, eqs[0].id, { [twcEquipment.Fields.ASSOCIATED_EQUIP_ACTIONS]: ea.id });
                    eqs[0].assoc = ea.id;
                    results.push({ result: Result.UPDATED, radixId: rid, nsRecordType: twcEquipment.Type, nsId: eqs[0].id, message: `associated equip action = ${ea.id}` });
                }
            }

            if (results.length == 0) { return { result: Result.SKIPPED, radixId: rid, nsRecordType: twcEqAction.Type, nsId: ea.id, message: 'nothing to link' }; }
            return results;
        }

        // ---------------------------------------------------------------------------------------------
        // handler
        // ---------------------------------------------------------------------------------------------
        const SRF_MAP = (ctx) => { return srfMap(ctx, false); };
        const SRF_MAP_CHILD = (ctx) => { return srfMap(ctx, true); };
        const ITEM_MAP = (ctx) => { return itemMap(ctx, false); };
        const ITEM_MAP_CHILD = (ctx) => { return itemMap(ctx, true); };

        const EQ = twcEquipment.Fields;
        const EA = twcEqAction.Fields;

        return {
            type: 'SRF',
            label: 'SRF (SRF, items, reviews, SDS, equipment actions)',
            files: [
                { key: 'srf', label: 'SRF (sheet SAMPLE SRF)', required: true, requiredColumns: [C_SRF.RADIX_ID, C_SRF.SITE, C_SRF.CUSTOMER, C_SRF.STATUS] },
                { key: 'srf_items', label: 'SRF Items', required: false, requiredColumns: [C_ITEM.SRF, C_ITEM.EQUIPMENT_ID, C_ITEM.REQUEST_TYPE, C_ITEM.STEP_TYPE] },
                { key: 'srf_reviews', label: 'SRF Reviews', required: false, requiredColumns: [C_REV.SRF, C_REV.ITERATION] },
                { key: 'sds', label: 'SDS', required: false, requiredColumns: [C_SDS.RADIX_ID, C_SDS.SRF, C_SDS.STATUS] },
                // @@TODO: sds_items (SPEC §6.2.5) when the Radix extract is available
                { key: 'equip_actions', label: 'Equipment Actions', required: false, requiredColumns: [C_EA.RADIX_ID, C_EA.EQUIPMENT, C_EA.SRF, C_EA.TYPE, C_EA.STATUS] }
            ],
            steps: [
                { key: 'srf', file: 'srf', modes: [Mode.IMPORT, Mode.DRYRUN], radixId: srfRadixId, prepare: prepare({ srf: SRF_MAP }), process: processSrf },
                { key: 'items', file: 'srf_items', modes: [Mode.IMPORT, Mode.DRYRUN], radixId: itemRadixId, prepare: prepare({ srf: SRF_MAP_CHILD, item: ITEM_MAP }), process: processItem },
                { key: 'itemParents', file: 'srf_items', modes: [Mode.IMPORT], radixId: itemRadixId, prepare: prepare({ item: ITEM_MAP }), process: processItemParent },
                { key: 'reviews', file: 'srf_reviews', modes: [Mode.IMPORT, Mode.DRYRUN], radixId: reviewRadixId, prepare: prepare({ srf: SRF_MAP_CHILD, review: (ctx) => { return radixMap('SRF review', twcSrfReview); } }), process: processReview },
                { key: 'sds', file: 'sds', modes: [Mode.IMPORT, Mode.DRYRUN], radixId: sdsRadixId, prepare: prepare({ srf: SRF_MAP_CHILD, sds: (ctx) => { return radixMap('SDS', twcSds); } }), process: processSds, finish: finishSds },
                { key: 'actions', file: 'equip_actions', modes: [Mode.IMPORT, Mode.DRYRUN], radixId: eaRadixId, prepare: prepare({ srf: SRF_MAP_CHILD, item: ITEM_MAP_CHILD, ea: eaMap }), process: processAction },
                { key: 'actionLinks', file: 'equip_actions', modes: [Mode.IMPORT], radixId: eaRadixId, prepare: prepare({ ea: eaMap }), process: processActionLink }
            ],
            // @@NOTE: roll-back order: children first; the equipment (another run) only gets its Associated Equip Action cleared when it points to an EA of this run
            cleanup: [
                { recordType: twcEquipment.Type, clearOnly: true, clearFields: [EQ.ASSOCIATED_EQUIP_ACTIONS], where: `${EQ.ASSOCIATED_EQUIP_ACTIONS} in (select x.id from ${twcEqAction.Type} x where x.${EA.RADIX_IMPORT_RUN} = ?)` },
                { recordType: twcEqAction.Type, runField: EA.RADIX_IMPORT_RUN, clearFields: [EA.RELATED_EA] },
                { recordType: twcSds.Type, runField: twcSds.Fields.RADIX_IMPORT_RUN },
                { recordType: twcSrfReview.Type, runField: twcSrfReview.Fields.RADIX_IMPORT_RUN },
                { recordType: twcSrfItem.Type, runField: twcSrfItem.Fields.RADIX_IMPORT_RUN, clearFields: [twcSrfItem.Fields.TMI_ID_SRF] },
                { recordType: twcSrf.Type, runField: twcSrf.Fields.RADIX_IMPORT_RUN }
            ]
        }
    });
