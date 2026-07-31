/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'N/redirect', 'O/form', './data/oTWC_srf.js', './O/oTWC_themes_ue.js', './data/oTWC_config.js'],
    (file, runtime, core, redirect, oui, twcSrf, twcThemesUE, twcConfig) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);
                form.f.clientScriptModulePath = './oTWC_srf_cs.js';
                form.pageInitView('OSSMTWC', 'oTWC_srf');
                if (context.type == 'view') {
                    form.buttonAdd('Open SRF', 'openSrf');
                    if (twcConfig.isPowerUser()) {
                        form.buttonAdd('Delete SRF', 'deleteSrf');
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
