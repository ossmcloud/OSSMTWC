/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_infrastructurePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcInfra, twcUtils) => {



        class OSSMTWC_Infrastructure extends twcInfra.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcInfra.Type,
            Fields: twcInfra.Fields,

            get: function (id) {
                var rec = new OSSMTWC_Infrastructure(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Infrastructure();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcInfra.Type);
            }

        }
    });
