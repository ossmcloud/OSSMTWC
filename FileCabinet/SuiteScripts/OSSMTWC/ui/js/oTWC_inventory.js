/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'N/record', 'N/url', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_config.js', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js', '../../data/oTWC_site.js', './oTWC_siteInfoPanel.js'],
    (core, coreSql, record, url, twcPageBase, dialog, twcConfig, uiTable, twcSiteLocatorPanel, twcSite, twcSiteInfoPanel) => {

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
                        console.log('site id for link', `<a href="${safLink}&siteId=${d.id}">view</a>`);
                        return `<a href="${safLink}&siteId=${d.id}">view</a>`;
                    }
                })
                console.log("jQuery('#twc_sites_table')", jQuery('#twc_sites_table'))
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,
                    fitScreen: false,
                    fitContainer: true
                });
                console.log('unboundCols', unboundCols)
                console.log('twc site table', this.#table)

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
                if (col.id == 'name') { return false; }
                console.log('col init', col.id)

                var uf = window.twc.page.data.data.inventoryInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                console.log('uf', uf)
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
                    console.log('init inventory page', this.data)
                    console.log("TESTTTTT", window.twc.page.data)
                    this.#sitesTable = new TWCSiteTable(this);
                    console.log('inventory page data', window.twc.page.data)
                    console.log('thissssssssssssss', this)
                    // this.#sitePanel = twcSiteLocatorPanel.get(
                    //     {
                    //         page: this,
                    //         table: this.#sitesTable,
                    //         data: window.twc.page.data.data.inventoryInfo.sites,
                    //     }
                    // );
                    this.#sitePanel = twcSiteLocatorPanel.get({
                        page: this,
                        table: this.#sitesTable,
                        data: window.twc.page.data.data.inventoryInfo.sites,
                        tableData: window.twc.page.data.data.inventoryInfo.inventoryDetails
                    });
                    console.log('site locator panel', this.#sitePanel)
                }
            }
            initInventoryMode(recId) {
                this.ui.find('#add-equipment-button').on('click', async (e) => {
                    await this.addEquipment();
                });
            }

            // When clicked on Add Equipment Button, redirect to Equipment custom record with some parameters like Equipment Type and Site Id.
            async addEquipment() {
                try {
                    this.wait();

                    var siteId = window.twc.page.data.inventoryInfo.custrecord_twc_equip_site;
                    var eqType = window.twc.page.data.inventoryInfo.custrecord_twc_equip_type;

                    siteId = siteId?.value || siteId;
                    eqType = eqType?.value || eqType;

                    // 1. Create the Custom Record and load the record in edit mode
                    // var newRec = record.create({
                    //     type: 'customrecord_twc_equip',
                    //     isDynamic: true
                    // });

                    // newRec.setValue({ fieldId: 'custrecord_twc_equip_site', value: parseInt(siteId, 10) });
                    // newRec.setValue({ fieldId: 'custrecord_twc_equip_type', value: parseInt(eqType, 10) });

                    // var recId = newRec.save();

                    // var recordUrl = url.resolveRecord({
                    //     recordType: 'customrecord_twc_equip',
                    //     recordId: recId,
                    //     isEditMode: true
                    // });

                    // window.location.href = recordUrl;

                    // 2. Calling using the resolveRecord
                    var recordUrl = core.url.record('customrecord_twc_equip', null, true) +
                        `&custrecord_twc_equip_site=${siteId}` +
                        `&custrecord_twc_equip_type=${eqType}`;

                    window.location.href = recordUrl;

                    // 3. Calling using the resolveRecord with parameters
                    // var recordUrl = url.resolveRecord({
                    //     recordType: 'customrecord_twc_equip',
                    //     isEditMode: true,
                    //     params: {
                    //         custrecord_twc_equip_site: siteId.id,
                    //         custrecord_twc_equip_type: eqType
                    //     }
                    // });

                    // window.location.href = recordUrl;

                    // 4. Calling using the suitelet redirect with parameters
                    // await this.post({ action: 'add-equipment' }, { siteId, eqType });

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
