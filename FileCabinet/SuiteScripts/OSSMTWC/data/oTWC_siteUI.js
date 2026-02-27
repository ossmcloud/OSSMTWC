/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js','./oTWC_powerSupply.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow,twcPowerSupply) => {

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
            overview.fields.push({
                id: twcInfra.Fields.STRUCTURE_TYPE,
                childTable: {
                    table: twcInfra.Type, siteField: twcInfra.Fields.SITE,
                    fields: [
                        { id: twcInfra.Fields.INFRASTRUCTURE_TYPE, isForeignKey: true, nullText: 'no type' },
                        { id: twcInfra.Fields.STRUCTURE_TYPE, isForeignKey: true, nullText: 'no struct type' },
                        { id: twcInfra.Fields.STRUCTURE_HEIGHT_M, nullText: '', mask: `<span style="color: var(--accent-fore-color);">(${twcInfra.Fields.STRUCTURE_HEIGHT_M}m)</span>` },
                    ],
                    mask: `[${twcInfra.Fields.INFRASTRUCTURE_TYPE}] <b>${twcInfra.Fields.STRUCTURE_TYPE}</b> ${twcInfra.Fields.STRUCTURE_HEIGHT_M}`
                },
                label: 'Structure'
            })
            overview.fields.push({ id: twcSite.Fields.HEIGHT_ASL_M, label: 'Height ASL' })
            mainInfoFieldGroups.push(overview);

            var location = { id: 'site-location', title: 'Location', fields: [] };
            location.fields.push({ id: twcSite.Fields.ADDRESS, label: 'Address' })
            location.fields.push({ id: twcSite.Fields.ADDRESS_COUNTY, label: 'County' })
            location.fields.push({ id: twcSite.Fields.ADDRESS_REGION, label: 'Region' })

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
            var fieldGroup = { id: 'site-summary', title: 'Summary', collapsed: false, controls: [] };

            var basicInfo = { id: 'site-summary-basic', title: 'Basic Information', fields: [] };
            fieldGroup.controls.push(basicInfo);
            basicInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Site Code' })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_NAME, label: 'Site Name' })
            basicInfo.fields.push({ id: twcSite.Fields.ALIAS, label: 'Alias', lineBreak: true })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_LEVEL, label: 'Site Level' })
            basicInfo.fields.push({ id: twcSite.Fields.SITE_TYPE, label: 'Site Type' }) //added line break           
            basicInfo.fields.push({ id: twcSite.Fields.PORTFOLIO, label: 'Portfolio', lineBreak: true }) //new
            basicInfo.fields.push({ id: twcSite.Fields.SAF_AUTO_APPROVE, label: 'SAF Auto Approve' }) //new
            basicInfo.fields.push({ id: twcSite.Fields.HEIGHT_ASL_M, label: 'Height ASL' }) //new
            basicInfo.fields.push({ id: twcSite.Fields.PUBLIC, label: 'Public' })

            var structures = { id: 'site-summary-structure', title: 'Site Structures', fields: [] };
            fieldGroup.controls.push(structures);
            structures.fields.push({
                id: `${twcInfra.Type}`, label: 'Site Infrastructures',
                fields: {
                    [twcInfra.Fields.INFRASTRUCTURE_ID]: 'Infra Id',
                    [twcInfra.Fields.INFRASTRUCTURE_TYPE]: 'Type',
                    [twcInfra.Fields.STATUS]: 'Status',
                    [twcInfra.Fields.INFRASTRUCTURE_OWNERSHIP]: 'Ownership',
                    [twcInfra.Fields.STRUCTURE_TYPE]: 'Struct. Type',
                    [twcInfra.Fields.TOWER_FAMILY]: 'Family',
                    [twcInfra.Fields.STRUCTURE_HEIGHT_M]: 'Height (m)',
                    [twcInfra.Fields.ROOFTOP_HEIGHT_M]: 'Height Rooftop',

                },
                where: { [twcInfra.Fields.SITE]: dataSource.id },
                FieldsInfo: twcInfra.FieldsInfo,
            });



            var locations = { id: 'site-summary-location', title: 'Location', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.ADDRESS, label: 'Address', width: '75%', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.ADDRESS_COUNTY, label: 'County' })
            locations.fields.push({ id: twcSite.Fields.ADDRESS_REGION, label: 'Region', lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.LATITUDE, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE, label: 'Longitude' })
            locations.fields.push({ id: twcSite.Fields.EASTING, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING, label: 'Northing' })

            // @@TODO: this is just a sample, remove later
            locations.fields.push({ id: 'site-directions', type: twcUI.CTRL_TYPE.BUTTON, label: '', value: 'Directions', lineBreak: true })

            var locations = { id: 'site-summary-access', title: 'Access Track / Safety Info', fields: [] };
            fieldGroup.controls.push(locations);
            locations.fields.push({ id: twcSite.Fields.TRACK_TYPE, label: 'Track Type' })  //New
            locations.fields.push({ id: twcSite.Fields.LATITUDE_ACCESS, label: 'Latitude' })
            locations.fields.push({ id: twcSite.Fields.LONGITUDE_ACCESS, label: 'Longitude' })
            locations.fields.push({ id: twcSite.Fields.EASTING_ACCESS, label: 'Easting' })
            locations.fields.push({ id: twcSite.Fields.NORTHING_ACCESS, label: 'Northing', lineBreak: true })

            locations.fields.push({ id: twcSite.Fields.DIRECTIONS, label: 'Directions', width: '75%', rows: 5, lineBreak: true })
            locations.fields.push({ id: twcSite.Fields.INSTRUCTIONS, label: 'Instructions', width: '75%', rows: 5, lineBreak: true })

            locations.fields.push({ id: twcSite.Fields.TENANT_CARD_REQUIRED, label: 'Tenant Card Required', labelNoWrap: false })  //New
            //locations.fields.push({ id: twcSite.Fields.LONGITUDE_ACCESS, label: 'Dual Lock Installed', lineBreak: true })  //New
            locations.fields.push({ id: twcSite.Fields.FOURX4_REQUIRED, label: '4x4 Required', labelNoWrap: false, lineBreak: true })  //New
            locations.fields.push({ id: twcSite.Fields.PARKING_RESTRICTIONS, label: 'Parking Restrictions', width: '50%', lineBreak: true })  //New
            locations.fields.push({ id: twcSite.Fields.CRANEMEWP_ACCESS, label: 'Crane/Mewp Access', lineBreak: true })  //New
            locations.fields.push({ id: twcInfra.Fields.FALL_ARREST_TYPE, label: 'Fall Arrest Type', lineBreak: true })  //New
            locations.fields.push({ id: twcSite.Fields.SAFETY__SPECIAL_NOTES, label: 'Safety / Special Notes', width: '50%', lineBreak: true })  //New


            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getSitePanelFields_estates(dataSource) {
            var fieldGroup = { id: 'site-estates', title: 'Estates', collapsed: false, controls: [] };

            var titleInfo = { id: 'site-estates-title', title: 'Title', fields: [] };
            fieldGroup.controls.push(titleInfo);
            // titleInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'C.O.A' })
            // titleInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Type' })
            // titleInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Folio' })
            // titleInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Folio Registration Completed' })
            // titleInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Burden' })
            // titleInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Burden Details' })

            titleInfo.fields.push({
                id: `${twcRow.Type}`, label: 'Site ROW',
                fields: {
                    [twcRow.Fields.ROW_TYPE]: 'R.O.W Type',
                    [twcRow.Fields.ROW_REGISTERED]: 'R.O.W Registered',
                    [twcRow.Fields.ROW_FOLIO]: 'R.O.W Folio',
                    [twcRow.Fields.ROW_CONDITIONS]: 'R.O.W Conditions',
                    [twcRow.Fields.LONG_TERM_USER]: 'Long Term User',
                    //   [twcRow.Fields.WAYLEAVE_REGISTERED]:  'Additional Wayleave',
                    [twcRow.Fields.WAYLEAVE_REGISTERED]: 'Wayleave Registered',
                    [twcRow.Fields.WAYLEAVE_FOLIO]: 'Wayleave Folio',
                    [twcRow.Fields.WAYLEAVE_COMMENTS]: 'Wayleave Comments',
                },
                where: { [twcRow.Fields.SITE]: dataSource.id },
                FieldsInfo: twcRow.FieldsInfo,
            });


            var leaseholdInfo = { id: 'site-estates-leasehold', title: 'Leasehold', fields: [] };
            fieldGroup.controls.push(leaseholdInfo);
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Leasehold' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Start Date' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Expiry Date' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Current Amount Payable' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Licensor Name' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Licensor Contact' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Review Basis' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Review Next Date' })
            // leaseholdInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Comments' })

            var planningInfo = { id: 'site-estates-planning', title: 'Planning', fields: [] };
            fieldGroup.controls.push(planningInfo);
            planningInfo.fields.push({
                id: `${twcPlan.Type}`, label: 'Site Planning',
                fields: {
                    [twcPlan.Fields.PLANNING_TYPE]: 'Planning Type',
                    [twcPlan.Fields.COMMENTS]: 'Comments',
                    //[twcPlan.Fields.SUBMITTED_DATE]: 'County Council / An Bord Pleanala',
                    [twcPlan.Fields.LOCAL_AUTHORITY_REFERENCE]: 'Reference',
                    [twcPlan.Fields.FILES_AVAILABLE]: 'Files Available',
                    [twcPlan.Fields.CONSULTANT]: 'Consultant',
                    [twcPlan.Fields.SUBMITTED_DATE]: 'Submitted Date',
                    // [twcPlan.Fields.SUBMITTED_DATE]: 'Granted Date',
                    [twcPlan.Fields.PLANNING_EXPIRY_DATE]: 'Expiry Date',
                    [twcPlan.Fields.FORECAST_SUBMISSION_DATE]: 'Forecast Submission Date',
                    [twcPlan.Fields.RESTRICTED]: 'Restricted',
                    [twcPlan.Fields.RISK_LEVEL]: 'Risk Level',
                    [twcPlan.Fields.CONDITIONS]: 'Conditions',
                    [twcPlan.Fields.CONDITIONS_DISCHARGED]: 'Conditions Discharged',
                    [twcPlan.Fields.CONDITIONS_OUTSTANDING]: 'Conditions Outstanding',
                    [twcPlan.Fields.CR_SENSITIVITY]: 'C.R Sensitivity',
                    [twcPlan.Fields.CR_COMMENTS]: 'C.R Comments',
                    [twcPlan.Fields.PR_SENSITIVITY]: 'P.R Sensitivity',
                    [twcPlan.Fields.PR_COMMENTS]: 'P.R Comments',

                },
                where: { [twcPlan.Fields.SITE]: dataSource.id },
                FieldsInfo: twcPlan.FieldsInfo,
            });





            // var fibreInfo = { id: 'site-estates-fibre', title: 'Fibre', fields: [] };
            // fieldGroup.controls.push(fibreInfo);
            // fibreInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Fibre ( on site )' })
            // fibreInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Fibre Priority' })
            // fibreInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Fibre Phase' })
            // fibreInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Fibre Partner Priority' })
            // fibreInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Fibre Duct Installed' })
            // fibreInfo.fields.push({ id: twcSite.Fields.SITE_ID, label: 'Fibre Comments' }) 

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
                where: { [twcLock.Fields.SITE]: dataSource.id },
                FieldsInfo: twcLock.FieldsInfo,
            })

            var perimeterInfo = { id: 'site-assets-perimeter', title: 'Perimeter', fields: [] };
            fieldGroup.controls.push(perimeterInfo);
            perimeterInfo.fields.push({ id: twcSite.Fields.PERIMETER_TYPE, label: 'Perimeter Type' })
            perimeterInfo.fields.push({ id: twcSite.Fields.FENCE_HEIGHT_M, label: 'Fence Height (m)', lineBreak: true })
            perimeterInfo.fields.push({ id: twcSite.Fields.FULL_DEMISED_AREA_FENCED, label: 'Full Demised Area Fenced' })
            perimeterInfo.fields.push({ id: twcSite.Fields.ADJACENT_GROUND_SPACE, label: 'Adjacent Ground Space' })
            perimeterInfo.fields.push({ id: twcSite.Fields.ADJACENT_GROUND_OWNER, label: 'Adiacent ground Owner' })


            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getSitePanelFields_facilities(dataSource) {
            var fieldGroup = { id: 'site-facilities', title: 'Facilities', collapsed: true, controls: [] };


        var powerInfo = { id: 'site-facilities-power', title: 'Power', fields: [] };
            fieldGroup.controls.push(powerInfo);

            powerInfo.fields.push({
                id: `${twcPowerSupply.Type}`, label: 'Power',
                fields: {
                    //[twcPowerSupply.Fields.MPRN]: 'Independent Supply',
                    [twcPowerSupply.Fields.MPRN]: 'MPRN Number',
                    [twcPowerSupply.Fields.METER_NUMBER]: 'Meter Number',
                   // [twcPowerSupply.Fields.INTRUDER_ALARM_PRESENT]: 'Check Meter',
                  //  [twcPowerSupply.Fields.INTRUDER_ALARM_PRESENT]: 'Temp Available',
                   // [twcPowerSupply.Fields.INTRUDER_ALARM_PRESENT]: 'Multi Metering',
                   // [twcPowerSupply.Fields.INTRUDER_ALARM_PRESENT]: 'Meters On Panel',
                    [twcPowerSupply.Fields.AVAILABLE_METER_SLOTS]: 'Available Meters On Panel',
                    [twcPowerSupply.Fields.POWER_PHASE]: 'Power Phase',
                  //  [twcPowerSupply.Fields.INTRUDER_ALARM_PRESENT]: 'Power Load',
                   // [twcPowerSupply.Fields.INTRUDER_ALARM_PRESENT]: 'Kva Info Site',
                    [twcPowerSupply.Fields.POWER_SUPPLER]: 'Supplier',
                   // [twcPowerSupply.Fields.INTRUDER_ALARM_PRESENT]: 'Esb For Meter',
                    [twcPowerSupply.Fields.NEXT_METER_READING_DATE]: 'Next Reading Date',
                   
                },
                where: { [twcPowerSupply.Fields.SITE]: dataSource.id },
                FieldsInfo: twcPowerSupply.FieldsInfo,
            });




            var alarmsInfo = { id: 'site-facilities-alarms', title: 'Alarms', fields: [] };
            fieldGroup.controls.push(alarmsInfo);

            alarmsInfo.fields.push({
                id: `${twcInfra.Type}`, label: 'Alarms',
                fields: {
                    [twcInfra.Fields.INTRUDER_ALARM_PRESENT]: 'Intruder Alarm Present',
                   // [twcInfra.Fields.INTRUDER_ALARM_PRESENT]: 'Intruder Alarm Monitored',
                    [twcInfra.Fields.INTRUDER_CODE]: 'Intruder Code',
                    [twcInfra.Fields.FIRE_ALARM_PRESENT]: 'Fire Alarm Present',
                   // [twcInfra.Fields.FIRE_ALARM_PRESENT]: 'Type',
                    //[twcInfra.Fields.FIRE_ALARM_PRESENT]: 'Smoke Alarm Present',
                   // [twcInfra.Fields.FIRE_ALARM_PRESENT]: 'Type',
                   // [twcInfra.Fields.FIRE_ALARM_PRESENT]: 'Gas Alarm Present',
                   // [twcInfra.Fields.FIRE_ALARM_PRESENT]: 'Type',
                   // [twcInfra.Fields.FIRE_ALARM_PRESENT]: 'Last Service',
                },
                where: { [twcInfra.Fields.SITE]: dataSource.id },
                FieldsInfo: twcInfra.FieldsInfo,
            });

             
            var airCondtionInfo = { id: 'site-facilities-aircondtioning', title: 'Air Conditioning', fields: [] };
            fieldGroup.controls.push(airCondtionInfo);

            airCondtionInfo.fields.push({
                id: `${twcInfra.Type}`, label: 'Air Conditioning',
                fields: {
                    [twcInfra.Fields.UNITS]: 'Units',
                    [twcInfra.Fields.MODEL]: 'Model',
                    [twcInfra.Fields.INSTALLED]: 'Installed',
                    [twcInfra.Fields.AC_FEED_PHASE]: 'Ac Feed Phase',
                    [twcInfra.Fields.LOADINGS]: 'Loadings',
                    [twcInfra.Fields.NOISE_LEVEL]: 'Noise Level',
                },
                where: { [twcInfra.Fields.SITE]: dataSource.id },
                FieldsInfo: twcInfra.FieldsInfo,
            });

             var fireSafetyInfo = { id: 'site-facilities-firesafety', title: 'Fire Safety', fields: [] };
            fieldGroup.controls.push(fireSafetyInfo);

            fireSafetyInfo.fields.push({
                id: `${twcInfra.Type}`, label: 'Fire Safety',
                fields: {
                    //[twcInfra.Fields.UNITS]: 'Co2 Count',
                   // [twcInfra.Fields.MODEL]: 'Abc Count',
                   // [twcInfra.Fields.INSTALLED]: 'Last Fire Service',
                    [twcInfra.Fields.NEXT_FIRE_SERVICE]: 'Next Service Date',
                    //[twcInfra.Fields.LOADINGS]: 'Forecasted Fire Service',
                },
                where: { [twcInfra.Fields.SITE]: dataSource.id },
                FieldsInfo: twcInfra.FieldsInfo,
            });

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
            fieldGroups.push(getSitePanelFields_facilities(dataSource))
            // @@TODO: implement all required panels
            return fieldGroups;
        }

        return {
            getSiteTableFields: getSiteTableFields,
            getSiteMainInfoFields: getSiteMainInfoFields,
            getSiteInfoPanels: getSiteInfoPanels,
        }
    });

