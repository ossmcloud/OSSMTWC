/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_utils.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_ctrl.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../O/controls/oTWC_ui_fieldPanel.js', '../../data/oTWC_file.js', '../../data/oTWC_equipmentLibUI.js', '../../data/oTWC_equipmentUI.js', '../../data/oTWC_equipment.js', '../../modules/oTWC_srfWorkflowEngineUI.js.js', '../../modules/oTWC_sdsEngineUI.js'],
    (core, coreSql, b64, twcPageBase, twcUtils, twcConfig, googleMap, dialog, twcSiteInfoPanel, twcSiteLocatorPanel, twcUI, uiTable, twcSite, twcSrf, twcSrfItem, twcUIPanel, twcFile, twcEqLibUI, twcEqUI, twcEquipment, twcSrfWorkflowEngineUI, twcSdsEngineUI) => {



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
                });
            }

            get table() { return this.#table.table; }

            colInit(tbl, col) {
                if (col.id == 'id') { return false; }
                if (col.id == 'record_id') { return false; }
                if (col.id == 'site_id') { return false; }
                if (col.id == twcSite.Fields.ADDRESS_COUNTY || col.id == twcSite.Fields.SITE_TYPE || col.id == twcSite.Fields.SITE_PORTFOLIO) { return false; }
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

                if (col.id == `${twcSrf.Fields.SRF_STATUS}_text`) {
                    col.styles = { 'text-align': 'center', width: '150px' }
                    col.formatValue = (v) => {
                        return twcSrf.getSrfStatusHtml(v, 'twc-record-status-row');
                    }
                }
                if (col.id == twcSrf.Fields.OPERATOR_SITE_ID) { col.nullText = ''; }

                if (col.id == twcSite.Fields.SITE_LATITUDE || col.id == twcSite.Fields.SITE_LONGITUDE) { col.styles = { 'text-align': 'right' }; }
            }

            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }



        }


        class TWCSpaceRequestItemForm {
            #page = null;
            #srfItem = null;

            #form = null;

            constructor(page, srfItem) {
                this.#page = page;
                this.#srfItem = srfItem;
            }

            get data() { return this.#page.data; }

            render(callback) {
                var res = this.#page.postSync({ action: 'child-record' }, { srf: this.data.siteRequestInfo, item: this.#srfItem })
                this.#form = twcUIPanel.ui(res);
                this.#form.on('change', e => { this.setFormState(e); })
                //if (this.#srfItem.dirty) {
                this.setFormState();
                //}

                this.#form.getControl('srf-pick-from-library').on('click', e => {
                    var itemType = this.#form.getControl(twcSrfItem.Fields.ITEM_TYPE).value;
                    this.pickFromLibrary(this.#srfItem[twcSrfItem.Fields.STEP_TYPE], itemType, (pickedEqLib) => { this.setFormEqLibState(pickedEqLib.e.rowsData[0]) })
                })

                this.#form.getControl('srf-pick-equipment').on('click', e => {
                    this.pickEquipment(this.#srfItem[twcSrfItem.Fields.STEP_TYPE], (pickedEq) => { this.setFormEqState(pickedEq); })
                })

                this.#form.getControl('srf-pick-tme-equipment')?.on('click', e => {
                    this.pickEquipment(twcEqUI.EqClass.TME, (pickedEq) => { this.setFormTmeEqState(pickedEq); })
                })

                var relatedEqTable = this.#form.getControl('srf-related-eq-table');
                if (relatedEqTable) {
                    relatedEqTable.onToolbarClick = e => {
                        var srfNewRelatedItem = null;
                        if (e.action == 'add-new') {
                            var eqClass = jQuery(e.evt.target).parent().data('eq-class');
                            srfNewRelatedItem = {};
                            srfNewRelatedItem.dirty = true;
                            srfNewRelatedItem.child = true;
                            srfNewRelatedItem[twcSrfItem.Fields.REQUEST_TYPE] = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value;
                            srfNewRelatedItem[twcSrfItem.Fields.STEP_TYPE] = eqClass;
                            srfNewRelatedItem[twcSrfItem.Fields.STEP_TYPE + '_name'] = (eqClass == twcEqUI.EqClass.ATME) ? 'ATME' : 'FEEDER';
                            srfNewRelatedItem[twcSrfItem.Fields.STRUCTURE] = this.#form.getControl(twcSrfItem.Fields.STRUCTURE).value;
                            TWCSpaceRequestItemForm.open(this.#page, srfNewRelatedItem, (srfRelatedItem) => {
                                if (!this.#srfItem.relatedItems) { this.#srfItem.relatedItems = []; }
                                this.#srfItem.relatedItems.push(srfNewRelatedItem);
                                relatedEqTable.render(this.#srfItem.relatedItems, true)
                            });
                        } else if (e.action == 'edit') {
                            srfNewRelatedItem = e.rowData;
                            TWCSpaceRequestItemForm.open(this.#page, srfNewRelatedItem, (srfRelatedItem) => {
                                srfRelatedItem.dirty = true;
                                relatedEqTable.render(this.#srfItem.relatedItems, true)
                            })
                        } else if (e.action == 'delete') {
                            dialog.confirm('Are you sure you wish to delete this record', () => {
                                srfNewRelatedItem = e.rowData;
                                if (!this.#srfItem.relatedItemsDelete) { this.#srfItem.relatedItemsDelete = []; }
                                this.#srfItem.relatedItemsDelete.push(srfNewRelatedItem);
                                this.#srfItem.relatedItems.splice(this.#srfItem.relatedItems.indexOf(srfNewRelatedItem), 1);                                
                                relatedEqTable.render(this.#srfItem.relatedItems, true)
                            })
                        }

                    }
                }

                dialog.confirm({ title: 'manage item', message: this.#form.ui, width: '75%', height: '75vh' }, () => {
                    try {
                        var reqType = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value;

                        // @@NOTE: if we have a remove the other panels with controls re not show but if we enforce the validations we'll get all the error about mandatory fields
                        //         this is because the UI mandatory validation checks if the field is hidden, readonly or disabled to avoid validating a field that cannot be edited
                        //         however, it does not check whether the 'container' is visible or not so in this case we skip validation and implement it manually
                        var obj = this.#form.getValues(true, reqType == twcSrfItem.RequestType.REMOVE);

                        if (reqType == twcSrfItem.RequestType.REMOVE) {
                            if (!this.#srfItem[twcSrfItem.Fields.EQUIPMENT_ID]) {
                                throw new Error(`field: <b>Equipment</b> cannot be empty<br />`)
                            }
                        } else {

                            for (var k in obj) {
                                if (obj[k]?.value !== undefined) {
                                    this.#srfItem[k] = obj[k].value;
                                    this.#srfItem[k + '_name'] = obj[k].text;
                                } else {
                                    this.#srfItem[k] = obj[k];
                                }
                            }

                        }
                        this.#srfItem.dirty = true;
                        this.#page.dirty = true

                        callback(this.#srfItem);

                    } catch (error) {
                        dialog.error(error);
                        return false;
                    }
                })
            }


            setFormState(e) {
                if (e === undefined || e.id == twcSrfItem.Fields.REQUEST_TYPE) {
                    var reqType = e === undefined ? this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value : e.value;
                    this.#form.getControl('srf-equipment').hide = (!reqType || reqType == twcSrfItem.RequestType.INSTALL);
                    this.#form.getControl('srf-equipment').mandatory = !(!reqType || reqType == twcSrfItem.RequestType.INSTALL);
                    this.#form.getControl('srf-pick-equipment').hide = (!reqType || reqType == twcSrfItem.RequestType.INSTALL);
                    this.#form.getControl(twcSrfItem.Fields.ITEM_TYPE).hide = (!reqType || reqType == twcSrfItem.RequestType.REMOVE);

                    if (this.#srfItem[twcSrfItem.Fields.STEP_TYPE] == twcEqUI.EqClass.ATME) {
                        if (this.#form.getControl('srf-tme-equipment')) {
                            this.#form.getControl('srf-tme-equipment').hide = (reqType == twcSrfItem.RequestType.REMOVE);
                            this.#form.getControl('srf-tme-equipment').mandatory = !(reqType == twcSrfItem.RequestType.REMOVE);
                            this.#form.getControl('srf-pick-tme-equipment').hide = (reqType == twcSrfItem.RequestType.REMOVE);
                        }
                    }
                }

                if (e === undefined || e?.id == twcSrfItem.Fields.REQUEST_TYPE || e?.id == twcSrfItem.Fields.ITEM_TYPE) {
                    var reqType = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value;
                    var itemType = this.#form.getControl(twcSrfItem.Fields.ITEM_TYPE).value;
                    var showPanels = (reqType != twcSrfItem.RequestType.REMOVE && itemType);

                    var cfg = null; var pickFromLb = false;
                    if (showPanels) {
                        cfg = this.getLLibCfg(this.#srfItem[twcSrfItem.Fields.STEP_TYPE], itemType);
                        showPanels = cfg?.pick_from_library != 'T';
                    }

                    var pickFromLb = cfg?.pick_from_library == 'T';
                    jQuery('#srf-pick-from-library-msg').html(cfg?.user_notes || '')
                    jQuery('#srf-pick-from-library-msg').parent().css('display', cfg?.user_notes ? 'block' : '');

                    this.#form.getControl('srf-pick-from-library').disabled = !pickFromLb;
                    this.#form.getControl('srf-pick-from-library').hide = (reqType == twcSrfItem.RequestType.REMOVE);

                    this.#form.ui.find('#srf-item-dimension').css('display', showPanels ? 'block' : 'none');
                    this.#form.ui.find('#srf-item-spec').css('display', showPanels ? 'block' : 'none');
                    this.#form.ui.find('#srf-related-eq').css('display', showPanels ? 'block' : 'none');

                }

                if (e === undefined) {
                    this.setFormEqState();
                    this.setFormTmeEqState();
                    this.setFormEqLibState();

                }
            }

            setFormEqLibState(pickedEqLib) {
                if (pickedEqLib) { this.#form.getControl(twcSrfItem.Fields.EQUIPMENT_LIBRARY).value = pickedEqLib.id; }

                var reqType = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value;
                if (reqType == twcSrfItem.RequestType.REMOVE) { return; }

                var itemType = this.#form.getControl(twcSrfItem.Fields.ITEM_TYPE).value;
                var cfg = this.getLLibCfg(this.#srfItem[twcSrfItem.Fields.STEP_TYPE], itemType);
                if (!cfg) { return; }

                this.#form.ui.find('#srf-item-dimension').css('display', 'block');
                this.#form.ui.find('#srf-item-spec').css('display', 'block');
                this.#form.ui.find('#srf-related-eq').css('display', 'block');

                var fieldMaps = twcEqLibUI.getLibToEquipmentFieldMap();
                cfg = JSON.parse(cfg.configurations || '[]');
                core.array.each(fieldMaps, fieldMap => {
                    if (fieldMap.tmeOnly && this.#srfItem[twcSrfItem.Fields.STEP_TYPE] != twcEqUI.EqClass.TME) { return; }

                    var fieldCfg = cfg.find(c => { return c.field == fieldMap.eqField; })

                    var eqField = this.#form.getControl(fieldMap.eqField);
                    if (!eqField) { return; }
                    eqField.visible = true;
                    if (fieldCfg || fieldMap.libField == null) {
                        if (fieldCfg?.hide) {
                            eqField.visible = false;
                        } else {
                            eqField.mandatory = !fieldCfg?.notMandatory;
                        }

                        if (fieldCfg?.label) { eqField.label = fieldCfg?.label; }
                    } else {
                        eqField.mandatory = fieldMap.canEdit ? !fieldMap.notMandatory : false;
                        eqField.readOnly = !fieldMap.canEdit;
                        if (pickedEqLib) { eqField.value = pickedEqLib[fieldMap.libField]; }
                    }
                })
            }

            setFormEqState(pickedEq) {
                if (pickedEq) {
                    this.#srfItem.relatedItems = pickedEq.relatedItems;
                    this.#srfItem[twcSrfItem.Fields.REQUEST_TYPE] = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value;
                    this.#srfItem[twcSrfItem.Fields.REQUEST_TYPE + '_name'] = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).valueObj.text;
                    this.#srfItem[twcSrfItem.Fields.EQUIPMENT_ID] = pickedEq.id;
                    this.#srfItem[twcSrfItem.Fields.EQUIPMENT_ID + '_name'] = pickedEq[twcEquipment.Fields.NAME];
                    this.#srfItem[twcSrfItem.Fields.ITEM_TYPE] = pickedEq[twcEquipment.Fields.EQUIPMENT_TYPE];
                    this.#srfItem[twcSrfItem.Fields.ITEM_TYPE + '_name'] = pickedEq[twcEquipment.Fields.EQUIPMENT_TYPE + '_name'];
                    this.#srfItem[twcSrfItem.Fields.DESCRIPTION] = pickedEq[twcEquipment.Fields.DESCRIPTION];
                    this.#srfItem[twcSrfItem.Fields.MAKE] = pickedEq[twcEquipment.Fields.MAKE];
                    this.#srfItem[twcSrfItem.Fields.MODEL] = pickedEq[twcEquipment.Fields.MODEL];
                    this.#srfItem[twcSrfItem.Fields.HEIGHT_ON_TOWER] = pickedEq[twcEquipment.Fields.HEIGHT_ON_TOWER_M];
                    this.#srfItem[twcSrfItem.Fields.LENGTH_MM] = pickedEq[twcEquipment.Fields.LENGTH_MM];
                    this.#srfItem[twcSrfItem.Fields.WIDTH_MM] = pickedEq[twcEquipment.Fields.WIDTH_MM];
                    this.#srfItem[twcSrfItem.Fields.DEPTH_MM] = pickedEq[twcEquipment.Fields.HEIGHTDEPTH_MM];
                    this.#srfItem[twcSrfItem.Fields.WEIGHT_KG] = pickedEq[twcEquipment.Fields.WEIGHT_KG];

                    core.array.each(pickedEq.relatedItems, i => {
                        i[twcSrfItem.Fields.REQUEST_TYPE] = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value;

                        //i[twcSrfItem.Fields.STEP_TYPE] = eqClass;
                        i.dirty = true;
                    })

                }
                this.#form.getControl('srf-equipment').value = this.#srfItem[twcSrfItem.Fields.EQUIPMENT_ID + '_name'] || '';
                this.setFormEqChildren(pickedEq);
            }

            setFormTmeEqState(pickedEq) {
                if (pickedEq) {
                    this.#srfItem[twcSrfItem.Fields.TME_ID] = pickedEq.id;
                    this.#srfItem[twcSrfItem.Fields.TME_ID + '_name'] = pickedEq[twcEquipment.Fields.NAME];
                }
                var ctrl = this.#form.getControl('srf-tme-equipment');
                if (ctrl) { ctrl.value = this.#srfItem[twcSrfItem.Fields.TME_ID + '_name'] || ''; }
                // this.setFormEqChildren(pickedEq);
            }

            setFormEqChildren(pickedEq) {
                // if (!pickedEq) { return; }

                var reqType = this.#form.getControl(twcSrfItem.Fields.REQUEST_TYPE).value;
                if (reqType != twcSrfItem.RequestType.REMOVE) { return; }

                var relatedEqTable = this.#form.getControl('srf-related-eq-table');
                if (relatedEqTable) {
                    relatedEqTable.render(pickedEq?.relatedItems || this.#srfItem.relatedItems, true);
                    relatedEqTable.ui.find('#srf-related-eq-table_toolBar').css('display', 'none')
                    this.#form.ui.find('#srf-related-eq').css('display', 'block');
                }
            }

            getLLibCfg(eqClass, eqType) {
                return this.data.libCfg.find(c => {
                    return c.equipment_class == eqClass && c.equipment_type == eqType;
                })
            }

            pickFromLibrary(eqClass, eqType, callback) {
                try {
                    var fields = twcEqLibUI.getLibTableFields()
                    const onColumnInit = (tbl, col) => {
                        var cf = fields.find(cf => { return cf.field == col.id });
                        if (!cf) { return false; }
                        for (var k in cf) { col[k] = cf[k]; }
                        col.nullText = '';
                    }

                    var container = jQuery(`
                        <div>
                            ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, id: 'twc_eq_lib_search', width: '100%', hint: 'type to search library' })}
                        </div>
                    `);

                    var dlg = dialog.open({ title: 'pick item from library', content: container, size: { width: '60%', height: '70vh' } });
                    var tblContainer = jQuery(`<div style="height: calc(70vh - 150px); overflow: auto;"></div>`);
                    var eqLibTable = new uiTable.TableControl(tblContainer, onColumnInit, { id: 'twc_eq_lib', fitContainer: false, fitScreen: false })
                    eqLibTable.init(this.data.eqLib.filter(el => { return el[twcEqLibUI.Fields.EQUIPMENT_CLASS] == eqClass && el[twcEqLibUI.Fields.EQUIPMENT_TYPE] == eqType }))
                    eqLibTable.table.on('dblclick', e => {
                        try {
                            callback(e);
                            dlg.close();
                        } catch (error) {
                            dialog.error(error);
                        }
                    })
                    container.append(tblContainer);
                    eqLibTable.table.ui.css('overflow', 'unset')

                    container.find('#twc_eq_lib_search').on('input', e => {
                        eqLibTable.table.filter({ src: jQuery(e.currentTarget).val() })
                    })

                } catch (error) {
                    dialog.error(error);
                }
            }

            pickEquipment(eqClass, callback) {
                try {
                    if (!this.data.siteRequestInfo[twcSrf.Fields.CUSTOMER]) { throw new Error('You need to specify a customer'); }

                    var res = this.#page.postSync({ action: 'get-equipment' }, { site: this.data.siteInfo.site.id, customer: this.data.siteRequestInfo[twcSrf.Fields.CUSTOMER], eqClass: eqClass })


                    var fields = twcEqUI.getInventoryTableFields()
                    const onColumnInit = (tbl, col) => {
                        if (col.id == 'id') { return false; }
                        var cf = fields.find(cf => { return cf.field == col.id });
                        if (!cf) { return false; }
                        for (var k in cf) { col[k] = cf[k]; }
                        col.nullText = '';
                    }

                    var container = jQuery(`
                        <div>
                            ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, id: 'twc_eq_search', width: '100%', hint: 'type to search the installed equipment' })}
                        </div>
                    `);


                    var dlg = dialog.open({ title: 'pick item from list', content: container, size: { width: '60%', height: '70vh' } });
                    var tblContainer = jQuery(`<div style="height: calc(70vh - 150px); overflow: auto;"></div>`);
                    var eqTable = new uiTable.TableControl(tblContainer, onColumnInit, { id: 'twc_equipment', fitContainer: false, fitScreen: false })
                    //eqTable.init(this.data.eqLib.filter(el => { return el[twcEqLibUI.Fields.EQUIPMENT_CLASS] == eqClass  }))
                    eqTable.init(res.data);
                    eqTable.table.on('dblclick', async e => {
                        try {
                            var pickedEq = e.e.rowsData[0];
                            if (eqClass == twcEqUI.EqClass.TME) {
                                var res = await this.#page.post({ action: 'get-equipment-children' }, { eq: pickedEq.id })
                                pickedEq.relatedItems = res.data;

                            }

                            callback(pickedEq);
                            dlg.close();
                        } catch (error) {
                            dialog.error(error);
                        }
                    })
                    container.append(tblContainer);
                    eqTable.table.ui.css('overflow', 'unset')

                    container.find('#twc_eq_search').on('input', e => {
                        eqTable.table.filter({ src: jQuery(e.currentTarget).val() })
                    })

                } catch (error) {
                    dialog.error(error);
                }
            }


            static open(page, srfItem, callback) {
                var form = new TWCSpaceRequestItemForm(page, srfItem);
                form.render(callback);
            }

        }

        class TWCSpaceRequestPage extends twcPageBase.TWCPageBase {
            #map = null;
            #sitesTable = null;
            #sitePanel = null;
            #workflowForm = null;
            constructor() {
                super({ scriptId: 'otwc_spaceRequest_sl' });
            }

            initPage() {
                console.log('TWCSpaceRequestPage => InitPage')
                if (this.data.siteRequestInfo) {
                    // @@NOTE: this is record view/edit mode
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });

                    if (this.data.isWorkflowView) {
                        this.#workflowForm = twcSrfWorkflowEngineUI.getForm(this, { srf: this.data.siteRequestInfo.id })
                        this.#workflowForm.render(this.page.find('#twc-site-request-details-panel'));

                    } else {
                        this.ui.getControl('open-workflow-button')?.on('click', e => {
                            location.href = core.url.script('otwc_spacerequest_sl', { recId: this.data.siteRequestInfo.id, wkf: 'T' });
                        });
                        this.ui.getControl('view-workflow-button')?.on('click', e => {
                            this.#workflowForm = twcSrfWorkflowEngineUI.getForm(this, { srf: this.data.siteRequestInfo.id })
                            this.#workflowForm.popUp();
                        })

                        this.ui.getControl('submit-button')?.on('click', e => {
                            dialog.confirmAsync('Are you sure you want to submit this request?').then(() => {
                                this.wait();
                                this.post({ action: 'submit' }, { srf: this.data.siteRequestInfo.id })
                                    .then(res => {
                                        location.reload();
                                    }).catch(err => {
                                        dialog.error(err);
                                        this.waitClose();
                                    });
                            });

                        });
                        this.ui.getControl('accept-srf-approval')?.on('click', e => {
                            dialog.confirmAsync('Are you sure you want to accept this request?').then(() => {
                                this.wait();
                                this.post({ action: 'accept-srf-approval' }, { srf: this.data.siteRequestInfo.id })
                                    .then(res => {
                                        location.reload();
                                    }).catch(err => {
                                        dialog.error(err);
                                        this.waitClose();
                                    });
                            });

                        });

                        this.ui.getControl('cancel-srf-button')?.on('click', e => {
                            dialog.confirmAsync('Are you sure you wish to cancel this SRF?').then(() => {
                                this.data.siteRequestInfo[twcSrf.Fields.SRF_STATUS] = twcUtils.SrfStatus.SRFCancelled;
                                this.data.siteRequestInfo.dirty = true;
                                this.dirty = true;
                                this.onSave(e);
                            });
                        });

                        this.ui.getControl('print-sds')?.on('click', e => { twcSdsEngineUI.printSDS(this, this.data.siteRequestInfo, true) })
                        this.ui.getControl('sign-sds')?.on('click', e => { twcSdsEngineUI.signSDS(this, this.data.siteRequestInfo) })
                        this.ui.getControl('sign-sds-tl')?.on('click', e => { twcSdsEngineUI.signSDSTL(this, this.data.siteRequestInfo) })

                        this.ui.on('change', e => {
                            if (e.target.type != 'table') {
                                this.data.siteRequestInfo[e.id] = e.value;
                                this.dirty = true
                            }
                            if (e.id == twcSrf.Fields.CUSTOMER) {
                                this.post({ action: 'get-customer-site-id' }, { site: this.data.siteRequestInfo[twcSrf.Fields.SITE], customer: e.value }).then(res => {
                                    console.log(res);
                                    this.ui.getControl(twcSrf.Fields.OPERATOR_SITE_ID).value = res;
                                })
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
                                this.ui.getControl(twcSrf.Fields.CUSTOMER).value = 11;
                            }
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
                        if (e.id == 'upload-file') {
                            e.target.readFile(file => {
                                srfFile.fileObject = file;
                                srfFile.name = file.name;
                                form.getControl('name').value = srfFile.name;
                            })
                        } else if (e.id == twcFile.Fields.R_TYPE) {
                            form.getControl(twcFile.Fields.STATUS).setDataSource(e.target.valueObj.allowedStatues);
                        }

                    });

                    dialog.confirm({ title: 'manage file', message: form.ui, width: '600px', height: '410px' }, () => {
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

                    srfItem[twcSrfItem.Fields.STEP_TYPE] = table.id.replace('customrecord_twc_srf_itm_', '');

                    TWCSpaceRequestItemForm.open(this, srfItem, () => {
                        // @@NOTE: if we have anew item then add it to the collection 
                        var itemList = `items_${srfItem.custrecord_twc_srf_itm_stype}`;
                        if (!this.data.siteRequestInfo[itemList]) { this.data.siteRequestInfo[itemList] = table.data; }
                        if (this.data.siteRequestInfo[itemList].indexOf(srfItem) < 0) { this.data.siteRequestInfo[itemList].push(srfItem); }
                        table.render(this.data.siteRequestInfo[itemList], true)
                    })

                } catch (error) {
                    dialog.error(error);
                }
            }


            async onSave(e) {
                try {
                    if (!this.dirty) { if (!confirm('The record has not changed, are you sure you want to submit it anyway?')) { return; } }

                    // @@NOTE: we use getValues just to detect missing mandatory fields
                    this.ui.getValues();
                    if (!this.ui.getControl(twcFile.Type)?.data.length) { throw new Error('You need to attach at least one file'); }
                    var srfItemsCount = 0;
                    for (var k in twcEquipment.StepType) {
                        srfItemsCount += (this.ui.getControl(`${twcSrfItem.Type}_${twcEquipment.StepType[k]}`)?.data.length || 0);
                    }
                    if (srfItemsCount == 0) { throw new Error(`You need to specify at least one item`); }

                    this.wait();

                    var res = await this.post({ action: 'save' }, this.data.siteRequestInfo);
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


