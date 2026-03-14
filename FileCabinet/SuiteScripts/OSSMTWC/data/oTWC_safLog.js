/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_safLogPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSafLog, twcUtils) => {

        const LOG_TYPE = {
            INFO: 'Info',
            WARNING: 'Warning',
            ERROR: 'ERROR',
            SYSTEM: 'SYSTEM ERROR'
        }

        var _profile = null;

        class OSSMTWC_SAFLog extends twcSafLog.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }

        function log(saf, type, msg, info, profile) {
            try {
                if (!profile) {
                    if (!_profile) {
                        _profile = coreSQL.first(`select id from customrecord_twc_prof where custrecord_twc_prof_username = ${core.env.user()}`)?.id || null;
                    }
                    profile = _profile;
                }

                var l = new OSSMTWC_SAFLog();
                l.load();
                l.sAF = saf;
                l.profile = profile;
                l.logType = type;
                l.message = msg;
                l.additionalInfo = info;
                l.save();
            } catch (error) {
                // @@TODO: SAF: store original message
                core.logError('SAF-LOG-ERROR', error.message);
            }
        }

        return {
            Type: twcSafLog.Type,
            Fields: twcSafLog.Fields,
            FieldsInfo: twcSafLog.FieldsInfo,
            LogType: LOG_TYPE,


            get: function (id) {
                var rec = new OSSMTWC_SAFLog(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAFLog();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSafLog.Type);
            },


            logInfo: (saf, msg, info, profile) => {
                log(saf, LOG_TYPE.INFO, msg, info, profile);
            },
            logWarn: (saf, msg, info, profile) => {
                log(saf, LOG_TYPE.WARNING, msg, info, profile);
            },
            logError: (saf, msg, info, profile) => {
                if (msg.message) {
                    log(saf, LOG_TYPE.ERROR, msg.message, info, msg.stack);
                } else {
                    log(saf, LOG_TYPE.ERROR, msg, info, profile);
                }
            },
            logSystem: (saf, msg, info, profile) => {
                if (msg.message) {
                    log(saf, LOG_TYPE.SYSTEM, msg.message, info, msg.stack);
                } else {
                    log(saf, LOG_TYPE.SYSTEM, msg, info, profile);
                }
            },
            logEx(saf, msg, error, profile) {
                log(saf, LOG_TYPE.ERROR, `${msg}: ${error?.message || 'NO ERROR MESSAGE'}`, error?.stack, profile);
            }

        }
    });

