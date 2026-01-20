/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', './oTWC_permissions.js'],
    (core, permissions) => {


        // @@TODO: persist
        function userInfo(context) {
            var p = permissions.get(context);

            return {
                permission: p,
            }
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
