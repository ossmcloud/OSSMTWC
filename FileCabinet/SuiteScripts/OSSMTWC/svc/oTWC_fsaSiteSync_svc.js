/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/task', 'SuiteBundles/Bundle 548734/O/core.js', '../modules/oTWC_fsaSiteSyncEngine.js'],
    (runtime, task, core, twcFsaSiteSync) => {

        // @@NOTE: creates / updates the FSA Sites from the OSSMTWC Sites (modules/oTWC_fsaSiteSyncEngine.js)
        //          scheduled every night with no parameter: only the sites with no FSA Site or modified after their FSA Site
        //          parameter p1 (JSON): { "all": true } checks every site (first population); { "lastId": n } is set on restart
        // @@HARDCODED @@GO-LIVE :: script, deployment and parameter ids
        const SCRIPT_ID = 'customscript_otwc_fsasitesync_svc';
        const DEPLOY_ID = 'customdeploy_otwc_fsasitesync_svc';
        const PARAM_P1 = 'custscript_otwc_fsasitesync_svc_p1';

        function execute(context) {
            try {
                var p1 = runtime.getCurrentScript().getParameter({ name: PARAM_P1 }) || '{}';
                core.logDebug('START', 'Starting: ' + p1);
                p1 = JSON.parse(p1);

                var res = twcFsaSiteSync.syncSites({ all: p1.all === true, fromId: p1.lastId });
                core.logDebug('RESULT', `created: ${res.created}, updated: ${res.updated}, errors: ${res.errors}`);

                if (res.restart) {
                    core.logDebug('RESTART', `Restart from site ${res.restart.lastId}`);
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: SCRIPT_ID,
                        deploymentId: DEPLOY_ID,
                        params: { [PARAM_P1]: JSON.stringify({ all: p1.all === true, lastId: res.restart.lastId }) }
                    }).submit();
                } else {
                    core.logDebug('END', 'Done');
                }

            } catch (error) {
                core.logError('EXECUTE', error.message);
            }
        }

        return {
            execute: execute
        }
    });
