/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../O/controls/oTWC_ui_fieldPanel.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteInfoPanel, twcSiteLocatorPanel, uiTable, twcSite, twcSrf, twcSrfItem, twcUIPanel) => {



        // @@TODO: this should be from site request table
        class TWCSiteSrfTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var safLink = core.url.script('otwc_spacerequest_sl');
                var unboundCols = [];
                unboundCols.push({
                    id: 'open_new_srf', title: 'S.R.F.', unbound: true,
                    styles: { 'text-align': 'center' },
                    noSort: true,
                    sortIdx: 999,
                    initValue: (d) => {
                        return `<a href="${safLink}&siteId=${d.site_id}">new</a>`;
                    }
                })
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_site_srf',
                    unboundCols: unboundCols,
                    // fitScreen: false,
                    // fitContainer: true
                });
            }

            get table() { return this.#table.table; }

            colInit(tbl, col) {
                if (col.id == 'id') { return false; }
                if (col.id == 'record_id') { return false; }
                if (col.id == 'site_id') { return false; }
                if (col.id == 'name') { col.title = 'SRF ID'; }

                var uf = window.twc.page.data.data.srfInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    if (uf.label) { col.title = uf.label; }
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                    col.type = uf.type?.toLowerCase() || '';
                }

                if (col.id == 'site_id_text') {
                    col.addCount = true;
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${site_id}',
                        valueField: 'site_id'
                    }
                }
                if (col.id == twcSite.Fields.LATITUDE || col.id == twcSite.Fields.LONGITUDE) { col.styles = { 'text-align': 'right' }; }
            }

            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }



        }


        class TWCSpaceRequestPage extends twcPageBase.TWCPageBase {
            #map = null;
            #sitesTable = null;
            #sitePanel = null;
            constructor() {
                super({ scriptId: 'otwc_spaceRequest_sl' });


            }

            initPage() {
                console.log('TWCSpaceRequestPage => InitPage')
                if (this.data.siteRequestInfo) {
                    // @@NOTE: this is record view/edit mode
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });


                    this.ui.on('change', e => {
                        if (e.target.type != 'table') {
                            this.data.siteRequestInfo[e.id] = e.value;
                            this.dirty = true
                        }
                    })
                    core.array.each(this.ui.controls, c => {
                        c.onToolbarClick = e => {
                            console.log(e)
                            if (e.action == 'add-new') {
                                this.manageSRFItem({ custrecord_twc_srf_itm_stype: e.table.id.replace('customrecord_twc_srf_itm_', '') }, e.table);
                                return false;
                            } else if (e.action == 'edit') {
                                alert('edit stuff dude')
                            } else if (e.action == 'delete') {
                                dialog.confirm('Are you sure you wish to delete this record', () => {
                                    alert('delete stuff dude')
                                })
                            }
                        }
                    })


                    // @@TODO: test only
                    if (core.ossm()) {
                        if (this.data.editMode && !this.data.siteRequestInfo.id) {
                            this.ui.getControl(twcSrf.Fields.CUSTOMER).value = 219;
                        }
                    }


                } else {
                    // @@NOTE: this is site locator mode
                    this.#sitesTable = new TWCSiteSrfTable(this);
                    this.#sitePanel = twcSiteLocatorPanel.get({ page: this, table: this.#sitesTable, data: this.data.data.srfInfo.sites, tableData: this.data.data.srfInfo.srfs });

                }
            }


            manageSRFItem(srfItem, table) {
                try {
                    if (!this.data.siteRequestInfo[twcSrf.Fields.CUSTOMER]) { throw new Error('You need to specify a customer'); }

                    // @@TODO: test only
                    if (core.ossm()) {
                        var testData = {
                            "custrecord_twc_srf_itm_req_type": "1",
                            "custrecord_twc_srf_itm_desc": "Test Dish Install",
                            "custrecord_twc_srf_itm_loc": "1",
                            "custrecord_twc_srf_itm_length_mm": "60",
                            "custrecord_twc_srf_itm_width_mm": "60",
                            "custrecord_twc_srf_itm_depth_mm": "60",
                            "custrecord_twc_srf_itm_ht_on_twr": "5",
                            "custrecord_twc_srf_itm_weight_kg": "1",
                            "custrecord_twc_srf_itm_invent_flag": "18"
                        }
                        if (srfItem.custrecord_twc_srf_itm_stype == 1) {
                            testData.custrecord_twc_srf_itm_equip_id = "";
                            testData.custrecord_twc_srf_itm_type = "1";
                            testData.custrecord_twc_srf_itm_volt_type = "1";
                            testData.custrecord_twc_srf_itm_volt_range = "1";
                            testData.custrecord_twc_srf_itm_azimuth = "0";
                            testData.custrecord_twc_srf_itm_b_end = "0";
                            testData.custrecord_twc_srf_itm_cust_ref = "XXX";

                        }
                        for (var k in testData) {
                            srfItem[k] = testData[k];
                        }
                    }

                    var res = this.postSync({ action: 'child-record' }, { srf: this.data.siteRequestInfo, item: srfItem })

                    var form = twcUIPanel.ui(res);
                    form.getControl(twcSrfItem.Fields.EQUIPMENT_ID).disabled = true;
                    form.on('change', e => {
                        // srfItem[e.id] = e.value;
                        // if (e.target.valueObj) { srfItem[e.id + '_name'] = e.target.valueObj.text; }
                        if (e.id == twcSrfItem.Fields.REQUEST_TYPE) { form.getControl(twcSrfItem.Fields.EQUIPMENT_ID).disabled = (!e.value || e.value == twcSrfItem.RequestType.INSTALL); }
                    })

                    dialog.confirm({ title: 'manage record', message: form.ui, width: '75%', height: '75vh' }, () => {
                        try {
                            var obj = form.getValues(true);
                            console.log(obj);

                            for (var k in obj) {
                                if (obj[k]?.value !== undefined) {
                                    srfItem[k] = obj[k].value;
                                    srfItem[k + '_name'] = obj[k].text;
                                } else {
                                    srfItem[k] = obj[k];
                                }
                            }

                            srfItem.dirty = true;

                            // @@NOTE: if we have anew item then add it to the collection 
                            var itemList = `items_${srfItem.custrecord_twc_srf_itm_stype}`;
                            if (!this.data.siteRequestInfo[itemList]) { this.data.siteRequestInfo[itemList] = []; }
                            if (this.data.siteRequestInfo[itemList].indexOf(srfItem) < 0) {
                                this.data.siteRequestInfo[itemList].push(srfItem);
                            }

                            table.render(this.data.siteRequestInfo[itemList], true)

                            this.dirty = true


                        } catch (error) {
                            dialog.error(error);
                            return false;
                        }
                    })



                } catch (error) {
                    dialog.error(error);
                }
            }



            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    var payload = this.data.siteRequestInfo;
                    var res = await this.post({ action: 'save' }, payload);
                    this.dirty = false;
                    location.href = location.href.replace('&edit=T', '&recId=' + res.id);

                } catch (error) {
                    await dialog.errorAsync(error);
                } finally {
                    this.waitClose();
                }

            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCSpaceRequestPage())
            }


        }
    });
