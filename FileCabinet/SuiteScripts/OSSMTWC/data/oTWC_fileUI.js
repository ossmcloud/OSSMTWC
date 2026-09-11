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
            var fileTypeOptions = { isVendor: userInfo.isVendor, showParent: options?.showParent, recordType: options?.recordType, filters: options?.filters }
            if (options?.srf) {
                showTypeRelatedFields = userInfo.isEmployee;
                fileTypeOptions.filters = { [`t.${twcFileType.Fields.USE_IN_SRF}`]: 'T' }
                if (!showTypeRelatedFields) {
                    fileTypeOptions.filters[`t.${twcFileType.Fields.PUBLIC}`] = 'T';
                }


            } else if (options?.company) {
                fileTypeOptions.filters = options.filters || `and (
                    t.${twcFileType.Fields.HEALTH__AND__SAFETY} = 'T' 
                    or t.${twcFileType.Fields.METHOD_STATEMENTS} = 'T' 
                    or t.${twcFileType.Fields.INSURANCE} = 'T'
                )`
            }

            var fileTypes = twcUtils.getFileTypes(fileTypeOptions);
            var fileStatuses = [];

            var fileType = file[twcFile.Fields.R_TYPE];
            var fileStatus = file[twcFile.Fields.STATUS];
            if (!showTypeRelatedFields) {
                fileType = fileTypes[0].value;
                fileStatuses == fileTypes[0]?.allowedStatues;
                fileStatus = fileTypes[0]?.statuses[0];
            } else {
                if (!fileType && fileTypes.length == 1) {
                    fileType = fileTypes[0].value;
                }
                if (fileType) {
                    var ft = fileTypes.find(ft => { return ft.value == fileType })
                    fileStatuses = ft?.allowedStatues;
                    if (!fileStatus && ft?.defaultStatus) {
                        fileStatus = ft?.defaultStatus;
                    }
                }
            }



            fieldGroup.fields.push({ id: 'upload-file', label: 'File', width: '100%', type: 'file', accept: options?.accept })
            fieldGroup.fields.push({ id: twcFile.Fields.NAME, label: 'Name', width: '100%', mandatory: true })
            // if (showTypeRelatedFields) {
            fieldGroup.fields.push({ id: twcFile.Fields.R_TYPE, label: 'Type', width: 'calc(100% - 233px)', mandatory: true, allowAll: false, dataSource: fileTypes, value: fileType, hide: !showTypeRelatedFields })
            fieldGroup.fields.push({ id: twcFile.Fields.REVISION, label: 'Revision', readOnly: nonTwcReadOnly, width: '100px', hide: !showTypeRelatedFields })
            fieldGroup.fields.push({ id: twcFile.Fields.STATUS, label: 'Status', width: '120px', readOnly: nonTwcReadOnly, mandatory: !nonTwcReadOnly, lineBreak: true, dataSource: fileStatuses, value: fileStatus, hide: !showTypeRelatedFields })
            // }
            fieldGroup.fields.push({ id: twcFile.Fields.DESCRIPTION, label: 'Description', width: '100%', rows: 5 })

            configUIFields.formatPanelFields(file, fieldGroup);

            return fieldGroup;
        }


        function getUITable(filters, userInfo) {
            var fieldGroup = { id: 'twc-file', collapsed: false, fields: [] };
            fieldGroup.fields.push({
                id: `${twcFile.Type}`,
                label: 'TL Files',
                fields: {
                    ['preview_link']: { title: '', noFilter: true, noSort: true, styles: { width: '50px' } },
                    [twcFile.Fields.CREATED]: { title: 'Uploaded', type: 'date', styles: { width: '120px' } },
                    [twcFile.Fields.STATUS + '_name']: { title: 'Status', styles: { width: '120px', 'padding': '3px' } },
                    [twcFile.Fields.R_TYPE + '_name']: { title: 'Type', styles: { width: '150px' } },
                    [twcFile.Fields.NAME]: { title: 'File Name', styles: { width: '350px' } },
                    [twcFile.Fields.REVISION]: { title: 'Rev.', nullText: '', noFilter: true, styles: { width: '70px', 'text-align': 'center' } },
                    [twcFile.Fields.DESCRIPTION]: { title: 'Description', nullText: '' },

                },
                dataSource: twcUtils.getFiles({ filters: filters }),
                FieldsInfo: twcFile.FieldsInfo,
                showToolbar: true,
                readOnly: true,
                onColumnInit: (tbl, col) => {
                    if (col.id == (twcFile.Fields.STATUS + '_name')) {
                        col.formatValue = (v, fv, d) => {
                            return twcUtils.getFileStatusHtml(d[twcFile.Fields.STATUS], 'twc-record-status-row')
                        }
                    }
                }
            });
            configUIFields.formatPanelFields({}, fieldGroup);
            return fieldGroup;
        }


        return {
            RecordType: twcFile.Type,
            getUIFields: getUIFields,
            getUITable: getUITable

        }
    });

