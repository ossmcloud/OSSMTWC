/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
// @@NOTE: Radix data migration: upload / run list Suitelet (SPEC_v1.1 §3.2). Administrator only, not a portal page.
//         @@REVIEW: uses N/ui/serverWidget (not O/suitlet) because it needs native file upload fields
//         GET  ?importtype=x                         form for import type x + list of the last runs
//         GET  ?action=resume|delete&folder=id       resume a failed / stuck run, or start a roll-back run of it
//         GET  ?action=download&file=id              download a run log file (attachment)
//         POST                                       start a run (import or dry run)
define(['N/ui/serverWidget', 'N/ui/message', 'N/runtime', 'N/redirect', 'N/file', 'N/url', 'SuiteBundles/Bundle 548734/O/core.js', './oTWC_dm_config.js', './oTWC_dm_csv.js', './oTWC_dm_runs.js', './oTWC_dm_engine.js', './oTWC_dm_handlers.js'],
    (serverWidget, message, runtime, redirect, file, url, core, dmConfig, dmCsv, dmRuns, dmEngine, dmHandlers) => {

        const Mode = dmConfig.Mode;
        const Status = dmConfig.Status;

        function onRequest(context) {
            var params = context.request.parameters;
            try {
                if (context.request.method == 'POST') {
                    if (params.custpage_action != 'start') { throw new Error(`Invalid action: ${params.custpage_action}`); }
                    var runName = startRun(context);
                    return backToForm(params.custpage_type, `Run ${runName} queued`);
                }

                if (params.action == 'resume') {
                    return backToForm(params.importtype, resumeRun(params.folder));
                } else if (params.action == 'download') {
                    return downloadLog(context, params.file);
                } else if (params.action == 'delete') {
                    return backToForm(params.importtype, deleteRun(params.folder));
                } else if (params.action) {
                    throw new Error(`Invalid action: ${params.action}`);
                }

                context.response.writePage(buildForm(params.importtype, params.msg, null));

            } catch (error) {
                core.logError('DM SUITELET', error.message);
                context.response.writePage(buildForm(params.custpage_type || params.importtype, null, error.message));
            }
        }

        function backToForm(importType, msg) {
            var script = runtime.getCurrentScript();
            redirect.toSuitelet({ scriptId: script.id, deploymentId: script.deploymentId, parameters: { importtype: importType || '', msg: msg || '' } });
        }

        function selfUrl(params) {
            var script = runtime.getCurrentScript();
            return url.resolveScript({ scriptId: script.id, deploymentId: script.deploymentId, params: params });
        }

        function esc(value) {
            return String(value === null || value === undefined ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        // ---------------------------------------------------------------------------------------------
        // actions
        // ---------------------------------------------------------------------------------------------
        function startRun(context) {
            var params = context.request.parameters;
            var handler = dmHandlers.get(params.custpage_type);
            var mode = params.custpage_dryrun == 'T' ? Mode.DRYRUN : Mode.IMPORT;

            var active = dmRuns.getActiveRun();
            if (active) { throw new Error(`Run ${active.runName} is ${active.status}: only one run at a time`); }

            // @@NOTE: read + validate all files before creating anything
            var errors = [];
            var uploads = [];
            handler.files.forEach(f => {
                var upload = context.request.files[`custpage_file_${f.key}`];
                if (!upload) {
                    if (f.required) { errors.push(`${f.label}: file is required`); }
                    return;
                }
                var contents = upload.getContents();
                var missing = dmCsv.missingColumns(dmCsv.parseHeaders(contents), f.requiredColumns);
                if (missing.length > 0) { errors.push(`${f.label}: missing column(s) ${missing.join(', ')}`); }
                uploads.push({ key: f.key, contents: contents });
            });
            if (errors.length > 0) { throw new Error(errors.join(' | ')); }

            var folder = dmRuns.createRunFolder(mode == Mode.DRYRUN ? `${handler.type}-dryrun` : handler.type);
            var files = {};
            uploads.forEach(u => { files[u.key] = dmRuns.saveFile(folder.id, `${u.key}.csv`, u.contents, file.Type.CSV); });

            var state = newState(folder, handler.type, mode);
            state.files = files;
            dmRuns.saveState(state);
            dmEngine.submit(folder.id);
            return state.runName;
        }

        function newState(folder, importType, mode) {
            return {
                runName: folder.name,
                folderId: folder.id,
                importType: importType,
                mode: mode,
                status: Status.QUEUED,
                createdBy: runtime.getCurrentUser().id,
                created: dmRuns.timestamp(),
                started: null,
                finished: null,
                files: {},
                logFileIds: [],
                step: null,
                cursor: 0,
                totals: null,
                stepTotals: {},
                restarts: 0,
                lastError: null
            };
        }

        // @@NOTE: a failed run, or a run stuck in queued / running (e.g. the re-queue failed), is resumed from its saved cursor
        function resumeRun(folderId) {
            var state = dmRuns.loadState(folderId);
            if (state.status == Status.COMPLETED) { throw new Error(`Run ${state.runName} is already completed`); }
            var active = dmRuns.getActiveRun();
            if (active && active.folderId != state.folderId) { throw new Error(`Run ${active.runName} is ${active.status}: only one run at a time`); }

            state.status = Status.QUEUED;
            state.lastError = null;
            dmRuns.saveState(state);
            dmEngine.submit(state.folderId);
            return `Run ${state.runName} re-queued`;
        }

        // @@NOTE: only run log files can be downloaded (a {runName}_log*.csv inside a run folder)
        function downloadLog(context, fileId) {
            if (!dmRuns.isLogFile(fileId)) { throw new Error(`File ${fileId} is not a run log`); }
            context.response.writeFile({ file: file.load({ id: fileId }), isInline: false });
        }

        // @@NOTE: roll-back = a new run in delete mode targeting the run name (SPEC §3.8)
        function deleteRun(folderId) {
            var target = dmRuns.loadState(folderId);
            if (target.mode != Mode.IMPORT) { throw new Error(`Run ${target.runName} is not an import run, nothing to delete`); }
            var active = dmRuns.getActiveRun();
            if (active) { throw new Error(`Run ${active.runName} is ${active.status}: only one run at a time`); }

            var folder = dmRuns.createRunFolder(`${target.importType}-delete`);
            var state = newState(folder, target.importType, Mode.DELETE);
            state.targetRun = target.runName;
            dmRuns.saveState(state);
            dmEngine.submit(folder.id);
            return `Run ${state.runName} queued to delete the records of ${target.runName}`;
        }

        // ---------------------------------------------------------------------------------------------
        // form
        // ---------------------------------------------------------------------------------------------
        function buildForm(importType, msg, errorMsg) {
            var handlers = dmHandlers.list();
            var handler = handlers.find(h => { return h.type == importType; }) || handlers[0];

            var form = serverWidget.createForm({ title: 'Radix Data Migration' });
            if (msg) { form.addPageInitMessage({ type: message.Type.CONFIRMATION, title: 'Done', message: esc(msg) }); }
            if (errorMsg) { form.addPageInitMessage({ type: message.Type.ERROR, title: 'Error', message: esc(errorMsg) }); }

            // @@NOTE: import type picker as links (the file slots depend on the type)
            var links = handlers.map(h => {
                return h.type == handler.type ? `<b>${esc(h.label)}</b>` : `<a href="${esc(selfUrl({ importtype: h.type }))}">${esc(h.label)}</a>`;
            }).join(' &nbsp;|&nbsp; ');
            form.addField({ id: 'custpage_types', type: serverWidget.FieldType.INLINEHTML, label: ' ' }).defaultValue =
                `<div style="font-size: 14px; padding: 6px 0 12px 0;">Import type: &nbsp;${links}</div>`;

            var fldAction = form.addField({ id: 'custpage_action', type: serverWidget.FieldType.TEXT, label: 'action' });
            fldAction.defaultValue = 'start';
            fldAction.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            var fldType = form.addField({ id: 'custpage_type', type: serverWidget.FieldType.TEXT, label: 'type' });
            fldType.defaultValue = handler.type;
            fldType.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

            handler.files.forEach(f => {
                var fld = form.addField({ id: `custpage_file_${f.key}`, type: serverWidget.FieldType.FILE, label: f.label });
                fld.isMandatory = !!f.required;
                if (f.requiredColumns && f.requiredColumns.length > 0) { fld.setHelpText({ help: `CSV (UTF-8, comma separated, header row). Required columns: ${f.requiredColumns.join(', ')}` }); }
            });
            form.addField({ id: 'custpage_dryrun', type: serverWidget.FieldType.CHECKBOX, label: 'Validate only (dry run)' }).defaultValue = 'T';

            form.addSubmitButton({ label: `Start ${handler.label} Run` });

            addRunList(form, handler.type);
            return form;
        }

        function addRunList(form, importType) {
            var list = form.addSublist({ id: 'custpage_runs', type: serverWidget.SublistType.LIST, label: 'Last Runs' });
            var cols = [
                ['run', 'Run'], ['mode', 'Mode'], ['status', 'Status'], ['step', 'Step / Row'], ['totals', 'Read / Created / Updated / Deleted / Skipped / Valid / Errors'],
                ['started', 'Started'], ['finished', 'Finished'], ['restarts', 'Restarts'], ['log', 'Log'], ['actions', 'Actions'], ['error', 'Last Error']
            ];
            cols.forEach(c => { list.addField({ id: `custpage_${c[0]}`, type: serverWidget.FieldType.TEXTAREA, label: c[1] }); });

            var runs = [];
            try { runs = dmRuns.listRuns(20); } catch (error) {
                list.setSublistValue({ id: 'custpage_run', line: 0, value: esc(error.message) });
                return;
            }

            runs.forEach((s, line) => {
                var t = s.totals || {};
                var actions = [];
                if (s.status && s.status != Status.COMPLETED) {
                    actions.push(`<a href="${esc(selfUrl({ action: 'resume', folder: s.folderId, importtype: importType }))}" onclick="return confirm('Resume run ${esc(s.runName)}? Only do this if it is not running any more.');">Resume</a>`);
                }
                if (s.mode == Mode.IMPORT && s.status == Status.COMPLETED) {
                    actions.push(`<a href="${esc(selfUrl({ action: 'delete', folder: s.folderId, importtype: importType }))}" onclick="return confirm('DELETE all the records created by run ${esc(s.runName)}? This cannot be undone.');">Delete records</a>`);
                }
                var logs = (s.logFileIds || []).map((id, i) => { return `<a href="${esc(selfUrl({ action: 'download', file: id }))}">log${i > 0 ? ' ' + (i + 1) : ''}</a>`; }).join(' ');

                var values = {
                    run: `<a href="/app/common/media/mediaitemfolders.nl?folder=${esc(s.folderId)}" target="_blank">${esc(s.runName)}</a>${s.targetRun ? '<br/>target: ' + esc(s.targetRun) : ''}`,
                    mode: esc(s.mode),
                    status: esc(s.status),
                    step: s.step ? `${esc(s.step)} / ${esc(s.cursor)}` : '',
                    totals: [t.read, t.created, t.updated, t.deleted, t.skipped, t.valid, t.errors].map(n => { return n || 0; }).join(' / '),
                    started: esc(s.started),
                    finished: esc(s.finished),
                    restarts: esc(s.restarts || 0),
                    log: logs,
                    actions: actions.join(' &nbsp; '),
                    error: esc(s.lastError)
                };
                for (var k in values) {
                    if (values[k] === '' || values[k] === null || values[k] === undefined) { continue; }
                    list.setSublistValue({ id: `custpage_${k}`, line: line, value: String(values[k]) });
                }
            });
        }

        return {
            onRequest: onRequest
        }
    });
