/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_config.js', '../../data/oTWC_equipmentUI.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_utils.js', '../../data/oTWC_saf.js', '../../data/oTWC_equipment.js', '../../data/oTWC_site.js', '../../data/oTWC_siteUI.js'],
    (core, coreSQL, twcConfig, twcInventoryUI, twcUI, twcUtils, twcSaf, twcEqip, twcSite, twcSiteUI, twcSrfUI) => {

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
            html = html.replace('{FILTER_CUSTOMER}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Customer', width: '50%', multiSelect: true, id: twcSaf.Fields.CUSTOMER, noEmpty: true, dataSource: twcUtils.getCustomers(userInfo), noAutoSelect:true }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Counties', width: '50%', multiSelect: true, id: twcSaf.Fields.COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_REGION}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Region', width: '50%', multiSelect: true, id: twcSaf.Fields.REGION, noEmpty: true, dataSource: twcUtils.getRegions() }));
            
            html = html.replace('{FILTER_LAT}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Latitude', id: 'twc-coord-latitude', width: '250px' }));
            html = html.replace('{FILTER_LNG}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Longitude', id: 'twc-coord-longitude', width: '250px' }));
            html = html.replace('{FILTER_RADIUS}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Radius (Km)', id: 'twc-coord-radius', value: 5, width: '75px', min: 5, max: 300 }));

            return html;
        }

        function getInventoryData(options, userInfo) {
            const inventoryFields = twcUtils.getFields(twcEqip.Type);
            // log.debug("twcInventoryUI", twcInventoryUI)
            const userFields = twcInventoryUI.getInventoryTableFields();
            // let sqlFields = 'id, BUILTIN.DF(custrecord_twc_equip_site), custrecord_twc_equip_class, custrecord_twc_equip_status, BUILTIN.DF(custrecord_twc_equip_customer), custrecord_twc_equip_description, custrecord_twc_equip_length_mm, custrecord_twc_equip_width_mm, custrecord_twc_equip_ht_depth_mm, custrecord_twc_equip_ht_on_twr_m, custrecord_twc_equip_voltage_type, custrecord_twc_equip_azimuth, custrecord_twc_equip_b_end, custrecord_twc_equip_inv_flag, custrecord_twc_equip_feeder_count, custrecord_twc_equip_location'
            // sqlFields += formatUserFields(srfFields, window.twc.page.data.data.equipmentInfo.userFields);
            // BUILTIN.DF(custrecord_twc_equip_site), BUILTIN.DF(custrecord_twc_equip_customer), 
            const sqlQuery = `
                SELECT 
                    id,
                    custrecord_twc_equip_site as site_id,
                    custrecord_twc_equip_class, 
                    custrecord_twc_equip_status,
                    custrecord_twc_equip_description, 
                    custrecord_twc_equip_length_mm, 
                    custrecord_twc_equip_width_mm, 
                    custrecord_twc_equip_ht_depth_mm, 
                    custrecord_twc_equip_ht_on_twr_m, 
                    custrecord_twc_equip_voltage_type, 
                    custrecord_twc_equip_azimuth, 
                    custrecord_twc_equip_b_end, 
                    custrecord_twc_equip_inv_flag, 
                    custrecord_twc_equip_feeder_count, 
                    custrecord_twc_equip_location 
                    FROM 
                        customrecord_twc_equip;
                `;
            const inventoryDetails = coreSQL.run(sqlQuery);

            return {
                inventoryDetails: inventoryDetails,
                inventoryFields: inventoryFields,
                userFields: userFields,
                sites: getSites(options).sites
            }
        }


        function getSites(options, userInfo) {

            var siteFields = twcUtils.getFields(twcSite.Type);
            var userFields = twcSiteUI.getSiteTableFields();

            var sqlFields = 's.id, s.id as record_id, s.name';
            sqlFields += formatUserFields(siteFields, userFields);

            // core.array.each(userFields, uf => {
            //     var nsField = siteFields.find(nsf => { return nsf.field_id == uf.field });
            //     var sqlField = uf.field;
            //     uf.type = nsField.field_type;
            //     if (nsField.field_type == 'List/Record') {
            //         uf.listRecord = true;
            //         sqlField = `${sqlField} as ${sqlField}, BUILTIN.DF(${sqlField}) as ${sqlField}_text`;
            //     }
            //     sqlFields += `, s.${sqlField}`;

            //     if (!uf.label) { uf.label = nsField.field_label; }

            // })


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
        }

        return {
            renderInventoryPanel: renderInventoryPanel,
            getInventoryData: getInventoryData,
            getSites: getSites
        }
    });
