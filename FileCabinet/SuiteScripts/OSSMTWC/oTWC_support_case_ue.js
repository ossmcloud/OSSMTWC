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
            var oldStatus = oldRec && oldRec.getValue('status')
            var newStatus = newRec.getValue('status')

            if ((oldStatus || '') !== (newStatus || '')) {
                var tktStatus = getMappedStatus(newStatus)
                if (tktStatus) {
                   values[twcTroubleTicket.Fields.STATUS] = tktStatus
                }
            }
            log.debug("Value", values)

            if (!Object.keys(values).length) return
            recu.submit(twcTroubleTicket.Type, tktId, values);
        }

        function getMappedStatus(caseStatus) {
            let tktStatus = null
            coreSql.each(`
                    SELECT
                        custrecord_twc_case_tkt_sts_tkt
                    FROM customrecord_twc_case_tkt_status
                    WHERE isinactive = 'F'
                    AND custrecord_twc_case_tkt_sts_case = '${caseStatus}'
                `, row => {
                tktStatus = row.custrecord_twc_case_tkt_sts_tkt
            })
            log.debug('tktStatus', tktStatus)
            return tktStatus
        }


        return {
            afterSubmit: afterSubmit


        }
    });
