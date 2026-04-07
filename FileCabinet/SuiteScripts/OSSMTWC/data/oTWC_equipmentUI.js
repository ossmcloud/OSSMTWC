/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safCrew.js', './oTWC_safAction.js', './oTWC_safTimeBlock.js', './oTWC_safLog.js', './oTWC_file.js', './oTWC_equipment.js', './oTWC_srfItemUI.js', './oTWC_equipmentItemUI.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafCrew, twcSafAction, twcSafTimeBlock, twcSafLog, twcFile, twcInventory, twcSrfItemUI, twcInvItemUI) => {
        var _safUrl = null;
        var _allowedSafTypes = null;

        function getInventoryTableFields() {
            var inventoryFields = [
                { field: twcInventory.Fields.EQUIPMENT_ID },
                { field: twcInventory.Fields.EQUIPMENT_STATUS },
                { field: twcInventory.Fields.SITE },
                // { field: twcSite.Fields.ADDRESS_COUNTY },
                // { field: twcSite.Fields.ADDRESS_REGION },
                { field: twcInventory.Fields.INFRASTRUCTURE },
                { field: twcInventory.Fields.LOCATION },
                { field: twcInventory.Fields.LENGTH_MM },
                { field: twcInventory.Fields.WIDTH_MM },
                { field: twcInventory.Fields.CUSTOMER },
                { field: twcInventory.Fields.BILL_FROM }
            ];
            return inventoryFields;
        }

        function getInvInfoPanels(dataSource, userInfo) {
            var fieldGroup = { id: 'site-request', title: (dataSource.id) ? `Space Request [${dataSource.name}]` : 'Create New Space Request', collapsed: false, controls: [] };

            var basicInfo = { id: 'site-request-struct', title: 'Customer Information', fields: [] };
            fieldGroup.controls.push(basicInfo);

            var customers = null;
            if (userInfo.isVendor) {
                customers = twcUtils.getCustomers(userInfo);
            }

            basicInfo.fields.push({ id: twcInventory.Fields.CUSTOMER, label: 'Customer', disabled: userInfo.isCustomer, dataSource: customers, allowAll: false })
            basicInfo.fields.push({ id: twcInventory.Fields.OPERATOR_SITE_ID, label: 'Operator Site ID' })

            fieldGroup.controls.push({ id: 'site-request-step-1', title: 'Step 1 of 5', fields: [twcInvItemUI.getStepTableUIControl(dataSource, twcInventory.StepType.TME)] });
            fieldGroup.controls.push({ id: 'site-request-step-2', title: 'Step 2 of 5', fields: [twcInvItemUI.getStepTableUIControl(dataSource, twcInventory.StepType.ATME)] });
            fieldGroup.controls.push({ id: 'site-request-step-3', title: 'Step 3 of 5', fields: [twcInvItemUI.getStepTableUIControl(dataSource, twcInventory.StepType.GIE)] });
            fieldGroup.controls.push({ id: 'site-request-step-4', title: 'Step 4 of 5', fields: [twcInvItemUI.getFileTableUIControl(dataSource)] });

            var step5 = {
                id: 'site-request-step-5', title: 'Step 5 of 5: Power Supply', fields: [
                    { id: twcInventory.Fields.POWER_SUPPLY_REQUESTED_FROM_TL, label: 'Power Requested from TC', labelNoWrap: true, lineBreak: true },
                    { id: twcInventory.Fields.ALTERNATE_POWER_SUPPLIER, label: 'Alternate Supplier', lineBreak: true },
                    { id: twcInventory.Fields.POWER_NOTES, label: 'Notes / Comments', width: '75%', rows: 3, lineBreak: true },
                    { id: twcInventory.Fields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB, label: 'Application for own supply made to ESB', labelNoWrap: true, lineBreak: true },
                    { id: twcInventory.Fields.APPLICATION_DATE, label: 'Application Date' },
                    { id: twcInventory.Fields.APPLICATION_REFERENCE, label: 'Application Reference' },
                ]
            }

            fieldGroup.controls.push(step5);

            fieldGroup.controls.push({
                id: 'site-request-step-6', fields: [
                    { type: twcUI.CTRL_TYPE.BUTTON, id: 'save-button', value: 'Submit' }
                ]
            });
            log.debug('Panel before format', JSON.stringify(fieldGroup))
            log.debug('dataSource before format', JSON.stringify(dataSource))
            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }


        return {
            getInventoryTableFields: getInventoryTableFields,
            getInvInfoPanels: getInvInfoPanels
        }
    });

