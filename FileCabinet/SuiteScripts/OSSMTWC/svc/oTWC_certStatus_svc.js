/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/task', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../modules/oTWC_certStatusEngine.js'],
    (runtime, task, core, coreSQL, recu, twcCertStatusEngine) => {

        function execute(context) {

            try {

                var p1 = runtime.getCurrentScript().getParameter({ name: 'custscript_otwc_certstatus_svc_p1' }) || '{}';
                core.logDebug('START', 'Starting: ' + p1);

                if (p1) { p1 = JSON.parse(p1) };

                var restart = p1.type == 'company' ? twcCertStatusEngine.validateCompanyAccreditation(p1) : twcCertStatusEngine.validateCertStatuses(p1);
                if (restart) {
                    core.logDebug('RESTART', 'Restart....')
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_otwc_certstatus_svc',
                        deploymentId: 'customdeploy_otwc_certstatus_svc',
                        params: {
                            custscript_otwc_certstatus_svc_p1: JSON.stringify({
                                type: p1?.type,
                                lastId: restart.lastId
                            })
                        }
                    }).submit();
                } else {
                    core.logDebug('END', 'Done')
                }

            } catch (error) {
                core.logError('EXECUTE', error.message);
            }

        }


        return {
            execute: execute
        }
    });
