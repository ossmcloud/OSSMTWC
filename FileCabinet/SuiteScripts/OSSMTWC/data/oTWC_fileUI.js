/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_configUIFields.js', './oTWC_file.js'],
    (runtime, core, coreSQL, twcUtils, configUIFields, twcFile) => {

        


        function getUIFields(file, userInfo) {
            var fieldGroup = { id: 'twc-file', collapsed: false, fields: [] };

            var nonTwcReadOnly = userInfo.isEmployee ? undefined : true;
            var fileTypes = twcUtils.getFileTypes(userInfo);
                
            fieldGroup.fields.push({ id: 'upload-file', label: 'File', width: '100%', type: 'file', accept: '.pdf' })
            fieldGroup.fields.push({ id: twcFile.Fields.NAME, label: 'Name', width: 'calc(100% - 433px)', mandatory: true })
            fieldGroup.fields.push({ id: twcFile.Fields.R_TYPE, label: 'Type', width: '200px', mandatory: true, allowAll: false, dataSource: fileTypes})
            fieldGroup.fields.push({ id: twcFile.Fields.REVISION, label: 'Revision', readOnly: nonTwcReadOnly, width: '100px'})
            fieldGroup.fields.push({ id: twcFile.Fields.STATUS, label: 'Status', width: '120px', readOnly: nonTwcReadOnly, lineBreak: true })
            fieldGroup.fields.push({ id: twcFile.Fields.DESCRIPTION, label: 'Description', width: '100%', rows: 5 })

            configUIFields.formatPanelFields(file, fieldGroup);
            
            return fieldGroup;
        }





        return {
            RecordType: twcFile.Type,
            getUIFields: getUIFields

        }
    });

