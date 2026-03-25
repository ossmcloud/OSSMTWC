/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_company.js', './oTWC_profile.js', './oTWC_profileUI.js', './oTWC_file.js', './oTWC_fileUI.js', './oTWC_configUIFields.js', '../O/controls/oTWC_ui_ctrl.js'],
    (runtime, core, coreSQL, twcUtils, twcCompany, twcProfile, twcProfileUI, twcFile, twcFileUI, configUIFields, twcUI) => {

        const TEST_COLLAPSED = false;

        function getCompanyInfoPanels(pageData) {
            var dataSource = pageData.profileInfo;
            var userInfo = pageData.userInfo;

            dataSource.Type = twcCompany.Type;
            var fieldGroups = [];
            fieldGroups.push(getCompanyInfoPanels_mainInfo(dataSource, userInfo, pageData.editMode));
            fieldGroups.push(getCompanyInfoPanels_insuranceInfo(dataSource, userInfo, pageData.editMode));
            fieldGroups.push(getCompanyInfoPanels_accreditationInfo(dataSource, userInfo, pageData.editMode));
            fieldGroups.push(getCompanyInfoPanels_documents(dataSource, userInfo, pageData.editMode));
            fieldGroups.push(getCompanyInfoPanels_profiles(dataSource, userInfo, pageData.editMode));
            return fieldGroups;

        }

        function getCompanyInfoPanels_mainInfo(dataSource, userInfo, editMode) {
            var fieldGroup = { id: 'company-main-info', title: 'Main Information', renderAsTable: { width: '100%', 'table-layout': 'fixed' }, collapsed: false, controls: [] };

            var basicInfo = { id: 'company-main-info-basic', fields: [] };
            fieldGroup.controls.push(basicInfo);

            basicInfo.fields.push({ id: twcCompany.Fields.RADIX_COMPANY_TABLE_ENTRY_NUMBER, width: '75px', label: 'Radix ID', readOnly: true })
            basicInfo.fields.push({ id: twcCompany.Fields.NAME, width: 'calc(100% - 85px)', label: 'Name', readOnly: true, lineBreak: true })
            basicInfo.fields.push({ id: twcCompany.Fields.COMPANY_TYPE, width: '150px', label: 'Company Type', readOnly: true })
            basicInfo.fields.push({ id: twcCompany.Fields.COMPANY_CLASSIFICATION, width: '150px', label: 'Company Classification', readOnly: true })
            basicInfo.fields.push({ id: twcCompany.Fields.COMPANY_NUMBER, width: '150px', label: 'Company Number', readOnly: true, lineBreak: true })
            basicInfo.fields.push({ id: twcCompany.Fields.COMPANY_ADDRESS, width: '100%', rows: 3, label: 'Company Address', lineBreak: true })


            var accountingInfo = { id: 'company-main-info-accounting', fields: [] };
            fieldGroup.controls.push(accountingInfo);

            accountingInfo.fields.push({ id: twcCompany.Fields.REGISTERED_OFFICE, width: '200px', label: 'Registered Office' })
            accountingInfo.fields.push({ id: twcCompany.Fields.PRIMARY_CONTACT, width: '200px', label: 'Primary Contact', readOnly: true, lineBreak: true })
            accountingInfo.fields.push({ id: twcCompany.Fields.SAF_AUTO_APPROVE, label: 'SAF Auto Approve', readOnly: true })
            accountingInfo.fields.push({ id: twcCompany.Fields.ON_LINE_LICENCING, label: 'On-Line Licensing', readOnly: true })
            accountingInfo.fields.push({ id: twcCompany.Fields.FINANCE_VENDOR, label: 'Finance Vendor', readOnly: true })
            accountingInfo.fields.push({ id: twcCompany.Fields.FINANCE_CUSTOMER, label: 'Finance Customer', readOnly: true })

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }


        function getCompanyInfoPanels_insuranceInfo(dataSource, userInfo, editMode) {
            var fieldGroup = { id: 'company-insurance', title: 'Insurance Info', renderAsTable: { width: '100%', 'table-layout': 'fixed' }, collapsed: !editMode, controls: [] };

            var basicInfo = { id: 'company-insurance-info', fields: [] };
            fieldGroup.controls.push(basicInfo);
            basicInfo.fields.push({ id: twcCompany.Fields.INSURER, label: 'Insurer', width: '100%', lineBreak: true })

            basicInfo.fields.push({ id: twcCompany.Fields.EL_INSURANCE_MANDATORY, label: 'Mandatory' })
            basicInfo.fields.push({ id: twcCompany.Fields.EL_AVAILABLETYPE, width: '100px', label: 'EL Available/Type' })
            basicInfo.fields.push({ id: twcCompany.Fields.EL_LIMIT, width: '100px', label: 'EL Limit (millions)' })
            basicInfo.fields.push({ id: twcCompany.Fields.EL_LIMIT_CURRENCY, width: '100px', label: 'EL Currency' })
            basicInfo.fields.push({ id: twcCompany.Fields.EL_EXPIRY, label: 'EL Expiry', lineBreak: true })

            basicInfo.fields.push({ id: twcCompany.Fields.PL_INSURANCE_MANDATORY, label: 'Mandatory' })
            basicInfo.fields.push({ id: twcCompany.Fields.PL_AVAILABLETYPE, width: '100px', label: 'PL Available/Type' })
            basicInfo.fields.push({ id: twcCompany.Fields.PL_LIMIT, width: '100px', label: 'PL Limit (millions)' })
            basicInfo.fields.push({ id: twcCompany.Fields.PL_LIMIT_CURRENCY, width: '100px', label: 'PL Currency' })
            basicInfo.fields.push({ id: twcCompany.Fields.PL_EXPIRY, label: 'PL Expiry', lineBreak: true })

            var basicInfo2 = { id: 'company-insurance-info-2', fields: [] };
            fieldGroup.controls.push(basicInfo2);
            basicInfo2.fields.push({ id: twcCompany.Fields.RESTRICTIONS, label: 'Restriction', width: '100%', rows: 7, lineBreak: true })


            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }

        function getCompanyInfoPanels_accreditationInfo(dataSource, userInfo, editMode) {
            var fieldGroup = { id: 'company-accreditation', title: 'Accreditation Info', collapsed: !editMode, controls: [] };

            var basicInfo = { id: 'company-accreditation-info', fields: [] };
            fieldGroup.controls.push(basicInfo);
            basicInfo.fields.push({ id: twcCompany.Fields.ACCREDITATION_STATUS, width: '150px', label: 'Status', readOnly: true })
            basicInfo.fields.push({ id: twcCompany.Fields.ACCREDITATION_SUBMITTED, label: 'Submitted', readOnly: true })
            basicInfo.fields.push({ id: twcCompany.Fields.ACCREDITATION_APPROVED, label: 'Approved', readOnly: true })

            basicInfo.fields.push({ id: twcCompany.Fields.ACCREDITED_CONTRACTOR_COMMENCEMENT, label: 'Commencement', readOnly: true })
            basicInfo.fields.push({ id: twcCompany.Fields.ACCREDITED_CONTRACTOR_EXPIRY, label: 'Expiry', readOnly: true })
            basicInfo.fields.push({ id: twcCompany.Fields.ACCREDITED_CONTRACTOR_FEE, label: 'Fee', readOnly: true, lineBreak: true })

            basicInfo.fields.push({ id: twcCompany.Fields.ACCREDITATION_STATUS_COMMENT, label: 'Comment', width: '100%', readOnly: true, lineBreak: true })


            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }


        function getCompanyInfoPanels_documents(dataSource, userInfo, editMode) {
            var fieldGroup = { id: 'company-document', title: 'Documents', collapsed: true, controls: [] };

            var basicInfo = { id: 'company-document-list', fields: [] };
            fieldGroup.controls.push(basicInfo);

            //basicInfo.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'upload-file', value: 'Upload Document', lineBreak: true })

            basicInfo.fields.push({
                id: `${twcFile.Type}`, label: 'Contractor Files',
                fields: {
                    ['preview_link']: { title: '', noFilter: true, noSort: true, styles: { width: '50px' } },
                    [twcFile.Fields.CREATED]: { title: 'Uploaded', type: 'date', styles: { width: '120px' } },
                    [twcFile.Fields.STATUS + '_name']: { title: 'Status', styles: { width: '120px', 'padding': '3px' } },
                    [twcFile.Fields.R_TYPE + '_name']: { title: 'Type', styles: { width: '150px' } },
                    [twcFile.Fields.NAME]: { title: 'File Name', styles: { width: '350px' } },
                    [twcFile.Fields.REVISION]: { title: 'Rev.', nullText: '', noFilter: true, styles: { width: '70px', 'text-align': 'center' } },
                    [twcFile.Fields.DESCRIPTION]: { title: 'Description', nullText: '' },

                },
                dataSource: twcUtils.getFiles({
                    filters: {
                        'custrecord_twc_file_rectype': 'customrecord_twc_company',
                        'custrecord_twc_file_recid': dataSource.id,
                    }
                }),
                FieldsInfo: twcFile.FieldsInfo,
                showToolbar: true,
                readOnly: editMode || (userInfo.permission.lvl < 3),
                onColumnInit: (tbl, col) => {
                    if (col.id == (twcFile.Fields.STATUS + '_name')) {
                        col.formatValue = (v, fv, d) => {
                            return twcUtils.getFileStatusHtml(d[twcFile.Fields.STATUS], 'twc-record-status-row')
                        }
                    }
                }
            });

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }

        function getCompanyInfoPanels_profiles(dataSource, userInfo, editMode) {
            var fieldGroup = { id: 'company-profiles', title: 'Profiles', collapsed: editMode, controls: [] };

            var basicInfo = { id: 'company-profile-list', fields: [] };
            fieldGroup.controls.push(basicInfo);

            var today = twcUtils.today();

            basicInfo.fields.push({
                id: `${twcProfile.Type}`, label: 'Company Profile List',
                fields: {
                    [twcProfile.Fields.NAME]: 'Profile Name',
                    [twcProfile.Fields.E_MAIL]: 'Email',
                    [twcProfile.Fields.PHONE]: 'Phone',
                    [twcProfile.Fields.PICW_ACCEPTABLE]: { title: 'PICW', type: 'bool' },
                    [twcProfile.Fields.CLIMBER_CERTIFIED_STATUS]: { title: 'Climber', nullText: '' },
                    [twcProfile.Fields.CLIMBER_CERTIFIED_EXPIRY]: { hide: true },
                    [twcProfile.Fields.RESCUE_CERTIFIED_STATUS]: { title: 'Rescue', nullText: '' },
                    [twcProfile.Fields.RESCUE_CERTIFIED_EXPIRY]: { hide: true },
                    [twcProfile.Fields.RF_CERTIFIED_STATUS]: { title: 'RF', nullText: '' },
                    [twcProfile.Fields.RF_CERTIFIED_EXPIRY]: { hide: true },
                    [twcProfile.Fields.ROOFTOP_CERTIFIED_STATUS]: { title: 'Rooftop', nullText: '' },
                    [twcProfile.Fields.ROOFTOP_CERTIFIED_EXPIRY]: { hide: true },
                    [twcProfile.Fields.ELECTRICIAN_CERTIFIED_STATUS]: { title: 'Electrician', nullText: '' },
                    [twcProfile.Fields.ELECTRICIAN_CERTIFIED_EXPIRY]: { hide: true },
                    [twcProfile.Fields.DRONE_CERTIFIED_STATUS]: { title: 'Drone', nullText: '' },
                    [twcProfile.Fields.DRONE_CERTIFIED_EXPIRY]: { hide: true },
                    [twcProfile.Fields.SAFE_PASS_STATUS]: { title: 'Safe Pass', nullText: '' },
                    [twcProfile.Fields.SAFE_PASS_EXPIRY]: { hide: true },
                    //[twcProfile.Fields.SAFE_PASS_EXPIRY]: { title: 'Safe Pass', nullText: '', type: 'date' },


                },
                where: { [twcProfile.Fields.COMPANY]: dataSource.id },
                FieldsInfo: twcProfile.FieldsInfo,
                showToolbar: true,
                readOnly: editMode || (userInfo.permission.lvl < 3),
                onColumnInit: (tbl, col) => {
                    if (col.id == (twcProfile.Fields.CLIMBER_CERTIFIED_STATUS + '_name') ||
                        col.id == (twcProfile.Fields.RESCUE_CERTIFIED_STATUS + '_name') ||
                        col.id == (twcProfile.Fields.RF_CERTIFIED_STATUS + '_name') ||
                        col.id == (twcProfile.Fields.ROOFTOP_CERTIFIED_STATUS + '_name') ||
                        col.id == (twcProfile.Fields.ELECTRICIAN_CERTIFIED_STATUS + '_name') ||
                        col.id == (twcProfile.Fields.DRONE_CERTIFIED_STATUS + '_name') ||
                        col.id == (twcProfile.Fields.SAFE_PASS_STATUS + '_name')) {

                        col.styles = { width: '130px' };
                        col.formatValue = (v, fv, d) => {
                            return twcProfile.getCertStatusHtml(v, d[col.id.replace('_sts_name', '_exp')])
                        }
                    }

                    // if (col.id == twcProfile.Fields.SAFE_PASS_EXPIRY) {
                    //     col.formatValue = (v, fv, d) => {
                    //         return twcProfile.getDateStatusHtml(v, today)
                    //     }
                    // }
                }
            });

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }


        // function getCompanyInfoPanels_xxx(dataSource, userInfo) {
        //     var fieldGroup = { id: 'company-xxx', title: 'XXX', collapsed: false, controls: [] };

        //     var basicInfo = { id: 'company-xxx-a', title: 'Basic Information', fields: [] };
        //     fieldGroup.controls.push(basicInfo);
        //     basicInfo.fields.push({ id: twcCompany.Fields.NAME, label: 'Name' })

        //     configUIFields.formatPanelFields(dataSource, fieldGroup);
        //     return fieldGroup;
        // }

        function getCompanyChildRecord(company, childRecord, userInfo) {
            var fieldGroup = [];
            if (childRecord.type == twcProfile.Type) {
                fieldGroup = twcProfileUI.getUIFields(childRecord, userInfo);
            } else if (childRecord.type == twcFile.Type) {
                fieldGroup = twcFileUI.getUIFields(childRecord, userInfo);
            } else {
                throw new Error(`No Child Record Found in payload (type: ${childRecord.type})`)
            }
            //configUIFields.formatPanelFields(childRecord, fieldGroup);
            return fieldGroup;
        }


        return {
            getCompanyInfoPanels: getCompanyInfoPanels,
            getCompanyChildRecord: getCompanyChildRecord
            //getCompanyProfilesPanel: getCompanyInfoPanels_documents,

        }
    });

