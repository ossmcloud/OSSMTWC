/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix data migration: run folders, run state json and run log csv (SPEC_v1.1 §3.2, §3.3, §3.5)
//         a run = one folder under SuiteScripts > OSSMTWC - Radix holding the source csv files, {runName}.json and {runName}_log[_nnn].csv
define(['N/file', 'N/record', 'N/format', './oTWC_dm_config.js', './oTWC_dm_csv.js', './oTWC_dm_lookups.js'],
    (file, record, format, dmConfig, dmCsv, dmLookups) => {

        function getRootFolderId() {
            var rows = dmLookups.runAll(`select id from mediaitemfolder where name = ? and parent = ?`, [dmConfig.ROOT_FOLDER_NAME, dmConfig.ROOT_FOLDER_PARENT]);
            if (rows.length == 0) { throw new Error(`Folder 'SuiteScripts > ${dmConfig.ROOT_FOLDER_NAME}' not found, please create it`); }
            return rows[0].id;
        }

        function getFolderName(folderId) {
            var rows = dmLookups.runAll(`select name from mediaitemfolder where id = ?`, [folderId]);
            if (rows.length == 0) { throw new Error(`Run folder ${folderId} not found`); }
            return rows[0].name;
        }

        // @@NOTE: wall clock in Irish time (Europe/London has the same offsets), used for run names and timestamps
        function nowLocal() {
            var s = format.format({ value: new Date(), type: format.Type.DATETIME, timezone: format.Timezone.EUROPE_LONDON });
            return format.parse({ value: s, type: format.Type.DATETIME });
        }

        function pad(n) { return String(n).padStart(2, '0'); }

        function timestamp(d) {
            d = d || nowLocal();
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }

        // @@NOTE: folder name = run name = {ImportType}_{YYYY.MM.DD}_{HH.MM} (':' replaced by '.', SPEC Q16); a suffix is added if the name is taken
        //         prefix = import type (+ '-dryrun' / '-delete' for those modes)
        function createRunFolder(prefix) {
            var rootId = getRootFolderId();
            var d = nowLocal();
            var baseName = `${prefix}_${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}_${pad(d.getHours())}.${pad(d.getMinutes())}`;
            var existing = dmLookups.runAll(`select name from mediaitemfolder where parent = ? and name like ?`, [rootId, baseName + '%']).map(r => { return r.name; });
            var name = baseName;
            for (var i = 2; existing.indexOf(name) >= 0; i++) { name = `${baseName}_${i}`; }

            var folder = record.create({ type: record.Type.FOLDER });
            folder.setValue({ fieldId: 'name', value: name });
            folder.setValue({ fieldId: 'parent', value: rootId });
            return { id: folder.save(), name: name };
        }

        function saveFile(folderId, name, contents, fileType) {
            return file.create({
                name: name,
                fileType: fileType || file.Type.PLAINTEXT,
                contents: contents,
                encoding: file.Encoding.UTF8,
                folder: folderId
            }).save();
        }

        // ---------------------------------------------------------------------------------------------
        // run state
        // ---------------------------------------------------------------------------------------------
        function stateFileName(runName) { return `${runName}.json`; }

        // @@NOTE: saving a file with the same name in the same folder overwrites it (same internal id)
        function saveState(state) {
            state.updated = timestamp();
            state.stateFileId = saveFile(state.folderId, stateFileName(state.runName), JSON.stringify(state, null, 2), file.Type.JSON);
            return state.stateFileId;
        }

        function loadState(folderId) {
            var runName = getFolderName(folderId);
            var rows = dmLookups.runAll(`select id from file where folder = ? and name = ?`, [folderId, stateFileName(runName)]);
            if (rows.length == 0) { throw new Error(`Run state file '${stateFileName(runName)}' not found in folder ${folderId}`); }
            var state = JSON.parse(file.load({ id: rows[0].id }).getContents());
            state.stateFileId = rows[0].id;
            return state;
        }

        // @@NOTE: last runs (newest first), read from their state files (10 units per run)
        function listRuns(limit) {
            var rootId = getRootFolderId();
            var rows = dmLookups.runAll(`
                select  f.id, f.folder
                from    file f
                join    mediaitemfolder m on m.id = f.folder
                where   m.parent = ?
                and     f.name = m.name || '.json'
                order by f.id desc
            `, [rootId]);
            return rows.slice(0, limit || 20).map(r => {
                try {
                    var state = JSON.parse(file.load({ id: r.id }).getContents());
                    state.stateFileId = r.id;
                    return state;
                } catch (error) {
                    return { folderId: r.folder, runName: `?? (state file ${r.id}: ${error.message})`, totals: {} };
                }
            });
        }

        // @@NOTE: true when the file is a run log: {runName}_log*.csv in a run folder (folder name = run name) under the root folder
        function isLogFile(fileId) {
            if (!/^\d+$/.test(String(fileId || ''))) { return false; }
            var rows = dmLookups.runAll(`
                select  f.id
                from    file f
                join    mediaitemfolder m on m.id = f.folder
                where   f.id = ?
                and     m.parent = ?
                and     f.name like m.name || '_log%.csv'
            `, [fileId, getRootFolderId()]);
            return rows.length > 0;
        }

        function getActiveRun() {
            return listRuns(50).find(s => { return s.status == dmConfig.Status.QUEUED || s.status == dmConfig.Status.RUNNING; });
        }

        // ---------------------------------------------------------------------------------------------
        // run log: lines are buffered and appended at each checkpoint (flush), new part above LOG_MAX_BYTES
        // ---------------------------------------------------------------------------------------------
        class RunLog {
            constructor(state) {
                this.state = state;
                this.buffer = [];
                if (!state.logFileIds) { state.logFileIds = []; }
            }

            add(entry) {
                this.buffer.push(dmCsv.toCsvLine([
                    timestamp(), entry.step, entry.rowNo, entry.radixId, entry.result, entry.nsRecordType, entry.nsId, entry.message
                ]));
            }

            newPart() {
                var part = this.state.logFileIds.length + 1;
                var name = `${this.state.runName}_log${part > 1 ? '_' + String(part).padStart(3, '0') : ''}.csv`;
                var id = saveFile(this.state.folderId, name, dmCsv.toCsvLine(dmConfig.LOG_HEADER), file.Type.CSV);
                this.state.logFileIds.push(id);
                return id;
            }

            flush() {
                if (this.buffer.length == 0) { return; }
                if (this.state.logFileIds.length == 0) { this.newPart(); }
                var logFile = file.load({ id: this.state.logFileIds[this.state.logFileIds.length - 1] });
                var size = logFile.size + this.buffer.join('\n').length;
                if (size > dmConfig.LOG_MAX_BYTES) {
                    logFile = file.load({ id: this.newPart() });
                }
                this.buffer.forEach(line => { logFile.appendLine({ value: line }); });
                logFile.save();
                this.buffer = [];
            }
        }

        return {
            getRootFolderId: getRootFolderId,
            createRunFolder: createRunFolder,
            saveFile: saveFile,
            saveState: saveState,
            loadState: loadState,
            listRuns: listRuns,
            getActiveRun: getActiveRun,
            isLogFile: isLogFile,
            timestamp: timestamp,
            RunLog: RunLog
        }
    });
