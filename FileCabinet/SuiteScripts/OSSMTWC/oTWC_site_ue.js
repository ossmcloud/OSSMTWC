/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['/.bundle/548734/O/core.js', './data/oTWC_site.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './modules/oTWC_fsaSiteSyncEngine.js'],
    (core, twcSite, recu, twcFsaSiteSync) => {


        function afterSubmit(context) {
            try {

                if (context.type == 'create' || context.type == 'edit') {
                    var name = `${context.newRecord.getValue(twcSite.Fields.SITE_ID)} : ${context.newRecord.getValue(twcSite.Fields.SITE_NAME) }`;
                    recu.submit(twcSite.Type, context.newRecord.id, twcSite.Fields.NAME, name);
                }

            } catch (error) {
                core.log.debug('afterSubmit', `${context.newRecord.id}: ${error.message}`);
            }

            syncFsaSite(context);
        }

        // @@NOTE: keeps the FSA Site (OSSMFSA app) of the site in step (modules/oTWC_fsaSiteSyncEngine.js)
        //          errors are logged only, they never stop the site save (the nightly svc/oTWC_fsaSiteSync_svc.js catches up)
        function syncFsaSite(context) {
            try {
                if (context.type == context.UserEventType.DELETE) {
                    twcFsaSiteSync.inactivateSite(context.oldRecord.id);
                    return;
                }

                if (context.type != context.UserEventType.CREATE && context.type != context.UserEventType.EDIT && context.type != context.UserEventType.XEDIT) { return; }

                // @@NOTE: the name set above is a field submit (inline edit) that runs this script again: nothing for the FSA Site in that
                if (context.type == context.UserEventType.XEDIT) {
                    var changed = context.newRecord.getFields().filter(f => f != 'name' && f != 'id' && f.indexOf('sys_') != 0);
                    if (changed.length == 0) { return; }
                }

                var res = twcFsaSiteSync.syncSites({ all: true, ids: [context.newRecord.id] });
                if (res.created || res.updated) { core.logDebug('syncFsaSite', `${context.newRecord.id}: FSA Site ${res.created ? 'created' : 'updated'}`); }

            } catch (error) {
                core.logError('syncFsaSite', `${context.newRecord?.id || context.oldRecord?.id}: ${error.message}`);
            }
        }

        return {
            afterSubmit: afterSubmit
        }
    });
