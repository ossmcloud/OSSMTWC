/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_itm_type';
        var _recordFields = {
            NAME: 'name',
            STEP_TYPE: 'custrecord_twc_srf_itm_type_stype',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            STEP_TYPE: { name: 'custrecord_twc_srf_itm_type_stype', type: 'select', alias: 'steptype', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_stype,' },
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
            
            get steptype() {
                return this.get(_recordFields.STEP_TYPE);
            } set steptype(value) {
                this.set(_recordFields.STEP_TYPE, value)
            }
            get steptypeName() { return this.getText(_recordFields.STEP_TYPE); }
            
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
