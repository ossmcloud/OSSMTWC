/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/email', 'N/file', 'N/url', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.https.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', '../../O/oTWC_themes.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../O/oTWC_dialogEx.js', '../../O/controls/oTWC_ui_ctrl.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_permissions.js'],
    (email, file, url, core, https, b64, oStyles, twcThemes, twcIcons, twcConfig, dialog, twcUI, uiTable, permissions) => {

        //
        const PORTLET_STYLES_PROPS = {
            Height: '600px'
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
                        // @@TODO: this would take effect after few moments the page is loaded, which is ok but looks a bit ugly, can we do better here
                        jQuery('#main_form').find('.uir-form-header').css('background-color', 'var(--main-bkgd-color)');
                        jQuery('#main_form').find('table').css('background-color', 'var(--main-bkgd-color)');
                        jQuery('#main_form').find('.page-title-menu').css('display', 'none');
                        if (!this.#data.portlet) { jQuery('.twc_page').css('margin-top', '-39px'); }
                    }

                    if (this.#data.portlet) {
                        jQuery('.twc_page').css('height', PORTLET_STYLES_PROPS.Height);
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
                    jQuery('dialog')[0]?.close();
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
                                email.send({
                                    author: core.env.user(),
                                    recipients: 'development@ossmcloud.ie',
                                    subject: 'TWC Page Error - ' + this.constructor.name,
                                    body: html,
                                });
                                alert('email has been sent');
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

        function initView(pageVersion, pageData, viewName) {
            var css = file.load('SuiteScripts/OSSMTWC/ui/css/oTWC.css').getContents();
            css += file.load('SuiteScripts/OSSMTWC/O/css/html.styles.css').getContents();
            css = css.replace('/*THEME*/', twcThemes.css(pageData.userPref.theme));

            var html = file.load(`SuiteScripts/OSSMTWC/ui/views/oTWC_pageBase.html`).getContents();
            html = html.replace('/** STYLES **/', css);
            html = html.replace('/** THEME **/', twcThemes.js());


            var userInfo = pageData.userInfo;
            // @@NOTE: we generally do not want user info in the client side, only allow on SB
            if (!core.env.sb()) { delete pageData.userInfo; }

            html = html.replaceAll('{PAGE_DATA}', b64.encode(JSON.stringify(pageData)));
            html = html.replaceAll('{PAGE_VERSION}', pageVersion);

            var htmlPage = '';
            if (userInfo.permission.lvl == permissions.LEVEL.NONE || (userInfo.permission.lvl == permissions.LEVEL.VIEW && pageData.editMode)) {
                htmlPage = file.load(`SuiteScripts/OSSMTWC/ui/views/oTWC_permissionError.html`).getContents();
                if (userInfo.permission.lvl == permissions.LEVEL.VIEW) {
                    htmlPage = htmlPage.replaceAll('{MESSAGE}', `You do not have permission to edit this record (<i>${userInfo.permission.feature}</i>)`);
                } else {
                    htmlPage = htmlPage.replaceAll('{MESSAGE}', `You do not have permission to access this feature (<i>${userInfo.permission.feature}</i>)`);
                }
                html = html.replaceAll('{PERMISSION_ICON}', twcIcons.ICONS.exclamation);

            } else {
                htmlPage = file.load(`SuiteScripts/OSSMTWC/ui/views/${viewName}.html`).getContents();
                if (userInfo.permission.lvl == permissions.LEVEL.VIEW) {
                    html = html.replaceAll('{PERMISSION_ICON}', twcIcons.ICONS.readOnly);
                } else {
                    html = html.replaceAll('{PERMISSION_ICON}', '');
                }
            }
            html = html.replaceAll('{PAGE_CONTENT}', htmlPage);
            html = html.replaceAll(`{UNDER_CONSTRUCTION}`, twcIcons.UNDER_CONSTRUCTION);

            for (var k in twcIcons.ICONS) {
                html = html.replaceAll(`{ICON_${k.toUpperCase()}}`, twcIcons.ICONS[k]);
            }

            // @@TODO: based on userInfo populate core page menus and similar
            html = html.replaceAll('{NAVIGATION_DROP_DOWN}', twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, id: 'twc-navigation-select', value: userInfo.permission.id, noEmpty: true, dataSource: userInfo.permission.menuItems }));

            if (pageData.portlet) {
                html = html.replace('{TWC_PAGE_STYLE}', `style="height: ${PORTLET_STYLES_PROPS.Height}; width: 100%;" `);
                html = html.replace('{TWC_PAGE_CLASS}', 'twc_page_loading');
            } else {
                html = html.replace('{TWC_PAGE_STYLE}', '');
                html = html.replace('{TWC_PAGE_CLASS}', '');
            }

            var buttons = '';
            if ((pageData.recId !== undefined || pageData.editMode) && userInfo.permission.lvl > 1) {
                buttons += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: pageData.editMode ? 'Save' : 'Edit', id: pageData.editMode ? 'save-button' : 'edit-button' })
                if (pageData.editMode) {
                    buttons += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Cancel', id: 'cancel-button' })
                }

            }
            html = html.replace('{SAVE_EDIT_BUTTONS}', buttons);


            pageData.userInfo = userInfo;
            return html;
        }

        return {
            TWCPageBase: TWCPageBase,
            initPageData: initPageData,
            initView: initView,

        }
    });
