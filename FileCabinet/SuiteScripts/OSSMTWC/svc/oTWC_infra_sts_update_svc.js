/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    'N/record',
    'N/log',
    '/.bundle/548734/O/core.sql.js'
], (record, log, coreSQL) => {

    const execute = () => {

        try {

            const results = coreSQL.run(`
                SELECT id
                FROM customrecord_twc_infra
                WHERE custrecord_twc_infra_nxt_fall_cert_date < CURRENT_DATE
                  AND custrecord_twc_infra_fall_arr_sts <> 3
            `);

            results.forEach(({ id }) => {
                try {
                    record.submitFields({
                        type: 'customrecord_twc_infra',
                        id,
                        values: {
                            custrecord_twc_infra_fall_arr_sts: 3
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                } catch (e) {
                    log.error(`Failed updating Infrastructure ${id}`, e);
                }
            });

            log.audit(
                'Infrastructure Status Update',
                `${results.length} record(s) updated.`
            );

        } catch (e) {
            log.error('Scheduled Script Failed', e);
        }
    };

    return { execute };

});