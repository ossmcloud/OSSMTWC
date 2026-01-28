/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_site.js', './ui/modules/oTWC_siteInfoUtils.js', './data/oTWC_config.js'],
    function (core, coreSQL, dialog, recu, twcSite, siteInfoUtils, twcConfig) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())

        }




        return {
            pageInit: pageInit,
            testFunction() {
                try {
                    //throw new Error('no test')

                    console.log(siteInfoUtils.getPanelFields_summary(coreSQL.first('select * from customrecord_twc_site where id = 2')));
             
                } catch (error) {
                    console.log(error)
                    dialog.error(error)
                }

            }
        }
    });
