/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], (record, log) => {

    const INFRA_RECORD = 'customrecord_twc_infra';

    const FIELDS = {
        infra: 'custrecord_twc_insp_infra',
        fallCert: 'custrecord_twc_inspec_fall_cert_date',
        inspDate: 'custrecord_twc_insp_date',
        status: 'custrecord_twc_infra_fall_arr_sts',
        lastCert: 'custrecord_twc_last_fall_cert_date',
        nextCert: 'custrecord_twc_infra_nxt_fall_cert_date'
    };


    const afterSubmit = ({ type, UserEventType, newRecord }) => {

        if (type !== UserEventType.CREATE) return;

        try {

            const { id, getValue } = newRecord;
            const fallCertDate = getValue({ fieldId: FIELDS.fallCert });
            if (!fallCertDate) return;
            const infraId = getValue({ fieldId: FIELDS.infra });
            const inspectionDate = getValue({ fieldId: FIELDS.inspDate });
            if (!infraId || !inspectionDate) {
                log.error('Missing Required Data', `Infrastructure: ${infraId}, Inspection Date: ${inspectionDate}` );
                return;
            }
            const nextCertDate = new Date(inspectionDate);
            nextCertDate.setFullYear(nextCertDate.getFullYear() + 1);
            record.submitFields({
                type: INFRA_RECORD, id: infraId,
                values: {
                    [FIELDS.status]: 2,
                    [FIELDS.lastCert]: inspectionDate,
                    [FIELDS.nextCert]: nextCertDate
                },
                options: { enableSourcing: false, ignoreMandatoryFields: true }
            });
            log.audit('Infrastructure Certification Updated', `Infrastructure ${infraId} updated from Inspection ${id}`);
        } catch (e) {
            log.error( 'Fall Certification Update Failed',  e );
        }
    };

    return {
        afterSubmit
    };

});