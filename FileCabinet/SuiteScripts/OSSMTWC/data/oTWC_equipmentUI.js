/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safCrew.js', './oTWC_safAction.js', './oTWC_safTimeBlock.js', './oTWC_safLog.js', './oTWC_file.js', './oTWC_equipment.js', './oTWC_srfItemUI.js', './oTWC_equipmentItemUI.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafCrew, twcSafAction, twcSafTimeBlock, twcSafLog, twcFile, twcInventory, twcSrfItemUI, twcInvItemUI) => {
        // @@HARDCODED: @@TODO: move ot Utils and merge with SRF Step Type
        const EQ_TYPE_ENUM = {
            TME: 1,
            ATME: 2,
            GIE: 3
        }

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

        function getInvInfoPanels_Type(dataSource, userInfo, eqType) {
            //throw new Error(JSON.stringify(dataSource.id   ))

            

            var fieldGroup = { id: 'site-inventory', title: 'TME / Tower Mounted Equipment', collapsed: false, controls: [] };

            var tmeInventories = { id: 'site-inventory-info', fields: [] };
            fieldGroup.controls.push(tmeInventories);

            tmeInventories.fields.push({
                id: `${twcInventory.Type}`, label: 'Site TME Equipment',
                fields: {
                    [twcInventory.Fields.EQUIPMENT_ID]: 'Name',
                    [twcInventory.Fields.EQ_TYPE]: 'Type',
                },
                where: { [twcInventory.Fields.SITE]: dataSource.id, [twcInventory.Fields.EQ_TYPE]: eqType },
                FieldsInfo: twcInventory.FieldsInfo,
            });

            log.debug('Panel before format', JSON.stringify(fieldGroup))
            log.debug('dataSource before format', JSON.stringify(dataSource))
            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getInvInfoPanels(dataSource, userInfo) {
            var fieldGroups = [];
            fieldGroups.push(getInvInfoPanels_Type(dataSource, userInfo, EQ_TYPE_ENUM.TME))
            fieldGroups.push(getInvInfoPanels_Type(dataSource, userInfo, EQ_TYPE_ENUM.ATME))
            fieldGroups.push(getInvInfoPanels_Type(dataSource, userInfo, EQ_TYPE_ENUM.GIE))
            return fieldGroups;
        }




        return {
            getInventoryTableFields: getInventoryTableFields,
            getInvInfoPanels: getInvInfoPanels
        }
    });

