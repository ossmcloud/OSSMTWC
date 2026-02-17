/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_equipmentPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcEquipment, twcUtils) => {



        class OSSMTWC_Equipment extends twcEquipment.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcEquipment.Type,
            Fields: twcEquipment.Fields,

            get: function (id) {
                var rec = new OSSMTWC_Equipment(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Equipment();
                return rec.select(options);
            },

            lookUp: function (options) {

                var o = { fields: { id: 'value' } };
                o.fields[twcEquipment.Fields.EQUIPMENT_ID] = 'text';

                o.where = {};
                o.where[twcEquipment.Fields.CUSTOMER] = options.customer || 0;
                o.where[twcEquipment.Fields.EQ_TYPE] = options.stepType || 0;

                o.orderBy = [twcEquipment.Fields.EQUIPMENT_ID];

                return this.select(o)
            },

            getFields: () => {
                return twcUtils.getFields(twcEquipment.Type);
            }



        }
    });
