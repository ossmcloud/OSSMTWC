/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'N/redirect', 'O/form', './data/oTWC_saf.js', './O/oTWC_themes.js'],
    (file, runtime, core, redirect, oui, twcSaf, twcThemes) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);
                form.f.clientScriptModulePath = './oTWC_saf_cs.js';
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
                            ${context.newRecord.getValue(twcSaf.Fields.CONDITIONS_OF_ACCESS) }
                        </div>
                    `)

                    form.f.insertField({ field: condOfAccess.f, nextfield: twcSaf.Fields.CONDITIONS_OF_ACCESS });
                    form.fieldHide(twcSaf.Fields.CONDITIONS_OF_ACCESS);
                    
                    form.buttonAdd('Open SAF', 'openSaf')

                    // @@TODO: style #body prevents the page to scroll
                    // var styles = twcThemes.css('default')
                    // styles += file.load('SuiteScripts/OSSMTWC/O/css/html.styles.css').getContents();
                    // styles += file.load('SuiteScripts/OSSMTWC/ui/css/oTWC.css').getContents();
                    // form.fieldHtml(`<style>${styles}</style>`)
                }
            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
                if (context.type == 'create') {
                    throw error;
                }
            }
        }



        return {
            beforeLoad: beforeLoad,

        }
    });
