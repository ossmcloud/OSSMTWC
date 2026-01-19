/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.https.j.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', '../data/oTWC_icons.js'],
    (core, https, dialog, twcIcons) => {

        class DialogWizardBase {
            #options = null;
            #dlg = null;
            #dlgContent = null;
            #dlgOk = null;
            #dlgNext = null;
            #dlgPrev = null;
            #page = 1;
            #pageMax = 1;
            #pageBanner = null;
            #waitPanel = null;
            constructor(options) {
                this.#options = options;
                this.#pageMax = options.pageMax || 1;
            }

            get page() { return this.#page; }

            wait() {
                this.#waitPanel = jQuery(`
                    <div class="oTWC-overlay" style="padding-top: 50px">
                        <span class="oTWC-wait-cursor">
                            ${twcIcons.ICONS.waitWheel}
                        </span>
                    </div>
                `)
                this.#dlgContent.closest('dialog').append(this.#waitPanel)
            }
            waitClose() {
                if (this.#waitPanel) {
                    this.#waitPanel.remove();
                }
            }

            showBanner(content, type) {
                if (this.#pageBanner) { this.#pageBanner.remove(); }
                this.#pageBanner = jQuery(`
                    <div class="oTWC-dialog-wizard-page-banner oTWC-dialog-wizard-page-banner-${type || 'warning'}">
                        <span class="oTWC-dialog-wizard-page-banner-close">X</span>
                        <label>${(type || 'warning').toUpperCase()}</label>
                        
                    </div>`
                )
                this.#pageBanner.append(content);
                this.#dlgContent.prepend(this.#pageBanner);
                this.#pageBanner.slideDown();
                this.#pageBanner.find('.oTWC-dialog-wizard-page-banner-close').click(e => { this.#pageBanner.remove(); })
            }

            start() {
                this.#options.ok = () => { return this.save(); };
                this.#dlg = dialog.open(this.#options);
                this.#dlgContent = this.#dlg.dialog.find('#o-dialog_content');
                this.#dlg.dialog.find('#o-dialog_close').css('float', 'left');
                this.#dlgOk = this.#dlg.dialog.find('#o-dialog_ok');
                this.#dlgOk.prop('disabled', 'disabled');
                this.#dlgPrev = jQuery(`<button style="margin-right: 7px;">Previous</button>`);
                this.#dlgNext = jQuery(`<button>Next</button>`);
                this.#dlgOk.parent().prepend(this.#dlgNext)
                this.#dlgOk.parent().prepend(this.#dlgPrev)
                this.#dlgNext.click(e => {
                    if (this.#onPageChange('next') === false) { return; }
                    if (this.#page < this.#pageMax) {
                        this.#page += 1;
                        this.#renderPage();
                    }
                })
                this.#dlgPrev.click(e => {
                    if (this.#onPageChange('prev') === false) { return; }
                    if (this.#page > 1) {
                        this.#page -= 1;
                        this.#renderPage();
                    }
                })
                this.#renderPage();
            }

            #onPageChange(movement) {
                if (this.onPageChange) {
                    var move = this.onPageChange(this.#page, movement);
                    if (move !== undefined) {
                        if (move === false) { return false; }
                        this.showBanner(move);
                        return false;
                    }
                }
            }

            #renderPage() {
                try {
                    this.#dlgContent.html(this.renderPage(this.#page));
                    this.#dlgOk.prop('disabled', this.#page == this.#pageMax ? '' : 'disabled');
                    this.#dlgNext.prop('disabled', this.#page == this.#pageMax ? 'disabled' : '');
                    this.#dlgPrev.css('display', (this.#page == 1) ? 'none' : 'inline-block');;
                } catch (error) {
                    this.#dlgContent.html(`something went wrong here:<br />${error.message}`);
                }
            }

            callRenderPage() {
                this.#renderPage();
            }

        }

        function siteFinder(options, callBack) {
            try {
                if (core.utils.isFunc(options)) { callBack = options; };

                var dlgContent = jQuery(`
                    <div>
                    <input type="text" class="oTWC" id="oTWC_transfer_site" placeholder="enter a site id..." />
                    <div id="oTWC_transfer_site_list"></div>
                    </div>
                `);
                var dlg = dialog.open({
                    title: 'find site',
                    content: dlgContent,
                    size: { width: '750px', height: '600px' },
                })

                var inputTimer = null;

                var siteList = dlgContent.find('#oTWC_transfer_site_list');
                var siteInput = dlgContent.find('#oTWC_transfer_site');
                siteInput.on('input', e => {
                    window.clearTimeout(inputTimer);
                    inputTimer = window.setTimeout(async () => {
                        siteList.html(`
                            <div style="width: 100%; text-align: center;">
                                <span class="oTWC-wait-cursor">
                                    ${twcIcons.ICONS.waitWheel}
                                </span>
                            </div>
                        `);
                        var resp = await https.promise.get(core.url.script('oTWC_microsvc_sl', { siteSearch: siteInput.val() }));
                        siteList.html(`
                            <label>select a site</label>
                            <div class="app-drop-down" style="position: static; height: 440px;">    
                                <div style="width: 100%">
                                    ${atob(resp.html)}
                                </div>
                            </div>
                        `);
                        siteList.find('.app-drop-down-item').click(async e => {
                            var site = jQuery(e.currentTarget).data('value');
                            if (options?.fullInfo) {
                                site = await https.promise.get(core.url.script('oTWC_microsvc_sl', { siteId: site }));
                            }
                            callBack(site);
                            dlg.close();
                        });

                    }, 500)
                })




            } catch (error) {
                dialog.error(error);
            }
        }


        function confirm(options, callback) {
            if (!options) { return; }
            if (options.constructor.name == 'Object') {
                if (!options.title) { options.title = 'confirm'; }
                if (!options.message) { options.message = 'no confirm message;' }
            } else {
                options = {
                    title: 'confirm',
                    message: options.toString()
                }
            }
            dialog.open({
                title: options.title,
                content: options.message,
                size: {
                    width: options.width || '500px',
                    height: options.height || '300px'
                },
                ok: callback
            });
        }

        function error(error, callback) {
            var dlg = dialog.open({
                title: 'error',
                content: `
                        <div style="color: red; padding: 7px;">
                            ${error.message || error.error || error}
                        </div>
                    `,
                size: {
                    width: '500px',
                    height: '300px'
                },
            });
            if (callback) {
                dlg.dialog.find('#o-dialog_close, #o-dialog_title_x').click(e => { callback(); });
            }
        }

        function message(options, callback) {
            if (!options) { return; }
            if (options.constructor.name == 'Object') {
                if (!options.title) { options.title = 'message'; }
                if (!options.message) { options.message = 'no message;' }
            } else {
                options = {
                    title: 'message',
                    message: options.toString()
                }
            }
            var dlg = dialog.open({
                title: options.title,
                content: options.message,
                size: {
                    width: options.size?.width || options.width || '500px',
                    height: options.size?.height || options.height || '300px'
                },
            });

            if (callback) {
                dlg.dialog.find('#o-dialog_close, #o-dialog_title_x').click(e => { callback(); });
            }
        }

        function iconPicker(options, callback) {
            var content = jQuery(`<div class="oTWC-icon-picker"></div>`);
            for (var i in twcIcons.ICONS) {
                if (i == 'menu') { continue; }
                var selected = '';
                if (options?.value == i) { selected = ' oTWC-icon-picker-selected'; }
                content.append(`
                    <span class="oTWC-icon-picker${selected}" data-icon="${i}">
                        ${twcIcons.get(i, 24)}
                    </span>
                `)
            }

            var dlg = dialog.open({
                title: 'TWC Icon Piker',
                content: content,
                size: {
                    width: '750px',
                    height: '500px'
                },
                //ok: callback
            });

            content.find('span.oTWC-icon-picker').on('dblclick', e => {
                dlg.close();
                callback(jQuery(e.currentTarget).data('icon'));
            })
        }

        return {

            CONFIGS: dialog.CONFIGS,
            Dialog: dialog.Dialog,
            get: dialog.get,
            open: dialog.open,

            DialogWizardBase: DialogWizardBase,

            iconPicker: iconPicker,

            openAsync: async function (options) {
                return new Promise(function (resolve, reject) {
                    options.ok = resolve;
                    dialog.open(options)
                })
            },

            error: error,
            errorAsync: async function (err) {
                return new Promise(function (resolve, reject) {
                    error(err, resolve)
                })
            },

            message: message,
            messageAsync: async function (options) {
                return new Promise(function (resolve, reject) {
                    message(options, resolve)
                })
            },

            confirm: confirm,
            confirmAsync: async function (options) {
                return new Promise(function (resolve, reject) {
                    confirm(options, resolve)
                })
            },

            siteFinder: siteFinder

        }
    })