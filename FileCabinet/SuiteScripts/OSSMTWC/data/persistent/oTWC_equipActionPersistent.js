/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define([ 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {

        var _recordType = 'customrecord_twc_eq_action';

        var _recordFields = {
            EQUIP_ACTION_ID: 'custrecord_twc_eq_action_id',
            EQUIPMENT: 'custrecord_twc_eq_action_eq',
            SRF: 'custrecord_twc_eq_action_srf',
            SRF_ITEM: 'custrecord_twc_eq_action_srf_item',
            SAF: 'custrecord_twc_eq_action_saf',
            TYPE: 'custrecord_twc_eq_action_type',
            RELATED_EA: 'custrecord_twc_eq_real_ea',
            STATUS: 'custrecord_twc_eq_action_sts'
        };

        var _recordFieldInfo = {
            EQUIP_ACTION_ID: { name: 'custrecord_twc_eq_action_id',type: 'text',alias: 'equipActionId',display: 'normal',mandatory: false},
            EQUIPMENT: {name: 'custrecord_twc_eq_action_eq',type: 'select',alias: 'equipment',display: 'normal',mandatory: false,recordType: 'customrecord_twc_equip'},
            SRF: {name: 'custrecord_twc_eq_action_srf',type: 'select',alias: 'srf',display: 'normal',mandatory: false,recordType: 'customrecord_twc_srf'},
            SRF_ITEM: {name: 'custrecord_twc_eq_action_srf_item',type: 'select',alias: 'srfItem',display: 'normal',mandatory: false,recordType: 'customrecord_twc_srf_itm'},
            SAF: {name: 'custrecord_twc_eq_action_saf',type: 'select',alias: 'saf',display: 'normal',mandatory: false,recordType: 'customrecord_twc_saf'},
            TYPE: {name: 'custrecord_twc_eq_action_type',type: 'select',alias: 'type',display: 'normal',mandatory: false,recordType: 'customrecord_twc_eq_action_type'},
            RELATED_EA: {name: 'custrecord_twc_eq_real_ea',type: 'select',alias: 'relatedEA',display: 'normal',mandatory: false,recordType: 'customrecord_twc_eq_action'},
            STATUS: { name: 'custrecord_twc_eq_action_sts', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: '	customrecord_twc_eq_action_sts'}
        };

        class OSSMTWC_EquipAction extends customRec.RecordBase {

            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }

            get equipActionId() {
                return this.get(_recordFields.EQUIP_ACTION_ID);
            }
            set equipActionId(value) {
                this.set(_recordFields.EQUIP_ACTION_ID, value);
            }

            get equipment() {
                return this.get(_recordFields.EQUIPMENT);
            }
            set equipment(value) {
                this.set(_recordFields.EQUIPMENT, value);
            }
            get equipmentName() {
                return this.getText(_recordFields.EQUIPMENT);
            }

            get srf() {
                return this.get(_recordFields.SRF);
            }
            set srf(value) {
                this.set(_recordFields.SRF, value);
            }
            get srfName() {
                return this.getText(_recordFields.SRF);
            }

            get srfItem() {
                return this.get(_recordFields.SRF_ITEM);
            }
            set srfItem(value) {
                this.set(_recordFields.SRF_ITEM, value);
            }
            get srfItemName() {
                return this.getText(_recordFields.SRF_ITEM);
            }

            get saf() {
                return this.get(_recordFields.SAF);
            }
            set saf(value) {
                this.set(_recordFields.SAF, value);
            }
            get safName() {
                return this.getText(_recordFields.SAF);
            }

            get type() {
                return this.get(_recordFields.TYPE);
            }
            set type(value) {
                this.set(_recordFields.TYPE, value);
            }
            get typeName() {
                return this.getText(_recordFields.TYPE);
            }

            get relatedEA() {
                return this.get(_recordFields.RELATED_EA);
            }
            set relatedEA(value) {
                this.set(_recordFields.RELATED_EA, value);
            }
            get relatedEAName() {
                return this.getText(_recordFields.RELATED_EA);
            }

            get status() {
                return this.get(_recordFields.STATUS);
            }
            set status(value) {
                this.set(_recordFields.STATUS, value);
            }
            get statusName() {
                return this.getText(_recordFields.STATUS);
            }
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_EquipAction,

            get: function (id) {
                var rec = new OSSMTWC_EquipAction(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_EquipAction();
                return rec.select(options);
            }
        };

    });