/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js'],
    (core, coreSql, b64, twcPageBase, twcConfig) => {


        class TWCSpaceRequestPage extends twcPageBase.TWCPageBase {

            constructor() {
                super({ scriptId: 'otwc_spaceRequest_sl' });


            }


        }

        return {

            init: function () {
                twcPageBase.init(new TWCSpaceRequestPage())
            }


        }
    });
