/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/record', 'N/runtime', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', './O/oTWC_themes_ue.js', './data/oTWC_file.js', './data/oTWC_company.js', './data/oTWC_utils.js','N/url'],
    (record, runtime, file, core, coreSql, oui, recu, htmlStyles, twcThemesUE, twcFile, twcCompany, twcUtils, url) => {

        function beforeLoad(context) {

            try {
               if (context.type == context.UserEventType.VIEW) {
                    var form = oui.get(context.form);
                    form.pageInitView('OSSMTWC', 'oTWC_file');
                    form.f.clientScriptModulePath = './oTWC_file_cs.js';

                   twcThemesUE.setForm(form);

                    if (context.newRecord.getValue(twcFile.Fields.RECORD_TYPE) == twcCompany.Type) {
                        if (context.newRecord.getValue(twcFile.Fields.STATUS) == twcUtils.FileStatus.Pending) {
                            var fileType = twcUtils.getFileTypes().find(t => { return t.value == context.newRecord.getValue(twcFile.Fields.R_TYPE) });
                            if (fileType.isInsurance) {
                                form.buttonAdd('Approve Insurance File', 'approveInsuranceFile');
                            } else {
                                form.buttonAdd('Approve File', 'approveFile');
                            }
                        }
                    }

                    openRecordButton(form, context.newRecord)

                }


            } catch (error) {
                core.logError('beforeSubmit', error.message);
                throw error
            }
            return;

        }

        function openRecordButton(form, newRecord) {
            try {
                var recordType = newRecord.getValue(twcFile.Fields.RECORD_TYPE)
                var recordId = newRecord.getValue(twcFile.Fields.RECORD_ID)
                if (!recordType || !recordId) {
                    return;
                }
                var recordUrl = url.resolveRecord({
                    recordType: recordType,
                    recordId: recordId,
                    isEditMode: false
                });
                form.buttonAdd('Open Record', `openRecord('${recordUrl}')`)

            }
            catch (error) {
                core.logError('OpenRecordButton', error.message);
                throw error
            }
        }



        return {
            beforeLoad: beforeLoad,

        };
    });