/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteLocatorPanel, uiTable, twcSite) => {

      

        // @@TODO: this should be from site access table
        class TWCSiteTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var safLink = core.url.script('otwc_siteaccess_sl');
                var unboundCols = [];
                unboundCols.push({
                    id: 'open_saf', title: 'SAF', unbound: true,
                    styles: { 'text-align': 'center' },
                    noSort: true,
                    sortIdx: 999,
                    initValue: (d) => {
                        return `<a href="${safLink}&recId=${d.id}">view</a>`;
                    }
                })
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,
                    // fitScreen: false,
                    // fitContainer: true
                });

                this.#table.onInitEvents = (tbl) => {
                    // @@TODO: this deows not work
                    // tbl.table.on('scroll', e => {
                    //     console.log('scrll', e)
                    // })
                }
            }

            get table() { return this.#table.table; }

            colInit(tbl, col) {
                if (col.id == 'id') { return false; }
                if (col.id == 'cust_id') { return false; }
                if (col.id == 'name') { return false; }
                if (col.id == 'site_type_color') { return false; }
                if (col.id == 'site_type_color') { return false; }

                var uf = window.twc.page.data.data.sitesInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    col.title = uf.label;
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                }

                if (col.id == twcSite.Fields.SITE_NAME || col.id == twcSite.Fields.SITE_ID) {
                    col.addCount = col.id == twcSite.Fields.SITE_NAME;
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${id}',
                        valueField: 'id'
                    }
                }
                if (col.id == twcSite.Fields.LATITUDE || col.id == twcSite.Fields.LONGITUDE) { col.styles = { 'text-align': 'right' }; }
            }

            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }



        }


        class TWCSiteAccessPage extends twcPageBase.TWCPageBase {
            #map = null;
            #sitesTable = null;
            #siteLocatorPanel = null;
            constructor() {
                super({ scriptId: 'otwc_siteAccess_sl' });


            }

            initPage() {

                if (this.data.siteAccessInfo) {
                    // @@NOTE: this is record view mode
                    this.#map = googleMap.get(jQuery('#twc-google-map-container'), window.twc.page.data.siteInfo.site);
                } else {
                    // @@NOTE: this is site locator mode

                    this.#sitesTable = new TWCSiteTable(this);
                    this.#siteLocatorPanel = twcSiteLocatorPanel.get(this, this.#sitesTable);
                    this.#siteLocatorPanel.updateResults();
                }
            }


        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteAccessPage())
            }


        }
    });
