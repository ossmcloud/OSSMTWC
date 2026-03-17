/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_profile.js', './oTWC_safCrew.js', './oTWC_file.js', './oTWC_icons.js'],
    (core, cored, coreSQL, twcProfile, twcSafCrew, twcFile, twcIcons) => {

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const SAF_TYPE = {
            SURVEY_DRONE: 5
        }

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const INFRA_TYPE = {
            Accommodation: 1,
            Structure: 2,
            Fibre: 3,
            Generator: 4
        }

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const NO_ACTIVE_EXPIRED = {
            No: 1,
            Active: 2,
            Expired: 3
        }
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
        // @@TODO: these could be on the status table since we have one
        const SRF_STATUS_STYLE = {
            Draft: { color: 'white', backgroundColor: 'silver' },
            Submitted: { color: 'white', backgroundColor: 'olive' },
            UnderReview: { color: 'white', backgroundColor: 'orange' },
            FeedbackIssued: { color: 'white', backgroundColor: 'magenta' },
            Resubmitted: { color: 'white', backgroundColor: 'olive' },
            SRFApproved: { color: 'white', backgroundColor: 'lime' },
            LicenceRequested: { color: 'white', backgroundColor: 'lightblue' },
            WorksPermitted: { color: 'white', backgroundColor: 'mediumblue' },
            LicenceIssued: { color: 'white', backgroundColor: 'blue' },
            LicenceExecuted: { color: 'white', backgroundColor: 'green' },
            SRFCancelled: { color: 'white', backgroundColor: 'red' }
        }
        function getSrfStatusName(srfStatusNumber) {
            if (!srfStatusNumber) { srfStatusNumber = 11; }
            for (var k in SRF_STATUS) {
                if (SRF_STATUS[k] == srfStatusNumber) { return k; }
            }
        }
        function getSrfStatusStyle(srfStatusNumber) {
            if (!srfStatusNumber) { srfStatusNumber = 11; }
            if (isNaN(parseInt(srfStatusNumber))) {
                return SRF_STATUS_STYLE[srfStatusNumber];
            } else {
                return SRF_STATUS_STYLE[getSrfStatusName(srfStatusNumber)];
            }
        }
        function getSrfStatusHtml(srfStatusNumber, spanClass) {
            if (!srfStatusNumber) { srfStatusNumber = 11; }
            var statusName = getSrfStatusName(srfStatusNumber);
            if (isNaN(parseInt(srfStatusNumber))) {
                statusName = srfStatusNumber;
            }
            var statusStyle = getSrfStatusStyle(statusName);
            return `
                <span class="${spanClass ? spanClass : 'twc-record-status'}" style="color: ${statusStyle.color}; background-color: ${statusStyle.backgroundColor};" >
                    ${statusName}
                </span>
            `
        }


        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const SAF_STATUS = {
            Pending: 1,
            Approved: 2,
            Rejected: 3,
            PartiallyComplete: 4,
            Complete: 5,
            Cancelled: 6,
            AwaitingPhotos: 7,
            PhotosReceived: 8
        }
        // @@TOD: these could be on the status table since we have one
        const SAF_STATUS_STYLE = {
            Pending: { color: 'white', backgroundColor: 'olive' },
            Approved: { color: 'white', backgroundColor: 'limegreen' },
            Rejected: { color: 'white', backgroundColor: 'red' },
            PartiallyComplete: { color: 'white', backgroundColor: 'yellow' },
            Complete: { color: 'white', backgroundColor: 'green' },
            Cancelled: { color: 'white', backgroundColor: 'silver' },
            AwaitingPhotos: { color: 'white', backgroundColor: 'orange' },
            PhotosReceived: { color: 'white', backgroundColor: 'lime' },
        }
        function getSafStatusName(safStatusNumber, asObject) {
            if (!safStatusNumber) { safStatusNumber = 1; }
            for (var k in SAF_STATUS) {
                if (SAF_STATUS[k] == safStatusNumber) {
                    if (asObject) {
                        return { value: safStatusNumber, text: k }
                    }
                    return k;
                }
            }
        }
        function getSafStatusStyle(safStatusNumber) {
            if (!safStatusNumber) { safStatusNumber = 1; }
            if (isNaN(parseInt(safStatusNumber))) {
                return SAF_STATUS_STYLE[safStatusNumber];
            } else {
                return SAF_STATUS_STYLE[getSafStatusName(safStatusNumber)];
            }
        }
        function getSafStatusHtml(safStatusNumber, spanClass) {
            if (!safStatusNumber) { safStatusNumber = 1; }
            var statusName = getSafStatusName(safStatusNumber);
            if (isNaN(parseInt(safStatusNumber))) { statusName = safStatusNumber; }
            var statusStyle = getSafStatusStyle(statusName);
            return `
                <span class="${spanClass ? spanClass : 'twc-record-status'}" style="color: ${statusStyle.color}; background-color: ${statusStyle.backgroundColor};" >
                    ${statusName}
                </span>
            `
        }


        const SAF_TIME_BLOCKS = 'customrecord_twc_tm_blk_opt';

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const SAF_TIME_BLOCK = {
            A_8_TO_10: 1,
            B_10_TO_12: 2,
            C_12_TO_15: 3,
            D_15_TO_18: 4,
        }
        function getTimeBlockTimeRange(timeBlockId) {
            var range = { start: '', end: '' };
            if (timeBlockId == SAF_TIME_BLOCK.A_8_TO_10) {
                range.start = '08:00';
                range.end = '10:00';
            } else if (timeBlockId == SAF_TIME_BLOCK.B_10_TO_12) {
                range.start = '10:00';
                range.end = '12:00';
            } else if (timeBlockId == SAF_TIME_BLOCK.C_12_TO_15) {
                range.start = '12:00';
                range.end = '15:00';
            } else if (timeBlockId == SAF_TIME_BLOCK.D_15_TO_18) {
                range.start = '15:00';
                range.end = '18:00';
            }
            return range;
        }


        function getYesNoOptions() {
            return [{ value: 'T', text: 'Yes' }, { value: 'F', text: 'No' }]
        };

        function getNsTable(tableId) {
            if (tableId == -242 || tableId == 'bin') {
                return { pk: 'id', name: 'bin', nameField: 'binnumber', isInactive: '', alias: '' }
            } else if (tableId == -23 || tableId == 'case') {
                return { pk: 'id', name: 'case', nameField: 'casenumber', isInactive: '', alias: '' }
            } else if (tableId == -2 || tableId == 'customer') {
                return { pk: 'id', name: 'customer', nameField: 'companyname', isInactive: '', alias: 'cust' }
            } else if (tableId == -3 || tableId == 'vendor') {
                return { pk: 'id', name: 'vendor', nameField: 'companyname', isInactive: '', alias: 'vend' }
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
                whereClause = `c.scriptid in (${recordType.map(rt => { return `UPPER('${rt}')`; }).join(',')})`;
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
        }

        function getRegions() {
            return getLookUpTableValues('customrecord_twc_region');
        }

        function getPortfolios() {
            return getLookUpTableValues('customrecord_twc_site_portfolio');
        }

        function getSafStatus() {
            return getLookUpTableValues('customrecord_twc_saf_status');
        }

        function getSafTypes(options) {

            var allowedTypes = null;
            if (options?.siteId) {
                allowedTypes = coreSQL.first(`
                    select  st.custrecord_twc_infra_saf_sts_types as types
                    from    customrecord_twc_site s
                    join    customrecord_twc_infra_saf_sts st on st.id = s.custrecord_twc_site_saf_status
                    where   s.id = ${options.siteId}
                `);
                if (allowedTypes) {

                    if (allowedTypes.types) {
                        allowedTypes = allowedTypes.types.split(',').map(i => { return parseInt(i.trim()); })
                    } else {
                        allowedTypes = [];
                    }
                }
            }

            var safTypes = [];
            coreSQL.each(`select id as value, name as text from customrecord_twc_saf_type where isinactive='F' order by custrecord_twc_saf_type_sort`, t => {
                if (allowedTypes) {
                    if (allowedTypes.indexOf(t.value) < 0) { return; }
                }
                safTypes.push(t);
            });


            return safTypes;

        }

        function getSafCrew(options) {
            return coreSQL.run(`
                select  ${twcSafCrew.Fields.MEMBER}, BUILTIN.DF(${twcSafCrew.Fields.MEMBER}) as ${twcSafCrew.Fields.MEMBER}_name, ${twcSafCrew.Fields.ATTEND_AS}, 
                        BUILTIN.DF(p.${twcProfile.Fields.COMPANY}) as contractor
                from    ${twcSafCrew.Type} c
                join    ${twcProfile.Type} p on p.id = c.${twcSafCrew.Fields.MEMBER}
                where   ${twcSafCrew.Fields.SAF} = ${options.id}
            `)
        }

        function getSafImages(options) {
            return getSafFiles(options, 'image')
        }

        function getSafFiles(options, type) {
            var fileTypeFilter = '';
            if (type == 'image') {
                fileTypeFilter = `AND t.custrecord_twc_file_type_image = 'T'`;
            } else if (type == 'contractor') {
                fileTypeFilter = `AND (t.custrecord_twc_file_type_hs = 'T' OR t.custrecord_twc_file_type_method = 'T')`;
            }

            var sql = `
                select  ${twcFile.Fields.FILE} as file_id, TO_CHAR(f.created, 'dd/MM/yyyy HH:mi') as created, f.name, BUILTIN.DF(${twcFile.Fields.R_TYPE}) as ${twcFile.Fields.R_TYPE}_name,
                        ${twcFile.Fields.DESCRIPTION}
                from    ${twcFile.Type} f
                join    customrecord_twc_file_type t on t.id = f.${twcFile.Fields.R_TYPE}
                where   ${twcFile.Fields.RECORD_TYPE} = 'customrecord_twc_saf'
                and     ${twcFile.Fields.RECORD_ID} = ${options.id}
                ${fileTypeFilter}
                order by f.name
            `

            var files = [];
            coreSQL.each(sql, f => {
                f.preview_link = `<div style="text-align: center;"><span class="twc-clickable saf-file" data-file="${f.file_id}" style="width: 100%;">${twcIcons.get('download', 16)}</span></div>`;
                files.push(f)
            })
            //throw new Error(JSON.stringify(files))
            return files;
        }

        function getSafContractorFiles(options) {
            var fileIds = options['custrecord_twc_saf_method_statement'];
            if (fileIds && options['custrecord_twc_saf_health_safety']) { fileIds += ',' }
            fileIds += options['custrecord_twc_saf_health_safety'];

            var sql = `
                select  ${twcFile.Fields.FILE} as file_id, TO_CHAR(f.created, 'dd/MM/yyyy HH:mi') as created, f.name, BUILTIN.DF(${twcFile.Fields.R_TYPE}) as ${twcFile.Fields.R_TYPE}_name,
                        ${twcFile.Fields.DESCRIPTION}
                from    ${twcFile.Type} f
                join    customrecord_twc_file_type t on t.id = f.${twcFile.Fields.R_TYPE}
                where   f.id in (${fileIds})
                order by BUILTIN.DF(${twcFile.Fields.R_TYPE}), f.name
            `

            var files = [];
            coreSQL.each(sql, f => {
                f.preview_link = `<div style="text-align: center;"><span class="twc-clickable saf-file" data-file="${f.file_id}" style="width: 100%;">${twcIcons.get('download', 16)}</span></div>`;
                files.push(f)
            })
            //throw new Error(JSON.stringify(files))
            return files;
        }


        function getCompanies(options) {
            //
            // @@TODO: SAF: what are the insurance filters we need?
            var additionalFilters = `
                and c.custrecord_twc_co_el_expiry > CURRENT_DATE
                and c.custrecord_twc_co_pl_expiry > CURRENT_DATE
                and c.custrecord_twc_co_pi_expiry > CURRENT_DATE
            `

            if (options.isCustomer) {
                options.customer = options.companyProfile.id;
            } else if (options.isVendor) {
                options.vendor = options.companyProfile.id;
            } else {
                additionalFilters = '';
            }

            if (options.type == 'V') {
                // @@TODO: SAF: Accredited Contractor Expiry date seems null for all
                // additionalFilters += `
                //     and 	custrecord_twc_co_accred_appr <= CURRENT_DATE
                //     and     custrecord_twc_co_accred_cont_exp > CURRENT_DATE
                // `;
            }

            var sql = '';
            if (options.vendor) {
                if (options.type == 'C') {
                    // @@NOTE: here we want to select customers the given vendor can work on behalf of
                    sql = `
                        select  distinct c.id as value, c.name as text
                        from    customrecord_twc_acl acl
                        join    customrecord_twc_company c on c.id = acl.custrecord_twc_acl_cust and c.custrecord_twc_co_fin_cust = 'T'
                        where   c.isinactive = 'F'
                        and     acl.custrecord_twc_acl_cont = ${options.vendor}
                        ${additionalFilters}
                        order by c.name
                    `
                } else {
                    // @@NOTE: here we want to select sub-contractors the given vendor can use
                    sql = `
                        select  c.id as value, c.name as text
                        from    customrecord_twc_company c
                        where   c.id = ${options.vendor}
                        ${additionalFilters}

                        UNION

                        select  distinct c.id as value, c.name as text
                        from    customrecord_twc_ascl acl
                        join    customrecord_twc_company c on c.id = acl.custrecord_twc_acl_sub_contractor and c.custrecord_twc_co_fin_vend = 'T'
                        where   c.isinactive = 'F'
                        and     acl.custrecord_twc_acl_contractor = ${options.vendor}
                        ${additionalFilters}
                        order by text
                    `;

                }

            } else if (options.customer) {
                if (options.type == 'C') {
                    // @@NOTE: here we want to select only the logged in customer
                    sql = `
                        select  distinct c.id as value, c.name as text
                        from    customrecord_twc_company c
                        where   c.isinactive = 'F'
                        and     c.id = ${options.customer}
                        ${additionalFilters}
                        order by c.name
                    `;
                } else {
                    // @@NOTE: here we want to select only vendors this customer can use
                    sql = `
                        select  distinct c.id as value, c.name as text
                        from    customrecord_twc_acl acl
                        join    customrecord_twc_company c on c.id = acl.custrecord_twc_acl_cont and c.custrecord_twc_co_fin_vend = 'T'
                        where   c.isinactive = 'F'
                        and     acl.custrecord_twc_acl_cust = ${options.customer}
                        ${additionalFilters}
                        order by c.name
                    `
                }
            } else {
                if (options.type == 'C') {
                    additionalFilters += `and	custrecord_twc_co_fin_cust = 'T'`;
                } else {
                    additionalFilters += `and	custrecord_twc_co_fin_vend = 'T'`;
                }
                sql = `
                    select  c.id as value, c.name as text
                    from    customrecord_twc_company c
                    where   c.isinactive = 'F'
                    ${additionalFilters}
                    order by c.name
                `;

            }


            try {
                return coreSQL.run(sql);
            } catch (error) {
                throw new Error(sql);
            }



        }

        function getCustomers(options) {
            if (!options) { options = {}; }
            options.type = 'C';
            return getCompanies(options);
        }

        function getVendors(options) {
            if (!options) { options = {}; }
            options.type = 'V';
            return getCompanies(options);
        }

        function getProfiles(options) {
            var sql = `
                select  id as value, name as text, name || ' <span style="color: silver; font-style: italic;">[' || custrecord_twc_prof_position || ']</span>' as text_render,
                        custrecord_twc_prof_phone as phone, custrecord_twc_prof_email as email,
                        (case when custrecord_twc_prof_safe_pass_expiry > CURRENT_DATE then 'T' else 'F' end) as valid_safe_pass,
                        (case when custrecord_twc_prof_climber_cert_sts = ${NO_ACTIVE_EXPIRED.Active} then 'T' else 'F' end) as valid_climb_cert,
                        (case when custrecord_twc_prof_rescue_cert_sts = ${NO_ACTIVE_EXPIRED.Active} then 'T' else 'F' end) as valid_rescue_cert,
                        (case when custrecord_twc_prof_rooftop_cert_sts = ${NO_ACTIVE_EXPIRED.Active} then 'T' else 'F' end) as valid_rooftop_cert,
                        (case when custrecord_twc_prof_elec_cert_sts = ${NO_ACTIVE_EXPIRED.Active} then 'T' else 'F' end) as valid_electrician_cert,
                        (case when custrecord_twc_prof_rf_cert_sts = ${NO_ACTIVE_EXPIRED.Active} then 'T' else 'F' end) as valid_rf_cert,
                        (case when custrecord_twc_prof_drone_cert_sts = ${NO_ACTIVE_EXPIRED.Active} then 'T' else 'F' end) as valid_drone_cert,
                from    customrecord_twc_prof
                where   custrecord_twc_prof_company = ${options.company}
                and 	  custrecord_twc_prof_picw_acceptable='T'
            `
            if (options.filters) {
                for (var f in options.filters) {
                    if (options.filters[f].op !== undefined) {
                        sql += `and ${f} ${options.filters[f].op} ${options.filters[f].value}`;
                    } else {
                        sql += `and ${f} = '${options.filters[f]}'`;
                    }
                }
            }

            sql += ' order by name';

            var profiles = [];
            coreSQL.each(sql, p => {
                var attendAs = [];
                if (p.valid_safe_pass == 'T') { attendAs.push({ value: 'Visitor', text: 'Visitor' }); }
                if (p.valid_climb_cert == 'T') { attendAs.push({ value: 'Climber Certified', text: 'Climber Certified' }); }
                if (p.valid_rescue_cert == 'T') { attendAs.push({ value: 'Rescue Certified', text: 'Rescue Certified' }); }
                if (p.valid_rooftop_cert == 'T') { attendAs.push({ value: 'Rooftop Certified', text: 'Rooftop Certified' }); }
                if (p.valid_electrician_cert == 'T') { attendAs.push({ value: 'Electrician Certified', text: 'Electrician Certified' }); }
                if (p.valid_drone_cert == 'T') { attendAs.push({ value: 'Drone Certified', text: 'Drone Certified' }); }
                if (options.canAttend && attendAs.length == 0) { return; }
                profiles.push({
                    value: p.value,
                    text: p.text,
                    text_render: p.text_render,
                    phone: p.phone,
                    email: p.email,
                    attendAs: attendAs
                })
            })
            return profiles;
        }

        function getSafIds() {
            return coreSQL.run(`select id as id, custrecord_twc_saf_id as text from customrecord_twc_saf where 1 = 1 order by id`)
        }

        function getSrfStatus() {
            return getLookUpTableValues('customrecord_twc_srf_status');
        }

        function getSrfIds() {
            return getLookUpTableValues('customrecord_twc_srf');
        }

        function getSafTimeBlocks(siteId) {
            // @@TODO: we could have time slots specific to a site if needed
            return coreSQL.run(`select id as value, name as text from ${SAF_TIME_BLOCKS} order by id`);
        }

        function getSafDropDown(options) {
            var siteSafs = [];
            coreSQL.each(`
                select  saf.id as value, saf.name, BUILTIN.DF(saf.custrecord_twc_saf_type) as type, saf.custrecord_twc_saf_start_time_block as date, c.name as customer,
                        BUILTIN.DF(saf.custrecord_twc_saf_site) as site
                from    customrecord_twc_saf saf
                join    customrecord_twc_company c on c.id = saf.custrecord_twc_saf_customer
                where   saf.custrecord_twc_saf_site = ${options.siteId}
                order by saf.custrecord_twc_saf_start_time_block desc
            `, saf => {
                siteSafs.push({
                    value: saf.value,
                    text: `${saf.name} [${saf.date}] ${saf.customer} @ ${saf.site}`,
                    text_render: `<b>${saf.name}</b> [${saf.date}] <i>${saf.customer}</i> @ ${saf.site}`,
                })
            })
            return siteSafs;
        }

        function getSrfDropDown(options) {
            var siteSrfs = [];
            coreSQL.each(`
                select  srf.id as value, srf.name, BUILTIN.DF(srf.custrecord_twc_srf_type) as type, srf.custrecord_twc_srf_app_date as date, c.name as customer,
                        BUILTIN.DF(srf.custrecord_twc_srf_site) as site
                from    customrecord_twc_srf srf
                join    customrecord_twc_company c on c.id = srf.custrecord_twc_srf_cust
                where   srf.custrecord_twc_srf_site = ${options.siteId}
                and     srf.custrecord_twc_srf_status between ${SRF_STATUS.WorksPermitted} and ${SRF_STATUS.SRFCancelled}
                order by srf.custrecord_twc_srf_app_date desc
            `, srf => {
                siteSrfs.push({
                    value: srf.value,
                    text: `<b>${srf.name}</b> [${srf.date}] <i>${srf.customer}</i> @ ${srf.site}`
                })
            })
            return siteSrfs;
        }

        function getInfraStructures(options) {
            return coreSQL.run(`
                select  is.id as value, custrecord_twc_infra_id as text, custrecord_twc_infra_id || ' [' || BUILTIN.DF(custrecord_twc_infra_str_type) || ']' as text_render, 
                        custrecord_twc_infra_type as type, BUILTIN.DF(custrecord_twc_infra_type) as type_name, st.custrecord_twc_infra_saf_sts_types as saf_types
                from    customrecord_twc_infra is
                left join    customrecord_twc_infra_saf_sts st on st.id = is.custrecord_twc_infra_saf_status
                where   custrecord_twc_infra_site = ${options?.siteId || 0}
                order by is.custrecord_twc_infra_id
            `)
        }

        function getStructureTypeInfo(options) {
            var info = { height: 0 };
            coreSQL.each(`
                select  BUILTIN.DF(i.custrecord_twc_infra_type) as type, i.custrecord_twc_infra_str_ht_m as height,
                        t.custrecord_twc_infra_str_type_rooftop as is_rooftop, t.custrecord_twc_infra_str_type_mast as is_mast, t.custrecord_twc_infra_str_type_tower as is_tower,
                        s.custrecord_twc_site_crane_mewp_access as crane,
                from    customrecord_twc_infra i
                join    customrecord_twc_infra_str_type t on t.id = i.custrecord_twc_infra_str_type
                join    customrecord_twc_site s on s.id = i.custrecord_twc_infra_site
                where  	i.custrecord_twc_infra_site = ${options.siteId}
            `, r => {
                if (r.is_rooftop == 'T') {
                    info.roofTop = true;
                } else if (r.is_mast == 'T') {
                    info.mast = true;
                } else if (r.is_tower == 'T') {
                    info.tower = true;
                } else if (r.crane == 'T') {
                    info.crane = true;
                }

                if (r.height > info.height) { info.height = r.height; }

                // @@NOTE: these are required all the time
                info.electrical = true;
                info.building = true;
            })
            return info;
        }

        function getFiles(options) {
            var sql = ` 
                select  f.id, f.name, BUILTIN.DF(f.custrecord_twc_file_type) as type, f.custrecord_twc_file_recid as file_dsecr, f.custrecord_twc_file_doc as file_id,
                        t.custrecord_twc_file_type_hs as is_hs, t.custrecord_twc_file_type_method as is_method
                from    customrecord_twc_file f
                left join    customrecord_twc_file_type t on t.id = f.custrecord_twc_file_type

                where  f.isinactive = 'F'
            `
            if (options.filters) {
                for (var f in options.filters) {
                    if (options.filters[f].op !== undefined) {
                        sql += `and ${f} ${options.filters[f].op} ${options.filters[f].value}`;
                    } else {
                        sql += `and ${f} = '${options.filters[f]}'`;
                    }
                }
            }

            sql += ' order by f.name';

            return coreSQL.run(sql)
        }

        function formatLongDate(d) {
            if (!d) { d = (new Date()).addHours(12); }
            return `${cored.WeekDays[d.getDay()]} ${d.getDate()} ${cored.Months[d.getMonth()]}, ${d.getFullYear()}`;
        }

        return {
            ROOT_FILE_FOLDER: 'TWC Files',

            HEIGH_LIMIT_FOR_1_CLIMBER: 60,

            InfraType: INFRA_TYPE,

            SafType: SAF_TYPE,
            SafStatus: SAF_STATUS,

            SrfStepType: SRF_ITEM_STEP_TYPE,
            SrfRequestType: SRF_ITEM_REQUEST_TYPE,
            SrfStatus: SRF_STATUS,

            getTimeBlockTimeRange: getTimeBlockTimeRange,

            getInfraStructures: getInfraStructures,
            getStructureTypeInfo: getStructureTypeInfo,

            getSrfStatusName: getSrfStatusName,
            getSrfStatusStyle: getSrfStatusStyle,
            getSrfStatusHtml: getSrfStatusHtml,

            getSafStatusName: getSafStatusName,
            getSafStatusStyle: getSafStatusStyle,
            getSafStatusHtml: getSafStatusHtml,

            getSafDropDown: getSafDropDown,
            getSafTimeBlocks: getSafTimeBlocks,
            getSrfDropDown: getSrfDropDown,

            getFields: getCustomTableFields,
            getSiteNames: getSiteNames,
            getSiteTypes: getSiteTypes,
            getSiteLevels: getSiteLevels,
            getCounties: getCounties,
            getRegions: getRegions,
            getPortfolios: getPortfolios,
            getSafStatus: getSafStatus,
            getSafTypes: getSafTypes,
            getSafCrew: getSafCrew,
            getSafImages: getSafImages,
            getSafContractorFiles: getSafContractorFiles,
            getProfiles: getProfiles,
            getCompanies: getCompanies,
            getCustomers: getCustomers,
            getVendors: getVendors,
            getSafIds: getSafIds,
            getSrfIds: getSrfIds,
            getSrfStatus: getSrfStatus,



            getYesNoOptions: getYesNoOptions,

            getFiles: getFiles,

            formatLongDate: formatLongDate
        }
    });
