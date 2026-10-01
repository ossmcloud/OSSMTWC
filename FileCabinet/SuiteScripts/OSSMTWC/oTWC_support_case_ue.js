/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'N/format', './data/oTWC_config.js', './data/oTWC_troubleTickets.js', './data/oTWC_site.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (runtime, core, oui, recu, format, twcConfig, twcTroubleTicket, twcSite, coreSql) => {

        function beforeLoad(context) {
        }

        function afterSubmit(context) {
            try {
                var newRec = context.newRecord
                var oldRec = context.oldRecord

                if (context.type == context.UserEventType.EDIT) {
                    updateTroubleTicket(oldRec, newRec)
                }
            }
            catch (error) {
                core.logDebug('AFTER-SUBMIT', `${context.newRecord.id}: ${error.message})`);
                core.logDebug('AFTER-SUBMIT-STACK', `${context.newRecord.id}: ${error.stack || 'NO STACK'})`);
            }
        }

        function updateTroubleTicket(oldRec, newRec) {

            var tktId = newRec.getValue('custevent_twc_trbl_tkt')
            if (!tktId) return

            var values = {}

            updateStatus(values, oldRec, newRec)
            updateIssue(values, oldRec, newRec)

            if (!Object.keys(values).length) return
            recu.submit(twcTroubleTicket.Type, tktId, values)
        }

        function updateStatus(values, oldRec, newRec) {

            var oldStatus = oldRec && oldRec.getValue('status')
            var newStatus = newRec.getValue('status')

            if ((oldStatus || '') === (newStatus || '')) return

            var mappedStatus = getMappedValue(newStatus, 'customrecord_twc_case_tkt_status', 'custrecord_twc_case_tkt_sts_case', 'custrecord_twc_case_tkt_sts_tkt')
            log.debug("mappedValue - status", mappedStatus)
            if (mappedStatus) values[twcTroubleTicket.Fields.STATUS] = mappedStatus
        }

        function updateIssue(values, oldRec, newRec) {

            var oldIssue = oldRec && oldRec.getValue('issue')
            var newIssue = newRec.getValue('issue')

            if ((oldIssue || '') === (newIssue || '')) return

            var mappedIssue = getMappedValue(newIssue, 'customrecord_twc_case_tkt_category', 'custrecord_twc_case_tkt_case_issue', 'custrecord_twc_case_tkt_ctgry')
            log.debug("mappedValue - issue", mappedIssue)
            if (mappedIssue) values[twcTroubleTicket.Fields.CATEGORY] = mappedIssue
        }

        function getMappedValue(value, record, caseField, tktField) {

            var mappedValue = null
            var sql = `SELECT ${tktField} FROM ${record} WHERE isinactive = 'F' AND ${caseField} = '${value}' ORDER BY id FETCH FIRST 1 ROW ONLY`
            log.debug("SQL", sql)
            coreSql.each(sql, row => mappedValue = row[tktField])
            return mappedValue
        }
      


        return {
            afterSubmit: afterSubmit


        }
    });
