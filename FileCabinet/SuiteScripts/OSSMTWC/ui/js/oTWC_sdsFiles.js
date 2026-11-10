/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_sds.js', '../../data/oTWC_site.js', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js', '../../data/oTWC_icons.js'],
    (core, twcPageBase, dialog, twcSds, twcSite, uiTable, twcSiteLocatorPanel, twcIcons) => {

        class TWCSdsFilesTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                // @@NOTE: very first column: 'View' opens the SDS PDF in a dialog, 'Download' saves it as d.download_name (see TWCSdsFilesPage.initPage)
                //         the download name is built server side (oTWC_sdsFilesUtils.js: getSdsFiles)
                var unboundCols = [];
                unboundCols.push({
                    id: 'view_sds', title: '', unbound: true,
                    styles: { 'text-align': 'center', width: '70px' },
                    noSort: true,
                    sortIdx: 0,
                    initValue: (d) => {
                        // @@IMPORTANT: these must be <a> and the click target must be the <a> itself: the table row click handler (oTWC_ui_table.js: '.o-row' click)
                        //              stops propagation unless e.target is an A or INPUT, so the delegated handlers below would never fire
                        //              => the svg ignores pointer events (clicks on the icon land on the <a>) and the icon html is trimmed (no underlined white space)
                        const icon = (name) => { return twcIcons.get(name, 20).trim().replace('<svg ', '<svg style="pointer-events: none; display: block;" '); };
                        const iconStyle = 'display: inline-block; cursor: pointer; padding: 0 3px; text-decoration: none;';
                        var fileName = (d.download_name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                        return `<a href="#" class="twc-sds-view" style="${iconStyle}" title="View" data-sds-id="${d.id}" data-twc-file-name="${fileName}">${icon('eye')}</a>`
                            + `<a href="#" class="twc-sds-download" style="${iconStyle}" title="Download" data-twc-file="${d.twc_file}" data-twc-file-name="${fileName}">${icon('download')}</a>`;
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
                var hiddenCols = ['id', 'record_id', 'site_id', 'srf_id', 'twc_file', 'download_name', twcSds.Fields.CUSTOMER, twcSds.Fields.STATUS, twcSite.Fields.ADDRESS_COUNTY];
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

                // @@NOTE: only the logged in profile's company SDS are listed (oTWC_sdsFilesUtils.js: getSdsFiles), the customer column is redundant
                if (col.id == `${twcSds.Fields.CUSTOMER}_text`) { return false; }

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
                jQuery('#twc_sites_table').on('click', '.twc-sds-view', async e => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                        // @@NOTE: the PDF is streamed by oTWC_print_srf_sds_sl (not a blob url as previewFile does) so the response carries the file name
                        //         (Content-Disposition) and the PDF viewer's download button saves it as {site}_{customer}_{sds}_{created}.pdf
                        var sdsId = jQuery(e.currentTarget).data('sds-id');
                        if (!sdsId) { throw new Error('No PDF found for this SDS'); }
                        var pdfUrl = core.url.script('otwc_print_srf_sds_sl', { sdsId: sdsId, fromFile: 'T' });
                        dialog.message({
                            title: jQuery(e.currentTarget).data('twc-file-name') || 'SDS',
                            message: `<object style="width: 100%;height: 100%;" type="application/pdf" data="${pdfUrl}"><p>The object cannot be displayed.</p></object>`,
                            size: { width: '1000px', height: '95vh' }
                        });
                    } catch (error) {
                        dialog.error(error);
                    }
                });

                jQuery('#twc_sites_table').on('click', '.twc-sds-download', async e => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                        var twcFile = jQuery(e.currentTarget).data('twc-file');
                        if (!twcFile) { throw new Error('No PDF found for this SDS'); }
                        await this.downloadFile({ twcFile: twcFile }, jQuery(e.currentTarget).data('twc-file-name'), e);
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
