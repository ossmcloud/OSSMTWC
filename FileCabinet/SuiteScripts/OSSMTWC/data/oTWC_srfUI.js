/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_srf.js', './oTWC_srfItemUI.js', './oTWC_fileUI.js', './oTWC_configUIFields.js', '../O/controls/oTWC_ui_ctrl.js'],
    (runtime, core, coreSQL, twcUtils, twcSrf, twcSrfItemUI, twcFileUI, configUIFields, twcUI) => {

        function getSrfTableFields() {
            // @@TODO: this list of fields to display can be set by user
            // @@IMPORTANT: we should make sure some fields are there as they are needed by the ui:
            //      id, name
            //      lat/lng
            //      site address
            var siteFields = [
                { field: twcSrf.Fields.NAME },
                { field: twcSrf.Fields.SITE },
                { field: twcSrf.Fields.OPERATOR_SITE_ID },
                { field: twcSrf.Fields.SRF_STATUS },
                { field: twcSrf.Fields.CUSTOMER },
                { field: twcSrf.Fields.SRF_SUBMITTED_BY },
                { field: twcSrf.Fields.SRF_REQUESTED_DATE },

            ];
            return siteFields;
        }

        function getSRFInfoPanels(dataSource, userInfo) {
            var fieldGroup = { id: 'site-request', title: (dataSource.id) ? `Space Request [${dataSource.name}]` : 'Create New Space Request', collapsed: false, controls: [] };

            var basicInfo = { id: 'site-request-struct', title: 'Customer Information', fields: [] };
            fieldGroup.controls.push(basicInfo);

            var customers = null;
            if (userInfo.isVendor) {
                customers = twcUtils.getCustomers(userInfo);
            }

            basicInfo.fields.push({ id: twcSrf.Fields.CUSTOMER, label: 'Customer', disabled: userInfo.isCustomer, dataSource: customers, allowAll: false})
            basicInfo.fields.push({ id: twcSrf.Fields.OPERATOR_SITE_ID, label: 'Operator Site ID' })

            fieldGroup.controls.push({ id: 'site-request-step-1', title: 'Step 1 of 5', fields: [twcSrfItemUI.getStepTableUIControl(dataSource, twcSrf.StepType.TME)] });
            fieldGroup.controls.push({ id: 'site-request-step-2', title: 'Step 2 of 5', fields: [twcSrfItemUI.getStepTableUIControl(dataSource, twcSrf.StepType.ATME)] });
            fieldGroup.controls.push({ id: 'site-request-step-3', title: 'Step 3 of 5', fields: [twcSrfItemUI.getStepTableUIControl(dataSource, twcSrf.StepType.GIE)] });
            fieldGroup.controls.push({ id: 'site-request-step-4', title: 'Step 4 of 5', fields: [twcSrfItemUI.getFileTableUIControl(dataSource)] });

            var step5 = {
                id: 'site-request-step-5', title: 'Step 5 of 5: Power Supply', fields: [
                    { id: twcSrf.Fields.POWER_SUPPLY_REQUESTED_FROM_TL, label: 'Power Requested from TC', labelNoWrap: true, lineBreak: true },
                    { id: twcSrf.Fields.ALTERNATE_POWER_SUPPLIER, label: 'Alternate Supplier', lineBreak: true },
                    { id: twcSrf.Fields.POWER_NOTES, label: 'Notes / Comments', width: '75%', rows: 3, lineBreak: true },
                    { id: twcSrf.Fields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB, label: 'Application for own supply made to ESB', labelNoWrap: true, lineBreak: true },
                    { id: twcSrf.Fields.APPLICATION_DATE, label: 'Application Date' },
                    { id: twcSrf.Fields.APPLICATION_REFERENCE, label: 'Application Reference' },
                ]
            }

            fieldGroup.controls.push(step5);

            fieldGroup.controls.push({
                id: 'site-request-step-6', fields: [
                    { type: twcUI.CTRL_TYPE.BUTTON, id: 'save-button', value: 'Submit' }
                ]
            });

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }



        function getSRFUIPanels(dataSource, userInfo) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcSrf.Type;

            var fieldGroups = [];
            if (dataSource.id) {
                fieldGroups.push(getSRFInfoPanels(dataSource, userInfo));
                if (dataSource[twcSrf.Fields.SRF_STATUS] != twcSrf.Status.Draft) {
                    // @@TODO : these fields should only be editable by TWC staff I suppose
                    // fieldGroups.push(getSRFWorkFlowPanels(dataSource, userInfo));
                }
            } else {
                fieldGroups.push(getSRFInfoPanels(dataSource, userInfo));
            }
            return fieldGroups;
        }

        function getSrfChildRecord(srf, childRecord, userInfo) {
            var fieldGroup = [];
            if (childRecord.type == twcSrfItemUI.RecordType) {
                fieldGroup = twcSrfItemUI.getUIFields(srf, childRecord);
                configUIFields.formatPanelFields(childRecord, fieldGroup);
            } else if (childRecord.type == twcFileUI.RecordType) {
                fieldGroup = twcFileUI.getUIFields(childRecord, userInfo);
            } else {
                throw new Error(`No Child Record Found in payload (type: ${childRecord.type})`)
            }
            
            return fieldGroup;
        }




        return {
            getSrfTableFields: getSrfTableFields,
            getSRFInfoPanels: getSRFUIPanels,
            getSrfChildRecord: getSrfChildRecord

        }
    });

