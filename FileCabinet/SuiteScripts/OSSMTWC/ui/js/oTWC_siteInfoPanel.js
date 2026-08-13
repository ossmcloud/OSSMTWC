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
            #collapsed = false;
            #panel = null;
            #panelHidden = null;
            constructor(options) {
                this.#page = options.page;
                this.#data = options.data;
            }

            get ui() { return this.#page.ui; }

            initPanel() {

                this.#panel = this.#page.page.find('#twc-site-info-panel');
                this.#panelHidden = this.#page.page.find('#twc-site-info-panel-hidden');

                var siteInfos = [];

                var siteAccessInfo = JSON.parse(JSON.stringify(this.#data));
                siteAccessInfo[twcSite.Fields.SITE_LATITUDE] = siteAccessInfo[twcSite.Fields.ACCESS_LATITUDE]
                siteAccessInfo[twcSite.Fields.SITE_LONGITUDE] = siteAccessInfo[twcSite.Fields.ACCESS_LONGITUDE]
                siteAccessInfo.site_color = 'magenta';
                if (siteAccessInfo[twcSite.Fields.SITE_LATITUDE] && siteAccessInfo[twcSite.Fields.SITE_LONGITUDE]) {
                    siteInfos.push(siteAccessInfo);
                }

                siteInfos.push(this.#data);

                this.#page.page.find('#twc-site-info-panel-collapse').on('click', e => { this.collapse(); })
                this.#page.page.find('#twc-site-info-panel-uncollapse').on('click', e => { this.collapse(); })

                if (localStorage.getItem('site-panel-collapsed') === 'true') {
                    this.collapse();
                }

                googleMap.get(jQuery('#twc-google-map-container'), siteInfos, true).then(map => {
                    this.#map = map;
                });
            }

            collapse() {
                if (this.#collapsed) {
                    this.#panel.parent().css('width', '20%');
                    this.#panel.parent().css('min-width', '450px');
                    this.#panel.css('display', 'block')
                    this.#panelHidden.css('display', 'none')
                } else {
                    this.#panel.parent().css('width', '30px');
                    this.#panel.parent().css('min-width', '30px');
                    this.#panel.css('display', 'none')
                    this.#panelHidden.css('display', 'block')
                }
                this.#collapsed = !this.#collapsed;
                localStorage.setItem('site-panel-collapsed', this.#collapsed);
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