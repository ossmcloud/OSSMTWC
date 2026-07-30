/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_sdsEquipmentPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSdsEq, twcUtils) => {



        class OSSMTWC_SDSEquipment extends twcSdsEq.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSdsEq.Type,
            Fields: twcSdsEq.Fields,
            FieldsInfo: twcSdsEq.FieldsInfo,
            
            get: function (id) {
                var rec = new OSSMTWC_SDSEquipment(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SDSEquipment();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSdsEq.Type);
            },

            getField: (name) => {
                for (var k in twcSdsEq.FieldsInfo) {
                    if (twcSdsEq.FieldsInfo[k].name == name) {
                        return twcSdsEq.FieldsInfo[k];
                    }
                }
            }
        }
    });
