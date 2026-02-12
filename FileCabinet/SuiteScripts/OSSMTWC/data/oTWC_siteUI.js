/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields) => {

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
                { field: twcSite.Fields.SITE_LEVEL },
                { field: twcSite.Fields.HEIGHT_ASL_M },
                { field: twcSite.Fields.ADDRESS },
                { field: twcSite.Fields.ADDRESS_COUNTY },
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
            locations.fields.push({ id: twcSite.Fields.ADDRESS_COUNTY, label: 'County', lineBreak: true })
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

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getSitePanelFields_estates(dataSource) {
            var fieldGroup = { id: 'site-estates', title: 'Estates', collapsed: false, controls: [] };

            var basicInfo = { id: 'site-estates-title', title: 'Title', fields: [] };
            fieldGroup.controls.push(basicInfo);

            // @@TODO: this is just for test
            basicInfo.fields.push({ id: `${twcSite.Fields.SITE_LEVEL}.${twcSiteLevel.Fields.NAME}`, label: 'Site Level' })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_LEVEL, label: 'Site Level (2)' })

            basicInfo.fields.push({
                id: `${twcInfra.Type}`, label: 'Infrastructure',
                fields: {
                    [twcInfra.Fields.INFRASTRUCTURE_ID]: 'Infra Id',
                    [twcInfra.Fields.INFRASTRUCTURE_TYPE]: 'Type',
                    [twcInfra.Fields.STATUS]: 'Status',
                    [twcInfra.Fields.INFRASTRUCTURE_OWNERSHIP]: 'Ownership',
                    [twcInfra.Fields.STRUCTURE_TYPE]: 'Struct. Type',
                    [twcInfra.Fields.TOWER_FAMILY]: 'Family',
                },
                where: { [twcInfra.Fields.SITE]: dataSource.id }
            })


            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getSitePanelFields_assets(dataSource) {
            var fieldGroup = { id: 'site-assets', title: 'Assets', collapsed: true, controls: [] };

            var basicInfo = { id: 'site-assets-struct', title: 'Structure', fields: [] };
            fieldGroup.controls.push(basicInfo);

            basicInfo.fields.push({ id: twcSite.Fields.ADJACENT_GROUND_OWNER, label: 'Adiacent ground Owner' })
            basicInfo.fields.push({
                id: `${twcLock.Type}`, label: 'Locks',
                fields: { [twcLock.Fields.LOCK_ID]: 'Lock Id', [twcLock.Fields.LOCK_LOCATION_CATEGORY]: 'Category' },
                where: { [twcLock.Fields.SITE]: dataSource.id }
            })


            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }




        function getSiteInfoPanels(dataSource) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcSite.Type;

            var fieldGroups = [];
            fieldGroups.push(getSitePanelFields_summary(dataSource));
            fieldGroups.push(getSitePanelFields_estates(dataSource));
            fieldGroups.push(getSitePanelFields_assets(dataSource));
            // @@TODO: implement all required panels
            return fieldGroups;
        }

        return {
            getSiteTableFields: getSiteTableFields,
            getSiteMainInfoFields: getSiteMainInfoFields,
            getSiteInfoPanels: getSiteInfoPanels,
        }
    });

