/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safItemUI.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafItemUI) => {
        var _safUrl = null;
        function getSafUrl() {
            if (!_safUrl) {
                _safUrl = core.url.script('otwc_siteaccess_sl');
            }
            return _safUrl;
        }

        function getSafLink(saf) {
            if (saf.id == 'new') {
                return '<span style="font-weight: bold; color: magenta">reserved</span>';
            }
            return `<a class="twc" href="${getSafUrl()}&recId=${saf.id}" target="_blank">${saf.code}</a>`
        }

        function renderTimeBlocks(options) {
            if (!options) { options = {}; }
            var blocks = twcUtils.getSafTimeBlocks();
            var html = '<div class="twc-div-table-r">';
            core.array.each(blocks, tb => {

                var srfBlock = null; var textStyle = '';
                for (var saf in options.timeBlocks) {
                    srfBlock = options.timeBlocks[saf].blocks.find(sb => { return sb.block.id == tb.value });
                    if (srfBlock) {
                        textStyle = ' color: var(--input-color-disabled);'
                        srfBlock = {
                            id: srfBlock.id,
                            saf: options.timeBlocks[saf].saf
                        }
                        break;
                    }
                }

                var availableLink = 'available';
                if (options.disabled) {
                    availableLink = options.disabled;
                } else if (options.editable) {
                    availableLink = `<span class="twc-link-like" data-action="reserve" style="color: green;">${availableLink}</span>`
                }

                html += `
                    <div data-block-date="${options?.date || ''}" data-block-id="${tb.value}" data-block-text="${tb.text}" data-saf-block-id="${srfBlock?.id || ''}">
                        <div style="width: 125px; white-space: nowrap;${textStyle}">
                            ${tb.text}
                        </div>
                        <div style="width: 100px; white-space: nowrap;">
                            ${srfBlock ? getSafLink(srfBlock.saf) : availableLink}
                        </div>
                    </div>
                `
            })

            html += '</div>';
            return html;
        }

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



        function getSAFInfoPanels_Builder(dataSource, userInfo, options) {
            var fieldGroup = { id: 'site-access-builder', collapsed: false, controls: [] };

            // @@TODO: SAF: collapse for test only
            var calenderInfo = { id: 'site-access-saf-builder', title: 'Create New Site Access', collapsed: true, renderAsTable: true, fields: [] };
            fieldGroup.controls.push(calenderInfo);

            var specialDates = {}; var datesContent = {};
            if (options?.siteTimeBlocks) {
                for (var k in options.siteTimeBlocks) {
                    datesContent[k] = [];
                    for (var ks in options.siteTimeBlocks[k]) {
                        datesContent[k].push(`${getSafLink(options.siteTimeBlocks[k][ks].saf)}`);
                    }
                }
            }
            calenderInfo.fields.push({ id: 'saf-calendar', type: twcUI.CTRL_TYPE.CALENDAR, specialDates: specialDates, datesContent: datesContent })
            calenderInfo.fields.push({
                id: 'saf-calendar-panel', type: twcUI.CTRL_TYPE.PANEL,
                title: `<div id="saf-cal-selection-title">${twcUtils.formatLongDate()}</div>`,
                content: `<div id="saf-cal-selection-body">${renderTimeBlocks()}</div>`,
            })
            calenderInfo.fields.push({
                id: 'saf-calendar-access-panel', type: twcUI.CTRL_TYPE.PANEL,
                title: `<div id="saf-cal-selection-access-title">Your Access Form</div>`,
                content: '<div id="saf-cal-selection-access-body"><b>Select SAF Setup & Access Requirements below to begin</b></div>',
            })



            var step1Info = { id: 'site-access-step-1', title: 'Step 1 of 5 : SAF SETUP', fields: [] };
            fieldGroup.controls.push(step1Info);
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-template', label: 'Template', allowAll: false, dataSource: [{ value: 'new', text: 'Create new SAF' }, { value: 'reuse', text: 'Reuse previous SAF' }] })
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-type', label: 'Type', hide: true, allowAll: false, dataSource: twcUtils.getSafTypes() });
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-reuse', label: 'S.A.F.', hide: true, allowAll: false, dataSource: twcUtils.getSafDropDown(dataSource) });


            var step2Info = { id: 'site-access-step-2', title: 'Step 2 of 5 : Access Requirements', hide: true, fields: [] };
            fieldGroup.controls.push(step2Info);
            step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-mast-access', label: 'Mast Access', width: '150px', allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            // @@TODO: SAF: this is conditional to something
            step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-building-access', label: 'TC Building Access', width: '150px', allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-crane-access', label: 'Crane / Cherrypicker', width: '150px', allowAll: false, dataSource: twcUtils.getYesNoOptions() });



            var step3Info = { id: 'site-access-step-3', title: 'Step 3 of 5 : Access Details', hide: true, fields: [] };
            fieldGroup.controls.push(step3Info);
            step3Info.fields.push({ id: 'saf-access-condition', type: twcUI.CTRL_TYPE.PANEL, title: `Conditions of Access`, content: `<div id="saf-access-condition-info"></div>`, styles: { width: '750px' }, lineBreak: true });
            // @@TODO: SAF: get customers based on login
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-customer', label: 'Customer', allowAll: false, dataSource: twcUtils.getCustomers() });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-vendor', label: 'Primary Contractor', allowAll: false, dataSource: twcUtils.getVendors(), lineBreak: true });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.TEXTAREA, id: 'saf-work-summary', label: 'Summary of Work', rows: 3, width: '100%', lineBreak: true });
            // @@TODO: SAF: keys / srfs
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-key', label: 'Key', allowAll: false, dataSource: [], lineBreak: true });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-srf', label: 'S.R.F.', allowAll: false, dataSource: [], lineBreak: true });
            // @@TODO: SAF: PSDP Desing
            step3Info.fields.push({ id: 'saf-planned-work-eq', type: twcUI.CTRL_TYPE.PANEL, title: `Planned Equipment Work`, styles: { width: '100%' }, lineBreak: true });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-psdp-design', label: 'PSDP (Design)', allowAll: false, dataSource: []});
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-psdp-construction', label: 'PSDP (Construction)', allowAll: false, dataSource: [], lineBreak: true });

            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-picw', label: 'PICW', allowAll: false, dataSource: [] });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-picw-staff', label: 'Staff', hide: true, allowAll: false, dataSource: [] });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.TEXT, id: 'saf-picw-staff-phone', label: 'Phone', hide: true});

            var step4Info = { id: 'site-access-step-4', title: 'Step 4 of 5 : Crews Visitors', hide: true, fields: [] };
            fieldGroup.controls.push(step4Info);

            var step5Info = { id: 'site-access-step-5', title: 'Step 5 of 5 : Documentation', hide: true, fields: [] };
            fieldGroup.controls.push(step5Info);


            var step6Info = { id: 'site-access-step-6', hide: true, fields: [] };
            fieldGroup.controls.push(step6Info);
            step6Info.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'saf-submit', value: 'Submit' });

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getSAFInfoPanels_Existing(dataSource, userInfo) {

            var safDetails = { id: 'ite-access-existing-safs', title: 'Existing SAFs', collapsed: true, fields: [] };
            safDetails.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })
            safDetails.fields.push({ id: twcSaf.Fields.STATUS, label: 'Status' })
            safDetails.fields.push({
                id: `${twcSaf.Type}`, label: 'Saf Details',
                fields: {
                    [twcSaf.Fields.SAF_ID]: 'SAF',
                    [twcSaf.Fields.CUSTOMER]: 'Customer',
                    [twcSaf.Fields.TYPE]: 'Type',
                    [twcSaf.Fields.MAST_ACCESS]: 'Mast',
                    [twcSaf.Fields.SAF_AUTHOR]: 'Author',
                    [twcSaf.Fields.STATUS]: 'Status',

                },
                where: { [twcSaf.Fields.SITE]: dataSource.siteId },
                FieldsInfo: twcSaf.FieldsInfo,

            });
            configUIFields.formatPanelFields(dataSource, safDetails);
            return safDetails;
        }

        function getSAFInfoPanels_Info(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-details', title: 'SAF info', collapsed: false, controls: [] };

            var detailsInfo = { id: 'site-access-details', title: 'Details', fields: [] };
            fieldGroup.controls.push(detailsInfo);

            detailsInfo.fields.push({ id: twcSaf.Fields.SAF_ID, label: 'SAF ID' })
            detailsInfo.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })
            detailsInfo.fields.push({ id: twcSaf.Fields.STATUS, label: 'Status' })
            // detailsInfo.fields.push({ id: twcSaf.Fields.START_TIME_BLOCK, label: 'Start' })          
            // detailsInfo.fields.push({ id: twcSaf.Fields.END_TIME_BLOCK, label: 'End' })          

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }

        function getSAFInfoPanels(dataSource, userInfo, options) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcSaf.Type;

            var fieldGroups = [];

            if (dataSource.id == undefined) {
                fieldGroups.push(getSAFInfoPanels_Builder(dataSource, userInfo, options));
            } else {
                fieldGroups.push(getSAFInfoPanels_Info(dataSource, userInfo));
            }
            fieldGroups.push(getSAFInfoPanels_Existing(dataSource, userInfo));

            return fieldGroups;
        }

        return {
            getSafTableFields: getSafTableFields,
            getSAFInfoPanels: getSAFInfoPanels,
            renderTimeBlocks: renderTimeBlocks
        }
    });

