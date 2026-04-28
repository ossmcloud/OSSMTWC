/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_config.js', './oTWC_equipmentLib.js', './oTWC_equipment.js', './oTWC_srfItem.js'],
    (core, coreSQL, twcUtils, twcConfig, twcEqLib, twcEq, twcSrfItem) => {





        function getLibTableFields() {
            var eqLibFields = [
                { field: twcEqLib.Fields.NAME, title: 'Spec. ID' },
                { field: twcEqLib.Fields.MAKE, title: 'Make', addCount: true },
                { field: twcEqLib.Fields.MODEL, title: 'Model' },
                { field: twcEqLib.Fields.DESCRIPTION, title: 'Description' },
                { field: twcEqLib.Fields.LENGTH_MM, title: 'Length<br />(mm)', type: 'int', styles: { width: '100px' } },
                { field: twcEqLib.Fields.WIDTH_MM, title: 'Width<br />(mm)', type: 'int' },
                { field: twcEqLib.Fields.HEIGHTDEPTH_MM, title: 'Depth<br />(mm)', type: 'int' },
                { field: twcEqLib.Fields.WEIGHT_KG, title: 'Weight<br />(Kg)', type: 'float' },
                { field: twcEqLib.Fields.VOLTAGE_TYPE + '_name', title: 'Voltage<br />Type', styles: {'text-align': 'center'} },
                { field: twcEqLib.Fields.VOLTAGE_RANGE + '_name', title: 'Voltage<br />Range', styles: { 'text-align': 'center' } },
                { field: twcEqLib.Fields.ALIAS, title: 'Alias' },
            ];
            return eqLibFields;
        }


        function getLibToEquipmentFieldMap() {
            var map = [
                { libField: twcEqLib.Fields.LENGTH_MM, eqField: twcSrfItem.Fields.LENGTH_MM },
                { libField: twcEqLib.Fields.WIDTH_MM, eqField: twcSrfItem.Fields.WIDTH_MM },
                { libField: twcEqLib.Fields.HEIGHTDEPTH_MM, eqField: twcSrfItem.Fields.DEPTH_MM },
                { libField: null, eqField: twcSrfItem.Fields.HEIGHT_ON_TOWER },
                { libField: twcEqLib.Fields.WEIGHT_KG, eqField: twcSrfItem.Fields.WEIGHT_KG },

                { libField: twcEqLib.Fields.VOLTAGE_TYPE, eqField: twcSrfItem.Fields.VOLTAGE_TYPE, tmeOnly: true },
                { libField: twcEqLib.Fields.VOLTAGE_RANGE, eqField: twcSrfItem.Fields.VOLTAGE_RANGE, tmeOnly: true },
                { libField: null, eqField: twcSrfItem.Fields.AZIMUTH, tmeOnly: true },
                { libField: null, eqField: twcSrfItem.Fields.B_END, tmeOnly: true },
                { libField: null, eqField: twcSrfItem.Fields.CUSTOMER_REF, tmeOnly: true },
                { libField: null, eqField: twcSrfItem.Fields.INVENTORY_FLAG, tmeOnly: true },
            ];
            return map;
        }


        return {
            Fields: twcEqLib.Fields,
            getLibTableFields: getLibTableFields,
            getLibToEquipmentFieldMap: getLibToEquipmentFieldMap,
        }
    });

