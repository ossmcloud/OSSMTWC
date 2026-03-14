/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_safCrewPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSafCrew, twcUtils) => {



        class OSSMTWC_SAFCrew extends twcSafCrew.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafCrew.Type,
            Fields: twcSafCrew.Fields,
            FieldsInfo: twcSafCrew.FieldsInfo,


            get: function (id) {
                var rec = new OSSMTWC_SAFCrew(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAFCrew();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSafCrew.Type);
            }

            


        }
    });
