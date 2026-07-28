/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_icons.js', './oTWC_utils.js', './oTWC_srf.js', './oTWC_srfItem.js', './oTWC_equipmentType.js', './oTWC_file.js', './oTWC_equipment.js'],
    (runtime, core, coreSQL, twcUI, twcIcons, twcUtils, twcSrf, twcSrfItem, twcEquipmentType, twcFile, twcEquipment) => {

        function getUIFields(srf, srfItem, userInfo) {
            //throw new Error(JSON.stringify(core.utils.classToObject(srfItem)))
            var fieldGroup = { id: 'srf-item', title: 'Main', collapsed: false, controls: [] };

            var isNewRecord = !srfItem.id;
            // @@NOTE: if we have a parent is because this ATME is being added with a new TME
            var isNewRecordAtme = (srfItem.stepType == twcSrfItem.StepType.ATME || srfItem.stepType == twcSrfItem.StepType.FEEDER) && srfItem.child;

            var siteInfraStructures = twcUtils.getInfraStructures({ siteId: srf.site }, userInfo.isEmployee);
            var siteStructures = siteInfraStructures.filter(s => { return s.type == twcUtils.InfraType.Structure })


            var basicInfo = { id: 'srf-item-info', title: 'Basic Info', fields: [] };
            fieldGroup.controls.push(basicInfo);

            basicInfo.fields.push({ id: twcSrfItem.Fields.REQUEST_TYPE, label: 'Request Type', mandatory: true, readOnly: (!isNewRecord || isNewRecordAtme) })
            basicInfo.fields.push({ type: twcUI.CTRL_TYPE.TEXT, id: 'srf-equipment', label: 'Equipment', mandatory: true, hide: true, readOnly: true })
            basicInfo.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'srf-pick-equipment', label: '', value: '...', hide: true });

            if (srfItem.stepType == twcSrfItem.StepType.ATME || srfItem.stepType == twcSrfItem.StepType.FEEDER) {
                if (srfItem.child) {
                    // @@NOTE: if we have a parent is because this ATME is being added with a new TME

                } else {
                    basicInfo.fields.push({ type: twcUI.CTRL_TYPE.TEXT, id: 'srf-tme-equipment', label: 'TME', mandatory: true, readOnly: true })
                    basicInfo.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'srf-pick-tme-equipment', label: '', value: '...' });
                }
            }

            basicInfo.fields.push({ id: twcSrfItem.Fields.ITEM_TYPE, label: 'Item Type', mandatory: true, hide: true, dataSource: twcEquipmentType.lookUp(srfItem.stepType) })
            basicInfo.fields.push({ type: twcUI.CTRL_TYPE.BUTTON, id: 'srf-pick-from-library', label: '', value: 'Pick From Library', disabled: isNewRecord, lineBreak: true });
            basicInfo.fields.push({ type: twcUI.CTRL_TYPE.PANEL, id: 'srf-pick-from-library-msg', styles: { color: 'var(--accent-fore-color)', padding: '7px', display: 'none' } })
            basicInfo.fields.push({ id: twcSrfItem.Fields.DESCRIPTION, label: 'Description', width: '100%' })

            if (srfItem.stepType != twcSrfItem.StepType.FEEDER) {

                var dimensionInfo = { id: 'srf-item-dimension', title: 'Equipment Details', hide: isNewRecord, fields: [] };
                fieldGroup.controls.push(dimensionInfo);
                dimensionInfo.fields.push({ id: twcSrfItem.Fields.STRUCTURE, label: 'Structure', width: '250px', allowAll: false, value: srfItem.get(twcSrfItem.Fields.STRUCTURE), dataSource: siteStructures, mandatory: (srfItem.stepType != twcSrfItem.StepType.GIE), noAutoSelect: (srfItem.stepType == twcSrfItem.StepType.GIE) });
                dimensionInfo.fields.push({ id: twcSrfItem.Fields.MAKE, label: 'Make', mandatory: true })
                dimensionInfo.fields.push({ id: twcSrfItem.Fields.MODEL, label: 'Model', mandatory: true })
                dimensionInfo.fields.push({ id: twcSrfItem.Fields.LENGTH_MM, label: 'Length (mm)', mandatory: true })
                dimensionInfo.fields.push({ id: twcSrfItem.Fields.WIDTH_MM, label: 'Width (mm)', mandatory: true })
                dimensionInfo.fields.push({ id: twcSrfItem.Fields.DEPTH_MM, label: 'Depth (mm)', mandatory: true })
                if (srfItem.stepType != twcSrfItem.StepType.GIE) {
                    dimensionInfo.fields.push({ id: twcSrfItem.Fields.WEIGHT_KG, label: 'Weight (kg)', mandatory: true })
                    dimensionInfo.fields.push({ id: twcSrfItem.Fields.HEIGHT_ON_TOWER, label: 'Height on Tower', mandatory: true })
                }
                dimensionInfo.fields.push({ type: twcUI.CTRL_TYPE.NUMBER, id: twcSrfItem.Fields.EQUIPMENT_LIBRARY, label: 'Eq. Lib', hide: true })
            }

            var specInfo = { id: 'srf-item-spec', title: 'Specifications', hide: isNewRecord, fields: [] };
            if (srfItem.stepType == twcSrfItem.StepType.TME) {
                specInfo.fields.push({ id: twcSrfItem.Fields.VOLTAGE_TYPE, label: 'Voltage Type', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.VOLTAGE_RANGE, label: 'Voltage Range', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.AZIMUTH, label: 'Azimuth', min: 0, max: 360, mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.B_END, label: 'B-End', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.CUSTOMER_REF, label: 'Customer Ref.', mandatory: true })

            } else if (srfItem.stepType == twcSrfItem.StepType.FEEDER) {
                specInfo.fields.push({ id: twcSrfItem.Fields.STRUCTURE, label: 'Structure', width: '250px', allowAll: false, value: srfItem.get(twcSrfItem.Fields.STRUCTURE), dataSource: siteStructures, mandatory: true });
                specInfo.fields.push({ id: twcSrfItem.Fields.TYPE_OPT, label: 'Type Opt', dataSource: twcUtils.getSrfItemTypeOpts(), mandatory: true })

            }

            if (userInfo.isEmployee && srfItem.stepType != twcSrfItem.StepType.FEEDER) {
                specInfo.fields.push({ id: twcSrfItem.Fields.INVENTORY_FLAG, label: 'Equipment Flag' })
            }

            if (specInfo.fields.length > 0) { fieldGroup.controls.push(specInfo); }

            if (srfItem.stepType == twcSrfItem.StepType.TME) {

                var relatedEqPanel = { id: 'srf-related-eq', title: 'Related Equipment', hide: isNewRecord, fields: [] };
                fieldGroup.controls.push(relatedEqPanel);

                var relatedEqTableControl = {
                    id: `srf-related-eq-table`,
                    type: twcUI.CTRL_TYPE.TABLE,
                    label: 'related equipment (ATME / FEEDERS)',
                    columns: [
                        { id: twcSrfItem.Fields.STEP_TYPE + '_name', title: 'Class' },
                        { id: twcSrfItem.Fields.ITEM_TYPE + '_name', title: 'Type' },
                        { id: twcSrfItem.Fields.DESCRIPTION, title: 'Description' },
                    ],
                    dataSource: getSrfAdditionalEquipment(srf, srfItem, userInfo),
                    showToolbar: true,
                    showEditDelete: true,
                    newToolBarButton: `
                        <div class="twc-table-toolbar-button" data-eq-class="${twcSrfItem.StepType.ATME}">
                            <div style="vertical-align: bottom; padding-bottom: 1px;">
                                ${twcIcons.get('addNew', 16)}
                            </div>
                            <div>
                                ADD ATME
                            </div>
                        </div>
                        <div class="twc-table-toolbar-button" data-eq-class="${twcSrfItem.StepType.FEEDER}">
                            <div style="vertical-align: bottom; padding-bottom: 1px;">
                                ${twcIcons.get('addNew', 16)}
                            </div>
                            <div>
                                ADD FEEDER
                            </div>
                        </div>
                    `
                }
                relatedEqPanel.fields.push(relatedEqTableControl);

                

            }

            return fieldGroup;
        }

        function getSrfAdditionalEquipment(srf, srfItem, userInfo) {

            return srfItem.relatedItems || [];

            return [];
        }


        function getStepTableUIControl(userInfo, srf, stepType, dataSource) {


            var fields = {
                [twcSrfItem.Fields.REQUEST_TYPE]: { title: 'Request Type', styles: { width: '150px' } },
                [twcSrfItem.Fields.EQUIPMENT_ID]: { title: 'Equipment', nullText: '', styles: { width: '200px' } },
                [twcSrfItem.Fields.ITEM_TYPE]: { title: 'Type', nullText: '', styles: { width: '150px' } },
                [twcSrfItem.Fields.DESCRIPTION]: 'Description'
            }

            if (stepType == twcSrfItem.StepType.FEEDER) {
                fields[twcSrfItem.Fields.TYPE_OPT] = 'Type Opt';
                //fields[twcSrfItem.Fields.DESCRIPTION] = 'Description';
            } else {
                fields[twcSrfItem.Fields.MAKE] = 'Make';
                fields[twcSrfItem.Fields.MODEL] = 'Model';
                //fields[twcSrfItem.Fields.DESCRIPTION] = 'Description';
                if (stepType == twcSrfItem.StepType.TME || stepType == twcSrfItem.StepType.ATME) { fields[twcSrfItem.Fields.HEIGHT_ON_TOWER] = 'Height on Tower'; }
                fields[twcSrfItem.Fields.LENGTH_MM] = 'Length (mm)';
                fields[twcSrfItem.Fields.WIDTH_MM] = 'Width (mm)';
                fields[twcSrfItem.Fields.DEPTH_MM] = 'Depth (mm)';
                if (stepType == twcSrfItem.StepType.TME || stepType == twcSrfItem.StepType.ATME) { fields[twcSrfItem.Fields.WEIGHT_KG] = 'Weight (kg)'; }

                if (userInfo.isEmployee) {
                    fields[twcSrfItem.Fields.INVENTORY_FLAG] = { title: 'Flag', styles: { width: '75px' } };
                }

            }

            
            var label = '';
            if (stepType == twcSrfItem.StepType.TME) {
                label = 'Request Tower Mounted Equipment (TME) Installation / Removal';
            } else if (stepType == twcSrfItem.StepType.ATME) {
                label = 'Request Additional Tower Mounted Equipment (ATME) Installation / Removal';
            } else if (stepType == twcSrfItem.StepType.GIE) {
                label = 'Request Ground/Indoor Equipment (GIE) Installation / Removal';
            } else if (stepType == twcSrfItem.StepType.FEEDER) {
                label = 'Request Feeders Installation / Removal';
            } else {
                throw new Error(`Invalid SRF Item Step Type: ${stepType}`);
            }

            var items = null;
            if (dataSource) {
                items = dataSource.filter(i => { return i[twcSrfItem.Fields.STEP_TYPE] == stepType; })
            } else {
                items = twcSrfItem.select(
                    {
                        fields: fields,
                        where: {
                            [twcSrfItem.Fields.SRF]: srf.id || 0,
                            [twcSrfItem.Fields.STEP_TYPE]: stepType,
                        },
                        useNames: true
                    }
                );
            }

            return {
                id: `${twcSrfItem.Type}_${stepType}`, recordType: twcSrfItem.Type, label: label,
                fields: fields,
                dataSource: items,
                FieldsInfo: twcSrfItem.FieldsInfo
            }

        }



        function getFileTableUIControl(userInfo, srf) {
            var fields = {
                [twcFile.Fields.NAME]: {
                    title: 'Name',
                    link: {
                        url: 'onclick="twc.page.previewFile({ twcFile: ${id}} )"',
                        valueField: 'id',
                        target: '_self'
                    }
                },
                [twcFile.Fields.DESCRIPTION]: 'Description',
                [twcFile.Fields.REVISION]: 'Revision',

            };

            var files = twcFile.select({
                fields: fields,
                where: {
                    [twcFile.Fields.RECORD_TYPE]: twcSrf.Type,
                    [twcFile.Fields.RECORD_ID]: srf.id || 0,
                },
                useNames: true
            })

            srf.files = files;

            return {
                id: `${twcFile.Type}`, label: 'Step 4 of 5: Drawings/GAD & Documents',
                fields: fields,
                dataSource: files
            }

        }




        return {
            RecordType: twcSrfItem.Type,
            StepType: twcSrfItem.StepType,
            getStepTableUIControl: getStepTableUIControl,
            getFileTableUIControl: getFileTableUIControl,

            getUIFields: getUIFields

        }
    });


