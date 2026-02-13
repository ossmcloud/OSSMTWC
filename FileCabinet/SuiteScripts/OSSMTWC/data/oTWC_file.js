/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_filePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcFile, twcUtils) => {



        class OSSMTWC_File extends twcFile.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcFile.Type,
            Fields: twcFile.Fields,

            get: function (id) {
                var rec = new OSSMTWC_File(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_File();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcFile.Type);
            }

        }
    });
