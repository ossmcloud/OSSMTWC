/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_equipmentLibPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcEquipmentLib, twcUtils) => {



        class OSSMTWC_EquipmentLib extends twcEquipmentLib.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcEquipmentLib.Type,
            Fields: twcEquipmentLib.Fields,
            FieldsInfo: twcEquipmentLib.FieldsInfo,
            EqLibStatus: twcUtils.EqLibStatus,

            get: function (id) {
                var rec = new OSSMTWC_EquipmentLib(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_EquipmentLib();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcEquipmentLib.Type);
            }



        }
    });
