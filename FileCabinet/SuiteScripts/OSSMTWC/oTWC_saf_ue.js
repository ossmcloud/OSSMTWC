/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'N/redirect', 'O/form', './data/oTWC_saf.js', './O/oTWC_themes_ue.js', './data/oTWC_config.js'],
    (file, runtime, core, redirect, oui, twcSaf, twcThemesUE, twcConfig) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);
                form.f.clientScriptModulePath = './oTWC_saf_cs.js';
                form.fieldIdCount = 199;
                
                form.pageInitView('OSSMTWC', 'oTWC_saf');
                if (context.type == 'create') {
                    form.fieldHide(twcSaf.Fields.CONDITIONS_OF_ACCESS);
                } else if (context.type == 'edit') {
                    form.fieldHide(twcSaf.Fields.CONDITIONS_OF_ACCESS)

                } else if (context.type == 'view') {
                    var condOfAccess = form.fieldHtml(`
                        <div style="margin-left: -8px; margin-right: 8px; border: 1px solid var(--grid-color);">
                            <div style="padding: 6px; border-radius: 0px; background-color: var(--nsn-uif-refreshed-color-primary-lighter)">
                                Conditions of Access
                            </div>
                            ${context.newRecord.getValue(twcSaf.Fields.CONDITIONS_OF_ACCESS)}
                        </div>
                    `)

                    form.f.insertField({ field: condOfAccess.f, nextfield: twcSaf.Fields.CONDITIONS_OF_ACCESS });
                    form.fieldHide(twcSaf.Fields.CONDITIONS_OF_ACCESS);

                    form.buttonAdd('Open SAF', 'openSaf');

                    if (twcConfig.isPowerUser()) {
                        form.buttonAdd('Delete SAF', 'deleteSaf');
                    }
                }
            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }



        return {
            beforeLoad: beforeLoad,

        }
    });
