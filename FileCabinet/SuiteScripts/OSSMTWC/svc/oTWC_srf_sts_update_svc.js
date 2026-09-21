/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/task', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'N/email', '../data/oTWC_utils.js', '../data/oTWC_srf.js'],
    (runtime, task, core, coreSQL, recu, email, twcUtils, twcSrf) => {
        
        function execute(context) {
            try {
                core.logDebug('START', 'Starting')
                if (updateSRFstatus() == 'RESTART') {
                    core.logDebug('RESTART', 'Restart....')
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_otwc_srf_status_svc',
                        deploymentId: 'customdeploy_otwc_srf_status_svc',
                    }).submit();
                } else {
                    core.logDebug('END.....', 'Done')
                }
            } catch (error) {
                core.logError('EXECUTE', error.message);
            }
        }

        function updateSRFstatus() {
            var sql = `
                select  srf.id
                from    customrecord_twc_srf srf
                join    customrecord_twc_eq_action ea on ea.custrecord_twc_eq_action_srf = srf.id
                where   srf.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceExecuted}
                and     ea.custrecord_twc_eq_action_sts not in (${twcUtils.EqActionStatus.Pending})
                group by srf.id 
            `;

            var restart = '';
            coreSQL.each(sql, (srf, idx) => {
                try {
                    core.logDebug('SRF-' + srf.id, 'Completing...');

                    // @@TODO: we should probably  call setSRFCompleteStatus

                    recu.submit(twcSrf.Type, srf.id, twcSrf.Fields.SRF_STATUS, twcUtils.SrfStatus.Completed);
                    if (core.env.units < 50) {
                        restart = 'RESTART';
                        return false;
                    }

                } catch (error) {
                    if (error.message == 'Script Execution Usage Limit Exceeded') { throw error; }
                    core.logError('SRF-' + srf.id, error.message);
                }
            });

            return restart;
        }

        return {
            execute: execute
        }
    });