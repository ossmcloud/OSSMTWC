/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './O/controls/oTWC_ui_ctrl.js', './ui/js/oTWC_companyProfile.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcUI, twcCompanyProfile) {

        function pageInit(context) {
            console.log('debug -------------> ')
        }

        let oldAccredStatus = null;

        function fieldChanged(context) {
            const rec = context.currentRecord;
            const fieldId = context.fieldId;

            if (fieldId === 'custrecord_twc_prof_safe_pass_cert_sts') {
                const safePassStatus = rec.getValue({ fieldId: 'custrecord_twc_prof_safe_pass_cert_sts' });

                if (safePassStatus == 3) { // Expired
                    // Store old value BEFORE overwriting
                    oldAccredStatus = rec.getValue({ fieldId: 'custrecord_twc_prof_accred_status' });
                    console.log('Stored old accred status:', oldAccredStatus);
                    rec.setValue({ fieldId: 'custrecord_twc_prof_accred_status', value: 3 });
                } else {
                    // Revert when changed away from 3
                    if (oldAccredStatus !== null) {
                        console.log('Reverting to:', oldAccredStatus);
                        rec.setValue({ fieldId: 'custrecord_twc_prof_accred_status', value: oldAccredStatus });
                        oldAccredStatus = null; // reset after reverting
                    }
                }
            }
        }

        function viewCertsHistory() {
            twcCompanyProfile.viewCertsHistory(currentRecord.get().id);
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            viewCertsHistory: viewCertsHistory
        }
    });


