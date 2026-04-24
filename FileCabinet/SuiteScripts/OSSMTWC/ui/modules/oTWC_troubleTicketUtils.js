/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_utils.js', '../../data/oTWC_troubleTickets.js', '../../data/oTWC_troubleTicketsUI.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_config.js', '../../data/oTWC_site.js', '../../data/oTWC_siteUI.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/oTWC_nsFileUtils.js', '../../data/oTWC_file.js'],
    (core, coreSQL, twcUtils, twcTrblTkts, twcTrblTktsUI, twcUI, twcConfig, twcSite, twcSiteUI, recu, nsFileUtils, twcFile) => {

        function getTroubleTickets(options, userInfo) {
            var ticketFields = twcUtils.getFields(twcTrblTkts.Type);
            var userFields = twcTrblTktsUI.getTicketsTableFields();

            var sqlFields = 's.id, s.id as record_id, s.name, s.custrecord_twc_trbl_tkt_site as site_id, BUILTIN.DF(s.custrecord_twc_trbl_tkt_site) as site_id_text';
            sqlFields += formatUserFields(ticketFields, userFields);

            // @@TODO: if we decide to have filters / sort  columns on the 'options' parameter we'll built it here
            var whereClause = 'where 1 = 1 ';
            var orderBy = `order by s.created desc`;
            var tickets = coreSQL.run(`
                select  ${sqlFields}
                from    ${twcTrblTkts.Type} s
                ${whereClause} 
                ${orderBy}
            `)

            return {
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
         function fromJsToNs(nsDate) {
            if (!nsDate) { return nsDate; }
            var dateParts = nsDate.split('-');
            if (dateParts.length != 3) { return 'Invalid Date'; }
            var d = parseInt(dateParts[2], 10);
            var m = parseInt(dateParts[1], 10);
            return `${d}/${m}/${dateParts[0]}`;
        }
        function resolveTicket(tktInfo) {
            try {
                if (!tktInfo) { return; }
                log.debug('tktInfo', tktInfo)
                 log.debug('twcTrblTkts', twcTrblTkts)
                var submitInfo ={}
                submitInfo[twcTrblTkts.Type] = { id: tktInfo.tkt, fields: [], values: [] };
                for (let k in tktInfo) {
                    if (k === 'tkt') continue;
                    if (k == twcTrblTkts.Fields.SCHEDULED_COMPLETION_DATE || k == twcTrblTkts.Fields.CORRECTIVE_ACTION) {
                        submitInfo[twcTrblTkts.Type].fields.push(k);
                        submitInfo[twcTrblTkts.Type].values.push(fromJsToNs(tktInfo[k]));
                    }else{
                        submitInfo[twcTrblTkts.Type].fields.push(k);
                        submitInfo[twcTrblTkts.Type].values.push(tktInfo[k]);
                    }
                        
                }
                submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.STATUS);
                submitInfo[twcTrblTkts.Type].values.push(twcUtils.tktStatus.Resolved);
                                 log.debug('submitInfo', submitInfo)

                recu.submit(twcTrblTkts.Type, tktInfo.tkt, submitInfo[twcTrblTkts.Type].fields, submitInfo[twcTrblTkts.Type].values);

            } catch (error) {
                throw error;
            }
        }
        function cancelTicket(tktInfo) {
            try {
                if (!tktInfo) { return; }
                log.debug('tktInfo', tktInfo)
                 var submitInfo ={}
                submitInfo[twcTrblTkts.Type] = { id: tktInfo.tkt, fields: [], values: [] };
                 for (let k in tktInfo) {
                    if (k === 'tkt') continue;
                        submitInfo[twcTrblTkts.Type].fields.push(k);
                        submitInfo[twcTrblTkts.Type].values.push(tktInfo[k]);   
                }
                submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.STATUS);
                submitInfo[twcTrblTkts.Type].values.push(twcUtils.tktStatus.Cancelled);
                recu.submit(twcTrblTkts.Type, tktInfo.tkt, submitInfo[twcTrblTkts.Type].fields, submitInfo[twcTrblTkts.Type].values);

                //recu.submit(twcTrblTkts.Type, tkt_id, [twcTrblTkts.Fields.STATUS], [twcUtils.tktStatus.Cancelled, true]);
                //  tkt.save();
            } catch (error) {
                throw error;
            }
        }

        function saveTktInfo(payload, userInfo) {
            // @@NOTE: @@REVIEW: this routine could be generalised to be used with different record types, not only twcSite

            log.debug("payload >>>",payload)
            var submitInfo = {};
            submitInfo[twcTrblTkts.Type] = { id: payload.id, fields: [], values: [] };

            for (var k in payload) {
                if (k == 'id') { continue; }
                if (k == 'siteId') { continue; }
                // @@NOTE: fields with '___' means they are linked record fields, we first update the site info, then the linked records
                var fieldPath = k.split('___');
                if (fieldPath.length == 1) {

                    var value = payload[k];


                    var fieldInfo = null;
                    for (var f in twcTrblTkts.FieldsInfo) {
                        if (twcTrblTkts.FieldsInfo[f].name == k) {
                            fieldInfo = twcTrblTkts.FieldsInfo[f];
                            break;
                        }
                    }
                    if (fieldInfo?.type == 'date') {
                        value = new Date(value);
                    }

                    submitInfo[twcTrblTkts.Type].fields.push(k);
                    submitInfo[twcTrblTkts.Type].values.push(value)
                }
            }

            var errors = [];

            if (payload.id) {

                let rec = twcTrblTkts.get(payload.id); 
                let tktStatus = rec.status;
    
                //@@NOTE Checks if Status in page is changed and value is NEW, If status field not changed, check for value from Trbl Tkt Record is New or Not.
                let assignedToIndex = submitInfo[twcTrblTkts.Type].fields.indexOf(twcTrblTkts.Fields.ASSIGNED_TO);
                let statusIndex = submitInfo[twcTrblTkts.Type].fields.indexOf(twcTrblTkts.Fields.STATUS);

                if (assignedToIndex !== -1 && ((statusIndex !== -1 && submitInfo[twcTrblTkts.Type].values[statusIndex] == twcTrblTkts.Status.New) || tktStatus == 1)) {
                    statusIndex !== -1
                        ? submitInfo[twcTrblTkts.Type].values[statusIndex] = twcTrblTkts.Status.Assessed
                        : (submitInfo[twcTrblTkts.Type].fields.push('custrecord_twc_trbl_tkt_status'),
                            submitInfo[twcTrblTkts.Type].values.push(twcTrblTkts.Status.Assessed));
                }
                recu.submit(twcTrblTkts.Type, payload.id, submitInfo[twcTrblTkts.Type].fields, submitInfo[twcTrblTkts.Type].values);

                /*
                // @@NOTE: now we load the linked record fields changes into submitInfo object as we could have more than one
                var tktFields = twcTrblTkts.getFields();
                var tkt = twcTrblTkts.get(payload.id);
                for (var k in payload) {
                    if (k == 'id') { continue; }
                    if (k == 'siteId') { continue; }
                    var fieldPath = k.split('___');
                    if (fieldPath.length > 1) {
                        var tktField = tktFields.find(tk => { return tk.field_id == fieldPath[0]; })
                        if (!tktField || !tktField.field_foreign_table) {
                            // @@TODO: this should not happen really ???
                        } else {
                            // @@NOTE: @@IMPORTANT: we use fieldPath[0] as object property and NOT siteField.field_foreign_table because we could have more than one field linking to the same record type
                            if (!submitInfo[fieldPath[0]]) {
                                submitInfo[fieldPath[0]] = { id: tkt.get(fieldPath[0]), type: tktField.field_foreign_table, fields: [], values: [] };
                            }
                            submitInfo[fieldPath[0]].fields.push(fieldPath[1]);
                            submitInfo[fieldPath[0]].values.push(payload[k])
                        }
                    }
                }


                // var errors = [];
                for (var recType in submitInfo) {
                    if (recType == twcTrblTkts.Type) { continue; }
                    try {
                        recu.submit(submitInfo[recType].type, submitInfo[recType].id, submitInfo[recType].fields, submitInfo[recType].values);
                    } catch (error) {
                        core.logError('SAVE-TROURBLE TICKET-INFO', `${JSON.stringify(submitInfo[recType])}: ${error.message}`);
                        submitInfo[recType].error = error.message;
                        errors.push(submitInfo[recType])
                    }

                }
                */
            }
            else {
                if (!payload.siteId) { throw new Error('Site ID cannot be empty'); }

                var newTkt = twcTrblTkts.get();
                newTkt.tktStatus = twcTrblTkts.Status.New;
                newTkt.r.set('name', 'XYZ');


                let assignedToIndex = submitInfo[twcTrblTkts.Type].fields.indexOf(twcTrblTkts.Fields.ASSIGNED_TO);
                if (assignedToIndex !== -1) {
                    submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.STATUS)
                    submitInfo[twcTrblTkts.Type].values.push(twcTrblTkts.Status.Assessed)
                } else {
                    submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.STATUS)
                    submitInfo[twcTrblTkts.Type].values.push(twcTrblTkts.Status.New)

                }

                submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.SITE)
                submitInfo[twcTrblTkts.Type].values.push(payload.siteId)

                submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.SUBMITTED)
                submitInfo[twcTrblTkts.Type].values.push(new Date())


                submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.AUTHOR)
                submitInfo[twcTrblTkts.Type].values.push(userInfo.profile)

                if (!payload[twcTrblTkts.Fields.AUTHOR_PHONE_NUMBER]) {
                    submitInfo[twcTrblTkts.Type].fields.push(twcTrblTkts.Fields.AUTHOR_PHONE_NUMBER)
                    submitInfo[twcTrblTkts.Type].values.push(userInfo.profileInfo.phone)
                }


                core.array.each(submitInfo[twcTrblTkts.Type].fields, (field, idx) => {
                    if (!newTkt.hasField(field)) { return; }
                    newTkt.set(field, submitInfo[twcTrblTkts.Type].values[idx]);
                })

                //throw new Error(newTkt.r.r.getValue('name'))

                payload.id = newTkt.save();
            }

            // @@TODO: better error message
            if (errors.length > 0) { throw new Error(JSON.stringify(errors)); }

            deleteTrblTktsFile(payload);

            return payload.id;
        }


         function deleteTrblTktsFile(payload) {
            log.debug('payload...',payload)
            if (!payload.files_deleted) { return; }
            core.array.each(payload.files_deleted, file => {
                // @@TODO: delete actual file
                recu.submit(twcFile.Type, file.id, 'isinactive', true);
            })
        }

        function saveTktImage(options) {

            var fileType = coreSQL.first(`select id from customrecord_twc_file_type where custrecord_twc_file_type_image = 'T' order by created`)?.id;

            var tktInfo = coreSQL.first(`
                select  tk.id, site.${twcSite.Fields.SITE_ID} as site_id
                from    ${twcTrblTkts.Type} tk
                join    ${twcSite.Type} site on site.id = tk.${twcTrblTkts.Fields.SITE}
                where   tk.id = ${options.tkt}
            `)
            log.debug('tktInfo', tktInfo)
            var tktFolder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/${tktInfo.site_id}/${tktInfo.id}`);
            log.debug('tktFolder', tktFolder)

            var nsFile = nsFileUtils.writeFile({
                name: `${options.tkt}_${options.photo.name}`,
                fileType: nsFileUtils.getFileType(options.photo.type),
                content: options.photo.content,
                folder: tktFolder,
            });
            log.debug('nsFile', nsFile)

            var tktImage = twcFile.get();
            tktImage.name = options.photo.name;
            tktImage.recordType = twcTrblTkts.Type;
            tktImage.recordID = options.tkt;
            tktImage.description = options.photo.notes || '';
            tktImage.file = nsFile.fileId;
            tktImage.r_type = fileType;
            tktImage.save();
            log.debug('tktImage', tktImage)
            //recu.submit(twcSaf.Type, options.saf, [twcSaf.Fields.STATUS, twcSaf.Fields.COMPLETION_PHOTOS_RECEIVED], [twcSaf.Status.PhotosReceived, new Date()])

        }


        return {
            getTroubleTickets: getTroubleTickets,
            resolveTicket: resolveTicket,
            cancelTicket: cancelTicket,
            saveTktInfo: saveTktInfo,
            saveTktImage: saveTktImage,
            getTKTInfoPanels: twcTrblTktsUI.getTKTInfoPanels,
            renderTroubleTicketsPanel: renderTroubleTicketsPanel,
            getTrblTktInfo: (pageData) => {
                var tkt = {};
                if (pageData.recId) {
                    //tkt = coreSQL.first(`select * from ${twcTrblTkts.Type} where id = ${pageData.recId}`);
                    tkt = twcTrblTkts.select({ useNames: true, returnFirst: true, where: `and id = ${pageData.recId}` });
                    // @@NOTE: we need field siteId to be populated for the UI to work
                    tkt.siteId = tkt[twcTrblTkts.Fields.SITE];

                    if (!twcConfig.isUserAllowedCustomers(pageData.userInfo, tkt[twcTrblTkts.Fields.CUSTOMER])) {
                        throw new Error('You do not have access to see this Trouble Ticket record');
                    }

                } else {
                    // this is a new SRF, if the logged in user is a customer then set the customer field
                    if (pageData.userInfo.isCustomer) { tkt[twcTrblTkts.Fields.CUSTOMER] = pageData.userInfo.id; }
                    tkt[twcTrblTkts.Fields.SITE] = pageData.siteId;
                    // @@NOTE: we need field siteId to be populated for the UI to work
                    tkt.siteId = pageData.siteId;
                }



                return tkt;
            },
            getEditFileRecord: (options, userInfo) => {
                log.debug("TKt", options)
               // var tkt = twcTrblTkts.get(options.tkt.id); //@@NOTE this is not working
                var tkt =core.utils.classToObject(twcTrblTkts.get(options.tkt.id))
                log.debug("test core",tkt)

                //tkt.copyFromObject(options.tkt);
                var fileRec = null;
                if (options.file) {
                    fileRec = core.utils.classToObject(twcFile.get(options.file.id))  //@@NOTE this code not working, tried to load the record using belwo line of code, Not working
                    log.debug("fileRec", fileRec)
                    //fileRec.copyFromObject(options.file);
                } else {
                    throw new Error(`No Child Record Found in payload`)
                }

              //  throw new Error(JSON.stringify(fileRec))
                return twcTrblTktsUI.getTktChildRecord(tkt, fileRec, userInfo);
            },
        }
    });
