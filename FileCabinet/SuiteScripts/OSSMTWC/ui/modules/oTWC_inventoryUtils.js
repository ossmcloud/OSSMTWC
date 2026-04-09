/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_config.js', '../../data/oTWC_equipment.js', '../../data/oTWC_equipmentUI.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_utils.js', '../../data/oTWC_saf.js', '../../data/oTWC_equipment.js', '../../data/oTWC_site.js', '../../data/oTWC_siteUI.js'],
    (core, coreSQL, twcConfig, twcInventory, twcInventoryUI, twcUI, twcUtils, twcSaf, twcEqip, twcSite, twcSiteUI) => {

        function renderInventoryPanel(userInfo, featureId) {
            var html = `
                <script async defer src="https://maps.googleapis.com/maps/api/js?key=${twcConfig.cfg().GOOGLE_API_KEY}&loading=async"></script>
                <div style="max-height: 60vh; overflow: hidden;">
                <div id="site-finder-table" class="twc-div-table-t">
                    <div class="twc-border" style="width: 50%;">
                        <div id="twc-google-map-container" class="twc-animate-height">
                            
                        </div>
                    </div>
                    <div class="twc-border">
                        <div id="twc-google-map-filters"  class="twc-animate-height" style="max-height: 59vh; overflow: auto;">
                            <h3 class="twc">Site Inventory</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_NAME}
                                </div>
                                <div>
                                    {FILTER_SAF_ID}
                                    {FILTER_STATUS}
                                </div>
                                <div>
                                    {FILTER_TYPE}
                                </div>
                                <div>
                                    {FILTER_CUSTOMER}
                                </div>
                                <div>
                                    {FILTER_COUNTIES}
                                </div>
                                <div>
                                    {FILTER_REGION}
                                </div>
                            </div>
                            <h3 class="twc">Filter by Location</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_LAT} {FILTER_LNG} {FILTER_RADIUS}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            html = html.replace('{FILTER_NAME}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site', width: '75%', id: 'record_id', noEmpty: true, dataSource: twcUtils.getSiteNames() }));
            html = html.replace('{FILTER_SAF_ID}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Equipment ID', width: 'calc(25% - 2px)', multiSelect: true, id: twcSaf.Fields.SAF_ID, noEmpty: true, dataSource: twcUtils.getSafIds() })); // @@Note Free form field, filter not working
            html = html.replace('{FILTER_STATUS}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Status', width: 'calc(25% - 2px)', multiSelect: true, id: twcSaf.Fields.STATUS, noEmpty: true, dataSource: twcUtils.getSafStatus() }));
            html = html.replace('{FILTER_TYPE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Type', width: '50%', multiSelect: true, id: twcSaf.Fields.TYPE, noEmpty: true, dataSource: twcUtils.getSafTypes() }));
            html = html.replace('{FILTER_CUSTOMER}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Customer', width: '50%', multiSelect: true, id: twcSaf.Fields.CUSTOMER, noEmpty: true, dataSource: twcUtils.getCustomers(userInfo), noAutoSelect: true }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Counties', width: '50%', multiSelect: true, id: twcSaf.Fields.COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_REGION}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Region', width: '50%', multiSelect: true, id: twcSaf.Fields.REGION, noEmpty: true, dataSource: twcUtils.getRegions() }));

            html = html.replace('{FILTER_LAT}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Latitude', id: 'twc-coord-latitude', width: '250px' }));
            html = html.replace('{FILTER_LNG}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Longitude', id: 'twc-coord-longitude', width: '250px' }));
            html = html.replace('{FILTER_RADIUS}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Radius (Km)', id: 'twc-coord-radius', value: 5, width: '75px', min: 5, max: 300 }));

            return html;
        }

        function getInventoryData(options, userInfo) {
            const inventoryFields = twcUtils.getFields(twcEqip.Type);
            const userFields = twcInventoryUI.getInventoryTableFields();
            var sqlFields = 's.id, s.id as record_id, s.custrecord_twc_equip_site as site_id, BUILTIN.DF(s.custrecord_twc_equip_site) as site_id_text';
            sqlFields += formatUserFields(inventoryFields, userFields);

            // @@TODO: if we decide to have filters / sort  columns on the 'options' parameter we'll built it here
            var whereClause = 'where 1 = 1 ';
            var orderBy = `order by s.${twcInventory.Fields.EQUIPMENT_ID}`;

            var allowedCustomers = twcConfig.getUserAllowedCustomers(userInfo, true);
            if (allowedCustomers != 'all') {
                whereClause += `and ${twcInventory.Fields.CUSTOMER} in (${allowedCustomers.join(',')})`;
            }

            var inventoryDetails = coreSQL.run(`
                select  ${sqlFields}, BUILTIN.DF(i.custrecord_twc_infra_type) as infra_type, BUILTIN.DF(i.custrecord_twc_infra_str_type) as infra_str_type, i.custrecord_twc_infra_id as infra_id
                from    ${twcInventory.Type} s
                join    customrecord_twc_infra i on i.id = ${twcInventory.Fields.INFRASTRUCTURE}
                ${whereClause} 
                ${orderBy}
            `)

            return {
                inventoryDetails: inventoryDetails,
                inventoryFields: inventoryFields,
                userFields: userFields,
                sites: getSites(options).sites
            }
        }

        function getSiteInfo(siteId) {
            if (!siteId) { throw new Error('No site id provided!'); }

            // @@TODO: move to rec.custom.js
            var siteFields = twcSite.getFields();

            var joinTables = [];
            core.array.each(siteFields, f => {
                if (f.field_type != 'List/Record') { return; }
                joinTables.push(f.field_foreign_table);
            })

            var foreignFields = twcUtils.getFields(joinTables);

            var joins = ''; var selectList = 's.id, ';
            core.array.each(siteFields, f => {
                selectList += `s.${f.field_id}, `
                if (f.field_type != 'List/Record') { return; }

                var tblAlias = f.field_foreign_table.replace('customrecord_', '');
                selectList += `BUILTIN.DF(s.${f.field_id}) as ${f.field_id}_name, `

                var foreignTableFields = foreignFields.filter(ff => { return ff.table_name == f.field_foreign_table; })
                core.array.each(foreignTableFields, ff => {
                    if (!ff.field_id.startsWith('cust')) { return; }
                    selectList += `${ff.field_id}, `
                })

                joins += `
                    left join ${f.field_foreign_table} as ${tblAlias} on ${tblAlias}.id = s.${f.field_id}
                `
            })

            var siteInfo = coreSQL.first({
                query: `
                    select  ${selectList}
                    from    ${twcSite.Type} s
                    ${joins}
                    where   s.id = ?
                `,
                params: [siteId]
            })

            var mainFields = twcSiteUI.getSiteMainInfoFields();

            core.array.each(mainFields, mfg => {
                core.array.each(mfg.fields, mf => {
                    if (mf.childTable) {
                        siteInfo[mf.id] = '';

                        var url = core.url.record(mf.childTable.table)
                        var fields = '';
                        if (mf.childTable.fields) {
                            core.array.each(mf.childTable.fields, mff => {
                                fields += mff.isForeignKey ? `BUILTIN.DF(${mff.id}) as ${mff.id}, ` : `${mff.id}, `;
                            })
                        } else {
                            fields = mf.childTable.isForeignKey ? `BUILTIN.DF(${mf.id}) as ${mf.id}` : `${mf.id}`;
                        }

                        coreSQL.each(`select id, ${fields} from ${mf.childTable.table} where ${mf.childTable.siteField} = ${siteId}`, childRecord => {
                            var fieldValue = childRecord[mf.id];
                            if (mf.childTable.mask) {
                                fieldValue = mf.childTable.mask;
                                core.array.each(mf.childTable.fields, mff => {
                                    var value = childRecord[mff.id];
                                    if (value === null || value === undefined) {
                                        value = mff.nullText;
                                    } else {
                                        if (mff.mask) {
                                            value = mff.mask.replaceAll(mff.id, value)
                                        }
                                    }
                                    fieldValue = fieldValue.replaceAll(mff.id, value);
                                });
                            }
                            siteInfo[mf.id] += `<a href="${url}&id=${childRecord.id}" target="_blank">${fieldValue}</a><br />`;
                        })
                    }
                })
            })

            siteInfo.Type = twcSite.Type;

            return {
                site: siteInfo,
                mainFields: mainFields,
            };
        }


        function getSites(options, userInfo) {

            var siteFields = twcUtils.getFields(twcSite.Type);
            var userFields = twcSiteUI.getSiteTableFields();

            var sqlFields = 's.id, s.id as record_id, s.name';
            sqlFields += formatUserFields(siteFields, userFields);

            // @@TODO: if we decide to have filters / sort  columns on the 'options' parameter we'll built it here
            var whereClause = 'where 1 = 1 ';
            var orderBy = `order by s.${twcSite.Fields.NAME}`;

            var sites = coreSQL.run(`
                select  ${sqlFields}, st.custrecord_twc_site_types_color as site_type_color, sl.custrecord_twc_site_level_color as site_level_color,
                from    ${twcSite.Type} s
                left join    customrecord_twc_site_type st on st.id = s.${twcSite.Fields.SITE_TYPE}
                left join    customrecord_twc_site_level sl on sl.id = s.${twcSite.Fields.SITE_LEVEL}
                ${whereClause} 
                ${orderBy}
            `)


            return {
                siteFields: siteFields,
                userFields: userFields,
                sites: sites
            }
        }

        function formatUserFields(fields, userFields) {
            try {
                var sqlFields = '';
                core.array.each(userFields, uf => {
                    if (uf.field == 'name' || uf.field == 'custrecord_twc_srf_site') { return; }
                    var nsField = fields.find(nsf => { return nsf.field_id == uf.field });
                    var sqlField = uf.field;
                    uf.type = twcUI.nsTypeToTableColumnType(nsField.field_type);
                    if (nsField.field_type == 'Date') {
                        sqlFields += `, TO_CHAR(s.${sqlField}, 'yyyy-MM-dd') as ${sqlField}`;

                    } else if (nsField.field_type == 'DateTimeZ' || nsField.field_type == 'Date/Time') {
                        sqlFields += `, TO_CHAR(s.${sqlField}, 'yyyy-MM-dd HH24:mm') as ${sqlField}`;

                    } else {
                        if (nsField.field_type == 'List/Record') {
                            uf.listRecord = true;
                            sqlField = `${sqlField} as ${sqlField}, BUILTIN.DF(${sqlField}) as ${sqlField}_text`;
                        }
                        sqlFields += `, s.${sqlField}`;

                    }
                    if (!uf.label) { uf.label = nsField.field_label; }
                })
                return sqlFields;
            } catch (e) {
                throw new Error(`Error formatting user fields: ${e.message} - ${JSON.stringify(userFields)}`);
            }
        }

        return {
            renderInventoryPanel: renderInventoryPanel,
            getInventoryData: getInventoryData,
            getSites: getSites,
            getSiteInfo: getSiteInfo,
            getInvInfoPanels: twcInventoryUI.getInvInfoPanels,
            getInventoryInfo: (pageData) => {
                var inv = {};
                if (pageData.siteId) {
                    inv = coreSQL.first(`select * from ${twcInventory.Type} where id = ${pageData.siteId}`);
                    inv.siteId = inv[twcInventory.Fields.SITE];
                    inv.type = twcInventory.Type;

                    if (!twcConfig.isUserAllowedCustomers(pageData.userInfo, inv[twcInventory.Fields.CUSTOMER])) {
                        throw new Error('You do not have access to see this Inventory record');
                    }

                } else {
                    if (pageData.userInfo.isCustomer) { inv[twcInventory.Fields.CUSTOMER] = pageData.userInfo.id; }
                    inv[twcInventory.Fields.SITE] = pageData.siteId;
                }
                return inv;
            },
        }
    });
