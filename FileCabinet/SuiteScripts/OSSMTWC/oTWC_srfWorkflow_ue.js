/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/record', 'N/runtime', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', './O/oTWC_themes_ue.js', './data/oTWC_config.js'],
    (record, runtime, file, core, coreSql, oui, recu, htmlStyles, twcThemesUE, twcConfig) => {

        function beforeLoad(context) {
            if (context.type == context.UserEventType.VIEW) {
                try {
                    if (twcConfig.isPowerUser()) {
                        var form = oui.get(context.form);
                        form.pageInitView('OSSMTWC', 'oTWC_srfWorkflow');
                        form.f.clientScriptModulePath = './oTWC_srfWorkflow_cs.js';
                        form.buttonAdd('Delete Workflow', 'deleteWorkflow');

                        twcThemesUE.setForm(form);
                        
                    }

                } catch (error) {
                    core.logError('beforeSubmit', error.message);
                }
            }
        }

      

        return {
            beforeLoad: beforeLoad,
      
        };
    });