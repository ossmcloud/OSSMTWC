/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../views/oTWC_baseView.js', '../../data/oTWC_config.js', '../../O/oTWC_userPref.js'],
    (core, coreSql, b64, twcBaseView, twcConfig, userPref) => {


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
