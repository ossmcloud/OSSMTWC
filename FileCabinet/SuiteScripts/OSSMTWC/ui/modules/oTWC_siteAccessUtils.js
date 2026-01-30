/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_site.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_configUIFields.js'],
    (core, coreSQL, recu, twcSite, twcConfig, twcIcons, twcUI, twcConfigUIFields) => {


        return {
            getSiteAccessInfo: (id) => {
                // @@TODO:
                return {
                    site: 2,
                }
            }
        }

    });