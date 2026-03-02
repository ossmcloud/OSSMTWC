/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_landPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcLand, twcUtils) => {



        class OSSMTWC_Land extends twcLand.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcLand.Type,
            Fields: twcLand.Fields,
            FieldsInfo: twcLand.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_Land(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Land();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcPlan.Type);
            }

        }
    });
