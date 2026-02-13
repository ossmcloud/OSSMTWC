/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_srfItemPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSrfItem, twcUtils) => {

        const SRF_ITEM_STEP_TYPE = {
            TME: 1,
            ATME: 2,
            GIE: 3
        }

        class OSSMTWC_SRFItem extends twcSrfItem.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSrfItem.Type,
            Fields: twcSrfItem.Fields,
            StepType: SRF_ITEM_STEP_TYPE,

            get: function (id) {
                var rec = new OSSMTWC_SRFItem(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SRFItem();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSrfItem.Type);
            }

        }
    });
