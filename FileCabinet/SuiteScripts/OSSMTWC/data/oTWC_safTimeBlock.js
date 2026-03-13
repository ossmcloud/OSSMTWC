/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_safTimeBlockPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSafTimeBlock, twcUtils) => {



        class OSSMTWC_SAFTimeBlock extends twcSafTimeBlock.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafTimeBlock.Type,
            Fields: twcSafTimeBlock.Fields,
            FieldsInfo: twcSafTimeBlock.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_SAFTimeBlock(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAFTimeBlock();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSafTimeBlock.Type);
            }



        }
    });
