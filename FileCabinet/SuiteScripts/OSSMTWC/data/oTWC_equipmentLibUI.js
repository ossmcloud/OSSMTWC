/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_config.js', './oTWC_equipmentLib.js'],
    ( core, coreSQL, twcUtils, twcConfig, twcEqLib) => {





        function getLibTableFields() {
            var eqLibFields = [
                { field: twcEqLib.Fields.SPEC_ID, title: 'Spec.ID' },
                { field: twcEqLib.Fields.MAKE, title: 'Make' },
                { field: twcEqLib.Fields.MODEL, title: 'Model' },
                { field: twcEqLib.Fields.DESCRIPTION, title: 'Description' },
            ];
            return eqLibFields;
        }





        return {
            Fields: twcEqLib.Fields,
            getLibTableFields: getLibTableFields,

        }
    });

