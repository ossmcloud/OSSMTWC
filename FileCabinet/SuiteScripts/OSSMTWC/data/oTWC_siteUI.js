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
            overview.fields.push({ id: twcInfra.Fields.STRUCTURE_TYPE, label: 'Structure' })  //new
            overview.fields.push({ id: twcInfra.Fields.STRUCTURE_HEIGHT_M, label: 'Height (m)' })  //new
            overview.fields.push({ id: twcSite.Fields.HEIGHT_ASL_M, label: 'Height ASL' })
             
            mainInfoFieldGroups.push(overview);

            var location = { id: 'site-location', title: 'Location', fields: [] };
            location.fields.push({ id: twcSite.Fields.ADDRESS, label: 'Address' })
            location.fields.push({ id: twcSite.Fields.COUNTY, label: 'County' })
            // @@TODO: Site Info :: Region
            location.fields.push({ id: twcSite.Fields.ADDRESS_REGION, label: 'Region' })  //new

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
            basicInfo.fields.push({ id: twcSite.Fields.SITE_TYPE, label: 'Site Type', lineBreak: true}) //added line break

             basicInfo.fields.push({ id: twcInfra.Fields.STRUCTURE_TYPE, label: 'Structure Type' }) //new
             basicInfo.fields.push({ id: twcInfra.Fields.STRUCTURE_HEIGHT_M, label: 'Height (m)' })  //new
             basicInfo.fields.push({ id: twcInfra.Fields.ROOFTOP_HEIGHT_M, label: 'Height Rooftop', lineBreak: true }) //new
             basicInfo.fields.push({ id: twcSite.Fields.HEIGHT_ASL_M, label: 'Height ASL' }) //new

            // basicInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'TC Building/Cabin' }) //new
           // basicInfo.fields.push({ id: twcSite.Fields.SITE_NAME, label: 'Indoor Accommodation' }) //new

             basicInfo.fields.push({ id: twcSite.Fields.SITE_LEVEL, label: 'Site Level', lineBreak: true }) //new
             basicInfo.fields.push({ id: twcSite.Fields.PORTFOLIO, label: 'Portfolio' }) //new
             basicInfo.fields.push({ id: twcSite.Fields.SAF_AUTO_APPROVE, label: 'SAF Auto Approve' }) //new
            // basicInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Public' }) //new
           

            var structures = { id: 'site-summary-structure', title: 'Structure', fields: [] };  //new
            fieldGroup.controls.push(structures);  //new
            structures.fields.push({ id: twcInfra.Fields.STRUCTURE_TYPE, label: 'Structure Type', width: '75%', lineBreak: true })  //new
            structures.fields.push({ id: twcInfra.Fields.STRUCTURE_HEIGHT_M, label: 'Height (m)', lineBreak: true })  //new
            structures.fields.push({ id:  twcInfra.Fields.ROOFTOP_HEIGHT_M, label: 'Height Rooftop' })  //new
            structures.fields.push({ id: twcSite.Fields.HEIGHT_ASL_M, label: 'Height ASL', lineBreak: true })  //new
           // structures.fields.push({ id: twcSite.Fields.LATITUDE, label: 'Fall Arrest' })



            var locations = { id: 'site-summary-location', title: 'Location', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.ADDRESS, label: 'Address', width: '75%', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.ADDRESS_COUNTY, label: 'County', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.ADDRESS_REGION, label: 'Region' }) //new
            locations.fields.push({ id: twcSite.Fields.EASTING, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING, label: 'Northing', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.LATITUDE, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE, label: 'Longitude' })
            // @@TODO: this is just a sample, remove later
            locations.fields.push({ id: 'site-directions', type: twcUI.CTRL_TYPE.BUTTON, label: '', value: 'Directions', lineBreak: true })

            var locations = { id: 'site-summary-access', title: 'Access Track / Safety Info', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.TRACK_TYPE, label: 'Track Type' })  //New
            locations.fields.push({ id: twcSite.Fields.EASTING_ACCESS, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING_ACCESS, label: 'Northing', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.LATITUDE_ACCESS, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE_ACCESS, label: 'Longitude', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.DIRECTIONS, label: 'Directions', width: '75%', rows: 5, lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.INSTRUCTIONS, label: 'Instructions', width: '75%', rows: 5, lineBreak: true })

              locations.fields.push({ id: twcSite.Fields.TENANT_CARD_REQUIRED, label: 'Tenant Card Required' })  //New
            //locations.fields.push({ id: twcSite.Fields.LONGITUDE_ACCESS, label: 'Dual Lock Installed', lineBreak: true })  //New
             locations.fields.push({ id: twcSite.Fields.FOURX4_REQUIRED, label: '4x4 Required', lineBreak: true })  //New
             locations.fields.push({ id: twcSite.Fields.PARKING_RESTRICTIONS, label: 'Parking Restrictions', width: '50%', lineBreak: true })  //New
            locations.fields.push({ id: twcSite.Fields.CRANEMEWP_ACCESS, label: 'Crane/Mewp Access', lineBreak: true })  //New
            locations.fields.push({ id: twcInfra.Fields.FALL_ARREST_TYPE, label: 'Fall Arrest Type',  lineBreak: true })  //New
             locations.fields.push({ id: twcSite.Fields.SAFETY__SPECIAL_NOTES, label: 'Safety / Special Notes',width: '50%',  lineBreak: true })  //New

           
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
                id: `${twcInfra.Type}`, label: 'Site Infrastructure',
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

