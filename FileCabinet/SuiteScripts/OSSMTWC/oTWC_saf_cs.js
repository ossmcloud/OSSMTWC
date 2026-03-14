/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    function (core, coreSQL, dialog, recu) {
        var _ui;

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())
          
            //jQuery('.uir-list-control-bar').css('display', 'none')
        }


        return {
            pageInit: pageInit,
        }
    });


