/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_eq_lib';
        var _recordFields = {
            NAME: 'name',
            SPEC_ID: 'custrecord_twc_eq_lib_spec_id',
            LIBRARY_ENTRY_STATUS: 'custrecord_twc_eq_lib_lib_entry_sts',
            EQUIPMENT_CLASS: 'custrecord_twc_eq_lib_class',
            EQUIPMENT_TYPE: 'custrecord_twc_eq_lib_type',
            ATME_TYPE: 'custrecord_twc_eq_lib_atme_type',
            GIE_TYPE: 'custrecord_twc_eq_lib_gie_type',
            ACTIVE__PASSIVE: 'custrecord_twc_eq_lib_act_passive',
            MAKE: 'custrecord_twc_eq_lib_make',
            MODEL: 'custrecord_twc_eq_lib_model',
            DESCRIPTION: 'custrecord_twc_eq_lib_desc',
            LENGTH_MM: 'custrecord_twc_eq_lib_len',
            WIDTH_MM: 'custrecord_twc_eq_lib_width',
            HEIGHTDEPTH_MM: 'custrecord_twc_eq_lib_hg_dpth',
            WEIGHT_KG: 'custrecord_twc_eq_lib_weight_kg',
            WIND_LOADING_NM2: 'custrecord_twc_eq_lib_wind_ldg_nm2',
            VOLTAGE: 'custrecord_twc_eq_lib_voltage',
            VOLTAGE_RANGE: 'custrecord_twc_eq_lib_voltage_range',
            ALIAS: 'custrecord_twc_eq_lib_alias',
            PUBLIC: 'custrecord_twc_eq_lib_public',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SPEC_ID: { name: 'custrecord_twc_eq_lib_spec_id', type: 'text', alias: 'specID', display: 'normal', mandatory: false },
            LIBRARY_ENTRY_STATUS: { name: 'custrecord_twc_eq_lib_lib_entry_sts', type: 'select', alias: 'libraryEntryStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_lib_sts' },
            EQUIPMENT_CLASS: { name: 'custrecord_twc_eq_lib_class', type: 'select', alias: 'equipmentClass', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_class' },
            EQUIPMENT_TYPE: { name: 'custrecord_twc_eq_lib_type', type: 'select', alias: 'equipmentType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_type' },
            ATME_TYPE: { name: 'custrecord_twc_eq_lib_atme_type', type: 'text', alias: 'aTMEType', display: 'normal', mandatory: false },
            GIE_TYPE: { name: 'custrecord_twc_eq_lib_gie_type', type: 'text', alias: 'gIEType', display: 'normal', mandatory: false },
            ACTIVE__PASSIVE: { name: 'custrecord_twc_eq_lib_act_passive', type: 'text', alias: 'activePassive', display: 'normal', mandatory: false },
            MAKE: { name: 'custrecord_twc_eq_lib_make', type: 'text', alias: 'make', display: 'normal', mandatory: false },
            MODEL: { name: 'custrecord_twc_eq_lib_model', type: 'text', alias: 'model', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_eq_lib_desc', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            LENGTH_MM: { name: 'custrecord_twc_eq_lib_len', type: 'integer', alias: 'lengthmm', display: 'normal', mandatory: false },
            WIDTH_MM: { name: 'custrecord_twc_eq_lib_width', type: 'integer', alias: 'widthmm', display: 'normal', mandatory: false },
            HEIGHTDEPTH_MM: { name: 'custrecord_twc_eq_lib_hg_dpth', type: 'integer', alias: 'heightDepthmm', display: 'normal', mandatory: false },
            WEIGHT_KG: { name: 'custrecord_twc_eq_lib_weight_kg', type: 'float', alias: 'weightkg', display: 'normal', mandatory: false },
            WIND_LOADING_NM2: { name: 'custrecord_twc_eq_lib_wind_ldg_nm2', type: 'integer', alias: 'windLoadingNm2', display: 'normal', mandatory: false },
            VOLTAGE: { name: 'custrecord_twc_eq_lib_voltage', type: 'text', alias: 'voltage', display: 'normal', mandatory: false },
            VOLTAGE_RANGE: { name: 'custrecord_twc_eq_lib_voltage_range', type: 'text', alias: 'voltageRange', display: 'normal', mandatory: false },
            ALIAS: { name: 'custrecord_twc_eq_lib_alias', type: 'text', alias: 'alias', display: 'normal', mandatory: false },
            PUBLIC: { name: 'custrecord_twc_eq_lib_public', type: 'text', alias: 'public', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_Equip_Lib extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get specID() {
                return this.get(_recordFields.SPEC_ID);
            } set specID(value) {
                this.set(_recordFields.SPEC_ID, value)
            }
            
            get libraryEntryStatus() {
                return this.get(_recordFields.LIBRARY_ENTRY_STATUS);
            } set libraryEntryStatus(value) {
                this.set(_recordFields.LIBRARY_ENTRY_STATUS, value)
            }
            get libraryEntryStatusName() { return this.getText(_recordFields.LIBRARY_ENTRY_STATUS); }
            
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
            
            get aTMEType() {
                return this.get(_recordFields.ATME_TYPE);
            } set aTMEType(value) {
                this.set(_recordFields.ATME_TYPE, value)
            }
            
            get gIEType() {
                return this.get(_recordFields.GIE_TYPE);
            } set gIEType(value) {
                this.set(_recordFields.GIE_TYPE, value)
            }
            
            get activePassive() {
                return this.get(_recordFields.ACTIVE__PASSIVE);
            } set activePassive(value) {
                this.set(_recordFields.ACTIVE__PASSIVE, value)
            }
            
            get make() {
                return this.get(_recordFields.MAKE);
            } set make(value) {
                this.set(_recordFields.MAKE, value)
            }
            
            get model() {
                return this.get(_recordFields.MODEL);
            } set model(value) {
                this.set(_recordFields.MODEL, value)
            }
            
            get description() {
                return this.get(_recordFields.DESCRIPTION);
            } set description(value) {
                this.set(_recordFields.DESCRIPTION, value)
            }
            
            get lengthmm() {
                return this.get(_recordFields.LENGTH_MM);
            } set lengthmm(value) {
                this.set(_recordFields.LENGTH_MM, value)
            }
            
            get widthmm() {
                return this.get(_recordFields.WIDTH_MM);
            } set widthmm(value) {
                this.set(_recordFields.WIDTH_MM, value)
            }
            
            get heightDepthmm() {
                return this.get(_recordFields.HEIGHTDEPTH_MM);
            } set heightDepthmm(value) {
                this.set(_recordFields.HEIGHTDEPTH_MM, value)
            }
            
            get weightkg() {
                return this.get(_recordFields.WEIGHT_KG);
            } set weightkg(value) {
                this.set(_recordFields.WEIGHT_KG, value)
            }
            
            get windLoadingNm2() {
                return this.get(_recordFields.WIND_LOADING_NM2);
            } set windLoadingNm2(value) {
                this.set(_recordFields.WIND_LOADING_NM2, value)
            }
            
            get voltage() {
                return this.get(_recordFields.VOLTAGE);
            } set voltage(value) {
                this.set(_recordFields.VOLTAGE, value)
            }
            
            get voltageRange() {
                return this.get(_recordFields.VOLTAGE_RANGE);
            } set voltageRange(value) {
                this.set(_recordFields.VOLTAGE_RANGE, value)
            }
            
            get alias() {
                return this.get(_recordFields.ALIAS);
            } set alias(value) {
                this.set(_recordFields.ALIAS, value)
            }
            
            get public() {
                return this.get(_recordFields.PUBLIC);
            } set public(value) {
                this.set(_recordFields.PUBLIC, value)
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
            PersistentRecord: OSSMTWC_Equip_Lib,

            get: function (id) {
                var rec = new OSSMTWC_Equip_Lib(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Equip_Lib();
                return rec.select(options);
            }

        }
    });
