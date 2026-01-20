/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/email', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.https.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', '../../O/oTWC_themes.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../O/oTWC_dialogEx.js', '../../O/controls/oTWC_ui_ctrl.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_permissions.js'],
    (email, file, core, https, b64, oStyles, twcThemes, twcIcons, twcConfig, dialog, twcUI, uiTable, permissions) => {

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
                this.#ui = twcUI.init({}, this.page);

                this.#initEventsInternal();

                if (!this.#data) { return; }

                if (this.initPage) { this.initPage(); }
                if (this.initEvents) { this.initEvents(); }

                var refreshButton = this.page.find('#twc-page-refresh');
                refreshButton.click(e => {
                    var params = this.ui.getValues();
                    window.location.href = core.url.script(this.#options.scriptId, params);
                })
                this.ui.on('change', e => { refreshButton.addClass('twc-highlighted') })

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
        }

        function initPageData(context, data) {
            return {
                userInfo: twcConfig.userInfo(context),
                options: {},
                themes: twcThemes.get(),
                userPref: twcConfig.getUserPref(),
                data: data || {},
                icons: twcIcons.ICONS,
            }
        }

        function initView(pageVersion, pageData, viewName) {
            var css = file.load('SuiteScripts/OSSMTWC/ui/css/oTWC.css').getContents();
            css += file.load('SuiteScripts/OSSMTWC/O/css/html.styles.css').getContents();
            css = css.replace('/*THEME*/', twcThemes.css(pageData.userPref.theme));
            
            var html = file.load(`SuiteScripts/OSSMTWC/ui/views/oTWC_pageBase.html`).getContents();           
            html = html.replace('/** STYLES **/', css);
            html = html.replace('/** THEME **/', twcThemes.js());
            for (var k in twcIcons.ICONS) {
                html = html.replaceAll(`{ICON_${k.toUpperCase()}}`, twcIcons.ICONS[k]);
            }

            var userInfo = pageData.userInfo;
            delete pageData.userInfo;

            html = html.replaceAll('{PAGE_DATA}', b64.encode(JSON.stringify(pageData)));
            html = html.replaceAll('{PAGE_VERSION}', pageVersion);

            var htmlPage = '';
            if (userInfo.permission.lvl == permissions.LEVEL.NONE) {
                htmlPage = file.load(`SuiteScripts/OSSMTWC/ui/views/oTWC_permissionError.html`).getContents();
                htmlPage = htmlPage.replaceAll('{FEATURE_NAME}', userInfo.permission.feature);    
                html = html.replaceAll('{PERMISSION_ICON}', twcIcons.ICONS.exclamation);
            } else {
                // @@TODO: based on userInfo populate core page menus and similar
                htmlPage = file.load(`SuiteScripts/OSSMTWC/ui/views/${viewName}.html`).getContents();
                if (userInfo.permission.lvl == permissions.LEVEL.VIEW) {
                    html = html.replaceAll('{PERMISSION_ICON}', twcIcons.ICONS.readOnly);   
                } else {
                    html = html.replaceAll('{PERMISSION_ICON}', '');
                }
            }
            html = html.replaceAll('{PAGE_CONTENT}', htmlPage);
            

            pageData.userInfo = userInfo;
            return html;
        }

        return {
            TWCPageBase: TWCPageBase,
            initPageData: initPageData,
            initView: initView,

        }
    });
