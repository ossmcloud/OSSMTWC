/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define([],
    () => {


        // @@TODO: persist
        function userInfo() {
            return {}
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
