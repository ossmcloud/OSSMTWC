/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js', './oTWC_powerSupply.js', './oTWC_land.js', './oTWC_saf.js', './oTWC_safCrew.js', './oTWC_safTimeBlock.js', './oTWC_safLog.js', './oTWC_file.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow, twcPowerSupply, twcLand, twcSaf, twcSafCrew, twcSafTimeBlock, twcSafLog, twcFile) => {
        var _safUrl = null;
        var _allowedSafTypes = null;
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
                    if (saf == 'blocksCount') { continue; }
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
                { field: twcSaf.Fields.R_TYPE },
                { field: twcSaf.Fields.CUSTOMER },
                { field: twcSaf.Fields.PRIMARY_CONTRACTOR },
                { field: twcSaf.Fields.PICW },
                { field: twcSaf.Fields.STATUS },
                { field: twcSaf.Fields.START_TIME_BLOCK },
                { field: twcSaf.Fields.END_TIME_BLOCK },
                { field: twcSaf.Fields.MAST_ACCESS },
                { field: twcSaf.Fields.TL_BUILDING_ACCESS },
                { field: twcSaf.Fields.ROOFTOP_ACCESS },
                { field: twcSaf.Fields.CRANE__CHERRYPICKER },
                { field: twcSaf.Fields.ELECTRICAL_WORKS },


            ];
            return safFields;
        }

        function getSafCrew(dataSource) {
            var safCrews = [];
            if (dataSource.id) {
                coreSQL.each(`
                    select  crew.id, prof.custrecord_twc_prof_company as saf_crew_vendor, BUILTIN.DF(prof.custrecord_twc_prof_company) as saf_crew_vendor_name, 
                            crew.custrecord_twc_saf_crew_member as saf_crew_member, BUILTIN.DF(crew.custrecord_twc_saf_crew_member) as saf_crew_member_name,
                            crew.custrecord_twc_saf_crew_attend_as as saf_crew_attend
                    from    customrecord_twc_saf_crew crew
                    join    customrecord_twc_prof prof on prof.id = crew.custrecord_twc_saf_crew_member
                    where   custrecord_twc_saf_crew_saf = ${dataSource.id}
                `, crew => {
                    var safCrew = {};
                    safCrew['saf-crew-vendor'] = crew.saf_crew_vendor;
                    safCrew['saf-crew-vendor_name'] = crew.saf_crew_vendor_name;
                    safCrew['saf-crew-member'] = crew.saf_crew_member;
                    safCrew['saf-crew-member_name'] = crew.saf_crew_member_name;
                    safCrew['saf-crew-attend-as'] = crew.saf_crew_attend;
                    safCrew['saf-crew-attend-as_name'] = crew.saf_crew_attend;
                    safCrews.push(safCrew);
                })
            }
            return safCrews;
        }

        function getSafEqAction(dataSource) {
            return [];
        }

        /*
        function getSAFInfoPanels_Builder_old(dataSource, userInfo, options) {
            var isExistingSaf = dataSource.id !== undefined;

            var fieldGroup = { id: 'site-access-builder', collapsed: false, controls: [] };

            var allowedSafTypes = twcUtils.getSafTypes(dataSource);
            if (allowedSafTypes.length == 0) {
                var errorInfo = { id: 'site-access-error', collapsed: false, fields: [] };
                fieldGroup.controls.push(errorInfo);
                errorInfo.fields.push({ id: 'no-saf-access', type: twcUI.CTRL_TYPE.PANEL, title: `CANNOT PROCEED`, content: `This site does not allow Access of any type`, styles: { width: '750px' } });
                configUIFields.formatPanelFields(dataSource, fieldGroup);
                return fieldGroup;
            }


            var calenderInfo = { id: 'site-access-saf-builder', title: 'Create New Site Access', collapsed: false, renderAsTable: true, fields: [] };
            fieldGroup.controls.push(calenderInfo);

            var specialDates = {}; var datesContent = {};
            if (options?.siteTimeBlocks) {
                for (var k in options.siteTimeBlocks) {
                    datesContent[k] = [];
                    specialDates[k] = { css: options.siteTimeBlocks[k].blocksCount > 3 ? 'o-calendar-red' : 'o-calendar-orange' }
                    for (var ks in options.siteTimeBlocks[k]) {
                        if (ks == 'blocksCount') { continue; }
                        // @@TODO: SAF: if logged user is customer only add content if the saf belongs to them
                        //         if logged user is vendor  only add content if the saf belongs to one of their customers
                        datesContent[k].push(`${getSafLink(options.siteTimeBlocks[k][ks].saf)}`);

                    }
                }
            }
            calenderInfo.fields.push({ id: 'saf-calendar', type: twcUI.CTRL_TYPE.CALENDAR, dayClass: 'o-calendar-green', specialDates: specialDates, datesContent: datesContent })
            calenderInfo.fields.push({
                id: 'saf-calendar-panel', type: twcUI.CTRL_TYPE.PANEL,
                title: `<div id="saf-cal-selection-title">${twcUtils.formatLongDate()}</div>`,
                content: `<div id="saf-cal-selection-body">${renderTimeBlocks()}</div>`,
            })
            // calenderInfo.fields.push({
            //     id: 'saf-calendar-access-panel', type: twcUI.CTRL_TYPE.PANEL,
            //     title: `<div id="saf-cal-selection-access-title">Your Access Form</div>`,
            //     content: '<div id="saf-cal-selection-access-body"><b>Select SAF Setup & Access Requirements below to begin</b></div>',
            // })

            var siteInfraStructures = twcUtils.getInfraStructures(dataSource);
            var siteStructures = siteInfraStructures.filter(s => { return s.type == twcUtils.InfraType.Structure })
            var accommodationStructure = siteInfraStructures.filter(s => { return s.type == twcUtils.InfraType.Accommodation })

            var step1Info = { id: 'site-access-step-1', title: 'Step 1 of 5 : SAF SETUP', fields: [] };
            fieldGroup.controls.push(step1Info);

            var safType = dataSource[twcSaf.Fields.R_TYPE] || (allowedSafTypes.length == 1 ? allowedSafTypes[0].value : null);
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-template', label: 'Template', hide: isExistingSaf, allowAll: false, dataSource: [{ value: 'new', text: 'Create new SAF' }, { value: 'reuse', text: 'Reuse previous SAF' }] })
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-type', label: 'Type', hide: !isExistingSaf, allowAll: false, value: safType, dataSource: allowedSafTypes });
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-reuse', label: 'S.A.F.', hide: !dataSource.reUse, value: dataSource.id, allowAll: false, dataSource: twcUtils.getSafDropDown(dataSource) });

            var step2Info = { id: 'site-access-step-2', title: 'Step 2 of 5 : Access Requirements', hide: !isExistingSaf, fields: [] };
            fieldGroup.controls.push(step2Info);

            var structInfo = twcUtils.getStructureTypeInfo({ siteId: dataSource.siteId });
            if (structInfo.mast || structInfo.tower) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-mast-access', label: 'Mast Access', width: '150px', value: dataSource[twcSaf.Fields.MAST_ACCESS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            }
            if (accommodationStructure.length > 0) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-building-access', label: 'TL Building Access', width: '150px', value: dataSource[twcSaf.Fields.TL_BUILDING_ACCESS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            }
            if (structInfo.roofTop) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-rooftop-access', label: 'Rooftop Access', width: '150px', value: dataSource[twcSaf.Fields.ROOFTOP_ACCESS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            }

            step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-electrical-access', label: 'Electrical Work', width: '150px', value: dataSource[twcSaf.Fields.ELECTRICAL_WORKS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-crane-access', label: 'Crane / Cherrypicker', width: '150px', value: dataSource[twcSaf.Fields.CRANE__CHERRYPICKER], allowAll: false, lineBreak: true, dataSource: twcUtils.getYesNoOptions() });

            if (structInfo.mast || structInfo.tower) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-structure', label: 'Structure', width: '150px', allowAll: false, value: dataSource[twcSaf.Fields.STRUCTURE], hide: !isExistingSaf, dataSource: siteStructures });
            }
            if (accommodationStructure.length > 0) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-accommodation', label: 'Accommodation', width: '150px', allowAll: false, value: dataSource[twcSaf.Fields.ACCOMMODATION], hide: !isExistingSaf, dataSource: accommodationStructure });
            }

            var customers = twcUtils.getCustomers(userInfo);
            var primaryContractors = twcUtils.getVendors(userInfo);

            var customer = dataSource[twcSaf.Fields.CUSTOMER] || (customers.length == 1 ? customers[0].value : null);
            var primaryContractor = dataSource[twcSaf.Fields.PRIMARY_CONTRACTOR] || (primaryContractors.length == 1 ? primaryContractors[0].value : null);

            var picwInfo = null; var picwContractorStaff = [];
            if (isExistingSaf) {
                picwInfo = coreSQL.first('select id, custrecord_twc_prof_company as contractor, custrecord_twc_prof_phone as phone from customrecord_twc_prof where id = ' + dataSource[twcSaf.Fields.PICW]);
                picwContractorStaff = twcUtils.getProfiles({
                    company: picwInfo.contractor,
                    filters: {
                        'custrecord_twc_prof_picw_acceptable': 'T',
                        'custrecord_twc_prof_safe_pass_expiry': { op: '>', value: 'CURRENT_DATE' }
                    }
                });
            }

            var step3Info = { id: 'site-access-step-3', title: 'Step 3 of 5 : Access Details', hide: !isExistingSaf, fields: [] };
            fieldGroup.controls.push(step3Info);
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-customer', label: 'Customer', allowAll: false, value: customer, dataSource: customers });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-vendor', label: 'Primary Contractor', allowAll: false, value: primaryContractor, dataSource: primaryContractors, lineBreak: true });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.TEXTAREA, id: 'saf-work-summary', label: 'Summary of Work', rows: 3, value: dataSource[twcSaf.Fields.SUMMARY_OF_WORKS], width: '100%', lineBreak: true });
            // @@TODO: SAF: keys
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-key', label: 'Key', allowAll: false, dataSource: [] });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-srf', label: 'S.R.F.', hide: true, allowAll: false, dataSource: twcUtils.getSrfDropDown(dataSource) });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-srf-equip', label: 'Equipment', hide: true, allowAll: false, dataSource: [], lineBreak: true });
            //
            step3Info.fields.push({ id: 'saf-planned-eq-actions', type: twcUI.CTRL_TYPE.PANEL, title: `Equipment Actions`, styles: { width: '100%', display: 'none' }, lineBreak: true });
            // @@TODO: SAF: PSDP Design
            step3Info.fields.push({ id: 'saf-planned-work-eq', type: twcUI.CTRL_TYPE.PANEL, title: `Planned Equipment Work`, styles: { width: '100%' }, lineBreak: true });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-psdp-design', label: 'PSDP (Design)', allowAll: false, dataSource: [] });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-psdp-construction', label: 'PSDP (Construction)', allowAll: false, dataSource: [], lineBreak: true });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-picw', label: 'PICW', allowAll: false, value: picwInfo?.contractor, dataSource: primaryContractors });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-picw-staff', label: 'Staff', hide: !isExistingSaf, value: picwInfo?.id, dataSource: picwContractorStaff, allowAll: false });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.TEXT, id: 'saf-picw-staff-phone', label: 'Phone', hide: !isExistingSaf, value: picwInfo?.phone });


            var crewTableControl = {
                id: `saf-crew-table`,
                type: twcUI.CTRL_TYPE.TABLE,
                label: 'crews and visitors',
                columns: [
                    { id: 'saf-crew-vendor', title: 'Contractor' },
                    { id: 'saf-crew-vendor_name', title: 'Contractor' },
                    { id: 'saf-crew-member', title: 'Visitor' },
                    { id: 'saf-crew-member_name', title: 'Visitor' },
                    { id: 'saf-crew-attend-as', title: 'Attend As' },
                    { id: 'saf-crew-attend-as_name', title: 'Attend As' },
                ],
                dataSource: getSafCrew(dataSource),
                showToolbar: true,
                showEditDelete: true,
            }
            var step4Info = { id: 'site-access-step-4', title: 'Step 4 of 5 : Crews Visitors', hide: !isExistingSaf, fields: [crewTableControl] };
            fieldGroup.controls.push(step4Info);

            var step5Info = { id: 'site-access-step-5', title: 'Step 5 of 5 : Documentation', hide: !isExistingSaf, fields: [] };
            fieldGroup.controls.push(step5Info);

            var step6Info = { id: 'site-access-step-6', hide: !isExistingSaf, fields: [] };
            fieldGroup.controls.push(step6Info);
            step6Info.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'saf-submit', value: 'Submit' });

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }
        */

        function getSAFInfoPanels_Builder(dataSource, userInfo, options) {
            _allowedSafTypes = twcUtils.getSafTypes(dataSource);
            if (_allowedSafTypes.length == 0) {
                var fieldGroup = { id: 'site-access-step-1', title: 'Step 1 of 5 : SAF SETUP', collapsed: false, controls: [] };
                var errorInfo = { id: 'site-access-error', collapsed: false, fields: [] };
                fieldGroup.controls.push(errorInfo);
                errorInfo.fields.push({ id: 'no-saf-access', type: twcUI.CTRL_TYPE.PANEL, title: `CANNOT PROCEED`, content: `This site does not allow Access of any type`, styles: { width: '750px' } });
                configUIFields.formatPanelFields(dataSource, fieldGroup);
                return fieldGroup;
            }

            var fieldGroups = [];
            fieldGroups.push(getSAFInfoPanels_Builder_Step_0(dataSource, userInfo, options));
            fieldGroups.push(getSAFInfoPanels_Builder_Step_1(dataSource, userInfo, options));
            fieldGroups.push(getSAFInfoPanels_Builder_Step_2(dataSource, userInfo, options));
            fieldGroups.push(getSAFInfoPanels_Builder_Step_3(dataSource, userInfo, options));
            fieldGroups.push(getSAFInfoPanels_Builder_Step_4(dataSource, userInfo, options));
            fieldGroups.push(getSAFInfoPanels_Builder_Step_5(dataSource, userInfo, options));
            fieldGroups.push(getSAFInfoPanels_Builder_Step_6(dataSource, userInfo, options));
            return fieldGroups;
        }
        function getSAFInfoPanels_Builder_Step_0(dataSource, userInfo, options) {
            var fieldGroup = { id: 'site-access-builder-0', title: 'Create New Site Access', collapsed: false, controls: [] };

            var calenderInfo = { id: 'site-access-saf-builder', collapsed: false, renderAsTable: true, fields: [] };
            fieldGroup.controls.push(calenderInfo);

            var specialDates = {}; var datesContent = {};
            if (options?.siteTimeBlocks) {
                for (var k in options.siteTimeBlocks) {
                    datesContent[k] = [];
                    specialDates[k] = { css: options.siteTimeBlocks[k].blocksCount > 3 ? 'o-calendar-red' : 'o-calendar-orange' }
                    for (var ks in options.siteTimeBlocks[k]) {
                        if (ks == 'blocksCount') { continue; }
                        // @@TODO: SAF: if logged user is customer only add content if the saf belongs to them
                        //         if logged user is vendor  only add content if the saf belongs to one of their customers
                        datesContent[k].push(`${getSafLink(options.siteTimeBlocks[k][ks].saf)}`);
                    }
                }
            }
            calenderInfo.fields.push({ id: 'saf-calendar', type: twcUI.CTRL_TYPE.CALENDAR, dayClass: 'o-calendar-green', specialDates: specialDates, datesContent: datesContent })
            calenderInfo.fields.push({
                id: 'saf-calendar-panel', type: twcUI.CTRL_TYPE.PANEL,
                title: `<div id="saf-cal-selection-title">${twcUtils.formatLongDate()}</div>`,
                content: `<div id="saf-cal-selection-body">${renderTimeBlocks()}</div>`,
                styles: { 'margin-left': '5px'}
            })
            
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }
        function getSAFInfoPanels_Builder_Step_1(dataSource, userInfo, options) {
            var isExistingSaf = dataSource.id !== undefined;
            var fieldGroup = { id: 'site-access-step-1', title: 'Step 1 of 5 : SAF SETUP', collapsed: false, controls: [] };

            var step1Info = { id: 'site-access-step-1a', fields: [] };
            fieldGroup.controls.push(step1Info);

            var safType = dataSource[twcSaf.Fields.R_TYPE] || (_allowedSafTypes.length == 1 ? _allowedSafTypes[0].value : null);
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-template', label: 'Template', hide: isExistingSaf, allowAll: false, dataSource: [{ value: 'new', text: 'Create new SAF' }, { value: 'reuse', text: 'Reuse previous SAF' }] })
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-type', label: 'Type', hide: !isExistingSaf, allowAll: false, value: safType, dataSource: _allowedSafTypes });
            step1Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-reuse', label: 'S.A.F.', hide: !dataSource.reUse, value: dataSource.id, allowAll: false, dataSource: twcUtils.getSafDropDown(dataSource) });

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }
        function getSAFInfoPanels_Builder_Step_2(dataSource, userInfo, options) {
            var isExistingSaf = dataSource.id !== undefined;
            var fieldGroup = { id: 'site-access-step-2', title: 'Step 2 of 5 : Access Requirements', hide: !isExistingSaf, collapsed: false, controls: [] };

            var siteInfraStructures = twcUtils.getInfraStructures(dataSource);
            var siteStructures = siteInfraStructures.filter(s => { return s.type == twcUtils.InfraType.Structure })
            var accommodationStructure = siteInfraStructures.filter(s => { return s.type == twcUtils.InfraType.Accommodation })

            var step2Info = { id: 'site-access-step-2a', fields: [] };
            fieldGroup.controls.push(step2Info);

            var structInfo = twcUtils.getStructureTypeInfo({ siteId: dataSource.siteId });
            if (structInfo.mast || structInfo.tower) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-mast-access', label: 'Mast Access', width: '150px', value: dataSource[twcSaf.Fields.MAST_ACCESS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            }
            if (accommodationStructure.length > 0) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-building-access', label: 'TL Building Access', width: '150px', value: dataSource[twcSaf.Fields.TL_BUILDING_ACCESS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            }
            if (structInfo.roofTop) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-rooftop-access', label: 'Rooftop Access', width: '150px', value: dataSource[twcSaf.Fields.ROOFTOP_ACCESS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            }

            step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-electrical-access', label: 'Electrical Work', width: '150px', value: dataSource[twcSaf.Fields.ELECTRICAL_WORKS], allowAll: false, dataSource: twcUtils.getYesNoOptions() });
            step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-crane-access', label: 'Crane / Cherrypicker', width: '150px', value: dataSource[twcSaf.Fields.CRANE__CHERRYPICKER], allowAll: false, lineBreak: true, dataSource: twcUtils.getYesNoOptions() });

            if (structInfo.mast || structInfo.tower) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-structure', label: 'Structure', width: '150px', allowAll: false, value: dataSource[twcSaf.Fields.STRUCTURE], hide: !isExistingSaf, dataSource: siteStructures });
            }
            if (accommodationStructure.length > 0) {
                step2Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-accommodation', label: 'Accommodation', width: '150px', allowAll: false, value: dataSource[twcSaf.Fields.ACCOMMODATION], hide: !isExistingSaf, dataSource: accommodationStructure });
            }
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }
        function getSAFInfoPanels_Builder_Step_3(dataSource, userInfo, options) {
            var isExistingSaf = dataSource.id !== undefined;
            var fieldGroup = { id: 'site-access-step-3', title: 'Step 3 of 5 : Access Details', hide: !isExistingSaf, controls: [] };

            var customers = twcUtils.getCustomers(userInfo);
            var primaryContractors = twcUtils.getVendors(userInfo);

            var customer = dataSource[twcSaf.Fields.CUSTOMER] || (customers.length == 1 ? customers[0].value : null);
            var primaryContractor = dataSource[twcSaf.Fields.PRIMARY_CONTRACTOR] || (primaryContractors.length == 1 ? primaryContractors[0].value : null);

            var picwInfo = null; var picwContractorStaff = [];
            if (isExistingSaf) {
                picwInfo = coreSQL.first('select id, custrecord_twc_prof_company as contractor, custrecord_twc_prof_phone as phone from customrecord_twc_prof where id = ' + dataSource[twcSaf.Fields.PICW]);
                picwContractorStaff = twcUtils.getProfiles({
                    company: picwInfo.contractor,
                    filters: {
                        'custrecord_twc_prof_picw_acceptable': 'T',
                        'custrecord_twc_prof_safe_pass_expiry': { op: '>', value: 'CURRENT_DATE' }
                    }
                });
            }

            var step3Info = { id: 'site-access-step-3a', fields: [] };
            fieldGroup.controls.push(step3Info);
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-customer', label: 'Customer', allowAll: false, value: customer, dataSource: customers });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-vendor', label: 'Primary Contractor', allowAll: false, value: primaryContractor, dataSource: primaryContractors, lineBreak: true });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.TEXTAREA, id: 'saf-work-summary', label: 'Summary of Work', rows: 3, value: dataSource[twcSaf.Fields.SUMMARY_OF_WORKS], width: '100%', lineBreak: true });
            // @@TODO: SAF: keys
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-key', label: 'Key', allowAll: false, dataSource: [] });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-srf', label: 'S.R.F.', hide: true, allowAll: false, dataSource: twcUtils.getSrfDropDown(dataSource) });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-srf-equip', label: 'Equipment', hide: true, allowAll: false, dataSource: [] });
            step3Info.fields.push({ type: twcUI.CTRL_TYPE.NUMBER, id: 'saf-photo-delay', label: 'Photo Req. Delay', hide: true, allowAll: false, dataSource: [], lineBreak: true });

            var eqActionsVisible = false;
            if (isExistingSaf) {
                eqActionsVisible = _allowedSafTypes.find(t => { return t.value == dataSource[twcSaf.Fields.R_TYPE] })?.requires_srf == 'T';
            }
            //
            var step3CInfo = { id: 'site-access-step-3c', title: 'Equipment Actions', hide: !eqActionsVisible, fields: [] };
            fieldGroup.controls.push(step3CInfo);
            var crewTableControl = {
                id: `saf-eq-action-table`,
                type: twcUI.CTRL_TYPE.TABLE,
                label: 'equipment actions',
                columns: [
                    { id: 'saf-eq-action-id', title: 'Eq. Action ID' },
                    { id: 'saf-equipment_name', title: 'Equipment' },
                    { id: 'saf-eq-action-type_name', title: 'Type' },
                    { id: 'saf-eq-action-status_name', title: 'Status' },
                ],
                dataSource: getSafEqAction(dataSource),
                showToolbar: true,
                showEditDelete: true,
            }
            step3CInfo.fields.push(crewTableControl);

            // @@TODO: SAF: PSDP Design
            var step3BInfo = { id: 'site-access-step-3b', title: 'Planned Equipment Work', fields: [] };
            fieldGroup.controls.push(step3BInfo);
            step3BInfo.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-psdp-design', label: 'PSDP (Design)', allowAll: false, dataSource: [] });
            step3BInfo.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-psdp-construction', label: 'PSDP (Construction)', allowAll: false, dataSource: [], lineBreak: true });
            step3BInfo.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-picw', label: 'PICW', allowAll: false, value: picwInfo?.contractor, dataSource: primaryContractors });
            step3BInfo.fields.push({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'saf-picw-staff', label: 'Staff', hide: !isExistingSaf, value: picwInfo?.id, dataSource: picwContractorStaff, allowAll: false });
            step3BInfo.fields.push({ type: twcUI.CTRL_TYPE.TEXT, id: 'saf-picw-staff-phone', label: 'Phone', hide: !isExistingSaf, value: picwInfo?.phone });



            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }
        function getSAFInfoPanels_Builder_Step_4(dataSource, userInfo, options) {
            var isExistingSaf = dataSource.id !== undefined;
            var fieldGroup = { id: 'site-access-step-4', title: 'Step 4 of 5 : Crews Visitors', hide: !isExistingSaf, collapsed: false, controls: [] };

            var crewTableControl = {
                id: `saf-crew-table`,
                type: twcUI.CTRL_TYPE.TABLE,
                label: 'crews and visitors',
                columns: [
                    { id: 'saf-crew-vendor', title: 'Contractor' },
                    { id: 'saf-crew-vendor_name', title: 'Contractor' },
                    { id: 'saf-crew-member', title: 'Visitor' },
                    { id: 'saf-crew-member_name', title: 'Visitor' },
                    { id: 'saf-crew-attend-as', title: 'Attend As' },
                    { id: 'saf-crew-attend-as_name', title: 'Attend As' },
                ],
                dataSource: getSafCrew(dataSource),
                showToolbar: true,
                showEditDelete: true,
            }
            var step4Info = { id: 'site-access-step-4a', fields: [crewTableControl] };
            fieldGroup.controls.push(step4Info);

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }
        function getSAFInfoPanels_Builder_Step_5(dataSource, userInfo, options) {
            var isExistingSaf = dataSource.id !== undefined;
            var fieldGroup = { id: 'site-access-step-5', title: 'Step 5 of 5 : Documentation', hide: !isExistingSaf, collapsed: false, controls: [] };

            var step5Info = { id: 'site-access-step-5a', fields: [] };
            fieldGroup.controls.push(step5Info);
            step5Info.fields.push({ id: 'site-access-step-5a-content', type: twcUI.CTRL_TYPE.PANEL, title: ``, content: 'no documentation available', styles: { width: '500px' }, lineBreak: true });

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }
        function getSAFInfoPanels_Builder_Step_6(dataSource, userInfo, options) {
            var isExistingSaf = dataSource.id !== undefined;
            var fieldGroup = { id: 'site-access-step-6', hide: !isExistingSaf, collapsed: false, controls: [] };

            var step6Info = { id: 'site-access-step-6a', fields: [] };
            fieldGroup.controls.push(step6Info);
            step6Info.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'saf-submit', value: 'Submit' });


            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }



        function getSAFInfoPanels_Existing(dataSource, userInfo) {
            var safLink = core.url.script('otwc_siteaccess_sl');

            var safDetails = { id: 'ite-access-existing-safs', title: 'Existing SAFs', collapsed: true, fields: [] };
            safDetails.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })
            safDetails.fields.push({ id: twcSaf.Fields.STATUS, label: 'Status' })
            safDetails.fields.push({
                id: `${twcSaf.Type}`, label: 'Saf Details',
                fields: {
                    [twcSaf.Fields.NAME]: { title: 'SAF ID', link: { url: safLink + '&recId=${id}', valueField: 'id' } },
                    [twcSaf.Fields.R_TYPE]: 'Type',
                    [twcSaf.Fields.CUSTOMER]: 'Customer',
                    [twcSaf.Fields.PRIMARY_CONTRACTOR]: 'Contractor',
                    [twcSaf.Fields.PICW]: 'PICW',
                    [twcSaf.Fields.STATUS]: 'Status',
                    [twcSaf.Fields.START_TIME_BLOCK]: 'Start Time',
                    [twcSaf.Fields.END_TIME_BLOCK]: 'End Time',
                    [twcSaf.Fields.MAST_ACCESS]: 'Mast',
                    [twcSaf.Fields.TL_BUILDING_ACCESS]: 'Building',
                    [twcSaf.Fields.ROOFTOP_ACCESS]: 'Rooftop',
                    [twcSaf.Fields.CRANE__CHERRYPICKER]: 'Crane/Cherryicker',
                    [twcSaf.Fields.ELECTRICAL_WORKS]: 'Electrical',

                },
                where: { [twcSaf.Fields.SITE]: dataSource.siteId },
                FieldsInfo: twcSaf.FieldsInfo,
                readOnly: true


            });


            configUIFields.formatPanelFields(dataSource, safDetails);

            //#region JESNA
            // var returnData = injectToggleColumn(safDetails)
            // log.debug("returnData", returnData)
            // safDetails = returnData.obj
            // log.debug("safDetails", safDetails)
            // if (returnData.display != 'none' ) {
            //     safDetails.fields.push({ id: twcSaf.Fields.SAF_ID, label: 'SAF ID' })
            //     safDetails.fields.push({ id: twcSaf.Fields.STATUS, label: 'Submitted' })
            //     safDetails.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Author' })
            // }
            //#endregion

            return safDetails;
        }



        function getSAFInfoPanels(dataSource, userInfo, options) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcSaf.Type;

            var fieldGroups = [];
            //if (dataSource.id == undefined) {
            if (options.editMode) {
                //fieldGroups.push(getSAFInfoPanels_Builder(dataSource, userInfo, options));
                fieldGroups = getSAFInfoPanels_Builder(dataSource, userInfo, options);
            } else {
                fieldGroups.push(getSAFInfoPanels_Info(dataSource, userInfo));
                fieldGroups.push(getSAFInfoPanels_WorkFlowInfo(dataSource, userInfo));
                fieldGroups.push(getSAFInfoPanels_WorkFlowInfo_Images(dataSource, userInfo));
                fieldGroups.push(getSAFInfoPanels_WorkFlowInfo_Files(dataSource, userInfo));
                fieldGroups.push(getSAFInfoPanels_WorkFlowInfo_Logs(dataSource, userInfo));

            }
            fieldGroups.push(getSAFInfoPanels_Existing(dataSource, userInfo));
            return fieldGroups;
        }



        function getSafCrewRecord(saf, childRecord, userInfo) {

            var fieldGroup = { id: 'saf-item', collapsed: false, fields: [] };
            fieldGroup.fields.push({ id: 'saf-crew-vendor', label: 'Contractor', type: twcUI.CTRL_TYPE.DROPDOWN, allowAll: false, dataSource: twcUtils.getVendors(userInfo), mandatory: true });
            fieldGroup.fields.push({ id: 'saf-crew-member', label: 'Person', type: twcUI.CTRL_TYPE.DROPDOWN, allowAll: false, dataSource: [], mandatory: true });
            fieldGroup.fields.push({ id: 'saf-crew-attend-as', label: 'Attend As', type: twcUI.CTRL_TYPE.DROPDOWN, allowAll: false, dataSource: [], mandatory: true });

            configUIFields.formatPanelFields(childRecord, fieldGroup);

            return fieldGroup;
        }





        function getSAFInfoPanels_Info(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-details', title: 'SAF info', collapsed: false, controls: [] };

            var detailsInfo = { id: 'site-access-details', fields: [] };
            fieldGroup.controls.push(detailsInfo);

            detailsInfo.fields.push({ id: twcSaf.Fields.NAME, label: 'SAF ID' })
            detailsInfo.fields.push({ id: twcSaf.Fields.SAF_AUTHOR, label: 'Author' })
            detailsInfo.fields.push({ id: twcSaf.Fields.CREATED, label: 'Submitted On' })
            detailsInfo.fields.push({ id: twcSaf.Fields.START_TIME_BLOCK, label: 'Start' })
            detailsInfo.fields.push({ id: twcSaf.Fields.END_TIME_BLOCK, label: 'End', lineBreak: true })

            detailsInfo.fields.push({ id: twcSaf.Fields.SITE, label: 'Site' })
            detailsInfo.fields.push({ id: twcSaf.Fields.R_TYPE, label: 'Type' });
            detailsInfo.fields.push({ id: twcSaf.Fields.STATUS, label: 'Status', lineBreak: true })

            detailsInfo.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })
            detailsInfo.fields.push({ id: twcSaf.Fields.PRIMARY_CONTRACTOR, label: 'Primary Contractor' })
            detailsInfo.fields.push({ id: twcSaf.Fields.PICW, label: 'PICW', lineBreak: true });


            detailsInfo.fields.push({ id: twcSaf.Fields.MAST_ACCESS, label: 'Mast Access' })
            detailsInfo.fields.push({ id: twcSaf.Fields.TL_BUILDING_ACCESS, label: 'TL Building Access' })
            detailsInfo.fields.push({ id: twcSaf.Fields.ROOFTOP_ACCESS, label: 'Rooftop Access' })
            detailsInfo.fields.push({ id: twcSaf.Fields.ELECTRICAL_WORKS, label: 'Electrical Works' })
            detailsInfo.fields.push({ id: twcSaf.Fields.CRANE__CHERRYPICKER, label: 'Crane / Cherrypicker', lineBreak: true })

            var siteInfraStructures = twcUtils.getInfraStructures(dataSource);
            if (dataSource[twcSaf.Fields.MAST_ACCESS] == 'T') { detailsInfo.fields.push({ id: twcSaf.Fields.STRUCTURE, label: 'Structure', dataSource: siteInfraStructures.filter(s => { return s.type == twcUtils.InfraType.Structure }) }) }
            if (dataSource[twcSaf.Fields.TL_BUILDING_ACCESS] == 'T') { detailsInfo.fields.push({ id: twcSaf.Fields.ACCOMMODATION, label: 'Accommodation', dataSource: siteInfraStructures.filter(s => { return s.type == twcUtils.InfraType.Accommodation }), lineBreak: true }); }
            detailsInfo.fields.push({ id: twcSaf.Fields.SUMMARY_OF_WORKS, label: 'Summary of Works', width: '100%', rows: 5, lineBreak: true });

            var infoLists = { id: 'site-access-lists', collapsed: false, renderAsTable: true, fields: [] };
            fieldGroup.controls.push(infoLists);

            infoLists.fields.push({
                id: `${twcSafTimeBlock.Type}`, label: 'Time Blocks',
                fields: {
                    [twcSafTimeBlock.Fields.BLOCK_DATE]: 'Date',
                    [twcSafTimeBlock.Fields.BLOCK]: 'Block',

                },
                where: { [twcSafTimeBlock.Fields.SAF]: dataSource.id },
                FieldsInfo: twcSafTimeBlock.FieldsInfo
            });

            infoLists.fields.push({
                id: `${twcSafCrew.Type}`, label: 'Crew / Visitors',
                fields: {
                    contractor: 'Contractor',
                    [twcSafCrew.Fields.MEMBER]: 'Name',
                    [twcSafCrew.Fields.ATTEND_AS]: 'Role',
                },
                dataSource: twcUtils.getSafCrew(dataSource),
                //where: { [twcSafCrew.Fields.SAF]: dataSource.id },
                FieldsInfo: twcSafCrew.FieldsInfo,
                styles: { width: '750px', 'padding-left': '7px' }
            });




            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }


        function getSAFInfoPanels_WorkFlowInfo(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-workflow', title: 'Workflow info', collapsed: false, controls: [] };
            var workFlowInfo = { id: 'site-access-workflow-info', collapsed: false, fields: [] };
            fieldGroup.controls.push(workFlowInfo);

            workFlowInfo.fields.push({ id: twcSaf.Fields.STATUS_COMMENTS, width: '100%', rows: 3, label: 'Status Comments', lineBreak: true })
            workFlowInfo.fields.push({ id: twcSaf.Fields.WORKS_PHOTOS_REQ_DELAY, label: 'Works Photos Req. Delay' })
            workFlowInfo.fields.push({ id: twcSaf.Fields.COMPLETION_REVIEWER, label: 'Completion Reviewer' })
            workFlowInfo.fields.push({ id: twcSaf.Fields.COMPLETION_PHOTOS_REQUESTED, label: 'Photos Requested' })
            workFlowInfo.fields.push({ id: twcSaf.Fields.COMPLETION_PHOTOS_RECEIVED, label: 'Photos Received', lineBreak: true })
            workFlowInfo.fields.push({ id: twcSaf.Fields.REVIEW_COMMENT, width: '100%', rows: 5, label: 'Review Comment', lineBreak: true })

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }

        function getSAFInfoPanels_WorkFlowInfo_Images(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-workflow-images', title: 'Completion Photos', collapsed: false, controls: [] };
            var workFlowLogsInfo = { id: 'site-access-logs', collapsed: false, fields: [] };
            fieldGroup.controls.push(workFlowLogsInfo);
            workFlowLogsInfo.fields.push({
                id: `${twcFile.Type}`, label: 'Completion Photos',
                fields: {
                    [twcFile.Fields.CREATED]: 'Uploaded Date',
                    [twcFile.Fields.NAME]: 'File Name',
                    [twcFile.Fields.R_TYPE + '_name']: 'Type',
                    [twcFile.Fields.DESCRIPTION]: 'Description',
                    ['preview_link']: {
                        title: 'view',
                        styles: { width: '50px' }
                    }
                },
                dataSource: twcUtils.getSafImages(dataSource),
                FieldsInfo: twcSafLog.FieldsInfo,
                showToolbar: false,
            });
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }

        function getSAFInfoPanels_WorkFlowInfo_Files(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-workflow-files', title: 'Contractor Files', collapsed: false, controls: [] };
            var workFlowLogsInfo = { id: 'site-access-files', collapsed: false, fields: [] };
            fieldGroup.controls.push(workFlowLogsInfo);
            workFlowLogsInfo.fields.push({
                id: `${twcFile.Type}`, label: 'Contractor Files',
                fields: {
                    [twcFile.Fields.CREATED]: 'Uploaded Date',
                    [twcFile.Fields.NAME]: 'File Name',
                    [twcFile.Fields.R_TYPE + '_name']: 'Type',
                    [twcFile.Fields.DESCRIPTION]: 'Description',
                    ['preview_link']: {
                        title: 'view',
                        styles: { width: '50px' }
                    }
                },
                dataSource: twcUtils.getSafContractorFiles(dataSource),
                FieldsInfo: twcSafLog.FieldsInfo,
                showToolbar: false,
            });
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }


        function getSAFInfoPanels_WorkFlowInfo_Logs(dataSource, userInfo) {
            var fieldGroup = { id: 'site-access-workflow-logs', title: 'SAF Logs', collapsed: false, controls: [] };
            var workFlowLogsInfo = { id: 'site-access-logs', collapsed: false, fields: [] };
            fieldGroup.controls.push(workFlowLogsInfo);
            workFlowLogsInfo.fields.push({
                id: `${twcSafLog.Type}`,
                fields: {
                    [twcSafLog.Fields.CREATED]: 'Date/Time',
                    [twcSafLog.Fields.PROFILE]: 'Profile',
                    [twcSafLog.Fields.LOG_TYPE]: 'Log Type',
                    [twcSafLog.Fields.MESSAGE]: 'Message',
                    [twcSafLog.Fields.ADDITIONAL_INFO]: 'Info',

                },
                where: { [twcSafLog.Fields.SAF]: dataSource.id },
                orderBy: { created: 'desc' },
                showToolbar: false,
                FieldsInfo: twcSafLog.FieldsInfo,
                onColumnInit: (tbl, col) => {
                    if (col.id == twcSafLog.Fields.LOG_TYPE) {
                        col.formatValue = (v) => {
                            return twcSafLog.getStatusHtml(v)
                        }
                    }

                }
            });

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }




        //#region JESNA

        // function getSAFInfoPanels_Info(dataSource, userInfo) {
        //     var fieldGroup = { id: 'site-access-details', title: 'SAF info', collapsed: false, controls: [] };

        //     var detailsInfo = { id: 'site-access-details', title: 'Details', fields: [] };
        //     fieldGroup.controls.push(detailsInfo);

        //     detailsInfo.fields.push({ id: twcSaf.Fields.SAF_ID, label: 'SAF ID' })
        //     detailsInfo.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })
        //     detailsInfo.fields.push({ id: twcSaf.Fields.STATUS, label: 'Status' })
        //     // detailsInfo.fields.push({ id: twcSaf.Fields.START_TIME_BLOCK, label: 'Start' })          
        //     // detailsInfo.fields.push({ id: twcSaf.Fields.END_TIME_BLOCK, label: 'End' })          

        //     configUIFields.formatPanelFields(dataSource, fieldGroup);

        //     return fieldGroup;
        // }

        // function getSAFInfoPanels_Existing_details(dataSource, userInfo) {

        //     var fieldGroup = { id: 'site-access-existing-info', collapsed: false, controls: [] };

        //     var safDetailsInfo = { id: 'ite-access-existing-safs-det', title: 'Details', collapsed: true, fields: [] };
        //     fieldGroup.controls.push(safDetailsInfo);

        //     safDetailsInfo.fields.push({ id: twcSaf.Fields.SAF_ID, label: 'SAF ID' })
        //     safDetailsInfo.fields.push({ id: twcSaf.Fields.STATUS, label: 'Submitted' })
        //     safDetailsInfo.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Author' })

        //     var safDetailsStatus = { id: 'ite-access-existing-safs-det-status', title: 'Status', collapsed: true, fields: [] };
        //     fieldGroup.controls.push(safDetailsStatus);
        //     safDetailsStatus.fields.push({ id: twcSaf.Fields.STATUS, label: 'Current Status' })
        //     safDetailsStatus.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'History' })
        //     configUIFields.formatPanelFields(dataSource, safDetailsStatus);


        //     var safDetailsReq = { id: 'ite-access-existing-safs-det-accreq', title: 'Access Requirements', collapsed: true, fields: [] };
        //     fieldGroup.controls.push(safDetailsReq);
        //     safDetailsReq.fields.push({ id: twcSaf.Fields.R_TYPE, label: 'Access Type' })
        //     safDetailsReq.fields.push({ id: twcSaf.Fields.MAST_ACCESS, label: 'Mast Access' })
        //     safDetailsReq.fields.push({ id: twcSaf.Fields.ROOFTOP_ACCESS, label: 'Rooftop Access' })
        //     safDetailsReq.fields.push({ id: twcSaf.Fields.TL_BUILDING_ACCESS, label: 'TC Building Access' })
        //     configUIFields.formatPanelFields(dataSource, safDetailsReq);

        //     var safDetailsAccDet = { id: 'ite-access-existing-safs-det-accdet', title: 'Access Details', collapsed: true, fields: [] };
        //     fieldGroup.controls.push(safDetailsAccDet);
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Customer' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.PRIMARY_CONTRACTOR, label: 'Primary Contractor' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.SUMMARY_OF_WORKS, label: 'Summary of Works' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Key' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.STATUS, label: 'SRF' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.STATUS, label: 'PSDP' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'PSCS' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.PICW, label: 'PICW' })
        //     safDetailsAccDet.fields.push({ id: twcSaf.Fields.CUSTOMER, label: 'Key' })

        //     configUIFields.formatPanelFields(dataSource, safDetailsAccDet);

        //     safDetailsInfo.fields.push({
        //         id: `${twcSaf.Type}`, label: 'Crew / Visitors',
        //         fields: {
        //             [twcSaf.Fields.SAF_ID]: 'Company',
        //             [twcSaf.Fields.CUSTOMER]: 'Name',
        //             [twcSaf.Fields.R_TYPE]: 'Role',
        //         },
        //         where: { [twcSaf.Fields.SITE]: dataSource.siteId },
        //         FieldsInfo: twcSaf.FieldsInfo
        //     });

        //     var safDetailsAccDoc = { id: 'ite-access-existing-safs-det-doc', title: 'Documentation', collapsed: true, fields: [] };
        //     fieldGroup.controls.push(safDetailsAccDoc);
        //     safDetailsAccDoc.fields.push({ id: twcSaf.Fields.STATUS, label: 'Health & Safety' })
        //     safDetailsAccDoc.fields.push({ id: twcSaf.Fields.STATUS, label: 'Method Statements' })
        //     configUIFields.formatPanelFields(dataSource, safDetailsAccDoc);

        //     safDetailsInfo.fields.push({
        //         id: `${twcSaf.Type}`, label: 'Time Blocks',
        //         fields: {
        //             [twcSaf.Fields.SAF_ID]: 'Time',
        //             [twcSaf.Fields.CUSTOMER]: 'Date',
        //         },
        //         where: { [twcSaf.Fields.SITE]: dataSource.siteId },
        //         FieldsInfo: twcSaf.FieldsInfo
        //     });

        //     var safDetailsAccEq = { id: 'ite-access-existing-safs-det-eq', title: 'Planned Equipment Work', collapsed: true, fields: [] };
        //     fieldGroup.controls.push(safDetailsAccEq);


        //     safDetailsInfo.fields.push({
        //         id: `${twcSaf.Type}`, label: 'Text In/Out',
        //         fields: {
        //             [twcSaf.Fields.SAF_ID]: 'Received',
        //             [twcSaf.Fields.CUSTOMER]: 'Type',
        //             [twcSaf.Fields.CUSTOMER]: 'Sender',
        //             [twcSaf.Fields.CUSTOMER]: 'Number',
        //         },
        //         where: { [twcSaf.Fields.SITE]: dataSource.siteId },
        //         FieldsInfo: twcSaf.FieldsInfo
        //     });

        //     configUIFields.formatPanelFields(dataSource, safDetailsInfo);
        //     return safDetailsInfo;
        // }

        // function injectToggleColumn(panel) {

        //     if (!panel || !panel.controls) return panel;
        //     var displayState = ''

        //     for (var i = 0; i < panel.controls.length; i++) {

        //         var control = panel.controls[i];

        //         if (control.type === "table" && control.id === "customrecord_twc_saf") {

        //             control.columns.unshift({
        //                 id: "toggle",
        //                 title: " "
        //             });

        //             if (control.dataSource) {

        //                 for (var j = 0; j < control.dataSource.length; j++) {

        //                     var row = control.dataSource[j];
        //                     var safId = row.custrecord_twc_saf_id;

        //                     if (!row._isDisplay) {
        //                         row._isDisplay = 'none';
        //                     }

        //                     var isOpen = row._isDisplay === 'block';
        //                     var symbol = isOpen ? '-' : '+';
        //                     displayState = isOpen ? 'none' : 'block';

        //                     row.toggle =
        //                         `<div data-saf-id="test123" style="text-align:center;cursor:pointer;"
        //                 onclick="
        //                 var d=this.getAttribute('data-display')==='block'?'none':'block';
        //                 this.setAttribute('data-display',d);
        //                  this.innerHTML=(d==='block'?'-':'+');

        //                 ">
        //                  ${symbol}
        //                 </div>`;
        //                 }
        //             }

        //             break;
        //         }
        //     }
        //     let test = {};
        //     test.obj = (panel)
        //     test.display = displayState
        //     //throw new Error(JSON.stringify(obj))
        //     return test
        // }

        //#endregion


        return {
            getSafCrewRecord: getSafCrewRecord,
            getSafTableFields: getSafTableFields,
            getSAFInfoPanels: getSAFInfoPanels,
            renderTimeBlocks: renderTimeBlocks
        }
    });

