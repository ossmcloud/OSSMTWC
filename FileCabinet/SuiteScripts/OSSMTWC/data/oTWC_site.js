/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_sitePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSite, twcUtils) => {


     
        class OSSMTWC_Site extends twcSite.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSite.Type,
            Fields: twcSite.Fields,

            get: function (id) {
                var rec = new OSSMTWC_Site(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Site();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSite.Type);
            }
            
        }
    });
