/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_srfItemTypePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSrfItemType, twcUtils) => {

      
        class OSSMTWC_SRFItemType extends twcSrfItemType.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSrfItemType.Type,
            Fields: twcSrfItemType.Fields,
            
            get: function (id) {
                var rec = new OSSMTWC_SRFItemType(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SRFItemType();
                return rec.select(options);
            },

            lookUp: function (stepType) {

                var o = { fields: { id: 'value' } };
                o.fields[twcSrfItemType.Fields.NAME] = 'text';

                o.where = {};
                o.where[twcSrfItemType.Fields.EQ_TYPE] = stepType || 0;

                o.orderBy = [twcSrfItemType.Fields.NAME];

                return this.select(o)
            },

            getFields: () => {
                return twcUtils.getFields(twcSrfItemType.Type);
            }

        }
    });
