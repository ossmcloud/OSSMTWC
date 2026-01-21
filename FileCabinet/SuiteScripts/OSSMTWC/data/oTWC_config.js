/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_permissions.js'],
    (runtime, core, coreSQL, permissions) => {


        function userInfo(context) {

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
            } else if (userInfo.type.indexOf('CustJob') >= 0) {
                userInfo.isCustomer = true;
            } else {
                userInfo.isEmployee = true;
            }

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

                }
            }

            return userInfo;
        }

        // @@TODO: persist
        function getUserPref() {
            return {
                theme: 'dark'
            }
        }


        return {
            userInfo: userInfo,
            getUserPref: getUserPref
        }
    });
