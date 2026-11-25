/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_utils.js', '../../data/oTWC_sds.js', '../../data/oTWC_site.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_config.js', './oTWC_siteLocatorUtils.js'],
    (core, coreSQL, twcUtils, twcSds, twcSite, twcUI, twcConfig, twcSiteLocatorUtils) => {

        // @@NOTE: SDS Files locator: list of the SDS that have a generated PDF (any status)
        //         @@IMPORTANT: ONLY the SDS of the company of the logged in profile are returned (nobody, employees included, sees other companies' SDS)
        //                      the feature itself is restricted to customers (configs { "restrict": "customer" } on 'OSSMTWC - Role Feature List', oTWC_permissions.js: applyRestrictions)
        //         row field names follow the site locator panel conventions (oTWC_siteLocatorPanel.js):
        //              site_id   => links the row to the map site
        //              cust...   => filterable fields (filter control id = row field name)
        function getSdsFiles(options, userInfo) {
            // @@NOTE: if the profile has no company nothing is shown
            var whereClause = `where sds.${twcSds.Fields.PDF} is not null and sds.${twcSds.Fields.CUSTOMER} = ${parseInt(userInfo.companyProfile?.id) || 0} `;

            var sdsFiles = coreSQL.run(`
                select  sds.id, sds.id as record_id, sds.name,
                        sds.${twcSds.Fields.PDF} as twc_file,
                        sds.${twcSds.Fields.SITE} as site_id, BUILTIN.DF(sds.${twcSds.Fields.SITE}) as site_id_text,
                        sds.${twcSds.Fields.SRF} as srf_id, BUILTIN.DF(sds.${twcSds.Fields.SRF}) as srf_id_text,
                        sds.${twcSds.Fields.CUSTOMER} as ${twcSds.Fields.CUSTOMER}, BUILTIN.DF(sds.${twcSds.Fields.CUSTOMER}) as ${twcSds.Fields.CUSTOMER}_text,
                        sds.${twcSds.Fields.STATUS} as ${twcSds.Fields.STATUS}, BUILTIN.DF(sds.${twcSds.Fields.STATUS}) as ${twcSds.Fields.STATUS}_text,
                        site.${twcSite.Fields.ADDRESS_COUNTY} as ${twcSite.Fields.ADDRESS_COUNTY}, BUILTIN.DF(site.${twcSite.Fields.ADDRESS_COUNTY}) as ${twcSite.Fields.ADDRESS_COUNTY}_text,
                        TO_CHAR(sds.${twcSds.Fields.COMMENCMENT_DATE}, 'yyyy-MM-dd') as commencement_date,
                        TO_CHAR(sds.created, 'yyyy-MM-dd') as created_date,
                        TO_CHAR(sds.created, 'DD-MM-YYYY') as created_date_dl,
                        site.${twcSite.Fields.SITE_NAME} as site_name_dl
                from    ${twcSds.Type} sds
                join    ${twcSite.Type} site on site.id = sds.${twcSds.Fields.SITE}
                ${whereClause}
                order by sds.created desc
            `);

            // @@NOTE: name of the downloaded PDF ('Download' link), see oTWC_sds.js: getPdfFileName
            core.array.each(sdsFiles, sds => {
                sds.download_name = twcSds.getPdfFileName(sds.site_name_dl, sds[`${twcSds.Fields.CUSTOMER}_text`], sds.name, sds.created_date_dl);
                delete sds.created_date_dl;
                delete sds.site_name_dl;
            });

            return {
                sdsFiles: sdsFiles,
                sites: twcSiteLocatorUtils.getSites(options, userInfo).sites
            }
        }

        function renderSdsFilesPanel(userInfo) {
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
                            <h3 class="twc">SDS Files</h3>
                            <div class="twc-div-table-r">
                                <div>
                                    {FILTER_SITE}
                                    {FILTER_STATUS}
                                </div>
                                <div>
                                    {FILTER_CUSTOMER}
                                    {FILTER_COUNTIES}
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
                                </div>
                            </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            html = html.replace('{FILTER_SITE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site', width: '50%', id: 'site_id', noEmpty: true, dataSource: twcUtils.getSiteNames(userInfo) }));
            var sdsStatuses = coreSQL.run(`select id as value, name as text from customrecord_twc_sds_status where isinactive = 'F' order by id`);
            html = html.replace('{FILTER_STATUS}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Status', width: 'calc(50% - 5px)', multiSelect: true, id: twcSds.Fields.STATUS, noEmpty: true, dataSource: sdsStatuses }));
            // @@NOTE: only the logged in profile's company SDS are listed (see getSdsFiles), no customer filter
            html = html.replace('{FILTER_CUSTOMER}', '');
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Counties', width: '50%', multiSelect: true, id: twcSite.Fields.ADDRESS_COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_LAT}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Latitude', id: 'twc-coord-latitude', width: '250px' }));
            html = html.replace('{FILTER_LNG}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Longitude', id: 'twc-coord-longitude', width: '250px' }));
            html = html.replace('{FILTER_RADIUS}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Radius (km)s', id: 'twc-coord-radius' }));
            html = html.replace('{ACTION_CLEAR_FILTERS}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Clear Filters', id: 'twc-action-clear-filter' }));

            return html;
        }

        return {
            getSdsFiles: getSdsFiles,
            renderSdsFilesPanel: renderSdsFilesPanel,
        }
    });
