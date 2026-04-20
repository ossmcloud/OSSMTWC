/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_rec_cfg';
        var _recordFields = {
            NAME: 'name',
            RECORD_SCRIPT_ID: 'custrecord_twc_rec_cfg_script_id',
            RECORD_ID: 'custrecord_twc_rec_cfg_id',
            DESCRIPTION: 'custrecord_twc_rec_cfg_descr',
            LIST_CONFIG: 'custrecord_twc_rec_cfg_list',
            FORM_CONFIG: 'custrecord_twc_rec_cfg_form',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            RECORD_SCRIPT_ID: { name: 'custrecord_twc_rec_cfg_script_id', type: 'text', alias: 'recordScriptID', display: 'normal', mandatory: false },
            RECORD_ID: { name: 'custrecord_twc_rec_cfg_id', type: 'integer', alias: 'recordID', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_rec_cfg_descr', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            LIST_CONFIG: { name: 'custrecord_twc_rec_cfg_list', type: 'clobtext', alias: 'listConfig', display: 'normal', mandatory: false },
            FORM_CONFIG: { name: 'custrecord_twc_rec_cfg_form', type: 'clobtext', alias: 'formConfig', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_RecordsConfig extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get recordScriptID() {
                return this.get(_recordFields.RECORD_SCRIPT_ID);
            } set recordScriptID(value) {
                this.set(_recordFields.RECORD_SCRIPT_ID, value)
            }
            
            get recordID() {
                return this.get(_recordFields.RECORD_ID);
            } set recordID(value) {
                this.set(_recordFields.RECORD_ID, value)
            }
            
            get description() {
                return this.get(_recordFields.DESCRIPTION);
            } set description(value) {
                this.set(_recordFields.DESCRIPTION, value)
            }
            
            get listConfig() {
                return this.get(_recordFields.LIST_CONFIG);
            } set listConfig(value) {
                this.set(_recordFields.LIST_CONFIG, value)
            }
            
            get formConfig() {
                return this.get(_recordFields.FORM_CONFIG);
            } set formConfig(value) {
                this.set(_recordFields.FORM_CONFIG, value)
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
            PersistentRecord: OSSMTWC_RecordsConfig,

            get: function (id) {
                var rec = new OSSMTWC_RecordsConfig(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_RecordsConfig();
                return rec.select(options);
            }

        }
    });
