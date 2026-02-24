/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_itm_type';
        var _recordFields = {
            NAME: 'name',
            EQ_TYPE: 'custrecord_twc_srf_itm_type_eqtype',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            EQ_TYPE: { name: 'custrecord_twc_srf_itm_type_eqtype', type: 'select', alias: 'eqType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_eqtype,' },
        }

        class OSSMTWC_SRFItemType extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get eqType() {
                return this.get(_recordFields.EQ_TYPE);
            } set eqType(value) {
                this.set(_recordFields.EQ_TYPE, value)
            }
            get eqTypeName() { return this.getText(_recordFields.EQ_TYPE); }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            PersistentRecord: OSSMTWC_SRFItemType,

            get: function (id) {
                var rec = new OSSMTWC_SRFItemType(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SRFItemType();
                return rec.select(options);
            }

        }
    });
