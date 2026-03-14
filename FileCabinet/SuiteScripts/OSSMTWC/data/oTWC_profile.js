/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_profilePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcProfile, twcUtils) => {



        class OSSMTWC_Profile extends twcProfile.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcProfile.Type,
            Fields: twcProfile.Fields,

            get: function (id) {
                var rec = new OSSMTWC_Profile(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Profile();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcProfile.Type);
            }

        }
    });
