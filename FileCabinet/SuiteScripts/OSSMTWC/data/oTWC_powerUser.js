/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_powerUserPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcPowerUser, twcUtils) => {



        class OSSMTWC_PowerUser extends twcPowerUser.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcPowerUser.Type,
            Fields: twcPowerUser.Fields,
            FieldsInfo: twcPowerUser.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_PowerUser(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_PowerUser();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcPowerUser.Type);
            }

        }
    });
