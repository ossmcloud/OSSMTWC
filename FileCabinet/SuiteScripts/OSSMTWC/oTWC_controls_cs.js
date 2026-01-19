/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js'],
    function (core, dialog) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())

        }

        return {
            pageInit: pageInit,
            testFunction() {
                try {
                    throw new Error('test')
                    alert('hello dude');
                } catch (error) {
                    dialog.error(error)
                }

            }
        }
    });
