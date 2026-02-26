/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../O/controls/oTWC_ui_fieldPanel.js', '../../data/oTWC_file.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteInfoPanel, twcSiteLocatorPanel, uiTable, twcSite, twcSrf, twcSrfItem, twcUIPanel, twcFile) => {


        function builtTestObjects(srfItem) {
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

        }


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
                if (col.id == 'name') {
                    col.title = 'SRF ID';
                    col.addCount = true;
                    col.link = {
                        url: core.url.script('otwc_spacerequest_sl') + '&recId=${id}',
                        valueField: 'id'
                    }
                }

                var uf = window.twc.page.data.data.srfInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    if (uf.label) { col.title = uf.label; }
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                    col.type = uf.type?.toLowerCase() || '';
                }

                if (col.id == 'site_id_text') {
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

                    this.ui.getControl('submit-button').on('click', e => {
                        alert('do submit')
                    });
                    // this.ui.on('click', e => {
                    //     if (e.id == 'submit-button') {
                    //         alert('do submit')
                    //     }
                    //     console.log(e)
                    // })
                    
                    this.ui.on('change', e => {
                        if (e.target.type != 'table') {
                            this.data.siteRequestInfo[e.id] = e.value;
                            this.dirty = true
                        }
                    })
                    core.array.each(this.ui.controls, c => {
                        if (c.type !== 'table') { return; }

                        c.onToolbarClick = e => {
                            var manageMethod = e.table.id == twcFile.Type ? 'manageSRFFile' : 'manageSRFItem';
                            if (e.action == 'add-new') {
                                this[manageMethod](null, e.table);

                            } else if (e.action == 'edit') {
                                this[manageMethod](e.rowData, e.table);
                                
                            } else if (e.action == 'delete') {
                                dialog.confirm('Are you sure you wish to delete this record', () => {
                                    e.rowData.delete = true;
                                    this[manageMethod](e.rowData, e.table);
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

            deleteRecord(srfRecord, table) {
                var deleteRecordCollectionName = table.id == twcFile.Type ? 'files_deleted' : 'items_deleted';
                if (srfRecord.delete) {
                    if (srfRecord.id) {
                        if (!this.data.siteRequestInfo[deleteRecordCollectionName]) { this.data.siteRequestInfo[deleteRecordCollectionName] = []; }
                        this.data.siteRequestInfo[deleteRecordCollectionName].push(srfRecord);
                    }
                    table.data.splice(table.data.indexOf(srfRecord), 1);
                    table.render(table.data, true);
                    this.dirty = true
                    return true;
                }
            }

        
            manageSRFFile(srfFile, table) {
                try {
                    if (!srfFile) { srfFile = {}; }
                    if (this.deleteRecord(srfFile, table)) { return; }

                    var res = this.postSync({ action: 'child-record' }, { srf: this.data.siteRequestInfo, file: srfFile })
                    var form = twcUIPanel.ui(res);
                    form.on('change', e => { 
                        if (e.id == 'name') {
                            e.target.readFile(file => {
                                srfFile.fileObject = file;
                                srfFile.name = file.name;
                            })
                        }
                    });

                    dialog.confirm({ title: 'manage file', message: form.ui, width: '600px', height: '400px' }, () => {
                        try {
                            var obj = form.getValues(true);
                            for (var k in obj) {
                                if (k == 'name') { continue; }
                                if (obj[k]?.value !== undefined) {
                                    srfFile[k] = obj[k].value;
                                    srfFile[k + '_name'] = obj[k].text;
                                } else {
                                    srfFile[k] = obj[k];
                                }
                            }
                            srfFile.dirty = true;

                            if (!this.data.siteRequestInfo.files) { this.data.siteRequestInfo.files = table.data; }
                            if (this.data.siteRequestInfo.files.indexOf(srfFile) < 0) { this.data.siteRequestInfo.files.push(srfFile); }
                            table.render(this.data.siteRequestInfo.files, true)

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


            manageSRFItem(srfItem, table) {
                try {
                    if (!this.data.siteRequestInfo[twcSrf.Fields.CUSTOMER]) { throw new Error('You need to specify a customer'); }

                    
                    if (!srfItem) { srfItem = {}; }
                    if (this.deleteRecord(srfItem, table)) { return; }

                    srfItem.custrecord_twc_srf_itm_stype = table.id.replace('customrecord_twc_srf_itm_', '');

                    // @@TODO: dev only
                    if (!srfItem.id) { builtTestObjects(srfItem); }

                    var res = this.postSync({ action: 'child-record' }, { srf: this.data.siteRequestInfo, item: srfItem })
                    var form = twcUIPanel.ui(res);
                    form.getControl(twcSrfItem.Fields.EQUIPMENT_ID).disabled = true;
                    form.on('change', e => {
                        if (e.id == twcSrfItem.Fields.REQUEST_TYPE) { form.getControl(twcSrfItem.Fields.EQUIPMENT_ID).disabled = (!e.value || e.value == twcSrfItem.RequestType.INSTALL); }
                    })

                    dialog.confirm({ title: 'manage item', message: form.ui, width: '75%', height: '75vh' }, () => {
                        try {
                            var obj = form.getValues(true);

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
                            if (!this.data.siteRequestInfo[itemList]) { this.data.siteRequestInfo[itemList] = table.data; }
                            if (this.data.siteRequestInfo[itemList].indexOf(srfItem) < 0) { this.data.siteRequestInfo[itemList].push(srfItem); }
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


            async previewFile(id) {
                var res = await this.post({ action: 'get-file' }, { file: id });
                var html = `<object style="width: 100%;height: 100%;" data="data:application/${res.type.toLowerCase()};base64,${res.fileContent}">`;
                dialog.message({
                    title: res.name,
                    message: html,
                    size: { width: '1000px', height: '95vh' }
                })
            }

            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    // @@TODO: if status is 'Draft' ask user if the request has to be submitted

                    var payload = this.data.siteRequestInfo;
                    var res = await this.post({ action: 'save' }, payload);
                    this.dirty = false;
                    var p = new URLSearchParams(location.search);
                    if (p.has('recId')) {
                        location.href = location.href.replace('&edit=T', '');   
                    } else {
                        location.href = location.href.replace('&edit=T', '&recId=' + res.id);
                    }

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


