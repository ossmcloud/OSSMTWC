/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_fileTypePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcFileType, twcUtils) => {



        class OSSMTWC_FileType extends twcFileType.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }

            get fileName() {
                return this.getText(twcFileType.Fields.FILE)
            }

        }


        return {
            Type: twcFileType.Type,
            Fields: twcFileType.Fields,

            get: function (id) {
                var rec = new OSSMTWC_FileType(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_FileType();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcFileType.Type);
            }

        }
    });
