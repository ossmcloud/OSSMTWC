/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../views/oTWC_baseView.js', '../../data/oTWC_config.js', '../../O/oTWC_userPref.js'],
    (core, coreSql, b64, twcBaseView, twcConfig, userPref) => {

        // @@NOTE: equipment rows hidden by the equipment filters (see applyEquipmentFilters)
        const EQ_FILTERED_CLASS = 'twc-eq-filtered';

        class TWCPageBase extends twcBaseView.TWCPageBase {

            constructor(options) {
                super(options);


            }


        }

        return {

            TWCPageBase: TWCPageBase,

            async previewFile(file, e) {
                await TWCPageBase.previewFileStatic(file, e)
            },

            // @@NOTE: expand / collapse child rows (rows with data.child = true following their parent row) on a ui table
            //         the server must populate the 'expand' field with <span class="twc-srf-item-expand"> on parent rows (see oTWC_equipmentUI.js: getSiteEquipment)
            //         same logic as SRF (oTWC_spaceRequest.js: initTmeTableExpandCollapse) and SAF (oTWC_siteAccess.js)
            // @@REVIEW: SRF and SAF could use this too
            initTableExpandCollapse(table) {
                if (!table.getDataRows().find(r => { return r.data?.child; })) { return; }

                const setCollapsed = (row, collapse) => {
                    if (collapse) {
                        row.ui().addClass('o-row-hidden')
                    } else {
                        row.ui().removeClass('o-row-hidden')
                    }
                }

                table.ui.find('.twc-srf-item-expand-all').click(e => {
                    e.preventDefault();
                    e.stopPropagation();

                    var collapse = !(jQuery(e.currentTarget).data('collapsed') || false);
                    jQuery(e.currentTarget).data('collapsed', collapse);
                    jQuery(e.currentTarget).html(collapse ? '+' : '-');
                    table.ui.find('.twc-srf-item-expand').data('collapsed', collapse);
                    table.ui.find('.twc-srf-item-expand').html(collapse ? '+' : '-');
                    core.array.each(table.getDataRows(), row => {
                        if (row.data.child) { setCollapsed(row, collapse); }
                    })
                });

                table.ui.find('.twc-srf-item-expand').click(e => {
                    e.preventDefault();
                    e.stopPropagation();

                    var rowIndex = jQuery(e.currentTarget).closest('.o-row').data('idx');
                    var collapse = !(jQuery(e.currentTarget).data('collapsed') || false);
                    jQuery(e.currentTarget).data('collapsed', collapse);
                    jQuery(e.currentTarget).html(collapse ? '+' : '-');

                    var dataRows = table.getDataRows();
                    for (var x = (rowIndex + 1); x < dataRows.length; x++) {
                        if (!dataRows[x].data.child) { return; }
                        setCollapsed(dataRows[x], collapse);
                    }
                })
            },

            // @@NOTE: equipment tables client side filters, applied on screen (no reload), shared by the Site Info page Equipment section (ui/js/oTWC_siteInfo.js)
            //         and the Site Equipment page 'Customer' drop down (ui/js/oTWC_inventory.js)
            //         ui: the page ui, isFiltered(rowData) => true to hide the row
            //         equipment tables = the tables whose rows carry the eq_inactive flag (data/oTWC_equipmentUI.js: getSiteEquipment)
            //         grouped view: a parent (TME) stays visible if any of its child rows (ATME / Feeders) is visible, so the child rows are not left without their parent
            //         the class is set on the row options too (cssClass) so it survives the table being re-rendered (sort / column filter),
            //         and by onRowInit for when the rows are re-created (back to the original sort order)
            //         the page view must hide the class: div.twc-eq-filtered { display: none !important; } (ui/views/oTWC_siteInfo.html, oTWC_inventory.html)
            EQ_FILTERED_CLASS: EQ_FILTERED_CLASS,
            applyEquipmentFilters(ui, isFiltered) {
                const setFiltered = (row, filtered) => {
                    var cssClass = (row.cssClass || '').replace(EQ_FILTERED_CLASS, '').trim();
                    row.cssClass = filtered ? `${cssClass} ${EQ_FILTERED_CLASS}` : cssClass;
                    if (filtered) {
                        row.ui().addClass(EQ_FILTERED_CLASS);
                    } else {
                        row.ui().removeClass(EQ_FILTERED_CLASS);
                    }
                };

                core.array.each(ui.controls, c => {
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

                    // @@NOTE: the latest isFiltered is used by onRowInit (the page may call this again with a new filter function)
                    c.twcEqIsFiltered = isFiltered;
                    if (!c.twcEqFilterInit) {
                        c.twcEqFilterInit = true;
                        var rowInit = c.onRowInit;
                        c.onRowInit = (table, row) => {
                            var res = rowInit ? rowInit(table, row) : undefined;
                            if (row.data && c.twcEqIsFiltered(row.data)) { row.cssClass = `${row.cssClass || ''} ${EQ_FILTERED_CLASS}`; }
                            return res;
                        };
                    }
                });
            },

            // @@NOTE: makes sure a child row is visible by expanding its parent (see initTableExpandCollapse)
            expandTableRow(table, row) {
                if (!row.data?.child) { return; }
                var dataRows = table.getDataRows();
                var parentIndex = dataRows.indexOf(row);
                if (parentIndex < 0) { return; }
                while (parentIndex > 0 && dataRows[parentIndex].data.child) { parentIndex--; }
                var expand = dataRows[parentIndex].ui().find('.twc-srf-item-expand');
                if (expand.data('collapsed')) { expand.click(); }
            },


            init: function (page) {
                window.twc = {};
                window.twc.page = page;
                window.twc.userPref = userPref.get(window.twc.page.data, 'otwc_microsvc_sl')
                window.twc.page.init();
            }


        }
    });
