/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../data/oTWC_site.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js', '../../data/oTWC_equipment.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, twcIcons, twcSite, dialog, twcSiteInfoPanel, twcEquipment) => {

        // @@NOTE: Equipment section filters (data/oTWC_siteUI.js: getSiteInfoPanels), rows filtered out get this class (style in ui/views/oTWC_siteInfo.html)
        const EQ_FILTERED_CLASS = 'twc-eq-filtered';



        class TWCSiteInfoPage extends twcPageBase.TWCPageBase {
            #changes = {};
            #sitePanel = null;
            constructor() {
                super({ scriptId: 'otwc_siteInfo_sl' });


            }

            initPage() {

                this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });

                this.ui.on('change', e => {
                    if (e.id.startsWith('twc-navigation')) { return; }
                    if (e.id == 'hide-inactive-equipment-toggle' || e.id == 'site-equipment-customer') { this.applyEquipmentFilters(); return; }
                    this.#changes[e.id] = e.value;
                    console.log(this.#changes)
                    this.dirty = true
                })

                this.ui.on('click', e => {
                    console.log(e)
                    // @@NOTE: new SAF / SRF / Trouble Ticket open in a new tab so the site page stays open (same as the map site pop-up links)
                    if (e.id == 'twc-action-new-saf') {
                        window.open(core.url.script('otwc_siteaccess_sl', { siteId: this.data.siteInfo.site.id, edit: 'T' }), '_blank');
                    }
                    if(e.id == 'twc-action-new-srf') {
                        window.open(core.url.script('otwc_spacerequest_sl', { siteId: this.data.siteInfo.site.id, edit: 'T' }), '_blank');
                    }
                    if(e.id == 'twc-action-new-trbltkt') {
                        window.open(core.url.script('oTWC_troubleTicket_sl', { siteId: this.data.siteInfo.site.id, edit: 'T' }), '_blank');
                    }
                })

                core.array.each(this.ui.controls, c => {
                    if (c.type != 'table') { return; }
                    // @@NOTE: equipment tables (TME / GIE) have the related equipment as child rows
                    twcPageBase.initTableExpandCollapse(c);
                    c.onToolbarClick = e => {
                        console.log(e)
                        if (e.action == 'add-new') {
                            alert('add new record ??? ')
                            return false;
                        } else if (e.action == 'edit') {
                            alert('edit stuff dude')
                        } else if (e.action == 'delete') {
                            dialog.confirm('Are you sure you wish to delete this record', () => {
                                alert('delete stuff dude')
                            })
                        }
                    }
                })

            }

            // @@NOTE: Equipment section filters (data/oTWC_siteUI.js: getSiteInfoPanels), applied on screen (no reload):
            //              'Hide Inactive' toggle => hides the rows flagged eq_inactive (data/oTWC_equipmentUI.js: getSiteEquipment)
            //              'Customer' drop down   => hides the other customers' rows (TL users only)
            //         equipment tables = the tables whose rows carry the eq_inactive flag
            //         grouped view: a parent (TME) stays visible if any of its child rows (ATME / Feeders) is visible, so the child rows are not left without their parent
            //         the class is set on the row options too (cssClass) so it survives the table being re-rendered (sort / column filter),
            //         and by onRowInit for when the rows are re-created (back to the original sort order)
            isEquipmentFiltered(data) {
                var hideInactive = this.ui.getControl('hide-inactive-equipment-toggle')?.value;
                hideInactive = (hideInactive === true || hideInactive == 'T');
                var customer = this.ui.getControl('site-equipment-customer')?.value || '';
                if (hideInactive && data.eq_inactive == 'T') { return true; }
                if (customer && (data[twcEquipment.Fields.CUSTOMER] || '').toString() != customer.toString()) { return true; }
                return false;
            }

            applyEquipmentFilters() {
                const isFiltered = (data) => { return this.isEquipmentFiltered(data); };
                const setFiltered = (row, filtered) => {
                    var cssClass = (row.cssClass || '').replace(EQ_FILTERED_CLASS, '').trim();
                    row.cssClass = filtered ? `${cssClass} ${EQ_FILTERED_CLASS}` : cssClass;
                    if (filtered) {
                        row.ui().addClass(EQ_FILTERED_CLASS);
                    } else {
                        row.ui().removeClass(EQ_FILTERED_CLASS);
                    }
                };

                core.array.each(this.ui.controls, c => {
                    if (c.type != 'table') { return; }
                    var rows = c.getDataRows();
                    if (!rows.find(r => { return r.data?.eq_inactive !== undefined; })) { return; }

                    var parent = null; var parentHasVisibleChild = false;
                    const closeParent = () => {
                        if (parent && parentHasVisibleChild) { setFiltered(parent, false); }
                        parent = null; parentHasVisibleChild = false;
                    };
                    core.array.each(rows, row => {
                        var filtered = isFiltered(row.data);
                        if (row.data.child) {
                            if (!filtered) { parentHasVisibleChild = true; }
                        } else {
                            closeParent();
                            parent = row;
                        }
                        setFiltered(row, filtered);
                    });
                    closeParent();

                    if (!c.twcEqFilterInit) {
                        c.twcEqFilterInit = true;
                        var rowInit = c.onRowInit;
                        c.onRowInit = (table, row) => {
                            var res = rowInit ? rowInit(table, row) : undefined;
                            if (row.data && isFiltered(row.data)) { row.cssClass = `${row.cssClass || ''} ${EQ_FILTERED_CLASS}`; }
                            return res;
                        };
                    }
                });
            }

            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    var payload = this.#changes;
                    payload.id = window.twc.page.data.siteInfo.site.id;

                    await this.post({ action: 'save' }, payload);
                    this.dirty = false;
                    location.href = location.href.replace('&edit=T', '');

                } catch (error) {
                    await dialog.errorAsync(error);
                } finally {
                    this.waitClose();
                }

            }


            test() {
                dialog.iconPicker()
            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteInfoPage())
            }


        }
    });
