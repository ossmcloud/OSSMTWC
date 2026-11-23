/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
// @@NOTE: SRF Item native form (customrecord_twc_srf_itm)
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', './data/oTWC_srfItem.js'],
    (runtime, core, oui, twcSrfItem) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);

                // @@NOTE: SRF Item migrated from Radix (data_migration SPEC_v1.2): warning banner (same as the SRF form, oTWC_srf_ue.js)
                if (context.type == 'view' || context.type == 'edit') {
                    var radixMigrated = context.newRecord.getValue({ fieldId: twcSrfItem.Fields.RADIX_MIGRATED });
                    if (radixMigrated === true || radixMigrated == 'T') {
                        form.bannerWarn('Radix Migrated', 'This transaction was migrated from Radix');
                    }
                }
            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
                if (core.me()) { throw error }
            }
        }

        return {
            beforeLoad: beforeLoad
        }
    });
