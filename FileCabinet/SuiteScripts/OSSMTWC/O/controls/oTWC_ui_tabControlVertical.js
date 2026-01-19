/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, twcIcons, ctrlBase) => {


        class TWCTabControlVertical {
            #page = null;
            #container = null;
            #options = null;
            #ui = null;
            #tabsNavPanel = null;
            #tabsPanel = null;
            #tabs = [];
            #currentTabDescr = null;
            #navHidden = false;
            constructor(page, container, options) {
                this.#page = page;
                this.#container = container;
                this.#options = options || {};
            }

            get id() {
                return this.#options.id || 'oTWC-vnav';
            } set id(v) {
                this.#options.id = v;
            }

            get navAutoHide() {
                return this.#options.navAutoHide;
            }

            get tabs() { return this.#tabs; }
            get currentTabDescr() {
                return this.#currentTabDescr;
            } set currentTabDescr(v) {
                this.#currentTabDescr = v;
            }

            addTab(options) {
                // @@TODO: find if base class is TWCBaseTabVertical
                this.#tabs.push(new TWCBaseTabVertical(this, options))
            }


            #renderNavPanel() {
                this.#tabsNavPanel = jQuery(`<div class="oTWC_vtab_nav_panel" id="${this.id}-nav-panel"></div>`);
                if (this.navAutoHide) {
                    this.#tabsNavPanel.append('<span class="oTWC_vtab_nav_expand">»</span>')
                }

                var tabNavs = jQuery(`<div></div>`);
                core.array.each(this.#tabs, tab => {
                    tabNavs.append(tab.renderNav())
                })
                this.#tabsNavPanel.append(tabNavs);
                this.#tabsNavPanel.height(this.#container.height());

                this.#currentTabDescr = jQuery(`<div id="oTWC-vtab-description" style="max-width: 180px;"><div>`);
                this.#tabsNavPanel.append(this.#currentTabDescr);

                if (this.navAutoHide) {
                    this.#navHidden = true;
                    this.#tabsNavPanel.width(50);
                    this.#currentTabDescr.css('display', 'none');
                    this.#tabsNavPanel.find('div').eq(0).css('min-width', '30px');
                }

                return this.#tabsNavPanel;
            }

            #renderTabsPanel() {
                var styles = '';
                if (this.#options.styles) {
                    styles = 'style="';
                    for (var s in this.#options.styles) {
                        styles += `${s}: ${this.#options.styles[s]}; `
                    }
                    styles += '"';
                }

                this.#tabsPanel = jQuery(`<div class="oTWC_vtab_panel" id="${this.id}-panel" ${styles}></div>`);
                core.array.each(this.#tabs, tab => {
                    this.#tabsPanel.append(tab.render(this.#container.height()))
                })
                this.#tabsPanel.height(this.#container.height());
                return this.#tabsPanel;
            }

            render() {
                this.#ui = jQuery(`<div class="oTWC_vtab" id="${this.id}"></div>`);
                this.#ui.append(this.#renderNavPanel());
                this.#ui.append(this.#renderTabsPanel());
                this.#container.html(this.#ui);
                this.#tabsPanel.width(this.#container.width() - this.#tabsNavPanel.width() - 0);
                if (!this.currentTab && this.#tabs.length > 0) {
                    this.select(this.#tabs[0]);
                }
                this.initEvents();
            }

            initEvents() {
                this.#tabsNavPanel.find('.oTWC_vtab_nav_expand').click(e => { this.showHide(); })
            }

            select(tab) {
                if (this.navAutoHide && !this.#navHidden) { this.showHide(); }

                if (this.currentTab) {
                    this.currentTab.unselect(() => {
                        this.currentTab = tab;
                        tab.select(this.#container.height());
                    });
                } else {
                    this.currentTab = tab;
                    tab.select(this.#container.height());
                }
            }

            showHide() {
                if (this.#navHidden) {
                    this.#tabsNavPanel.width('auto');
                    this.#currentTabDescr.css('display', 'table')
                    this.#tabsNavPanel.find('div').eq(0).css('min-width', '180px');
                    core.array.each(this.#tabs, tab => {
                        tab.nav.addClass('oTWC_vtab_nav')
                        tab.nav.removeClass('oTWC_vtab_nav_hide')
                    })
                } else {
                    this.#tabsNavPanel.width(50);
                    this.#currentTabDescr.css('display', 'none')
                    this.#tabsNavPanel.find('div').eq(0).css('min-width', '30px');
                    core.array.each(this.#tabs, tab => {
                        tab.nav.addClass('oTWC_vtab_nav_hide')
                        tab.nav.removeClass('oTWC_vtab_nav')
                    })
                }
                this.#navHidden = !this.#navHidden;

            }

        }


        class TWCBaseTabVertical {
            #tabControl = null;
            #tabUi = null;
            #nav = null;
            #options = null;
            constructor(tabControl, options) {
                if (!options) { throw new Error('options cannot be empty'); }
                this.#tabControl = tabControl;
                this.#options = options;
                if (!this.#options.id) {
                    this.#options.id = 'tab-' + (tabControl.tabs.length + 1);
                }
            }

            get tabUI() { return this.#tabUi; }
            get nav() { return this.#nav; }

            renderNav() {
                var cls = this.#tabControl.navAutoHide ? 'oTWC_vtab_nav_hide' : 'oTWC_vtab_nav'

                this.#nav = jQuery(`<div class="${cls}" id="${this.#options.id}-nav"></div>`);
                this.#nav.append(`
                    <span>${this.#options.title}</span>
                    <span title="${this.#options.title}">${twcIcons.get(this.#options.icon || 'fourSquare', 24)}</span>
                `)
                this.#nav.click(e => { this.#tabControl.select(this) });
                return this.#nav;
            }

            render(containerHeight) {
                this.#tabUi = jQuery(`<div class="oTWC_vtab_content">${this.#options.id} is empty</div>`);
                if (this.renderTab) {
                    this.#tabUi.html(this.renderTab(this, containerHeight));
                } else if (this.#options.render) {
                    var html = this.#options.render(this, containerHeight)
                    this.#tabUi.html(html);
                }
                return this.#tabUi;
            }

            select(containerHeight) {
                this.#tabUi.height(containerHeight - 25);
                this.#tabUi.show();
                this.#nav.addClass('oTWC_vtab_nav_selected');
                if (this.#options.refreshTab) { this.#options.refreshTab(this.#tabUi); }
                this.#tabControl.currentTabDescr.html('');
                if (this.#options.description) {
                    this.#tabControl.currentTabDescr.html(`
                        <h2>${this.#options.description.title}</h2>
                        ${this.#options.description.text}
                    `)
                }
            }
            unselect(callback) {
                this.#tabUi.hide();
                this.#nav.removeClass('oTWC_vtab_nav_selected');
                callback();
            }

        }



        return {
            TWCTabControlVertical: TWCTabControlVertical,
            TWCBaseTabVertical: TWCBaseTabVertical,

            // render: (options, dataSource) => {
            //     var ctrl = new TWCTabControl(options, dataSource);
            //     return ctrl.render();
            // },
            // ui: (element) => {
            //     return new TWCTabControl(element);
            // }
        }
    });


