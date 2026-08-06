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

            initPage() {
                this.page.find('.twc-dashboard').each((i, e) => {
                    this.post({ action: 'get-dashboard' }, {id: jQuery(e).data('id')}).then(res => {
                        jQuery(e).find('.twc-dashboard-content').html(res.html)
                    })    
                })
                
            }


        }

        return {

            init: function () {
                twcPageBase.init(new TWCDashBoardsPage())
            }


        }
    });
