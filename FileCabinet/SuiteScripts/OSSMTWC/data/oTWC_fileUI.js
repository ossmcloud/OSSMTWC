/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_file.js'],
    (runtime, core, coreSQL, twcUtils, twcFile) => {


        function getUIFields(srf, srfFile) {
            var fieldGroup = { id: 'twc-file', title: 'File Info', collapsed: false, fields: [] };

            //fieldGroup.fields.push({ id: 'fileName', label: 'File Name', width: 'calc(100% - 105px)', type: 'file', mandatory: true })
            fieldGroup.fields.push({ id: twcFile.Fields.NAME, label: 'File Name', width: 'calc(100% - 105px)', type: 'file', mandatory: true })
            fieldGroup.fields.push({ id: twcFile.Fields.REVISION, label: 'revision', width: '100px', readOnly: true, lineBreak: true })

            fieldGroup.fields.push({ id: twcFile.Fields.DESCRIPTION, label: 'Description', type: 'textarea', width: '100%', rows: 5 })

            return fieldGroup;
        }





        return {
            RecordType: twcFile.Type,
            getUIFields: getUIFields

        }
    });

