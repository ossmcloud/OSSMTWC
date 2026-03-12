/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js', '../../data/oTWC_utils.js', '../../data/oTWC_safUI.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_fieldPanel.js', '../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteInfoPanel, twcSiteLocatorPanel, uiTable, twcSite, twcUtils, twcSafUI, twcIcons, twcUIPanel, twcUI) => {



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
                    this.#page.dirty = true;
                    this.ui.getControl('saf-type').hide = e.value != 'new';
                    this.ui.getControl('saf-reuse').hide = e.value != 'reuse';
                })
                this.ui.getControl('saf-type').on('change', e => {
                    this.ui.find('#site-access-step-2').css('display', 'block');
                    this.refreshAccessRequirements();
                });

                this.ui.getControl('saf-mast-access')?.on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-building-access')?.on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-rooftop-access')?.on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-electrical-access')?.on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-crane-access')?.on('change', e => { this.refreshAccessRequirements(); });

                this.ui.getControl('saf-picw').on('change', e => {
                    this.ui.getControl('saf-picw-staff').value = null;
                    this.ui.getControl('saf-picw-staff-phone').value = null;
                    this.#page.post({ action: 'get-vendor-picw' }, { vendor: e.value })
                        .then(res => {
                            this.ui.getControl('saf-picw-staff').setDataSource(res.data);
                            this.ui.getControl('saf-picw-staff').hide = false;
                            this.ui.getControl('saf-picw-staff-phone').hide = false;
                        })
                        .catch(err => { dialog.error(err); });

                });
                this.ui.getControl('saf-picw-staff').on('change', e => {
                    this.ui.getControl('saf-picw-staff-phone').value = e.object?.phone || ''
                })
                this.ui.getControl('saf-vendor').on('change', e => {
                    this.#page.post({ action: 'get-vendor-docs' }, { vendor: e.value })
                        .then(res => {
                            this.refreshVendorDocuments(res.data);
                        })
                        .catch(err => { dialog.error(err); });
                });

                core.array.each(this.ui.controls, c => {
                    if (c.type !== 'table') { return; }
                    c.onToolbarClick = e => {
                        var manageMethod = 'manageVisitor';
                        if (e.action == 'add-new') {
                            this[manageMethod](null, e.table);

                        } else if (e.action == 'edit') {
                            this[manageMethod](e.rowData, e.table);

                        } else if (e.action == 'delete') {
                            dialog.confirm('Are you sure you wish to delete this record', () => {
                                e.rowData.delete = true;
                                this[manageMethod](e.rowData, e.table);
                            })

                        }
                    }
                })


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
                if (this.ui.getControl('saf-mast-access') && this.ui.getControl('saf-mast-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-building-access') && this.ui.getControl('saf-building-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-rooftop-access') && this.ui.getControl('saf-rooftop-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-electrical-access') && this.ui.getControl('saf-electrical-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-crane-access') && this.ui.getControl('saf-crane-access').value == '') { showStep3 = false; }

                if (showStep3) {
                    this.#accessConditionsSection.html(`
                        <span class="twc-wait-cursor">${twcIcons.get('waitWheel', 24)}</span>
                        <span>gathering data...</span>
                    `);
                    this.ui.find('#site-access-step-3').css('display', 'block');
                    this.ui.find('#site-access-step-4').css('display', 'block');
                    this.ui.find('#site-access-step-5').css('display', 'block');
                    this.ui.find('#site-access-step-6').css('display', 'block');

                    var payload = this.ui.getValues();
                    payload.siteId = this.data.siteId;
                    payload.safType = this.ui.getControl('saf-type').value;
                    console.log(payload)
                    this.#page.post({ action: 'get-access-requirements' }, payload)
                        .then(res => {
                            this.#accessRequirements = res;
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
                        <div style="padding: 3px; border-bottom: 1px solid var(--grid-color);${colorStyle}">
                            ${this.#accessRequirements.timeBlocksRequired} Time-Blocks Required (${this.#accessRequirements.timeBlocksAllocated} Allocated)
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
                            <div style="padding: 3px;">${cond.quantity} ${cond.name} Required</div>
                        `)
                    })
                }

                this.#accessInfoSection.html(html);
                this.#accessConditionsSection.html(htmlCond);
            }

            refreshVendorDocuments(documents) {
                var html = jQuery(`<div></div>`);
                core.array.each(documents, d => {
                    var docSection = jQuery(`<div class=""><label>${d.title}</label></div>`)
                    var docSectionFiles = jQuery(`<div class="twc-div-table-r" style="width: auto"></div>`);
                    docSection.append(docSectionFiles);
                    core.array.each(d.files, f => {
                        docSectionFiles.append(`
                            <div data-file="${f.id}" data-file-id="${f.file_id}">
                                <div style="width: 35px;">${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: `file_toggle_${f.id}`, small: true })}</div>
                                <div class="twc-clickable toggle-file">${f.name}</div>
                                <div style="width: 20px; text-align: center;" class="twc-clickable view-file">${twcIcons.get('download', 20)}</div>
                            </div>
                        `)
                    })
                    html.append(docSection)
                })
                var ui = twcUI.init({}, html);

                html.find('.toggle-file').click(e => {
                    var fileId = jQuery(e.currentTarget).closest('div[data-file]').data('file');
                    ui.getControl(`file_toggle_${fileId}`).value = !ui.getControl(`file_toggle_${fileId}`).value;
                })

                html.find('.view-file').click(async e => {
                    var fileId = jQuery(e.currentTarget).closest('div[data-file-id]').data('file-id');
                    await this.#page.previewFile(fileId, e.ctrlKey);
                })


                this.ui.find('#site-access-step-5').find('.twc-control-panel-fields').html(html)
            }

            manageVisitor(safCrew, table) {
                try {
                    if (!safCrew) { safCrew = {}; }
                    if (this.deleteRecord(safCrew, table)) { return; }

                    if (!safCrew.ui) {
                        safCrew.ui = this.#page.postSync({ action: 'saf-crew-record' }, { saf: this.data.siteAccessInfo, crew: safCrew })
                    }

                    var form = twcUIPanel.ui(safCrew.ui);
                    form.getControl('saf-crew-vendor').on('change', e => {
                        form.getControl('saf-crew-member').value = null;
                        form.getControl('saf-crew-attend-as').value = null;

                        this.#page.post({ action: 'get-vendor-persons' }, { vendor: e.value })
                            .then(res => {
                                form.getControl('saf-crew-member').setDataSource(res.data);
                                form.getControl('saf-crew-attend-as').setDataSource([]);
                                safCrew.ui.controls.find(c => { return c.id == 'saf-crew-member' }).dataSource = res.data;
                            })
                            .catch(err => { dialog.error(err); });
                    })
                    form.getControl('saf-crew-member').on('change', e => {
                        form.getControl('saf-crew-attend-as').value = null;
                        form.getControl('saf-crew-attend-as').setDataSource(e.object.attendAs);
                        safCrew.ui.controls.find(c => { return c.id == 'saf-crew-attend-as' }).dataSource = e.object.attendAs;
                    });




                    dialog.confirm({ title: 'manage visitor', message: form.ui, width: '300px', height: '300px' }, () => {
                        try {
                            var obj = form.getValues(true);
                            for (var k in obj) {
                                if (obj[k]?.value !== undefined) {
                                    safCrew[k] = obj[k].value;
                                    safCrew[k + '_name'] = obj[k].text;
                                } else {
                                    safCrew[k] = obj[k];
                                }
                            }
                            safCrew.dirty = true;

                            safCrew.ui.controls.find(c => { return c.id == 'saf-crew-vendor' }).value = safCrew['saf-crew-vendor'];
                            safCrew.ui.controls.find(c => { return c.id == 'saf-crew-member' }).value = safCrew['saf-crew-member'];
                            safCrew.ui.controls.find(c => { return c.id == 'saf-crew-attend-as' }).value = safCrew['saf-crew-attend-as'];

                            // @@NOTE: if we have anew item then add it to the collection 
                            var itemList = `crews`;
                            if (!this.data.siteAccessInfo[itemList]) { this.data.siteAccessInfo[itemList] = table.data; }
                            if (this.data.siteAccessInfo[itemList].indexOf(safCrew) < 0) { this.data.siteAccessInfo[itemList].push(safCrew); }
                            table.render(this.data.siteAccessInfo[itemList], true)

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

            deleteRecord(safRecord, table) {
                var deleteRecordCollectionName = 'crews_deleted';
                if (safRecord.delete) {
                    if (safRecord.id) {
                        if (!this.data.siteAccessInfo[deleteRecordCollectionName]) { this.data.siteAccessInfo[deleteRecordCollectionName] = []; }
                        this.data.siteAccessInfo[deleteRecordCollectionName].push(safRecord);
                    }
                    table.data.splice(table.data.indexOf(safRecord), 1);
                    table.render(table.data, true);
                    this.dirty = true
                    return true;
                }
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
