/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], () => {

    function fieldChanged(context) {
        if (context.fieldId === 'custrecord_twc_last_ser_date') {

            const record = context.currentRecord;
            const lastServiceDate = record.getValue({
                fieldId: 'custrecord_twc_last_ser_date'
            });

            if (lastServiceDate) {
                const nextServiceDate = new Date(lastServiceDate);
                nextServiceDate.setFullYear(nextServiceDate.getFullYear() + 1);

                record.setValue({
                    fieldId: 'custrecord_twc_infra_nxt_aircon_svc',
                    value: nextServiceDate
                });
            }
        }
    }

    return {
        fieldChanged
    };
});