/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_utils.js', '../../data/oTWC_troubleTickets.js', '../../data/oTWC_troubleTicketsUI.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_config.js','../../data/oTWC_site.js','../../data/oTWC_siteUI.js','SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    (core, coreSQL, twcUtils, twcTrblTkts, twcTrblTktsUI, twcUI, twcConfig, twcSite, twcSiteUI, recu) => {

        function getTroubleTickets(options, userInfo) {

            var ticketFields = twcUtils.getFields(twcTrblTkts.Type);
           // throw new Error(JSON.stringify(ticketFields))
            var userFields = twcTrblTktsUI.getTicketsTableFields();

            var sqlFields = 's.id, s.id as record_id, s.custrecord_twc_trbl_tkt_site as site_id, BUILTIN.DF(s.custrecord_twc_trbl_tkt_site) as site_id_text';
            sqlFields += formatUserFields(ticketFields, userFields);

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
            var orderBy = `order by s.${twcTrblTkts.Fields.TROUBLE_TICKET_ID}`;
            // throw new Error(orderBy)  join    ${twcSite.Type} site on site.id = ${twcTrblTkts.Fields.SITE}
            var tickets = coreSQL.run(`
                select  ${sqlFields}
                from    ${twcTrblTkts.Type} s
                ${whereClause} 
                ${orderBy}
            `)

 //throw new Error(tickets)
            return {
                // getTroubleTickets: getTroubleTickets,
                userFields: userFields,
                ticketFields: ticketFields,
                tickets: tickets,
                sites: getSites(options).sites
            }
        }

         function getSites(options, userInfo) {
            
            var siteFields = twcUtils.getFields(twcSite.Type);
            var userFields = twcSiteUI.getSiteTableFields();

            var sqlFields = 's.id, s.id as record_id, s.name, s.custrecord_twc_site_longitude_access, s.custrecord_twc_site_latitude_access';
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

        function renderTroubleTicketsPanel(userInfo, featureId) {
            // @@TODO: featureId will determine some change on fields in the criteria
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
                            <h3 class="twc">Trouble Tickets</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_SITE}
                                </div>
                                <div>
                                    {FILTER_STATUS}
                                    {FILTER_CATEGORY}
                                </div>
                                <div>
                                    {FILTER_ASSIGNED_TO}
                                </div>
                                <div>
                                    {FILTER_PRIORITY}
                                </div>
                                <div>
                                    {FILTER_RAISED_BY}
                                </div>
                                <div>
                                    {FILTER_COUNTIES}
                                </div>
                                <div>
                                    {FILTER_REGION}
                                </div>

                                 <h3 class="twc">Limit by Location</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_LAT} {FILTER_LNG} {FILTER_RADIUS}
                                </div>
                            </div>
                                <h3 class="twc">Site Actions</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {ACTION_CLEAR_FILTERS}
                                    {ACTION_NEW_SITE}
                                </div>
                            </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            html = html.replace('{FILTER_SITE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site', width: '75%', id: 'record_id', noEmpty: true, dataSource: twcUtils.getSiteNames() }));
            html = html.replace('{FILTER_STATUS}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Status', width: 'calc(25% - 2px)', multiSelect: true, id: twcTrblTkts.Fields.STATUS, noEmpty: true, dataSource: twcUtils.getTicketStatus() })); // 
            html = html.replace('{FILTER_CATEGORY}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Category', width: 'calc(25% - 2px)', multiSelect: true, id: twcTrblTkts.Fields.CATEGORY, noEmpty: true, dataSource: twcUtils.getTicketCategory() }));
            html = html.replace('{FILTER_ASSIGNED_TO}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Assigned To', width: '50%', multiSelect: true, id: twcTrblTkts.Fields.ASSIGNED_TO, noEmpty: true, dataSource: twcUtils.getTicketAssignedTo() }));
            html = html.replace('{FILTER_PRIORITY}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Priority', width: '50%', multiSelect: true, id: twcTrblTkts.Fields.PRIORITY, noEmpty: true, dataSource: twcUtils.getTicketPriority() }));
            html = html.replace('{FILTER_RAISED_BY}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Raised By', width: '50%', multiSelect: true, id: twcTrblTkts.Fields.ASSIGNED_TO, noEmpty: true, dataSource: twcUtils.getTicketAssignedTo() })); //@JESNA
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Counties', width: '50%', multiSelect: true, id: twcTrblTkts.Fields.CATEGORY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_REGION}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Region', width: '50%', multiSelect: true, id: twcTrblTkts.Fields.CATEGORY, noEmpty: true, dataSource: twcUtils.getRegions() }));
            html = html.replace('{FILTER_LAT}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Latitude', id: 'twc-coord-latitude', width: '250px' }));
            html = html.replace('{FILTER_LNG}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Longitude', id: 'twc-coord-longitude', width: '250px' }));
            html = html.replace('{FILTER_RADIUS}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Radius (km)s', id: 'twc-coord-radius' }));
            html = html.replace('{ACTION_CLEAR_FILTERS}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Clear Filters', id: 'twc-action-clear-filter' }));
            html = html.replace('{ACTION_NEW_SITE}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'New Site', id: 'twc-action-new-site' }));
            return html;
        }

            function resolveTicket(tkt_id) {
            try {
                if (!tkt_id) { return; }
                log.debug('tkt_id',tkt_id)
                recu.submit(twcTrblTkts.Type, tkt_id, [twcTrblTkts.Fields.STATUS], [twcUtils.tktStatus.Resolved, true]);
              //  tkt.save();
                } catch (error) {
                    throw error;
                }
        }

        
        return {
            getTroubleTickets: getTroubleTickets,
            resolveTicket:resolveTicket,
            getTKTInfoPanels: twcTrblTktsUI.getTKTInfoPanels,
            renderTroubleTicketsPanel: renderTroubleTicketsPanel,
            getTrblTktInfo: (pageData) => {
                var tkt = {};
                if (pageData.recId) {
                    tkt = coreSQL.first(`select * from ${twcTrblTkts.Type} where id = ${pageData.recId}`);
                    tkt.siteId = tkt[twcTrblTkts.Fields.SITE];

                    if (!twcConfig.isUserAllowedCustomers(pageData.userInfo, tkt[twcTrblTkts.Fields.CUSTOMER])) {
                        throw new Error('You do not have access to see this SRF record');
                    }

                } else {
                    // this is a new SRF, if the logged in user is a customer then set the customer field
                    if (pageData.userInfo.isCustomer) { tkt[twcTrblTkts.Fields.CUSTOMER] = pageData.userInfo.id; }
                    tkt[twcTrblTkts.Fields.SITE] = pageData.siteId;
                }
                return tkt;
            },
        }
    });
