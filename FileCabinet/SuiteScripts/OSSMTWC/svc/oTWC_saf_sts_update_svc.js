/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/task', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'N/email', '../data/oTWC_config.js', '../data/oTWC_saf.js', '../data/oTWC_safTimeBlock.js', 'N/render'],
    (runtime, task, core, coreSQL, recu, email, twcConfig, twcSaf, twcTB, render) => {
        
        function execute(context) {
            try {
                core.logDebug('START', 'Starting')
                if (updateSAFstatus() == 'RESTART') {
                    core.logDebug('RESTART', 'Restart....')
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_otwc_saf_status_svc',
                        deploymentId: 'customdeploy_otwc_saf_status_svc',
                    }).submit();
                } else {
                    core.logDebug('END.....', 'Done')
                }
            } catch (error) {
                core.logError('EXECUTE', error.message);
            }
        }

        function updateSAFstatus() {
            // @@TODO: currently we email the primary contractor, is this ok?
            var sql = `
                SELECT saf.id AS saf_id,
                saf.${twcSaf.Fields.PRIMARY_CONTRACTOR} AS contractor_id,
                company.custrecordtwc_entity AS vendor_id,
                NVL(saf.${twcSaf.Fields.WORKS_PHOTOS_REQ_DELAY}, 0) AS delay_days
                FROM ${twcSaf.Type} saf
                JOIN
                customrecord_twc_company company
                ON company.id = saf.${twcSaf.Fields.PRIMARY_CONTRACTOR}
                WHERE NVL(saf.${twcSaf.Fields.STATUS}, 0) != ${twcSaf.Status.AwaitingPhotos}
                AND saf.${twcSaf.Fields.R_TYPE} = 4
                AND (
                    SELECT MAX(tb.${twcTB.Fields.BLOCK_DATE})
                    FROM ${twcTB.Type} tb
                    WHERE tb.${twcTB.Fields.SAF} = saf.id
                ) + NVL(saf.${twcSaf.Fields.WORKS_PHOTOS_REQ_DELAY}, 0) < TRUNC(SYSDATE)

            `;

            var restart = '';
            core.logDebug('SQL', sql);

            coreSQL.each(sql, (saf, idx) => {
                try {
                    core.logDebug('SAF-' + idx, `SAF: ${saf.saf_id} :: Customer: ${saf.contractor_id} :: Delay: ${saf.delay_days}`);

                    recu.submit(twcSaf.Type, saf.saf_id, twcSaf.Fields.STATUS, twcSaf.Status.AwaitingPhotos);

                    if (saf.vendor_id) {
                        var mergeResult = render.mergeEmail({
                            templateId: twcConfig.SAF_AWAIT_PHOTOS_MAIL_TEMPLATE,
                            customRecord: { type: twcSaf.Type, id: saf.saf_id },
                            entity: { type: 'vendor', id: saf.vendor_id },

                        });

                        var body = mergeResult.body.replace('{{SAF_PHOTO_REQUEST}}', 'You are requested to submit photos for this SAF so that we can proceed with the next stage of processing.');

                        email.send({
                            author: twcConfig.NO_REPLY,
                            recipients: saf.vendor_id,
                            subject: mergeResult.subject,
                            body: body,
                            relatedRecords: {
                                customRecord: {
                                    id: saf.saf_id,
                                    recordType: twcSaf.Type
                                }
                            }
                        });
                    }

                    if (runtime.getCurrentScript().getRemainingUsage() < 500) {
                        restart = 'RESTART';
                        return false;
                    }
                } catch (error) {
                    if (error.message == 'Script Execution Usage Limit Exceeded') { throw error; }
                    core.logError('SAF-' + saf.saf_id, error.message);
                }
            });

            return restart;
        }

        return {
            execute: execute
        }
    });