/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_srfPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSrf, twcUtils) => {



        class OSSMTWC_SRF extends twcSrf.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSrf.Type,
            Fields: twcSrf.Fields,
            FieldsInfo: twcSrf.FieldsInfo,
            StepType: twcUtils.SrfStepType,
            Status: twcUtils.SrfStatus,
            getSrfStatusName: twcUtils.getSrfStatusName,
            getSrfStatusStyle: twcUtils.getSrfStatusStyle,
            getSrfStatusHtml: twcUtils.getSrfStatusHtml,

            get: function (id) {
                var rec = new OSSMTWC_SRF(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SRF();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSrf.Type);
            },

            getField: (name) => {
                for (var k in twcSrf.FieldsInfo) {
                    if (twcSrf.FieldsInfo[k].name == name) {
                        return twcSrf.FieldsInfo[k];
                    }
                }
            }
        }
    });
