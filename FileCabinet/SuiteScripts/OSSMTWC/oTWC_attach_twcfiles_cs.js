/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './O/controls/oTWC_ui_ctrl.js', './O/controls/oTWC_ui_fieldPanel.js', './data/oTWC_company.js', './data/oTWC_file.js', './data/oTWC_fileUI.js', './data/oTWC_utils.js', './ui/views/oTWC_baseView.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcUI, twcUIPanel, twcCompany, twcFile, twcFileUI, twcUtils, twcBaseView) {


        function pageInit(context) {
            console.log('debug -------------> ')
        }

        async function uploadFile() {
            await twcBaseView.uploadFile({ showParent: true, recordType: currentRecord.get().type, recordId: currentRecord.get().id }, (file, res) => {
                console.log(file, res);
            })

           
        }


        return {
            pageInit: pageInit,
            uploadFile: uploadFile
        }
    });


