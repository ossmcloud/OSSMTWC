/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_site.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_configUIFields.js'],
    (core, coreSQL, recu, twcSite, twcConfig, twcIcons, twcUI, twcConfigUIFields) => {


        function getSiteInfo(siteId) {
            if (!siteId) { throw new Error('No site id provided!'); }

            // @@TODO: find a more dynamic way to do this

            var siteFields = twcSite.getFields();
            var joins = '';
            core.array.each(siteFields, f => {
                if (f.field_type != 'List/Record') { return; }
                var tblAlias = f.field_foreign_table.replace('customrecord_', '');
                joins += `
                    left join ${f.field_foreign_table} as ${tblAlias} on ${tblAlias}.id = s.${f.field_id}
                `
            })

            var siteInfo = coreSQL.first({
                query: `
                    select  *
                    from    ${twcSite.Type} s
                    ${joins}
                    where   s.id = ?
                `,
                params: [siteId]
            })
            var mainFields = twcConfigUIFields.getSiteMainInfoFields();
            return {
                site: siteInfo,
                mainFields: mainFields,
            };
        }

        function renderMainFields(siteInfo) {
            var mainInfoHtml = `<div>`;
            core.array.each(siteInfo.mainFields, fieldGroup => {
                var fieldGroupHtml = `
                    <div>
                        <h2 class="twc">${fieldGroup.title}</h2>
                        <div class="twc-div-table-r twc-div-table-r-compact">
                `;

                core.array.each(fieldGroup.fields, field => {
                    fieldGroupHtml += `
                        <div>
                            <div style="width: 20%;">
                                <label>${field.label}</label>
                            </div>
                            <div>
                                ${siteInfo.site[field.id] || '---'}
                            </div>
                        </div>
                    `
                })

                fieldGroupHtml += `</div></div>`;
                mainInfoHtml += fieldGroupHtml;
            });
            mainInfoHtml += `</div>`;
            return mainInfoHtml;
        }

        function renderInfoPanel(siteInfo) {
            var html = `
                <script async defer src="https://maps.googleapis.com/maps/api/js?key=${twcConfig.cfg().GOOGLE_API_KEY}&loading=async"></script>
                <div style="width: 20%; min-width: 450px; border: 1px solid var(--grid-color);">
                    <div id="twc-site-info-panel" style="overflow: auto;">
                        <div style="position: sticky; top: 0px; z-index: 1099; background-color: var(--main-bkgd-color);">
                            <h1>{SITE_NAME}</h1>
                        </div>

                        <div id="twc-google-map-container" class="twc-border" style="height: 250px; width: 100%; text-align: center;">
                            <span class="twc-wait-cursor">
                                ${twcIcons.ICONS.waitWheel}
                            </span>
                        </div>

                        <div>
                            {SITE_MAIN_INFO}
                        </div>
                    </div>
                </div>
                <script>
                    jQuery('#twc-site-info-panel').height(jQuery('.twc-container-outer').height() - 14)
                </script>
            `
            html = html.replaceAll('{SITE_NAME}', `${siteInfo.site.name}`)
            html = html.replaceAll('{SITE_MAIN_INFO}', `${renderMainFields(siteInfo)}`)

            return html;
        }


        function saveSiteInfo(payload) {
            // @@TODO: we need to cater for data changed on a linked table
            //          call twcConfigUIFields.getSiteInfoPanels (no data source)
            //          this way we detect linked tables
            var submitFields = []; var submitValues = [];
            for (var k in payload) {
                if (k == 'id') { continue; }
                submitFields.push(k);
                submitValues.push(payload[k])
            }
            recu.submit(twcSite.Type, payload.id, submitFields, submitValues);
        }














        return {
            getSiteInfo: getSiteInfo,
            renderMainFields: renderMainFields,
            renderInfoPanel: renderInfoPanel,

            saveSiteInfo: saveSiteInfo,

            getSiteInfoPanels: twcConfigUIFields.getSiteInfoPanels,

        }
    });
