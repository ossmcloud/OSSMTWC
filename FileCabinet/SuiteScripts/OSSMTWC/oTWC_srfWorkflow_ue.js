/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/record', 'N/runtime', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', './O/oTWC_themes.js', './data/oTWC_config.js'],
    (record, runtime, file, core, coreSql, oui, recu, htmlStyles, twcThemes, twcConfig) => {

        function getTWCCss() {
            var css = file.load('SuiteScripts/OSSMTWC/ui/css/oTWC.css').getContents();
            return css.substring(css.indexOf('/* TRUNCATE */'));

        }

        function beforeLoad(context) {
            if (context.type == context.UserEventType.VIEW) {
                try {
                    if (twcConfig.isPowerUser()) {
                        var form = oui.get(context.form);
                        form.pageInitView('OSSMTWC', 'oTWC_srfWorkflow');
                        form.f.clientScriptModulePath = './oTWC_srfWorkflow_cs.js';
                        form.buttonAdd('Delete Workflow', 'deleteWorkflow');

                        form.fieldHtml(htmlStyles.all(''));
                        var styles = twcThemes.css('default')
                        styles += file.load('SuiteScripts/OSSMTWC/O/css/html.styles.css').getContents();
                        styles += getTWCCss();
                        form.fieldHtml(`<style>${styles}</style>`)
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