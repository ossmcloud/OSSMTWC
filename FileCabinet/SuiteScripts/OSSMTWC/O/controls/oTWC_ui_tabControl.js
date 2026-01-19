/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, icons, ctrlBase) => {


        class TWCTabControl {
            #tabControl = null;
            #tabs = [];
            #jTabs = [];
            #page = null;
            
            constructor(page, tabControl, doNotInit) {
                this.#page = page;

                this.#tabControl = tabControl || jQuery('.oTWC_tab_control_outer');
                this.#tabControl.find('.oTWC_tab').click(e => {
                    //this.unselectTabs();
                })

                this.#jTabs = this.#tabControl.find('.oTWC_tab');
                if (!doNotInit) { this.init(); }
            }

            get page() { return this.#page; }
            get tabs() { return this.#tabs; }
            get jTabs() { return this.#jTabs; }
            get tabCtrl() { return this.#tabControl; }
            get selectedTabIdx() {
                var selectedIdx = 0;
                core.array.each(this.#tabs, t => {
                    if (t.selected) {
                        selectedIdx = t.idx;
                        return false;
                    }
                })
                return selectedIdx;
            }
            get selectedTab() {
                return this.tabs[this.selectedTabIdx];
            }

            unselectTabs() {
                core.array.each(this.#tabs, t => { t.unselect(); });
            }

            init() {
                var selectedTab = null;
                this.#jTabs.each((idx, ele) => {
                    var tab = null;
                    if (this.initTabs) {
                        tab = this.initTabs(ele, idx);
                    } else {
                        tab = new TWCBaseTab(this, idx, ele);
                    }
                    this.#tabs.push(tab);
                    if (tab.selected) {
                        selectedTab = tab;
                    }
                });

                if (selectedTab) {
                    selectedTab.init();
                } else {
                    this.#tabs[0].init();
                }
            }
        }

        class TWCBaseTab {
            #tabControl = null;
            #idx = null;
            #tabTitle = null;
            #tabPageId = null;
            #tab = null;
            #inited = false;
            constructor(tabControl, idx, ele) {
                this.#tabControl = tabControl;
                this.#idx = idx;
                this.#tabTitle = jQuery(ele);
                this.#tabPageId = this.#tabTitle.data('tab');
                this.#tab = tabControl.tabCtrl.find('#' + this.#tabPageId);
                this.#tabTitle.click(e => { this.select(); });
            }

            get tab() { return this.#tab; }
            get idx() { return this.#idx; }
            get tabTitle() { return this.#tabTitle; }
            get tabPageId() { return this.#tabPageId; }
            get tabControl() { return this.#tabControl; }
            get inited() { return this.#inited; }

            get selected() {
                return this.#tabTitle.hasClass('oTWC_tab_selected');
            }

            get hidden() {
                this.#tabTitle.css('display') == 'none';
            } set hidden(val) {
                this.#tabTitle.css('display', val ? 'none' : 'table-cell');
            }

            select() {
                this.#tabControl.unselectTabs();
                this.#tabTitle.addClass('oTWC_tab_selected');
                this.#tab.addClass('oTWC_tab_page_selected');
                this.init();
            }

            unselect() {
                this.#tabTitle.removeClass('oTWC_tab_selected');
                this.#tab.removeClass('oTWC_tab_page_selected');
            }

            init(options) {

                if (!this.initTab) { return; }
                if (!this.tabControl.page.data) {
                    this.#tab.html('no data for this tab');
                    return;
                }
                if (!this.#inited) {
                    this.initTab(options);
                    this.#inited = true;
                }
                //if (this.#inited) {
                if (this.tabSelected) { this.tabSelected(this, options); }
                if (this.tabControl.tabSelected) { this.tabControl.tabSelected(this, options); }
                //    return;
                //}
            }


        }


        return {
            TWCTabControl: TWCTabControl,
            TWCBaseTab: TWCBaseTab,

            // render: (options, dataSource) => {
            //     var ctrl = new TWCTabControl(options, dataSource);
            //     return ctrl.render();
            // },
            // ui: (element) => {
            //     return new TWCTabControl(element);
            // }
        }
    });

