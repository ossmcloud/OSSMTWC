/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js', '../../data/oTWC_utils.js', '../../data/oTWC_safUI.js', '../../data/oTWC_icons.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteInfoPanel, twcSiteLocatorPanel, uiTable, twcSite, twcUtils, twcSafUI, twcIcons) => {



        // @@TODO: this should be from site access table
        class TWCSiteTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var safLink = core.url.script('otwc_siteaccess_sl');
                var unboundCols = [];
                unboundCols.push({
                    id: 'open_saf', title: 'SAF', unbound: true,
                    styles: { 'text-align': 'center' },
                    noSort: true,
                    sortIdx: 999,
                    initValue: (d) => {
                        return `<a href="${safLink}&siteId=${d.id}">view</a>`;
                    }
                })
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,
                    // fitScreen: false,
                    // fitContainer: true
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
                if (col.id == 'name') { return false; }
                if (col.id == 'site_type_color') { return false; }
                if (col.id == 'site_type_color') { return false; }

                var uf = window.twc.page.data.data.safInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    col.title = uf.label;
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                }

                if (col.id == twcSite.Fields.SITE_NAME || col.id == twcSite.Fields.SITE_ID) {
                    col.addCount = col.id == twcSite.Fields.SITE_NAME;
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${id}',
                        valueField: 'id'
                    }
                }
                if (col.id == twcSite.Fields.LATITUDE || col.id == twcSite.Fields.LONGITUDE) { col.styles = { 'text-align': 'right' }; }
            }

            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }



        }


        class TWCSiteAccessBuilder {
            #page = null;
            #calendar = null;
            #calendarSelection = null;
            #calendarSelectionTitle = null;
            #accessInfoSection = null;
            #accessConditionsSection = null;
            #accessRequirements = null;
         
            constructor(page) {
                this.#page = page;
                this.init();


            }

            get ui() { return this.#page.ui; }
            get data() { return this.#page.data; }

            init() {
                this.#calendar = this.ui.getControl('saf-calendar');
                this.#calendarSelectionTitle = this.ui.ui.find('#saf-cal-selection-title');
                this.#calendarSelection = this.ui.ui.find('#saf-cal-selection-body');
                this.#accessInfoSection = this.ui.ui.find('#saf-cal-selection-access-body');
                this.#accessConditionsSection = this.ui.ui.find('#saf-access-condition-info');
                
                this.ui.getControl('saf-template').on('change', e => {
                    this.ui.getControl('saf-type').hide = e.value != 'new';
                    this.ui.getControl('saf-reuse').hide = e.value != 'reuse';
                })
                this.ui.getControl('saf-type').on('change', e => {
                    this.ui.find('#site-access-step-2').css('display', 'block')
                });


                this.ui.getControl('saf-mast-access').on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-building-access').on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-crane-access').on('change', e => { this.refreshAccessRequirements(); });



                this.#calendar.on('change', e => {
                    this.#calendarSelectionTitle.html(twcUtils.formatLongDate(e.value))

                    var editable = this.#accessRequirements != null;

                    this.#calendarSelection.html(twcSafUI.renderTimeBlocks({
                        date: e.value.format(),
                        timeBlocks: this.data.siteTimeBlocks[e.value.format()],
                        editable: editable,
                        disabled: e.target.isPast ? 'not available' : ''
                    }));

                    this.#calendarSelection.find('span[data-action="reserve"]').click(e => {
                        var timeBlockRow = jQuery(e.currentTarget).closest('div[data-block-id]');
                        var timeBlockDate = timeBlockRow.data('block-date');
                        var timeBlock = this.data.siteTimeBlocks[timeBlockDate];
                        if (!timeBlock) {
                            this.data.siteTimeBlocks[timeBlockDate] = {}
                            timeBlock = this.data.siteTimeBlocks[timeBlockDate];
                        }

                        if (!timeBlock['t']) {
                            timeBlock['t'] = {
                                blocks: [],
                                saf: { id: 'new', code: 'TBA' }
                            };
                        }

                        timeBlock['t'].blocks.push({
                            id: 'new',
                            date: timeBlockDate,
                            block: {
                                id: timeBlockRow.data('block-id'),
                                name: timeBlockRow.data('block-text'),

                            }
                        })

                        if (!this.#accessRequirements.timeBlocks[timeBlockDate]) { this.#accessRequirements.timeBlocks[timeBlockDate] = {}; }
                        this.#accessRequirements.timeBlocks[timeBlockDate] = timeBlock;
                        this.#accessRequirements.timeBlocksAllocated++;

                        if (!this.#calendar.datesContent[timeBlockDate]) {
                            this.#calendar.datesContent[timeBlockDate] = [];
                        } else {
                            if (this.#calendar.datesContent[timeBlockDate].indexOf('This') < 0) {
                                this.#calendar.datesContent[timeBlockDate].push('This');
                            }
                        }
                        this.#calendar.refresh();
                        this.#calendar.on('change', e);

                        this.refreshInfo();

                    })

                })
            }

            refreshAccessRequirements() {
                var showStep3 = true;
                if (this.ui.getControl('saf-mast-access').value != 'T') { showStep3 = false; }
                // @@TODO: SAF: the building access control may not be there
                if (this.ui.getControl('saf-building-access').value != 'T') { showStep3 = false; }
                if (this.ui.getControl('saf-crane-access').value != 'T') { showStep3 = false; }



                if (showStep3) {
                    // @@TODO: SAF get conditions of access
                    var payload = {};
                    this.#page.post({ action: 'get-access-requirements' }, payload)
                        .then(res => {
                            this.#accessRequirements = res;

                            this.ui.find('#site-access-step-3').css('display', 'block');
                            this.ui.find('#site-access-step-4').css('display', 'block');
                            this.ui.find('#site-access-step-5').css('display', 'block');
                            this.ui.find('#site-access-step-6').css('display', 'block');

                            this.refreshInfo();
                            this.#calendar.on('change', null)
                        })
                        .catch(err => { dialog.error(err); });

                } else {
                    this.ui.find('#site-access-step-3').css('display', 'none');
                    this.ui.find('#site-access-step-4').css('display', 'none');
                    this.ui.find('#site-access-step-5').css('display', 'none');
                    this.ui.find('#site-access-step-6').css('display', 'none');
                }
            }

            refreshInfo() {
                var html = jQuery('<div></div>');
                var htmlCond = jQuery('<div></div>');
                if (!this.#accessRequirements) {
                    html.append('<b>Select SAF Setup & Access Requirements below to begin</b>');
                    htmlCond.append('<b>Select SAF Setup & Access Requirements above to begin</b>');
                } else {
                    var colorStyle = '';
                    if (this.#accessRequirements.timeBlocksAllocated == this.#accessRequirements.timeBlocksRequired) {
                        colorStyle = ' color: green; font-weight: bold;';
                    } else if (this.#accessRequirements.timeBlocksAllocated > this.#accessRequirements.timeBlocksRequired) {
                        colorStyle = ' color: red; font-weight: bold;';
                    }
                    html.append(`
                        <div style="padding: 7px; border-bottom: 1px solid var(--grid-color);${colorStyle}">
                            ${this.#accessRequirements.timeBlocksAllocated} of ${this.#accessRequirements.timeBlocksRequired} time-blocks allocated
                        </div>
                    `);
                    htmlCond.append(`
                        <div style="padding: 7px; border-bottom: 1px solid var(--grid-color);${colorStyle}">
                            ${this.#accessRequirements.timeBlocksAllocated} of ${this.#accessRequirements.timeBlocksRequired} time-blocks allocated
                        </div>
                    `);

                    var allocatedBlocksTable = jQuery('<div class="twc-div-table-r"></div>');
                    html.append(allocatedBlocksTable);
                    for (var k in this.#accessRequirements.timeBlocks) {
                        if (!this.#accessRequirements.timeBlocks[k]['t']) { continue; }
                        core.array.each(this.#accessRequirements.timeBlocks[k]['t'].blocks, b => {
                            var allocatedBlocksTableRow = jQuery(`
                                <div>
                                    <div style="padding: 7px;">${b.block.name} - ${k}</div>
                                    <div data-action="remove" class="twc-clickable" style="text-align: right;">${twcIcons.get('trash', 16, 'red')}</div>
                                </div>
                            `);
                            allocatedBlocksTable.append(allocatedBlocksTableRow);
                            allocatedBlocksTableRow.find('[data-action="remove"]').click(e => {
                                console.log(b.date, this.#accessRequirements.timeBlocks[b.date]['t'], b)

                                this.#accessRequirements.timeBlocks[b.date]['t'].blocks.splice(this.#accessRequirements.timeBlocks[b.date]['t'].blocks.indexOf(b), 1);
                                if (this.#accessRequirements.timeBlocks[b.date]['t'].blocks.length == 0) {
                                    delete this.#accessRequirements.timeBlocks[b.date]['t'];
                                    var idx = this.#calendar.datesContent[b.date].indexOf('This');
                                    if (idx >= 0) { this.#calendar.datesContent[b.date].splice(idx, 1) }
                                }
                                this.#accessRequirements.timeBlocksAllocated--;
                                this.refreshInfo();
                                this.#calendar.refresh();
                                //this.#calendar.on('change', e)
                            })
                        })
                    }

                    core.array.each(this.#accessRequirements.conditions, cond => {
                        htmlCond.append(`
                            <div>${cond.quantity} ${cond.name} Required</div>
                        `)
                    })
                }

                this.#accessInfoSection.html(html);
                this.#accessConditionsSection.html(htmlCond);
            }
        }


        class TWCSiteAccessPage extends twcPageBase.TWCPageBase {
            #map = null;
            #sitesTable = null;
            #sitePanel = null;
            #safBuilder = null;

            constructor() {
                super({ scriptId: 'otwc_siteAccess_sl' });
            }

            initPage() {
                if (this.data.siteAccessInfo) {
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });
                    if (this.data.siteAccessInfo.id) {
                        this.initSafMode();
                    } else {
                        this.#safBuilder = new TWCSiteAccessBuilder(this);

                    }
                } else {
                    this.initLocatorMode();
                }
            }

            initLocatorMode() {
                this.#sitesTable = new TWCSiteTable(this);
                this.#sitePanel = twcSiteLocatorPanel.get({ page: this, table: this.#sitesTable, data: this.data.data.safInfo.sites, tableData: this.data.data.safInfo.safs });
            }

            initSafMode() {

            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteAccessPage())
            }


        }
    });
