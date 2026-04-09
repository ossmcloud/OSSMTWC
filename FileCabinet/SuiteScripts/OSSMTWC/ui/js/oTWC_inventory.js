/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_config.js', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js', '../../data/oTWC_site.js', './oTWC_siteInfoPanel.js', '../../data/oTWC_equipment.js'],
    (core, coreSql, twcPageBase, dialog, twcConfig, uiTable, twcSiteLocatorPanel, twcSite, twcSiteInfoPanel, twcInventory) => {

        class TWCSiteTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var safLink = core.url.script('oTWC_inventory_sl');
                var unboundCols = [];
                unboundCols.push({
                    id: 'open_inv', title: '', unbound: true,
                    styles: { 'text-align': 'center' },
                    noSort: true,
                    sortIdx: 999,
                    initValue: (d) => {
                        return `<a href="${safLink}&siteId=${d.id}">view</a>`;
                    }
                })
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,

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
                if (col.id == 'record_id') { return false; }
                if (col.id == 'site_id') { return false; }
                if (col.id == 'name') { return false; }

                var uf = window.twc.page.data.data.inventoryInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    if (uf.label) { col.title = uf.label; }
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                    col.type = uf.type?.toLowerCase() || '';
                }

                if (col.id == 'site_id_text') {
                    col.title = 'Site';
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${site_id}',
                        valueField: 'site_id'
                    }
                }

                if (col.id == 'infra_id') {
                    col.sortIdx = 51;
                    col.title = 'Infra. ID';
                }
                if (col.id == 'infra_type') {
                    col.sortIdx = 52;
                    col.title = 'Infrastructure';
                }
                if (col.id == 'infra_str_type') {
                    col.sortIdx = 53;
                    col.title = 'Infra. Type';
                }

                if (col.id == twcInventory.Fields.EQUIPMENT_ID) { col.addCount = true; }
            }
            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }
        }


        class TWCInventoryPage extends twcPageBase.TWCPageBase {
            #changes = {};
            #sitesTable = null;
            #sitePanel = null;
            constructor() {
                super({ scriptId: 'otwc_inventory_sl' });

            }

            initPage() {
                if (this.data.siteInfo) {
                    this.initInventoryMode();
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });
                } else {
                    this.#sitesTable = new TWCSiteTable(this);
                    this.#sitePanel = twcSiteLocatorPanel.get({
                        page: this,
                        table: this.#sitesTable,
                        data: window.twc.page.data.data.inventoryInfo.sites,
                        tableData: window.twc.page.data.data.inventoryInfo.inventoryDetails
                    });
                }
            }
            initInventoryMode(recId) {
                this.ui.find('#add-equipment-button').on('click', async (e) => {
                    await this.addEquipment();
                });
            }

            async addEquipment() {
                try {
                    this.wait();

                    var siteId = window.twc.page.data.inventoryInfo.custrecord_twc_equip_site;
                    var eqType = window.twc.page.data.inventoryInfo.custrecord_twc_equip_type;

                    siteId = siteId?.value || siteId;
                    eqType = eqType?.value || eqType;

                    var recordUrl = core.url.record('customrecord_twc_equip', null, true) +
                        `&custrecord_twc_equip_site=${siteId}`;

                    // window.location.href = recordUrl;
                    window.open(recordUrl);

                } catch (error) {
                    await dialog.errorAsync(error);
                } finally {
                    this.waitClose();
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
                twcPageBase.init(new TWCInventoryPage())
            }


        }
    });
