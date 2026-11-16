/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix data migration engine (SPEC_v1.1 §3.4): runs the steps of an import handler row by row, keeps track of governance
//         units and stops / re-queues itself (oTWC_dm_import_svc.js) when they run low, saving the resume point in the run state json.
//         a handler (e.g. oTWC_dm_equipment.js) only maps and saves rows:
//           {
//             type, label,
//             files:   [{ key, label, required, requiredColumns: [] }],
//             steps:   [{ key, file, modes: ['import', 'dryrun'], radixId: (row) => id, prepare: (ctx) => {}, process: (row, ctx, rowNo) => result | [result] }],
//             cleanup: [{ recordType, runField, clearFields: [] }]      // delete mode, in deletion order (children first)
//           }
//         result = { result: dmConfig.Result.*, radixId, nsRecordType, nsId, message }; a thrown error logs the row as ERROR and the run goes on
define(['N/file', 'N/record', 'N/task', 'SuiteBundles/Bundle 548734/O/core.js', './oTWC_dm_config.js', './oTWC_dm_csv.js', './oTWC_dm_lookups.js', './oTWC_dm_runs.js', './oTWC_dm_handlers.js'],
    (file, record, task, core, dmConfig, dmCsv, dmLookups, dmRuns, dmHandlers) => {

        const Result = dmConfig.Result;

        function submit(folderId) {
            return task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: dmConfig.SVC_SCRIPT_ID,
                deploymentId: dmConfig.SVC_DEPLOYMENT_ID,
                params: { [dmConfig.SVC_PARAM_FOLDER]: String(folderId) }
            }).submit();
        }

        function newTotals() {
            return { read: 0, created: 0, updated: 0, deleted: 0, skipped: 0, valid: 0, errors: 0 };
        }

        function count(state, stepKey, result) {
            var k = {
                [Result.CREATED]: 'created', [Result.UPDATED]: 'updated', [Result.DELETED]: 'deleted',
                [Result.SKIPPED_DUPLICATE]: 'skipped', [Result.SKIPPED]: 'skipped', [Result.VALID]: 'valid', [Result.ERROR]: 'errors'
            }[result];
            [state.totals, state.stepTotals[stepKey]].forEach(t => {
                t.read++;
                if (k) { t[k]++; }
            });
        }

        function units() { return core.env.units(); }

        // @@NOTE: tracks the most expensive row so far, the engine stops when the remaining units could not cover another one
        //         (a fixed threshold alone is not enough when a row costs more than the threshold)
        class UnitsGuard {
            constructor() { this.maxRowCost = 0; }
            low() { return units() < dmConfig.UNITS_THRESHOLD + this.maxRowCost; }
            start() { this.before = units(); }
            end() { this.maxRowCost = Math.max(this.maxRowCost, this.before - units()); }
            info() { return `units left: ${units()}, max row cost: ${this.maxRowCost}`; }
        }

        // @@NOTE: governance errors must stop the execution, they are never logged as a row error
        function isFatal(error) {
            return error && (error.name == 'SSS_USAGE_LIMIT_EXCEEDED' || error.name == 'SSS_TIME_LIMIT_EXCEEDED' || error.name == 'SSS_INSTRUCTION_COUNT_EXCEEDED');
        }

        // @@NOTE: runs (or resumes) the run in the given folder; returns true when it stopped early and must be re-queued
        function execute(folderId) {
            var state = dmRuns.loadState(folderId);
            if (state.status == dmConfig.Status.COMPLETED) {
                core.logDebug('DM ENGINE', `Run ${state.runName} already completed`);
                return false;
            }

            var handler = dmHandlers.get(state.importType);
            state.status = dmConfig.Status.RUNNING;
            state.started = state.started || dmRuns.timestamp();
            state.lastError = null;
            if (!state.totals) { state.totals = newTotals(); }
            if (!state.stepTotals) { state.stepTotals = {}; }
            dmRuns.saveState(state);

            var log = new dmRuns.RunLog(state);
            try {
                var restart = state.mode == dmConfig.Mode.DELETE ? runDelete(state, handler, log) : runSteps(state, handler, log);
                if (restart) {
                    state.restarts = (state.restarts || 0) + 1;
                } else {
                    state.status = dmConfig.Status.COMPLETED;
                    state.finished = dmRuns.timestamp();
                }
                log.flush();
                dmRuns.saveState(state);
                core.logDebug('DM ENGINE', `Run ${state.runName}: ${restart ? 'restart' : 'completed'} - ${JSON.stringify(state.totals)}`);
                return restart;

            } catch (error) {
                core.logError('DM ENGINE', `Run ${state.runName} failed: ${error.name}: ${error.message} (step ${state.step}, cursor ${state.cursor})`);
                state.status = dmConfig.Status.FAILED;
                state.lastError = `${error.name || 'Error'}: ${error.message}`;
                // @@NOTE: after a governance error these calls fail too; the run then stays 'running' and can be resumed from the suitelet
                try { log.flush(); } catch (logError) { core.logError('DM ENGINE', 'log flush: ' + logError.message); }
                try { dmRuns.saveState(state); } catch (stateError) { core.logError('DM ENGINE', 'save state: ' + stateError.message); }
                return false;
            }
        }

        function checkpoint(state, log) {
            log.flush();
            dmRuns.saveState(state);
        }

        // ---------------------------------------------------------------------------------------------
        // import / dry run
        // ---------------------------------------------------------------------------------------------
        function runSteps(state, handler, log) {
            var steps = handler.steps.filter(s => { return s.modes.indexOf(state.mode) >= 0; });
            var idx = 0;
            if (state.step) {
                idx = steps.findIndex(s => { return s.key == state.step; });
                if (idx < 0) { throw new Error(`Step '${state.step}' not found in ${handler.type} handler`); }
            }

            // @@NOTE: per-execution cache shared by the steps (parsed files, lookup maps); rebuilt after each restart
            var cache = { files: {} };
            var guard = new UnitsGuard();
            for (; idx < steps.length; idx++) {
                var step = steps[idx];
                if (state.step != step.key) {
                    state.step = step.key;
                    state.cursor = 0;
                }
                if (!state.stepTotals[step.key]) { state.stepTotals[step.key] = newTotals(); }

                var ctx = {
                    state: state,
                    runName: state.runName,
                    mode: state.mode,
                    dryRun: state.mode == dmConfig.Mode.DRYRUN,
                    cache: cache,
                    rows: loadRows(state, cache, step.file),
                    step: step.key
                };
                // @@IMPORTANT: lookups / setup must be loaded here, outside the row try/catch: an error is then fatal for the run.
                //              (loaded lazily inside process() a failing query was logged as a row error and re-run for every row, exhausting the units)
                if (step.prepare) { step.prepare(ctx); }
                core.logDebug('DM ENGINE', `Run ${state.runName}: step ${step.key} from row ${state.cursor} of ${ctx.rows.length} - ${guard.info()}`);

                for (var i = state.cursor; i < ctx.rows.length; i++) {
                    if (guard.low()) {
                        state.cursor = i;
                        core.logDebug('DM ENGINE', `Run ${state.runName}: step ${step.key} stopping at row ${i} - ${guard.info()}`);
                        return true;
                    }

                    // @@NOTE: rowNo = line in the source file (header is line 1)
                    var rowNo = i + 2;
                    var results;
                    guard.start();
                    try {
                        results = step.process(ctx.rows[i], ctx, rowNo);
                    } catch (error) {
                        if (isFatal(error)) { throw error; }
                        var radixId = null;
                        try { radixId = step.radixId ? step.radixId(ctx.rows[i]) : null; } catch (e) { }
                        results = { result: Result.ERROR, radixId: radixId, message: error instanceof dmCsv.RowError ? error.message : `${error.name || 'Error'}: ${error.message}` };
                    }
                    guard.end();
                    if (results && !Array.isArray(results)) { results = [results]; }
                    (results || []).forEach(r => {
                        log.add({ step: step.key, rowNo: rowNo, radixId: r.radixId, result: r.result, nsRecordType: r.nsRecordType, nsId: r.nsId, message: r.message });
                        count(state, step.key, r.result);
                    });

                    if ((i + 1) % dmConfig.CHECKPOINT_ROWS == 0) {
                        state.cursor = i + 1;
                        checkpoint(state, log);
                        core.logDebug('DM ENGINE', `Run ${state.runName}: step ${step.key} checkpoint at row ${state.cursor} - ${guard.info()}`);
                    }
                }
                state.cursor = ctx.rows.length;
                checkpoint(state, log);
            }
            return false;
        }

        function loadRows(state, cache, fileKey) {
            if (!cache.files[fileKey]) {
                var fileId = state.files[fileKey];
                if (!fileId) { cache.files[fileKey] = []; return cache.files[fileKey]; }
                cache.files[fileKey] = dmCsv.parse(file.load({ id: fileId }).getContents()).rows;
            }
            return cache.files[fileKey];
        }

        // ---------------------------------------------------------------------------------------------
        // delete (roll-back) mode: SPEC §3.8; deletes all records whose run field = run name, in the handler cleanup order.
        // each record type is done in two passes: 'clear' empties the fields that reference other records of the run
        // (e.g. parent TME) so they do not block the deletion, then 'delete'. the delete run is a run of its own, state.targetRun = run to roll back
        // ---------------------------------------------------------------------------------------------
        function runDelete(state, handler, log) {
            if (!state.targetRun) { throw new Error('Delete run without target run name'); }
            var passes = [];
            handler.cleanup.forEach(c => {
                if (c.clearFields && c.clearFields.length > 0) { passes.push({ key: `${c.recordType}:clear`, target: c, clear: true }); }
                passes.push({ key: `${c.recordType}:delete`, target: c, clear: false });
            });

            var idx = 0;
            if (state.step) {
                idx = passes.findIndex(p => { return p.key == state.step; });
                if (idx < 0) { throw new Error(`Delete pass '${state.step}' not found in ${handler.type} handler`); }
            }
            if (!state.failedIds) { state.failedIds = {}; }
            var guard = new UnitsGuard();

            for (; idx < passes.length; idx++) {
                var pass = passes[idx];
                var t = pass.target;
                state.step = pass.key;
                if (!state.stepTotals[pass.key]) { state.stepTotals[pass.key] = newTotals(); }
                if (!state.failedIds[pass.key]) { state.failedIds[pass.key] = []; }
                var failed = state.failedIds[pass.key];

                var where = `${t.runField} = ?`;
                if (pass.clear) { where += ` and (${t.clearFields.map(f => { return `${f} is not null`; }).join(' or ')})`; }
                var ids = dmLookups.runAll(`select id from ${t.recordType} where ${where} order by id desc`, [state.targetRun])
                    .map(r => { return r.id; })
                    .filter(id => { return failed.indexOf(id) < 0; });

                for (var i = 0; i < ids.length; i++) {
                    if (guard.low()) {
                        core.logDebug('DM ENGINE', `Run ${state.runName}: ${pass.key} stopping - ${guard.info()}`);
                        return true;
                    }
                    guard.start();
                    try {
                        if (pass.clear) {
                            var values = {};
                            t.clearFields.forEach(f => { values[f] = ''; });
                            record.submitFields({ type: t.recordType, id: ids[i], values: values, options: { enableSourcing: false, ignoreMandatoryFields: true } });
                            log.add({ step: pass.key, result: Result.UPDATED, nsRecordType: t.recordType, nsId: ids[i], message: `cleared ${t.clearFields.join(', ')}` });
                            count(state, pass.key, Result.UPDATED);
                        } else {
                            record.delete({ type: t.recordType, id: ids[i] });
                            log.add({ step: pass.key, result: Result.DELETED, nsRecordType: t.recordType, nsId: ids[i] });
                            count(state, pass.key, Result.DELETED);
                        }
                    } catch (error) {
                        if (isFatal(error)) { throw error; }
                        failed.push(ids[i]);
                        log.add({ step: pass.key, result: Result.ERROR, nsRecordType: t.recordType, nsId: ids[i], message: `${error.name || 'Error'}: ${error.message}` });
                        count(state, pass.key, Result.ERROR);
                    }
                    guard.end();
                    if ((i + 1) % dmConfig.CHECKPOINT_ROWS == 0) { checkpoint(state, log); }
                }
                checkpoint(state, log);
            }
            return false;
        }

        return {
            execute: execute,
            submit: submit
        }
    });
