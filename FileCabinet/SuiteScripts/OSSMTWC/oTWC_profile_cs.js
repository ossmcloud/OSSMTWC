/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './O/controls/oTWC_ui_ctrl.js', './data/oTWC_profileUI.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcUI, twcProfileUI) {

        function pageInit(context) {
            console.log('debug -------------> ')

            window.twcPreviewFile = (id) => {
                dialog.error('UNDER DEV')
            }

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
            try {
                var tbl = jQuery(twcProfileUI.getCertFileHistory({
                    profile: currentRecord.get().id,
                    //certCode: 'safe_pass'
                }));
                var ui = twcUI.init({}, tbl);
                ui.ui.find('#file_history').css('display', 'table')
                ui.controls[0].onInitEvents = (tbl) => {
                    tbl.ui.find('#file_history').css('display', 'table')
                }
                dialog.message({
                    title: 'File History',
                    message: ui.ui,
                    size: { width: '70%', height: '500px' }
                })

            } catch (error) {
                dialog.error(error);
            }
        }
        

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            viewCertsHistory: viewCertsHistory
        }
    });


