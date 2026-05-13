/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/record', 'N/runtime', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', './O/oTWC_themes.js'],
    (record, runtime, file, core, coreSql, oui, recu, htmlStyles, twcThemes) => {

        function beforeLoad(context) {
            if (context.type == context.UserEventType.VIEW) {
                try {

                    var form = oui.get(context.form);
                    try {
                        form.pageInitView('OSSMTWC', 'oTWC_profile');
                    } catch (error) {
                        // ignore
                    }
                    form.f.clientScriptModulePath = './oTWC_profile_cs.js';
                    form.buttonAdd('View Certs History', 'viewCertsHistory');

                    form.fieldHtml(htmlStyles.all(''));
                    var styles = twcThemes.css('default')
                    styles += file.load('SuiteScripts/OSSMTWC/O/css/html.styles.css').getContents();
                    form.fieldHtml(`<style>${styles}</style>`)

                } catch (error) {
                    core.logError('beforeSubmit', error.message);
                    throw error
                }
                return;
            }
        }

        function beforeSubmit(context) {

            // Only run on edit and inline edit
            if (context.type !== context.UserEventType.EDIT && context.type !== context.UserEventType.XEDIT) {
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
            } else if (oldSafePassStatus == 3 && newSafePassStatus != 3) {
                newRec.setValue({ fieldId: ACCRED_FIELD, value: oldAccredStatus });
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit
        };
    });