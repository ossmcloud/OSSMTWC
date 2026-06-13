/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_srfWorkflowItemPersistent.js', './oTWC_config.js'],
    (core, coreSQL, twcSafWorkflowItem, twcConfig) => {

        class OSSMTWC_SAFWorkflowItem extends twcSafWorkflowItem.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafWorkflowItem.Type,
            Fields: twcSafWorkflowItem.Fields,
            FieldsInfo: twcSafWorkflowItem.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_SAFWorkflowItem(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAFWorkflowItem();
                return rec.select(options);
            },

            getFields: () => {
                return twcConfig.getFields(twcSafWorkflowItem.Type);
            }



        }
    });
