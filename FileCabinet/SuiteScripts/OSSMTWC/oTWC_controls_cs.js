/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_site.js', './ui/modules/oTWC_siteLocatorUtils.js'],
    function (core, coreSQL, dialog, recu, twcSite, siteLocatorUtils) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())

        }




        return {
            pageInit: pageInit,
            testFunction() {
                try {
                    //throw new Error('no test')

                    var sql = 'select id, custrecord_twc_site_longitude as lng, custrecord_twc_site_latitude as lat from customrecord_twc_site order by id';

                    coreSQL.each(sql, s => {
                        console.log(s)
                        recu.load(twcSite.Type, s.id).save();
                       // recu.submit(twcSite.Type, s.id, ['custrecord_twc_site_longitude', 'custrecord_twc_site_latitude'], [s.lat, s.lng]);
                        //return false

                    })

                    
                } catch (error) {
                    dialog.error(error)
                }

            }
        }
    });
