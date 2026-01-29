/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_site.js', './oTWC_row.js', '../O/controls/oTWC_ui_ctrl.js'],
    (runtime, core, coreSQL, twcSite, twcRow, twcUI) => {

        var _fieldDefinitions = {};
        function getFieldDefinitions(tableName) {
            if (!_fieldDefinitions[tableName]) {
                _fieldDefinitions[tableName] = coreSQL.run(`
                    select      cf.fieldvaluetype as field_type, LOWER(cf.scriptid) as field_id, cf.name as field_label, lower(l.scriptid) as field_foreign_table
                    from        customfield cf
                    join        customrecordtype c on c.internalid = cf.recordtype
                    left join   customrecordtype l on l.internalid = cf.fieldvaluetyperecord
                    where       c.scriptid = UPPER('${tableName}')
                    order by id
                `);
            }
            return _fieldDefinitions[tableName];
        }


        function getSiteTableFields() {
            // @@TODO: this list of fields to display can be set by user
            // @@IMPORTANT: we should make sure some fields are there as they are needed by the ui:
            //      id, name
            //      lat/lng
            //      site address
            var siteFields = [
                { field: twcSite.Fields.SITE_ID },
                { field: twcSite.Fields.SITE_NAME },
                { field: twcSite.Fields.SITE_TYPE },
                { field: twcSite.Fields.HEIGHT_ASL_M },
                { field: twcSite.Fields.ADDRESS },
                { field: twcSite.Fields.COUNTY },
                { field: twcSite.Fields.PORTFOLIO },
                { field: twcSite.Fields.LATITUDE },
                { field: twcSite.Fields.LONGITUDE },
            ];
            return siteFields;
        }

        function getSiteMainInfoFields() {

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



        function getSitePanelFields_summary(dataSource) {
            var fieldGroup = { id: 'site-summary', title: 'Summary', collapsed: true, controls: [] };

            var basicInfo = { id: 'site-summary-basic', title: 'Basic Information', fields: [] };
            fieldGroup.controls.push(basicInfo);
            basicInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Site Code' })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_NAME, label: 'Site Name' })
            basicInfo.fields.push({ id: twcSite.Fields.ALIAS, label: 'Alias', lineBreak: true })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_TYPE, label: 'Site Type' })

            var locations = { id: 'site-summary-location', title: 'Location', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.ADDRESS, label: 'Address', width: '75%', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.COUNTY, label: 'County', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.EASTING, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING, label: 'Northing', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.LATITUDE, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE, label: 'Longitude' })
            // @@TODO: this is just a sample, remove later
            locations.fields.push({ id: 'site-directions', type: twcUI.CTRL_TYPE.BUTTON, label: '', value: 'Directions', lineBreak: true })
            


            var locations = { id: 'site-summary-access', title: 'Access Track / Safety Info', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.EASTING_ACCESS, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING_ACCESS, label: 'Northing', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.LATITUDE_ACCESS, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE_ACCESS, label: 'Longitude', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.DIRECTIONS, label: 'Directions', width: '75%', rows: 5, lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.INSTRUCTIONS, label: 'Instructions', width: '75%', rows: 5, lineBreak: true })

            formatPanelFields(dataSource || {}, fieldGroup);

            return fieldGroup;
        }

        function getSitePanelFields_estates(dataSource) {
            var fieldGroup = { id: 'site-estates', title: 'Estates', collapsed: true, controls: [] };

            var basicInfo = { id: 'site-estates-title', title: 'Title', fields: [] };
            fieldGroup.controls.push(basicInfo);

            basicInfo.fields.push({ id: `${twcSite.Fields.CURRENT_ROW}.${twcRow.Fields.ROW_TYPE}`, label: 'R.O.W. Type' })

            formatPanelFields(dataSource || {}, fieldGroup);

            return fieldGroup;
        }



        function formatPanelFields(dataSource, panelFields) {
            if (panelFields.controls) {
                core.array.each(panelFields.controls, control => { formatPanelFields(dataSource, control); })
                return;
            }

            var siteFields = getFieldDefinitions(twcSite.Type);
            if (!panelFields.controls) { panelFields.controls = []; }
            core.array.each(panelFields.fields, field => {
                if (field.type == twcUI.CTRL_TYPE.BUTTON) {
                    panelFields.controls.push(field)
                    return;
                }

                var fieldId = field.id; var dataField = null; var dataFields = null;
                if (field.id.indexOf('.') < 0) {
                    dataFields = getFieldDefinitions(twcSite.Type);

                } else {
                    // @@NOTE: in this case we have the field path (i.e.: foreignKeyFieldOnSiteTable.foreignTableFieldWeWant )
                    // @@REVIEW: we may need to have more than one jump (i.e.: foreignKeyFieldOnSiteTable.foreignKeyFieldOnForeignTable.foreignForeignTableFieldWeWant) the chain may be arbitrary long
                    fieldId = field.id.split('.')[1];
                    var fkField = field.id.split('.')[0];
                    var fkTable = siteFields.find(sf => { return sf.field_id == fkField })?.field_foreign_table;
                    // @@TODO: what ????
                    if (!fkTable) { return; }
                    dataFields = getFieldDefinitions(fkTable);

                }

                dataField = dataFields.find(sf => { return sf.field_id == fieldId });
                // @@TODO: what ????
                if (!dataField) { return; }

                var control = {
                    type: twcUI.nsTypeToCtrlType(dataField.field_type),
                    value: dataSource[fieldId],
                    id: fieldId
                };

                for (var k in field) {
                    if (k == 'type' || k == 'id') { continue; }
                    control[k] = field[k];
                }

                if (dataField.field_type == 'List/Record' || dataField.field_type == 'Multiple Select') {
                    control.dataSource = coreSQL.run(`select id as value, name as text from ${dataField.field_foreign_table} where isinactive = 'F' order by name`)
                    control.multiSelect = (dataField.field_type == 'Multiple Select');
                }

                panelFields.controls.push(control)

            })
        }


        return {
            getSiteTableFields: getSiteTableFields,
            getSiteMainInfoFields: getSiteMainInfoFields,
            getSitePanelFields_summary: getSitePanelFields_summary,
            getSitePanelFields_estates: getSitePanelFields_estates
        }
    });

