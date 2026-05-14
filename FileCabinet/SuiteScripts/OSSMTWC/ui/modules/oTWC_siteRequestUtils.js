/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_utils.js', '../../data/oTWC_site.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../data/oTWC_srfUI.js', '../../data/oTWC_file.js', '../../O/oTWC_nsFileUtils.js', '../../data/oTWC_config.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_equipmentLib.js', '../../data/oTWC_equipAction.js', 'N/record'],
    (core, coreSQL, recu, twcUtils, twcSite, twcSrf, twcSrfItem, twcSrfUI, twcFile, nsFileUtils, twcConfig, twcUI, twcEqLib, twcEqAct, record) => {

        function saveSiteSrf(userInfo, payload) {
            // @@NOTE: @@REVIEW: this routine could be generalised to be used with different record types, not only twcSite

            // @@TODO: run validations on srf and srfItems records

            // @@TODO: error handling????
            var submitInfo = {};
            submitInfo[twcSrf.Type] = { id: payload.id, fields: [], values: [] };
            for (var k in payload) {
                if (k == 'id') { continue; }
                // @@NOTE: fields with '___' means they are linked record fields, we first update the site info, then the linked records
                var fieldPath = k.split('___');
                if (fieldPath.length == 1) {
                    submitInfo[twcSrf.Type].fields.push(k);
                    submitInfo[twcSrf.Type].values.push(payload[k])
                }
            }

            if (payload.id) {
                recu.submit(twcSrf.Type, payload.id, submitInfo[twcSrf.Type].fields, submitInfo[twcSrf.Type].values);
            } else {
                var newSrf = twcSrf.get();
                newSrf.sRFStatus = twcSrf.Status.Draft;
                newSrf.sRFRequestedDate = (new Date()).addHours(12);    // @@NOTE: to account for the GMT difference of US servers
                newSrf.sRFSubmittedBy = userInfo.profile || null;

                core.array.each(submitInfo[twcSrf.Type].fields, (field, idx) => {
                    if (!newSrf.hasField(field)) { return; }
                    newSrf.set(field, submitInfo[twcSrf.Type].values[idx]);
                })

                payload.id = newSrf.save();
            }

            //
            deleteSitesSrfItem(payload);
            deleteSitesSrfFile(payload);

            //
            saveSiteSrfItem(payload, twcSrfItem.StepType.TME);
            saveSiteSrfItem(payload, twcSrfItem.StepType.ATME);
            saveSiteSrfItem(payload, twcSrfItem.StepType.GIE);
            saveSiteSrfFile(payload);

            return payload.id;

        }
        function saveSiteSrfItem(payload, stepType) {
            var items = payload[`items_${stepType}`] || [];

            core.array.each(items, item => {
                if (!item.dirty) { return; }
                var srfItem = twcSrfItem.get(item.id);
                srfItem.sRF = payload.id;
                srfItem.stepType = stepType;
                for (var k in item) {
                    if (k == 'name') { continue; }
                    // @@IMPORTANT: field itemType is dependent on the stepType field
                    //              when stepTypeField is set the itemType is reset since we set the step type above make sure we skip it from here
                    if (k == 'custrecord_twc_srf_itm_stype') { continue; }
                    if (!srfItem.hasField(k)) { continue; }
                    srfItem.set(k, item[k])
                }
                srfItem.save();
            })

            log.debug("Before itemssss", items);
            // @@TODO: JAVEED: Save Eq. Actions Records
            core.array.each(items, item => {

                if (!item.dirty) { return; }

                // Only process correct stepType
                if (parseInt(item.custrecord_twc_srf_itm_stype) !== parseInt(stepType)) {
                    return;
                }

                try {
                    var requestType = item.custrecord_twc_srf_itm_req_type;
                    // Resolve equipment
                    var equipmentId = item.custrecord_twc_srf_itm_equip_id || item.custrecord_twc_srf_itm_tme_id;
                    // Generate ID
                    var finalSrfItemId = item._savedSrfItemId || item.id;
                    var result = coreSQL.first(`
                        SELECT MAX(TO_NUMBER(REGEXP_SUBSTR(custrecord_twc_eq_action_id, '\\d+'))) as max_id
                        FROM ${twcEqAct.Type}
                    `);
                    var next = (result && result.max_id) ? parseInt(result.max_id) + 1 : 1;
                    function generateId(num) {
                        return `EQAC-${String(num).padStart(6, '0')}`;
                    }
                    // INSTALL
                    if (requestType == twcSrfItem.RequestType.INSTALL) {

                        var eqAction = record.create({
                            type: twcEqAct.Type,
                            isDynamic: true
                        });
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_srf', value: payload.id });
                        if (finalSrfItemId) {
                            eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_srf_item', value: finalSrfItemId });
                        }
                        if (equipmentId) {
                            eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_eq', value: equipmentId });
                        }
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_type', value: twcSrfItem.RequestType.INSTALL });
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_sts', value: 1 });
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_id', value: generateId(next) });
                        eqAction.save();
                    }
                    // REMOVE
                    else if (requestType == twcSrfItem.RequestType.REMOVE) {

                        var eqAction = record.create({ type: twcEqAct.Type, isDynamic: true });
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_srf', value: payload.id });
                        if (finalSrfItemId) {
                            eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_srf_item', value: finalSrfItemId });
                        }
                        if (equipmentId) {
                            eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_eq', value: equipmentId });
                        }
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_type', value: twcSrfItem.RequestType.REMOVE });
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_sts', value: 1 });
                        eqAction.setValue({ fieldId: 'custrecord_twc_eq_action_id', value: generateId(next) });
                        eqAction.save();
                    }
                    // SWAP (REMOVE + INSTALL)
                    else if (requestType == twcSrfItem.RequestType.SWAP) {

                        // REMOVE
                        var eqRemove = record.create({ type: twcEqAct.Type, isDynamic: true });
                        eqRemove.setValue({ fieldId: 'custrecord_twc_eq_action_srf', value: payload.id });
                        if (finalSrfItemId) {
                            eqRemove.setValue({ fieldId: 'custrecord_twc_eq_action_srf_item', value: finalSrfItemId });
                        }
                        if (equipmentId) {
                            eqRemove.setValue({ fieldId: 'custrecord_twc_eq_action_eq', value: equipmentId });
                        }
                        eqRemove.setValue({ fieldId: 'custrecord_twc_eq_action_type', value: twcSrfItem.RequestType.REMOVE });
                        eqRemove.setValue({ fieldId: 'custrecord_twc_eq_action_sts', value: 1 });
                        eqRemove.setValue({ fieldId: 'custrecord_twc_eq_action_id', value: generateId(next) });
                        eqRemove.save();
                        // INSTALL (next ID)
                        next++;

                        var eqInstall = record.create({ type: twcEqAct.Type, isDynamic: true });
                        eqInstall.setValue({ fieldId: 'custrecord_twc_eq_action_srf', value: payload.id });
                        if (finalSrfItemId) {
                            eqInstall.setValue({ fieldId: 'custrecord_twc_eq_action_srf_item', value: finalSrfItemId });
                        }
                        eqInstall.setValue({ fieldId: 'custrecord_twc_eq_action_type', value: twcSrfItem.RequestType.INSTALL });
                        eqInstall.setValue({ fieldId: 'custrecord_twc_eq_action_sts', value: 1 });
                        eqInstall.setValue({ fieldId: 'custrecord_twc_eq_action_id', value: generateId(next) });
                        eqInstall.save();
                    }

                } catch (e) {
                    log.error('Equip Action Save Failed', e);
                }
            });
        }

        // function deleteSitesSrfItem(payload) {
        //     if (!payload.items_deleted) { return; }
        //     core.array.each(payload.items_deleted, item => {
        //         recu.del(twcSrfItem.Type, item.id);
        //     })

        //     // @@TODO: JAVEED: Delete Eq. Actions Records
        // }

        function deleteSitesSrfItem(payload) {
            log.debug("Payload Items", JSON.stringify(payload));
            if (!payload.items_deleted) { return; }
            core.array.each(payload.items_deleted, item => {
                try {
                    // @@NOTE: Deleting Eq. Action record first to avoid dependency issue on SRF Item record.
                    var srfItemId = item.id;
                    log.debug('Deleting SRF Item', srfItemId);
                    if (!srfItemId) { return; }
                    var eqActions = coreSQL.run(` SELECT id FROM ${twcEqAct.Type} WHERE ${twcEqAct.Fields.SRF_ITEM} = ${srfItemId} `);
                    log.debug('Related Eq Actions', eqActions);
                    core.array.each(eqActions, action => {
                        try {
                            log.debug('Deleting Eq Action', action.id);
                            recu.del(twcEqAct.Type, action.id);
                        } catch (eqErr) {
                            log.error('Failed Deleting Eq Action', eqErr.message);
                        }
                    });
                    // Deleting SRF Item record
                    log.debug('Deleting SRF Item', srfItemId);
                    recu.del(twcSrfItem.Type, srfItemId);
                } catch (e) {
                    log.error('Delete SRF Item Failed', e.message);
                }
            });
        }

        function saveSiteSrfFile(payload) {
            if (!payload.files) { return; }

            var srfInfo = coreSQL.first(`
                select  s.name, site.${twcSite.Fields.SITE_ID} as site_id
                from    ${twcSrf.Type} s
                join    ${twcSite.Type} site on site.id = s.${twcSrf.Fields.SITE}
                where   s.id = ${payload.id}
            `)

            var srfFolder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/${srfInfo.site_id}/${srfInfo.name}`);

            core.array.each(payload.files, file => {
                if (!file.dirty) { return; }

                var srfFile = twcFile.get(file.id);
                srfFile.recordType = twcSrf.Type;
                srfFile.recordID = payload.id;
                for (var k in file) {
                    if (k == 'fileObject') { continue; }
                    if (!srfFile.hasField(k)) { continue; }
                    srfFile.set(k, file[k])
                }
                srfFile.save();

                var nsFile = nsFileUtils.writeFile({
                    name: `${srfFile.id}_${file.fileObject.name}`,
                    fileType: nsFileUtils.getFileType(file.fileObject.type),
                    content: file.fileObject.content,
                    folder: srfFolder,
                });
                recu.submit(twcFile.Type, srfFile.id, twcFile.Fields.FILE, nsFile.fileId);

            })
        }
        function deleteSitesSrfFile(payload) {
            if (!payload.files_deleted) { return; }
            core.array.each(payload.files_deleted, file => {
                // @@TODO: delete actual file

                recu.del(twcFile.Type, file.id);
            })
        }

        function renderSiteLocatorPanel(featureId) {

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
                            <h3 class="twc">Site Locator</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_NAME}
                                </div>
                                <div>
                                    {FILTER_SRF_ID}
                                    {FILTER_SRF_STATUS}
                                </div>
                                <div>
                                    {FILTER_SITE_TYPE}
                                    {FILTER_PORTFOLIO}
                                </div>
                                <div>
                                    {FILTER_COUNTIES}
                                </div>
                                
                            </div>

                            <h3 class="twc">Filter by Location</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_LAT} {FILTER_LNG} {FILTER_RADIUS}
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

            html = html.replace('{FILTER_NAME}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Name', width: '50%', id: 'site_id', noEmpty: true, dataSource: twcUtils.getSiteNames() }));
            html = html.replace('{FILTER_SRF_ID}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'SRF ID', width: 'calc(25% - 2px)', multiSelect: true, id: 'record_id', noEmpty: true, dataSource: twcUtils.getSrfIds() }));
            html = html.replace('{FILTER_SRF_STATUS}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'SRF STATUS', width: 'calc(25% - 2px)', multiSelect: true, id: twcSrf.Fields.SRF_STATUS, noEmpty: true, dataSource: twcUtils.getSrfStatus() }));
            html = html.replace('{FILTER_SITE_TYPE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site Type', width: 'calc(25% - 2px)', multiSelect: true, id: twcSite.Fields.SITE_TYPE, noEmpty: true, dataSource: twcUtils.getSiteTypes() }));
            html = html.replace('{FILTER_PORTFOLIO}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Portfolio', width: 'calc(25% - 2px)', multiSelect: true, id: twcSite.Fields.SITE_PORTFOLIO, noEmpty: true, dataSource: twcUtils.getPortfolios() }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'County', width: '50%', multiSelect: true, id: twcSite.Fields.ADDRESS_COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            

            html = html.replace('{FILTER_LAT}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Latitude', id: 'twc-coord-latitude', width: '250px' }));
            html = html.replace('{FILTER_LNG}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Longitude', id: 'twc-coord-longitude', width: '250px' }));
            html = html.replace('{FILTER_RADIUS}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Radius (Km)', id: 'twc-coord-radius', value: 5, width: '75px', min: 5, max: 300 }));

            html = html.replace('{ACTION_CLEAR_FILTERS}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Clear Filters', id: 'twc-action-clear-filter' }));
            

            return html;
        }

        return {

            getSRFInfoPanels: twcSrfUI.getSRFInfoPanels,
            getSrfChildRecord: (options, userInfo) => {
                var srf = twcSrf.get(options.srf.id);
                srf.copyFromObject(options.srf);
                var childRecord = null;
                if (options.item) {
                    childRecord = twcSrfItem.get(options.item.id);
                    childRecord.copyFromObject(options.item);
                    // @@NOTE: fields itemType has a dependency with field stepType, copyFromObject sets itemType before it sets stepType as a result itemType is "lost"
                    childRecord.set(twcSrfItem.Fields.ITEM_TYPE, options.item[twcSrfItem.Fields.ITEM_TYPE]);

                } else if (options.file) {
                    childRecord = twcFile.get(options.file.id);
                    childRecord.copyFromObject(options.file);
                } else {
                    throw new Error(`No Child Record Found in payload`)
                }


                return twcSrfUI.getSrfChildRecord(srf, childRecord, userInfo);
            },

            getSiteRequestInfo: (pageData) => {
                var srf = {};
                if (pageData.recId) {
                    srf = coreSQL.first(`select * from ${twcSrf.Type} where id = ${pageData.recId}`);
                    srf.siteId = srf[twcSrf.Fields.SITE];

                    if (!twcConfig.isUserAllowedCustomers(pageData.userInfo, srf[twcSrf.Fields.CUSTOMER])) {
                        throw new Error('You do not have access to see this SRF record');
                    }

                } else {
                    // this is a new SRF, if the logged in user is a customer then set the customer field
                    if (pageData.userInfo.isCustomer) { srf[twcSrf.Fields.CUSTOMER] = pageData.userInfo.id; }
                    srf[twcSrf.Fields.SITE] = pageData.siteId;
                }
                return srf;
            },

            getFile: (id) => {
                return coreSQL.first(`  
                    select id, ${twcFile.Fields.NAME}, ${twcFile.Fields.FILE} as file_id
                    from   ${twcFile.Type}
                    where   id = ${id}
                `)
            },

            saveSiteSrf: saveSiteSrf,
            renderSiteLocatorPanel: renderSiteLocatorPanel,

        }

    });