/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_eq_action';
        var _recordFields = {
            NAME: 'name',
            EA_EQUIPMENT: 'custrecord_twc_eq_action_eq',
            EA_SRF: 'custrecord_twc_eq_action_srf',
            EA_SRF_ITEM: 'custrecord_twc_eq_action_srf_item',
            EA_SAF: 'custrecord_twc_eq_action_saf',
            EA_TYPE: 'custrecord_twc_eq_action_type',
            RELATED_EA: 'custrecord_twc_eq_real_ea',
            EA_STATUS: 'custrecord_twc_eq_action_sts',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            EA_EQUIPMENT: { name: 'custrecord_twc_eq_action_eq', type: 'select', alias: 'eAEquipment', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip' },
            EA_SRF: { name: 'custrecord_twc_eq_action_srf', type: 'select', alias: 'eASRF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf' },
            EA_SRF_ITEM: { name: 'custrecord_twc_eq_action_srf_item', type: 'select', alias: 'eASRFItem', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm' },
            EA_SAF: { name: 'custrecord_twc_eq_action_saf', type: 'select', alias: 'eASAF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf' },
            EA_TYPE: { name: 'custrecord_twc_eq_action_type', type: 'select', alias: 'eAType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_action_type' },
            RELATED_EA: { name: 'custrecord_twc_eq_real_ea', type: 'select', alias: 'relatedEA', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_action' },
            EA_STATUS: { name: 'custrecord_twc_eq_action_sts', type: 'select', alias: 'eAStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_action_sts' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_Equip_Action extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
                        
            get eAEquipment() {
                return this.get(_recordFields.EA_EQUIPMENT);
            } set eAEquipment(value) {
                this.set(_recordFields.EA_EQUIPMENT, value)
            }
            get eAEquipmentName() { return this.getText(_recordFields.EA_EQUIPMENT); }
            
            get eASRF() {
                return this.get(_recordFields.EA_SRF);
            } set eASRF(value) {
                this.set(_recordFields.EA_SRF, value)
            }
            get eASRFName() { return this.getText(_recordFields.EA_SRF); }
            
            get eASRFItem() {
                return this.get(_recordFields.EA_SRF_ITEM);
            } set eASRFItem(value) {
                this.set(_recordFields.EA_SRF_ITEM, value)
            }
            get eASRFItemName() { return this.getText(_recordFields.EA_SRF_ITEM); }
            
            get eASAF() {
                return this.get(_recordFields.EA_SAF);
            } set eASAF(value) {
                this.set(_recordFields.EA_SAF, value)
            }
            get eASAFName() { return this.getText(_recordFields.EA_SAF); }
            
            get eAType() {
                return this.get(_recordFields.EA_TYPE);
            } set eAType(value) {
                this.set(_recordFields.EA_TYPE, value)
            }
            get eATypeName() { return this.getText(_recordFields.EA_TYPE); }
            
            get relatedEA() {
                return this.get(_recordFields.RELATED_EA);
            } set relatedEA(value) {
                this.set(_recordFields.RELATED_EA, value)
            }
            get relatedEAName() { return this.getText(_recordFields.RELATED_EA); }
            
            get eAStatus() {
                return this.get(_recordFields.EA_STATUS);
            } set eAStatus(value) {
                this.set(_recordFields.EA_STATUS, value)
            }
            get eAStatusName() { return this.getText(_recordFields.EA_STATUS); }
            
            get created() {
                return this.get(_recordFields.CREATED);
            } set created(value) {
                this.set(_recordFields.CREATED, value)
            }
            
            get last_modified() {
                return this.get(_recordFields.MODIFIED);
            } set last_modified(value) {
                this.set(_recordFields.MODIFIED, value)
            }
            
            get created_by() {
                return this.get(_recordFields.OWNER);
            } set created_by(value) {
                this.set(_recordFields.OWNER, value)
            }
            
            get last_modified_by() {
                return this.get(_recordFields.MODIFIED_BY);
            } set last_modified_by(value) {
                this.set(_recordFields.MODIFIED_BY, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_Equip_Action,

            get: function (id) {
                var rec = new OSSMTWC_Equip_Action(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Equip_Action();
                return rec.select(options);
            }

        }
    });
