/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'N/format', 'N/record'],
    (runtime, core, oui, recu, format, record) => {

        function beforeLoad(context) {
        }

        function afterSubmit(context) {
            try {
                var newRec = context.newRecord
                if (context.type == context.UserEventType.CREATE) {

                    let dateTimeStr = newRec.getValue('custrecord_twc_trbl_tkt_submitted');
                    log.debug("dateTimeStr", dateTimeStr)

                    let dateTimeObj = format.parse({
                        value: dateTimeStr,
                        type: format.Type.DATETIMETZ
                    });
                    log.debug("dateTimeObj", dateTimeObj)

                    let caseRecordNew = recu.new('supportcase', true)
                    let siteId = newRec.getValue('custrecord_twc_trbl_tkt_site')
                    let siteName = recu.lookUp('customrecord_twc_site', siteId, 'name')
                    let cusTkt = newRec.getValue('custrecord_twc_trbl_tkt_customer') 
                    let customer = cusTkt ? recu.lookUp('customrecord_twc_company', cusTkt, 'custrecordtwc_entity').value : 822
                    caseRecordNew.set('title', siteName)
                    caseRecordNew.set('company', customer || 822)
                    caseRecordNew.set('profile', 1)
                    caseRecordNew.set('status', 1)
                    caseRecordNew.set('startdate', dateTimeObj)
                    caseRecordNew.set('custevent_twc_trbl_tkt', newRec.id)

                    let caseId = caseRecordNew.save(true)
                    recu.submit(newRec.type, newRec.id, 'custrecord_twc_trbl_tkt_case', caseId);

                }

            }
            catch (error) {
                core.logDebug('AFTER - SUBMIT', error)
            }
        }


        return {
            afterSubmit: afterSubmit


        }
    });
