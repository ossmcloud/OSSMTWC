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

                var siteInfos = [];
                
                var siteAccessInfo = JSON.parse(JSON.stringify(this.#data));
                siteAccessInfo[twcSite.Fields.LATITUDE] = siteAccessInfo[twcSite.Fields.LATITUDE_ACCESS]
                siteAccessInfo[twcSite.Fields.LONGITUDE] = siteAccessInfo[twcSite.Fields.LONGITUDE_ACCESS]
                siteAccessInfo.site_level_color = 'magenta';
                if (siteAccessInfo[twcSite.Fields.LATITUDE] && siteAccessInfo[twcSite.Fields.LONGITUDE]) {
                    siteInfos.push(siteAccessInfo);
                }
                
                siteInfos.push(this.#data);

                googleMap.get(jQuery('#twc-google-map-container'), siteInfos, true).then(map => {
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