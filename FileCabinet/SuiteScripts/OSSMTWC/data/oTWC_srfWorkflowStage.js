/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_srfWorkflowStagePersistent.js', './oTWC_config.js'],
    (core, coreSQL, twcSafWorkflowStage, twcConfig) => {

        class OSSMTWC_SRFWorkflowStage extends twcSafWorkflowStage.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafWorkflowStage.Type,
            Fields: twcSafWorkflowStage.Fields,
            FieldsInfo: twcSafWorkflowStage.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_SRFWorkflowStage(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SRFWorkflowStage();
                return rec.select(options);
            },

            getFields: () => {
                return twcConfig.getFields(twcSafWorkflowStage.Type);
            }



        }
    });
