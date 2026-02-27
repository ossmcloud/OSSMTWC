/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_planningPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcPlan, twcUtils) => {



        class OSSMTWC_Planning extends twcPlan.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcPlan.Type,
            Fields: twcPlan.Fields,
            FieldsInfo: twcPlan.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_Planning(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Planning();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcPlan.Type);
            }

        }
    });
