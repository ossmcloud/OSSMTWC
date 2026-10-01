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
                    let troubleTktType = 4
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
                    caseRecordNew.set('category', troubleTktType)

                    caseRecordNew.set('incomingmessage', newRec.getValue(twcTroubleTicket.Fields.REPORT_ISSUE__WORKS_REQUIRED))

                    let caseId = caseRecordNew.save(true)
                    recu.submit(newRec.type, newRec.id, twcTroubleTicket.Fields.CASE_REFERENCE, caseId);

                }
                if (context.type == context.UserEventType.EDIT) {
                    updateCaseRecord(context.newRecord, context.oldRecord)
                }


            }
            catch (error) {
                // @@TODO: error should be logged against trouble ticket and notified to somebody (not the customer)
                core.logDebug('AFTER-SUBMIT', `${context.newRecord.id}: ${error.message})`);
                core.logDebug('AFTER-SUBMIT-STACK', `${context.newRecord.id}: ${error.stack || 'NO STACK'})`);
            }
        }

        function updateCaseRecord(newRec, oldRec) {
            var caseId = newRec.getValue(twcTroubleTicket.Fields.CASE_REFERENCE)
            if (!caseId) return

            var values = {}

            updateCaseStatus(values, oldRec, newRec)
            updateCaseIssue(values, oldRec, newRec)
            updateCaseFields(values, oldRec, newRec, caseId)
            log.debug('values...', values)
            if (!Object.keys(values).length) return

            recu.submit('supportcase', caseId, values)
        }

        function updateCaseStatus(values, oldRec, newRec) {

            var oldStatus = oldRec && oldRec.getValue(twcTroubleTicket.Fields.STATUS)
            var newStatus = newRec.getValue(twcTroubleTicket.Fields.STATUS)

            if ((oldStatus || '') === (newStatus || '')) return

            var mappedStatus = getMappedValue(newStatus, 'customrecord_twc_case_tkt_status', 'custrecord_twc_case_tkt_sts_tkt', 'custrecord_twc_case_tkt_sts_case')
            log.debug('mappedValue - status', mappedStatus)
            if (mappedStatus) values.status = mappedStatus
        }

        function updateCaseIssue(values, oldRec, newRec) {

            var oldCategory = oldRec && oldRec.getValue(twcTroubleTicket.Fields.CATEGORY)
            var newCategory = newRec.getValue(twcTroubleTicket.Fields.CATEGORY)

            if ((oldCategory || '') === (newCategory || '')) return

            var mappedCategory = getMappedValue(newCategory, 'customrecord_twc_case_tkt_category', 'custrecord_twc_case_tkt_ctgry', 'custrecord_twc_case_tkt_case_issue')
            log.debug('mappedValue - issue', mappedCategory)
            if (mappedCategory) values.issue = mappedCategory
        }
        function getMappedValue(value, record, tktField, caseField) {

            var mappedValue = null
            var sql = `SELECT ${caseField} FROM ${record} WHERE isinactive = 'F' AND ${tktField} = '${value}' ORDER BY id FETCH FIRST 1 ROW ONLY`
            log.debug('SQL', sql)
            coreSql.each(sql, row => mappedValue = row[caseField])
            return mappedValue
        }

        function updateCaseFields(values, oldRec, newRec, caseIdss) {
            var oldWorksReq = oldRec && oldRec.getValue(twcTroubleTicket.Fields.REPORT_ISSUE__WORKS_REQUIRED)
            var newWorksReq = newRec.getValue(twcTroubleTicket.Fields.REPORT_ISSUE__WORKS_REQUIRED)

            if ((oldWorksReq || '') === (newWorksReq || '')) return
            values.incomingmessage = newRec.getValue(twcTroubleTicket.Fields.REPORT_ISSUE__WORKS_REQUIRED)
        }



        return {
            afterSubmit: afterSubmit


        }
    });
