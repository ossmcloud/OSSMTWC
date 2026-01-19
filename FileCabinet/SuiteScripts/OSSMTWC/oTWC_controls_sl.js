/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope public
 *@NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['O/suitlet', '/.bundle/548734/O/core.js', '/.bundle/548734/O/client/html.styles.js'],
    function (uis, core, htmlStyles) {
        var suiteLet = uis.new({ title: 'OSSM Control Page', script: 'SuiteScripts/OSSMTWC/oTWC_controls_cs.js'});
        suiteLet.get = (context, s) => {
            s.form.buttonAdd('Test', 'testFunction');
            s.form.fieldHtml(htmlStyles.all());
        }
        
        return {
            onRequest: uis.onRequest
        }
    });
