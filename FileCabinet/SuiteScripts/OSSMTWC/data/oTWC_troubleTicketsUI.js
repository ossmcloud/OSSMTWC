/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safCrew.js', './oTWC_safAction.js', './oTWC_safTimeBlock.js', './oTWC_safLog.js', './oTWC_file.js','./oTWC_troubleTickets.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafCrew, twcSafAction, twcSafTimeBlock, twcSafLog, twcFile,twcTrblTkts) => {
        var _safUrl = null;
        var _allowedSafTypes = null;
        

        function getTicketsTableFields() {
            var ticketFields = [
                { field: twcTrblTkts.Fields.TROUBLE_TICKET_ID },
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
                    [twcTrblTkts.Fields.TROUBLE_TICKET_ID]: { title: 'Ticket ID', link: { url: tktLink + '&recId=${id}', valueField: 'id' } },
                    [twcTrblTkts.Fields.SUBMITTED]: 'SUBMITTED',
                    [twcTrblTkts.Fields.AUTHOR]: 'AUTHOR',
                    [twcTrblTkts.Fields.CATEGORY]: 'CATEGORY',
                    [twcTrblTkts.Fields.ASSIGNED_TO]: 'ASSIGNED_TO',
                    [twcTrblTkts.Fields.PRIORITY]: 'PRIORITY',
                    [twcTrblTkts.Fields.CUSTOMER]: 'CUSTOMER',
                    [twcTrblTkts.Fields.STATUS]: 'STATUSt',
                },
                where: { [twcTrblTkts.Fields.SITE]: dataSource.siteId },
                FieldsInfo: twcTrblTkts.FieldsInfo,
                readOnly: true
            });

            configUIFields.formatPanelFields(dataSource, tktDetails);

            return tktDetails;
        }

  function getTKTInfoPanels_Info(dataSource, userInfo) {
            var fieldGroup = { id: 'trbl-tkts-details', title: 'Trouble Tickets info', collapsed: false, controls: [] };

            var detailsInfo = { id: 'trbl-tkts-details', fields: [] };
            fieldGroup.controls.push(detailsInfo);

            detailsInfo.fields.push({ id: twcTrblTkts.Fields.TROUBLE_TICKET_ID, label: 'TROUBLE TICKET ID' })
            detailsInfo.fields.push({ id: twcTrblTkts.Fields.SUBMITTED, label: 'SUBMITTED',lineBreak: true })
            detailsInfo.fields.push({ id: twcTrblTkts.Fields.AUTHOR, label: 'AUTHOR',lineBreak: true ,width: '250px'})
            detailsInfo.fields.push({ id: twcTrblTkts.Fields.ASSESSED_BY, label: 'Assessed By', lineBreak: true })

            detailsInfo.fields.push({ id: twcTrblTkts.Fields.CUSTOMER, label: 'Customer',lineBreak: true })
            detailsInfo.fields.push({ id: twcTrblTkts.Fields.ASSIGNED_TO, label: 'Assigned To' ,lineBreak: true})
            detailsInfo.fields.push({ id: twcTrblTkts.Fields.REPORT_ISSUE__WORKS_REQUIRED, width: '100%', label: 'Issue / Works Required' ,lineBreak: true})

            detailsInfo.fields.push({ id: twcTrblTkts.Fields.WORKS_REQUIRED, width: '100%', label: 'Work Required' ,lineBreak: true})
           // detailsInfo.fields.push({ id: twcTrblTkts.Fields.REPORT_ISSUE__WORKS_REQUIRED, label: 'Resolved By' })
            detailsInfo.fields.push({ id: twcTrblTkts.Fields.SCHEDULED_COMPLETION_DATE, label: 'Scheduled Completion Date', lineBreak: true })

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

         function getAddNewTKPanels(dataSource, userInfo) {
            var fieldGroup = { id: 'trbl-tkts-details', title: 'Create New Trouble Ticket or Provide Safety / Security Feedback', collapsed: false, controls: [] };

            var newDetailsInfo = { id: 'trbl-tkts-add-new', fields: [] };
            fieldGroup.controls.push(newDetailsInfo);

            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.STATUS, label: 'Status', disabled: false, lineBreak: true, dataSource: twcUtils.getTicketStatus(), allowAll: false})
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.REPORT_ISSUE__WORKS_REQUIRED, lineBreak: true, label: 'Report Issue / Works Required' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.AUTHOR_PHONE_NUMBER, lineBreak: true, label: 'Your Phone Number' })

            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.ASSESSED, lineBreak: true, label: 'Assessed' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CATEGORY,lineBreak: true,  label: 'Category' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CUSTOMER, lineBreak: true, label: 'Customer' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.ASSIGNED_TO, lineBreak: true, label: 'Assigned To' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.PRIORITY,lineBreak: true,  label: 'Priority' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.WORKS_REQUIRED, lineBreak: true, label: 'Work Required' })

            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CORRECTIVE_ACTION,lineBreak: true,  label: 'Corrective Action' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.SCHEDULED_COMPLETION_DATE, lineBreak: true, label: 'Scheduled Completion Date' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE, lineBreak: true, label: 'CA Taken incl Root Cause' })
            newDetailsInfo.fields.push({ id: twcTrblTkts.Fields.RESOLUTION_PHOTOS_TAKEN, label: 'Resolution Photos Taken' })

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

  function getTKTUIPanels(dataSource, userInfo) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcTrblTkts.Type;

            var fieldGroups = [];
            if (dataSource.id) {
                fieldGroups.push(getTKTInfoPanels_Info(dataSource, userInfo));
                fieldGroups.push(getTKTExistingTktsPanels(dataSource, userInfo));
                fieldGroups.push(getAddNewTKPanels(dataSource, userInfo));

            } else {
                fieldGroups.push(getTKTExistingTktsPanels(dataSource, userInfo)); 
                fieldGroups.push(getAddNewTKPanels(dataSource, userInfo));

            }
            return fieldGroups;
        }


        return {
           
            getTicketsTableFields: getTicketsTableFields,
              getTKTInfoPanels: getTKTUIPanels,
          
        }
    });

