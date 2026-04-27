/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_equipmentLibCfgPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcEquipmentLibCfg, twcUtils) => {



        class OSSMTWC_EquipmentLibCfg extends twcEquipmentLibCfg.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcEquipmentLibCfg.Type,
            Fields: twcEquipmentLibCfg.Fields,
            FieldsInfo: twcEquipmentLibCfg.FieldsInfo,
            
            get: function (id) {
                var rec = new OSSMTWC_EquipmentLibCfg(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_EquipmentLibCfg();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcEquipmentLibCfg.Type);
            }



        }
    });
