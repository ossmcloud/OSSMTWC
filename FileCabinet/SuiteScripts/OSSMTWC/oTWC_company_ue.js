/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    (runtime, core, oui, recu) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);
                form.f.clientScriptModulePath = './oTWC_company_cs.js';

                if (context.type == 'view') {
                    form.buttonAdd('Open Company', 'openCompany')
                }
                
                if (context.type == 'create' || context.type == 'edit') {
                    form.fieldReadOnly('custrecord_twc_co_tl_co_id')
                }
                const STATUS_ACTIVE = 2;
                const statusFieldMap = {
                    custrecord_twc_co_el_status: 'custrecord_twc_co_el_expiry',
                    custrecord_twc_co_pl_status: 'custrecord_twc_co_pl_expiry',
                    custrecord_twc_co_pi_status: 'custrecord_twc_co_pi_expiry'
                };
                for (const [statusFieldId, expiryFieldId] of Object.entries(statusFieldMap)) {
                    if (context.newRecord.getValue(statusFieldId) == STATUS_ACTIVE) {
                        form.f.getField(expiryFieldId).isMandatory = true;
                    }
                }

            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }

        function afterSubmit(context) {
            try{
                if (context.type !== context.UserEventType.CREATE) {
                    return;
                }
                let tlCompanyId = 'COM-' + String(context.newRecord.id).padStart(7, '0');
                core.logDebug("Company Id",tlCompanyId)
                recu.submit(context.newRecord.type, context.newRecord.id, 'custrecord_twc_co_tl_co_id', tlCompanyId);
            }
            catch(error){
                core.logDebug('AFTER - SUBMIT', error.message)
            }
        }


        return {
            beforeLoad: beforeLoad,
            afterSubmit: afterSubmit
            

        }
    });
