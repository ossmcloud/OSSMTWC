/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_safLogPersistent.js', './oTWC_utils.js'],
    (runtime, core, coreSQL, twcSafLog, twcUtils) => {

        const LOG_TYPE = {
            INFO: 'Info',
            WARNING: 'Warning',
            ERROR: 'ERROR',
            SYSTEM: 'SYSTEM ERROR'
        }

        // @@NOTE: log category, used to split the SAF Log in two tables (data/oTWC_safUI.js: getSAFInfoPanels_WorkFlowInfo_Logs)
        //         empty = general SAF log, PHOTOS = completion photos process (status changes from Awaiting Photos on, reviewer, review / approval)
        const LOG_CATEGORY = {
            Photos: 'PHOTOS'
        }

        var _profile = null;

        class OSSMTWC_SAFLog extends twcSafLog.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }

        function log(saf, type, msg, info, profile, category) {
            try {
                if (!profile) {
                    if (!_profile) {
                        _profile = coreSQL.first(`select id from customrecord_twc_prof where custrecord_twc_prof_username = ${core.env.user()}`)?.id || null;
                        if (!_profile) {
                            // @@NOTE: the logged in user could be a contact of a customer in which case we can only find the profile using the email
                            var contactId = coreSQL.first({
                                query: `
                                    select  id, email, entitytitle as name
                                    from    entity e
                                    join    customercompanycontact ce on ce.contactscompany = ?
                                    where email = ?
                                `,
                                params: [
                                    core.env.user(),
                                    runtime.getCurrentUser().email
                                ]
                            })?.id
                            if (contactId) {
                                _profile = coreSQL.first(`select id from customrecord_twc_prof where custrecord_twc_prof_username = ${contactId}`)?.id || null;
                            }
                        }
                    }
                    profile = _profile;
                }

                var l = new OSSMTWC_SAFLog();
                l.load();
                l.sAF = saf;
                l.profile = profile;
                l.logType = type;
                l.message = msg.substring(0, 300);
                l.additionalInfo = info;
                if (category) { l.category = category; }
                l.save();
            } catch (error) {
                core.logError('SAF-LOG-ERROR-MSG', `saf: ${saf} - type: ${type} - msg: ${msg}`);
                core.logError('SAF-LOG-ERROR-INFO', `saf: ${saf} - type: ${type} - info: ${info}`);
                core.logError('SAF-LOG-ERROR', error.message);
            }
        }

        return {
            Type: twcSafLog.Type,
            Fields: twcSafLog.Fields,
            FieldsInfo: twcSafLog.FieldsInfo,
            LogType: LOG_TYPE,
            LogCategory: LOG_CATEGORY,
            // @@IMPORTANT: StatusChanged / Comment / Edited are also used to filter the SAF Log shown to external users (data/oTWC_safUI.js: getSAFInfoPanels_WorkFlowInfo_Logs)
            //              changing the text would hide the existing log entries from external users. The other messages are TL only
            LogMessage: {
                StatusChanged: 'status changed',
                Comment: 'Comment',
                Edited: 'SAF Edited',
                ReviewerAssigned: 'Reviewer assigned',
                PhotosReviewed: 'Completion photos reviewed (pending approval)',
                ReviewSentBack: 'Completion photos review sent back',
                ReviewApproved: 'Completion photos review approved',
            },

            // @@NOTE: SAF statuses that belong to the completion photos process (their status change log goes to the PHOTOS category)
            isPhotoStatus: (status) => {
                var s = twcUtils.SafStatus;
                return [s.AwaitingPhotos, s.PhotosReceived, s.PartiallyComplete, s.Complete].indexOf(parseInt(status)) >= 0;
            },


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


            logInfo: (saf, msg, info, profile, category) => {
                log(saf, LOG_TYPE.INFO, msg, info, profile, category);
            },
            logWarn: (saf, msg, info, profile, category) => {
                log(saf, LOG_TYPE.WARNING, msg, info, profile, category);
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
            },

            getStatusHtml(status) {
                var backgroundColor = 'silver'; var color = 'white';

                if (status == LOG_TYPE.WARNING) {
                    color = 'white';
                    backgroundColor = 'orange';
                } else if (status == LOG_TYPE.ERROR) {
                    color = 'white';
                    backgroundColor = 'red';
                } else if (status == LOG_TYPE.SYSTEM) {
                    color = 'white';
                    backgroundColor = 'magenta';
                }

                return `
                    <span class="twc-record-status-row" style="color: ${color}; background-color: ${backgroundColor};" >
                        ${status}
                    </span>
                `;   
            }


        }
    });

