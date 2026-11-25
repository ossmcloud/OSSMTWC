/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
// @@NOTE: Radix data migration: scheduled script running / resuming one run (SPEC_v1.1 §3.4)
//         parameter custscript_twc_dm_folder = run folder internal id; re-queues itself while the engine reports a restart
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', './oTWC_dm_config.js', './oTWC_dm_engine.js', './oTWC_dm_runs.js'],
    (runtime, core, dmConfig, dmEngine, dmRuns) => {

        function execute(context) {
            var folderId = runtime.getCurrentScript().getParameter({ name: dmConfig.SVC_PARAM_FOLDER });
            try {
                core.logDebug('DM START', `Run folder: ${folderId}`);
                // @@NOTE: no parameter (deployment executed manually, or parameter id on the script record not matching SVC_PARAM_FOLDER):
                //         pick up the queued / running run, there is only ever one (oTWC_dm_import_sl.js)
                if (!folderId) {
                    var active = dmRuns.getActiveRun();
                    if (!active) { throw new Error(`Missing script parameter ${dmConfig.SVC_PARAM_FOLDER} and no queued / running run found`); }
                    folderId = active.folderId;
                    core.logDebug('DM START', `No parameter ${dmConfig.SVC_PARAM_FOLDER}, picked up active run ${active.runName} (folder ${folderId})`);
                }

                if (dmEngine.execute(folderId)) {
                    core.logDebug('DM RESTART', `Run folder: ${folderId}`);
                    dmEngine.submit(folderId);
                } else {
                    core.logDebug('DM END', `Run folder: ${folderId}`);
                }
            } catch (error) {
                core.logError('DM EXECUTE', `Run folder ${folderId}: ${error.message}`);
            }
        }

        return {
            execute: execute
        }
    });
