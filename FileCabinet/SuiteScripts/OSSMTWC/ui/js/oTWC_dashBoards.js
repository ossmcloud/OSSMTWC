/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js'],
    (core, coreSql, b64, twcPageBase, twcConfig) => {


        class TWCDashBoardsPage extends twcPageBase.TWCPageBase {

            constructor() {
                super({ scriptId: 'otwc_dashboards_sl' });



            }

            // @@NOTE: the page title is the KPI section / title (oTWC_dashBoards_sl.js), the back to dashboard icon goes to its left
            //         if the NetSuite page title is not found the icon stays at the top of the page
            initKpiDetails() {
                var title = jQuery('.uir-page-title-firstline').first();
                if (title.length == 0) { return; }
                jQuery('#twc-dashboard-back').addClass('twc-dashboard-back-title').prependTo(title);
            }

            initPage() {
                // @@NOTE: KPI details page (?kpi=[id]): the list is rendered on the server, nothing to load
                if (this.data?.kpi) {
                    this.initKpiDetails();
                    return;
                }

                // @@NOTE: all the KPIs in one request (oTWC_dashBoardsUtils.js: runDashboards), values are keyed by KPI id
                this.post({ action: 'get-dashboards' }, {}).then(res => {
                    var values = res?.values || {};
                    this.page.find('.twc-dashboard').each((i, e) => {
                        var value = values[jQuery(e).data('id')];
                        jQuery(e).find('.twc-dashboard-content').html((value === undefined || value === null) ? '-' : value);
                    })
                }).catch(err => {
                    var message = err?.message || err;
                    this.page.find('.twc-dashboard-content').each((i, e) => {
                        if (jQuery(e).find('.twc-wait-cursor').length == 0) { return; }
                        jQuery(e).html(`<div style="font-size: 0.5em; font-weight: normal; color: red;">${message}</div>`);
                    })
                });

                // @@NOTE: KPI details: same suitelet with ?kpi=[id], from the portlet (NetSuite home page) or with Ctrl (Cmd on Mac) pressed it opens in a new tab
                this.page.find('.twc-dashboard').on('click', e => {
                    var url = core.url.script('otwc_dashboards_sl', { kpi: jQuery(e.currentTarget).data('id') });
                    if (this.data?.portlet || e.ctrlKey || e.metaKey) {
                        window.open(url, '_blank');
                    } else {
                        window.location.href = url;
                    }
                });

            }


        }

        return {

            init: function () {
                twcPageBase.init(new TWCDashBoardsPage())
            }


        }
    });
