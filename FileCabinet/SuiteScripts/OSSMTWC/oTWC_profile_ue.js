/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/record', 'N/runtime', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', './O/oTWC_themes_ue.js', './data/oTWC_utils.js'],
    (record, runtime, file, core, coreSql, oui, recu, htmlStyles, twcThemesUE, twcUtils) => {

        function beforeLoad(context) {
            
                try {

                    var form = oui.get(context.form);
                    form.fieldIdCount = 99;

                    // form.pageInitView('OSSMTWC', 'oTWC_profile');
                    form.f.clientScriptModulePath = './oTWC_profile_cs.js';
                    twcThemesUE.setForm(form);

                    if (context.type == context.UserEventType.VIEW) {
                        form.buttonAdd('View Certs History', 'viewCertsHistory');
                        form.buttonAdd('Open Company', 'openCompany');
                    } else if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE) {
                        for (var k in twcUtils.Certs) {
                            form.fieldReadOnly(twcUtils.Certs[k].fieldFile);
                        }
                    }
                    
                    
                } catch (error) {
                    core.logError('beforeSubmit', error.message);
                    throw error
                }
            
        }

        function beforeSubmit(context) {

            /*
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
            */
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit
        };
    });