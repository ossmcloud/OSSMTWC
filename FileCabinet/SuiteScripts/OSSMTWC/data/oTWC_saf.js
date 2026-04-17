/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_safPersistent.js', './oTWC_utils.js', './oTWC_safLog.js'],
    (core, coreSQL, twcSaf, twcUtils, twcSafLog) => {



        class OSSMTWC_SAF extends twcSaf.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }

            log(type, msg, info, profile) {
                twcSafLog.log(this.id, type, msg, info, profile);
            }
            logInfo(msg, info, profile) {
                twcSafLog.logInfo(this.id, msg, info, profile);
            }
            logWarn(msg, info, profile) {
                twcSafLog.logWarn(this.id, msg, info, profile);
            }
            logError(msg, info, profile) {
                twcSafLog.logWarn(this.id, msg, info, profile);
            }
            logSystem(msg, info, profile) {
                twcSafLog.logSystem(this.id, msg, info, profile);
            }
            logEx(msg, error, profile) {
                twcSafLog.logEx(this.id, msg, error, profile);
            }

        }


        return {
            Type: twcSaf.Type,
            Fields: twcSaf.Fields,
            FieldsInfo: twcSaf.FieldsInfo,
            Status: twcUtils.SafStatus,
            getSafStatusName: twcUtils.getSafStatusName,
            getSafStatusStyle: twcUtils.getSafStatusStyle,
            getSafStatusHtml: twcUtils.getSafStatusHtml,


            get: function (id) {
                var rec = new OSSMTWC_SAF(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAF();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSaf.Type);
            },

            


        }
    });
