/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// define([], () => {
define(['N/record', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_site.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_utils.js', '../../data/oTWC_saf.js', '../../data/oTWC_safUI.js', '../../data/oTWC_safCrew.js', '../../data/oTWC_safAction.js', '../../data/oTWC_equipAction.js', '../../data/oTWC_equipment.js', '../../data/oTWC_safTimeBlock.js', '../../data/oTWC_safLog.js', '../../data/oTWC_file.js', '../../data/oTWC_fileType.js', '../../O/oTWC_nsFileUtils.js'],
    (record, core, coreSQL, b64, recu, twcSite, twcConfig, twcIcons, twcUI, twcUtils, twcSaf, twcSafUI, twcSafCrew, twcSafAction, twcEqAct, twcEquipment, twcSafTimeBlock, twcSafLog, twcFile, twcFileType, nsFileUtils) => {

        function renderSiteAccessPanel(userInfo, featureId) {
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
                                    {FILTER_START_DATE}
                                    {FILTER_END_DATE}
                                </div>
                                
                            </div>

                            <h3 class="twc">Site Actions</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {ACTION_CLEAR_FILTERS}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            html = html.replace('{FILTER_NAME}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site', width: '50%', id: 'site_id', noEmpty: true, dataSource: twcUtils.getSiteNames(userInfo) }));
            html = html.replace('{FILTER_SAF_ID}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'SAF ID', width: 'calc(25% - 2px)', multiSelect: true, id: 'record_id', noEmpty: true, dataSource: twcUtils.getSafIds() })); // @@Note Free form field, filter not working
            html = html.replace('{FILTER_STATUS}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Status', width: 'calc(25% - 2px)', multiSelect: true, id: twcSaf.Fields.STATUS, noEmpty: true, dataSource: twcUtils.getSafStatus() }));
            html = html.replace('{FILTER_ACCESS_TYPE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Access Type', width: '50%', multiSelect: true, id: twcSaf.Fields.R_TYPE, noEmpty: true, dataSource: twcUtils.getSafTypes() }));
            html = html.replace('{FILTER_CUSTOMER}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Customer', width: '50%', multiSelect: true, id: twcSaf.Fields.CUSTOMER, noEmpty: true, dataSource: twcUtils.getCustomers(userInfo), noAutoSelect: true }));
            html = html.replace('{FILTER_CONTRACTOR}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Contractor', width: '50%', multiSelect: true, id: twcSaf.Fields.PRIMARY_CONTRACTOR, noEmpty: true, dataSource: twcUtils.getVendors(userInfo), noAutoSelect: true }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Counties', width: '50%', multiSelect: true, id: twcSite.Fields.ADDRESS_COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_START_DATE}', twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'Start Date', id: twcSaf.Fields.START_TIME_BLOCK, width: '250px' }));
            html = html.replace('{FILTER_END_DATE}', twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'End Date', id: twcSaf.Fields.END_TIME_BLOCK, width: '250px' }));
            html = html.replace('{ACTION_CLEAR_FILTERS}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Clear Filters', id: 'twc-action-clear-filter' }));
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
                        safCode = 'SAF';
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

            var siteTypeInfo = twcUtils.getSiteTypeInfo({ siteId: options.siteId });
            var infraInfo = twcUtils.getStructureTypeInfo({ siteId: options.siteId, id: options['saf-structure'] });
            var blocksRequired = coreSQL.first(`select custrecord_twc_saf_type_timeblocks as time_blocks from customrecord_twc_saf_type where id = ${options['saf-type']}`).time_blocks;

            var conditions = [];
            var climberCount = 0; var rescueCount = 0; var allRfCertified = false;
            if (options['saf-mast-access'] == 'T') {
                climberCount = options['saf-mast-access-height'] == 'T' ? 3 : 2;
                rescueCount = options['saf-mast-access-height'] == 'T' ? 2 : 1;
            }
            if (climberCount > 0) { conditions.push({ quantity: climberCount, name: 'Climber', cert: twcUtils.Certs.CLIMBER }) }
            if (rescueCount > 0) { conditions.push({ quantity: rescueCount, name: 'Rescue Climber', prefix: 'Of Which ', cert: twcUtils.Certs.RESCUE }) }
            if (options['saf-rooftop-access'] == 'T') {
                conditions.push({ quantity: 'all', name: 'Rooftop Certified', cert: twcUtils.Certs.ROOFTOP })
            } else {
                if (options['saf-crane-access'] == 'T') {
                    if (!siteTypeInfo.noStructure) {
                        allRfCertified = true;
                        conditions.push({ quantity: 'all', name: 'RF Certified', cert: twcUtils.Certs.RF })
                    }
                }
            }
            if (!allRfCertified) {
                if (options['saf-mast-access'] == 'T' || options['saf-rooftop-access'] == 'T') {
                    // @@NOTE: if we have a rooftop access then ALL must be RF certified, otherwise only the climbers
                    if (options['saf-rooftop-access'] == 'T') {
                        conditions.push({ quantity: 'all', name: 'RF Certified', cert: twcUtils.Certs.RF })
                    } else {
                        conditions.push({ quantity: 'all-climber', name: 'RF Certified', cert: twcUtils.Certs.RF })
                    }
                }
            }
            if (options['saf-electrical-access'] == 'T') { conditions.push({ quantity: 1, name: 'Electrician', cert: twcUtils.Certs.ELECTRICAL }) }
            if (options['saf-drone-survey'] == 'T') {
                conditions.push({ quantity: 1, name: 'Drone Certified', cert: twcUtils.Certs.DRONE })
            }

            var customer = options['saf-customer'];
            var vendor = options['saf-vendor'];

            // Whether a SAF can be Auto-Approved is dependent on:
            var autoApprove = false;
            if (customer && vendor) {
                autoApprove = true;
                // - if MEWP (Mobile Elevating Work Platform => Crane/Cherrypicker) then no auto approval
                if (options['saf-crane-access'] == 'T') { autoApprove = false; }
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

            if (autoApprove) {
                // @@NOTE: the customer presence table will tell us weather we need to overwrite the auto approve
                //         the table will have more than one entry per customer/site as it has entries by structure
                //         however, the client stated that they want to check this table for auto-approve on a site level only 
                //         this means we my have more than one record per client/site which could state different things
                //         we agreed on getting the latest edited record for this purpose
                var customerPresence = coreSQL.first(`
                    select  NVL(custrecord_twc_cus_pre_cust_auto_approve, 'F') as auto_approve
                    from    customrecord_twc_cust_pres
                    where   custrecord_twc_cust_pres_site = ${options.siteId} 
                    AND     custrecord_twc_cust_pres_cust = ${customer}
                    order by lastmodified desc
                `);
                if (customerPresence && customerPresence.auto_approve == 'F') { autoApprove = false; }
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

            // @@NOTE: new SAFs have different field names, we need saf-customer to include the customer in the list of companies were crew members can be selected from
            saf['saf-customer'] = options.saf['saf-customer']

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

        function getSafActionList(options, userInfo) {
            // var saf = twcSaf.get(options.saf.id);
            // saf.copyFromObject(options.saf);
            // saf.siteId = options.saf.siteId;
            if (!options.type) { options.type = twcSaf.Type; }
            return twcSafUI.getSafActionList(options, userInfo);
        }

        function getVendorDocs(options) {
            var files = twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: 'customrecord_twc_company',
                    [twcFile.Fields.RECORD_ID]: options.vendor,
                    [twcFile.Fields.STATUS]: twcUtils.FileStatus.Received,
                    [twcFileType.Fields.USE_IN_SAF]: 'T'

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
            // @@NOTE: external users must describe their changes when editing / re-submitting a SAF (logged on the SAF Log, see below)
            var resubmitComment = (payload.resubmitComment || '').trim();
            if (payload.id && !payload.reUse && !userInfo.isEmployee && !resubmitComment) { validationErrors.push(`Specify a comment describing the changes made to the SAF`); }


            const validateCompanyInsurance = (companyId) => {
                // @@NOTE: a missing customer / contractor is already reported above ('Specify a customer' / 'Specify a primary contractor'), the query below would fail without an id
                if (!parseInt(companyId)) { return; }
                var insuranceInfo = twcUtils.getCompanyInsuranceDetails(companyId);
                for (var k in twcUtils.Insurances) {
                    if (insuranceInfo[twcUtils.Insurances[k].field] == twcUtils.NoActiveExpired.Active) {
                        if (insuranceInfo[twcUtils.Insurances[k].fieldEx] < latestDate) {
                            // @@NOTE: TL Does not want to show insurance expiry details (unless the logged in user is the company)
                            if (userInfo.companyProfile.id == companyId) {
                                validationErrors.push(`<b>${insuranceInfo.name}:</b> ${k} Insurance will be expired by ${latestDate}`)
                            } else {
                                // @@NOTE: if the user is not the company we use a generic message and exit at the 1st failed validations otherwise the message will duplicate
                                validationErrors.push('A SAF for these dates cannot be processed for the Customer at this time. Please contact the Customer to resolve.')
                                return;
                            }
                        }
                    }
                }
            }

            validateCompanyInsurance(payload['saf-customer']);
            if (payload['saf-vendor'] != payload['saf-customer']) {
                validateCompanyInsurance(payload['saf-vendor']);
            }

            var crewIds = [payload['saf-picw-staff']];
            core.array.each(payload.crews, c => {
                if (payload['saf-picw-staff'] == c['saf-crew-member']) {
                    validationErrors.push(`The PICW [<b>${payload['saf-picw-staff-name']}</b>] cannot be in the crew list`);
                } else {
                    crewIds.push(c['saf-crew-member']);
                }
            })

            // @@NOTE: a missing PICW (e.g. editing a SAF whose PICW is no longer valid, so the drop down is empty) is already reported above ('Specify a PICW')
            //         remove empty ids, the profile query would fail with 'in (,x,y)'
            crewIds = crewIds.filter(id => { return !!parseInt(id); });
            var crew = twcUtils.getProfiles({ id: crewIds });

            // @@NOTE: SAF: wherever e have Climber and Rescue Climber they need to be same person
            //              i.e.: if I have 3 climber and 2 rescue the 2 rescue must be part fo the 3 climbers
            var climberCount = options.accessRequirements.conditions.find(cond => { return cond.cert?.code.toLowerCase() == twcUtils.Certs.CLIMBER.code })?.quantity;
            core.array.each(options.accessRequirements.conditions, cond => {
                var condQuantity = cond.quantity;
                if (cond.quantity == 'all') {
                    condQuantity = payload.crews.length;
                } else if (cond.quantity == 'all-climber') {
                    condQuantity = climberCount;
                }

                var certCount = crew.filter(c => {
                    return c.attendAs.find(cc => {
                        // @@NOTE: there are still few inconsistencies with casing here
                        return cc.value.toLowerCase() == cond.cert?.code.toLowerCase() && cc.exp >= latestDate;
                    });
                });

                var certExCount = crew.filter(c => {
                    return c.attendAs.find(cc => {
                        // @@NOTE: there are still few inconsistencies with casing here
                        return cc.value.toLowerCase() == cond.cert?.code.toLowerCase() && cc.exp < latestDate;
                    });
                });

                if (certCount.length < condQuantity) {
                    if (certCount.length == 0 && certExCount.length == 0) {
                        validationErrors.push(`${cond.quantity} ${cond.name}${cond.quantity == 1 ? '' : 's'} must be certified, there are none in the crew`);
                    } else if (certCount.length == 0 && certExCount.length > 0) {
                        var crewNames = certExCount.map(i => { return `<li>${i.text}</li>` }).join('');
                        validationErrors.push(`${cond.quantity} ${cond.name}${cond.quantity == 1 ? '' : 's'} must be certified, there ${certExCount.length == 1 ? 'is' : 'are'} only ${certExCount.length} compliant in the crew but the cert is expired: <ul class="twc">${crewNames}</ul>`);
                    } else {
                        var expiredCrews = '';
                        var crewNames = certCount.map(i => { return `<li>${i.text}</li>` }).join('');
                        if (certExCount.length > 0) {
                            expiredCrews = `
                                The following crew members have certification which is not valid for the duration of the SAF
                                <ul class="twc">
                                    ${certExCount.map(i => { return `<li> ${i.text}</li>` }).join('')}
                                </ul>
                            `;

                        }
                        //validationErrors.push(`${cond.quantity} ${cond.name} ${cond.quantity == 1 ? 'is' : 'are'} required, there ${certCount.length == 1 ? 'is' : 'are'} only ${certCount.length} compliant in the crew: <ul class="twc">${crewNames}</ul>${expiredCrews}`);
                        validationErrors.push(`${cond.quantity} ${cond.name}${cond.quantity == 1 ? '' : 's'} must be certified, there ${certCount.length == 1 ? 'is' : 'are'} only ${certCount.length} compliant in the crew: <ul class="twc">${crewNames}</ul>${expiredCrews}`);
                    }

                }
            })

            var requiresSrf = recu.lookUp('customrecord_twc_saf_type', payload['saf-type'], 'custrecord_twc_saf_type_require_srf');
            if (requiresSrf) {
                if (!payload.actions || payload.actions.length == 0) { validationErrors.push(`Specify at least one action`); }
            }


            if (validationErrors.length > 0) {
                var errorHtml = 'The SAF cannot be saved:<ul class="twc">';
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
            // @@NOTE: a cancelled (or old rejected) SAF cannot be edited / re-submitted, its actions have been detached. 'Re Use' (new SAF) is still allowed
            if (!payload.reUse && payload.id && (saf.status == twcSaf.Status.Cancelled || saf.status == twcSaf.Status.Rejected)) {
                throw new Error(`This SAF is ${saf.statusName} and cannot be changed, please use 'Re Use' to create a new SAF`);
            }
            // @@NOTE: keep the old status (edit only) to log the status change caused by the re-submit
            var oldStatus = (payload.id && !payload.reUse) ? saf.status : null;
            var oldStatusName = (payload.id && !payload.reUse) ? saf.statusName : null;
            saf.site = payload.siteId;
            saf.r_type = payload['saf-type'];
            saf.status = options.accessRequirements.autoApprove ? twcSaf.Status.Approved : twcSaf.Status.Pending;
            saf.mastAccess = payload['saf-mast-access'] == 'T';
            saf.mastAccessAbove60m = payload['saf-mast-access-height'] == 'T';
            saf.tLBuildingAccess = payload['saf-building-access'] == 'T';
            saf.craneCherrypicker = payload['saf-crane-access'] == 'T';
            saf.rooftopAccess = payload['saf-rooftop-access'] == 'T';
            saf.electricalWorks = payload['saf-electrical-access'] == 'T';
            saf.droneSurvey = payload['saf-drone-survey'] == 'T';
            saf.customer = payload['saf-customer'];
            saf.primaryContractor = payload['saf-vendor'];
            saf.summaryofWorks = payload['saf-work-summary'];
            saf.pICW = payload['saf-picw-staff'];
            saf.sAFAuthor = userInfo.profile;
            saf.accommodation = payload['saf-accommodation'];
            saf.structure = payload['saf-structure'];
            saf.startTimeBlock = twcUtils.parsesSAFDateTime(`${earliestDate} ${twcUtils.getTimeBlockTimeRange(earliestBlock).start}`);
            saf.endTimeBlock = twcUtils.parsesSAFDateTime(`${latestDate} ${twcUtils.getTimeBlockTimeRange(latestBlock).end}`);
            saf.conditionsofAccess = b64.decode(options.conditionsOfAccessHtml);
            saf.worksPhotosReqDelay = payload['saf-photo-delay'] || null;

            var safId = saf.save();

            // attachments
            if (payload.documents) {

                saf = twcSaf.get(safId);

                var docIds = [];
                for (var d in payload.documents) { if (payload.documents[d]) { docIds.push(d.replace('file_toggle_', '')); } }

                try {
                    if (docIds.length > 0) {
                        var sql = `
                            select  f.id, ft.custrecord_twc_file_type_hs as health_safety, ft.custrecord_twc_file_type_method as method_stat, ft.custrecord_twc_file_type_insurance as insurance
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
                    }
                    saf.save();
                } catch (error) {
                    saf.logEx('Error while attaching files', error);
                }
            }


            if (payload.id) {
                if (payload.reUse) {
                    saf.logInfo('SAF Reused from: ' + recu.lookUp(twcSaf.Type, payload.id, 'name'));
                } else {
                    // @@NOTE: SAF Log messages are filtered for external users, use the shared constants (data/oTWC_safLog.js: LogMessage)
                    saf.logInfo(twcSafLog.LogMessage.Edited, resubmitComment || null);
                    if (oldStatus && oldStatus != saf.status) {
                        saf.logInfo(twcSafLog.LogMessage.StatusChanged, `status changed to: ${twcSaf.getSafStatusName(saf.status)} - old status: ${oldStatusName}`);
                    }
                }
            } else {
                saf.logInfo('SAF Created');
            }

            var errors = false;

            // time blocks
            if (payload.id) {
                coreSQL.each(`select id from customrecord_twc_saf_tm_blk where custrecord_twc_saf_tm_blk_saf = ${payload.id}`, r => {
                    recu.del('customrecord_twc_saf_tm_blk', r.id);
                })
            }
            for (var d in options.accessRequirements.timeBlocks) {
                if (!options.accessRequirements.timeBlocks[d]['t']) { continue; }
                core.array.each(options.accessRequirements.timeBlocks[d]['t'].blocks, b => {
                    try {
                        //var tb = twcSafTimeBlock.get(b.id == 'new' ? null : b.id);
                        var tb = twcSafTimeBlock.get();
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

            // @@NOTE: actions detached from another SAF while picking the actions (oTWC_siteAccess.js: TWCEqActionForm.detachOtherSaf)
            //         applied now (on save) and before the actions below are attached to this SAF
            if (payload.actions_detach_other) {
                core.array.each(payload.actions_detach_other, d => {
                    try {
                        detachSafAction(d);
                        saf.logInfo(`Eq. Action [${recu.lookUp(twcEqAct.Type, d.id, 'name')}] detached from SAF [${recu.lookUp(twcSaf.Type, d.saf, 'name')}]`);
                    } catch (error) {
                        saf.logEx('Error while detaching action from other SAF', error);
                        errors = true;
                    }
                })
            }

            if (payload.actions) {
                core.array.each(payload.actions, a => {
                    try {
                        var action = twcSafAction.get(payload.reUse ? null : a.id);
                        action.sAF = safId;
                        action.sAF_ACTIONEA = a.ea_id;
                        if (a[twcSafAction.Fields.SAF_ACTION_STATUS]) {
                            action.sAF_ACTIONStatus = a[twcSafAction.Fields.SAF_ACTION_STATUS];
                        } else {
                            action.sAF_ACTIONStatus = twcUtils.SafActionStatus.Pending;
                        }
                        if (a[twcSafAction.Fields.DETACH_REASON]) {
                            action.detachReason = a[twcSafAction.Fields.DETACH_REASON];
                            action.detachComment = a[twcSafAction.Fields.DETACH_COMMENT];
                        }
                        action.save();

                        if (a[twcSafAction.Fields.SAF_ACTION_STATUS] == twcUtils.SafActionStatus.Detached) {
                            if (recu.lookUp(twcEqAct.Type, a.ea_id, twcEqAct.Fields.EA_SAF)?.value == safId) {
                                recu.submit(twcEqAct.Type, a.ea_id, twcEqAct.Fields.EA_SAF, null);
                            }
                            //
                        } else {
                            recu.submit(twcEqAct.Type, a.ea_id, twcEqAct.Fields.EA_SAF, safId);
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
                var commentCHanged = options.comment ? saf.reviewComment != options.comment : false;
                if (!statusChanged && !commentCHanged) { return; }

                // @@NOTE: 'Rejected' is no longer used (it had the same effect as 'Cancelled'), a cancelled (or old rejected) SAF cannot be re-opened
                if (statusChanged && options.status == twcSaf.Status.Rejected) { throw new Error(`The 'Rejected' status is no longer used, please use 'Cancelled'`); }
                if (statusChanged && (saf.status == twcSaf.Status.Cancelled || saf.status == twcSaf.Status.Rejected)) {
                    throw new Error(`This SAF is ${saf.statusName}, its status cannot be changed`);
                }
                // @@NOTE: a comment (the reason) is mandatory when cancelling a SAF
                if (statusChanged && options.status == twcSaf.Status.Cancelled && !(options.comment || '').trim()) {
                    throw new Error('Please, specify a comment (reason) to cancel the SAF');
                }
                // @@NOTE: 'Feedback Issued' sends the SAF back to the submitter: the comment (the feedback) is mandatory, the actions stay attached (unlike Cancelled)
                if (statusChanged && options.status == twcSaf.Status.FeedbackIssued && !(options.comment || '').trim()) {
                    throw new Error('Please, specify the feedback (comment) for the SAF submitter');
                }

                var safRequiresSrf = twcUtils.getSafType(saf.r_type)?.requires_srf == 'T';
                if (statusChanged && (options.status == twcSaf.Status.Cancelled || options.status == twcSaf.Status.Rejected)) {
                    if (safRequiresSrf) { validateAndDetachActions(options.saf); }
                }

                var logMsgStatus = ''; var infoStatus = '';
                if (statusChanged) {
                    logMsgStatus = twcSafLog.LogMessage.StatusChanged;
                    infoStatus = `status changed to: ${twcSaf.getSafStatusName(options.status)} - old status: ${saf.statusName}`;
                }

                if (options.status) {
                    saf.status = options.status;
                    if (options.status == twcSaf.Status.Approved) {
                        saf.worksEndDate = (new Date()).addHours(12);
                        saf.completionPhotosRequested = saf.worksEndDate.addDays(saf.worksPhotosReqDelay || 0);
                    }
                }
                if (options.comment) { saf.reviewComment = options.comment; }

                if (statusChanged && options.status == twcSaf.Status.PhotosReceived) {
                    saf.completionPhotosReceived = (new Date()).addHours(12);
                }

                if (statusChanged && options.status == twcSaf.Status.Complete) {
                    validateAndCompleteActions(options.saf);
                    // @@NOTE: completed manually: any completion photos review still pending approval is no longer relevant
                    saf.reviewPendingApproval = false;
                    saf.proposedReviewComment = null;
                    saf.proposedCompletedActions = null;
                }

                saf.save();

                // @@NOTE: status changes / comments in the completion photos phase go to the Completion Photos Log (PHOTOS category)
                var logCategory = twcSafLog.isPhotoStatus(options.status || saf.status) ? twcSafLog.LogCategory.Photos : null;
                if (statusChanged) {
                    if (options.status == twcSaf.Status.Rejected) {
                        saf.logWarn(logMsgStatus, infoStatus, null, logCategory);
                    } else {
                        saf.logInfo(logMsgStatus, infoStatus, null, logCategory);
                    }
                }

                if (commentCHanged) {
                    saf.logInfo(twcSafLog.LogMessage.Comment, options.comment, null, logCategory);
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
                recu.submit(twcEqAct.Type, sa.ea_action_id, twcEqAct.Fields.EA_SAF, null);
            })
        }

        function validateAndCompleteActions(saf, actions) {
            // throw new Error(JSON.stringify(actions))

            var safActions = coreSQL.run(`
                select  sa.id saf_action_id, ea.id as ea_action_id, ea.name as eq_action, ea.custrecord_twc_eq_action_eq as equip_id, ea.custrecord_twc_eq_action_type as ea_type,
                        sa.custrecord_twc_saf_a_status as saf_status, BUILTIN.DF(sa.custrecord_twc_saf_a_status) as saf_status_name,
                        ea.custrecord_twc_eq_action_sts as ea_status, BUILTIN.DF(ea.custrecord_twc_eq_action_sts) as ea_status_name,
                        TO_CHAR(s.${twcSaf.Fields.WORKS_END_DATE}, 'yyyy-MM-dd') as works_end_date
                from    customrecord_twc_saf_action sa
                join    customrecord_twc_eq_action ea on ea.id = sa.custrecord_twc_saf_a_ea and ea.custrecord_twc_eq_action_saf = sa.custrecord_twc_saf_a_saf
                join    ${twcSaf.Type} s on s.id = sa.custrecord_twc_saf_a_saf
                where   sa.custrecord_twc_saf_a_saf = ${saf}
                and     sa.custrecord_twc_saf_a_status in (${twcUtils.SafActionStatus.Pending}, ${twcUtils.SafActionStatus.AwaitingPhotos})
            `);

            var actionSkipped = false;
            core.array.each(safActions, sa => {
                if (actions && actions.indexOf(parseInt(sa.saf_action_id)) < 0) {
                    actionSkipped = true;
                    return;
                }
                recu.submit(twcSafAction.Type, sa.saf_action_id, [twcSafAction.Fields.SAF_ACTION_STATUS, twcSafAction.Fields.SAF_ACTION_COMPLETE], [twcUtils.SafActionStatus.Complete, true]);
                recu.submit(twcEqAct.Type, sa.ea_action_id, twcEqAct.Fields.EA_STATUS, twcUtils.EaActionStatus.Complete);

                // @@NOTE: installed / removed date = SAF Works End Date (set when the SAF is approved), today if not set
                var worksEndDate = sa.works_end_date ? twcUtils.fromJsToNs(sa.works_end_date) : new Date();
                if (sa.ea_type == twcUtils.EqActionType.Licence || sa.ea_type == twcUtils.EqActionType.SwapLicence) {
                    recu.submit(twcEquipment.Type, sa.equip_id, [twcEquipment.Fields.EQUIPMENT_INSTALL_STATUS, twcEquipment.Fields.INSTALLED_DATE], [twcUtils.EqInstallStatus.Installed, worksEndDate])
                    if (sa.ea_type == twcUtils.EqActionType.SwapLicence) { moveAtmeToSwappedTme(sa.ea_action_id, sa.equip_id); }
                } else if (sa.ea_type == twcUtils.EqActionType.Unlicence || sa.ea_type == twcUtils.EqActionType.SwapUnlicence) {
                    recu.submit(twcEquipment.Type, sa.equip_id, [twcEquipment.Fields.EQUIPMENT_INSTALL_STATUS, twcEquipment.Fields.REMOVED_DATE], [twcUtils.EqInstallStatus.Removed, worksEndDate])
                }
            })
            return !actionSkipped;
        }

        // @@IMPORTANT: TME swap: the ATMEs that are NOT swapped with it must move to the new TME (otherwise they stay on the removed panel)
        //              runs when the new TME is installed (its Swap Licence EA completed by the SAF, see validateAndCompleteActions)
        //                  old TME = equipment of the Swap Unlicence EA of the same SRF item
        //                  moved   = ATMEs whose parent is the old TME, unless already removed or with an open removal / swap of their own (they go with the old TME)
        //              swapped ATMEs need nothing: their new equipment is created with the new TME as parent (oTWC_srfWorkflowEngine.js: initEquipment)
        function moveAtmeToSwappedTme(eaId, newTmeId) {
            if (!eaId || !newTmeId) { return; }
            var swap = coreSQL.first(`
                select  old_ea.${twcEqAct.Fields.EA_EQUIPMENT} as old_tme, new_eq.${twcEquipment.Fields.EQUIPMENT_CLASS} as eq_class
                from    ${twcEqAct.Type} new_ea
                join    ${twcEquipment.Type} new_eq on new_eq.id = new_ea.${twcEqAct.Fields.EA_EQUIPMENT}
                join    ${twcEqAct.Type} old_ea on old_ea.${twcEqAct.Fields.EA_SRF_ITEM} = new_ea.${twcEqAct.Fields.EA_SRF_ITEM}
                                               and old_ea.${twcEqAct.Fields.EA_TYPE} = ${twcUtils.EqActionType.SwapUnlicence}
                where   new_ea.id = ${parseInt(eaId)}
            `);
            if (!swap?.old_tme || swap.eq_class != twcUtils.SrfStepType.TME || swap.old_tme == newTmeId) { return; }

            var atmes = coreSQL.run(`
                select  eq.id
                from    ${twcEquipment.Type} eq
                where   eq.${twcEquipment.Fields.PARENT_TME_ID} = ${parseInt(swap.old_tme)}
                and     eq.${twcEquipment.Fields.EQUIPMENT_CLASS} = ${twcUtils.SrfStepType.ATME}
                and     NVL(eq.${twcEquipment.Fields.EQUIPMENT_INSTALL_STATUS}, 0) != ${twcUtils.EqInstallStatus.Removed}
                and     not exists (
                            select  1
                            from    ${twcEqAct.Type} rea
                            where   rea.${twcEqAct.Fields.EA_EQUIPMENT} = eq.id
                            and     rea.${twcEqAct.Fields.EA_TYPE} in (${twcUtils.EqActionType.Unlicence}, ${twcUtils.EqActionType.SwapUnlicence})
                            and     rea.${twcEqAct.Fields.EA_STATUS} in (${twcUtils.EqActionStatus.Pending}, ${twcUtils.EqActionStatus.AlreadyRemoved}, ${twcUtils.EqActionStatus.NeverInstalled})
                        )
            `);
            core.array.each(atmes, atme => {
                recu.submit(twcEquipment.Type, atme.id, twcEquipment.Fields.PARENT_TME_ID, newTmeId);
            });
            core.logDebug('SWAP-MOVE-ATME', `old TME ${swap.old_tme} => new TME ${newTmeId}: ${atmes.length} ATME(s) moved`);
        }

        function saveSafImage(options) {

            var fileType = coreSQL.first(`select id from customrecord_twc_file_type where custrecord_twc_file_type_image = 'T' order by created`)?.id;

            var safInfo = coreSQL.first(`
                select  saf.name, site.${twcSite.Fields.SITE_ID} as site_id
                from    ${twcSaf.Type} saf
                join    ${twcSite.Type} site on site.id = ${twcSaf.Fields.SITE}
                where   saf.id = ${options.saf}
            `)
            var safFolder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/${safInfo.site_id}/SAF/${safInfo.name}`);

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

        // @@NOTE: completion photos review process (TL only):
        //              1. an employee assigns a reviewer (setSafReviewer)
        //              2. the reviewer reviews the photos: comment + completed actions are only PROPOSED, the SAF is flagged 'review pending approval' (setSafReviewed)
        //              3. an approver (employee with 'Can Approve SAF Photo Reviews') amends the comment and approves (approveSafReview) or sends it back to the reviewer (sendBackSafReview)
        //                 only on approval the actions are completed, the status changes and the comment is issued to the submitter (PHOTOS log 'status changed' + 'Comment')
        //         all log entries go to the Completion Photos Log (PHOTOS category), only 'status changed' / 'Comment' are visible to external users
        function setSafReviewer(options, userInfo) {
            if (!userInfo.isEmployee) { throw new Error('You do not have permissions to assign a reviewer'); }
            if (twcSaf.get(options.saf).reviewPendingApproval === true) { throw new Error('The review is pending approval, the reviewer cannot be changed'); }
            recu.submit(twcSaf.Type, options.saf, twcSaf.Fields.COMPLETION_REVIEWER, options.reviewer.value);
            twcSafLog.logInfo(options.saf, twcSafLog.LogMessage.ReviewerAssigned, options.reviewer.text, null, twcSafLog.LogCategory.Photos);
        }

        function setSafReviewed(options, userInfo) {
            var saf = twcSaf.get(options.saf);
            if (!userInfo.isEmployee || saf.completionReviewer != userInfo.profile) { throw new Error('Only the assigned reviewer can review the completion photos'); }
            if (saf.reviewPendingApproval) { throw new Error('The review is already pending approval'); }
            var comment = (options.comment || '').trim();
            if (!comment) { throw new Error('Please, specify a review comment'); }
            if (!options.actions || options.actions.length == 0) { throw new Error('Please, select at least one completed action'); }

            recu.submit(twcSaf.Type, options.saf,
                [twcSaf.Fields.PROPOSED_REVIEW_COMMENT, twcSaf.Fields.PROPOSED_COMPLETED_ACTIONS, twcSaf.Fields.REVIEW_PENDING_APPROVAL],
                [comment, JSON.stringify(options.actions.map(a => { return parseInt(a); })), true]);
            twcSafLog.logInfo(options.saf, twcSafLog.LogMessage.PhotosReviewed, comment, null, twcSafLog.LogCategory.Photos);
        }

        function getPendingReview(safId, userInfo) {
            if (!userInfo.canApproveSafReview) { throw new Error('You do not have permissions to approve completion photos reviews'); }
            var saf = twcSaf.get(safId);
            if (!saf.reviewPendingApproval) { throw new Error('There is no review pending approval for this SAF'); }
            return saf;
        }

        // @@NOTE: data for the approver dialog (ui/js/oTWC_siteAccess.js: approveReview): proposed comment + the actions the reviewer marked as completed
        function getPendingSafReview(options, userInfo) {
            var saf = getPendingReview(options.saf, userInfo);
            var actionIds = [];
            try { actionIds = JSON.parse(saf.proposedCompletedActions || '[]').map(a => { return parseInt(a); }).filter(a => { return !isNaN(a); }); } catch (e) { actionIds = []; }
            var actions = (actionIds.length == 0) ? [] : coreSQL.run(`
                select  sa.id, ea.name as eq_action, BUILTIN.DF(ea.custrecord_twc_eq_action_type) as ea_type, BUILTIN.DF(ea.custrecord_twc_eq_action_eq) as equipment
                from    customrecord_twc_saf_action sa
                join    customrecord_twc_eq_action ea on ea.id = sa.custrecord_twc_saf_a_ea
                where   sa.id in (${actionIds.join(',')})
            `);
            return {
                comment: saf.proposedReviewComment || '',
                reviewer: saf.completionReviewerName || '',
                actions: actions
            }
        }

        function approveSafReview(options, userInfo) {
            var saf = getPendingReview(options.saf, userInfo);
            var comment = (options.comment || '').trim();
            if (!comment) { throw new Error('Please, specify a review comment'); }

            var actions = [];
            try { actions = JSON.parse(saf.proposedCompletedActions || '[]'); } catch (e) { actions = []; }
            if (actions.length == 0) { throw new Error('The review has no completed actions, please send it back to the reviewer'); }

            var oldStatusName = saf.statusName;
            var completed = validateAndCompleteActions(options.saf, actions);
            var newStatus = completed ? twcSaf.Status.Complete : twcSaf.Status.PartiallyComplete;

            // @@NOTE: the proposal is cleared on approval: 'not pending + proposed comment' means the review was sent back (badge in ui/oTWC_siteAccess_sl.js)
            recu.submit(twcSaf.Type, options.saf,
                [twcSaf.Fields.STATUS, twcSaf.Fields.REVIEW_COMMENT, twcSaf.Fields.REVIEW_PENDING_APPROVAL, twcSaf.Fields.REVIEW_APPROVED_BY, twcSaf.Fields.REVIEW_APPROVED_DATE, twcSaf.Fields.PROPOSED_REVIEW_COMMENT, twcSaf.Fields.PROPOSED_COMPLETED_ACTIONS],
                [newStatus, comment, false, userInfo.profile || null, new Date(), null, null]);

            var photos = twcSafLog.LogCategory.Photos;
            twcSafLog.logInfo(options.saf, twcSafLog.LogMessage.ReviewApproved, (comment != (saf.proposedReviewComment || '').trim()) ? `Comment amended by the approver` : null, null, photos);
            // @@NOTE: these two are visible to the submitter
            twcSafLog.logInfo(options.saf, twcSafLog.LogMessage.StatusChanged, `status changed to: ${twcSaf.getSafStatusName(newStatus)} - old status: ${oldStatusName}`, null, photos);
            twcSafLog.logInfo(options.saf, twcSafLog.LogMessage.Comment, comment, null, photos);
        }

        function sendBackSafReview(options, userInfo) {
            getPendingReview(options.saf, userInfo);
            var note = (options.note || '').trim();
            if (!note) { throw new Error('Please, specify a note for the reviewer'); }
            // @@NOTE: the proposed comment / actions are kept so the reviewer can amend them
            recu.submit(twcSaf.Type, options.saf, twcSaf.Fields.REVIEW_PENDING_APPROVAL, false);
            twcSafLog.logInfo(options.saf, twcSafLog.LogMessage.ReviewSentBack, note, null, twcSafLog.LogCategory.Photos);
        }

        function getSafTimeBlocks(id) {
            return coreSQL.run(`
                select  TO_CHAR(custrecord_twc_saf_tm_blk_date, 'dd/MM/yyyy') as date, BUILTIN.DF(custrecord_twc_saf_tm_blk_block) as block
                from   	customrecord_twc_saf_tm_blk
                where   custrecord_twc_saf_tm_blk_saf = ${id}
                order by custrecord_twc_saf_tm_blk_date, custrecord_twc_saf_tm_blk_block
            `)
        }

        function detachSafAction(payload) {
            //throw new Error(JSON.stringify(payload));

            var safActionId = coreSQL.first(`
                select  id
                from    customrecord_twc_saf_action
                where   custrecord_twc_saf_a_saf = ${payload.saf}
                and     custrecord_twc_saf_a_ea = ${payload.id}
            `)?.id;

            if (!safActionId) { throw new Error(`No SAF Action found for saf [${payload.saf} and eq. act [${payload.id}]`) }

            recu.submit(twcSafAction.Type, safActionId,
                [twcSafAction.Fields.SAF_ACTION_STATUS, twcSafAction.Fields.DETACH_REASON, twcSafAction.Fields.DETACH_COMMENT],
                [twcUtils.SafActionStatus.Detached, payload.reason, payload.comment]
            )

            recu.submit(twcEqAct.Type, payload.id, twcEqAct.Fields.EA_SAF, null);
        }

        function deleteSaf(safId) {

            coreSQL.each(`select id from customrecord_twc_saf_log where custrecord_twc_saf_log_saf = ${safId}`, r => {
                recu.del('customrecord_twc_saf_log', r.id);
            })

            coreSQL.each(`select id from customrecord_twc_saf_crew where custrecord_twc_saf_crew_saf = ${safId}`, r => {
                recu.del('customrecord_twc_saf_crew', r.id);
            })

            coreSQL.each(`select id from customrecord_twc_saf_tm_blk where custrecord_twc_saf_tm_blk_saf = ${safId}`, r => {
                recu.del('customrecord_twc_saf_tm_blk', r.id);
            })

            coreSQL.each(`select id from customrecord_twc_saf_action where custrecord_twc_saf_a_saf = ${safId}`, r => {
                recu.del('customrecord_twc_saf_action', r.id);
            })

            coreSQL.each(`select id from customrecord_twc_eq_action where custrecord_twc_eq_action_saf = ${safId}`, r => {
                recu.submit('customrecord_twc_eq_action', r.id, ['custrecord_twc_eq_action_saf', 'custrecord_twc_eq_action_sts'], [null, twcUtils.EqActionStatus.Pending]);
            })


            recu.del('customrecord_twc_saf', safId)
        }



        return {
            getSAFInfoPanels: twcSafUI.getSAFInfoPanels,

            getSiteAccessInfo: (pageData, reUse) => {
                var saf = {};
                if (pageData.recId) {
                    // @@NOTE: this is an existing record we need to make sure we can see it
                    saf = twcSaf.select({ noAlias: true, returnFirst: true, where: { id: pageData.recId } })
                    if (!saf) { throw new Error(`No SAF found using id ${pageData.recId}`) }
                    saf.siteId = saf[twcSaf.Fields.SITE];

                    if (!twcConfig.isUserAllowedCustomers(pageData.userInfo, saf[twcSaf.Fields.CUSTOMER])) {
                        throw new Error('You do not have access to see this SAF record');
                    }

                    if (reUse) {
                        saf.reUse = reUse;
                        saf[twcSaf.Fields.STATUS] = twcSaf.Status.Pending;
                        saf[twcSaf.Fields.PICW] = null;

                        // @@NOTE: the user can pick a different site when re-using a SAF (SAF locator re-use dialog)
                        //         the structure belongs to the original site so it must be cleared (crews and actions are not copied on re-use anyway)
                        if (pageData.siteId && pageData.siteId != saf[twcSaf.Fields.SITE]) {
                            saf[twcSaf.Fields.SITE] = pageData.siteId;
                            saf.siteId = pageData.siteId;
                            saf[twcSaf.Fields.STRUCTURE] = null;
                        }
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
            getSafActionList: getSafActionList,
            getVendorDocs: getVendorDocs,

            saveNewSaf: saveNewSaf,
            editSafStatus: editSafStatus,
            saveSafImage: saveSafImage,
            setSafReviewer: setSafReviewer,
            setSafReviewed: setSafReviewed,
            getPendingSafReview: getPendingSafReview,
            approveSafReview: approveSafReview,
            sendBackSafReview: sendBackSafReview,
            getSafTimeBlocks: getSafTimeBlocks,


            deleteSaf: deleteSaf


        }

    });