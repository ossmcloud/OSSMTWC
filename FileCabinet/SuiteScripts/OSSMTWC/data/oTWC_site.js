/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_sitePersistent.js', './oTWC_config.js'],
    (core, coreSQL, twcSite, twcConfig) => {

        
        // @@HARDCODED @@GO-LIVE :: these map to internal ids
        const SITE_TYPE = {
            NO_STRUCTURE: 4,
            STRUCTURE_ON_ROOFTOP: 5
        }


     
        class OSSMTWC_Site extends twcSite.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSite.Type,
            Fields: twcSite.Fields,
            SiteType: SITE_TYPE,

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
                return twcConfig.getFields(twcSite.Type);
            }
            
        }
    });
