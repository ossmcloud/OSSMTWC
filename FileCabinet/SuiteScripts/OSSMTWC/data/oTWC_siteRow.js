/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_rowPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcRow, twcUtils) => {



        class OSSMTWC_Row extends twcRow.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcRow.Type,
            Fields: twcRow.Fields,
            FieldsInfo: twcRow.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_Row(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Row();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcPlan.Type);
            }

        }
    });
