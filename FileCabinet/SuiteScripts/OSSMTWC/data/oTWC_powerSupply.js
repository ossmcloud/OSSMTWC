/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_powerSupplyPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcPowerSupply, twcUtils) => {



        class OSSMTWC_PowerSupply extends twcPowerSupply.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcPowerSupply.Type,
            Fields: twcPowerSupply.Fields,
            FieldsInfo: twcPowerSupply.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_PowerSupply(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_PowerSupply();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcPowerSupply.Type);
            }

        }
    });
