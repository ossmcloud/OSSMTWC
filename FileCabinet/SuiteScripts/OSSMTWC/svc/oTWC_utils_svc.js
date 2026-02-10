/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/task', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    (runtime, task, core, coreSQL, recu) => {

        function execute(context) {

            try {

                core.logDebug('START', 'Starting')
                if (deleteDuplicates() == 'RESTART') {
                    core.logDebug('RESTART', 'Restart....')
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_otwc_utils_svc',
                        deploymentId: 'customdeploy_otwc_utils_svc',
                    }).submit();
                } else {
                    core.logDebug('END', 'Done')
                }

            } catch (error) {
                core.logError('EXECUTE', error.message);
            }

        }


        function deleteDuplicates() {
            // these are the sites we want to keep
            var sites = coreSQL.run(`select id, custrecord_twc_site_id as site_id from customrecord_twc_site where id < 501 order by custrecord_twc_site_id`);

            // these are the sites we want to delete
            var duplicateSites = coreSQL.run(`select id, custrecord_twc_site_id as site_id from customrecord_twc_site where id >= 501 order by id`);

            //
            var fkTables = coreSQL.run(`
                select      lower(c.scriptid) as record_type, c.name, LOWER(cf.scriptid) as field_id, cf.name as field_label
                from        customfield cf
                join        customrecordtype c on c.internalid = cf.recordtype
                left join   customrecordtype l on l.internalid = cf.fieldvaluetyperecord
                where       l.scriptid=UPPER('customrecord_twc_site')
                and         c.isinactive='F'
                order by c.name
            `)

            const moveAllLinkedRecords = (duplicateSite, keepSite) => {
                core.array.each(fkTables, fkTable => {
                    moveLinkedRecords(fkTable, duplicateSite, keepSite);
                })
            }
            const moveLinkedRecords = (fkTable, duplicateSite, keepSite) => {
                var sql = `
                    select  id,
                    from    ${fkTable.record_type}
                    where   ${fkTable.field_id} = ${duplicateSite.id}
                `
                coreSQL.each(sql, linkedRecord => {
                    core.logDebug('move linked record', `${fkTable.record_type} ::  ${linkedRecord.id}`)
                    recu.submit(fkTable.record_type, linkedRecord.id, fkTable.field_id, keepSite.id);
                })
            }

            var restart = '';
            core.array.each(duplicateSites, (ds, idx) => {
                try {

                    var site = sites.find(ss => { return ss.site_id == ds.site_id });
                    if (!site) { throw new Error(`No Site to keep: ${DS.site_id}`); }
                    core.logDebug('SITE-' + idx, `ds: ${ds.site_id}::${ds.id} - site: ${site.site_id}::${site.id}`);

                    // move all related records
                    moveAllLinkedRecords(ds, site);

                    // delete duplicate
                    recu.del('customrecord_twc_site', ds.id);


                    //if (idx > 9) { return false; }
                    if (runtime.getCurrentScript().getRemainingUsage() < 500) {
                        restart = 'RESTART';
                        return false;
                    }

                } catch (error) {
                    if (error.message == 'Script Execution Usage Limit Exceeded') { throw error; }
                    core.logError('EXECUTE', `${ds.id}: ${error.message}`);
                }
            })

            return restart;


        }


        return {
            execute: execute
        }
    });
