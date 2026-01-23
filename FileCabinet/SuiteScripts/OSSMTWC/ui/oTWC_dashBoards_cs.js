/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope public
 */
define(['./js/oTWC_dashBoards.js'],
    (twc) => {

        function pageInit(context) {
            console.log('debug ======================================>')
            twc.init();
        }

        return {
            pageInit: pageInit,
        }
    });
