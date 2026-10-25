/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_config.js', './oTWC_configUIFields.js', './oTWC_equipment.js', './oTWC_site.js'],
    (runtime, core, coreSQL, twcUtils, twcConfig, configUIFields, twcInventory, twcSite) => {
        // @@HARDCODED: @@TODO: move ot Utils and merge with SRF Step Type
        const EQ_CLASS_ENUM = {
            TME: 1,
            ATME: 2,
            GIE: 3,
            FEEDER: 4
        }

        const EQ_CLASS_TITLES = {
            [EQ_CLASS_ENUM.TME]: "TME / Tower Mounted Equipment",
            [EQ_CLASS_ENUM.ATME]: "ATME / Additional Tower Mounted Equipment",
            [EQ_CLASS_ENUM.GIE]: "GIE / Ground & Indoor Equipment",
            [EQ_CLASS_ENUM.FEEDER]: "Feeders"
        };

        function getInventoryTableFields() {
            var inventoryFields = [
                { field: twcInventory.Fields.NAME, title: 'Eq. ID' },
                { field: twcInventory.Fields.EQUIPMENT_INSTALL_STATUS, title: 'Install<br />Status' },
                { field: twcInventory.Fields.EQUIPMENT_LICENCE_STATUS, title: 'Licence<br />Status' },
                { field: twcInventory.Fields.INFRASTRUCTURE, title: 'Structure' },
                { field: twcInventory.Fields.CUSTOMER, title: 'Customer' },
                { field: twcInventory.Fields.EQUIPMENT_TYPE, title: 'Type', styles: { width: '100px' } },
                { field: twcInventory.Fields.MAKE, title: 'Make', styles: { width: '100px' } },
                { field: twcInventory.Fields.MODEL, title: 'Model' },
                { field: twcInventory.Fields.LENGTH_MM, title: 'Length (mm)' },
                { field: twcInventory.Fields.WIDTH_MM, title: 'Width (mm)' },
                { field: twcInventory.Fields.HEIGHTDEPTH_MM, title: 'Depth<br />(mm)' },
                { field: twcInventory.Fields.HEIGHT_ON_TOWER_M, title: 'Height on<br />Tower' },

            ];
            return inventoryFields;
        }

        function getSiteInventoryTableFields() {
            var tableFields = {
                [twcInventory.Fields.EQUIPMENT_CLASS]: 'Class',
                [twcInventory.Fields.EQUIPMENT_INSTALL_STATUS]: 'Install Status',
                [twcInventory.Fields.EQUIPMENT_LICENCE_STATUS]: 'License Status',
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
                [twcInventory.Fields.INVENTORY_FLAG]: 'Equipment Flag',
                [twcInventory.Fields.CREATED]: 'Date',
                // [twcInventory.Fields.FEEDERS]: 'Feeders',
                [twcInventory.Fields.WIDTH_MM]: { hide: true },
                [twcInventory.Fields.HEIGHTDEPTH_MM]: { hide: true },
                [twcInventory.Fields.PARENT_TME_ID]: { hide: true },
            }

            for (var k in tableFields) {
                if (tableFields[k].constructor.name == 'String') { tableFields[k] = { title: tableFields[k] } }
                tableFields[k].nullText = '-';
            }
            return tableFields;
        }

        // @@NOTE: loads all the site equipment in one go and nests the related equipment (ATME / Feeders, linked via PARENT_TME_ID) under its parent (TME / GIE)
        //         same approach as the SRF (oTWC_srfUI.js: getSrfItems) and SAF (oTWC_utils.js: getSafActions) tables
        //         each list is flattened as parent followed by its children (flagged with .child = true)
        //         if not grouped we just split the equipment by class (one list per class, no child rows)
        function getSiteEquipment(dataSource, userInfo, grouped) {
            var whereClause = { [twcInventory.Fields.SITE]: dataSource.id };

            var allowedCustomers = twcConfig.getUserAllowedCustomers(userInfo, true);
            if (allowedCustomers != 'all') {
                whereClause[twcInventory.Fields.CUSTOMER] = {
                    op: 'in',
                    values: allowedCustomers
                }
            }

            var items = twcInventory.select({ fields: getSiteInventoryTableFields(), where: whereClause, useNames: true });

            if (!grouped) {
                var byClass = { [EQ_CLASS_ENUM.TME]: [], [EQ_CLASS_ENUM.ATME]: [], [EQ_CLASS_ENUM.GIE]: [], [EQ_CLASS_ENUM.FEEDER]: [] };
                core.array.each(items, item => {
                    byClass[item[twcInventory.Fields.EQUIPMENT_CLASS]]?.push(item);
                })
                return byClass;
            }

            var parents = []; var unlinked = [];
            core.array.each(items, item => {
                var eqClass = item[twcInventory.Fields.EQUIPMENT_CLASS];
                if (eqClass == EQ_CLASS_ENUM.TME || eqClass == EQ_CLASS_ENUM.GIE) {
                    parents.push(item);
                    return;
                }
                var parentId = item[twcInventory.Fields.PARENT_TME_ID];
                var parent = (parentId) ? items.find(i => { return i.id == parentId; }) : null;
                // @@NOTE: no parent (or parent not visible to this user, e.g.: other customer) => goes to the 'unlinked' list
                if (!parent) {
                    unlinked.push(item);
                    return;
                }
                if (!parent.relatedItems) {
                    parent.relatedItems = [];
                    parent.expand = `<span class="twc-srf-item-expand" data-collapsed="true">+</span>`;
                }
                item.child = true;
                parent.relatedItems.push(item);
            })

            var res = { [EQ_CLASS_ENUM.TME]: [], [EQ_CLASS_ENUM.GIE]: [], unlinked: unlinked };
            core.array.each(parents, parent => {
                var list = res[parent[twcInventory.Fields.EQUIPMENT_CLASS]];
                list.push(parent);
                if (parent.relatedItems) { list.push(...parent.relatedItems); }
                // @@NOTE: we do not want to send this back to the client twice
                delete parent.relatedItems;
            })
            return res;
        }

        function getInvInfoPanels_Type(dataSource, title, items, withChildren) {
            var fieldGroup = { id: 'site-inventory', title: title, collapsed: false, controls: [] };

            var tmeInventories = { id: 'site-inventory-info', fields: [] };
            fieldGroup.controls.push(tmeInventories);

            var tableFields = {};
            if (withChildren) {
                tableFields['expand'] = { title: `<span class="twc-srf-item-expand-all" data-collapsed="true">+</span>`, nullText: '', styles: { width: '30px', 'text-align': 'center', padding: '0px' } };
            }
            Object.assign(tableFields, getSiteInventoryTableFields());

            if (withChildren) {
                // @@REVIEW: we need to fix filters sorting (on table ui) with child rows before we can enable them
                for (var k in tableFields) {
                    tableFields[k].noSort = true;
                    tableFields[k].noFilter = true;
                }
            }

            tmeInventories.fields.push({
                id: `${twcInventory.Type}`, label: title,
                fields: tableFields,
                dataSource: items,
                FieldsInfo: twcInventory.FieldsInfo,
                onRowInit: (table, row) => {
                    if (row.data.child) { row.cssClass += 'o-row-child o-row-hidden'; }
                }
            });

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        // @@NOTE: grouped (default) => TME / GIE tables with the related ATME / Feeders as child rows (+ unlinked ATME / Feeders if any)
        //         not grouped      => one table per equipment class (TME / ATME / GIE / Feeders)
        function getInvInfoPanels(dataSource, userInfo, grouped) {
            dataSource.Type = twcSite.Type;
            if (grouped === undefined) { grouped = true; }
            var equipment = getSiteEquipment(dataSource, userInfo, grouped);

            var fieldGroups = [];
            if (!grouped) {
                core.array.each([EQ_CLASS_ENUM.TME, EQ_CLASS_ENUM.ATME, EQ_CLASS_ENUM.GIE, EQ_CLASS_ENUM.FEEDER], eqClass => {
                    fieldGroups.push(getInvInfoPanels_Type(dataSource, EQ_CLASS_TITLES[eqClass], equipment[eqClass], false))
                })
                return fieldGroups;
            }
            fieldGroups.push(getInvInfoPanels_Type(dataSource, EQ_CLASS_TITLES[EQ_CLASS_ENUM.TME], equipment[EQ_CLASS_ENUM.TME], true))
            fieldGroups.push(getInvInfoPanels_Type(dataSource, EQ_CLASS_TITLES[EQ_CLASS_ENUM.GIE], equipment[EQ_CLASS_ENUM.GIE], true))
            if (equipment.unlinked.length > 0) {
                fieldGroups.push(getInvInfoPanels_Type(dataSource, 'Unlinked ATME / Feeders', equipment.unlinked, false))
            }
            return fieldGroups;
        }




        return {
            EqClass: EQ_CLASS_ENUM,

            getInventoryTableFields: getInventoryTableFields,
            getInvInfoPanels: getInvInfoPanels
        }
    });

