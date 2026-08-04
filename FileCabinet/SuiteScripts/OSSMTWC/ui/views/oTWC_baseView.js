/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/email', 'N/url', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.https.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../O/oTWC_themes.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../O/oTWC_dialogEx.js', '../../O/controls/oTWC_ui_ctrl.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_permissions.js', '../../data/oTWC_file.js', '../../O/controls/oTWC_ui_fieldPanel.js' ],
    (email, url, core, https, b64, twcThemes, twcIcons, twcConfig, dialog, twcUI, uiTable, permissions, twcFile, twcUIPanel) => {

        function base64ToBlob(base64, mimeType) {
            const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
            const byteChars = atob(base64Data);
            const byteArray = Uint8Array.from(byteChars, c => c.charCodeAt(0));
            return new Blob([byteArray], { type: mimeType });
        }


        class TWCPageBase {
            #options = null;
            #page = null;
            #data = null;
            #unHandledErrors = [];
            #ui = null;
            #waitPanel = null;
            constructor(options) {
                this.#options = options || {};
                this.#page = jQuery('.twc_page');

                var pageData = this.#page.find('#twc-page-data').html();
                if (pageData) { pageData = b64.decode(pageData); }
                if (pageData) { this.#data = JSON.parse(pageData || '{}'); }
                console.log(this.#data)



            }

            get page() { return this.#page; }
            get data() { return this.#data; }
            get ui() { return this.#ui; }

            wait() {
                this.#waitPanel = jQuery(`
                    <div class="twc-overlay">
                        <span class="twc-wait-cursor">
                            ${twcIcons.ICONS.waitWheel}
                        </span>
                    </div>
                `)
                jQuery('body').append(this.#waitPanel)
            }
            waitClose() {
                if (this.#waitPanel) {
                    this.#waitPanel.remove();
                }
            }

            init() {
                try {

                    if (window.NS.UI.Util.isRedwood) {
                        // @@REVIEW: this would take effect after few moments the page is loaded, which is ok but looks a bit ugly, can we do better here???
                        jQuery('#main_form').find('.uir-form-header').css('background-color', 'var(--main-bkgd-color)');
                        jQuery('#main_form').find('table').css('background-color', 'var(--main-bkgd-color)');
                        jQuery('#main_form').find('.page-title-menu').css('display', 'none');
                        if (!this.#data.portlet) { jQuery('.twc_page').css('margin-top', '-39px'); }
                    }



                    if (this.#data?.portlet) {
                        jQuery('.twc_page').css('height', twcConfig.PORTLET_STYLES_PROPS.Height);
                        jQuery('.twc-container-outer').css('height', '99vh');
                        jQuery('.twc_action_menu ').css('top', '5px');
                        jQuery('.twc_action_menu ').css('right', '5px');
                        jQuery('.twc_page').removeClass('twc_page_loading');
                    }
                    this.#ui = twcUI.init({}, this.page);

                    // @@REVIEW: this should apply to all tables on the UI
                    //           if it does not we can still overwrite this on the derived pageInit method
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

                    this.#initEventsInternal();

                    if (!this.#data) { return; }

                    // @@NOTE: this means the user has no permission so we will not continue as the page should not be interacted with anyway
                    if (this.#data.permission.lvl == 0) { return; }

                    if (this.initPage) { this.initPage(); }
                    if (this.initEvents) { this.initEvents(); }

                    var refreshButton = this.page.find('#twc-page-refresh');
                    refreshButton.click(e => {
                        var params = this.ui.getValues();
                        window.location.href = core.url.script(this.#options.scriptId, params);
                    })
                    this.ui.on('change', e => {
                        if (e.id == 'twc-navigation-select') {
                            var navigateTo = url.resolveScript({
                                scriptId: e.value,
                                deploymentId: 1,    // @@HARDCODED: we should only have one deployment per script
                            });
                            if (this.#data.portlet) {
                                window.open(navigateTo)
                            } else {
                                location.href = navigateTo;
                            }

                        } else {
                            refreshButton.addClass('twc-highlighted')
                        }
                    })

                    this.ui.on('click', e => {
                        if (e.id == 'edit-button') {
                            if (this.onEdit) {
                                this.onEdit(e);
                            } else {
                                location.href = location.href + "&edit=T";
                            }
                        } else if (e.id == 'save-button') {
                            // @@NOTE: we need this implemented as async
                        } else if (e.id == 'cancel-button') {
                            if (this.onCancel) {
                                this.onCancel(e);
                            } else {
                                location.href = location.href.replace('&edit=T', '');
                            }
                        }
                    })

                    this.ui.getControl('save-button')?.ui.on('click', async e => {
                        // @@NOTE: for save operations we rely on the derived class
                        if (this.onSave) {
                            await this.onSave(e);
                        } else {
                            await dialog.errorAsync(`<b>Developer Error</b>:<br /><br />function 'onSave' was not implemented in derived class`);
                        }
                    })



                } catch (error) {
                    throw error
                } finally {
                    jQuery('.twc-overlay').remove();
                }
            }

            #initEventsInternal() {
                window.onerror = (message, source, lineno, colno, error) => {
                    try {
                        this.#unHandledErrors.push({
                            error: error.message,
                            line: lineno,
                            column: colno,
                            stack: decodeURIComponent(error.stack).replaceAll('\n', '<br />').replaceAll('=/', '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'),
                            message: message,
                            source: source,
                        });
                        jQuery('#twc-action-errors').css('display', 'inline-block');
                        jQuery('.uir-page-title-firstline-record').addClass('app-pulse-red')
                        window.setTimeout(() => { jQuery('.uir-page-title-firstline-record').removeClass('app-pulse-red') }, 30000)
                    } catch (error) {
                        console.log(error)
                    }
                };
                jQuery(window).bind('beforeunload', (e) => {
                    if (this.isDirty) {
                        if (this.isDirty()) {
                            e.preventDefault();
                            e.returnValue = 'cancel';
                            return 'cancel';
                        }
                    } else {
                        if (this.dirty) {
                            e.preventDefault();
                            e.returnValue = 'cancel';
                            return 'cancel';
                        }
                    }
                    //jQuery('dialog')[0]?.close();
                    jQuery('dialog').each((i, d) => { d.close(); })
                    jQuery('body').append(`
                        <div class="twc-overlay">
                            <span class="twc-wait-cursor">
                                ${twcIcons.ICONS.waitWheel}
                            </span>
                        </div>
                    `)

                })


                this.#page.find('.twc_action').click(e => {
                    try {
                        var action = jQuery(e.currentTarget).data('action');
                        if (action == 'user-pref') {
                            window.twc.userPref.open();
                        } else if (action == 'show-unhandled-errors') {
                            var html = '';
                            html = uiTable.render({}, this.#unHandledErrors);

                            var content = jQuery(`
                                <div>
                                    <span id="send-email" style="cursor: pointer; display: block; margin: 7px; text-decoration: underline;">email ossm with error report</span>
                                </div>
                                <div>
                                    ${html}
                                </div>
                            `);

                            content.find('#send-email').click(e => {
                                try {
                                    email.send({
                                        author: core.env.user(),
                                        recipients: 'giuseppegalligani@ossmcloud.ie',
                                        subject: 'OMT Page Error - ' + this.constructor.name,
                                        body: `
                                        <style>
                                            o-table {
                                                width: 100%;
                                                display: table;
                                                table-layout: auto;
                                                border-collapse: collapse;
                                            }
                                            o-table>div {
                                                display: table-row;
                                            }
                                            o-table>div>div {
                                                display: table-cell;
                                            }
                                        </style>
                                        URL: ${location.href}
                                        <hr />
                                        ${uiTable.renderPlainTable({}, this.#unHandledErrors)}
                                    `,
                                    });
                                    dialog.message('email has been sent');
                                } catch (error) {
                                    dialog.error(error);
                                }
                            })


                            dialog.open({
                                title: 'unhandled errors',
                                content: content,
                                size: { width: '75%', height: '75%' },
                            });

                        }
                    } catch (error) {
                        dialog.error(error);
                    }
                });
            }

            url(params) {
                return core.url.script(this.#options.scriptId, params || {});
            }

            post(params, body) {
                if (!this.#options.scriptId) { throw new Error('cannot post as this.#options.scriptId is empty'); }
                var url = core.url.script(this.#options.scriptId, params?.params || params || {});
                return new Promise(function (resolve, reject) {
                    https.promise.post({ url: url, body: params?.body || body || {} }).then(res => {
                        if (res.error) {
                            reject(res)
                        } else {
                            resolve(res);
                        }
                    }).catch(err => {
                        dialog.error(err);
                    })
                })
            }

            postSync(params, body) {
                if (!this.#options.scriptId) { throw new Error('cannot post as this.#options.scriptId is empty'); }
                var url = core.url.script(this.#options.scriptId, params?.params || params || {});
                var res = https.post({ url: url, body: params?.body || body || {} });
                if (res.error !== undefined) {
                    console.log(res);
                    throw res.error || 'NO ERROR MESSAGE';
                }
                return res;
            }

            async previewFile(file, e, getHtml) {
                return await TWCPageBase.previewFileStatic(file, e, getHtml);
            }
            static async previewFileStatic(file, e, getHtml) {
                var icon = '';
                if (e) {
                    icon = jQuery(e.currentTarget).html();
                    jQuery(e.currentTarget).html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 16)}</span>`);
                }

                var url = core.url.script('otwc_microsvc_sl', { action: 'view-file' });


                var res = await https.promise.post({ url: url, body: { file: file, getUrl: e?.ctrlKey } });
                if (e?.ctrlKey) {
                    jQuery(e.currentTarget).html(icon);
                    window.open(res.url);
                    return;
                }

                var dataType = `application/${res.type.toLowerCase()}`;

                var blob = base64ToBlob(res.fileContent, dataType)
                var blobUrl = URL.createObjectURL(blob);

                var html = `<object style="width: 100%;height: 100%;" data="${blobUrl}"></object>`;
                if (res.type.indexOf('IMAGE') > 0) {
                    dataType = `data:image/${res.type.toLowerCase().replace('image', '')}`;
                    html = `<img style="width: 100%; border: 1px solid var(--grid-color);" src="${blobUrl}" />`;
                }


                if (e) {
                    jQuery(e.currentTarget).html(icon);
                }

                if (getHtml) { return html; }

                dialog.message({
                    title: res.name,
                    message: html,
                    size: { width: '1000px', height: '95vh' }
                })
            }

            async uploadFile(options, callback) {
                return await TWCPageBase.uploadFileStatic(options, callback);
            }
            static async uploadFileStatic(options, callback) {

                try {
                    var fileObject = null;

                    var url = core.url.script('otwc_microsvc_sl', { action: 'upload-file-ui' });
                    var res = await https.promise.post({ url: url, body: { options: options } });

                    var form = twcUIPanel.ui(res);
                    form.on('change', e => {
                        if (e.id == 'upload-file') {
                            e.target.readFile(file => {
                                fileObject = file;
                                form.getControl('name').value = file.name;
                            })
                        } else if (e.id == twcFile.Fields.R_TYPE) {
                            form.getControl(twcFile.Fields.STATUS).setDataSource(e.target.valueObj.allowedStatues);
                            if (e.target.valueObj.defaultStatus) {
                                form.getControl(twcFile.Fields.STATUS).value = e.target.valueObj.defaultStatus;
                            }
                        }

                    });

                    dialog.confirm({ title: 'upload file', message: form.ui, width: '600px', height: '410px' }, (dlg) => {
                        try {
                            if (!fileObject) { throw new Error('Please pick a file from your PC'); }
                            var obj = form.getValues(true);
                            obj.fileObject = fileObject;
                            obj[twcFile.Fields.RECORD_TYPE] = options.recordType;
                            obj[twcFile.Fields.RECORD_ID] = options.recordId;
                            obj[twcFile.Fields.R_TYPE] = obj[twcFile.Fields.R_TYPE].value;
                            obj[twcFile.Fields.STATUS] = obj[twcFile.Fields.STATUS].value;

                            console.log(obj);

                            dialog.saving(dlg, 'uploading file...<br />this may take some time depending of the file size.<br />Please do not close this pop-up, this browser tab or refresh the page')

                            var url = core.url.script('otwc_microsvc_sl', { action: 'upload-file' });
                            https.promise.post({ url: url, body: obj }).then(res => {
                                if (res.error) {
                                    dialog.savingError(dlg, res.error);
                                } else {
                                    dlg.close();
                                }
                                if (callback) { callback(obj, res); }
                            }).catch(err => {
                                dialog.savingError(dlg, err);
                            })

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
        }

        function initPageData(context, data) {
            // @@NOTE: we have no context on portlets, main reason we need a context is for context.request.parameters.script which determines the permissions
            //         so the portlet will ust send the portlet id and we'll create a dummy context object 
            if (context?.constructor.name == 'String') { context = { request: { parameters: { script: twcConfig.getScriptId(context) } } } }

            //throw new Error(JSON.stringify(context))

            var userInfo = twcConfig.userInfo(context);

            return {
                userInfo: userInfo,
                permission: userInfo.permission,
                options: {},
                themes: twcThemes.get(),
                userPref: twcConfig.getUserPref(userInfo),
                data: data || {},
                icons: twcIcons.ICONS,
                recId: context.request.parameters.recId,
                siteId: context.request.parameters.siteId,
                editMode: context.request.parameters.edit == 'T',
            }
        }

      
        return {
            TWCPageBase: TWCPageBase,
            initPageData: initPageData,
            // initView: initView,

            async previewFile(file, e, getHtml) {
                return await TWCPageBase.previewFileStatic(file, e, getHtml)
            },

            async uploadFile(options, callback) {
                return await TWCPageBase.uploadFileStatic(options, callback)
            }

        }
    });
