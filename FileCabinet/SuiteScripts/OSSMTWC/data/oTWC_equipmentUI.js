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

        // @@NOTE: site equipment tables, SRF column (not an equipment field, see getSiteEquipmentSrf)
        const SRF_COLUMN = 'srf_name';
        // @@NOTE: site equipment tables, computed columns (not equipment fields, values set in getSiteEquipment)
        //         computed server side (and not with formatValue) so the values survive the table being re-rendered on the client (sort / filter)
        //         TYPE_COLUMN      : feeders => feeder type (FEEDER_TYPE), everything else => equipment (item) type (EQUIPMENT_TYPE)
        //         MAKE_MODEL_COLUMN: make / model in one column
        const TYPE_COLUMN = 'eq_type_name';
        const MAKE_MODEL_COLUMN = 'make_model';
        const COMPUTED_COLUMNS = [SRF_COLUMN, TYPE_COLUMN, MAKE_MODEL_COLUMN];

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
                // @@NOTE: Length / Width / Depth shown as a single 'L/W/D' column (width / depth are still selected but hidden)
                {
                    field: twcInventory.Fields.LENGTH_MM, title: 'L/W/D', styles: { 'text-align': 'center' },
                    formatValue: (v, fv, data, col) => { return twcUtils.formatLWD(data[twcInventory.Fields.LENGTH_MM], data[twcInventory.Fields.WIDTH_MM], data[twcInventory.Fields.HEIGHTDEPTH_MM]); }
                },
                { field: twcInventory.Fields.WIDTH_MM, hide: true },
                { field: twcInventory.Fields.HEIGHTDEPTH_MM, hide: true },
                { field: twcInventory.Fields.HEIGHT_ON_TOWER_M, title: 'Height on<br />Tower' },

            ];
            return inventoryFields;
        }

        function getSiteInventoryTableFields(userInfo) {
            var tableFields = {
                // @@NOTE: employees can open the native equipment record (new tab), everyone else just sees the id
                [twcInventory.Fields.NAME]: {
                    title: 'Eq. ID',
                    // @@NOTE: (i) icon => equipment details dialog
                    prefix: twcInventory.infoIconPrefix('id'),
                    link: (userInfo?.isEmployee) ? { url: core.url.record(twcInventory.Type) + '&id=${id}', valueField: 'id' } : null
                },
                [twcInventory.Fields.EQUIPMENT_CLASS]: 'Class',
                // @@NOTE: TME Group (TMEG, modules/oTWC_eqTmeGroup.js), TME / ATME / Feeders only (hidden on the GIE tables, see CLASS_HIDDEN_FIELDS / GROUPED_HIDDEN_FIELDS)
                [twcInventory.Fields.TME_GROUP]: 'TME Group',
                [twcInventory.Fields.EQUIPMENT_INSTALL_STATUS]: 'Install Status',
                [twcInventory.Fields.EQUIPMENT_LICENCE_STATUS]: 'License Status',
                [twcInventory.Fields.CUSTOMER]: 'Customer',
                // @@NOTE: the columns flagged 'hide: true' here are only shown on some tables (see TABLE_SHOWN_FIELDS)
                [twcInventory.Fields.INFRASTRUCTURE]: { title: 'Infrastructure', hide: true },
                // @@NOTE: computed column (see TYPE_COLUMN), the title is set per table (see TABLE_TYPE_TITLE)
                [TYPE_COLUMN]: { title: 'Type' },
                [MAKE_MODEL_COLUMN]: { title: 'Make / Model', hide: true },
                [twcInventory.Fields.DESCRIPTION]: { title: 'Desc', wrap: true, styles: { 'min-width': '200px' } },
                // @@NOTE: custrecord_twc_equip_location is the 'Modified Antenna Location' (list: Cabin / Gantry / Rooftop, TME / ATME), GIE Location is free text (GIE)
                [twcInventory.Fields.MODIFIED_ANTENNA_LOCATION]: 'Modified<br />Antenna<br />Location',
                [twcInventory.Fields.GIE_LOCATION]: 'GIE Location',
                [twcInventory.Fields.LENGTH_MM]: {
                    title: 'L/W/D',
                    styles: { 'text-align': 'center' },
                    formatValue: (v, fv, data, col) => {
                        return twcUtils.formatLWD(data[twcInventory.Fields.LENGTH_MM], data[twcInventory.Fields.WIDTH_MM], data[twcInventory.Fields.HEIGHTDEPTH_MM]);
                    }
                },
                [twcInventory.Fields.HEIGHT_ON_TOWER_M]: { title: 'Height on<br />Tower (m)', hide: true, styles: { 'text-align': 'center' } },
                [twcInventory.Fields.AZIMUTH]: { title: 'Az', styles: { width: '65px' } },
                [twcInventory.Fields.B_END]: 'B-End',
                [twcInventory.Fields.CUSTOMER_REF]: 'Cust. Ref',
                [twcInventory.Fields.INVENTORY_FLAG]: 'Equipment Flag',
                // @@NOTE: not an equipment field, it is excluded from the select and filled by getSiteEquipmentSrf (SRF of the equipment action associated to the equipment)
                //         the link opens the SRF page (view mode). Last visible column (the ones below are hidden)
                [SRF_COLUMN]: {
                    title: 'SRF',
                    link: { url: core.url.script('otwc_spacerequest_sl') + '&recId=${srf_id}', valueField: 'srf_id' }
                },
                // [twcInventory.Fields.FEEDERS]: 'Feeders',
                [twcInventory.Fields.WIDTH_MM]: { hide: true },
                [twcInventory.Fields.HEIGHTDEPTH_MM]: { hide: true },
                [twcInventory.Fields.PARENT_TME_ID]: { hide: true },
                // @@NOTE: loaded for the computed columns (TYPE_COLUMN / MAKE_MODEL_COLUMN), never shown
                [twcInventory.Fields.FEEDER_TYPE]: { hide: true },
                [twcInventory.Fields.EQUIPMENT_TYPE]: { hide: true },
                [twcInventory.Fields.MAKE]: { hide: true },
                [twcInventory.Fields.MODEL]: { hide: true },
            }

            for (var k in tableFields) {
                if (tableFields[k].constructor.name == 'String') { tableFields[k] = { title: tableFields[k] } }
                tableFields[k].nullText = '-';
            }
            // @@NOTE: no SRF => empty (a '-' would be rendered inside the link)
            tableFields[SRF_COLUMN].nullText = '';
            return tableFields;
        }

        // @@NOTE: SRF of the equipment action associated to each equipment of the site (one query for the whole site), keyed by equipment id
        //         same join used on the Site Equipment locator (ui/modules/oTWC_inventoryUtils.js: getInventoryData)
        function getSiteEquipmentSrf(siteId) {
            var srfs = {};
            coreSQL.each(`
                select  eq.id, ea.custrecord_twc_eq_action_srf as srf_id, BUILTIN.DF(ea.custrecord_twc_eq_action_srf) as srf_name
                from    ${twcInventory.Type} eq
                join    customrecord_twc_eq_action ea on ea.id = eq.${twcInventory.Fields.ASSOCIATED_EQUIP_ACTIONS}
                where   eq.${twcInventory.Fields.SITE} = ${parseInt(siteId)}
                and     ea.custrecord_twc_eq_action_srf is not null
            `, r => {
                srfs[r.id] = r;
            });
            return srfs;
        }

        // @@NOTE: customers with equipment on the site (drop down data source { value, text }), Site Info page customer filter (data/oTWC_siteUI.js: getSiteInfoPanels)
        //         cancelled equipment is left out as it is never shown on the site equipment list (see getSiteEquipment)
        function getSiteEquipmentCustomers(siteId) {
            return coreSQL.run(`
                select  distinct eq.${twcInventory.Fields.CUSTOMER} as value, BUILTIN.DF(eq.${twcInventory.Fields.CUSTOMER}) as text
                from    ${twcInventory.Type} eq
                where   eq.${twcInventory.Fields.SITE} = ${parseInt(siteId)}
                and     eq.${twcInventory.Fields.CUSTOMER} is not null
                and     NVL(eq.${twcInventory.Fields.EQUIPMENT_INSTALL_STATUS}, 0) != ${twcUtils.EqInstallStatus.Cancelled}
                and     NVL(eq.${twcInventory.Fields.EQUIPMENT_LICENCE_STATUS}, 0) != ${twcUtils.EqLicenseStatus.Cancelled}
                order by 2
            `);
        }

        // @@NOTE: loads all the site equipment in one go and nests the related equipment (ATME / Feeders, linked via PARENT_TME_ID) under its parent (TME / GIE)
        //         same approach as the SRF (oTWC_srfUI.js: getSrfItems) and SAF (oTWC_utils.js: getSafActions) tables
        //         each list is flattened as parent followed by its children (flagged with .child = true)
        //         if not grouped we just split the equipment by class (one list per class, no child rows)
        //         hideInactive: leave out the equipment neither licenced nor installed (oTWC_utils.js: isEquipmentInactive)
        function getSiteEquipment(dataSource, userInfo, grouped, hideInactive) {
            var whereClause = { [twcInventory.Fields.SITE]: dataSource.id };

            // @@NOTE: equipment visibility follows the agent passes (contractors only see the customers on their agent passes), see oTWC_config.js: getAgentPassCustomers
            var allowedCustomers = twcConfig.getAgentPassCustomers(userInfo);
            if (allowedCustomers != 'all') {
                if (allowedCustomers.length == 0) { allowedCustomers = [0]; }
                whereClause[twcInventory.Fields.CUSTOMER] = {
                    op: 'in',
                    values: allowedCustomers
                }
            }

            var selectFields = getSiteInventoryTableFields(userInfo);
            core.array.each(COMPUTED_COLUMNS, c => { delete selectFields[c]; });
            var items = twcInventory.select({ fields: selectFields, where: whereClause, useNames: true });
            // @@NOTE: cancelled equipment (install or licence status Cancelled, e.g.: install on a cancelled SRF) is not shown on the site equipment list
            //         filtered here rather than in the where clause so equipment with no status is not dropped (null != x)
            items = items.filter(item => {
                return item[twcInventory.Fields.EQUIPMENT_INSTALL_STATUS] != twcUtils.EqInstallStatus.Cancelled
                    && item[twcInventory.Fields.EQUIPMENT_LICENCE_STATUS] != twcUtils.EqLicenseStatus.Cancelled;
            });
            // @@NOTE: 'Hide Inactive' toggle (ui/oTWC_inventory_sl.js), filtered before grouping: an ATME / Feeder whose TME is hidden goes under a visible TME of the same TMEG (if any, see below), otherwise in the 'unlinked' list
            if (hideInactive) {
                items = items.filter(item => {
                    return !twcUtils.isEquipmentInactive(item[twcInventory.Fields.EQUIPMENT_LICENCE_STATUS], item[twcInventory.Fields.EQUIPMENT_INSTALL_STATUS]);
                });
            }

            var srfs = getSiteEquipmentSrf(dataSource.id);
            core.array.each(items, item => {
                item.srf_id = srfs[item.id]?.srf_id || '';
                item[SRF_COLUMN] = srfs[item.id]?.srf_name || null;
                // @@NOTE: computed columns (see TYPE_COLUMN / MAKE_MODEL_COLUMN)
                item[TYPE_COLUMN] = (item[twcInventory.Fields.EQUIPMENT_CLASS] == EQ_CLASS_ENUM.FEEDER)
                    ? (item[twcInventory.Fields.FEEDER_TYPE + '_name'] || null)
                    : (item[twcInventory.Fields.EQUIPMENT_TYPE + '_name'] || null);
                var makeModel = [item[twcInventory.Fields.MAKE], item[twcInventory.Fields.MODEL]].filter(x => { return x; });
                item[MAKE_MODEL_COLUMN] = (makeModel.length > 0) ? makeModel.join(' / ') : null;
                // @@NOTE: row data only (not a column), used by the Site Info page client side filters (ui/js/oTWC_siteInfo.js: applyEquipmentFilters)
                item.eq_inactive = twcUtils.isEquipmentInactive(item[twcInventory.Fields.EQUIPMENT_LICENCE_STATUS], item[twcInventory.Fields.EQUIPMENT_INSTALL_STATUS]) ? 'T' : 'F';
            });

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
                // @@NOTE: only TME can be a parent, GIE never have related items (anything pointing to a GIE ends up in the 'unlinked' list)
                var parent = (parentId) ? items.find(i => { return i.id == parentId && i[twcInventory.Fields.EQUIPMENT_CLASS] == EQ_CLASS_ENUM.TME; }) : null;
                // @@NOTE: parent set but not in the list (e.g.: swapped out TME hidden by 'Hide Inactive') => under a visible TME of the same TME Group (TMEG, modules/oTWC_eqTmeGroup.js)
                //         the latest one (highest id, usually the swap-in TME). A child with no parent at all stays in the 'unlinked' list
                var tmeGroup = item[twcInventory.Fields.TME_GROUP];
                if (!parent && parentId && tmeGroup) {
                    core.array.each(items, i => {
                        if (i[twcInventory.Fields.EQUIPMENT_CLASS] != EQ_CLASS_ENUM.TME || i[twcInventory.Fields.TME_GROUP] != tmeGroup) { return; }
                        if (!parent || parseInt(i.id) > parseInt(parent.id)) { parent = i; }
                    });
                }
                // @@NOTE: no parent (or parent not visible to this user, e.g.: other customer, and no visible TME of the same TMEG) => goes to the 'unlinked' list
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

            // @@NOTE: TMEs of the same TME Group (TMEG, e.g.: swap-out and swap-in TME) next to each other: groups in order of first appearance, then by id inside the group
            //         a TME with no TMEG is a group on its own. GIE order unchanged (GIE have no TMEG)
            var groupIdx = {};
            var tmeGroupKey = p => { return p[twcInventory.Fields.TME_GROUP] || ('id:' + p.id); };
            parents.forEach((p, idx) => {
                if (p[twcInventory.Fields.EQUIPMENT_CLASS] != EQ_CLASS_ENUM.TME) { return; }
                var key = tmeGroupKey(p);
                if (groupIdx[key] === undefined) { groupIdx[key] = idx; }
            });
            var tmeParents = parents.filter(p => { return p[twcInventory.Fields.EQUIPMENT_CLASS] == EQ_CLASS_ENUM.TME; });
            tmeParents.sort((a, b) => { return (groupIdx[tmeGroupKey(a)] - groupIdx[tmeGroupKey(b)]) || (parseInt(a.id) - parseInt(b.id)); });
            parents = tmeParents.concat(parents.filter(p => { return p[twcInventory.Fields.EQUIPMENT_CLASS] != EQ_CLASS_ENUM.TME; }));

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

        // @@NOTE: columns hidden on the single class tables (not grouped view), the fields are still loaded (e.g.: class is needed for the grouping)
        const CLASS_HIDDEN_FIELDS = {
            [EQ_CLASS_ENUM.TME]: [twcInventory.Fields.EQUIPMENT_CLASS, twcInventory.Fields.GIE_LOCATION],
            [EQ_CLASS_ENUM.ATME]: [twcInventory.Fields.EQUIPMENT_CLASS, twcInventory.Fields.AZIMUTH, twcInventory.Fields.B_END, twcInventory.Fields.GIE_LOCATION],
            [EQ_CLASS_ENUM.GIE]: [twcInventory.Fields.AZIMUTH, twcInventory.Fields.MODIFIED_ANTENNA_LOCATION, twcInventory.Fields.TME_GROUP],
            [EQ_CLASS_ENUM.FEEDER]: [twcInventory.Fields.EQUIPMENT_CLASS, twcInventory.Fields.LENGTH_MM, twcInventory.Fields.AZIMUTH, twcInventory.Fields.B_END, twcInventory.Fields.CUSTOMER_REF, twcInventory.Fields.MODIFIED_ANTENNA_LOCATION, twcInventory.Fields.GIE_LOCATION],
        }

        // @@NOTE: per table, the columns hidden by default in getSiteInventoryTableFields that are shown, and the 'Type' column title
        //         ungrouped view: one table per class (key = EQ_CLASS_ENUM), grouped view: GROUPED_TME (TME with ATME / Feeders child rows, and the unlinked ATME / Feeders) and GROUPED_GIE
        const GROUPED_TME = 'grouped_tme';
        const GROUPED_GIE = 'grouped_gie';
        const TABLE_SHOWN_FIELDS = {
            [EQ_CLASS_ENUM.TME]: [twcInventory.Fields.INFRASTRUCTURE, MAKE_MODEL_COLUMN, twcInventory.Fields.HEIGHT_ON_TOWER_M],
            [EQ_CLASS_ENUM.ATME]: [twcInventory.Fields.INFRASTRUCTURE, twcInventory.Fields.HEIGHT_ON_TOWER_M],
            [EQ_CLASS_ENUM.FEEDER]: [twcInventory.Fields.INFRASTRUCTURE],
            [EQ_CLASS_ENUM.GIE]: [twcInventory.Fields.INFRASTRUCTURE, twcInventory.Fields.LENGTH_MM],
            [GROUPED_TME]: [twcInventory.Fields.INFRASTRUCTURE, MAKE_MODEL_COLUMN, twcInventory.Fields.HEIGHT_ON_TOWER_M],
            [GROUPED_GIE]: [],
        }
        // @@NOTE: grouped view hidden columns (the ungrouped ones are in CLASS_HIDDEN_FIELDS): GIE Location is a GIE field, the antenna location a TME / ATME field
        const GROUPED_HIDDEN_FIELDS = {
            [GROUPED_TME]: [twcInventory.Fields.GIE_LOCATION],
            [GROUPED_GIE]: [twcInventory.Fields.MODIFIED_ANTENNA_LOCATION, twcInventory.Fields.TME_GROUP],
        }
        const TABLE_TYPE_TITLE = {
            [EQ_CLASS_ENUM.TME]: 'Equipment<br />Type',
            [EQ_CLASS_ENUM.ATME]: 'Equipment<br />Type',
            [EQ_CLASS_ENUM.FEEDER]: 'Feeder Type',
            [GROUPED_TME]: 'Equipment<br />Type',
        }

        // @@NOTE: eqClass is only passed for the single class tables (not grouped view)
        //         groupedTable: grouped view table (GROUPED_TME / GROUPED_GIE)
        function getInvInfoPanels_Type(dataSource, userInfo, title, items, withChildren, eqClass, groupedTable) {
            var fieldGroup = { id: 'site-inventory', title: title, collapsed: false, controls: [] };

            var tmeInventories = { id: 'site-inventory-info', fields: [] };
            fieldGroup.controls.push(tmeInventories);

            var tableFields = {};
            if (withChildren) {
                tableFields['expand'] = { noExport: true, title: `<span class="twc-srf-item-expand-all" data-collapsed="true">+</span>`, nullText: '', styles: { width: '30px', 'text-align': 'center', padding: '0px' } };
            }
            Object.assign(tableFields, getSiteInventoryTableFields(userInfo));

            // @@NOTE: table specific columns (shown first, then hidden: hidden wins) and 'Type' column title
            var tableKey = eqClass || groupedTable;
            core.array.each(TABLE_SHOWN_FIELDS[tableKey] || [], f => { tableFields[f].hide = false; });
            core.array.each((eqClass ? CLASS_HIDDEN_FIELDS[eqClass] : GROUPED_HIDDEN_FIELDS[groupedTable]) || [], f => { tableFields[f].hide = true; });
            if (TABLE_TYPE_TITLE[tableKey]) { tableFields[TYPE_COLUMN].title = TABLE_TYPE_TITLE[tableKey]; }

            if (eqClass) {
                // @@NOTE: ATME / Feeders tables show the parent TME right after the 'Eq. ID' column, clicking it highlights the TME row in the TME table (ui/js/oTWC_inventory.js: highlightEquipment)
                //         we use the column 'link' option (and not formatValue) as it is serialized and so it survives the table being re-rendered on the client (sort / filter)
                if (eqClass == EQ_CLASS_ENUM.ATME || eqClass == EQ_CLASS_ENUM.FEEDER) {
                    var tmeField = tableFields[twcInventory.Fields.PARENT_TME_ID];
                    tmeField.hide = false;
                    tmeField.title = 'TME';
                    tmeField.link = {
                        url: 'onclick="twc.page.highlightEquipment(${' + twcInventory.Fields.PARENT_TME_ID + '}); return false;"',
                        valueField: twcInventory.Fields.PARENT_TME_ID,
                        target: '_self'
                    };
                    // @@NOTE: re-build the object so the TME column sits right after the 'Eq. ID' column (column order = key order)
                    var orderedFields = {};
                    for (var k in tableFields) {
                        if (k == twcInventory.Fields.PARENT_TME_ID) { continue; }
                        orderedFields[k] = tableFields[k];
                        if (k == twcInventory.Fields.NAME) { orderedFields[twcInventory.Fields.PARENT_TME_ID] = tmeField; }
                    }
                    tableFields = orderedFields;
                }
            }

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
        //         not grouped      => one table per equipment class (TME / ATME / Feeders / GIE)
        //         hideInactive     => leave out the equipment neither licenced nor installed (see getSiteEquipment)
        function getInvInfoPanels(dataSource, userInfo, grouped, hideInactive) {
            dataSource.Type = twcSite.Type;
            if (grouped === undefined) { grouped = true; }
            var equipment = getSiteEquipment(dataSource, userInfo, grouped, hideInactive);

            var fieldGroups = [];
            if (!grouped) {
                core.array.each([EQ_CLASS_ENUM.TME, EQ_CLASS_ENUM.ATME, EQ_CLASS_ENUM.FEEDER, EQ_CLASS_ENUM.GIE], eqClass => {
                    fieldGroups.push(getInvInfoPanels_Type(dataSource, userInfo, EQ_CLASS_TITLES[eqClass], equipment[eqClass], false, eqClass))
                })
                return fieldGroups;
            }
            fieldGroups.push(getInvInfoPanels_Type(dataSource, userInfo, EQ_CLASS_TITLES[EQ_CLASS_ENUM.TME], equipment[EQ_CLASS_ENUM.TME], true, null, GROUPED_TME))
            // @@NOTE: GIE never have child rows so no expand / collapse column
            //         GIE Location is shown (it is part of getSiteInventoryTableFields), antenna location is a TME / ATME field
            fieldGroups.push(getInvInfoPanels_Type(dataSource, userInfo, EQ_CLASS_TITLES[EQ_CLASS_ENUM.GIE], equipment[EQ_CLASS_ENUM.GIE], false, null, GROUPED_GIE))
            if (equipment.unlinked.length > 0) {
                fieldGroups.push(getInvInfoPanels_Type(dataSource, userInfo, 'Unlinked ATME / Feeders', equipment.unlinked, false, null, GROUPED_TME))
            }
            return fieldGroups;
        }




        // @@NOTE: all the equipment properties for the equipment details dialog ((i) icon, ui/views/oTWC_baseView.js: showEquipmentInfo, via oTWC_microSvc_sl.js action 'get-equipment-info')
        //         labels are the NetSuite field labels, fields in the generated order. External users: only equipment of their allowed customers,
        //         and fields flagged as TL only in the field access setup (customrecord_twc_fieldaccess) are left out
        // @@NOTE: equipment details dialog field sequence (client request), keys of twcInventory.Fields / FieldsInfo
        //         'Equipment ID' is the record name, Length / Width / Height are LENGTH_MM / WIDTH_MM / HEIGHTDEPTH_MM
        const EQ_INFO_FIELD_ORDER = [
            'NAME', 'PARENT_TME_ID', 'TME_GROUP', 'CUSTOMER', 'SITE', 'INFRASTRUCTURE',
            'EQUIPMENT_CLASS', 'EQUIPMENT_TYPE', 'EQUIPMENT_INSTALL_STATUS', 'EQUIPMENT_LICENCE_STATUS',
            'HEIGHT_ON_TOWER_M', 'MODIFIED_ANTENNA_LOCATION', 'GIE_LOCATION', 'AZIMUTH', 'B_END', 'CUSTOMER_REF', 'INVENTORY_FLAG', 'FEEDER_TYPE',
            'USE_LIBRARY', 'EQUIPMENT_LIBRARY_ENTRY', 'MAKE', 'MODEL', 'DESCRIPTION',
            'LENGTH_MM', 'WIDTH_MM', 'HEIGHTDEPTH_MM', 'WEIGHT_KG', 'VOLTAGE_TYPE',
            'LICENCE_COMMENCEMENT_DATE', 'INSTALLED_DATE', 'REMOVED_DATE'
        ];
        // @@NOTE: always at the bottom of the dialog, in this order (after the fields not in EQ_INFO_FIELD_ORDER)
        const EQ_INFO_FIELD_LAST = ['CREATED', 'OWNER', 'MODIFIED', 'MODIFIED_BY'];
        // @@NOTE: not shown on the dialog: EQUIPMENT_ID (custrecord_twc_equip_id) duplicates the record name 'Equipment ID'
        const EQ_INFO_FIELD_HIDDEN = ['EQUIPMENT_ID'];

        function getEquipmentInfo(options, userInfo) {
            var eqId = parseInt(options?.id);
            if (!eqId) { throw new Error('invalid parameters passed'); }

            var eq = twcInventory.select({ where: { id: eqId }, useNames: true, returnFirst: true });
            if (!eq) { throw new Error(`No equipment found using id ${eqId}`); }
            var allowedCustomers = twcConfig.getAgentPassCustomers(userInfo);
            if (allowedCustomers != 'all' && allowedCustomers.indexOf(parseInt(eq[twcInventory.Fields.CUSTOMER])) < 0) {
                throw new Error('You do not have access to see this equipment');
            }

            var labels = {};
            core.array.each(twcConfig.getFields(twcInventory.Type), f => { labels[f.field_id] = f.field_label; });
            const STD_LABELS = { name: 'Equipment ID', created: 'Created', owner: 'Created By', lastmodified: 'Last Modified', lastmodifiedby: 'Last Modified By' };

            // @@NOTE: fields in EQ_INFO_FIELD_ORDER first (client requested sequence), then all the others in the generated order, then EQ_INFO_FIELD_LAST
            var fieldKeys = EQ_INFO_FIELD_ORDER.filter(k => { return twcInventory.FieldsInfo[k]; });
            for (var k in twcInventory.FieldsInfo) {
                if (fieldKeys.indexOf(k) >= 0 || EQ_INFO_FIELD_LAST.indexOf(k) >= 0 || EQ_INFO_FIELD_HIDDEN.indexOf(k) >= 0) { continue; }
                fieldKeys.push(k);
            }
            fieldKeys.push(...EQ_INFO_FIELD_LAST.filter(k => { return twcInventory.FieldsInfo[k]; }));

            var fields = [];
            for (var x = 0; x < fieldKeys.length; x++) {
                var f = twcInventory.FieldsInfo[fieldKeys[x]];
                if (!userInfo.isEmployee) {
                    var access = configUIFields.getFieldAccess({ Type: twcInventory.Type }, f.name);
                    if (access?.access == configUIFields.FieldAccessType.TL) { continue; }
                }
                var value = eq[f.name];
                if (f.type == 'select' || f.type == 'multiselect') {
                    value = eq[f.name + '_name'];
                } else if (f.type == 'checkbox') {
                    value = (value == 'T' || value === true) ? 'Yes' : 'No';
                }
                fields.push({ id: f.name, label: STD_LABELS[f.name] || labels[f.name] || f.alias || f.name, value: (value === null || value === undefined) ? '' : value });
            }

            return { id: eqId, name: eq[twcInventory.Fields.NAME], fields: fields };
        }

        return {
            EqClass: EQ_CLASS_ENUM,
            getEquipmentInfo: getEquipmentInfo,
            getSiteEquipmentCustomers: getSiteEquipmentCustomers,

            getInventoryTableFields: getInventoryTableFields,
            getInvInfoPanels: getInvInfoPanels
        }
    });

