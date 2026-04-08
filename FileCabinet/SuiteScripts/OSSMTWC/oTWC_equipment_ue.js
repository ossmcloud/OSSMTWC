/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form'],
    (runtime, core, oui) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);
               
                if (context.type == 'create') {
                    for (var p in context.request.parameters) {
                        if (p.startsWith('custrecord')) {
                            context.newRecord.setValue(p, context.request.parameters[p]);
                            form.fieldReadOnly(p);
                        }
                    }
                }


            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }



        return {
            beforeLoad: beforeLoad,

        }
    });
