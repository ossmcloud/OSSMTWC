/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope public
 *@NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['O/suitlet', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '/.bundle/548734/O/client/html.styles.js', './data/oTWC_site.js'],
    function (uis, core, coreSQL, recu, htmlStyles, twcSite) {
        var suiteLet = uis.new({ title: 'OSSM Control Page', script: 'SuiteScripts/OSSMTWC/oTWC_controls_cs.js'});
        suiteLet.get = (context, s) => {

            // if (!core.env.ossm()) { throw new Error('You do not have permission to access the TWC Controls Page'); }
            
            s.form.buttonAdd('Test', 'testFunction');
            s.form.buttonAdd('Delete all SRF', 'deleteAllSrf')
            s.form.fieldHtml(htmlStyles.all());


        }
        
        return {
            onRequest: uis.onRequest
        }
    });
