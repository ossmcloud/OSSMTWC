/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../O/controls/oTWC_ui_fieldPanel.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../data/oTWC_profile.js', '../../data/oTWC_file.js', '../../data/oTWC_utils.js'],
    (core, coreSql, b64, twcPageBase, dialog, twcUIPanel, twcConfig, twcIcons, twcProfile, twcFile, twcUtils) => {


        class TWCCompanyProfilePage extends twcPageBase.TWCPageBase {
            #changes = {};
            constructor() {
                super({ scriptId: 'otwc_companyprofile_sl' });


            }

            initPreviewFileEvents() {
                this.ui.getControl(twcFile.Type).ui.find('.twc-preview-file').click(async e => {
                    var file = jQuery(e.currentTarget).data('file')
                    await this.previewFile(file, e)
                })
            }
            initFileFormatValueColumns(table) {
                const formatValue = (v, fv, d) => {
                    return twcUtils.getFileStatusHtml(d[twcFile.Fields.STATUS], 'twc-record-status-row')
                }
                table.getColumn(twcFile.Fields.STATUS + '_name').formatValue = formatValue;
                table.getColumnOption(twcFile.Fields.STATUS + '_name').formatValue = formatValue;
            }

            initProfileFormatValueColumns(table) {
                const formatValue = (v, fv, d, col) => {
                    return twcProfile.getCertStatusHtml(v, d[col.id.replace('_sts_name', '_exp')])
                }
                this.initProfileFormatValueColumn(table, twcProfile.Fields.CLIMBER_CERTIFIED_STATUS, formatValue);
                this.initProfileFormatValueColumn(table, twcProfile.Fields.RESCUE_CERTIFIED_STATUS, formatValue);
                this.initProfileFormatValueColumn(table, twcProfile.Fields.RF_CERTIFIED_STATUS, formatValue);
                this.initProfileFormatValueColumn(table, twcProfile.Fields.ROOFTOP_CERTIFIED_STATUS, formatValue);
                this.initProfileFormatValueColumn(table, twcProfile.Fields.ELECTRICIAN_CERTIFIED_STATUS, formatValue);
                this.initProfileFormatValueColumn(table, twcProfile.Fields.DRONE_CERTIFIED_STATUS, formatValue);
                this.initProfileFormatValueColumn(table, twcProfile.Fields.SAFE_PASS_STATUS, formatValue);

            }
            initProfileFormatValueColumn(table, fieldId, formatValue) {
                table.getColumn(fieldId + '_name').formatValue = formatValue;
                table.getColumnOption(fieldId + '_name').formatValue = formatValue;
            }

            initPage() {
                this.initFileFormatValueColumns(this.ui.getControl(twcFile.Type));
                this.initProfileFormatValueColumns(this.ui.getControl(twcProfile.Type));

                this.initPreviewFileEvents();
                this.ui.getControl(twcFile.Type).onInitEvents = (tbl) => {
                    this.initPreviewFileEvents();
                }

                this.ui.getControl(twcProfile.Type).onToolbarClick = e => {
                    if (e.action == 'add-new') {
                        this.manageProfile(null, e.table);
                    } else if (e.action == 'edit') {
                        var editSpan = e.row.find('[data-action="edit"]');
                        var editIcon = editSpan.html();
                        editSpan.html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 16)}</span>`);
                        window.setTimeout(() => {
                            this.manageProfile(e.rowData, e.table);
                            editSpan.html(editIcon);
                        }, 100)
                    } else if (e.action == 'delete') {
                        dialog.confirm('Are you sure you wish to delete this record', () => {
                            e.rowData.delete = true;
                            this.manageProfile(e.rowData, e.table);
                        })
                    }
                }

                this.ui.getControl(twcFile.Type).onToolbarClick = e => {

                    if (e.action == 'add-new') {
                        this.manageFile(null, e.table);
                    } else if (e.action == 'edit') {
                        var editSpan = e.row.find('[data-action="edit"]');
                        var editIcon = editSpan.html();
                        editSpan.html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 16)}</span>`);
                        window.setTimeout(() => {
                            this.manageFile(e.rowData, e.table);
                            editSpan.html(editIcon);
                        }, 100)
                    } else if (e.action == 'delete') {
                        dialog.confirm('Are you sure you wish to delete this record', () => {
                            e.rowData.delete = true;
                            this.manageFile(e.rowData, e.table);
                        })
                    }
                }

                this.ui.on('change', e => {
                    this.#changes[e.id] = e.value;
                    this.dirty = true
                })


            }

            uploadDocument() {
                try {

                    throw new Error('under development')

                } catch (error) {
                    dialog.error(error);
                }
            }

            manageProfile(profile, table) {
                try {

                    if (!profile) { profile = {}; }
                    if (this.deleteRecord(profile, table)) { return; }

                    var res = this.postSync({ action: 'child-record' }, { company: this.data.profileInfo, profile: profile })
                    var form = twcUIPanel.ui(res.ui);

                    form.on('click', e => {
                        if (e.target.type == 'button') {
                            if (e.target.id.startsWith('view-file')) {
                                this.previewFile(e.target.id.replace('view-file-', ''));
                            } else if (e.target.id.startsWith('upload-file')) {
                                jQuery('#' + e.target.id.replace('upload-file', 'upload-file-input')).click();
                            }
                        }
                    });

                    form.on('change', e => {
                        if (e.target.type == 'file') {
                            e.target.readFile(file => {
                                var certType = e.target.id.replace('upload-file-input-', '');
                                if (!profile.certs) { profile.certs = {}; }
                                profile.certs[certType] = file;
                                form.getControl(`${certType}_file_name`).value = file.name;
                                form.getControl(`custrecord_twc_prof_${certType}_cert_exp`).value = '';
                                form.getControl(`custrecord_twc_prof_${certType}_cert_sts`).value = twcUtils.NoActiveExpired.Pending;
                            })
                        }
                    });

                    dialog.confirm({ title: profile.id ? 'manage company profile' : 'new company profile', message: form.ui, width: '75%', height: '70hv' }, (dlg) => {
                        try {
                            var obj = form.getValues(true);
                            for (var k in obj) {
                                if (k == 'name') { continue; }
                                if (obj[k]?.value !== undefined) {
                                    profile[k] = obj[k].value;
                                    profile[k + '_name'] = obj[k].text;
                                } else {
                                    profile[k] = obj[k];
                                }
                            }

                            dialog.wait(dlg);
                            window.setTimeout(() => {
                                try {
                                    var res = this.postSync({ action: 'save-child-record' }, { company: this.data.profileInfo, profile: profile });
                                    profile.id = res.id;
                                    for (var k in res.record) { profile[k] = res.record[k]; }

                                    if (!this.data.profileInfo.profiles) { this.data.profileInfo.profiles = table.data; }
                                    if (this.data.profileInfo.profiles.indexOf(profile) < 0) { this.data.profileInfo.profiles.unshift(profile); }
                                    table.render(this.data.profileInfo.profiles, true)

                                    dlg.close();
                                } catch (error) {
                                    dialog.waitClose(dlg);
                                    dialog.error(error);
                                }

                            }, 150)

                            return false;

                        } catch (error) {
                            dialog.error(error);
                            return false;
                        }
                    })



                } catch (error) {
                    dialog.error(error);
                }
            }

            manageFile(companyFile, table) {
                try {
                    if (!companyFile) { companyFile = {}; }
                    if (this.deleteRecord(companyFile, table)) { return; }

                    var res = this.postSync({ action: 'child-record' }, { company: this.data.profileInfo, document: companyFile })
                    var form = twcUIPanel.ui(res.ui);
                    form.getControl('upload-file').on('change', e => {
                        e.target.readFile(file => {
                            companyFile.fileObject = file;
                            companyFile.name = file.name;
                            form.getControl(twcFile.Fields.NAME).value = file.name;
                        })
                    });

                    dialog.confirm({ title: companyFile.id ? 'manage company document' : 'new company document', message: form.ui, width: '750px', height: '400px' }, (dlg) => {
                        try {
                            var obj = form.getValues(true);
                            for (var k in obj) {
                                if (k == 'name') { continue; }
                                if (obj[k]?.value !== undefined) {
                                    companyFile[k] = obj[k].value;
                                    companyFile[k + '_name'] = obj[k].text;
                                } else {
                                    companyFile[k] = obj[k];
                                }
                            }

                            if (!companyFile.id && !companyFile.fileObject) { throw new Error('You need to pick a file'); }

                            dialog.wait(dlg);
                            window.setTimeout(() => {
                                try {
                                    var res = this.postSync({ action: 'save-child-record' }, { company: this.data.profileInfo, document: companyFile });
                                    if (!companyFile.id) { companyFile.created = (new Date()).format(); }
                                    companyFile.id = res.id;
                                    companyFile.preview_link = twcUtils.getFilePreviewLink(res.fileId);
                                    for (var k in res.record) { companyFile[k] = res.record[k]; }
                                    if (!this.data.profileInfo.files) { this.data.profileInfo.files = table.data; }
                                    if (this.data.profileInfo.files.indexOf(companyFile) < 0) { this.data.profileInfo.files.unshift(companyFile); }
                                    table.render(this.data.profileInfo.files, true)
                                    dlg.close();
                                } catch (error) {
                                    dialog.waitClose(dlg);
                                    dialog.error(error);
                                }
                            }, 150)

                            return false;
                        } catch (error) {
                            dialog.error(error);
                            return false;
                        }
                    })

                } catch (error) {
                    dialog.error(error);
                }
            }

            deleteRecord(srfRecord, table) {
                var deleteRecordCollectionName = table.id == twcFile.Type ? 'files_deleted' : 'profiles_deleted';
                if (srfRecord.delete) {
                    if (srfRecord.id) {
                        if (!this.data.profileInfo[deleteRecordCollectionName]) { this.data.profileInfo[deleteRecordCollectionName] = []; }
                        this.data.profileInfo[deleteRecordCollectionName].push(srfRecord);
                    }
                    table.data.splice(table.data.indexOf(srfRecord), 1);
                    table.render(table.data, true);
                    this.dirty = true
                    return true;
                }
            }


            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    var payload = this.#changes;
                    payload.id = this.data.profileInfo.id;

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
                twcPageBase.init(new TWCCompanyProfilePage())
            }


        }
    });
