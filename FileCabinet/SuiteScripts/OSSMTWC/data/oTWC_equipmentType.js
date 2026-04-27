/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_equipmentTypePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcEquipmentType, twcUtils) => {


        class OSSMTWC_EquipmentType extends twcEquipmentType.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcEquipmentType.Type,
            Fields: twcEquipmentType.Fields,

            get: function (id) {
                var rec = new OSSMTWC_EquipmentType(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_EquipmentType();
                return rec.select(options);
            },

            lookUp: function (stepType) {

                var o = { fields: { id: 'value' } };
                o.fields[twcEquipmentType.Fields.NAME] = 'text';

                o.where = {};
                o.where[twcEquipmentType.Fields.CLASS] = stepType || 0;

                o.orderBy = [twcEquipmentType.Fields.NAME];

                return this.select(o)
            },

            getFields: () => {
                return twcUtils.getFields(twcEquipmentType.Type);
            }

        }
    });
