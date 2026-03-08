/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_site.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_utils.js', '../../data/oTWC_saf.js', '../../data/oTWC_safUI.js'],
    (core, coreSQL, recu, twcSite, twcConfig, twcIcons, twcUI, twcUtils, twcSaf, twcSafUI) => {



        function renderSiteAccessPanel(featureId) {

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
                                </div>
                                 <div>
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
            html = html.replace('{FILTER_CUSTOMER}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Customer', width: '50%', multiSelect: true, id: twcSaf.Fields.CUSTOMER, noEmpty: true, dataSource: twcUtils.getCustomers() }));
            html = html.replace('{FILTER_CONTRACTOR}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Contractor', width: '50%', multiSelect: true, id: twcSaf.Fields.PRIMARY_CONTRACTOR, noEmpty: true, dataSource: twcUtils.getCustomers() }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Counties', width: '50%', multiSelect: true, id: twcSaf.Fields.COUNTY, noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_REGION}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Region', width: '50%', multiSelect: true, id: twcSaf.Fields.REGION, noEmpty: true, dataSource: twcUtils.getRegions() }));
            html = html.replace('{FILTER_START_DATE}', twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'Start Date', id: 'twc-saf-start-date', width: '250px' }));
            html = html.replace('{FILTER_END_DATE}', twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'End Date', id: 'twc-saf-end-date', width: '250px' }));

            html = html.replace('{ACTION_CLEAR_FILTERS}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Clear Filters', id: 'twc-action-clear-filter' }));
            html = html.replace('{ACTION_NEW_SITE}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'New Site', id: 'twc-action-new-site' }));

            return html;
        }


        function getAllSafTimeBlocks(options) {
            var timeBlocks = {};
            coreSQL.each(`
                select  b.id, b.custrecord_twc_saf_tm_blk_block as block_id, BUILTIN.DF(b.custrecord_twc_saf_tm_blk_block) as block_name, TO_CHAR(b.custrecord_twc_saf_tm_blk_date, 'yyyy-MM-dd') as block_date,
                        saf.id as saf_id, saf.name as saf_code, saf.custrecord_twc_saf_site as site_id, BUILTIN.DF(saf.custrecord_twc_saf_site) as site_name
                from    customrecord_twc_saf_tm_blk b
                join    customrecord_twc_saf saf on saf.id = b.custrecord_twc_saf_tm_blk_saf
                where   saf.custrecord_twc_saf_site = ${options?.siteId || 0}
                order by b.custrecord_twc_saf_tm_blk_date desc
            `, tb => {
                if (!timeBlocks[tb.block_date]) {
                    timeBlocks[tb.block_date] = {};
                }
                if (!timeBlocks[tb.block_date][tb.saf_id]) {
                    timeBlocks[tb.block_date][tb.saf_id] = {
                        site: {
                            id: tb.site_id,
                            name: tb.site_name,
                        },
                        saf: {
                            id: tb.saf_id,
                            code: tb.saf_code
                        },
                        blocks:[]
                    }
                }
                timeBlocks[tb.block_date][tb.saf_id].blocks.push({
                    id: tb.id,
                    block: {
                        id: tb.block_id,
                        name: tb.block_name,
                    },
                    
                })

                // timeBlocks[tb.block_date].blocks.push({
                //     id: tb.id,
                //     site: {
                //         id: tb.site_id,
                //         name: tb.site_name,
                //     },
                //     saf: {
                //         id: tb.saf_id,
                //         code: tb.saf_code
                //     },
                //     block: {
                //         id: tb.block_id,
                //         name: tb.block_name,
                //     },

                // })
            })
            return timeBlocks;
        }



        return {
            getAllSafTimeBlocks: getAllSafTimeBlocks,
            getSiteAccessInfo: (pageData) => {
                var saf = {};
                if (pageData.recId) {
                    // @@TODO: this is an existing record so load it
                    saf = coreSQL.first(`select * from ${twcSaf.Type} where id = ${pageData.recId}`);
                    saf.siteId = saf[twcSaf.Fields.SITE];
                    
                } else {
                    // @@TODO: this is a new record for the given site id
                    if (pageData.userInfo.isCustomer) { saf[twcSaf.Fields.CUSTOMER] = pageData.userInfo.id; }
                    saf[twcSaf.Fields.SITE] = pageData.siteId;
                    saf.siteId = pageData.siteId;

                }
                return saf;
            },
            renderSiteAccessPanel: renderSiteAccessPanel,
            getSAFInfoPanels: twcSafUI.getSAFInfoPanels,

        }

    });