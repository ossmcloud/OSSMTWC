/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_company.js', './data/oTWC_profile.js'],
    (core, recu, twcCompany, twcProfile) => {

        const FIELD_CONFIG = {
            customrecord_twc_company: {
                statusField: twcCompany.Fields.ACCREDITATION_STATUS,
                dateField: twcCompany.Fields.ACCREDITATION_STATUS_CHANGE_DATE,
                recordType: twcCompany.Type,
                trigger: { from: 2, to: 4 }
            },
            customrecord_twc_prof: {
                statusField: twcProfile.Fields.ACCREDITATION_STATUS,
                dateField: twcProfile.Fields.ACCREDITATION_STATUS_CHANGE_DATE,
                recordType: twcProfile.Type,
                trigger: { from: 1, to: 2 }
            }
        };

        function afterSubmit(context) {
            try {
                // var form = oui.get(context.form);

                if (context.type == 'edit' || context.type == 'xedit') {
                    const newRecord = context.newRecord;
                    const oldRecord = context.oldRecord;
                    const config = FIELD_CONFIG[newRecord.type];
                    if (!config) return;

                    const oldValue = oldRecord.getValue(config.statusField);
                    const newValue = newRecord.getValue(config.statusField);

                    if (Number(oldValue) != Number(newValue)) {
                        recu.submit(config.recordType, newRecord.id, [config.dateField], new Date());
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
