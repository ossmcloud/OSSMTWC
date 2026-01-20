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

            init: function (page) {
                window.twc = {};
                window.twc.page = page;
                window.twc.userPref = userPref.get(window.twc.page.data)
                window.twc.page.init();
            }


        }
    });
