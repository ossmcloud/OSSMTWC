/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix -> Nexus data migration: shared constants (see data_migration/.docs/SPEC_v1.1.md)
define([],
    () => {

        // @@HARDCODED @@GO-LIVE :: scheduled script / deployment running the imports (oTWC_dm_import_svc.js)
        const SVC_SCRIPT_ID = 'customscript_twc_dm_import_svc';
        // @@HARDCODED @@GO-LIVE :: scheduled script deployment (must not be scheduled, it is only submitted on demand)
        const SVC_DEPLOYMENT_ID = 'customdeploy_twc_dm_import_svc';
        // @@HARDCODED @@GO-LIVE :: scheduled script parameter holding the run folder internal id
        const SVC_PARAM_FOLDER = 'custscript_twc_dm_folder';

        // @@HARDCODED @@GO-LIVE :: root folder of all runs: SuiteScripts (-15) > OSSMTWC - Radix (looked up by name, must exist)
        const ROOT_FOLDER_PARENT = -15;
        const ROOT_FOLDER_NAME = 'OSSMTWC - Radix';

        // @@NOTE: when remaining units drop below this the engine saves its state and re-queues itself
        const UNITS_THRESHOLD = 200;
        // @@NOTE: state + log are flushed every n rows (file saves cost 20 units each)
        const CHECKPOINT_ROWS = 250;
        // @@NOTE: log files roll over to a new part above this size (NetSuite file limit is 10MB)
        const LOG_MAX_BYTES = 9 * 1024 * 1024;

        const MODE = {
            IMPORT: 'import',
            DRYRUN: 'dryrun',
            DELETE: 'delete'
        }

        const STATUS = {
            QUEUED: 'queued',
            RUNNING: 'running',
            COMPLETED: 'completed',
            FAILED: 'failed'
        }

        const RESULT = {
            CREATED: 'CREATED',
            UPDATED: 'UPDATED',
            DELETED: 'DELETED',
            SKIPPED_DUPLICATE: 'SKIPPED_DUPLICATE',
            SKIPPED: 'SKIPPED',
            VALID: 'VALID',
            ERROR: 'ERROR'
        }

        // @@NOTE: lookup tables with a 'Radix Name' field: when it is not empty it is used for the by-name lookup instead of the record name
        //         (oTWC_dm_lookups.js: byName). { table: radix name field id }
        const RADIX_NAME_FIELDS = {
            customrecord_twc_srf_itm_typ_opt: 'custrecord_twc_srf_itm_typ_opt_radixname'
        }

        // @@NOTE: header of the run log csv (oTWC_dm_runs.js: RunLog)
        // @@NOTE: SRF import (SPEC_v1.2 §6.2.4, Q7): Radix SDS 'Agreement Template' id => Nexus customrecord_twc_agreement internal id
        //         empty to start: fill it from the {runName}_values.csv file written by the SRF runs; unmapped templates are left empty with a warning
        //         e.g. { '2': 5, '7': 6 }
        const AGREEMENT_TEMPLATE_MAP = {
            // @@HARDCODED @@GO-LIVE :: Nexus agreement internal ids (differ per account)
        }

        const LOG_HEADER =['timestamp', 'step', 'rowNo', 'radixId', 'result', 'nsRecordType', 'nsId', 'message'];

        return {
            SVC_SCRIPT_ID: SVC_SCRIPT_ID,
            SVC_DEPLOYMENT_ID: SVC_DEPLOYMENT_ID,
            SVC_PARAM_FOLDER: SVC_PARAM_FOLDER,
            ROOT_FOLDER_PARENT: ROOT_FOLDER_PARENT,
            ROOT_FOLDER_NAME: ROOT_FOLDER_NAME,
            UNITS_THRESHOLD: UNITS_THRESHOLD,
            CHECKPOINT_ROWS: CHECKPOINT_ROWS,
            LOG_MAX_BYTES: LOG_MAX_BYTES,
            LOG_HEADER: LOG_HEADER,
            RADIX_NAME_FIELDS: RADIX_NAME_FIELDS,
            AGREEMENT_TEMPLATE_MAP: AGREEMENT_TEMPLATE_MAP,
            Mode: MODE,
            Status: STATUS,
            Result: RESULT
        }
    });
