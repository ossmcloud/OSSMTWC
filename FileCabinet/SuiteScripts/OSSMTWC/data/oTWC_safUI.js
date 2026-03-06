/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safItemUI.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafItemUI) => {

        function getSafTableFields() {
            // @@TODO: this list of fields to display can be set by user
            // @@IMPORTANT: we should make sure some fields are there as they are needed by the ui:
            //      id, name
            //      lat/lng
            //      site address
            var safFields = [
                { field: twcSaf.Fields.SAF_ID },
                // { field: twcSaf.Fields.SUBMITTED },//Field not present
                { field: twcSaf.Fields.SITE },
                // { field: twcSaf.Fields.NAME },//Field not present
                { field: twcSaf.Fields.CUSTOMER },
                // { field: twcSaf.Fields.REQUESTER },//Field not present
                { field: twcSaf.Fields.START_TIME_BLOCK },
                { field: twcSaf.Fields.END_TIME_BLOCK },
                { field: twcSaf.Fields.MAST_ACCESS },
                { field: twcSaf.Fields.CRANE__CHERRYPICKER },
                { field: twcSaf.Fields.ASSOCIATED_SRFS },
                //  { field: twcSaf.Fields.DESCRIPTION },//Field not present
                { field: twcSaf.Fields.PRIMARY_CONTRACTOR },
                { field: twcSaf.Fields.PICW },
                { field: twcSaf.Fields.STATUS },
            ];
            return safFields;
        }



        function getSAFInfoPanels_SAF_Builder(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-builder', title: (dataSource.id) ? `Site Access [${dataSource.name}]` : 'Create New Site Access', collapsed: false, controls: [] };

            var calenderInfo = { id: 'site-access-saf-builder', title: 'SAF BUILDER / CALENDER', fields: [] };
            fieldGroup.controls.push(calenderInfo);

            var customers = null;


            var step1Info = { id: 'site-access-step-1', title: 'Step 1 of 5 : SAF SETUP', fields: [] };
            fieldGroup.controls.push(step1Info);
            // step1Info.fields.push({ id: twcSrf.Fields.CUSTOMER, label: 'Customer', disabled: userInfo.isCustomer, dataSource: customers })
            // step1Info.fields.push({ id: twcSrf.Fields.OPERATOR_SITE_ID, label: 'Operator Site ID' })

            // fieldGroup.controls.push({ id: 'site-access-step-1', title: 'Step 1 of 5', fields: [twcSafItemUI.getStepTableUIControl(dataSource, twcSrf.StepType.TME)] });
            // fieldGroup.controls.push({ id: 'site-request-step-2', title: 'Step 2 of 5', fields: [twcSafItemUI.getStepTableUIControl(dataSource, twcSrf.StepType.ATME)] });
            // fieldGroup.controls.push({ id: 'site-request-step-3', title: 'Step 3 of 5', fields: [twcSafItemUI.getStepTableUIControl(dataSource, twcSrf.StepType.GIE)] });

            // fieldGroup.controls.push({ id: 'site-request-step-4', title: 'Step 4 of 5', fields: [twcSrfItemUI.getFileTableUIControl(dataSource)] });

            // var step5 = {
            //     id: 'site-request-step-5', title: 'Step 5 of 5: Power Supply', fields: [
            //         { id: twcSrf.Fields.POWER_SUPPLY_REQUESTED_FROM_TL, label: 'Power Requested from TC', labelNoWrap: true, lineBreak: true },
            //         { id: twcSrf.Fields.ALTERNATE_POWER_SUPPLIER, label: 'Alternate Supplier', lineBreak: true },
            //         { id: twcSrf.Fields.POWER_NOTES, label: 'Notes / Comments', width: '75%', rows: 3, lineBreak: true },
            //         { id: twcSrf.Fields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB, label: 'Application for own supply made to ESB', labelNoWrap: true, lineBreak: true },
            //         { id: twcSrf.Fields.APPLICATION_DATE, label: 'Application Date' },
            //         { id: twcSrf.Fields.APPLICATION_REFERENCE, label: 'Application Reference' },
            //     ]
            // }

            // fieldGroup.controls.push(step5);

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getSAFInfoPanels_Existing(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-extings-safs', title: 'Existing SAFs', collapsed: false, controls: [] };

            var detailsInfo = { id: 'site-access-details', title: 'Filters', fields: [] };
            fieldGroup.controls.push(detailsInfo);

            detailsInfo.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })          
            detailsInfo.fields.push({ id: twcSaf.Fields.STATUS, label: 'Status' })    
            // detailsInfo.fields.push({ id: twcSaf.Fields.START_TIME_BLOCK, label: 'Start' })          
            // detailsInfo.fields.push({ id: twcSaf.Fields.END_TIME_BLOCK, label: 'End' })          
              
          // fieldGroup.controls.push({ id: 'site-access-saf-det', title: 'Saf Details', fields: [twcSafItemUI.getStepTableUIControl(dataSource, 1)] });

          
        var safDetails = { id: 'site-access-details-table', title: 'Saf Details', fields: [] };
            fieldGroup.controls.push(safDetails);
          safDetails.fields.push({
                id: `${twcSaf.Type}`, label: 'Saf Details',
                fields: {
                [twcSaf.Fields.SAF_ID]: 'SAF',
                //[twcSaf.Fields.SITE]: 'Submitted',
                [twcSaf.Fields.CUSTOMER]: 'Customer',
                [twcSaf.Fields.TYPE]: 'Type',
                [twcSaf.Fields.MAST_ACCESS]: 'Mast',
                [twcSaf.Fields.SAF_AUTHOR]: 'Author',
                [twcSaf.Fields.STATUS]: 'Status',

                },
               //where: { [twcSaf.Fields.SITE]: dataSource.id },
                FieldsInfo: twcSaf.FieldsInfo,
            });
                        log.debug("wcSaf.Fields",twcSaf.FieldsInfo )

                        log.debug("dataSource.id",dataSource.id )

            log.debug("safDetails",safDetails)
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            
           
            return fieldGroup;
        }

          function getSAFInfoPanels_Existing_Saf_Details(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-details', title: 'Existing SAFs', collapsed: false, controls: [] };

            var detailsInfo = { id: 'site-access-details', title: 'Details', fields: [] };
            fieldGroup.controls.push(detailsInfo);

            detailsInfo.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })          
            detailsInfo.fields.push({ id: twcSaf.Fields.STATUS, label: 'Status' })    
            // detailsInfo.fields.push({ id: twcSaf.Fields.START_TIME_BLOCK, label: 'Start' })          
            // detailsInfo.fields.push({ id: twcSaf.Fields.END_TIME_BLOCK, label: 'End' })          
              
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            
           
            return fieldGroup;
        }

        function getSAFInfoPanels(dataSource, userInfo) {
            log.debug("dataSource",dataSource)
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcSaf.Type;

            log.debug("dataSource",dataSource)
            var fieldGroups = [];
            fieldGroups.push(getSAFInfoPanels_SAF_Builder(dataSource, userInfo));
            fieldGroups.push(getSAFInfoPanels_Existing(dataSource, userInfo));

            return fieldGroups;
        }

        return {
            getSafTableFields: getSafTableFields,
            getSAFInfoPanels: getSAFInfoPanels,
        }
    });

