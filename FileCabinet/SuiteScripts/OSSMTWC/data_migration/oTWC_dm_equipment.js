/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix data migration: Equipment import handler (SPEC_v1.1 §6.1)
//         step 'create'  : one customrecord_twc_equip per row (duplicates by Radix Id skipped), parent TME left empty
//         step 'parents' : (import only) sets the parent TME of the equipment created by this run, looked up by Radix Id among all Nexus equipment
define(['N/record', '../data/oTWC_equipment.js', './oTWC_dm_config.js', './oTWC_dm_csv.js', './oTWC_dm_lookups.js'],
    (record, twcEquipment, dmConfig, dmCsv, dmLookups) => {

        const F = twcEquipment.Fields;
        const Result = dmConfig.Result;
        const Mode = dmConfig.Mode;

        // @@NOTE: source columns (sheet 'SAMPLE EQUIP')
        const COL = {
            EQUIPMENT_ID: 'Equipment ID',
            PARENT_TME_ID: 'Parent TME ID',
            NEXUS_ID: 'ID',
            CUSTOMER: 'Customer',
            SITE: 'Site',
            INFRASTRUCTURE: 'Infrastructure',
            EQUIPMENT_CLASS: 'Equipment Class',
            EQUIPMENT_TYPE: 'Equipment Type',
            INSTALL_STATUS: 'Equipment Install Status',
            LICENCE_STATUS: 'Equipment Licence Status',
            LOCATION_NOTES: 'Location Notes',
            DESCRIPTION: 'Description',
            MAKE: 'Make',
            MODEL: 'Model',
            LENGTH_MM: 'Length (mm)',
            WIDTH_MM: 'Width (mm)',
            HEIGHT_DEPTH_MM: 'Height/Depth (mm)',
            WEIGHT_KG: 'Weight (kg)',
            HEIGHT_ON_TOWER: 'Height on Tower (m)',
            AZIMUTH: 'Azimuth',
            B_END: 'B-End',
            CUSTOMER_REF: 'Customer Ref',
            INVENTORY_FLAG: 'Inventory Flag',
            VOLTAGE_TYPE: 'Voltage Type',
            OPT_TYPE: 'Opt Type',
            USE_LIBRARY: 'Use Library',
            LIBRARY_ENTRY: 'Equipment Library Entry',
            ACTIVE_PASSIVE: 'Active/Passive',
            WIND_FRONT: 'Wind Loading (N/m2) Front',
            WIND_SIDE: 'Wind Loading N/m2 Side',
            WIND_REAR: 'Wind Loading N/m2 Rear',
            WIND_MAX: 'Wind Loading N/m2 Max',
            WIND_REGIME: 'Wind Regime',
            CUSTOMER_NOTE: 'Customer Note',
            TO_BE_BILLED: 'To Be Billed',
            LICENCED_DATE: 'Licenced Date',
            INSTALLED_DATE: 'Installed Date',
            REMOVED_DATE: 'Removed Date',
            PACKAGE: 'Package'
        }

        const REQUIRED_COLUMNS = [COL.EQUIPMENT_ID, COL.PARENT_TME_ID, COL.CUSTOMER, COL.SITE, COL.EQUIPMENT_CLASS, COL.INFRASTRUCTURE, COL.INSTALL_STATUS, COL.LICENCE_STATUS];

        // @@NOTE: Issue 299 retired licence statuses are mapped to the status kept until the licence is executed (SPEC §6.1)
        const RETIRED_LICENCE_STATUS = /^prop to (licence|unlicence) ?- ?licence (requested|issued|signed)$/;

        function radixId(row) { return dmCsv.text(row[COL.EQUIPMENT_ID]); }

        // @@NOTE: lookup maps, loaded once per execution by the steps' prepare (shared by both steps through ctx.cache)
        function lookups(ctx) {
            if (ctx.cache.equipment) { return ctx.cache.equipment; }
            var L = {
                company: dmLookups.byName('company', 'customrecord_twc_company'),
                site: dmLookups.byName('site', 'customrecord_twc_site', { code: 'custrecord_twc_site_id' }, 'code'),
                infra: dmLookups.byName('infrastructure', 'customrecord_twc_infra', { site: 'custrecord_twc_infra_site' }),
                eqClass: dmLookups.byName('equipment class', 'customrecord_twc_eq_class'),
                eqType: dmLookups.byName('equipment type', 'customrecord_twc_eq_type', { eqclass: 'custrecord_twc_eq_type_class' }),
                installStatus: dmLookups.byName('install status', 'customrecord_twc_equip_install_status'),
                licenceStatus: dmLookups.byName('licence status', 'customrecord_twc_equip_licence_status'),
                antennaLocation: dmLookups.byName('antenna location', 'customrecord_twc_srf_itm_loc_type'),
                inventoryFlag: dmLookups.byName('inventory flag', 'customrecord_twc_srf_itm_inv_flag'),
                voltageType: dmLookups.byName('voltage type', 'customrecord_twc_equip_voltage_type'),
                feederType: dmLookups.byName('feeder type', 'customrecord_twc_srf_itm_typ_opt'),
                useLibrary: dmLookups.byName('use library value', 'customrecord_twc_equip_use_lib'),
                libraryEntry: dmLookups.byName('equipment library entry', 'customrecord_twc_eq_lib'),
                activePassive: dmLookups.byName('active/passive value', 'customrecord_twc_active_passive'),
                windRegime: dmLookups.byName('wind regime', 'customlist_twc_equip_wind_regime'),
                package: dmLookups.byName('package value', 'customrecord_twc_package'),
                // @@NOTE: all Nexus equipment with a Radix Id: duplicate check + parent TME lookup
                equipment: new dmLookups.LookupMap('equipment', dmLookups.runAll(`
                    select  id, ${F.RADIX_EQUIPMENT_TABLE_ROW} as radixid, ${F.RADIX_IMPORT_RUN} as run
                    from    ${twcEquipment.Type}
                    where   ${F.RADIX_EQUIPMENT_TABLE_ROW} is not null
                `), 'radixid')
            };
            ctx.cache.equipment = L;
            return L;
        }

        // @@NOTE: Radix ids of the whole file (dry run: a parent TME may be further down the file)
        function fileRadixIds(ctx) {
            if (!ctx.cache.equipmentFileIds) {
                ctx.cache.equipmentFileIds = {};
                ctx.rows.forEach(r => { var id = radixId(r); if (id) { ctx.cache.equipmentFileIds[dmCsv.key(id)] = true; } });
            }
            return ctx.cache.equipmentFileIds;
        }

        // @@NOTE: runs a converter / lookup collecting its RowError so all the errors of a row are reported together
        function collector() {
            var errors = [];
            var get = (fn) => {
                try { return fn(); } catch (error) {
                    if (error instanceof dmCsv.RowError) { errors.push(error.message); return null; }
                    throw error;
                }
            };
            get.errors = errors;
            return get;
        }

        function required(value, column) {
            if (value === null) { throw new dmCsv.RowError(`${column}: missing value`); }
            return value;
        }

        // ---------------------------------------------------------------------------------------------
        // step 'create'
        // ---------------------------------------------------------------------------------------------
        function processCreate(row, ctx) {
            var L = lookups(ctx);
            var rid = required(radixId(row), COL.EQUIPMENT_ID);

            var nexusId = dmCsv.text(row[COL.NEXUS_ID]);
            if (nexusId) { throw new dmCsv.RowError(`${COL.NEXUS_ID}: row already linked to Nexus record ${nexusId}`); }

            var existing = L.equipment.find(rid);
            if (existing.length > 0) {
                var message = existing[0].run == ctx.runName ? 'duplicate Equipment ID in the file (or already created by this run before a restart)' : `already in Nexus${existing[0].run ? ' (run ' + existing[0].run + ')' : ''}`;
                return { result: Result.SKIPPED_DUPLICATE, radixId: rid, nsRecordType: twcEquipment.Type, nsId: existing.map(e => { return e.id; }).join('|'), message: message };
            }

            var get = collector();
            var notes = [];
            var v = {};
            var t = (col) => { return dmCsv.text(row[col]); };

            v[F.CUSTOMER] = get(() => { return L.company.resolve(required(t(COL.CUSTOMER), COL.CUSTOMER), COL.CUSTOMER); });

            // @@NOTE: 'TKY1017 : Derryquin' => site code TKY1017
            var siteCode = (t(COL.SITE) || '').split(':')[0].trim() || null;
            v[F.SITE] = get(() => { return L.site.resolve(required(siteCode, COL.SITE), COL.SITE); });
            v[F.INFRASTRUCTURE] = get(() => {
                if (!v[F.SITE]) { return L.infra.resolve(t(COL.INFRASTRUCTURE), COL.INFRASTRUCTURE); }
                return L.infra.resolve(t(COL.INFRASTRUCTURE), COL.INFRASTRUCTURE, r => { return String(r.site) == String(v[F.SITE]); }, `on site ${siteCode}`);
            });

            var className = t(COL.EQUIPMENT_CLASS);
            v[F.EQUIPMENT_CLASS] = get(() => { return L.eqClass.resolve(required(className, COL.EQUIPMENT_CLASS), COL.EQUIPMENT_CLASS); });
            v[F.EQUIPMENT_TYPE] = get(() => {
                if (!v[F.EQUIPMENT_CLASS]) { return L.eqType.resolve(t(COL.EQUIPMENT_TYPE), COL.EQUIPMENT_TYPE); }
                return L.eqType.resolve(t(COL.EQUIPMENT_TYPE), COL.EQUIPMENT_TYPE, r => { return String(r.eqclass) == String(v[F.EQUIPMENT_CLASS]); }, `for class ${className}`);
            });

            v[F.EQUIPMENT_INSTALL_STATUS] = get(() => { return L.installStatus.resolve(t(COL.INSTALL_STATUS), COL.INSTALL_STATUS); });
            v[F.EQUIPMENT_LICENCE_STATUS] = get(() => {
                var status = t(COL.LICENCE_STATUS);
                var retired = status ? RETIRED_LICENCE_STATUS.exec(dmCsv.key(status)) : null;
                if (retired) {
                    var mapped = retired[1] == 'licence' ? 'Prop to Licence' : 'Prop to Unlicence';
                    notes.push(`licence status '${status}' mapped to '${mapped}'`);
                    status = mapped;
                }
                return L.licenceStatus.resolve(status, COL.LICENCE_STATUS);
            });

            // @@NOTE: location notes: GIE => GIE location (free text), all other classes => antenna location (list) (SPEC Q6)
            if (dmCsv.key(className) == 'gie') {
                v[F.GIE_LOCATION] = t(COL.LOCATION_NOTES);
            } else {
                v[F.MODIFIED_ANTENNA_LOCATION] = get(() => { return L.antennaLocation.resolve(t(COL.LOCATION_NOTES), COL.LOCATION_NOTES); });
            }

            v[F.DESCRIPTION] = t(COL.DESCRIPTION);
            v[F.MAKE] = t(COL.MAKE);
            v[F.MODEL] = t(COL.MODEL);
            v[F.B_END] = t(COL.B_END);
            v[F.CUSTOMER_REF] = t(COL.CUSTOMER_REF);
            v[F.CUSTOMER_NOTE] = t(COL.CUSTOMER_NOTE);

            v[F.LENGTH_MM] = get(() => { return dmCsv.integer(row[COL.LENGTH_MM], COL.LENGTH_MM); });
            v[F.WIDTH_MM] = get(() => { return dmCsv.integer(row[COL.WIDTH_MM], COL.WIDTH_MM); });
            v[F.HEIGHTDEPTH_MM] = get(() => { return dmCsv.integer(row[COL.HEIGHT_DEPTH_MM], COL.HEIGHT_DEPTH_MM); });
            v[F.WEIGHT_KG] = get(() => { return dmCsv.number(row[COL.WEIGHT_KG], COL.WEIGHT_KG); });
            v[F.HEIGHT_ON_TOWER_M] = get(() => { return dmCsv.number(row[COL.HEIGHT_ON_TOWER], COL.HEIGHT_ON_TOWER); });
            // @@NOTE: decimal field (Radix has values like 338.9)
            v[F.AZIMUTH] = get(() => { return dmCsv.number(row[COL.AZIMUTH], COL.AZIMUTH); });
            v[F.WIND_LOADING_NM2_FRONT] = get(() => { return dmCsv.integer(row[COL.WIND_FRONT], COL.WIND_FRONT); });
            v[F.WIND_LOADING_NM2_SIDE] = get(() => { return dmCsv.integer(row[COL.WIND_SIDE], COL.WIND_SIDE); });
            v[F.WIND_LOADING_NM2_REAR] = get(() => { return dmCsv.integer(row[COL.WIND_REAR], COL.WIND_REAR); });
            v[F.WIND_LOADING_NM2_MAX] = get(() => { return dmCsv.integer(row[COL.WIND_MAX], COL.WIND_MAX); });

            v[F.INVENTORY_FLAG] = get(() => { return L.inventoryFlag.resolve(t(COL.INVENTORY_FLAG), COL.INVENTORY_FLAG); });
            v[F.VOLTAGE_TYPE] = get(() => { return L.voltageType.resolve(t(COL.VOLTAGE_TYPE), COL.VOLTAGE_TYPE); });
            v[F.FEEDER_TYPE] = get(() => { return L.feederType.resolve(t(COL.OPT_TYPE), COL.OPT_TYPE); });
            v[F.USE_LIBRARY] = get(() => { return L.useLibrary.resolve(t(COL.USE_LIBRARY), COL.USE_LIBRARY); });
            v[F.EQUIPMENT_LIBRARY_ENTRY] = get(() => { return L.libraryEntry.resolve(t(COL.LIBRARY_ENTRY), COL.LIBRARY_ENTRY); });
            v[F.ACTIVEPASSIVE] = get(() => { return L.activePassive.resolve(t(COL.ACTIVE_PASSIVE), COL.ACTIVE_PASSIVE); });
            v[F.WIND_REGIME] = get(() => { return L.windRegime.resolve(t(COL.WIND_REGIME), COL.WIND_REGIME); });
            v[F.PACKAGE] = get(() => { return L.package.resolve(t(COL.PACKAGE), COL.PACKAGE); });
            v[F.TO_BE_BILLED] = get(() => { return dmCsv.bool(row[COL.TO_BE_BILLED], COL.TO_BE_BILLED); });

            v[F.LICENCE_COMMENCEMENT_DATE] = get(() => { return dmCsv.date(row[COL.LICENCED_DATE], COL.LICENCED_DATE); });
            v[F.INSTALLED_DATE] = get(() => { return dmCsv.date(row[COL.INSTALLED_DATE], COL.INSTALLED_DATE); });
            v[F.REMOVED_DATE] = get(() => { return dmCsv.date(row[COL.REMOVED_DATE], COL.REMOVED_DATE); });

            // @@NOTE: the parent TME is set by step 'parents'; the dry run checks here that it can be found (file or Nexus)
            var parentRid = t(COL.PARENT_TME_ID);
            if (ctx.dryRun && parentRid && dmCsv.key(parentRid) != dmCsv.key(rid)) {
                get(() => {
                    if (fileRadixIds(ctx)[dmCsv.key(parentRid)]) { return null; }
                    return L.equipment.resolve(parentRid, COL.PARENT_TME_ID);
                });
            }

            if (get.errors.length > 0) { throw new dmCsv.RowError(get.errors.join('; ')); }

            if (ctx.dryRun) {
                // @@NOTE: registered so a duplicate Equipment ID further down the file is reported
                L.equipment.add(rid, { id: '(dry run)', radixid: rid, run: ctx.runName });
                return { result: Result.VALID, radixId: rid, nsRecordType: twcEquipment.Type, message: notes.join('; ') };
            }

            var rec = record.create({ type: twcEquipment.Type });
            for (var fieldId in v) {
                if (v[fieldId] === null || v[fieldId] === undefined) { continue; }
                rec.setValue({ fieldId: fieldId, value: v[fieldId] });
            }
            rec.setValue({ fieldId: F.RADIX_EQUIPMENT_TABLE_ROW, value: rid });
            rec.setValue({ fieldId: F.RADIX_MIGRATED, value: true });
            rec.setValue({ fieldId: F.RADIX_IMPORT_RUN, value: ctx.runName });
            var id = rec.save({ enableSourcing: false, ignoreMandatoryFields: true });

            L.equipment.add(rid, { id: id, radixid: rid, run: ctx.runName });
            return { result: Result.CREATED, radixId: rid, nsRecordType: twcEquipment.Type, nsId: id, message: notes.join('; ') };
        }

        // ---------------------------------------------------------------------------------------------
        // step 'parents' (import only): only equipment created by this run is linked, so a re-run never touches existing equipment
        // ---------------------------------------------------------------------------------------------
        function processParent(row, ctx) {
            var L = lookups(ctx);
            var rid = radixId(row);
            if (!rid) { return { result: Result.SKIPPED, message: 'no Equipment ID' }; }

            var mine = L.equipment.find(rid).filter(e => { return e.run == ctx.runName; });
            if (mine.length == 0) { return { result: Result.SKIPPED, radixId: rid, message: 'equipment not created by this run' }; }
            if (mine.length > 1) { throw new dmCsv.RowError(`${COL.EQUIPMENT_ID}: ${mine.length} equipment records created by this run for '${rid}'`); }

            var parentRid = dmCsv.text(row[COL.PARENT_TME_ID]);
            if (!parentRid) { return { result: Result.SKIPPED, radixId: rid, nsRecordType: twcEquipment.Type, nsId: mine[0].id, message: 'no parent TME' }; }

            var parentId = L.equipment.resolve(parentRid, COL.PARENT_TME_ID);
            record.submitFields({
                type: twcEquipment.Type,
                id: mine[0].id,
                values: { [F.PARENT_TME_ID]: parentId },
                options: { enableSourcing: false, ignoreMandatoryFields: true }
            });
            return { result: Result.UPDATED, radixId: rid, nsRecordType: twcEquipment.Type, nsId: mine[0].id, message: `parent TME ${parentRid} = ${parentId}` };
        }

        return {
            type: 'Equipment',
            label: 'Equipment',
            files: [
                { key: 'equipment', label: 'Equipment (sheet SAMPLE EQUIP)', required: true, requiredColumns: REQUIRED_COLUMNS }
            ],
            steps: [
                { key: 'create', file: 'equipment', modes: [Mode.IMPORT, Mode.DRYRUN], radixId: radixId, prepare: lookups, process: processCreate },
                { key: 'parents', file: 'equipment', modes: [Mode.IMPORT], radixId: radixId, prepare: lookups, process: processParent }
            ],
            cleanup: [
                { recordType: twcEquipment.Type, runField: F.RADIX_IMPORT_RUN, clearFields: [F.PARENT_TME_ID, F.TME_GROUP] }
            ]
        }
    });
