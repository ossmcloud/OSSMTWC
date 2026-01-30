/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog) => {


        class TWCSiteAccessPage extends twcPageBase.TWCPageBase {
            #map = null;
            constructor() {
                super({ scriptId: 'otwc_siteAccess_sl' });


            }

            initPage() {
                if (this.data.siteAccessInfo) {
                    // @@NOTE: this is record view mode
                    this.#map = googleMap.get(jQuery('#twc-google-map-container'), window.twc.page.data.siteInfo.site);
                } else {
                    // @@NOTE: this is site locator mode

                }
            }


        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteAccessPage())
            }


        }
    });
