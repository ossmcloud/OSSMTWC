/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../data/oTWC_troubleTickets', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js', './oTWC_siteInfoPanel.js', '../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSql, twcPageBase, dialog, twcIcons, twcConfig, twcTkt, uiTable, twcSiteLocatorPanel, twcSiteInfoPanel, twcUI) => {

        var _tktLink = null;
        function ticketViewLink(id) {
            if (!_tktLink) { _tktLink = core.url.script('oTWC_troubleTicket_sl'); }
            return `${_tktLink}&recId=${id}`
        }

        function ticketNewLink(id) {
            if (!_tktLink) { _tktLink = core.url.script('oTWC_troubleTicket_sl'); }
            return `${_tktLink}&siteId=${id}&edit=T`
        }

        class TWCTicketTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var unboundCols = [];
                // @@TODO: use icons and actions 
                unboundCols.push({
                    id: 'open_tkt', title: '', unbound: true,
                    styles: { 'text-align': 'center' },
                    noSort: true,
                    sortIdx: 0,
                    initValue: (d) => {
                        return `<a href="${ticketViewLink(d.id)}">View</a>`;
                    }
                })
                unboundCols.push({
                    id: 'new_tkt', title: '', unbound: true,
                    styles: { 'text-align': 'center' },
                    noSort: true,
                    sortIdx: 0,
                    initValue: (d) => {
                        return `<a href="${ticketNewLink(d.site_id)}">New</a>`;
                    }
                })
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,
                    fitScreen: true,
                    fitContainer: false
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
                console.log('col', col.id)
                if (col.id == 'id') { return false; }
                if (col.id == 'record_id') { return false; }
                if (col.id == 'site_id') { return false; }
                if (col.id == 'custrecord_twc_trbl_tkt_id') {
                    col.title = 'Trouble Ticket ID';
                    col.addCount = true;
                    col.link = {
                        url: core.url.script('oTWC_troubleTicket_sl') + '&recId=${id}',
                        valueField: 'id'
                    }
                }

                var uf = window.twc.page.data.data.ticketInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                console.log('uf', uf)
                if (uf) {
                    col.title = uf.label;
                    if (uf.type) { col.type = uf.type; }
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                }

                if (col.id == 'site_id_text') {
                    col.title = 'Site';
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${site_id}',
                        valueField: 'site_id'
                    }
                }

                if (col.id == `${twcTkt.Fields.STATUS}_text`) {
                    col.styles = { 'text-align': 'center', width: '150px' }
                    col.formatValue = (v) => {
                        return twcTkt.getTktStatusHtml(v, 'twc-record-status-row');
                    }
                }

                if (col.id == `${twcTkt.Fields.PRIORITY}_text`) {
                    col.styles = { 'text-align': 'center', width: '150px' }
                    col.formatValue = (v) => {
                        return twcTkt.getTktPriorityHtml(v, 'twc-record-status-row');
                    }
                }

                if (col.id == twcTkt.Fields.LATITUDE || col.id == twcTkt.Fields.LONGITUDE) { col.styles = { 'text-align': 'right' }; }

                // if (col.id == twcTkt.Fields.MAST_ACCESS || col.id == twcTkt.Fields.TL_BUILDING_ACCESS || col.id == twcTkt.Fields.CRANE__CHERRYPICKER || col.id == twcSaf.Fields.ROOFTOP_ACCESS || col.id == twcSaf.Fields.ELECTRICAL_WORKS) {
                //     col.title = col.title.replace(' Access', '');
                //     col.styles = { 'min-width': '100px', 'max-width': '100px' }
                // }


            }

            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }



        }
        class TWCTroubleTicketPage extends twcPageBase.TWCPageBase {
            #changes = {};
            #map = null;
            #sitesTable = null;
            #sitePanel = null;
            constructor() {
                super({ scriptId: 'otwc_troubleticket_sl' });

            }

            initPage() {
                console.log('info', this.data)
                if (this.data.data.ticketInfo) {
                    console.log('test data', window.twc.page.data)
                    console.log('test data sites', window.twc.page.data.data.ticketInfo.sites)

                    this.#sitesTable = new TWCTicketTable(this);
                    this.#sitePanel = twcSiteLocatorPanel.get({ page: this, table: this.#sitesTable, data: window.twc.page.data.data.ticketInfo.sites, tableData: window.twc.page.data.data.ticketInfo.tickets });
                    console.log('123', this.#sitePanel)

                    // if (this.data.editMode) {
                    //   //  this.#safBuilder = new TWCSiteAccessBuilder(this);
                    // } else {
                    this.initTrblTktMode();
                    // }
                } else {
                    this.initLocatorMode();
                    this.initTrblTktMode(window.twc.page.data.recId);
                }
            }
            initLocatorMode() {
                this.#sitesTable = new TWCTicketTable(this);
                console.log('this', this)
                console.log('site', window.twc.page)
                this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });
            }

            initTrblTktMode(recId) {

                this.ui.on('change', e => {
                    this.#changes[e.id] = e.value;
                    this.dirty = true
                })

                this.ui.find('#resolve-button').on('click', async (e) => {
                    await this.resolveTicket(recId);
                });

            }

            async resolveTicket(recId) {
                try {
                    await dialog.confirmAsync('Are you sure you want to resolve this ticket?')
                    await this.post({ action: 'resolve-tkt-status' }, recId);
                    location.reload();

                } catch (error) {
                    dialog.error(error);
                }
            }



            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    var payload = this.#changes;

                    await this.post({ action: 'save' }, payload);
                    this.dirty = false;
                    location.href = location.href.replace('&edit=T', '');

                } catch (error) {
                    await dialog.errorAsync(error);
                } finally {
                    this.waitClose();
                }

            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCTroubleTicketPage())
            }


        }
    });
