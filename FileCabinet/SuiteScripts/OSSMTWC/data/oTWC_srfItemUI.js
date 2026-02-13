/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_srf.js', './oTWC_srfItem.js', './oTWC_file.js'],
    (runtime, core, coreSQL, twcUtils, twcSrf, twcSrfItem, twcFile) => {

        function getUIFields(srf, srfItem) {

            var fieldGroup = { id: 'srf-item', title: 'Main', collapsed: false, controls: [] };

            var basicInfo = { id: 'srf-item-info', title: 'Basic Info', fields: [] };
            fieldGroup.controls.push(basicInfo);

            basicInfo.fields.push({ id: twcSrfItem.Fields.REQUEST_TYPE, label: 'Request Type' })
            basicInfo.fields.push({ id: twcSrfItem.Fields.ITEM_TYPE, label: 'Item Type', dataSource: coreSQL.run(`select id as value, name as text from customrecord_twc_srf_itm_type where isinactive='F' and custrecord_twc_srf_itm_type_stype = ${srfItem.stepType} order by name`) })
            basicInfo.fields.push({ id: twcSrfItem.Fields.DESCRIPTION, label: 'Description' })



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
                }
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

