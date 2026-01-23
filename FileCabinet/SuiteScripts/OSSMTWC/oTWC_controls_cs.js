/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_site.js', './ui/modules/oTWC_siteLocatorUtils.js', './data/oTWC_config.js'],
    function (core, coreSQL, dialog, recu, twcSite, siteLocatorUtils, twcConfig) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())

        }




        return {
            pageInit: pageInit,
            testFunction() {
                try {
                    //throw new Error('no test')
                    var ui = twcConfig.userInfo();
                    console.log(twcConfig.getUserPref(ui))
                    
                } catch (error) {
                    dialog.error(error)
                }

            }
        }
    });
