/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../data/oTWC_troubleTickets.js', '../../O/controls/oTWC_ui_table.js', './oTWC_siteLocatorPanel.js', './oTWC_siteInfoPanel.js', '../../O/controls/oTWC_ui_ctrl.js', '../../O/controls/oTWC_ui_fieldPanel.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_file.js','../../data/oTWC_troubleTicketsUI.js'],
    (core, coreSql, twcPageBase, dialog, twcIcons, twcConfig, twcTkt, uiTable, twcSiteLocatorPanel, twcSiteInfoPanel, twcUI, twcUIPanel, b64, twcFile,twcTroubleTicketsUI) => {

        var _tktLink = null;
        var txt = ''
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
                if (col.id == 'id') { return false; }
                if (col.id == 'record_id') { return false; }
                if (col.id == 'site_id') { return false; }

                var uf = window.twc.page.data.ticketsInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
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
            #resFiles = []
            constructor() {
                super({ scriptId: 'otwc_troubleticket_sl' });
            }

            initPage() {
                if (this.data.ticketsInfo) {
                    this.#sitesTable = new TWCTicketTable(this);
                    this.#sitePanel = twcSiteLocatorPanel.get({ page: this, table: this.#sitesTable, data: window.twc.page.data.ticketsInfo.sites, tableData: window.twc.page.data.ticketsInfo.tickets });
                } else {
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });
                    this.initTrblTktMode();
                }
            }

            initTrblTktMode() {
                this.ui.find('.twc-preview-file')?.click(async e => {
                    var file = jQuery(e.currentTarget).data('file')
                    await this.previewFile(file, e)
                })
                this.ui.on('change', e => {
                    try {
                        this.#changes[e.id] = e.value;
                        this.dirty = true

                        if (e.id == twcTkt.Fields.ASSIGNED_TO_COMPANY) {
                            this.post({ action: 'get-company-profile' }, { company: e.value })
                                .then(res => {
                                    this.ui.getControl(twcTkt.Fields.ASSIGNED_TO).setDataSource(res.data);
                                    this.ui.controls.find(c => { return c.id == twcTkt.Fields.ASSIGNED_TO }).dataSource = res.data;
                                })
                                .catch(err => { dialog.error(err); });
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
                //this.ui.getControl(twcFile.Type).onToolbarClick = e => {
                var fileCtrl = this.ui.getControl(twcFile.Type);
                if (fileCtrl) {
                    fileCtrl.onToolbarClick = e => {
                        if (e.action == 'edit') {
                            this.manageFile(e.rowData, e.table);

                        } else if (e.action == 'delete') {
                            dialog.confirm('Are you sure you wish to delete this resoltuion image', () => {
                                e.rowData.delete = true;
                                this.manageFile(e.rowData, e.table);
                            })
                        }
                    }
                }

                this.ui.find('#resolve-button').on('click', async (e) => {
                    await this.resolveTicket();
                });
                this.ui.find('#cancel-ticket-button').on('click', async (e) => {
                    await this.cancelTicket();
                });
                this.ui.getControl('upload-resolution-photo')?.on('click', e => {
                    txt = 'T'
                    this.uploadPhotos();
                })
                this.ui.getControl('tk-submit')?.on('click', e => {
                    dialog.confirm('Are you sure you wish to submit the Trouble Ticket?', () => {
                        this.onSave(e);
                    })
                })
                this.ui.getControl('tk-add-file')?.on('click', e => {
                    this.uploadPhotos();
                })

            }


            async cancelTicket() {
                var formConfig = {
                    controls: [
                        {
                            type: twcUI.CTRL_TYPE.TEXTAREA,
                            id: twcTkt.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE,
                            value: '',
                            width: '100%',
                            rows: 7
                        },
                    ]
                };

                var form = twcUI.init(formConfig);

                dialog.open({
                    title: 'Cancel Ticket',
                    content: form.ui,
                    size: { width: '500px', height: '300px' },
                    ok: () => {
                        try {
                            this.wait();

                            var payload = form.getValues();
                            payload.tkt = this.data.trblTktInfo.id

                            if (!payload[twcTkt.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE] || !payload[twcTkt.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE].trim()) {
                                throw new Error('Please specify a comment');
                            }

                            this.post({ action: 'cancel-tkt-status' }, payload).then(resp => {
                                if (resp.error) {
                                    this.waitClose();
                                    dialog.error(resp.error);
                                    return;
                                }
                                location.reload();
                            }).catch(err => {
                                dialog.error(err);
                                this.waitClose();
                            });

                            return true;

                        } catch (error) {
                            this.waitClose();
                            dialog.error(error);
                            return false;
                        }
                    }
                });
            }


            async resolveTicket() {

                let rec = twcTkt.get(this.data.trblTktInfo.id);
                let tktCategory = rec.category;

                if (tktCategory) {
                    var isResPicReq = this.reqResPhotos(this.data.trblTktInfo.id)

                    if (isResPicReq == false) {
                        dialog.error("Please add Resoltuion Image to resolve the ticket!!")
                        return
                    }
                }

                var formConfig = {
                    controls: [
                        {
                            type: twcUI.CTRL_TYPE.TEXTAREA,
                            id: twcTkt.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE,
                            label: 'Comment',
                            value: '',
                            width: '100%',
                            rows: 7
                        },
                        {
                            type: twcUI.CTRL_TYPE.DATE,
                            id: twcTkt.Fields.SCHEDULED_COMPLETION_DATE,
                            label: 'Scheduled Date',
                            value: '',
                            lineBreak: true
                        },
                        {
                            type: twcUI.CTRL_TYPE.DATE,
                            label: 'Corrective Action Date',
                            id: twcTkt.Fields.CORRECTIVE_ACTION,
                            value: '',
                            lineBreak: true
                        }
                    ]
                };

                var form = twcUI.init(formConfig);

                dialog.open({
                    title: 'Resolve Ticket',
                    content: form.ui,
                    size: { width: '500px', height: '350px' },
                    ok: () => {
                        try {
                            this.wait();

                            var payload = form.getValues();
                            payload.tkt = this.data.trblTktInfo.id;

                            if (!payload[twcTkt.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE] || !payload[twcTkt.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE].trim()) {
                                throw new Error('Please specify a comment');
                            }

                            if (!payload[twcTkt.Fields.SCHEDULED_COMPLETION_DATE]) {
                                throw new Error('Please select scheduled Date');
                            }

                            if (!payload[twcTkt.Fields.CORRECTIVE_ACTION]) {
                                throw new Error('Please select Corrective Action Date');
                            }


                            this.post({ action: 'resolve-tkt-status' }, payload).then(resp => {
                                if (resp.error) {
                                    this.waitClose();
                                    dialog.error(resp.error);
                                    return;
                                }
                                location.reload();
                            }).catch(err => {
                                dialog.error(err);
                                this.waitClose();
                            });

                            return true;

                        } catch (error) {
                            this.waitClose();
                            dialog.error(error);
                            return false;
                        }
                    }
                });
            }

            reqResPhotos(tktId) {
                //    var tktInfo = coreSql.first(`
                //         select distinct t.id
                //         from ${twcTkt.Type} t
                //         join customrecord_twc_trbl_tkt_category cat
                //         on cat.id = t.custrecord_twc_trbl_tkt_category
                //         left join customrecord_twc_file f
                //         on f.custrecord_twc_file_recid = t.id
                //         and f.isinactive = 'F'
                //         and f.custrecord_twc_file_rectype = '${twcTkt.Type}'
                //         where t.id = ${tktId}
                //         and cat.custrecord_twc_trbl_tkt_requires_res_pic = 'T'
                //         and f.id is null
                //     `);
                var tktInfo = coreSql.first(`
                    select distinct t.id
                    from ${twcTkt.Type} t
                    join customrecord_twc_trbl_tkt_category cat
                        on cat.id = t.custrecord_twc_trbl_tkt_category

                    left join customrecord_twc_file f
                        on f.custrecord_twc_file_recid = t.id
                    and f.isinactive = 'F'
                    and f.custrecord_twc_file_rectype = '${twcTkt.Type}'

                    where t.id = ${tktId}
                    and (
                            nvl(cat.custrecord_twc_trbl_tkt_requires_res_pic, 'F') = 'F'
                            or f.id is not null
                        )
                `);

                return !!tktInfo
            }

            manageFile(tktfFile, table) {
                try {
                    if (!tktfFile) { tktfFile = {}; }
                    if (this.deleteRecord(tktfFile, table)) { return; }

                    var res = this.postSync({ action: 'edit-file' }, { tkt: this.data.trblTktInfo, file: tktfFile })
                    res.controls.find(c => { return c.id == 'upload-file' }).hide = true;
                    res.controls.find(c => { return c.id == twcFile.Fields.R_TYPE }).readOnly = true;
                    res.controls.find(c => { return c.id == twcFile.Fields.STATUS }).hide = true;

                    var form = twcUIPanel.ui(res);
                    form.on('change', e => {
                        if (e.id == 'name') {
                            e.target.readFile(file => {
                                tktfFile.fileObject = file;
                                tktfFile.name = file.name;
                            })
                        }
                    });

                    dialog.confirm({ title: 'manage file', message: form.ui, width: '600px', height: '400px' }, () => {
                        try {
                            var obj = form.getValues(true);
                            for (var k in obj) {
                                // if (k == 'name') { continue; }
                                if (obj[k]?.value !== undefined) {
                                    tktfFile[k] = obj[k].value;
                                    tktfFile[k + '_name'] = obj[k].text;
                                } else {
                                    tktfFile[k] = obj[k];
                                }
                            }
                            tktfFile.dirty = true;

                            if (!this.data.trblTktInfo.files) { this.data.trblTktInfo.files = table.data; }
                            if (this.data.trblTktInfo.files.indexOf(tktfFile) < 0) { this.data.trblTktInfo.files.push(tktfFile); }

                            table.render(this.data.trblTktInfo.files, true)

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

            deleteRecord(tktRecord, table) {
                if (tktRecord.delete) {

                    if (tktRecord.id) {
                        if (!this.data.trblTktInfo['files_deleted']) { this.data.trblTktInfo['files_deleted'] = []; }
                        this.data.trblTktInfo['files_deleted'].push(tktRecord);
                    }
                    table.data.splice(table.data.indexOf(tktRecord), 1);
                    table.render(table.data, true);
                    this.dirty = true
                    return true;
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

                        if (!this.data?.trblTktInfo?.id) {
                            this.#resFiles = photos;
                            dlg.close();

                                refreshOpenPicturesTable.call(this, photos);

                            return;
                        }

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
                            // location.reload();

                            console.log("ID", this.data.trblTktInfo.id)
                            if (this.data?.trblTktInfo?.id) {
                                location.reload();
                            } else {
                                var html = `<html><body><h2 id="msg">Image(s) Uploaded Successfully</h2><script>var count=0;var interval=setInterval(function(){count++;document.getElementById("msg").innerHTML="Image(s) Uploaded Successfully"+".".repeat(count);if(count===3){clearInterval(interval);}},500);</script></body></html>`;
                                dialog.message({
                                    title: 'Resolution Image',
                                    message: html,
                                    size: { width: '450px', height: '20vh' }
                                })
                            }
                        });


                        return false;
                    }
                });

            }

            uploadPhoto(photoList, photos, idx, callback) {
                // if (!this.data?.trblTktInfo?.id) {
                //     if (photos[idx]?.deleted) {

                //         photos.splice(idx, 1);
                //         this.#resFiles = photos;
                //         return;
                //     }
                //     this.#resFiles = photos
                //     return;
                // }

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

                this.post({ action: 'upload-tkt-photo' }, { tkt: this.data.trblTktInfo.id, txt, photo: photos[idx] }).then(resp => {
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

                    //throw new Error(JSON.stringify(this.data))
                    var resFilesAdded = this.#resFiles

                    var payload = this.#changes;

                    payload.id = window.twc.page.data.recId
                    payload.siteId = window.twc.page.data.siteInfo.site.id
                    payload.files_deleted = this.data.trblTktInfo['files_deleted']
                    payload.files_edited = this.data.trblTktInfo['files']
                    payload.newFiles = resFilesAdded
                    // throw new Error(JSON.stringify(payload))
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

     
        function refreshOpenPicturesTable(photos) {

            const existingCount =
                (this.data.trblTktInfo.tempOpenFiles || []).length;

            const newFiles = photos.map((p, idx) => ({
                created: new Date().toLocaleString(),
                name: p.name,
                custrecord_twc_file_type_name: p.type,
                custrecord_twc_file_description: p.notes,
                preview_link: "",
                _fileObj: p
            }));

            this.data.trblTktInfo.tempOpenFiles = [
                ...(this.data.trblTktInfo.tempOpenFiles || []),
                ...newFiles
            ];

            this.data.trblTktInfo.type = 'customrecord_twc_trbl_tkt'

            const newPanel = twcTroubleTicketsUI.getTKOpenPictures(
                this.data.trblTktInfo,
                this.userInfo
            );

            console.log('newPanel', newPanel);

            const panelEl = jQuery('#trbl-tkts-files');

            if (!panelEl.length) {
                console.log('Panel not found');
                return;
            }

            panelEl.empty();

            twcUI.init(newPanel.controls[0], panelEl);
            panelEl.find('[data-action="edit"]').hide();

            panelEl.find('[data-action="delete"]').off('click').on('click', e => {
                const row = jQuery(e.currentTarget).closest('.o-row');
                const idx = row.data('idx');
                this.data.trblTktInfo.tempOpenFiles.splice(idx, 1);
                photos.splice(idx, 1);
                this.resFiles = photos;

                refreshOpenPicturesTable.call(
                    this,
                    []
                );
            });
        }

        // function refreshOpenPicturesTable(photos = []) {

        //     const newFiles = photos.map((p) => ({
        //         created: new Date().toLocaleString(),
        //         name: p.name,
        //         custrecord_twc_file_type_name: p.type,
        //         custrecord_twc_file_description: p.notes,
        //         preview_link: "",
        //         _fileObj: p
        //     }));

        //     this.data.trblTktInfo.tempOpenFiles = [...newFiles];
        //     this.data.trblTktInfo.type = 'customrecord_twc_trbl_tkt';

        //     const newPanel = twcTroubleTicketsUI.getTKOpenPictures(
        //         this.data.trblTktInfo,
        //         this.userInfo
        //     );

        //     const panelEl = jQuery('#trbl-tkts-files');

        //     if (!panelEl.length) return;

        //     panelEl.empty();

        //     if (!newPanel || !newPanel.controls || !newPanel.controls.length) {
        //         console.log('Invalid panel structure', newPanel);
        //         return;
        //     }

        //     twcUI.init(newPanel.controls[0], panelEl);

        //     panelEl.find('[data-action="edit"]').hide();

        //     panelEl.find('[data-action="delete"]').off('click').on('click', e => {
        //         const row = jQuery(e.currentTarget).closest('.o-row');
        //         const idx = row.data('idx');

        //         photos.splice(idx, 1);
        //         this.#resFiles = photos;

        //         refreshOpenPicturesTable.call(this, photos);
        //     });
        // }

        return {

            init: function () {
                twcPageBase.init(new TWCTroubleTicketPage())
            }


        }
    });
