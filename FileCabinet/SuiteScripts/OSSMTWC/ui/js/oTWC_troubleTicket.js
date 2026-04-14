/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../data/oTWC_troubleTickets.js', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js', './oTWC_siteInfoPanel.js', '../../O/controls/oTWC_ui_ctrl.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_file.js'],
    (core, coreSql, twcPageBase, dialog, twcIcons, twcConfig, twcTkt, uiTable, twcSiteLocatorPanel, twcSiteInfoPanel, twcUI, b64, twcFile) => {

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
                // unboundCols.push({
                //     id: 'open_tkt', title: '', unbound: true,
                //     styles: { 'text-align': 'center' },
                //     noSort: true,
                //     sortIdx: 0,
                //     initValue: (d) => {
                //         return `<a href="${ticketViewLink(d.id)}">View</a>`;
                //     }
                // })
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
                //console.log('col', col.id)
                if (col.id == 'id') { return false; }
                if (col.id == 'record_id') { return false; }
                if (col.id == 'site_id') { return false; }

                var uf = window.twc.page.data.ticketsInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                //console.log('uf', uf)
                if (uf) {
                    col.title = uf.label;
                    if (uf.type) { col.type = uf.type; }
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                }

                if (col.id == 'name') {
                    col.title = 'Trouble Ticket ID';
                    col.addCount = true;
                    col.link = {
                        url: core.url.script('oTWC_troubleTicket_sl') + '&recId=${id}',
                        valueField: 'id'
                    }
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

                if (col.id == twcTkt.Fields.SITE_LATITUDE || col.id == twcTkt.Fields.SITE_LONGITUDE) { col.styles = { 'text-align': 'right' }; }

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
                if (this.data.ticketsInfo) {
                    this.#sitesTable = new TWCTicketTable(this);
                    this.#sitePanel = twcSiteLocatorPanel.get({ page: this, table: this.#sitesTable, data: window.twc.page.data.ticketsInfo.sites, tableData: window.twc.page.data.ticketsInfo.tickets });
                } else {
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });
                    this.initTrblTktMode();
                }
            }

            initTrblTktMode() {
                this.ui.find('.twc-preview-file').click(async e => {
                    var file = jQuery(e.currentTarget).data('file')
                    await this.previewFile(file, e)
                })
                this.ui.on('change', e => {
                    try {
                        this.#changes[e.id] = e.value;
                        this.dirty = true

                        if (e.id == e.id == twcTkt.Fields.ASSIGNED_TO_COMPANY) {
                            // @@TODO: JESNA: load profile associated to the company
                            //  see FileCabinet\SuiteScripts\OSSMTWC\ui\js\oTWC_siteAccess.js @ line 510
                        }

                        if (e.id == twcTkt.Fields.CATEGORY || e.id == twcTkt.Fields.PRIORITY || e.id == twcTkt.Fields.ASSIGNED_TO || e.id == twcTkt.Fields.ASSIGNED_TO_COMPANY) {
                            if (!this.data.trblTktInfo[twcTkt.Fields.ASSESSED]) {
                                this.ui.getControl(twcTkt.Fields.ASSESSED).value = (new Date()).format();
                            }
                        }
                    } catch (error) {
                        dialog.error(error);
                    }
                })
                this.ui.getControl(twcFile.Type).onToolbarClick = e => {
                    if (e.action == 'edit') {
                        this.manageFile(e.rowData, e.table);

                    } else if (e.action == 'delete') {
                        dialog.confirm('Are you sure you wish to delete this record', () => {
                            e.rowData.delete = true;
                            this.manageFile(e.rowData, e.table);
                        })
                    }
                }

                this.ui.find('#resolve-button').on('click', async (e) => {
                    await this.resolveTicket();
                });
                this.ui.find('#cancel-ticket-button').on('click', async (e) => {
                    await this.cancelTicket();
                });
                this.ui.getControl('upload-resolution-photo')?.on('click', e => {
                    this.uploadPhotos();
                })
                this.ui.getControl('tk-submit')?.on('click', e => {
                    dialog.confirm('Are you sure you wish to submit the Trouble Ticket?', () => {
                        this.onSave(e);
                    })
                })

            }

            async resolveTicket() {
                try {
                    await dialog.confirmAsync('Are you sure you want to resolve this ticket?')
                    await this.post({ action: 'resolve-tkt-status' }, this.data.trblTktInfo.id);
                    location.reload();

                } catch (error) {
                    dialog.error(error);
                }
            }

            async cancelTicket() {
                try {
                    await dialog.confirmAsync('Are you sure you want to cancel this ticket?')
                    await this.post({ action: 'cancel-tkt-status' }, this.data.trblTktInfo.id);
                    location.reload();

                } catch (error) {
                    dialog.error(error);
                }
            }


            manageFile(rowData, table) {

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
                        console.log("file", file);
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

                        console.log('Photolist', photoListItem)
                        photoList.append(photoListItem);
                    })
                })

                dialog.open({
                    title: 'Upload Resolution Photos',
                    content: form.ui,
                    size: { width: '1000px', height: '500px' },
                    ok: (dlg) => {
                        console.log('pic', photos);

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
                console.log('Photolist in upload', photoList)
                console.log('photos in upload', photos)

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
                console.log('this.data.data.ticketInfo.id', this.data.trblTktInfo.id)
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
                    payload.siteId = window.twc.page.data.siteInfo.site.id

                    var resp = await this.post({ action: 'save' }, payload);
                    this.dirty = false;

                    location.href = (resp.id) ? this.url({ recId: resp.id }) : location.href.replace('&edit=T', '');

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
