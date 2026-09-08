/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_srfItem.js', './data/oTWC_equipmentLib.js', './data/oTWC_utils.js'],
    (runtime, core, oui, recu, twcSrfItem, twcEqLib, twcUtils) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);

                if (context.type == 'create') {
                    if (!context.request.parameters.srfItem) { return; }

                    const FIELD_MAP = {
                        [twcEqLib.Fields.EQUIPMENT_CLASS]: twcSrfItem.Fields.STEP_TYPE,
                        // [twcEqLib.Fields.EQUIPMENT_TYPE]: twcSrfItem.Fields.ITEM_TYPE,
                        [twcEqLib.Fields.MAKE]: twcSrfItem.Fields.MAKE,
                        [twcEqLib.Fields.MODEL]: twcSrfItem.Fields.MODEL,
                        [twcEqLib.Fields.DESCRIPTION]: twcSrfItem.Fields.DESCRIPTION,
                        [twcEqLib.Fields.LENGTH_MM]: twcSrfItem.Fields.LENGTH_MM,
                        [twcEqLib.Fields.WIDTH_MM]: twcSrfItem.Fields.WIDTH_MM,
                        [twcEqLib.Fields.HEIGHTDEPTH_MM]: twcSrfItem.Fields.DEPTH_MM,
                        [twcEqLib.Fields.WEIGHT_KG]: twcSrfItem.Fields.WEIGHT_KG,
                        [twcEqLib.Fields.VOLTAGE_TYPE]: twcSrfItem.Fields.VOLTAGE_TYPE,
                    }

                    var srfItem = twcSrfItem.get(context.request.parameters.srfItem);
                    for (var f in FIELD_MAP) {
                        try {
                            context.newRecord.setValue(f, srfItem.get(FIELD_MAP[f]))
                        } catch (error) {
                            core.logError('SET-FIELD', `${f} | ${FIELD_MAP[f]}: ${error.message}`);
                        }
                    }

                    context.newRecord.setValue(twcEqLib.Fields.LIBRARY_ENTRY_STATUS, twcUtils.EqLibStatus.Draft);
                    context.newRecord.setValue(twcEqLib.Fields.CREATED_FROM_SRF_ITEM, context.request.parameters.srfItem);
                    
                    form.fieldGet(twcEqLib.Fields.EQUIPMENT_CLASS).isMandatory = true;
                    form.fieldGet(twcEqLib.Fields.EQUIPMENT_TYPE).isMandatory = true;
                    form.fieldGet(twcEqLib.Fields.LIBRARY_ENTRY_STATUS).isMandatory = true;
                }


            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }

        function beforeSubmit(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                if (context.type != 'delete') { return; }

                var srfItem = recu.lookUp(twcEqLib.Type, context.newRecord.id, twcEqLib.Fields.CREATED_FROM_SRF_ITEM);
                if (srfItem?.value) {
                    recu.submit(twcSrfItem.Type, srfItem.value, twcSrfItem.Fields.EQUIPMENT_LIBRARY, null);
                }


            } catch (error) {
                core.logDebug('BEFORE-SUBMIT', `${context.newRecord.id}: ${error.message}`);
            }
        }

        function afterSubmit(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                if (context.type != 'create') { return; }

                var srfItem = recu.lookUp(twcEqLib.Type, context.newRecord.id, twcEqLib.Fields.CREATED_FROM_SRF_ITEM);
                if (srfItem?.value) {
                    recu.submit(twcSrfItem.Type, srfItem.value, twcSrfItem.Fields.EQUIPMENT_LIBRARY, context.newRecord.id);
                }

                
            } catch (error) {
                core.logDebug('AFTER-SUBMIT', `${context.newRecord.id}: ${error.message}`);
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit,
        }
    });
