/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeSubmit(context) {

        // Only run on edit and inline edit
        if (context.type !== context.UserEventType.EDIT &&
            context.type !== context.UserEventType.XEDIT) {
            return;
        }
        const newRec = context.newRecord;
        const oldRec = context.oldRecord;

        const SAFE_PASS_FIELD = 'custrecord_twc_prof_safe_pass_cert_sts';
        const ACCRED_FIELD = 'custrecord_twc_prof_accred_status';
        const newSafePassStatus = newRec.getValue({ fieldId: SAFE_PASS_FIELD });
        const oldSafePassStatus = oldRec.getValue({ fieldId: SAFE_PASS_FIELD });
        const oldAccredStatus = oldRec.getValue({ fieldId: ACCRED_FIELD });

        if (newSafePassStatus == 3) {
            newRec.setValue({ fieldId: ACCRED_FIELD, value: 3 });
        }
        else if (oldSafePassStatus == 3 && newSafePassStatus != 3) {
            newRec.setValue({ fieldId: ACCRED_FIELD, value: oldAccredStatus });
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});