/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_lockPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcLock, twcUtils) => {



        class OSSMTWC_Lock extends twcLock.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcLock.Type,
            Fields: twcLock.Fields,
            FieldsInfo: twcLock.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_Lock(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Lock();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcLock.Type);
            }

        }
    });
