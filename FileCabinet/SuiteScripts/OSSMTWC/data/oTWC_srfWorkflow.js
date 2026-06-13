/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_srfWorkflowPersistent.js', './oTWC_config.js'],
    (core, coreSQL, twcSafWorkflow, twcConfig) => {

        class OSSMTWC_SAFWorkflow extends twcSafWorkflow.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafWorkflow.Type,
            Fields: twcSafWorkflow.Fields,
            FieldsInfo: twcSafWorkflow.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_SAFWorkflow(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAFWorkflow();
                return rec.select(options);
            },

            getFields: () => {
                return twcConfig.getFields(twcSafWorkflow.Type);
            }



        }
    });
