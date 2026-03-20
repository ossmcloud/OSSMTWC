/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/record', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_site.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_utils.js', '../../data/oTWC_saf.js', '../../data/oTWC_safUI.js', '../../data/oTWC_safCrew.js', '../../data/oTWC_safAction.js', '../../data/oTWC_safTimeBlock.js', '../../data/oTWC_safLog.js', '../../data/oTWC_file.js', '../../O/oTWC_nsFileUtils.js'],
    (record, core, coreSQL, b64, recu, twcSite, twcConfig, twcIcons, twcUI, twcUtils, twcSaf, twcSafUI, twcSafCrew, twcSafAction, twcSafTimeBlock, twcSafLog, twcFile, nsFileUtils) => {

        function renderSiteAccessPanel(userInfo, featureId) {
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
                            <h3 class="twc">Site Access</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_NAME}
                                </div>
                                <div>
                                    {FILTER_SAF_ID}
                                    {FILTER_STATUS}
                                </div>
                                <div>
                                    {FILTER_ACCESS_TYPE}
                                </div>
                                <div>
                                    {FILTER_CUSTOMER}
                                </div>
                                <div>
                                    {FILTER_CONTRACTOR}
                                </div>
                                <div>
                                    {FILTER_COUNTIES}
                                </div>
                                <div>
                                    {FILTER_REGION}
                                </div>
                                <div>
                                    {FILTER_START_DATE}
                                    {FILTER_END_DATE}
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
            </div>`;

            html = html.replace('{FILTER_NAME}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site', width: '75%', id: 'record_id', noEmpty: true, dataSource: twcUtils.getSiteNames() }));
            html = html.replace('{FILTER_SAF_ID}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'SAF ID', width: 'calc(25% - 2px)', multiSelect: true, id: twcSaf.Fields.SAF_ID, noEmpty: true, dataSource: twcUtils.getSafIds() })); // @@Note Free form field, filter not working
            html = html.replace('{FILTER_STATUS}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Status', width: 'calc(25% - 2px)', multiSelect: true, id: twcSaf.Fields.STATUS, noEmpty: true, dataSource: twcUtils.getSafStatus() }));
            html = html.replace('{FILTER_ACCESS_TYPE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Access Type', width: '50%', multiSelect: true, id: twcSaf.Fields.TYPE, noEmpty: true, dataSource: twcUtils.getSafTypes() }));
            html = html.replace('{FILTER_CUSTOMER}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Customer', width: '50%', multiSelect: true, id: twcSaf.Fields.CUSTOMER, noEmpty: true, dataSource: twcUtils.getCustomers(userInfo), noAutoSelect:true }));
            html = html.replace('{FILTER_CONTRACTOR}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Contractor', width: '50%', multiSelect: true, id: twcSaf.Fields.PRIMARY_CONTRACTOR, noEmpty: true, dataSource: twcUtils.getVendors(userInfo), noAutoSelect: true }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Counties', width: '50%', multiSelect: true, id: twcSaf.Fields.COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_REGION}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Region', width: '50%', multiSelect: true, id: twcSaf.Fields.REGION, noEmpty: true, dataSource: twcUtils.getRegions() }));
            html = html.replace('{FILTER_START_DATE}', twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'Start Date', id: 'twc-saf-start-date', width: '250px' }));
            html = html.replace('{FILTER_END_DATE}', twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'End Date', id: 'twc-saf-end-date', width: '250px' }));
            html = html.replace('{ACTION_CLEAR_FILTERS}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Clear Filters', id: 'twc-action-clear-filter' }));
            html = html.replace('{ACTION_NEW_SITE}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'New Site', id: 'twc-action-new-site' }));
            return html;
        }


        function getAllSafTimeBlocks(options, userInfo) {
            var timeBlocks = {};

            var allowedCustomers = twcConfig.getUserAllowedCustomers(userInfo);

            coreSQL.each(`
                select  b.id, b.custrecord_twc_saf_tm_blk_block as block_id, BUILTIN.DF(b.custrecord_twc_saf_tm_blk_block) as block_name, TO_CHAR(b.custrecord_twc_saf_tm_blk_date, 'yyyy-MM-dd') as block_date,
                        saf.id as saf_id, saf.name as saf_code, saf.custrecord_twc_saf_site as site_id, BUILTIN.DF(saf.custrecord_twc_saf_site) as site_name,
                        saf.custrecord_twc_saf_customer as saf_customer,
                from    customrecord_twc_saf_tm_blk b
                join    customrecord_twc_saf saf on saf.id = b.custrecord_twc_saf_tm_blk_saf
                where   saf.custrecord_twc_saf_site = ${options?.siteId || 0}
                and     (
                        saf.custrecord_twc_saf_status not in (${twcSaf.Status.Cancelled})
                    or  saf.id = ${options.id || 0}
                )
                
                order by b.custrecord_twc_saf_tm_blk_date desc
            `, tb => {
                var safId = tb.saf_id; var safCode = tb.saf_code;
                if (!options.reUse) {
                    if (safId == options.id) {
                        safId = 't';
                        safCode = 'This';
                    }
                }

                if (!timeBlocks[tb.block_date]) { timeBlocks[tb.block_date] = { blocksCount: 0 }; }
                if (!timeBlocks[tb.block_date][safId]) {

                    var safLink = { id: tb.saf_id, code: safCode };
                    if (allowedCustomers != 'all') {
                        if (!allowedCustomers.find(c => { return c.cust == tb.saf_customer })) {
                            safLink = { id: null, code: 'slot used' };
                        }
                    }


                    timeBlocks[tb.block_date][safId] = {
                        site: { id: tb.site_id, name: tb.site_name, },
                        saf: safLink,
                        blocks: []
                    }
                }
                timeBlocks[tb.block_date][safId].blocks.push({
                    id: tb.id,
                    date: tb.block_date,
                    block: { id: tb.block_id, name: tb.block_name },
                })
                timeBlocks[tb.block_date].blocksCount++;
            })
            return timeBlocks;
        }

        function getAccessRequirements(options) {

            var infraInfo = twcUtils.getStructureTypeInfo({ siteId: options.siteId });
            var blocksRequired = coreSQL.first(`select custrecord_twc_saf_type_timeblocks as time_blocks from customrecord_twc_saf_type where id = ${options['saf-type']}`).time_blocks;

            var conditions = [];
            var climberCount = 0; var rescueCount = 0;
            if (options['saf-mast-access'] == 'T') {
                climberCount = 1;
                rescueCount = (infraInfo.height < twcUtils.HEIGH_LIMIT_FOR_1_CLIMBER) ? 2 : 3;
            }
            if (climberCount > 0) { conditions.push({ quantity: climberCount, name: 'Climber', cert: twcUtils.Certs.CLIMBER }) }
            if (rescueCount > 0) { conditions.push({ quantity: rescueCount, name: 'Rescue Climber', cert: twcUtils.Certs.RESCUE }) }
            if (options['saf-rooftop-access'] == 'T') { conditions.push({ quantity: 'all', name: 'Rooftop Certified', cert: twcUtils.Certs.ROOFTOP }) }
            if (options['saf-mast-access'] == 'T' || options['saf-rooftop-access'] == 'T') { conditions.push({ quantity: 'all', name: 'RF Certified', cert: twcUtils.Certs.RF }) }
            if (options['saf-electrical-access'] == 'T') { conditions.push({ quantity: 1, name: 'Electrician', cert: twcUtils.Certs.ELECTRICAL }) }
            if (options.safType == twcUtils.SafType.SURVEY_DRONE) { conditions.push({ quantity: 1, name: 'Drone Certified', cert: twcUtils.Certs.DRONE }) }

            var customer = options['saf-customer'];
            var vendor = options['saf-vendor'];

            // Whether a SAF can be Auto-Approved is dependent on:
            var autoApprove = false;
            if (customer && vendor) {
                autoApprove = true;
                // - the SAF Type allows Auto-Approve (see SAF Visit Types tab)
                if (!recu.lookUp('customrecord_twc_saf_type', options.safType, 'custrecord_twc_saf_type_autoapprove')) { autoApprove = false; }
                // - the Customer (the SAF Auto-Approve field for the Customer is YES)
                if (autoApprove) { if (!recu.lookUp('customrecord_twc_company', customer, 'custrecord_twc_co_saf_auto_approve')) { autoApprove = false; } }
                // - the Primary Contractor (the SAF Auto-Approve field for the Primary Contractor is YES)
                if (autoApprove) { if (!recu.lookUp('customrecord_twc_company', vendor, 'custrecord_twc_co_saf_auto_approve')) { autoApprove = false; } }
                // - the Site (the SAF Auto-Approve for the Site is YES)
                if (autoApprove) { if (!recu.lookUp('customrecord_twc_site', options.siteId, 'custrecord_twc_site_saf_auto_approve')) { autoApprove = false; } }
                // - the Structure, if one is selected  (the SAF Auto-Approve for the Structure is YES)
                if (autoApprove && options['saf-structure']) { if (!recu.lookUp('customrecord_twc_infra', options['saf-structure'], 'custrecord_twc_infra_saf_auto_apprv')) { autoApprove = false; } }
                // - the TL Accommodation, if one is selected  (the SAF Auto-Approve for the Accommodation is YES)
                if (autoApprove && options['saf-accommodation']) { if (!recu.lookUp('customrecord_twc_infra', options['saf-accommodation'], 'custrecord_twc_infra_saf_auto_apprv')) { autoApprove = false; } }
            }

            var requiresSrf = recu.lookUp('customrecord_twc_saf_type', options.safType, 'custrecord_twc_saf_type_require_srf');

            return {
                autoApprove: autoApprove,
                requiresSrf: requiresSrf,
                timeBlocksRequired: blocksRequired,
                conditions: conditions,

            }
        }

        function getSafCrewRecord(options, userInfo) {
            var saf = twcSaf.get(options.saf.id);
            saf.copyFromObject(options.saf);
            var childRecord = twcSafCrew.get(options.crew.id);
            childRecord.copyFromObject(options.crew);
            return twcSafUI.getSafCrewRecord(saf, childRecord, userInfo);
        }

        function getSafActionRecord(options, userInfo) {
            var saf = twcSaf.get(options.saf.id);
            saf.copyFromObject(options.saf);
            saf.siteId = options.saf.siteId;
            var childRecord = twcSafAction.get(options.action.id);
            childRecord.copyFromObject(options.action);
            return twcSafUI.getSafActionRecord(saf, childRecord, userInfo);
        }

        function getVendorDocs(options) {
            var files = twcUtils.getFiles({
                filters: {
                    'custrecord_twc_file_rectype': 'customrecord_twc_company',
                    'custrecord_twc_file_recid': options.vendor,
                }
            });

            var vendorFiles = [];
            core.array.each(files, f => {
                var section = vendorFiles.find(vf => { return vf.title == f.type });
                if (!section) {
                    section = { title: f.type, files: [] };
                    vendorFiles.push(section);
                }
                section.files.push(f);
            })
            return vendorFiles;
        }

        function saveNewSaf(options, userInfo) {

            var payload = options.saf;

            var earliestDate = '2099-31-12'; var latestDate = '1900-01-01'; var blockCount = 0;
            for (var d in options.accessRequirements.timeBlocks) {
                for (var saf in options.accessRequirements.timeBlocks[d]) {
                    if (saf != 't') { continue; }
                    blockCount += options.accessRequirements.timeBlocks[d]['t'].blocks.length;
                    if (d < earliestDate) { earliestDate = d; }
                    if (d > latestDate) { latestDate = d; }
                }
            }

            var validationErrors = [];
            if (earliestDate == '2099-31-12') { validationErrors.push('Specify at least one time block'); }
            if (blockCount > options.accessRequirements.timeBlocksRequired) { validationErrors.push(`Too many time-blocks allocated (${blockCount}), max allowed: ${options.accessRequirements.timeBlocksRequired}`); }
            if (!payload['saf-customer']) { validationErrors.push(`Specify a customer`); }
            if (!payload['saf-vendor']) { validationErrors.push(`Specify a primary contractor`); }
            if (!payload['saf-work-summary']) { validationErrors.push(`Specify a summary of work comment`); }
            if (!payload['saf-picw-staff']) { validationErrors.push(`Specify a PICW`); }
            if (payload['saf-mast-access'] == 'T' && !payload['saf-structure']) { validationErrors.push(`Specify a structure`); }
            if (payload['saf-building-access'] == 'T' && !payload['saf-accommodation']) { validationErrors.push(`Specify an accommodation`); }

            var crewIds = [];
            core.array.each(payload.crews, c => { crewIds.push(c['saf-crew-member']); })
            var crew = twcUtils.getProfiles({ id: crewIds });
            // throw new Error(JSON.stringify(crew))

            core.array.each(options.accessRequirements.conditions, cond => {
                var condQuantity = cond.quantity == 'all' ? payload.crews.length : cond.quantity;
                var certCount = crew.filter(c => { return c.attendAs.find(cc => { return cc.value == cond.cert?.attendAs }); }).length || 0;
                if (certCount < condQuantity) {
                    if (certCount == 0) {
                        validationErrors.push(`${cond.quantity} ${cond.name} are required, there are none in the crew`);
                    } else {
                        validationErrors.push(`${cond.quantity} ${cond.name} are required, there ${certCount == 1 ? 'is' : 'are'} only ${certCount} in the crew`);
                    }

                }
            })

            var requiresSrf = recu.lookUp('customrecord_twc_saf_type', payload['saf-type'], 'custrecord_twc_saf_type_require_srf');
            if (requiresSrf) {
                if (!payload.actions || payload.actions.length == 0) { validationErrors.push(`Specify at least one action`); }
            }


            if (validationErrors.length > 0) {
                var errorHtml = 'The SAF cannot be saved, please:<ul class="twc">';
                core.array.each(validationErrors, e => {
                    errorHtml += `<li>${e}</li>`;
                })
                errorHtml += '</ul>';
                throw new Error(errorHtml);
            }


            var earliestBlock = 99;
            core.array.each(options.accessRequirements.timeBlocks[earliestDate]['t'].blocks, b => {
                if (b.block.id < earliestBlock) { earliestBlock = b.block.id; }
            })

            var latestBlock = 0;
            core.array.each(options.accessRequirements.timeBlocks[latestDate]['t'].blocks, b => {
                if (b.block.id > latestBlock) { latestBlock = b.block.id; }
            })

            // main SAF record
            var saf = twcSaf.get(payload.reUse ? null : payload.id);
            saf.site = payload.siteId;
            saf.r_type = payload['saf-type'];
            saf.status = options.accessRequirements.autoApprove ? twcSaf.Status.Approved : twcSaf.Status.Pending;
            saf.mastAccess = payload['saf-mast-access'] == 'T';
            saf.tLBuildingAccess = payload['saf-building-access'] == 'T';
            saf.craneCherrypicker = payload['saf-crane-access'] == 'T';
            saf.rooftopAccess = payload['saf-rooftop-access'] == 'T';
            saf.electricalWorks = payload['saf-electrical-access'] == 'T';
            saf.customer = payload['saf-customer'];
            saf.primaryContractor = payload['saf-vendor'];
            saf.summaryofWorks = payload['saf-work-summary'];
            saf.pICW = payload['saf-picw-staff'];
            saf.sAFAuthor = userInfo.profile;
            saf.accommodation = payload['saf-accommodation'];
            saf.structure = payload['saf-structure'];
            saf.startTimeBlock = new Date(`${earliestDate} ${twcUtils.getTimeBlockTimeRange(earliestBlock).start}`);
            saf.endTimeBlock = new Date(`${latestDate} ${twcUtils.getTimeBlockTimeRange(latestBlock).end}`);
            saf.conditionsofAccess = b64.decode(options.conditionsOfAccessHtml);
            saf.worksPhotosReqDelay = payload['saf-photo-delay'] || null;

            // attachments
            if (payload.documents) {
                var docIds = [];
                for (var d in payload.documents) { if (payload.documents[d]) { docIds.push(d.replace('file_toggle_', '')); } }

                try {
                    var sql = `
                        select  f.id, ft.custrecord_twc_file_type_hs as health_safety, ft.custrecord_twc_file_type_method as method_stat
                        from    customrecord_twc_file f
                        join    customrecord_twc_file_type ft on ft.id = f.custrecord_twc_file_type
                        where   f.id in (${docIds.join(',')})
                    `;

                    var health_and_Safety = [];
                    var methodStatement = [];
                    coreSQL.each(sql, f => {
                        if (f.health_safety == 'T') { health_and_Safety.push(f.id); }
                        if (f.method_stat == 'T') { methodStatement.push(f.id); }
                    });
                    saf.health_and_Safety = health_and_Safety;
                    saf.methodStatement = methodStatement;

                } catch (error) {
                    saf.logEx('Error while attaching files', error);
                }
            }

            var safId = saf.save();
            if (payload.id) {
                if (payload.reUse) {
                    saf.logInfo('SAF Reused from: ' + recu.lookUp(twcSaf.Type, payload.id, 'name'));
                } else {
                    saf.logInfo('SAF Edited');
                }
            } else {
                saf.logInfo('SAF Created');
            }

            var errors = false;

            // time blocks
            for (var d in options.accessRequirements.timeBlocks) {
                if (!options.accessRequirements.timeBlocks[d]['t']) { continue; }
                core.array.each(options.accessRequirements.timeBlocks[d]['t'].blocks, b => {
                    try {
                        var tb = twcSafTimeBlock.get(b.id == 'new' ? null : b.id);
                        tb.sAF = safId;
                        tb.blockDate = (new Date(d)).addHours(12);
                        tb.block = b.block.id;
                        tb.save();
                    } catch (error) {
                        saf.logEx('Error while saving time block', error);
                        errors = true;
                    }
                });
            }


            // crews
            if (payload.crews) {
                core.array.each(payload.crews, c => {
                    try {

                        var crew = twcSafCrew.get(payload.reUse ? null : c.id);
                        crew.sAF = safId;
                        crew.member = c['saf-crew-member'];
                        crew.attendAs = c['saf-crew-attend-as'];
                        crew.save();
                    } catch (error) {
                        saf.logEx('Error while saving crew record', error);
                        errors = true;
                    }
                })
            }

            if (payload.crews_deleted) {
                core.array.each(payload.crews_deleted, c => {
                    try {
                        if (!c.id) { return; }
                        recu.del(twcSafCrew.Type, c.id);

                    } catch (error) {
                        saf.logEx('Error while deleting crew record', error);
                        errors = true;
                    }
                })
            }

            if (payload.actions) {
                core.array.each(payload.actions, a => {
                    try {
                        var action = twcSafAction.get(payload.reUse ? null : a.id);
                        action.sAF = safId;
                        action.sAF_ACTIONEA = a['saf-eq-action'];
                        action.sAF_ACTIONStatus = a['saf-eq-action-status'];
                        action.save();

                        if (a['saf-eq-action-status'] == twcUtils.SafActionStatus.Detached) {
                            if (recu.lookUp('customrecord_twc_eq_action', a['saf-eq-action'], 'custrecord_twc_eq_action_saf')?.value == safId) {
                                recu.submit('customrecord_twc_eq_action', a['saf-eq-action'], 'custrecord_twc_eq_action_saf', null);
                            }
                            //
                        } else {
                            recu.submit('customrecord_twc_eq_action', a['saf-eq-action'], 'custrecord_twc_eq_action_saf', safId);
                        }
                    } catch (error) {
                        saf.logEx('Error while saving action record', error);
                        errors = true;
                    }
                })
            }

            return { id: safId, errors: errors }

        }

        function editSafStatus(options) {
            var saf = twcSaf.get(options.saf);
            try {
                var statusChanged = options.status ? saf.status != options.status : false;
                var commentCHanged = options.comment ? saf.statusComments != options.comment : false;
                if (!statusChanged && !commentCHanged) { return; }

                var safRequiresSrf = twcUtils.getSafType(saf.r_type)?.requires_srf == 'T';
                if (statusChanged && (options.status == twcSaf.Status.Cancelled || options.status == twcSaf.Status.Rejected)) {
                    if (safRequiresSrf) { validateAndDetachActions(options.saf); }
                }

                var logMsg = ''; var info = '';
                if (statusChanged) {
                    logMsg = 'status changed to: ' + twcSaf.getSafStatusName(options.status);
                    info = 'old status: ' + saf.statusName;
                }
                if (commentCHanged) {
                    if (logMsg) { logMsg += ', ' }
                    if (info) { info += ', ' }
                    logMsg += 'comment changed';
                    info += 'old comment: ' + saf.statusComments
                }

                if (options.status) {
                    saf.status = options.status;
                    if (options.status == twcSaf.Status.Approved) {
                        saf.worksEndDate = (new Date()).addHours(12);
                        saf.completionPhotosRequested = saf.worksEndDate.addDays(saf.worksPhotosReqDelay || 0);
                    }
                }
                if (options.comment) { saf.statusComments = options.comment; }

                if (statusChanged && options.status == twcSaf.Status.PhotosReceived) {
                    saf.completionPhotosReceived = (new Date()).addHours(12);
                }

                if (statusChanged && options.status == twcSaf.Status.Complete) {
                    validateAndCompleteActions(options.saf);
                }

                saf.save();

                if (statusChanged && options.status == twcSaf.Status.Rejected) {
                    saf.logWarn(logMsg, info);
                } else {
                    saf.logInfo(logMsg, info);
                }
            } catch (error) {
                saf.logEx('Error while changing status/comments', error);
                throw error;
            }
        }

        function validateAndDetachActions(saf) {
            var safActions = coreSQL.run(`
                select  sa.id saf_action_id, ea.id as ea_action_id, ea.name as eq_action, 
                        sa.custrecord_twc_saf_a_status as saf_status, BUILTIN.DF(sa.custrecord_twc_saf_a_status) as saf_status_name,
                        ea.custrecord_twc_eq_action_sts as ea_status, BUILTIN.DF(ea.custrecord_twc_eq_action_sts) as ea_status_name
                from    customrecord_twc_saf_action sa
                join    customrecord_twc_eq_action ea on ea.id = sa.custrecord_twc_saf_a_ea and ea.custrecord_twc_eq_action_saf = sa.custrecord_twc_saf_a_saf
                where   sa.custrecord_twc_saf_a_saf = ${saf}
            `);

            var anyNotPendingOrDetached = false;
            core.array.each(safActions, sa => {
                if (sa.saf_status != twcUtils.SafActionStatus.Pending && sa.saf_status != twcUtils.SafActionStatus.Detached) {
                    anyNotPendingOrDetached = true;
                    return false;
                }
            })

            if (anyNotPendingOrDetached) {
                throw new Error('In order to cancel or reject the SAF all actions must either be pending or detached');
            }

            core.array.each(safActions, sa => {
                recu.submit(twcSafAction.Type, sa.saf_action_id, twcSafAction.Fields.SAF_ACTION_STATUS, twcUtils.SafActionStatus.Detached);
                // @@TODO: build twcEaAction object and use constants here
                recu.submit('customrecord_twc_eq_action', sa.ea_action_id, 'custrecord_twc_eq_action_saf', null);
            })
        }

        function validateAndCompleteActions(saf) {
            var safActions = coreSQL.run(`
                select  sa.id saf_action_id, ea.id as ea_action_id, ea.name as eq_action, 
                        sa.custrecord_twc_saf_a_status as saf_status, BUILTIN.DF(sa.custrecord_twc_saf_a_status) as saf_status_name,
                        ea.custrecord_twc_eq_action_sts as ea_status, BUILTIN.DF(ea.custrecord_twc_eq_action_sts) as ea_status_name
                from    customrecord_twc_saf_action sa
                join    customrecord_twc_eq_action ea on ea.id = sa.custrecord_twc_saf_a_ea and ea.custrecord_twc_eq_action_saf = sa.custrecord_twc_saf_a_saf
                where   sa.custrecord_twc_saf_a_saf = ${saf}
            `);

            core.array.each(safActions, sa => {
                if (sa.saf_status != twcUtils.SafActionStatus.Detached) {
                    recu.submit(twcSafAction.Type, sa.saf_action_id, [twcSafAction.Fields.SAF_ACTION_STATUS, twcSafAction.Fields.SAF_ACTION_COMPLETE], [twcUtils.SafActionStatus.Complete, true]);
                    // @@TODO: build twcEaAction object and use constants here
                    recu.submit('customrecord_twc_eq_action', sa.ea_action_id, 'custrecord_twc_eq_action_sts', twcUtils.EaActionStatus.Complete);
                }
            })
        }

        function saveSafImage(options) {

            var fileType = coreSQL.first(`select id from customrecord_twc_file_type where custrecord_twc_file_type_image = 'T' order by created`)?.id;

            var safInfo = coreSQL.first(`
                select  saf.name, site.${twcSite.Fields.SITE_ID} as site_id
                from    ${twcSaf.Type} saf
                join    ${twcSite.Type} site on site.id = ${twcSaf.Fields.SITE}
                where   saf.id = ${options.saf}
            `)
            var safFolder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/${safInfo.site_id}/${safInfo.name}`);

            var nsFile = nsFileUtils.writeFile({
                name: `${options.saf}_${options.photo.name}`,
                fileType: nsFileUtils.getFileType(options.photo.type),
                content: options.photo.content,
                folder: safFolder,
            });

            var safImage = twcFile.get();
            safImage.name = options.photo.name;
            safImage.recordType = twcSaf.Type;
            safImage.recordID = options.saf;
            safImage.description = options.photo.notes || '';
            safImage.file = nsFile.fileId;
            safImage.r_type = fileType;
            safImage.save();

            //recu.submit(twcSaf.Type, options.saf, [twcSaf.Fields.STATUS, twcSaf.Fields.COMPLETION_PHOTOS_RECEIVED], [twcSaf.Status.PhotosReceived, new Date()])

        }

        function setSafReviewer(options) {
            recu.submit(twcSaf.Type, options.saf, twcSaf.Fields.COMPLETION_REVIEWER, options.reviewer.value);
            twcSafLog.logInfo(options.saf, `Reviewer [${options.reviewer.text}] assigned`);
        }

        function setSafReviewed(options) {
            recu.submit(twcSaf.Type, options.saf, [twcSaf.Fields.STATUS, twcSaf.Fields.REVIEW_COMMENT], [twcSaf.Status.Complete, options.comment]);
            twcSafLog.logInfo(options.saf, `Completion photos reviewed`, `Comment: ${options.comment}`);
            validateAndCompleteActions(options.saf);
        }

        function getSafTimeBlocks(id) {
            return coreSQL.run(`
                select  TO_CHAR(custrecord_twc_saf_tm_blk_date, 'dd/MM/yyyy') as date, BUILTIN.DF(custrecord_twc_saf_tm_blk_block) as block
                from   	customrecord_twc_saf_tm_blk
                where   custrecord_twc_saf_tm_blk_saf = ${id}
                order by custrecord_twc_saf_tm_blk_date, custrecord_twc_saf_tm_blk_block
            `)
        }

        return {
            getSAFInfoPanels: twcSafUI.getSAFInfoPanels,

            getSiteAccessInfo: (pageData, reUse) => {
                var saf = {};
                if (pageData.recId) {
                    // @@NOTE: this is an existing record we need to make sure we can see it
                    saf = twcSaf.select({ noAlias: true, returnFirst: true, where: { id: pageData.recId } })
                    saf.siteId = saf[twcSaf.Fields.SITE];

                    if (!twcConfig.isUserAllowedCustomers(pageData.userInfo, saf[twcSaf.Fields.CUSTOMER])) {
                        throw new Error('You do not have access to see this SAF record');
                    }

                    if (reUse) {
                        saf.reUse = reUse;
                        saf[twcSaf.Fields.STATUS] = twcSaf.Status.Pending;
                    }

                } else {
                    // @@NOTE: this is a new record for the given site id
                    if (pageData.userInfo.isCustomer) { saf[twcSaf.Fields.CUSTOMER] = pageData.userInfo.companyProfile?.id; }
                    saf[twcSaf.Fields.SITE] = pageData.siteId;
                    saf.siteId = pageData.siteId;

                }
                return saf;
            },
            getAllSafTimeBlocks: getAllSafTimeBlocks,
            getAccessRequirements: getAccessRequirements,
            renderSiteAccessPanel: renderSiteAccessPanel,
            getSafCrewRecord: getSafCrewRecord,
            getSafActionRecord: getSafActionRecord,
            getVendorDocs: getVendorDocs,

            saveNewSaf: saveNewSaf,
            editSafStatus: editSafStatus,
            saveSafImage: saveSafImage,
            setSafReviewer: setSafReviewer,
            setSafReviewed: setSafReviewed,
            getSafTimeBlocks: getSafTimeBlocks


        }

    });