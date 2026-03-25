/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js'],
    function (currentRecord, core) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())
        }

        function openCompany() {
            location.href = core.url.script('otwc_companyprofile_sl', { recId: currentRecord.get().id });
        }


        return {
            pageInit: pageInit,
            openCompany: openCompany,
        }
    });


