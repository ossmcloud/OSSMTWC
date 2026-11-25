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
            // @@IMPORTANT: an SRF is completed only when NONE of its equipment actions is still Pending (same rule as oTWC_srfWorkflowEngine.js: setSRFCompleteStatus)
            //              this used to pick any SRF with at least ONE non pending action (join + not in), completing SRFs that still had pending actions
            //              SRFs with no equipment action at all are left alone (as before)
            // @@NOTE: SRFs migrated from Radix are skipped (data_migration SPEC_v1.2 §6.5, Q15)
            var sql = `
                select  srf.id
                from    customrecord_twc_srf srf
                where   srf.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceExecuted}
                and     nvl(srf.${twcSrf.Fields.RADIX_MIGRATED}, 'F') = 'F'
                and     exists (
                            select  1
                            from    customrecord_twc_eq_action ea
                            where   ea.custrecord_twc_eq_action_srf = srf.id
                        )
                and     not exists (
                            select  1
                            from    customrecord_twc_eq_action ea
                            where   ea.custrecord_twc_eq_action_srf = srf.id
                            and     ea.custrecord_twc_eq_action_sts = ${twcUtils.EqActionStatus.Pending}
                        )
                order by srf.id
            `;

            var restart = '';
            coreSQL.each(sql, (srf, idx) => {
                try {
                    core.logDebug('SRF-' + srf.id, 'Completing...');

                    // @@TODO: we should probably  call setSRFCompleteStatus

                    recu.submit(twcSrf.Type, srf.id, twcSrf.Fields.SRF_STATUS, twcUtils.SrfStatus.Completed);
                    if (core.env.units() < 50) {
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