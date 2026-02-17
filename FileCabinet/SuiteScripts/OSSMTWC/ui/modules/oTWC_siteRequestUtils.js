/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../data/oTWC_srfUI.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSQL, recu, twcSrf, twcSrfItem, twcSrfUI, twcConfig, twcIcons, twcUI) => {


        return {

            getSRFInfoPanels: twcSrfUI.getSRFInfoPanels,
            getSrfChildRecord: (options) => {
                //throw new Error(JSON.stringify(options.item))

                var srf = twcSrf.get(options.srf.id);
                srf.copyFromObject(options.srf);

                var childRecord = twcSrfItem.get(options.item.id);
                childRecord.copyFromObject(options.item);

                return twcSrfUI.getSrfChildRecord(srf, childRecord);
            },

            getSiteRequestInfo: (pageData) => {

                var srf = twcSrf.get(pageData.recId);
                if (pageData.recId) {
                    // @@TODO: this is an existing SRF

                } else {

                    // 
                    if (pageData.userInfo.isCustomer) {

                        srf[twcSrf.Fields.CUSTOMER] = pageData.userInfo.id;

                    } else if (pageData.userInfo.isVendor) {

                        // @@TODO: we should only list the customers this vendor can work on behalf of

                    }

                }




                return srf;
            }
        }

    });