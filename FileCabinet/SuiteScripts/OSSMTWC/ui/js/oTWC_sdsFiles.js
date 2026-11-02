/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_sds.js', '../../data/oTWC_site.js', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js'],
    (core, twcPageBase, dialog, twcSds, twcSite, uiTable, twcSiteLocatorPanel) => {

        class TWCSdsFilesTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                // @@NOTE: very first column: 'View' opens the SDS PDF in a dialog (see TWCSdsFilesPage.initPage)
                var unboundCols = [];
                unboundCols.push({
                    id: 'view_sds', title: '', unbound: true,
                    styles: { 'text-align': 'center', width: '60px' },
                    noSort: true,
                    sortIdx: 0,
                    initValue: (d) => {
                        return `<a href="#" class="twc-sds-view" data-twc-file="${d.twc_file}">View</a>`;
                    }
                })
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,
                    fitScreen: true,
                    fitContainer: false
                });
            }

            get table() { return this.#table.table; }

            colInit(tbl, col) {
                // @@NOTE: ids / raw list values are only used for links and filters
                var hiddenCols = ['id', 'record_id', 'site_id', 'srf_id', 'twc_file', twcSds.Fields.CUSTOMER, twcSds.Fields.STATUS, twcSite.Fields.ADDRESS_COUNTY];
                if (hiddenCols.indexOf(col.id) >= 0) { return false; }

                if (col.id == 'name') {
                    col.title = 'SDS';
                    col.addCount = true;
                }

                if (col.id == 'site_id_text') {
                    col.title = 'Site';
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${site_id}',
                        valueField: 'site_id'
                    }
                }

                if (col.id == 'srf_id_text') {
                    col.title = 'SRF';
                    col.link = {
                        url: core.url.script('otwc_spacerequest_sl') + '&recId=${srf_id}',
                        valueField: 'srf_id'
                    }
                }

                if (col.id == `${twcSds.Fields.CUSTOMER}_text`) {
                    // @@NOTE: non employees only see their own company's SDS
                    if (!window.twc.page.data.userInfo?.isEmployee) { return false; }
                    col.title = 'Customer';
                }

                if (col.id == `${twcSds.Fields.STATUS}_text`) {
                    col.title = 'Status';
                    col.styles = { 'text-align': 'center', width: '120px' };
                }

                if (col.id == `${twcSite.Fields.ADDRESS_COUNTY}_text`) { col.title = 'County'; }

                if (col.id == 'commencement_date') {
                    col.title = 'Commencement Date';
                    col.type = 'date';
                    col.styles = { 'text-align': 'center', width: '150px' };
                }

                if (col.id == 'created_date') {
                    col.title = 'Created';
                    col.type = 'date';
                    col.styles = { 'text-align': 'center', width: '120px' };
                }
            }

            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }
        }

        class TWCSdsFilesPage extends twcPageBase.TWCPageBase {
            #sdsTable = null;
            #sitePanel = null;
            constructor() {
                super({ scriptId: 'otwc_sdsfiles_sl' });
            }

            initPage() {
                this.#sdsTable = new TWCSdsFilesTable(this);
                this.#sitePanel = twcSiteLocatorPanel.get({ page: this, table: this.#sdsTable, data: this.data.sdsInfo.sites, tableData: this.data.sdsInfo.sdsFiles });

                // @@NOTE: delegated so it keeps working when the table is re-rendered (filters)
                jQuery('#twc_sites_table').on('click', 'a.twc-sds-view', async e => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                        var twcFile = jQuery(e.currentTarget).data('twc-file');
                        if (!twcFile) { throw new Error('No PDF found for this SDS'); }
                        await this.previewFile({ twcFile: twcFile }, e);
                    } catch (error) {
                        dialog.error(error);
                    }
                });
            }
        }

        return {
            init: function () {
                twcPageBase.init(new TWCSdsFilesPage())
            }
        }
    });
