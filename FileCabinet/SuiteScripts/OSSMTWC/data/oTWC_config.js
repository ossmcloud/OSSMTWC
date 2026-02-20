/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './oTWC_permissions.js'],
    (runtime, core, coreSQL, recu, permissions) => {

        const FIELD_ENTITY_USER_PREF = 'custentity_twc_userpref';


        function getUserInfo(context) {

            var userInfo = coreSQL.first({
                query: `
                    select  id, type, email, entitytitle as name
                    from    entity
                    where   id = ?
                `,
                params: [core.env.user()]
            })

            userInfo.permission = permissions.get(context);

            if (userInfo.type.indexOf('Vendor') >= 0) {
                userInfo.isVendor = true;
                userInfo.recordType = 'vendor';
            } else if (userInfo.type.indexOf('CustJob') >= 0) {
                userInfo.isCustomer = true;
                userInfo.recordType = 'customer';
            } else {
                userInfo.isEmployee = true;
                userInfo.recordType = 'employee';
            }
            userInfo.recordId = userInfo.id;

            if (!userInfo.isEmployee) {
                // @@NOTE: the oly way to detect that the logged in user is not the main customer but a contact with access is if the email on runtime is different than what we loaded for the customer
                //         in such case we get the contact details as well in case we need it for soe reason
                var contactEmail = runtime.getCurrentUser().email;
                if (userInfo.email != contactEmail) {

                    userInfo.contact = coreSQL.first({
                        query: `
                            select  id, email, entitytitle as name
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

            userInfo.profile = coreSQL.first(`select id from customrecord_twc_prof where custrecord_twc_prof_username = ${userInfo.recordId}`)?.id || null;

            return userInfo;
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
            userInfo: getUserInfo,
            getUserPref: getUserPref,
            setUserPref: setUserPref,
            getScriptId: getScriptId,
            cfg: getConfig,
        }
    });
