/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safCrew.js', './oTWC_safAction.js', './oTWC_safTimeBlock.js', './oTWC_safLog.js', './oTWC_file.js', './oTWC_troubleTickets.js','./oTWC_fileUI.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafCrew, twcSafAction, twcSafTimeBlock, twcSafLog, twcFile, twcTrblTkts,twcFileUI) => {
        var _safUrl = null;
        var _allowedSafTypes = null;


        function getTicketsTableFields() {
            var ticketFields = [
                { field: 'name' },
                { field: twcTrblTkts.Fields.SUBMITTED },
                { field: twcTrblTkts.Fields.SITE },
                // { field: twcSite.Fields.ADDRESS_COUNTY },
                // { field: twcSite.Fields.ADDRESS_REGION },
                { field: twcTrblTkts.Fields.ASSIGNED_TO },
                { field: twcTrblTkts.Fields.PRIORITY },
                { field: twcTrblTkts.Fields.AUTHOR_PHONE_NUMBER },
                { field: twcTrblTkts.Fields.CATEGORY },
                { field: twcTrblTkts.Fields.CUSTOMER },
                { field: twcTrblTkts.Fields.STATUS }
            ];
            return ticketFields;
        }



        function getTKTExistingTktsPanels(dataSource, userInfo) {
            var tktLink = core.url.script('oTWC_troubleTicket_sl');
            var tktDetails = { id: 'trbl-ticket', title: `Existing Trouble Tickets`, collapsed: false, fields: [] };

            // throw new Error(JSON.stringify(dataSource))
            tktDetails.fields.push({
                id: `${twcTrblTkts.Type}`, label: 'Trouble Ticket Details',
                fields: {
                    ['name']: { title: 'Ticket ID', link: { url: tktLink + '&recId=${id}', valueField: 'id' } },
                    [twcTrblTkts.Fields.SUBMITTED]: 'SUBMITTED',
                    [twcTrblTkts.Fields.AUTHOR]: 'AUTHOR',
                    [twcTrblTkts.Fields.CATEGORY]: 'CATEGORY',
                    [twcTrblTkts.Fields.ASSIGNED_TO]: 'ASSIGNED_TO',
                    [twcTrblTkts.Fields.PRIORITY]: 'PRIORITY',
                    [twcTrblTkts.Fields.CUSTOMER]: 'CUSTOMER',
                    [twcTrblTkts.Fields.STATUS]: 'STATUS',
                },
                where: { [twcTrblTkts.Fields.SITE]: dataSource.siteId },
                FieldsInfo: twcTrblTkts.FieldsInfo,
                readOnly: true
            });

            configUIFields.formatPanelFields(dataSource, tktDetails);

            return tktDetails;
        }

        function getTKPanelInfo(dataSource, userInfo) {
          //  var fieldGroup = { id: 'trbl-tkts-details', title: 'Create New Trouble Ticket or Provide Safety / Security Feedback', collapsed: false, controls: [] };
            var fieldGroup = { id: 'trbl-tkts-details', title: (dataSource.id) ? `Trouble Ticket [${dataSource.name}]` : 'Create New Trouble Ticket or Provide Safety / Security Feedback', collapsed: false, controls: [] };

            var newDetailsInfo = { id: 'trbl-tkts-add-new', fields: [] };
            fieldGroup.controls.push(newDetailsInfo);

            var customers = twcUtils.getCustomers(userInfo);

            var statuses = twcUtils.getTicketStatus();
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.STATUS, label: 'Status', disabled: !userInfo.isEmployee, dataSource: statuses, value: dataSource[twcTrblTkts.Fields.STATUS] || statuses[0].value, allowAll: false })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.SUBMITTED, label: 'Submitted', lineBreak: true, readOnly: true })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CUSTOMER, label: 'Customer', dataSource: customers })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.AUTHOR_PHONE_NUMBER, lineBreak: true, label: 'Your Phone Number', value: userInfo.profileInfo.phone })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.REPORT_ISSUE__WORKS_REQUIRED, lineBreak: true, width: '100%', rows: 5, label: 'Report Issue / Works Required' })

            // @@TODO: JESNA: show list of attached files, see as example: PHOTOS TAKEN
            //          FileCabinet\SuiteScripts\OSSMTWC\data\oTWC_safUI.js function getSAFInfoPanels_WorkFlowInfo_Images

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getTKPanelAssessment(dataSource, userInfo) {
            var fieldGroup = { id: 'trbl-tkts-assessment', title: 'Assessment', collapsed: false, controls: [] };

            var assignedToComp= dataSource.custrecord_twc_trbl_tkt_assigned_to_comp
            var assignedTo= dataSource.custrecord_twc_trbl_tkt_assigned_to

            var compProfiles = [];
             if (assignedToComp) {
                compProfiles = twcUtils.getProfiles({ company: assignedToComp, canAttend: false })
            }

            var newDetailsInfo = { id: 'trbl-tkts-assessment-info', fields: [] };
            fieldGroup.controls.push(newDetailsInfo);

            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.ASSESSED, label: 'Assessed' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CATEGORY, label: 'Category' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.PRIORITY, lineBreak: true, label: 'Priority' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.ASSIGNED_TO_COMPANY, label: 'Assigned To Company' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.ASSIGNED_TO, value:assignedTo, dataSource:compProfiles, lineBreak: true, label: 'Assigned To' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.WORKS_REQUIRED, lineBreak: true, width: '100%', rows: 5, label: 'Work Required' })

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getTKPanelResolution(dataSource, userInfo) {
            var fieldGroup = { id: 'trbl-tkts-resolution', title: 'Resolution', collapsed: false, controls: [] };

            var newDetailsInfo = { id: 'trbl-tkts-resolution-info', fields: [] };
            fieldGroup.controls.push(newDetailsInfo);

            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CORRECTIVE_ACTION, label: 'Corrective Action' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.SCHEDULED_COMPLETION_DATE, lineBreak: true, label: 'Scheduled Completion Date', width: '175px' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE, lineBreak: true, width: '100%', rows: 5, label: 'CA Taken incl Root Cause' })

            // @@TODO: JESNA: show list of attached files, see as example: RESOLUTION PHOTOS TAKEN
            //          FileCabinet\SuiteScripts\OSSMTWC\data\oTWC_safUI.js function getSAFInfoPanels_WorkFlowInfo_Images

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getTKPanelSubmit(dataSource, userInfo) {
            var fieldGroup = { id: 'trbl-tkts-submit', collapsed: false, controls: [] };
            var submitField = { id: 'trbl-tkts-submit-info', fields: [] };
            fieldGroup.controls.push(submitField);
            submitField.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'tk-submit', value: 'Submit' });
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }

     function getTKPanelFiles(dataSource, userInfo) {
            var fieldGroup = { id: 'trbl-tkts-workflow-files', title: 'Resolution Files', collapsed: false, controls: [] };
            var resolutionFilesInfo = { id: 'trbl-tkts-files', collapsed: false, fields: [] };
            fieldGroup.controls.push(resolutionFilesInfo);
            resolutionFilesInfo.fields.push({
                id: `${twcFile.Type}`, label: 'Resolution Files',
                fields: {
                    [twcFile.Fields.CREATED]: 'Uploaded Date',
                    [twcFile.Fields.NAME]: 'File Name',
                    [twcFile.Fields.R_TYPE + '_name']: 'Type',
                    [twcFile.Fields.DESCRIPTION]: { title: 'Description', nullText: '' },
                    ['preview_link']: { title: '', noFilter: true, styles: { width: '50px' } }
                },
                dataSource: twcUtils.getTktImages(dataSource),
                FieldsInfo: twcFile.FieldsInfo,
                showToolbar: false,
            });
            log.debug("resolutionFilesInfo",resolutionFilesInfo)
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }


        function getTKTUIPanels(dataSource, userInfo) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcTrblTkts.Type;

            var fieldGroups = [];
            // if (dataSource.id) {
            //     fieldGroups.push(getTKTInfoPanels_Info(dataSource, userInfo));
            //     fieldGroups.push(getTKPanelInfo(dataSource, userInfo));



            // } else {
            fieldGroups.push(getTKPanelInfo(dataSource, userInfo));
            if (userInfo.isEmployee) {
                fieldGroups.push(getTKPanelAssessment(dataSource, userInfo));
                fieldGroups.push(getTKPanelResolution(dataSource, userInfo));
                fieldGroups.push(getTKPanelFiles(dataSource, userInfo));

            }

            if (!dataSource.id) { fieldGroups.push(getTKPanelSubmit(dataSource)) }
            // }

            fieldGroups.push(getTKTExistingTktsPanels(dataSource, userInfo));
            return fieldGroups;
        }

        function getTktChildRecord(tkt, childRecord, userInfo) {
            var fieldGroup = [];
            log.debug("tkt in tktchild rec",tkt)
            log.debug("childRecord in tktchild rec",childRecord)

            if (childRecord.type == twcFileUI.RecordType) {
                fieldGroup = twcFileUI.getUIFields(childRecord, userInfo);
            } else {
                throw new Error(`No Child Record Found in payload (type: ${childRecord.type})`)
            }
           // configUIFields.formatPanelFields(childRecord, fieldGroup);
            return fieldGroup;
        }

        return {

            getTicketsTableFields: getTicketsTableFields,
            getTKTInfoPanels: getTKTUIPanels,
            getTktChildRecord:getTktChildRecord

        }
    });

