/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_nexusRecordConfigPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, nexusRecords, twcUtils) => {



        class OSSMTWC_NexusRecord extends nexusRecords.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: nexusRecords.Type,
            Fields: nexusRecords.Fields,
            FieldsInfo: nexusRecords.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_NexusRecord(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_NexusRecord();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(nexusRecords.Type);
            }

        }
    });
