/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../data/oTWC_site.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, twcIcons, twcSite, googleMap, dialog) => {

      

        class TWCSiteInfoPage extends twcPageBase.TWCPageBase {
            #map = null;
            constructor() {
                super({ scriptId: 'otwc_siteInfo_sl' });


            }

            initPage() {
                
                this.#map = googleMap.get(jQuery('#twc-google-map-container'), window.twc.page.data.siteInfo.site);

                this.ui.on('change', e => {
                    console.log(e)
                })
               
            }

            test() {
                dialog.iconPicker()
            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteInfoPage())
            }


        }
    });
