/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../O/controls/oTWC_ui_fieldPanel.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteInfoPanel, twcSiteLocatorPanel, uiTable, twcSite, twcSrf, twcSrfItem, twcUIPanel) => {



        // @@TODO: this should be from site request table
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
                        return `<a href="${safLink}&siteId=${d.id}">view</a>`;
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
                    // @@NOTE: this is record view mode
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });

                    core.array.each(this.ui.controls, c => {
                        if (c.type == 'table') {
                            c.onColumnInit = (tbl, col) => {
                                // @@NOTE: if we have fxFields the framework would return the field_name (with id) and field_name_name (with BUILTIN.DF value)
                                //         we do not want to show the id
                                if (tbl.data.length > 0) {
                                    if (tbl.data[0][`${col.id}_name`] !== undefined) { return false; }
                                }
                            }
                        }
                    })

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
                        this.ui.getControl(twcSrf.Fields.CUSTOMER).value = 219;
                    }


                } else {
                    // @@NOTE: this is site locator mode
                    this.#sitesTable = new TWCSiteTable(this);
                    this.#sitePanel = twcSiteLocatorPanel.get({ page: this, table: this.#sitesTable, data: window.twc.page.data.data.sitesInfo.sites });

                }
            }


            manageSRFItem(srfItem, table) {
                try {

                    if (!this.data.siteRequestInfo[twcSrf.Fields.CUSTOMER]) { throw new Error('You need to specify a customer'); }

                    this.post({ action: 'child-record' }, { srf: this.data.siteRequestInfo, item: srfItem }).then(res => {

                        var form = twcUIPanel.ui(res);
                        form.getControl(twcSrfItem.Fields.EQUIPMENT_ID).disabled = true;
                        form.on('change', e => {
                            srfItem[e.id] = e.value;
                            if (e.target.valueObj) { srfItem[e.id + '_name'] = e.target.valueObj.text; }
                            if (e.id == twcSrfItem.Fields.REQUEST_TYPE) { form.getControl(twcSrfItem.Fields.EQUIPMENT_ID).disabled = (!e.value || e.value == twcSrfItem.RequestType.INSTALL); }
                        })

                        dialog.confirm({
                            title: 'manage record',
                            message: form.ui,
                            width: '75%',
                            height: '75vh'
                        }, () => {

                            try {

                                if (!srfItem.custrecord_twc_srf_itm_req_type) { throw new Error('nope') }

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



                    });


                } catch (error) {
                    dialog.error(error);
                }
            }


        }

        return {

            init: function () {
                twcPageBase.init(new TWCSpaceRequestPage())
            }


        }
    });
