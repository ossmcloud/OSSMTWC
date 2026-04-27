/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_eq_lib_cfg';
        var _recordFields = {
            NAME: 'name',
            EQUIPMENT_CLASS: 'custrecord_twc_eq_lib_cfg_class',
            EQUIPMENT_TYPE: 'custrecord_twc_eq_lib_cfg_type',
            PICK_FROM_LIBRARY: 'custrecord_twc_eq_lib_cfg_pick',
            USER_NOTES: 'custrecord_twc_eq_lib_cfg_notes',
            CONFIGURATIONS: 'custrecord_twc_eq_lib_cfg_json',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            EQUIPMENT_CLASS: { name: 'custrecord_twc_eq_lib_cfg_class', type: 'select', alias: 'equipmentClass', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_class' },
            EQUIPMENT_TYPE: { name: 'custrecord_twc_eq_lib_cfg_type', type: 'select', alias: 'equipmentType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_type' },
            PICK_FROM_LIBRARY: { name: 'custrecord_twc_eq_lib_cfg_pick', type: 'checkbox', alias: 'pickFromLibrary', display: 'normal', mandatory: false },
            USER_NOTES: { name: 'custrecord_twc_eq_lib_cfg_notes', type: 'clobtext', alias: 'userNotes', display: 'normal', mandatory: false },
            CONFIGURATIONS: { name: 'custrecord_twc_eq_lib_cfg_json', type: 'clobtext', alias: 'configurations', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_Equip_LibConfig extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get equipmentClass() {
                return this.get(_recordFields.EQUIPMENT_CLASS);
            } set equipmentClass(value) {
                this.set(_recordFields.EQUIPMENT_CLASS, value)
            }
            get equipmentClassName() { return this.getText(_recordFields.EQUIPMENT_CLASS); }
            
            get equipmentType() {
                return this.get(_recordFields.EQUIPMENT_TYPE);
            } set equipmentType(value) {
                this.set(_recordFields.EQUIPMENT_TYPE, value)
            }
            get equipmentTypeName() { return this.getText(_recordFields.EQUIPMENT_TYPE); }
            
            get pickFromLibrary() {
                return this.get(_recordFields.PICK_FROM_LIBRARY);
            } set pickFromLibrary(value) {
                this.set(_recordFields.PICK_FROM_LIBRARY, value)
            }
            
            get userNotes() {
                return this.get(_recordFields.USER_NOTES);
            } set userNotes(value) {
                this.set(_recordFields.USER_NOTES, value)
            }
            
            get configurations() {
                return this.get(_recordFields.CONFIGURATIONS);
            } set configurations(value) {
                this.set(_recordFields.CONFIGURATIONS, value)
            }
            
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
            PersistentRecord: OSSMTWC_Equip_LibConfig,

            get: function (id) {
                var rec = new OSSMTWC_Equip_LibConfig(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Equip_LibConfig();
                return rec.select(options);
            }

        }
    });
