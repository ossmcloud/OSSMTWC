/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_site.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSQL, twcSite, twcConfig, twcIcons, twcUI) => {


        function getSiteInfo(siteId) {
            if (!siteId) { throw new Error('No site id provided!'); }

            var siteInfo = coreSQL.first({
                query: `select * from ${twcSite.Type} where id = ?`,
                params: [siteId]
            })

            var mainFields = getMainInfoFields();

            return {
                site: siteInfo,
                mainFields: mainFields,
            };
        }

        function getMainInfoFields() {

            var mainInfoFieldGroups = [];

            var overview = { id: 'site-overview', title: 'Overview', fields: [] };
            overview.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Site Code' })
            overview.fields.push({ id: twcSite.Fields.SITE_NAME, label: 'Site Name' })
            overview.fields.push({ id: twcSite.Fields.SITE_TYPE, label: 'Site Type' })
            // @@TODO: Site Info :: Structure Type
            //                   :: Structure Height
            overview.fields.push({ id: twcSite.Fields.HEIGHT_ASL_M, label: 'Height ASL' })
            mainInfoFieldGroups.push(overview);

            var location = { id: 'site-location', title: 'Location', fields: [] };
            location.fields.push({ id: twcSite.Fields.ADDRESS, label: 'Address' })
            location.fields.push({ id: twcSite.Fields.COUNTY, label: 'County' })
            // @@TODO: Site Info :: Region
            location.fields.push({ id: twcSite.Fields.EASTING, label: 'Easting' })
            location.fields.push({ id: twcSite.Fields.NORTHING, label: 'Northing' })
            location.fields.push({ id: twcSite.Fields.LATITUDE, label: 'Latitude' })
            location.fields.push({ id: twcSite.Fields.LONGITUDE, label: 'Longitude' })
            mainInfoFieldGroups.push(location);

            var access = { id: 'site-access', title: 'Access', fields: [] };
            access.fields.push({ id: twcSite.Fields.EASTING_ACCESS, label: 'Easting' })
            access.fields.push({ id: twcSite.Fields.NORTHING_ACCESS, label: 'Northing' })
            access.fields.push({ id: twcSite.Fields.LATITUDE_ACCESS, label: 'Latitude' })
            access.fields.push({ id: twcSite.Fields.LONGITUDE_ACCESS, label: 'Longitude' })
            access.fields.push({ id: twcSite.Fields.DIRECTIONS, label: 'Directions' })
            access.fields.push({ id: twcSite.Fields.INSTRUCTIONS, label: 'Instructions' })

            mainInfoFieldGroups.push(access);

            return mainInfoFieldGroups;
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
                        <div style="position: sticky; top: 0px; z-index: 99999; background-color: var(--main-bkgd-color);">
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














        var _siteFields = null;

        function getSiteFields() {
            if (!_siteFields) {
                _siteFields = twcSite.getFields();
            }
            return _siteFields;
        }

        function getPanelFields_summary(dataSource) {
            var fieldGroup = { id: 'site-summary', title: 'Summary', collapsed: true, controls: [] };

            var basicInfo = { id: 'site-summary-basic', title: 'Basic Information', fields: [] };
            fieldGroup.controls.push(basicInfo);
            basicInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Site Code' })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_NAME, label: 'Site Name' })
            basicInfo.fields.push({ id: twcSite.Fields.ALIAS, label: 'Alias',  lineBreak: true })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_TYPE, label: 'Site Type' })

            var locations = { id: 'site-summary-location', title: 'Location', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.ADDRESS, label: 'Address', width: '75%', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.COUNTY, label: 'County', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.EASTING, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING, label: 'Northing', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.LATITUDE, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE, label: 'Longitude', lineBreak: true })


            var locations = { id: 'site-summary-access', title: 'Access Track / Safety Info', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.EASTING_ACCESS, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING_ACCESS, label: 'Northing', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.LATITUDE_ACCESS, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE_ACCESS, label: 'Longitude', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.DIRECTIONS, label: 'Directions', width: '75%', rows: 5, lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.INSTRUCTIONS, label: 'Instructions', width: '75%', rows: 5, lineBreak: true })

            getPanel(dataSource, fieldGroup);

            return fieldGroup;
        }


        function getPanel(dataSource, panelFields) {
            if (panelFields.controls) {
                core.array.each(panelFields.controls, control => { getPanel(dataSource, control); })
                return;
            }

            var siteFields = getSiteFields();
            if (!panelFields.controls) { panelFields.controls = []; }
            core.array.each(panelFields.fields, field => {
                var siteField = siteFields.find(sf => { return sf.field_id == field.id });
                // @@TODO: what ????
                if (!siteField) { return; }

                var control = {
                    type: twcUI.nsTypeToCtrlType(siteField.field_type),
                    value: dataSource[field.id],
                };

                for (var k in field) {
                    if (k == 'type') { continue; }
                    control[k] = field[k];
                }

                if (siteField.field_type == 'List/Record' || siteField.field_type == 'Multiple Select') {
                    control.dataSource = coreSQL.run(`select id as value, name as text from ${siteField.field_foreign_table} where isinactive = 'F' order by name`)
                    control.multiSelect = (siteField.field_type == 'Multiple Select');
                }

                panelFields.controls.push(control)

            })
        }




        return {
            getSiteInfo: getSiteInfo,
            getMainInfoFields, getMainInfoFields,
            renderMainFields: renderMainFields,
            renderInfoPanel: renderInfoPanel,


            getPanelFields_summary: getPanelFields_summary
        }
    });
