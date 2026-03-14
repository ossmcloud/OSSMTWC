/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', './oTWC_googleMap.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', './oTWC_siteLocatorPanel.js', '../../O/controls/oTWC_ui_table.js', '../../data/oTWC_site.js', '../../data/oTWC_utils.js', '../../data/oTWC_saf.js', '../../data/oTWC_safUI.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_fieldPanel.js', '../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, googleMap, dialog, twcSiteInfoPanel, twcSiteLocatorPanel, uiTable, twcSite, twcUtils, twcSaf, twcSafUI, twcIcons, twcUIPanel, twcUI) => {



        // @@TODO: this should be from site access table
        class TWCSiteTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var safLink = core.url.script('otwc_siteaccess_sl');
                var unboundCols = [];
                // unboundCols.push({
                //     id: 'open_saf', title: 'SAF', unbound: true,
                //     styles: { 'text-align': 'center' },
                //     noSort: true,
                //     sortIdx: 999,
                //     initValue: (d) => {
                //         return `<a href="${safLink}&recId=${d.id}">view</a>`;
                //     }
                // })
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
                if (col.id == 'site_id') { return false; }
                if (col.id == 'name') {
                    col.title = 'SAF ID';
                    col.addCount = true;
                    col.link = {
                        url: core.url.script('otwc_siteaccess_sl') + '&recId=${id}',
                        valueField: 'id'
                    }
                }

                var uf = window.twc.page.data.data.safInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    col.title = uf.label;
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                }

                if (col.id == 'site_id_text') {
                    col.title = 'Site';
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${site_id}',
                        valueField: 'site_id'
                    }
                }

                if (col.id == `${twcSaf.Fields.STATUS}_text`) {
                    col.styles = { 'text-align': 'center', width: '150px' }
                    col.formatValue = (v) => {
                        return twcSaf.getSafStatusHtml(v, 'twc-record-status-row');
                    }
                }

                // if (col.id == twcSite.Fields.SITE_NAME || col.id == twcSite.Fields.SITE_ID) {
                //     col.addCount = col.id == twcSite.Fields.SITE_NAME;
                //     col.link = {
                //         url: core.url.script('otwc_siteinfo_sl') + '&recId=${id}',
                //         valueField: 'id'
                //     }
                // }
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
            // #accessInfoSection = null;
            #accessConditionsSection = null;
            #accessRequirements = null;
            #vendorDocuments = null;

            constructor(page) {
                this.#page = page;
                this.init();
            }

            get ui() { return this.#page.ui; }
            get data() { return this.#page.data; }

            init() {
                if (!this.ui.getControl('saf-template')) { return; }

                this.#calendar = this.ui.getControl('saf-calendar');
                this.#calendarSelectionTitle = this.ui.ui.find('#saf-cal-selection-title');
                this.#calendarSelection = this.ui.ui.find('#saf-cal-selection-body');
                // this.#accessInfoSection = this.ui.ui.find('#saf-cal-selection-access-body');
                this.#accessConditionsSection = this.ui.ui.find('#saf-access-condition-info-2');

                this.ui.getControl('saf-submit').on('click', e => {
                    dialog.confirm('Are you sure you wish to submit the Access Request?', () => {
                        this.submitForm();
                    })

                })

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
                this.ui.getControl('saf-customer')?.on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-vendor')?.on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-structure')?.on('change', e => { this.refreshAccessRequirements(); });
                this.ui.getControl('saf-accommodation')?.on('change', e => { this.refreshAccessRequirements(); });

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
                        if (e.action == 'add-new') {
                            this.manageVisitor(null, e.table);
                        } else if (e.action == 'edit') {
                            this.manageVisitor(e.rowData, e.table);
                        } else if (e.action == 'delete') {
                            dialog.confirm('Are you sure you wish to delete this record', () => {
                                e.rowData.delete = true;
                                this.manageVisitor(e.rowData, e.table);
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
                            this.data.siteTimeBlocks[timeBlockDate] = { blocksCount: 0 }
                            timeBlock = this.data.siteTimeBlocks[timeBlockDate];
                        }
                        timeBlock.blocksCount++;

                        this.#calendar.specialDates[timeBlockDate] = { css: timeBlock.blocksCount > 3 ? 'o-calendar-red' : 'o-calendar-orange' }

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

                        if (!this.#accessRequirements.timeBlocks) {
                            this.#accessRequirements.timeBlocks = {};
                            this.#accessRequirements.timeBlocksAllocated = 0;
                        }
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
                this.#calendar.on('change', {});
            }

            refreshAccessRequirements() {
                var showStep3 = true;
                if (this.ui.getControl('saf-mast-access') && this.ui.getControl('saf-mast-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-building-access') && this.ui.getControl('saf-building-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-rooftop-access') && this.ui.getControl('saf-rooftop-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-electrical-access') && this.ui.getControl('saf-electrical-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-crane-access') && this.ui.getControl('saf-crane-access').value == '') { showStep3 = false; }
                if (this.ui.getControl('saf-structure')) { this.ui.getControl('saf-structure').hide = this.ui.getControl('saf-mast-access')?.value != 'T' }
                if (this.ui.getControl('saf-accommodation')) { this.ui.getControl('saf-accommodation').hide = this.ui.getControl('saf-building-access')?.value != 'T' }

                this.ui.find('#site-access-step-3').css('display', showStep3 ? 'block' : 'none');
                this.ui.find('#site-access-step-4').css('display', showStep3 ? 'block' : 'none');
                this.ui.find('#site-access-step-5').css('display', showStep3 ? 'block' : 'none');
                this.ui.find('#site-access-step-6').css('display', showStep3 ? 'block' : 'none');

                this.#accessConditionsSection.html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 24)}</span><span>gathering data...</span>`);

                var payload = this.ui.getValues();
                payload.siteId = this.data.siteId;
                payload.safType = this.ui.getControl('saf-type').value;
                console.log(payload)
                this.#page.post({ action: 'get-access-requirements' }, payload).then(res => {
                    //this.#accessRequirements = res;#
                    if (!this.#accessRequirements) { this.#accessRequirements = {}; }
                    for (var k in res) {
                        this.#accessRequirements[k] = res[k];
                    }
                    this.refreshInfo();
                    this.#calendar.on('change', null)
                }).catch(err => {
                    dialog.error(err);
                });

            }

            refreshInfo(forSave) {
                var htmlCond = jQuery('<div></div>');
                if (!this.#accessRequirements) {
                    htmlCond.append('<b>Select SAF Setup & Access Requirements to begin</b>');
                } else {
                    var safTypeErrorStructure = '';
                    if (this.ui.getControl('saf-structure')) {
                        var structure = this.ui.getControl('saf-structure').valueObj;
                        if (structure?.saf_types) {
                            if (structure.saf_types.indexOf(this.ui.getControl('saf-type').value) < 0) {
                                safTypeErrorStructure = `<div style="padding: 3px; border-bottom: 1px solid var(--grid-color); color: red; font-weight: bold;">The selected structure does not allow for the selected SAF type</div>`;
                            }
                        }
                    }
                    htmlCond.append(safTypeErrorStructure);

                    var safTypeErrorAccommodation = '';
                    if (this.ui.getControl('saf-accommodation')) {
                        var structure = this.ui.getControl('saf-accommodation').valueObj;
                        if (structure?.saf_types) {
                            if (structure.saf_types.indexOf(this.ui.getControl('saf-type').value) < 0) {
                                safTypeErrorAccommodation = `<div style="padding: 3px; border-bottom: 1px solid var(--grid-color); color: red; font-weight: bold;">The selected accommodation does not allow for the selected SAF type</div>`;
                            }
                        }
                    }
                    htmlCond.append(safTypeErrorAccommodation);

                    if (this.#accessRequirements.autoApprove) {
                        htmlCond.append(`
                            <div style="padding: 3px; border-bottom: 1px solid var(--grid-color); color: limegreen; font-weight: bold;">
                                This request will be automatically approved
                            </div>
                        `);
                    }

                    var colorStyle = '';
                    if (this.#accessRequirements.timeBlocksAllocated == this.#accessRequirements.timeBlocksRequired) {
                        colorStyle = ' color: limegreen; font-weight: bold;';
                    } else if (this.#accessRequirements.timeBlocksAllocated > this.#accessRequirements.timeBlocksRequired) {
                        colorStyle = ' color: red; font-weight: bold;';
                    }
                    htmlCond.append(`
                        <div style="padding: 3px; border-bottom: 1px solid var(--grid-color);${colorStyle}">
                            ${this.#accessRequirements.timeBlocksRequired} Time-Blocks Required (${this.#accessRequirements.timeBlocksAllocated} Allocated)
                        </div>
                    `);

                    var allocatedBlocksTable = jQuery('<div class="twc-div-table-r" style="border-bottom: 1px solid var(--grid-color);"></div>');
                    htmlCond.append(allocatedBlocksTable);
                    for (var k in this.#accessRequirements.timeBlocks) {
                        if (!this.#accessRequirements.timeBlocks[k]['t']) { continue; }
                        core.array.each(this.#accessRequirements.timeBlocks[k]['t'].blocks, b => {

                            if (forSave) {
                                var allocatedBlocksTableRow = jQuery(`
                                    <div>
                                        <div style="padding: 7px;">${b.block.name} - ${k}</div>
                                    </div>
                                `);
                                allocatedBlocksTable.append(allocatedBlocksTableRow);
                            } else {
                                var allocatedBlocksTableRow = jQuery(`
                                    <div>
                                        <div data-action="remove" class="twc-clickable" style="width: 20px; text-align: center;">${twcIcons.get('trash', 16, 'red')}</div>
                                        <div style="padding: 7px;">${b.block.name} - ${k}</div>
                                    </div>
                                `);
                                allocatedBlocksTable.append(allocatedBlocksTableRow);
                                allocatedBlocksTableRow.find('[data-action="remove"]').click(e => {
                                    console.log(b.date, this.#accessRequirements.timeBlocks[b.date]['t'], b)

                                    this.#accessRequirements.timeBlocksAllocated--;
                                    this.#accessRequirements.timeBlocks[b.date].blocksCount--;
                                    this.#accessRequirements.timeBlocks[b.date]['t'].blocks.splice(this.#accessRequirements.timeBlocks[b.date]['t'].blocks.indexOf(b), 1);

                                    if (this.#accessRequirements.timeBlocks[b.date]['t'].blocks.length == 0) {
                                        delete this.#accessRequirements.timeBlocks[b.date]['t'];
                                        var idx = this.#calendar.datesContent[b.date].indexOf('This');
                                        if (idx >= 0) { this.#calendar.datesContent[b.date].splice(idx, 1) }
                                    }

                                    this.#calendar.specialDates[b.date] = { css: this.#accessRequirements.timeBlocks[b.date].blocksCount > 3 ? 'o-calendar-red' : 'o-calendar-orange' }
                                    if (this.#accessRequirements.timeBlocks[b.date].blocksCount == 0) {
                                        delete this.#calendar.specialDates[b.date]
                                    }

                                    this.refreshInfo();
                                    this.#calendar.refresh();
                                    this.#calendar.on('change', e);


                                })
                            }
                        })
                    }

                    core.array.each(this.#accessRequirements.conditions, cond => {
                        htmlCond.append(`
                            <div style="padding: 3px;">${cond.quantity == 'all' ? '<span style="color: var(--accent-fore-color); font-weight: bold;">All Crew</span>' : cond.quantity} ${cond.name} Required</div>
                        `)
                    })
                }

                if (forSave) { return htmlCond.html(); }

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
                this.#vendorDocuments = ui;

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
                        form.getControl('saf-crew-attend-as').value = null; form.getControl('saf-crew-attend-as').setDataSource(e.object?.attendAs || []);
                        safCrew.ui.controls.find(c => { return c.id == 'saf-crew-attend-as' }).dataSource = e.object?.attendAs || [];
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

                            if (!this.data.siteAccessInfo.crews) { this.data.siteAccessInfo.crews = table.data; }
                            if (this.data.siteAccessInfo.crews.indexOf(safCrew) < 0) { this.data.siteAccessInfo.crews.push(safCrew); }
                            table.render(this.data.siteAccessInfo.crews, true)

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


            submitForm() {
                try {

                    this.#page.wait();

                    var values = this.ui.getValues();

                    var saf = this.data.siteAccessInfo;
                    saf.documents = this.#vendorDocuments.getValues();
                    for (var k in values) { saf[k] = values[k]; }

                    console.log(saf);
                    console.log(this.#accessRequirements);


                    this.#page.post({ action: 'save-new-saf' }, { saf: saf, accessRequirements: this.#accessRequirements, conditionsOfAccessHtml: b64.encode(this.refreshInfo(true)) }).then(resp => {
                        if (resp.error) {
                            dialog.error(resp.error);
                            return;
                        }

                        this.#page.dirty = false;
                        window.location.href = this.#page.url({ recId: resp.id });

                    }).catch(err => {
                        dialog.error(err);
                        this.#page.waitClose();
                    });

                } catch (error) {
                    dialog.error(error);
                }
            }

        }


        class TWCSiteAccessPage extends twcPageBase.TWCPageBase {
            #sitesTable = null;
            #sitePanel = null;
            #safBuilder = null;
            constructor() {
                super({ scriptId: 'otwc_siteAccess_sl' });
            }

            initPage() {
                if (this.data.siteAccessInfo) {
                    this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });
                    if (this.data.editMode) {
                        this.#safBuilder = new TWCSiteAccessBuilder(this);
                    } else {
                        this.initSafMode();
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

                this.ui.getControl('customrecord_twc_file').ui.find('.saf-image-file').click(async e => {
                    var file=jQuery(e.currentTarget).data('file')
                    await this.previewFile(file, e.ctrlKey)
                })

                this.ui.getControl('change-status-button').on('click', e => {
                    var allowedStatues = [];
                    allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Pending, true));
                    allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Approved, true));
                    allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Rejected, true));
                    allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Completed, true));

                    var formConfig = {
                        controls: [
                            { type: twcUI.CTRL_TYPE.SELECT, id: 'status', dataSource: allowedStatues, value: this.data.siteAccessInfo[twcSaf.Fields.STATUS], lineBreak: true },
                            { type: twcUI.CTRL_TYPE.TEXTAREA, id: 'comment', value: this.data.siteAccessInfo[twcSaf.Fields.STATUS_COMMENTS], width: '100%', rows: 7 },
                        ]
                    }
                    var form = twcUI.init(formConfig);
                    dialog.open({
                        title: 'Change Status / Comment',
                        content: form.ui,
                        size: { width: '500px', height: '300px' },
                        ok: () => {
                            try {

                                this.wait();
                                var payload = form.getValues();
                                payload.saf = this.data.siteAccessInfo.id;

                                this.post({ action: 'edit-saf-status' }, payload).then(resp => {
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

                                return false;

                            } catch (error) {
                                this.wait();
                                dialog.error(error);
                                return false;
                            }
                        }
                    })

                })
            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteAccessPage())
            }


        }
    });
