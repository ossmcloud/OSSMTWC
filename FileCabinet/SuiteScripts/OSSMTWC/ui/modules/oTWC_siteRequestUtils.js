
/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_utils.js', '../../data/oTWC_site.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../data/oTWC_srfUI.js', '../../data/oTWC_file.js', '../../O/oTWC_nsFileUtils.js', '../../data/oTWC_config.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_equipmentLib.js', '../../data/oTWC_equipAction.js', '../../data/oTWC_equipmentUI.js', '../../data/oTWC_equipment.js', '../../modules/oTWC_srfWorkflowEngine.js'],
    (core, coreSQL, recu, twcUtils, twcSite, twcSrf, twcSrfItem, twcSrfUI, twcFile, nsFileUtils, twcConfig, twcUI, twcEqLib, twcEqAct, twcEquipmentUI, twcEquipment, twcSrfWorkflowEngine) => {

        function getEquipment(options) {
            var fields = twcEquipmentUI.getInventoryTableFields();
            var fieldsSql = '';
            fields.map(f => { fieldsSql += `eq.${f.field}, ` });
            var sql = `
                    select  eq.id, ${fieldsSql}, 
                            ${twcEquipment.Fields.DESCRIPTION},  
                            ${twcEquipment.Fields.EQUIPMENT_TYPE}, BUILTIN.DF(${twcEquipment.Fields.EQUIPMENT_TYPE}) as ${twcEquipment.Fields.EQUIPMENT_TYPE}_name,

                            
                    from    ${twcEquipment.Type} eq
                    join   customrecord_twc_infra infra on infra.id = eq.custrecord_twc_equip_str
                    where  eq.custrecord_twc_equip_customer = ${options.customer}
                    and    eq.custrecord_twc_equip_class = ${options.eqClass}
                    and    infra.custrecord_twc_infra_site = ${options.site}
                    --and    eq.custrecordtwc_eq_install_status > ${twcUtils.EqInstallStatus.Draft}
                    order by eq.name
                `
            return coreSQL.run(sql);
        }
        function getEquipmentChildren(options) {
            var fields = twcEquipmentUI.getInventoryTableFields();
            var fieldsSql = '';
            fields.map(f => { fieldsSql += `eq.${f.field}, ` });
            var sql = `
                    select  eq.id as ${twcSrfItem.Fields.EQUIPMENT_ID}, eq.custrecord_twc_equip_parent_tme_id as ${twcSrfItem.Fields.TME_ID}, ${fieldsSql}, 
                            eq.${twcEquipment.Fields.EQUIPMENT_CLASS} as ${twcSrfItem.Fields.STEP_TYPE}, BUILTIN.DF(eq.${twcEquipment.Fields.EQUIPMENT_CLASS}) as ${twcSrfItem.Fields.STEP_TYPE}_name,
                            eq.${twcEquipment.Fields.EQUIPMENT_TYPE} as ${twcSrfItem.Fields.ITEM_TYPE},BUILTIN.DF(eq.${twcEquipment.Fields.EQUIPMENT_TYPE}) as ${twcSrfItem.Fields.ITEM_TYPE}_name,
                            eq.${twcEquipment.Fields.MAKE} ${twcSrfItem.Fields.MAKE},
                            eq.${twcEquipment.Fields.MODEL} as ${twcSrfItem.Fields.MODEL},
                            eq.${twcEquipment.Fields.DESCRIPTION} as ${twcSrfItem.Fields.DESCRIPTION},
                            eq.${twcEquipment.Fields.HEIGHT_ON_TOWER_M} as ${twcSrfItem.Fields.HEIGHT_ON_TOWER},
                            eq.${twcEquipment.Fields.LENGTH_MM} as ${twcSrfItem.Fields.LENGTH_MM},
                            eq.${twcEquipment.Fields.WIDTH_MM} as ${twcSrfItem.Fields.WIDTH_MM},
                            eq.${twcEquipment.Fields.HEIGHTDEPTH_MM} as ${twcSrfItem.Fields.DEPTH_MM},
                            eq.${twcEquipment.Fields.WEIGHT_KG} as ${twcSrfItem.Fields.WEIGHT_KG},
                            eq.${twcEquipment.Fields.INVENTORY_FLAG} as ${twcSrfItem.Fields.INVENTORY_FLAG},

                    from    ${twcEquipment.Type} eq
                    left join   customrecord_twc_infra infra on infra.id = eq.custrecord_twc_equip_str
                    where  eq.custrecord_twc_equip_parent_tme_id = ${options.eq}
                    order by eq.name
                `
            return coreSQL.run(sql);
        }

        function submitSiteSrf(userInfo, payload) {
            payload.profile = userInfo.profile;
            twcSrfWorkflowEngine.initWorkFlow(payload);
        }

        function saveSiteSrf(userInfo, payload) {
            // @@TODO: SRF: run validations on srf and srfItems records
            // @@TODO: SRF: error handling????

            var srfCancelled = false;

            var submitInfo = {};
            submitInfo[twcSrf.Type] = { id: payload.id, fields: [], values: [] };
            for (var k in payload) {
                if (k == 'id') { continue; }
                // @@NOTE: fields with '___' means they are linked record fields, we first update the site info, then the linked records
                var fieldPath = k.split('___');
                if (fieldPath.length == 1) {
                    submitInfo[twcSrf.Type].fields.push(k);
                    submitInfo[twcSrf.Type].values.push(payload[k])

                    if (k == twcSrf.Fields.SRF_STATUS) {
                        if (payload[k] == twcSrf.Status.SRFCancelled) {
                            srfCancelled = true;
                        }
                    }
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
            deleteSitesSrfItem(payload.items_deleted);
            deleteSitesSrfFile(payload);

            //
            saveSiteSrfItems(payload, payload[`items_${twcSrfItem.StepType.TME}`] || []);
            saveSiteSrfItems(payload, payload[`items_${twcSrfItem.StepType.ATME}`] || []);
            saveSiteSrfItems(payload, payload[`items_${twcSrfItem.StepType.GIE}`] || []);
            saveSiteSrfItems(payload, payload[`items_${twcSrfItem.StepType.FEEDER}`] || []);
            saveSiteSrfFile(payload);

            if (srfCancelled) {
                twcSrfWorkflowEngine.cancelWorkflow({ srf: payload.id });
            }

            return payload.id;

        }
        function saveSiteSrfItems(payload, items, parentItem) {
            core.array.each(items, item => {
                saveSiteSrfItem(item, payload, parentItem);
            })
            core.array.each(items, item => {
                saveEqActions(item, payload);
            });

            core.array.each(items, item => {
                if (item.relatedItems) {
                    saveSiteSrfItems(payload, item.relatedItems, item);
                }
                if (item.relatedItemsDelete) {
                    deleteSitesSrfItem(item.relatedItemsDelete);
                }
            })
        }

        function saveEqActions(item, payload) {
            try {
                // @@NOTE: equipment action are only created when the SRF Item is created
                //         this is because no value can be changed from the SRF form 
                //         when a draft SRF item is edited the request type cannot change 
                //         once submitted / workflow started it cannot be edited either, only status changes
                if (!item.isNew) { return; }

                var requestType = item[twcSrfItem.Fields.REQUEST_TYPE];
                var equipmentId = item[twcSrfItem.Fields.EQUIPMENT_ID] || item[twcSrfItem.Fields.TME_ID];
                saveEqAction(item, payload, equipmentId, (requestType == twcSrfItem.RequestType.SWAP) ? twcSrfItem.RequestType.REMOVE : requestType)
                // SWAP (REMOVE + INSTALL)
                if (requestType == twcSrfItem.RequestType.SWAP) { saveEqAction(item, payload, null, twcSrfItem.RequestType.INSTALL); }

            } catch (e) {
                log.error('Equip Action Save Failed', e);
                log.error('Equip Action Save Failed', e.stack);
            }
        }
        function saveEqAction(item, payload, equipmentId, requestType) {
            var eqAction = twcEqAct.get();
            eqAction.set(twcEqAct.Fields.EA_SRF, payload.id)
            eqAction.set(twcEqAct.Fields.EA_SRF_ITEM, item.id)
            eqAction.set(twcEqAct.Fields.EA_EQUIPMENT, equipmentId)
            eqAction.set(twcEqAct.Fields.EA_TYPE, requestType);
            eqAction.set(twcEqAct.Fields.EA_STATUS, twcUtils.EqActionStatus.Pending);
            eqAction.save();
        }


        function saveSiteSrfItem(item, payload, parentItem) {
            if (!item.dirty) { return; }

            if (parentItem) {
                item[twcSrfItem.Fields.TMI_ID_SRF] = parentItem.id;
            }

            var srfItem = twcSrfItem.get(item.id);
            srfItem.sRF = payload.id;
            srfItem.stepType = item[twcSrfItem.Fields.STEP_TYPE];
            for (var k in item) {
                if (k == 'name') { continue; }
                // @@IMPORTANT: field itemType is dependent on the stepType field
                //              when stepTypeField is set the itemType is reset since we set the step type above make sure we skip it from here
                if (k == twcSrfItem.Fields.STEP_TYPE) { continue; }
                if (!srfItem.hasField(k)) { continue; }
                srfItem.set(k, item[k])
            }
            if (!item.id) { item.isNew = true; }
            item.id = srfItem.save();


        }


        function deleteSitesSrfItem(items) {
            if (!items) { return; }
            core.array.each(items, item => {
                try {
                    if (item.relatedItems) { deleteSitesSrfItem(item.relatedItems); }
                    
                    // @@NOTE: Deleting Eq. Action record first to avoid dependency issue on SRF Item record.
                    var srfItemId = item.id;
                    if (!srfItemId) { return; }
                    var eqActions = coreSQL.run(`SELECT id FROM ${twcEqAct.Type} WHERE ${twcEqAct.Fields.EA_SRF_ITEM} = ${srfItemId} `);
                    core.array.each(eqActions, action => {
                        try {
                            recu.del(twcEqAct.Type, action.id);
                        } catch (eqErr) {
                            log.error('Failed Deleting Eq Action', eqErr.message);
                        }
                    });
                    recu.del(twcSrfItem.Type, srfItemId);
                } catch (e) {
                    log.error('Delete SRF Item Failed', e.message);
                    // @@TODO:
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

                if (!file[twcFile.Fields.R_TYPE]) {
                    file[twcFile.Fields.R_TYPE] = twcUtils.SrfDeafultFileType.id;
                    file[twcFile.Fields.STATUS] = twcUtils.SrfDeafultFileType.status;
                }
                if (!file[twcFile.Fields.REVISION]) { file[twcFile.Fields.REVISION] = 1; }


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


        function getAssignToEmployees(options) {
            return coreSQL.run(`
                select  id as value, entityid as text, custentity_twc_can_execute_pack as can_execute_pack
                from    employee
                where   isinactive = 'F'
                order by entityid
            `);
        }


        function deleteSrf(srfId) {

            coreSQL.each(`select id from customrecord_twc_eq_action where custrecord_twc_eq_action_srf = ${srfId}`, r => {
                recu.del('customrecord_twc_eq_action', r.id);
            })

            coreSQL.each(`select id from customrecord_twc_srf_itm where custrecord_twc_srf_itm_srf = ${srfId} order by id desc`, r => {
                recu.del('customrecord_twc_srf_itm', r.id);
            })

            // coreSQL.each(`select id from customrecord_twc_eq_action where custrecord_twc_eq_action_saf = ${safId}`, r => {
            //     recu.submit('customrecord_twc_eq_action', r.id, ['custrecord_twc_eq_action_saf', 'custrecord_twc_eq_action_sts'], [null, twcUtils.EqActionStatus.Pending]);
            // })


            recu.del('customrecord_twc_srf', srfId)
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

                    // @@NOTE: the "relatedItems" property exists if an ATME is being added to a new TME
                    childRecord.child = options.item.child;
                    childRecord.relatedItems = options.item.relatedItems;

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
                    if (!srf) { throw new Error(`No SRF found using id ${pageData.recId}`) }
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
            getEquipment: getEquipment,
            getEquipmentChildren: getEquipmentChildren,
            submitSiteSrf: submitSiteSrf,

            getAssignToEmployees: getAssignToEmployees,

            deleteSrf: deleteSrf

        }

    });