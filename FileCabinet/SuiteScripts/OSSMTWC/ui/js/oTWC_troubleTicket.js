/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../data/oTWC_troubleTickets', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js', './oTWC_siteInfoPanel.js', '../../O/controls/oTWC_ui_ctrl.js','SuiteBundles/Bundle 548734/O/core.base64.js'],
    (core, coreSql, twcPageBase, dialog, twcIcons, twcConfig, twcTkt, uiTable, twcSiteLocatorPanel, twcSiteInfoPanel, twcUI,b64) => {

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
            #tktBuilder = null;
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

                    if (this.data.editMode) {
                        this.#tktBuilder = new TWCTrblTktBuilder(this);
                    } else {
                    this.initTrblTktMode();
                    }
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

                this.ui.find('.twc-preview-file').click(async e => {
                    var file = jQuery(e.currentTarget).data('file')
                    console.log(e.currentTarget.outerHTML)
                    console.log("File",file)
                    await this.previewFile(file, e)
                })
                this.ui.on('change', e => {
                    this.#changes[e.id] = e.value;
                    this.dirty = true
                })

                this.ui.find('#resolve-button').on('click', async (e) => {
                    await this.resolveTicket(recId);
                });
                 this.ui.find('#cancel-ticket-button').on('click', async (e) => {
                    await this.cancelTicket(recId);
                });
                this.ui.getControl('upload-resolution-photo')?.on('click', e => { 
                    console.log("'Uplaod button clicked")
                    this.uploadPhotos(); 
                })
                 this.ui.getControl('tk-submit')?.on('click', e => {
                    console.log("Submit clicked")
                    dialog.confirm('Are you sure you wish to submit the Trouble Ticket?', () => {
                      // this.submitForm();
                       this.onSave(e);
                    })
                })


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

            async cancelTicket(recId) {
                try {
                    await dialog.confirmAsync('Are you sure you want to cancel this ticket?')
                    await this.post({ action: 'cancel-tkt-status' }, recId);
                    location.reload();

                } catch (error) {
                    dialog.error(error);
                }
            }
               #page = null;
            #accessRequirements = null;
            submitForm() {
                try {

                   // this.#page.wait();
                    console.log('this',this)
                    var values = this.ui.getValues();
                    console.log('values',values)
                    var tkt = this.data.trblTktInfo;
                    for (var k in values) { tkt[k] = values[k]; }

                    console.log(tkt);

                     this.post({ action: 'save' }, { tkt: tkt, accessRequirements: this.#accessRequirements }).then(resp => {
                        if (resp.error) {
                            dialog.error(resp.error);
                            return;
                        }

                        this.dirty = false;
                        window.location.href = this.url({ recId: resp.id, err: resp.errors ? 'T' : undefined });

                    }).catch(err => {
                        dialog.error(err);
                        this.#page.waitClose();
                    });

                } catch (error) {
                    dialog.error(error);
                }
            }

            uploadPhotos() {

                var html = jQuery(`
                    <div>
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, id: 'upload-photo-button', value: 'Upload Photo' })}
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.FILE, id: 'upload-photo', accept: '.jpg, .jpeg, .png', hide: true })}
                        <div id="upload-photo-list" class="twc-div-table-r">
                        </div>
                    </div>
                `)

                var photos = [];
                var photoList = html.find('#upload-photo-list');

                var form = twcUI.init({}, html);
                form.getControl('upload-photo-button').on('click', e => {
                    form.getControl('upload-photo').input.click()
                })

                form.getControl('upload-photo').on('change', e => {
                    e.target.readFile(file => {
                        console.log("file",file);
                        photos.push(file);

                        var photoListItem = jQuery(`
                            <div>
                                <div class="photo-upload-status" style="width: 35px;"></div>
                                <div style="width: 250px; white-space: nowrap;">${file.name}</div>
                                <div>
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, id: 'upload-photo-' + photos.length, width: '100%', hint: 'enter some notes if required' })}
                                </div>
                                <div class="twc-clickable" style="width: 35px; text-align: center;">${twcIcons.get('trash', 20, 'red')}</div>
                            </div>
                        `);
                        photoListItem.find('.twc-clickable').click(e => {
                            photoListItem.remove();
                            file.deleted = true;
                        })
                        photoListItem.find('input').change(e => {
                            file.notes = jQuery(e.currentTarget).val().trim();
                        })

                        console.log('Photolist',photoListItem)
                        photoList.append(photoListItem);
                    })
                })

                dialog.open({
                    title: 'Upload Resolution Photos',
                    content: form.ui,
                    size: { width: '1000px', height: '500px' },
                    ok: (dlg) => {
                        console.log('pic',photos);

                        this.uploadPhoto(photoList, photos, 0, () => {
                            var errors = photos.filter(p => { return p.error !== undefined; })
                            if (errors.length > 0) {
                                var errorHtml = '';
                                core.array.each(errors, e => { errorHtml += `<b>${e.name}</b>: ${e.error.error}<hr />`; });
                                dialog.error(errorHtml, () => { location.reload(); });
                                return;
                            }

                           // this.postSync({ action: 'edit-saf-status' }, { saf: this.data.siteAccessInfo.id, status: twcSaf.Status.PhotosReceived });

                            dlg.close();
                            location.reload();
                        });


                        return false;
                    }
                });

            }

            uploadPhoto(photoList, photos, idx, callback) {
                console.log('Photolist in upload',photoList)
                console.log('photos in upload',photos)

                if (photos[idx] === undefined) {
                    callback();
                    return;
                }

                var photoListItem = photoList.find('.photo-upload-status').eq(idx);
                photoListItem.html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 16)}</span>`);

                if (photos[idx].deleted) {
                    this.uploadPhoto(photoList, photos, idx + 1, callback);
                    return;
                }
  console.log('this.data.data.ticketInfo.id',this.data.trblTktInfo.id)
                this.post({ action: 'upload-tkt-photo' }, { tkt: this.data.trblTktInfo.id, photo: photos[idx] }).then(resp => {
                    if (resp.error) {
                        photoListItem.html(twcIcons.get('exclamation', 16, 'red'));
                        photos[idx].error = resp;
                    } else {
                        photoListItem.html(twcIcons.get('shieldCheck', 16, 'lime'));
                    }

                    this.uploadPhoto(photoList, photos, idx + 1, callback);


                }).catch(err => {
                    photoListItem.html(twcIcons.get('exclamation', 16, 'red'));
                    photos[idx].error = err;
                    this.uploadPhoto(photoList, photos, idx + 1, callback);
                });
            }



            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    var payload = this.#changes;
                    payload.id = window.twc.page.data.recId
                    console.log("site",window.twc.page.data.siteInfo.site )

                    payload.siteId=window.twc.page.data.siteInfo.site.id

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

         class TWCTrblTktBuilder {
             #page = null;
            #accessRequirements = null;
              constructor(page) {
                this.#page = page;
                this.init();
            }
              init() {
                //  this.ui.getControl('tk-submit').on('click', e => {
                //     console.log("Submit clicked")
                //     dialog.confirm('Are you sure you wish to submit the Access Request?', () => {
                //         this.submitForm();
                //     })
                // })
              }
                // submitForm() {
                // try {

                //     this.#page.wait();

                //     var values = this.ui.getValues();
            //         var tkt = this.data.trblTktInfo;
            //         for (var k in values) { tkt[k] = values[k]; }

            //         console.log(tkt);


            //        // this.#page.post({ action: 'save-new-tkt' }, { tkt: tkt, accessRequirements: this.#accessRequirements, conditionsOfAccessHtml: b64.encode(this.refreshInfo(true)) }).then(resp => {
            //         this.#page.post({ action: 'save-new-tkt' }, { tkt: tkt, accessRequirements: this.#accessRequirements }).then(resp => {
 
            //         if (resp.error) {
            //                 dialog.error(resp.error);
            //                 return;
            //             }

            //             this.#page.dirty = false;
            //             window.location.href = this.#page.url({ recId: resp.id, err: resp.errors ? 'T' : undefined });

            //         }).catch(err => {
            //             dialog.error(err);
            //             this.#page.waitClose();
            //         });

            //     } catch (error) {
            //         dialog.error(error);
            //     }
            // }
         }
        return {

            init: function () {
                twcPageBase.init(new TWCTroubleTicketPage())
            }


        }
    });
