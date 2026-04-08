/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_config.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safCrew.js', './oTWC_safAction.js', './oTWC_safTimeBlock.js', './oTWC_safLog.js', './oTWC_file.js', './oTWC_equipment.js', './oTWC_srfItemUI.js', './oTWC_equipmentItemUI.js'],
    (runtime, core, coreSQL, twcUtils, twcConfig, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafCrew, twcSafAction, twcSafTimeBlock, twcSafLog, twcFile, twcInventory, twcSrfItemUI, twcInvItemUI) => {
        // @@HARDCODED: @@TODO: move ot Utils and merge with SRF Step Type
        const EQ_TYPE_ENUM = {
            TME: 1,
            ATME: 2,
            GIE: 3
        }

        const EQ_TYPE_TITLES = {
            [EQ_TYPE_ENUM.TME]: "TME / Tower Mounted Equipment",
            [EQ_TYPE_ENUM.ATME]: "ATME / Additional Tower Mounted Equipment",
            [EQ_TYPE_ENUM.GIE]: "GIE / Ground & Indoor Equipment"
        };

        function getInventoryTableFields() {
            var inventoryFields = [
                { field: twcInventory.Fields.EQUIPMENT_ID },
                { field: twcInventory.Fields.EQUIPMENT_STATUS },
                { field: twcInventory.Fields.CUSTOMER },
                { field: twcInventory.Fields.MAKE },
                { field: twcInventory.Fields.MODEL },
                { field: twcInventory.Fields.LENGTH_MM },
                { field: twcInventory.Fields.WIDTH_MM },
                { field: twcInventory.Fields.HEIGHTDEPTH_MM },
                
            ];
            return inventoryFields;
        }

        function getInvInfoPanels_Type(dataSource, userInfo, eqType) {
            //throw new Error(JSON.stringify(dataSource.id   ))
            const title = EQ_TYPE_TITLES[eqType] || "Unknown Equipment";
            var fieldGroup = { id: 'site-inventory', title: title, collapsed: false, controls: [] };

            var tmeInventories = { id: 'site-inventory-info', fields: [] };
            fieldGroup.controls.push(tmeInventories);

            var tableFields = {
                [twcInventory.Fields.EQUIPMENT_STATUS]: 'Status',
                [twcInventory.Fields.CUSTOMER]: 'Customer',
                [twcInventory.Fields.VOLTAGE_TYPE]: { title: 'Type' },
                [twcInventory.Fields.DESCRIPTION]: 'Desc',
                [twcInventory.Fields.LOCATION_NOTES]: 'Location',
                [twcInventory.Fields.LENGTH_MM]: {
                    title: 'L/W/D',
                    styles: { 'text-align': 'center' },
                    formatValue: (v, fv, data, col) => {
                        var l = data[twcInventory.Fields.LENGTH_MM] || '';
                        var w = data[twcInventory.Fields.WIDTH_MM] || '';
                        var d = data[twcInventory.Fields.HEIGHTDEPTH_MM] || '';

                        var res = l;
                        if (w) { res += ' / '; }
                        res += w;
                        if (d) { res += ' / '; }
                        res += d;

                        return res;
                    }
                },
                [twcInventory.Fields.AZIMUTH]: { title: 'Az', styles: { width: '65px' } },
                [twcInventory.Fields.B_END]: 'B-End',
                [twcInventory.Fields.CUSTOMER_REF]: 'Cust. Ref',
                [twcInventory.Fields.INVENTORY_FLAG]: 'Inventory Flag',
                [twcInventory.Fields.CREATED]: 'Date',
                [twcInventory.Fields.FEEDERS]: 'Feeders',
                [twcInventory.Fields.WIDTH_MM]: { hide: true },
                [twcInventory.Fields.HEIGHTDEPTH_MM]: { hide: true },
            }

            for (var k in tableFields) {
                if (tableFields[k].constructor.name == 'String') { tableFields[k] = { title: tableFields[k] } }
                tableFields[k].nullText = '-';
            }


            var whereClause = { [twcInventory.Fields.SITE]: dataSource.id, [twcInventory.Fields.EQ_TYPE]: eqType };

            var allowedCustomers = twcConfig.getUserAllowedCustomers(userInfo, true);
            if (allowedCustomers != 'all') {
                whereClause[twcInventory.Fields.CUSTOMER] = {
                    op: 'in',
                    values: allowedCustomers
                }
            } 


            tmeInventories.fields.push({
                id: `${twcInventory.Type}`, label: 'Site TME Equipment',
                fields: tableFields,
                where: whereClause,
                FieldsInfo: twcInventory.FieldsInfo,
            });

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

