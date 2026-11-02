/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope public
 */
define(['./js/oTWC_sdsFiles.js'],
    (twc) => {

        function pageInit(context) {
            twc.init();
        }

        return {
            pageInit: pageInit,
        }
    });
