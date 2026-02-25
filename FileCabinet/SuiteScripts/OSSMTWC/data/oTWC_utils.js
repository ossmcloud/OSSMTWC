/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (core, coreSQL) => {

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const SRF_ITEM_STEP_TYPE = {
            TME: 1,
            ATME: 2,
            GIE: 3
        }
        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const SRF_ITEM_REQUEST_TYPE = {
            INSTALL: 1,
            REMOVE: 2,
            SWAP: 3
        }
        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const SRF_STATUS = {
            Draft: 11,
            Submitted: 1,
            UnderReview: 2,
            FeedbackIssued: 3,
            Resubmitted: 4,
            SRFApproved: 5,
            LicenceRequested: 6,
            WorksPermitted: 7,
            LicenceIssued: 8,
            LicenceExecuted: 9,
            SRFCancelled: 10
        }



        function getNsTable(tableId) {
            if (tableId == -242 || tableId == 'bin') {
                return { pk: 'id', name: 'bin', nameField: 'binnumber', isInactive: '', alias: '' }
            } else if (tableId == -23 || tableId == 'case') {
                return { pk: 'id', name: 'case', nameField: 'casenumber', isInactive: '', alias: '' }
            } else if (tableId == -2 || tableId == 'customer') {
                return { pk: 'id', name: 'customer', nameField: 'companyname', isInactive: '', alias: 'cust' }
            } else if (tableId == -4 || tableId == 'employee') {
                return { pk: 'id', name: 'employee', nameField: 'entityid', isInactive: '', alias: 'emp' }
            } else if (tableId == -7 || tableId == 'job' || tableId == 'project') {
                return { pk: 'id', name: 'job', nameField: 'entityid', isInactive: '', alias: 'prj' }
            } else if (tableId == -3 || tableId == 'vendor') {
                return { pk: 'id', name: 'vendor', nameField: 'entityid', isInactive: '', alias: 'vend' }
            } else if (tableId == -6 || tableId == 'contact') {
                return { pk: 'id', name: 'contact', nameField: 'firstname', isInactive: '', alias: '' }
            } else if (tableId == -112 || tableId == 'account') {
                return { pk: 'id', name: 'account', nameField: 'fullname', isInactive: '', alias: '' }
            } else if (tableId == -10 || tableId == 'item') {
                return { pk: 'id', name: 'item', nameField: 'itemid', isInactive: '', alias: 'itm' }
            } else if (tableId == -101 || tableId == 'classification') {
                return { pk: 'id', name: 'classification', nameField: 'name', isInactive: '', alias: '' }
            } else if (tableId == -102 || tableId == 'department') {
                return { pk: 'id', name: 'department', nameField: 'name', isInactive: '', alias: '' }
            } else if (tableId == -104 || tableId == 'entitystatus') {
                return { pk: 'key', name: 'entitystatus', nameField: 'name', isInactive: 'inactive', alias: '' }
            } else if (tableId == -103 || tableId == 'location') {
                return { pk: 'id', name: 'location', nameField: 'name', isInactive: '', alias: '' }
            } else if (tableId == -117 || tableId == 'subsidiary') {
                return { pk: 'id', name: 'subsidiary', nameField: 'name', isInactive: '', alias: '' }
            } else if (tableId == -110 || tableId == 'vendorcategory') {
                return { pk: 'id', name: 'vendorcategory', nameField: 'name', isInactive: '', alias: '' }
            } else if (tableId == -105 || tableId == 'accountingperiod') {
                return { pk: 'id', name: 'accountingperiod', nameField: 'periodname', isInactive: '', alias: '' }
            } else if (tableId == -122 || tableId == 'currency') {
                return { pk: 'id', name: 'currency', nameField: 'symboows_viewl', isInactive: '', alias: '' }
            } else if (tableId == -30 || tableId == 'transaction') {
                return { pk: 'id', name: 'transaction', nameField: 'tranid', isInactive: false, alias: '' }
            } else if (tableId == -195 || tableId == 'state') {
                return { pk: 'id', name: 'state', nameField: 'fullname', isInactive: false, alias: '' }
            } else {
                return null;
            }
        }



        function getCustomTableFields(recordType) {
            var customFields = [];

            var whereClause = '';
            if (Array.isArray(recordType)) {
                whereClause = `c.scriptid in (${recordType.map(rt => { return `UPPER('${rt}')`; }).join(',') })`;
            } else {
                whereClause = `c.scriptid = UPPER('${recordType}')`;
            }

            coreSQL.each(`
                select      cf.fieldvaluetype as field_type, LOWER(cf.scriptid) as field_id, cf.name as field_label, 
                            NVL(lower(l.scriptid), cf.fieldvaluetyperecord) as field_foreign_table, c.includename as include_name, LOWER(c.scriptid) as table_name
                from        customfield cf
                join        customrecordtype c on c.internalid = cf.recordtype
                left join   customrecordtype l on l.internalid = cf.fieldvaluetyperecord
                where       ${whereClause}
                order by id
            `, cf => {
                var nsTableId = parseInt(cf.field_foreign_table);
                if (!isNaN(nsTableId)) {
                    // @@NOTE: this is a standard NS table
                    var nsTable = getNsTable(nsTableId);
                    if (nsTable) {
                        cf.field_foreign_table = nsTable.name;
                        cf.ns_table = nsTable;
                    } else {
                        cf.field_foreign_table = null;
                    }
                }
                customFields.push(cf);
            });

            if (!Array.isArray(recordType)) {
                // @@NOTE: if we have an array of recordType then it means we want to get fields for multiple tables
                //         in which case we cannot add the 'name' field just once
                // @@REVIEW: we could probably loop the recordType array and add a 'name' field for all the record types
                if (customFields.length == 0 || customFields[0].include_name == 'T') {
                    customFields.push({
                        field_type: 'Free-Form Text',
                        field_id: 'name',
                        field_label: 'name',
                        field_foreign_table: null,
                        include_name: 'T',
                        table_name: recordType
                    })
                }
            }

            return customFields;
        }

        function getLookUpTableValues(recordType, additionalFilters) {
            var idField = 'id'; var nameField = 'name'; var isInactive = "and isinactive = 'F'";
            if (!recordType.startsWith('customrecord')) {
                var nsTable = getNsTable(recordType);
                idField = nsTable.pk;
                nameField = nsTable.nameField;
                if (!nsTable.isInactive) { isInactive = ''; }
            }


            return coreSQL.run(`select ${idField} as value, ${nameField} as text from ${recordType} where 1 = 1 ${isInactive} ${additionalFilters || ''} order by ${nameField}`);

        }

        function getSiteNames() {
            return getLookUpTableValues('customrecord_twc_site');
        }

        function getSiteTypes() {
            return getLookUpTableValues('customrecord_twc_site_type');
        }

        function getSiteLevels() {
            return getLookUpTableValues('customrecord_twc_site_level');
        }

        function getCounties() {
            return getLookUpTableValues('state', "and country = 'IE'");
            //return coreSQL.run(`select id as value, fullname as text from state where country = 'IE' order by fullname`)
        }

        function getRegions() {
            return getLookUpTableValues('customrecord_twc_region');
        }

        function getPortfolios() {
            return getLookUpTableValues('customrecord_twc_site_portfolio');
        }


        
        //

        return {
            SrfStepType: SRF_ITEM_STEP_TYPE,
            SrfRequestType: SRF_ITEM_REQUEST_TYPE,
            SrfStatus: SRF_STATUS,

            ROOT_FILE_FOLDER: 'TWC Files',
            
            getFields: getCustomTableFields,

            getSiteNames: getSiteNames,
            getSiteTypes: getSiteTypes,
            getSiteLevels: getSiteLevels,
            getCounties: getCounties,
            getRegions: getRegions,
            getPortfolios: getPortfolios,
        }
    });
