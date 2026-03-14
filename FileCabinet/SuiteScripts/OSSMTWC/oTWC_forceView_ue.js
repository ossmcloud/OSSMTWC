/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'N/redirect', 'O/form'],
    (runtime, core, redirect, oui) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                if (context.type == 'create') {
                    throw new Error('<span style="color: red; font-size: 24px;">this record cannot be manually entered!</span>');
                } else if (context.type == 'edit') {
                    if (context.request.parameters.o == 'p3pp0' && core.me()) { return; }
                    redirect.toRecord({
                        type: context.newRecord.type,
                        id: context.newRecord.id,
                        isEditMode: false,
                        parameters: { o: 'ro' }
                    });
                } else if (context.type == 'view') {
                    if (context.request.parameters.o == 'p3pp0' && core.me()) {
                        redirect.toRecord({
                            type: context.newRecord.type,
                            id: context.newRecord.id,
                            isEditMode: true,
                            parameters: { o: 'p3pp0' }
                        });
                    } else if (context.request.parameters.o == 'ro') {
                        context.form.addPageInitMessage({
                            type: 2,
                            title: 'Read-Only Record',
                            message: '',
                            duration: 0
                        });
                    }
                }
            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
                if (context.type == 'create') { throw error; }
            }
        }



        return {
            beforeLoad: beforeLoad,

        }
    });
