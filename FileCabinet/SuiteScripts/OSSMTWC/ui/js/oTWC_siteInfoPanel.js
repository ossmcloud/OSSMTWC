/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteLocatorPanel, uiTable, twcSite) => {

        class TWCSiteInfoPanel {
            #page = null;
            #map = null;
            #data = null;
            constructor(options) {
                this.#page = options.page;
                this.#data = options.data;
            }

            get ui() { return this.#page.ui; }

            initPanel() {
                googleMap.get(jQuery('#twc-google-map-container'), this.#data).then(map => {
                    this.#map = map;
                });
            }
        }


        return {
            get: function (options) {
                var panel = new TWCSiteInfoPanel(options);
                panel.initPanel();
                return panel;
            }
        }
    })