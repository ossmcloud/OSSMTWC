/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_file';
        var _recordFields = {
            NAME: 'name',
            RECORD_TYPE: 'custrecord_twc_file_rectype',
            RECORD_ID: 'custrecord_twc_file_recid',
            DESCRIPTION: 'custrecord_twc_file_description',
            REVISION: 'custrecord_twc_file_revision',
            FILE: 'custrecord_twc_file_doc',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            RECORD_TYPE: { name: 'custrecord_twc_file_rectype', type: 'text', alias: 'recordType', display: 'normal', mandatory: false },
            RECORD_ID: { name: 'custrecord_twc_file_recid', type: 'integer', alias: 'recordID', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_file_description', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            REVISION: { name: 'custrecord_twc_file_revision', type: 'integer', alias: 'status', display: 'normal', mandatory: false },
            FILE: { name: 'custrecord_twc_file_doc', type: 'document', alias: 'file', display: 'normal', mandatory: false },
        }

        class OSSMTWC_Files extends customRec.RecordBase {
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
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            PersistentRecord: OSSMTWC_Files,

            get: function (id) {
                var rec = new OSSMTWC_Files(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Files();
                return rec.select(options);
            }

        }
    });
