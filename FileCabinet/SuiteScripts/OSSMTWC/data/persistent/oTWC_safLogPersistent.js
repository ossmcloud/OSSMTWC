/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_saf_log';
        var _recordFields = {
            NAME: 'name',
            SAF: 'custrecord_twc_saf_log_saf',
            PROFILE: 'custrecord_twc_saf_log_profile',
            LOG_TYPE: 'custrecord_twc_saf_log_type',
            MESSAGE: 'custrecord_twc_saf_log_message',
            ADDITIONAL_INFO: 'custrecord_twc_saf_log_notes',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SAF: { name: 'custrecord_twc_saf_log_saf', type: 'select', alias: 'sAF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf' },
            PROFILE: { name: 'custrecord_twc_saf_log_profile', type: 'select', alias: 'profile', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            LOG_TYPE: { name: 'custrecord_twc_saf_log_type', type: 'text', alias: 'logType', display: 'normal', mandatory: false },
            MESSAGE: { name: 'custrecord_twc_saf_log_message', type: 'text', alias: 'message', display: 'normal', mandatory: false },
            ADDITIONAL_INFO: { name: 'custrecord_twc_saf_log_notes', type: 'clobtext', alias: 'additionalInfo', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SAF_Logs extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get sAF() {
                return this.get(_recordFields.SAF);
            } set sAF(value) {
                this.set(_recordFields.SAF, value)
            }
            get sAFName() { return this.getText(_recordFields.SAF); }
            
            get profile() {
                return this.get(_recordFields.PROFILE);
            } set profile(value) {
                this.set(_recordFields.PROFILE, value)
            }
            get profileName() { return this.getText(_recordFields.PROFILE); }
            
            get logType() {
                return this.get(_recordFields.LOG_TYPE);
            } set logType(value) {
                this.set(_recordFields.LOG_TYPE, value)
            }
            
            get message() {
                return this.get(_recordFields.MESSAGE);
            } set message(value) {
                this.set(_recordFields.MESSAGE, value)
            }
            
            get additionalInfo() {
                return this.get(_recordFields.ADDITIONAL_INFO);
            } set additionalInfo(value) {
                this.set(_recordFields.ADDITIONAL_INFO, value)
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
            PersistentRecord: OSSMTWC_SAF_Logs,

            get: function (id) {
                var rec = new OSSMTWC_SAF_Logs(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SAF_Logs();
                return rec.select(options);
            }

        }
    });
