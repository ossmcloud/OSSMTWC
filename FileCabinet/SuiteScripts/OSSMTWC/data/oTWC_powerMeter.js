/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_powerMeterPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcPowerMeter, twcUtils) => {



        class OSSMTWC_PowerMeter extends twcPowerMeter.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcPowerMeter.Type,
            Fields: twcPowerMeter.Fields,
            FieldsInfo: twcPowerMeter.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_PowerMeter(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_PowerMeter();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcPowerMeter.Type);
            }

        }
    });
