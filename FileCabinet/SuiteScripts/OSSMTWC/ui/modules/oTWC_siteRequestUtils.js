/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_utils.js', '../../data/oTWC_site.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../data/oTWC_srfUI.js', '../../data/oTWC_file.js', '../../O/oTWC_nsFileUtils.js','../../data/oTWC_config.js','../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSQL, recu, twcUtils, twcSite, twcSrf, twcSrfItem, twcSrfUI, twcFile, nsFileUtils,twcConfig,twcUI) => {

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
        }
        function deleteSitesSrfItem(payload) {
            if (!payload.items_deleted) { return; }
            core.array.each(payload.items_deleted, item => {
                recu.del(twcSrfItem.Type, item.id);
            })
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
                                    {FILTER_SITE_LEVEL}
                                </div>
                                <div>
                                    {FILTER_COUNTIES}
                                </div>
                                <div>
                                    {FILTER_REGION}
                                </div>
                                <div>
                                    {FILTER_PORTFOLIO}
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
                                    {ACTION_NEW_SITE}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            html = html.replace('{FILTER_NAME}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Name', width: '75%', id: 'record_id', noEmpty: true, dataSource: twcUtils.getSiteNames() }));
            html = html.replace('{FILTER_SRF_ID}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'SRF ID', width: 'calc(25% - 2px)', multiSelect: true, id: twcSite.Fields.SITE_TYPE, noEmpty: true, dataSource: twcUtils.getSrfIds() }));
            html = html.replace('{FILTER_SRF_STATUS}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'SRF STATUS', width: 'calc(25% - 2px)', multiSelect: true, id: twcSite.Fields.SITE_LEVEL, noEmpty: true, dataSource: twcUtils.getSrfStatus() }));
            html = html.replace('{FILTER_SITE_TYPE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site Type', width: 'calc(25% - 2px)', multiSelect: true, id: twcSite.Fields.SITE_TYPE, noEmpty: true, dataSource: twcUtils.getSiteTypes() }));
            html = html.replace('{FILTER_SITE_LEVEL}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site Level', width: 'calc(25% - 2px)', multiSelect: true, id: twcSite.Fields.SITE_LEVEL, noEmpty: true, dataSource: twcUtils.getSiteLevels() }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'County', width: '50%', multiSelect: true, id: twcSite.Fields.COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_REGION}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Region', width: '50%', multiSelect: true, id: twcSite.Fields.REGION, noEmpty: true, dataSource: twcUtils.getRegions() }));
            html = html.replace('{FILTER_PORTFOLIO}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Portfolio', width: '50%', multiSelect: true, id: twcSite.Fields.PORTFOLIO, noEmpty: true, dataSource: twcUtils.getPortfolios() }));

            html = html.replace('{FILTER_LAT}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Latitude', id: 'twc-coord-latitude', width: '250px' }));
            html = html.replace('{FILTER_LNG}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Longitude', id: 'twc-coord-longitude', width: '250px' }));
            html = html.replace('{FILTER_RADIUS}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Radius (Km)', id: 'twc-coord-radius', value: 5, width: '75px', min: 5, max: 300 }));

            html = html.replace('{ACTION_CLEAR_FILTERS}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Clear Filters', id: 'twc-action-clear-filter' }));
            html = html.replace('{ACTION_NEW_SITE}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'New Site', id: 'twc-action-new-site' }));

            return html;
        }

        return {

            getSRFInfoPanels: twcSrfUI.getSRFInfoPanels,
            getSrfChildRecord: (options) => {
                var srf = twcSrf.get(options.srf.id);
                srf.copyFromObject(options.srf);
                var childRecord = null;
                if (options.item) {
                    childRecord = twcSrfItem.get(options.item.id);
                } else if (options.file) {
                    childRecord = twcFile.get(options.file.id);

                } else {
                    throw new Error(`No Child Record Found in payload`)
                }

                childRecord.copyFromObject(options.item);
                return twcSrfUI.getSrfChildRecord(srf, childRecord);
            },

            getSiteRequestInfo: (pageData) => {
                var srf = {};
                if (pageData.recId) {
                    srf = coreSQL.first(`select * from ${twcSrf.Type} where id = ${pageData.recId}`);
                    srf.siteId = srf[twcSrf.Fields.SITE];
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
            renderSiteLocatorPanel:renderSiteLocatorPanel
        }

    });