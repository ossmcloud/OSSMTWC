/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_srf.js', './oTWC_srfItem.js', './oTWC_srfItemType.js', './oTWC_file.js', './oTWC_equipment.js'],
    (runtime, core, coreSQL, twcUtils, twcSrf, twcSrfItem, twcSrfItemType, twcFile, twcEquipment) => {

        function getUIFields(srf, srfItem) {
            

            var fieldGroup = { id: 'srf-item', title: 'Main', collapsed: false, controls: [] };

            var basicInfo = { id: 'srf-item-info', title: 'Basic Info', fields: [] };
            fieldGroup.controls.push(basicInfo);

            basicInfo.fields.push({ id: twcSrfItem.Fields.REQUEST_TYPE, label: 'Request Type', mandatory: true })
            basicInfo.fields.push({ id: twcSrfItem.Fields.EQUIPMENT_ID, label: 'Equipment', mandatory: true, dataSource: twcEquipment.lookUp({ customer: srf.customer, stepType: srfItem.stepType }) })
            if (srfItem.stepType == twcSrfItem.StepType.ATME) {
                basicInfo.fields.push({ id: twcSrfItem.Fields.TME_ID, label: 'TME', mandatory: true, dataSource: twcEquipment.lookUp({ customer: srf.customer, stepType: twcSrfItem.StepType.TME }) })
            }
            basicInfo.fields.push({ id: twcSrfItem.Fields.ITEM_TYPE, label: 'Item Type', mandatory: true, lineBreak: true, dataSource: twcSrfItemType.lookUp(srfItem.stepType) })
            basicInfo.fields.push({ id: twcSrfItem.Fields.DESCRIPTION, label: 'Description', mandatory: true, width: '100%' })
            if (srfItem.stepType != twcSrfItem.StepType.GIE) {
                basicInfo.fields.push({ id: twcSrfItem.Fields.LOCATION, label: 'Location', mandatory: true })
            }

            var dimensionInfo = { id: 'srf-item-dimension', title: 'Dimensions / Location', fields: [] };
            fieldGroup.controls.push(dimensionInfo);
            dimensionInfo.fields.push({ id: twcSrfItem.Fields.LENGTH_MM, label: 'Length (mm)', mandatory: true })
            dimensionInfo.fields.push({ id: twcSrfItem.Fields.WIDTH_MM, label: 'Width (mm)', mandatory: true })
            dimensionInfo.fields.push({ id: twcSrfItem.Fields.DEPTH_MM, label: 'Depth (mm)', mandatory: true })
            dimensionInfo.fields.push({ id: twcSrfItem.Fields.HEIGHT_ON_TOWER, label: 'Height on Tower', mandatory: true })
            dimensionInfo.fields.push({ id: twcSrfItem.Fields.WEIGHT_KG, label: 'Weight (kg)', mandatory: true })

            if (srfItem.stepType == twcSrfItem.StepType.TME) {
                var specInfo = { id: 'srf-item-spec', title: 'Specifications', fields: [] };
                fieldGroup.controls.push(specInfo);

                specInfo.fields.push({ id: twcSrfItem.Fields.VOLTAGE_TYPE, label: 'Voltage Type', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.VOLTAGE_RANGE, label: 'Voltage Range', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.AZIMUTH, label: 'Azimuth', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.B_END, label: 'B-End', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.CUSTOMER_REF, label: 'Customer Ref.', mandatory: true })
                specInfo.fields.push({ id: twcSrfItem.Fields.INVENTORY_FLAG, label: 'Inventory Flag', mandatory: true })

            } else {
                dimensionInfo.fields.push({ id: twcSrfItem.Fields.INVENTORY_FLAG, label: 'Inventory Flag', mandatory: true })

            }

            if (srfItem.stepType != twcSrfItem.StepType.GIE) {
                // @@TODO: FEEDERS
            }

            return fieldGroup;
        }


        function getStepTableUIControl(srf, stepType) {
            var label = '';
            var fields = {
                [twcSrfItem.Fields.REQUEST_TYPE]: 'Request Type',
                [twcSrfItem.Fields.ITEM_TYPE]: 'Type',
                [twcSrfItem.Fields.DESCRIPTION]: 'Description',
                [twcSrfItem.Fields.LOCATION]: 'Location',
                [twcSrfItem.Fields.LENGTH_MM]: 'Length (mm)',
                [twcSrfItem.Fields.WIDTH_MM]: 'Width (mm)',
                [twcSrfItem.Fields.DEPTH_MM]: 'Depth (mm)',
                [twcSrfItem.Fields.HEIGHT_ON_TOWER]: 'Height on Tower',
                [twcSrfItem.Fields.WEIGHT_KG]: 'Weight (kg)',
            }

            if (stepType == twcSrfItem.StepType.TME) {
                label = 'Request Tower Mounted Equipment (TME) Installation / Removal';
                // @@TODO: add required fields
            } else if (stepType == twcSrfItem.StepType.ATME) {
                label = 'Request Additional Tower Mounted Equipment (ATME) Installation / Removal';
                // @@TODO: add required fields
            } else if (stepType == twcSrfItem.StepType.GIE) {
                label = 'Request Ground/Indoor Equipment (GIE) Installation / Removal';
                // @@TODO: add required fields
            } else {
                throw new Error(`Invalid SRF Item Step Type: ${stepType}`);
            }

            return {
                id: `${twcSrfItem.Type}_${stepType}`, recordType: twcSrfItem.Type, label: label,
                fields: fields,
                where: {
                    [twcSrfItem.Fields.SRF]: srf.id || 0,
                    [twcSrfItem.Fields.STEP_TYPE]: stepType,
                },
                FieldsInfo: twcSrfItem.FieldsInfo
            }

        }



        function getFileTableUIControl(srf, stepType) {
            return {
                id: `${twcFile.Type}`, label: 'Step 4 of 5: Drawings/GAD & Documents',
                fields: {
                    [twcFile.Fields.NAME]: 'Name',
                    [twcFile.Fields.DESCRIPTION]: 'Description',
                    [twcFile.Fields.STATUS]: 'Status',
                },
                where: {
                    [twcFile.Fields.RECORD_TYPE]: twcSrf.Type,
                    [twcFile.Fields.RECORD_ID]: srf.id || 0,
                }
            }

        }




        return {
            StepType: twcSrfItem.StepType,
            getStepTableUIControl: getStepTableUIControl,
            getFileTableUIControl: getFileTableUIControl,

            getUIFields: getUIFields

        }
    });

