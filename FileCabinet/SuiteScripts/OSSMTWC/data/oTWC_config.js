/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './oTWC_permissions.js'],
    (runtime, core, coreSQL, recu, permissions) => {

        // @@HARDCODED: 
        const TOWERCOM_ENTITY = 822;

        const FIELD_ENTITY_USER_PREF = 'custentity_twc_userpref';

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const CUSTOMER_FLAG = {
            Customer: 1,
            No: 2
        }

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const CONTRACTOR_FLAG = {
            Contractor: 1,
            SubContractor: 2,
            No: 3
        }


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
                return { pk: 'id', name: 'currency', nameField: 'symbol', isInactive: '', alias: '' }
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
                            NVL(NVL(lower(l.scriptid), lower(cl.scriptid)), cf.fieldvaluetyperecord) as field_foreign_table, c.includename as include_name, LOWER(c.scriptid) as table_name
                from        customfield cf
                join        customrecordtype c on c.internalid = cf.recordtype
                left join   customrecordtype l on l.internalid = cf.fieldvaluetyperecord
                left join   customlist cl on cl.internalid = cf.fieldvaluetyperecord
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

                customFields.push({
                    field_type: 'Date/Time',
                    field_id: 'created',
                    field_label: 'created',
                    field_foreign_table: null,
                    table_name: recordType
                })
            }

            return customFields;
        }



        function getUserInfo(context) {

            var userInfo = coreSQL.first({
                query: `
                    select  id, type, email, entitytitle as name, NVL(mobilephone, phone) as phone
                    from    entity
                    where   id = ?
                `,
                params: [core.env.user()]
            })


            userInfo.permission = permissions.get(context);

            userInfo.recordId = userInfo.id;

            userInfo.companyProfile = coreSQL.first(`
                select  id, name,
                        case when custrecord_twc_con_flag in (${CONTRACTOR_FLAG.Contractor}, ${CONTRACTOR_FLAG.SubContractor}) then 'T' else 'F' end  as is_vendor, 
                        case custrecord_twc_cus_flag when ${CUSTOMER_FLAG.Customer} then 'T' else 'F' end  as is_customer,
                        custrecord_twc_co_accred_status as accreditation_status, BUILTIN.DF(custrecord_twc_co_accred_status) as accreditation_status_name,
                from    customrecord_twc_company
                where   custrecordtwc_entity = ${(userInfo.type == 'Employee') ? TOWERCOM_ENTITY : userInfo.id}
            `)

            if (userInfo.type != 'Employee') {
                if (!userInfo.companyProfile) {
                    throw new Error(`Your user [${userInfo.id}] is not associated to any company profile, please contact TL administrator to set you up.`)
                }

                userInfo.companyProfile.isVendor = userInfo.companyProfile.is_vendor == 'T';
                userInfo.companyProfile.isCustomer = userInfo.companyProfile.is_customer == 'T';
                userInfo.companyProfile.isBoth = userInfo.companyProfile.isVendor && userInfo.companyProfile.isCustomer;

                delete userInfo.companyProfile.is_vendor;
                delete userInfo.companyProfile.is_customer;
            }

            if (userInfo.type == 'Employee') {
                userInfo.isEmployee = true;
                userInfo.recordType = 'employee';
            } else if (userInfo.companyProfile?.isVendor) {
                userInfo.isVendor = true;
                userInfo.recordType = 'vendor';
            } else if (userInfo.companyProfile?.isCustomer) {
                userInfo.isCustomer = true;
                userInfo.recordType = 'customer';
            } else {
                throw new Error('Could not determine login type');
            }

            if (!userInfo.isEmployee) {
                // @@NOTE: the oly way to detect that the logged in user is not the main customer but a contact with access is if the email on runtime is different than what we loaded for the customer
                //         in such case we get the contact details as well in case we need it for soe reason
                var contactEmail = runtime.getCurrentUser().email;
                if (userInfo.email != contactEmail) {

                    userInfo.contact = coreSQL.first({
                        query: `
                            select  id, email, entitytitle as name, NVL(mobilephone, phone) as phone
                            from    entity e
                            join    customercompanycontact ce on ce.contactscompany = ?
                            where email = ?
                        `,
                        params: [
                            userInfo.id,
                            contactEmail
                        ]
                    })

                    userInfo.recordType = 'contact';
                    userInfo.recordId = userInfo.contact.id;

                }


            }

            var profileInfo = coreSQL.first(`select id, custrecord_twc_prof_phone as phone, name from customrecord_twc_prof where custrecord_twc_prof_username = ${userInfo.recordId}`);

            userInfo.profile = profileInfo?.id || null;
            userInfo.profileInfo = profileInfo;

            if (!userInfo.profile) { throw new Error('Your user is not associated to any profile, please contact TL administrator to set you up.') }

            return userInfo;
        }


        function getUserAllowedCustomers(userInfo, returnIdArray) {
            var allowedCustomers = 'all';
            if (userInfo.companyProfile?.isVendor) {
                allowedCustomers = coreSQL.run(`select custrecord_twc_acl_cust as cust from customrecord_twc_acl where isinactive='F' and custrecord_twc_acl_cont = ${userInfo.companyProfile.id}`);
                allowedCustomers.push({ cust: userInfo.companyProfile.id })
            } else if (userInfo.companyProfile?.isCustomer) {
                allowedCustomers = [];
                allowedCustomers.push({ cust: userInfo.companyProfile.id })
            }
            if (allowedCustomers != 'all' && returnIdArray) {
                var ids = [];
                core.array.each(allowedCustomers, c => { ids.push(c.cust); })
                return ids;
            }
            return allowedCustomers;
        }
        function isUserAllowedCustomers(userInfo, customer) {
            var allowedCustomers = getUserAllowedCustomers(userInfo);
            if (allowedCustomers == 'all') { return true; }
            if (allowedCustomers.find(c => { return c.cust == customer })) { return true; }
            return false;
        }

        function getUserPref(userInfo) {
            try {
                var userPref = recu.lookUp(userInfo.recordType, userInfo.recordId, FIELD_ENTITY_USER_PREF);
                if (userPref) { userPref = JSON.parse(userPref); }
                return userPref || {}
            } catch (error) {
                core.log.error('GET-USER-PREF', `${userInfo.recordType}:${userInfo.recordId} :: ${error.message}`);
                return {};
            }
        }

        function setUserPref(context, userPref) {
            var userInfo = null;
            try {
                core.log.debug('setUserPref', userPref)
                userInfo = getUserInfo(context);
                core.log.error('setUserPref', JSON.stringify(userInfo));
                recu.submit(userInfo.recordType, userInfo.recordId, FIELD_ENTITY_USER_PREF, userPref);

            } catch (error) {

                core.log.error('SET-USER-PREF', `${userInfo?.recordType}:${userInfo?.recordId} :: ${error.message}`);
            }
        }

        // @@TODO: persist
        var _cfg = null;
        function getConfig() {
            if (!_cfg) {
                _cfg = {
                    GOOGLE_API_KEY: 'AIzaSyDp4Q94jOBatEUcelAa0HWn12Cv7jyKk5o'
                }
            }
            return _cfg;
        }



        function getScriptId(scriptId) {
            // @@NOTE: this will return the script id number based on the script id string
            return coreSQL.scalar({
                query: `select id from script where scriptid=?`,
                params: [`customscript_${scriptId}`]
            }) || 0;
        }

        return {
            PERMISSION_LEVEL: permissions.LEVEL,
            PERMISSION_FEATURE: permissions.FEATURE,
            userInfo: getUserInfo,
            getUserPref: getUserPref,
            setUserPref: setUserPref,
            getScriptId: getScriptId,
            getUserAllowedCustomers: getUserAllowedCustomers,
            isUserAllowedCustomers: isUserAllowedCustomers,
            cfg: getConfig,
            getNsTable: getNsTable,
            getFields: getCustomTableFields
        }
    });
