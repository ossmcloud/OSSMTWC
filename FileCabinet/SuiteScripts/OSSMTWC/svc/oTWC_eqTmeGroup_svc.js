/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/task', 'SuiteBundles/Bundle 548734/O/core.js', '../modules/oTWC_eqTmeGroupBackfill.js'],
    (runtime, task, core, twcTmegBackfill) => {

        // @@NOTE: one-off backfill of the equipment TME Group (TMEG) (modules/oTWC_eqTmeGroupBackfill.js), deployment Not Scheduled: run it by hand
        //          parameter p1 (JSON): { "dryRun": true } only logs the counts (no writes); {} writes the mismatches
        //          { "phase": n, "lastId": n } is set on restart (phase 1 = TMEs, phase 2 = children)
        // @@HARDCODED @@GO-LIVE :: script, deployment and parameter ids
        const SCRIPT_ID = 'customscript_otwc_eqtmegroup_svc';
        const DEPLOY_ID = 'customdeploy_otwc_eqtmegroup_svc';
        const PARAM_P1 = 'custscript_otwc_eqtmegroup_svc_p1';

        function execute(context) {
            try {
                var p1 = runtime.getCurrentScript().getParameter({ name: PARAM_P1 }) || '{}';
                core.logDebug('START', 'Starting: ' + p1);
                p1 = JSON.parse(p1);

                var dryRun = p1.dryRun === true;
                var res = twcTmegBackfill.backfill({ dryRun: dryRun, phase: p1.phase, lastId: p1.lastId });
                core.logDebug('RESULT', `${dryRun ? 'DRY RUN - ' : ''}mismatches: ${res.mismatches}, updated: ${res.updated}, errors: ${res.errors}`);

                if (res.restart) {
                    core.logDebug('RESTART', `Restart from phase ${res.restart.phase}, equipment ${res.restart.lastId}`);
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: SCRIPT_ID,
                        deploymentId: DEPLOY_ID,
                        params: { [PARAM_P1]: JSON.stringify({ dryRun: dryRun, phase: res.restart.phase, lastId: res.restart.lastId }) }
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
