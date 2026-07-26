/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './ui/module/oTWC_siteAccessUtils.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcSiteAccessUtils) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())
        }

        function openSaf() {
            location.href = core.url.script('otwc_siteaccess_sl', { recId: currentRecord.get().id });
        }

        function deleteSaf() {
            if (!confirm('Are you sure you want to delete this SAF?')) { return; }
            twcSiteAccessUtils.deleteSaf(currentRecord.get().id);
            location.href = core.url.record('customrecord_twc_saf').replace('custrecordentry', 'custrecordentrylist');
        }


        return {
            pageInit: pageInit,
            openSaf: openSaf,
            deleteSaf: deleteSaf,
        }
    });


