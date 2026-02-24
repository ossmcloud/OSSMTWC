/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_site.js', '../../data/oTWC_utils.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_siteUI.js', '../../data/oTWC_infrastructure.js'],
    (core, coreSQL, recu, twcSite, twcUtils, twcConfig, twcIcons, twcUI, twcSiteUI, twcInfra) => {


        function getSiteInfo(siteId) {
            if (!siteId) { throw new Error('No site id provided!'); }

            // @@TODO: move to rec.custom.js

            var siteFields = twcSite.getFields();

            var joinTables = [];
            core.array.each(siteFields, f => {
                if (f.field_type != 'List/Record') { return; }
                joinTables.push(f.field_foreign_table);
            })

            var foreignFields = twcUtils.getFields(joinTables);

            var joins = ''; var selectList = 's.id, ';
            core.array.each(siteFields, f => {
                selectList += `s.${f.field_id}, `
                if (f.field_type != 'List/Record') { return; }

                var tblAlias = f.field_foreign_table.replace('customrecord_', '');
                selectList += `BUILTIN.DF(s.${f.field_id}) as ${f.field_id}_name, `

                var foreignTableFields = foreignFields.filter(ff => { return ff.table_name == f.field_foreign_table; })
                core.array.each(foreignTableFields, ff => {
                    if (!ff.field_id.startsWith('cust')) { return; }
                    selectList += `${ff.field_id}, `
                })

                joins += `
                    left join ${f.field_foreign_table} as ${tblAlias} on ${tblAlias}.id = s.${f.field_id}
                `
            })

            var siteInfo = coreSQL.first({
                query: `
                    select  ${selectList}
                    from    ${twcSite.Type} s
                    ${joins}
                    where   s.id = ?
                `,
                params: [siteId]
            })

            var mainFields = twcSiteUI.getSiteMainInfoFields();

            core.array.each(mainFields, mfg => {
                core.array.each(mfg.fields, mf => {
                    if (mf.childTable) {
                        siteInfo[mf.id] = '';

                        var url = core.url.record(mf.childTable.table)
                        var fields = '';
                        if (mf.childTable.fields) {
                            core.array.each(mf.childTable.fields, mff => {
                                fields += mff.isForeignKey ? `BUILTIN.DF(${mff.id}) as ${mff.id}, ` : `${mff.id}, `;
                            })
                        } else {
                            fields = mf.childTable.isForeignKey ? `BUILTIN.DF(${mf.id}) as ${mf.id}` : `${mf.id}`;
                        }

                        coreSQL.each(`select id, ${fields} from ${mf.childTable.table} where ${mf.childTable.siteField} = ${siteId}`, childRecord => {
                            var fieldValue = childRecord[mf.id];
                            if (mf.childTable.mask) {
                                fieldValue = mf.childTable.mask;
                                core.array.each(mf.childTable.fields, mff => {
                                    var value = childRecord[mff.id];
                                    if (value === null || value === undefined) {
                                        value = mff.nullText;
                                    } else {
                                        if (mff.mask) {
                                            value = mff.mask.replaceAll(mff.id, value)
                                        }
                                    }
                                    fieldValue = fieldValue.replaceAll(mff.id, value);
                                });
                            }
                            siteInfo[mf.id] += `<a href="${url}&id=${childRecord.id}" target="_blank">${fieldValue}</a><br />`;
                        })
                    }
                })
            })


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
                    var value = siteInfo.site[field.id];
                    // @@NOTE: if we have same field name as _name then use it as the field.id would just get the internal id
                    if (siteInfo.site[field.id + '_name'] !== undefined) { value = siteInfo.site[field.id + '_name'] }

                    fieldGroupHtml += `
                        <div>
                            <div style="width: 20%;">
                                <label>${field.label}</label>
                            </div>
                            <div>
                                ${value || '---'}
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
                            <span class="twc-wait-cursor" style="margin-top: calc((250px - 64px) / 2);">
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
            // @@NOTE: @@REVIEW: this routine could be generalised to be used with different record types, not only twcSite

            var submitInfo = {};
            submitInfo[twcSite.Type] = { id: payload.id, fields: [], values: [] };

            for (var k in payload) {
                if (k == 'id') { continue; }
                // @@NOTE: fields with '___' means they are linked record fields, we first update the site info, then the linked records
                var fieldPath = k.split('___');
                if (fieldPath.length == 1) {
                    submitInfo[twcSite.Type].fields.push(k);
                    submitInfo[twcSite.Type].values.push(payload[k])
                }
            }

            recu.submit(twcSite.Type, payload.id, submitInfo[twcSite.Type].fields, submitInfo[twcSite.Type].values);

            // @@NOTE: now we load the linked record fields changes into submitInfo object as we could have more than one
            var siteFields = twcSite.getFields();
            var site = twcSite.get(payload.id);
            for (var k in payload) {
                if (k == 'id') { continue; }
                var fieldPath = k.split('___');
                if (fieldPath.length > 1) {
                    var siteField = siteFields.find(sf => { return sf.field_id == fieldPath[0]; })
                    if (!siteField || !siteField.field_foreign_table) {
                        // @@TODO: this should not happen really ???
                    } else {
                        // @@NOTE: @@IMPORTANT: we use fieldPath[0] as object property and NOT siteField.field_foreign_table because we could have more than one field linking to the same record type
                        if (!submitInfo[fieldPath[0]]) {
                            submitInfo[fieldPath[0]] = { id: site.get(fieldPath[0]), type: siteField.field_foreign_table, fields: [], values: [] };
                        }
                        submitInfo[fieldPath[0]].fields.push(fieldPath[1]);
                        submitInfo[fieldPath[0]].values.push(payload[k])
                    }
                }
            }


            var errors = [];
            for (var recType in submitInfo) {
                if (recType == twcSite.Type) { continue; }
                try {
                    recu.submit(submitInfo[recType].type, submitInfo[recType].id, submitInfo[recType].fields, submitInfo[recType].values);
                } catch (error) {
                    core.logError('SAVE-SITE-INFO', `${JSON.stringify(submitInfo[recType])}: ${error.message}`);
                    submitInfo[recType].error = error.message;
                    errors.push(submitInfo[recType])
                }

            }

            // @@TODO: better error message
            if (errors.length > 0) { throw new Error(JSON.stringify(errors)); }
        }














        return {
            getSiteInfo: getSiteInfo,
            renderMainFields: renderMainFields,
            renderInfoPanel: renderInfoPanel,

            saveSiteInfo: saveSiteInfo,

            getSiteInfoPanels: twcSiteUI.getSiteInfoPanels,

        }
    });
