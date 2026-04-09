/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/record', 'SuiteBundles/Bundle 548734/O/core.js', './data/oTWC_company.js', './data/oTWC_profile.js'],
    (record, core, twcCompany, twcProfile) => {

        const FIELD_CONFIG = {
            customrecord_twc_company: {
                statusField: twcCompany.Fields.ACCREDITATION_STATUS,
                dateField: twcCompany.Fields.ACCREDITATION_STATUS_CHANGE_DATE,
                recordType: twcCompany.Type
            },
            customrecord_twc_prof: {
                statusField: twcProfile.Fields.ACCREDITATION_STATUS,
                dateField: twcProfile.Fields.ACCREDITATION_STATUS_CHANGE_DATE,
                recordType: twcProfile.Type
            }
        };

        function afterSubmit(context) {
            try {
                if (context.type == 'edit' || context.type == 'xedit') {
                    const newRecord = context.newRecord;
                    const oldRecord = context.oldRecord;
                    const config = FIELD_CONFIG[newRecord.type];
                    if (!config) return;
                    const oldValue = oldRecord.getValue(config.statusField);
                    const newValue = newRecord.getValue(config.statusField);
                    if (Number(oldValue) != Number(newValue)) {
                        record.submitFields({ type: config.recordType, id: newRecord.id, values: { [config.dateField]: new Date() } });
                    }
                }
            } catch (error) {
                core.logDebug('AFTER-Submit', error.message);
            }
        }
        return {
            afterSubmit: afterSubmit,

        }
    });
