/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'N/format', './data/oTWC_config.js', './data/oTWC_troubleTickets.js', './data/oTWC_site.js', './data/oTWC_company.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (runtime, core, oui, recu, format, twcConfig, twcTroubleTicket, twcSite, twcCompany, coreSql) => {

        function beforeLoad(context) {
        }

        function afterSubmit(context) {
            try {
                var newRec = context.newRecord
                if (context.type == context.UserEventType.CREATE) {

                    let dateTimeStr = newRec.getValue(twcTroubleTicket.Fields.SUBMITTED);

                    let dateTimeObj = format.parse({ value: dateTimeStr, type: format.Type.DATETIMETZ });
                    
                    let caseRecordNew = recu.new('supportcase', true)
                    let siteId = newRec.getValue(twcTroubleTicket.Fields.SITE)
                    let siteName = recu.lookUp(twcSite.Type, siteId, 'name')
                    let cusTkt = newRec.getValue(twcTroubleTicket.Fields.CUSTOMER) 
                    let customer = cusTkt ? recu.lookUp(twcCompany.Type, cusTkt, twcCompany.Fields.ENTITY)?.value : null;

                    caseRecordNew.set('title', siteName)
                    caseRecordNew.set('title', siteName)
                    caseRecordNew.set('company', customer || twcConfig.TOWERCOM_ENTITY)
                    caseRecordNew.set('profile', twcConfig.TKT_CASE_PROFILE)
                    caseRecordNew.set('status', twcConfig.TKT_CASE_STATUS)
                    caseRecordNew.set('startdate', dateTimeObj)
                    caseRecordNew.set(twcConfig.Fields.CASE.TKT_RECORD, newRec.id)

                    caseRecordNew.set('incomingmessage', newRec.getValue(twcTroubleTicket.Fields.REPORT_ISSUE__WORKS_REQUIRED))

                    let caseId = caseRecordNew.save(true)
                    recu.submit(newRec.type, newRec.id, twcTroubleTicket.Fields.CASE_REFERENCE, caseId);

                }
                if (context.type == context.UserEventType.EDIT) {
                    updateCaseStatus(context.newRecord, context.oldRecord)
                }


            }
            catch (error) {
                // @@TODO: error should be logged against trouble ticket and notified to somebody (not the customer)
                core.logDebug('AFTER-SUBMIT', `${context.newRecord.id}: ${error.message})`);
                core.logDebug('AFTER-SUBMIT-STACK', `${context.newRecord.id}: ${error.stack || 'NO STACK'})`);
            }
        }

        function updateCaseStatus(newRec, oldRec) {
            try {
                var newStatus = newRec.getValue(twcTroubleTicket.Fields.STATUS)
                var oldStatus = oldRec.getValue(twcTroubleTicket.Fields.STATUS)
                var caseId = newRec.getValue(twcTroubleTicket.Fields.CASE_REFERENCE)
                if (!caseId) return
                var values = {}
                if ((oldStatus || '') !== (newStatus || '')) {
                    var caseStatus = getMappedStatus(newStatus)
                    if (caseStatus) {
                        values.status = caseStatus
                    }
                }
                if (!Object.keys(values).length) return
                recu.submit('supportcase', caseId, values);
            }
            catch (error) {
                core.logDebug('AFTER-SUBMIT update case status', `${newRec.id}: ${error.message})`);
                core.logDebug('AFTER-SUBMIT-STACK', `${newRec.id}: ${error.stack || 'NO STACK'})`);
            }

        }

         function getMappedStatus(tktStatus) {
            let caseStatus = null
            coreSql.each(`
                    SELECT
                        custrecord_twc_case_tkt_sts_case
                    FROM customrecord_twc_case_tkt_status
                    WHERE isinactive = 'F'
                    AND custrecord_twc_case_tkt_sts_tkt = '${tktStatus}'
                    FETCH FIRST 1 ROW ONLY
                `, row => {
                caseStatus = row.custrecord_twc_case_tkt_sts_case
            })
            log.debug('caseStatus', caseStatus)
            return caseStatus
        }


        return {
            afterSubmit: afterSubmit


        }
    });
