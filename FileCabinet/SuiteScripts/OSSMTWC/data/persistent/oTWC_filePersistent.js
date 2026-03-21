/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_file';
        var _recordFields = {
            NAME: 'name',
            RECORD_TYPE: 'custrecord_twc_file_rectype',
            RECORD_ID: 'custrecord_twc_file_recid',
            DESCRIPTION: 'custrecord_twc_file_description',
            REVISION: 'custrecord_twc_file_revision',
            FILE: 'custrecord_twc_file_doc',
            R_TYPE: 'custrecord_twc_file_type',
            STATUS: 'custrecord_twc_file_status',
            UPLOADED_BY: 'custrecord_twc_file_uploaded_by',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            RECORD_TYPE: { name: 'custrecord_twc_file_rectype', type: 'text', alias: 'recordType', display: 'normal', mandatory: false },
            RECORD_ID: { name: 'custrecord_twc_file_recid', type: 'integer', alias: 'recordID', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_file_description', type: 'clobtext', alias: 'description', display: 'normal', mandatory: false },
            REVISION: { name: 'custrecord_twc_file_revision', type: 'integer', alias: 'revision', display: 'normal', mandatory: false },
            FILE: { name: 'custrecord_twc_file_doc', type: 'document', alias: 'file', display: 'normal', mandatory: false },
            R_TYPE: { name: 'custrecord_twc_file_type', type: 'select', alias: 'r_type', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file_type' },
            STATUS: { name: 'custrecord_twc_file_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file_status' },
            UPLOADED_BY: { name: 'custrecord_twc_file_uploaded_by', type: 'select', alias: 'uploadedBy', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_File extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get recordType() {
                return this.get(_recordFields.RECORD_TYPE);
            } set recordType(value) {
                this.set(_recordFields.RECORD_TYPE, value)
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
            
            get revision() {
                return this.get(_recordFields.REVISION);
            } set revision(value) {
                this.set(_recordFields.REVISION, value)
            }
            
            get file() {
                return this.get(_recordFields.FILE);
            } set file(value) {
                this.set(_recordFields.FILE, value)
            }
            
            get r_type() {
                return this.get(_recordFields.R_TYPE);
            } set r_type(value) {
                this.set(_recordFields.R_TYPE, value)
            }
            get r_typeName() { return this.getText(_recordFields.R_TYPE); }
            
            get status() {
                return this.get(_recordFields.STATUS);
            } set status(value) {
                this.set(_recordFields.STATUS, value)
            }
            get statusName() { return this.getText(_recordFields.STATUS); }
            
            get uploadedBy() {
                return this.get(_recordFields.UPLOADED_BY);
            } set uploadedBy(value) {
                this.set(_recordFields.UPLOADED_BY, value)
            }
            get uploadedByName() { return this.getText(_recordFields.UPLOADED_BY); }
            
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
            PersistentRecord: OSSMTWC_File,

            get: function (id) {
                var rec = new OSSMTWC_File(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_File();
                return rec.select(options);
            }

        }
    });
