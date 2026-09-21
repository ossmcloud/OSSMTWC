/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/query', 'N/runtime', 'N/error', 'N/ui/serverWidget', 'N/ui/message'],
    function (query, runtime, error, serverWidget, message) {

        function beforeLoad(context) {
            //  try {
            if (context.type !== context.UserEventType.CREATE) {
                return;
            }
            var recordType = context.newRecord.type;
            var currentRole = runtime.getCurrentUser().role

            if (!recordType || !currentRole) {
                return;
            }
            

            if (isCreateRestricted(recordType, currentRole)) {
                //throw new Error('Creation Not Allowed! You do not have permission to create this record.')
                throw error.create({
                    name: 'CREATE_NOT_ALLOWED',
                    message: 'You do not have permission to create this record. This record is EDIT ONLY.',
                    notifyOff: true
                });
            }
        }


        function isCreateRestricted(recordType, currentRole) {

            var sql = `
            SELECT id
            FROM customrecord_twc_custom_permission
            WHERE custrecord_twc_custom_permission_record = ?
            AND custrecord_twc_custom_permission_type = 'EDIT_ONLY'
            AND custrecord_twc_custom_permission_role = ?
            AND NVL(isinactive, 'F') = 'F'
            FETCH FIRST 1 ROWS ONLY`
            var result = query.runSuiteQL({
                query: sql,
                params: [
                    recordType,
                    currentRole
                ]
            }).asMappedResults();
            log.debug("result..", result)

            return result.length > 0;
        }

        return {
            beforeLoad: beforeLoad
        };
    });