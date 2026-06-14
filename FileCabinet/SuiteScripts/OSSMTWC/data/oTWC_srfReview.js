/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_srfReviewPersistent.js', './oTWC_config.js'],
    (core, coreSQL, twcSafReview, twcConfig) => {

        class OSSMTWC_SRFReview extends twcSafReview.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafReview.Type,
            Fields: twcSafReview.Fields,
            FieldsInfo: twcSafReview.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_SRFReview(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SRFReview();
                return rec.select(options);
            },

            getFields: () => {
                return twcConfig.getFields(twcSafReview.Type);
            }



        }
    });
