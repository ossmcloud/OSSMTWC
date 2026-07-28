/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_configUIFields.js', './oTWC_file.js', './oTWC_fileType.js'],
    (runtime, core, coreSQL, twcUtils, configUIFields, twcFile, twcFileType) => {




        function getUIFields(file, userInfo, options) {
            var fieldGroup = { id: 'twc-file', collapsed: false, fields: [] };

            var nonTwcReadOnly = userInfo.isEmployee ? undefined : true;

            var showTypeRelatedFields = true;
            var fileTypeOptions = { isVendor: userInfo.isVendor }
            if (options?.srf) {
                fileTypeOptions.filters = { [`t.${twcFileType.Fields.USE_IN_SRF}`]: 'T' }
                showTypeRelatedFields = userInfo.isEmployee;
            } else if (options?.company) {
                fileTypeOptions.filters = `and (
                       t.${twcFileType.Fields.HEALTH__AND__SAFETY} = 'T' 
                    or t.${twcFileType.Fields.METHOD_STATEMENTS} = 'T' 
                    or t.${twcFileType.Fields.INSURANCE} = 'T'
                )`
            }

            var fileTypes = twcUtils.getFileTypes(fileTypeOptions);

            fieldGroup.fields.push({ id: 'upload-file', label: 'File', width: '100%', type: 'file', accept: '.pdf' })
            fieldGroup.fields.push({ id: twcFile.Fields.NAME, label: 'Name', width: '100%', mandatory: true })
            if (showTypeRelatedFields) {
                fieldGroup.fields.push({ id: twcFile.Fields.R_TYPE, label: 'Type', width: 'calc(100% - 233px)', mandatory: true, allowAll: false, dataSource: fileTypes })
                fieldGroup.fields.push({ id: twcFile.Fields.REVISION, label: 'Revision', readOnly: nonTwcReadOnly, width: '100px' })
                fieldGroup.fields.push({ id: twcFile.Fields.STATUS, label: 'Status', width: '120px', readOnly: nonTwcReadOnly, lineBreak: true })
            }
            fieldGroup.fields.push({ id: twcFile.Fields.DESCRIPTION, label: 'Description', width: '100%', rows: 5 })

            configUIFields.formatPanelFields(file, fieldGroup);

            return fieldGroup;
        }





        return {
            RecordType: twcFile.Type,
            getUIFields: getUIFields

        }
    });

