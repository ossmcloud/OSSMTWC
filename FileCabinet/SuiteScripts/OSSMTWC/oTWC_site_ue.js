/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['/.bundle/548734/O/core.js', './data/oTWC_site.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    (core, twcSite, recu) => {


        function afterSubmit(context) {
            try {

                if (context.type == 'create' || context.type == 'edit') {
                    var name = `${context.newRecord.getValue(twcSite.Fields.SITE_ID)} : ${context.newRecord.getValue(twcSite.Fields.SITE_NAME) }`;
                    recu.submit(twcSite.Type, context.newRecord.id, twcSite.Fields.NAME, name);
                }
                
            } catch (error) {
                core.log.debug('afterSubmit', `${context.newRecord.id}: ${error.message}`);
            }
        }

        return {
            afterSubmit: afterSubmit
        }
    });
