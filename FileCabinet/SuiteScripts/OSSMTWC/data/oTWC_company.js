/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_companyPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcCompany, twcUtils) => {



        class OSSMTWC_Company extends twcCompany.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcCompany.Type,
            Fields: twcCompany.Fields,

            get: function (id) {
                var rec = new OSSMTWC_Company(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Company();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcCompany.Type);
            }

        }
    });
