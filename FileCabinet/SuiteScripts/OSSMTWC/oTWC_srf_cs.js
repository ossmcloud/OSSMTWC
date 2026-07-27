/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './ui/module/oTWC_siteRequestUtils.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcSiteRequestUtils) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())
        }

        function openSrf() {
            location.href = core.url.script('otwc_spaceRequest_sl', { recId: currentRecord.get().id });
        }

        function deleteSrf() {
            if (!confirm('Are you sure you want to delete this SRF?')) { return; }
            twcSiteRequestUtils.deleteSrf(currentRecord.get().id);
            location.href = core.url.record('customrecord_twc_srf').replace('custrecordentry', 'custrecordentrylist');
        }


        return {
            pageInit: pageInit,
            openSrf: openSrf,
            deleteSrf: deleteSrf,
        }
    });


