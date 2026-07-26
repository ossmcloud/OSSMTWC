/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_sdsPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSds, twcUtils) => {



        class OSSMTWC_SDS extends twcSds.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSds.Type,
            Fields: twcSds.Fields,
            FieldsInfo: twcSds.FieldsInfo,
            Status: twcUtils.SdsStatus,
            // getSdsStatusName: twcUtils.getSdsStatusName,
            // getSdsStatusStyle: twcUtils.getSdsStatusStyle,
            // getSdsStatusHtml: twcUtils.getSdsStatusHtml,

            get: function (id) {
                var rec = new OSSMTWC_SDS(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SDS();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSds.Type);
            },

            getField: (name) => {
                for (var k in twcSds.FieldsInfo) {
                    if (twcSds.FieldsInfo[k].name == name) {
                        return twcSds.FieldsInfo[k];
                    }
                }
            }
        }
    });
