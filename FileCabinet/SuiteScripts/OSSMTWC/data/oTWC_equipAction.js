/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define([ 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_equipActionPersistent.js', './oTWC_utils.js' ],
    (core, coreSQL, twcEquipAction, twcUtils) => {

        class OSSMTWC_EquipAction extends twcEquipAction.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }

        return {
            Type: twcEquipAction.Type,
            Fields: twcEquipAction.Fields,
            FieldsInfo: twcEquipAction.FieldsInfo,

            get: twcEquipAction.get,

            select: function (options) {
                var rec = new OSSMTWC_EquipAction();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcEquipAction.Type);
            }
        };

    });