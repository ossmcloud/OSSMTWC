/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './oTWC_permissions.js', './oTWC_profileCompany.js'],
    (runtime, core, coreSQL, recu, permissions, twcProfileCompany) => {

        const CUSTOM_FIELDS = {
            EMP: {
                TWC_POWER_USER: 'custentity_twc_prj_power_user'
            },
            CASE: {
                TKT_RECORD: 'custevent_twc_trbl_tkt'
            }
        }

        // @@HARDCODED: @@GO-LIVE :: these map to internal ids
        const TOWERCOM_ENTITY = 822;
        const TKT_CASE_PROFILE = 1;
        const TKT_CASE_STATUS = 1;
        const NO_REPLY = 827;
        const SAF_AWAIT_PHOTOS_MAIL_TEMPLATE = 2;

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

        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        // @@IMPORTANT :: this is duplicated with twcUtils
        const COMPANY_ACCREDITATION_STATUS = {
            Inactive: 1,
            Accredited: 2,
            CertsExpired: 3,
            Pending: 4,
            // Approved: 5,
            ToBeRenewed: 6,
            No: 7
        }

        function isPowerUser(id) {
            return recu.lookUp('employee', id || core.env.user(), CUSTOM_FIELDS.EMP.TWC_POWER_USER);
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
                and         cf.isstored = 'T'
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



        // @@NOTE: finds the profile of the logged in user for the given company
        //         entityId: the logged in entity (core.env.user()), on a Customer Center contact login this is the company the contact chose at login
        //         email: the logged in user email (runtime.getCurrentUser().email), on a contact login this is the contact email
        //         the profile username is either the entity itself or the contact (found by email)
        //         linked = 'T' if the profile home company is companyId or the profile is linked to companyId (customrecord_twc_profilec)
        //         profiles linked to the company come first, so if linked = 'F' then the user has no profile for this company
        function getLoginProfile(entityId, email, companyId) {
            return coreSQL.first({
                query: `
                    select  p.id, p.name, p.custrecord_twc_prof_phone as phone, p.custrecord_twc_prof_co_desig_cont as designated_contact,
                            p.custrecord_twc_prof_username as username, e.email, e.entitytitle as user_name, NVL(e.mobilephone, e.phone) as user_phone,
                            case when p.custrecord_twc_prof_company = ? or pc.id is not null then 'T' else 'F' end as linked
                    from    customrecord_twc_prof p
                    join    entity e on e.id = p.custrecord_twc_prof_username
                    left join ${twcProfileCompany.Type} pc on pc.${twcProfileCompany.Fields.PROFILE} = p.id and pc.${twcProfileCompany.Fields.COMPANY} = ? and pc.isinactive = 'F'
                    where   p.isinactive = 'F'
                    and     (p.custrecord_twc_prof_username = ? or LOWER(e.email) = LOWER(?))
                    order by (case when p.custrecord_twc_prof_company = ? or pc.id is not null then 0 else 1 end), (case when p.custrecord_twc_prof_username = ? then 0 else 1 end), p.id
                `,
                params: [companyId || 0, companyId || 0, entityId, email || '-', companyId || 0, entityId]
            });
        }

        function getUserInfo(context) {

            var userInfo = coreSQL.first({
                query: `
                    select  e.id, e.type, e.email, e.entitytitle as name, NVL(e.mobilephone, e.phone) as phone, emp.custentity_twc_prj_power_user as power_user, emp.custentity_twc_can_execute_pack as can_execute_pack,
                            emp.custentity_twc_saf_photo_approver as saf_photo_approver
                    from    entity e
                    left join employee emp on emp.id = e.id
                    where   e.id = ?
                `,
                params: [core.env.user()]
            })

            userInfo.powerUser = userInfo.power_user == 'T';
            userInfo.canExecutePack = userInfo.can_execute_pack == 'T';
            // @@NOTE: employee checkbox 'Can Approve SAF Photo Reviews', approves the completion photos reviews before they are issued to the SAF submitter
            userInfo.canApproveSafReview = userInfo.saf_photo_approver == 'T';
            delete userInfo.power_user;
            delete userInfo.can_execute_pack;
            delete userInfo.saf_photo_approver;

            if (context) { userInfo.permission = permissions.get(context); }

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
                userInfo.isBoth = userInfo.companyProfile.isBoth;

            }

            if (userInfo.companyProfile) {
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

            // @@NOTE: feature restrictions (e.g. customer only) depend on the user's company, see oTWC_permissions.js: applyRestrictions
            if (userInfo.permission) { permissions.applyRestrictions(userInfo.permission, userInfo); }

            var profileInfo = null;
            if (userInfo.isEmployee) {
                profileInfo = coreSQL.first(`select id, custrecord_twc_prof_phone as phone, name, custrecord_twc_prof_co_desig_cont as designated_contact from customrecord_twc_prof where custrecord_twc_prof_username = ${userInfo.recordId}`);
            } else {
                // @@NOTE: a contact can be associated to multiple customers, on login (Customer Center) the contact chooses the company
                //         and core.env.user() (userInfo.id) is the chosen company entity, so userInfo.companyProfile is already the chosen company
                //         the profile is the one whose username is the logged in entity or the contact (matched by the runtime email)
                //         and it must be linked to the chosen company (home company or customrecord_twc_profilec)
                profileInfo = getLoginProfile(userInfo.id, runtime.getCurrentUser().email, userInfo.companyProfile.id);
                if (profileInfo && profileInfo.linked != 'T') {
                    throw new Error(`Your profile is not associated to company "${userInfo.companyProfile.name}", please contact TL administrator to set you up.`);
                }

                if (profileInfo && profileInfo.username != userInfo.id) {
                    // @@NOTE: the logged in user is not the main customer but a contact with access, we keep the contact details as well
                    userInfo.contact = { id: profileInfo.username, email: profileInfo.email, name: profileInfo.user_name, phone: profileInfo.user_phone };
                    userInfo.recordType = 'contact';
                    userInfo.recordId = userInfo.contact.id;
                }

                if (profileInfo) {
                    delete profileInfo.username;
                    delete profileInfo.email;
                    delete profileInfo.user_name;
                    delete profileInfo.user_phone;
                    delete profileInfo.linked;
                }
            }

            userInfo.profile = profileInfo?.id || null;
            userInfo.profileInfo = profileInfo;

            var designatedContactList = coreSQL.run(`select id, name, custrecord_twc_comp_des_contact_sign as can_sign from customrecord_twc_comp_des_contact`);
            var designatedContacts = profileInfo?.designated_contact;
            if (designatedContacts) {
                designatedContacts = designatedContacts.split(',').map(i => { return parseInt(i.trim()) });
                designatedContacts = designatedContactList.filter(i => { return designatedContacts.indexOf(i.id) >= 0; })
            } else {
                designatedContacts = [];
            }
            if (userInfo.profileInfo) { userInfo.profileInfo.designatedContacts = designatedContacts; }

            if (!userInfo.isEmployee) {
                if (userInfo.profileInfo) { userInfo.canSign = userInfo.profileInfo.designatedContacts.find(i => { return i.can_sign; })?.can_sign == 'T'; }
            }

            if (!userInfo.profile) { throw new Error('Your user is not associated to any profile, please contact TL administrator to set you up.') }

            if (userInfo.isEmployee) {
                userInfo.canEnterSAF = true;
            } else {

                userInfo.canEnterSAF = (userInfo.companyProfile.accreditation_status == COMPANY_ACCREDITATION_STATUS.Accredited || userInfo.companyProfile.accreditation_status == COMPANY_ACCREDITATION_STATUS.ToBeRenewed);
            }

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
                userInfo = getUserInfo(context);
                recu.submit(userInfo.recordType, userInfo.recordId, FIELD_ENTITY_USER_PREF, userPref);

            } catch (error) {
                core.log.error('SET-USER-PREF', `${userInfo?.recordType}:${userInfo?.recordId} :: ${error.message}`);
            }
        }

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
            Fields: CUSTOM_FIELDS,

            ROOT_FILE_FOLDER: 'TL Files', // @@NOTE: this is duplicated on twc_utils.js
            CONTRACTOR_FLAG: CONTRACTOR_FLAG,
            CUSTOMER_FLAG: CUSTOMER_FLAG,
            PERMISSION_LEVEL: permissions.LEVEL,
            PERMISSION_FEATURE: permissions.FEATURE,
            PORTLET_STYLES_PROPS: { Height: '600px' },
            TOWERCOM_ENTITY: TOWERCOM_ENTITY,
            TKT_CASE_PROFILE: TKT_CASE_PROFILE,
            TKT_CASE_STATUS: TKT_CASE_STATUS,
            NO_REPLY: NO_REPLY,
            SAF_AWAIT_PHOTOS_MAIL_TEMPLATE: SAF_AWAIT_PHOTOS_MAIL_TEMPLATE,
            
            userInfo: getUserInfo,
            getLoginProfile: getLoginProfile,
            getUserPref: getUserPref,
            setUserPref: setUserPref,
            getScriptId: getScriptId,
            getUserAllowedCustomers: getUserAllowedCustomers,
            isUserAllowedCustomers: isUserAllowedCustomers,
            cfg: getConfig,
            getNsTable: getNsTable,
            getFields: getCustomTableFields,

            isPowerUser: isPowerUser
        }
    });
