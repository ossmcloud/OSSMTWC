/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', './O/oTWC_dialogEx.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './modules/oTWC_srfWorkflowEngine.js', './data/oTWC_srfWorkflow.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcSrfWorkflowEngine, twcSrfWorkflow) {

        function pageInit(context) {
            console.log('debug -------------> ')
            jQuery('#body').css('overflow', 'auto')
        }


        function deleteWorkflow() {
            var n = Math.floor(Math.random() * 9999).pad(4);
            var content = jQuery(`
                <div>
                    In order to start the deletion process please enter code:
                    <div style="font-size: 2em; font-weight: bold; border: 1px solid silver; padding: 17px; text-align: center;">
                        ${n}
                    </div>
                    in the box below and click ok.
                    <input type="number" class="twc" />
                </div>
            `);
            dialog.confirm({ message: content }, dlg => {
                try {
                    if (content.find('input').val() != n) { throw new Error('the code you have entered does not match'); }

                    dialog.saving(dlg);

                    window.setTimeout(() => {
                        twcSrfWorkflowEngine.deleteWorkflow({ wkf: currentRecord.get().id });
                        location.href = core.url.record('customrecord_twc_srf_wkf').replace('custrecordentry', 'custrecordentrylist');
                    }, 150)

                    return false;
                } catch (error) {
                    dialog.savingError(dlg, error);
                    return false;
                }
            });
        }

        return {
            pageInit: pageInit,
            deleteWorkflow: deleteWorkflow
        }
    });


