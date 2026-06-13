/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_wkf';
        var _recordFields = {
            NAME: 'name',
            SRF: 'custrecord_twc_srf_wkf_parent',
            NOTES: 'custrecord_twc_srf_wkf_notes',
            STATUS: 'custrecord_twc_srf_wkf_status',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SRF: { name: 'custrecord_twc_srf_wkf_parent', type: 'select', alias: 'sRF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf' },
            NOTES: { name: 'custrecord_twc_srf_wkf_notes', type: 'clobtext', alias: 'notes', display: 'normal', mandatory: false },
            STATUS: { name: 'custrecord_twc_srf_wkf_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_wkf_status' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SRFWorkflow extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get sRF() {
                return this.get(_recordFields.SRF);
            } set sRF(value) {
                this.set(_recordFields.SRF, value)
            }
            get sRFName() { return this.getText(_recordFields.SRF); }
            
            get notes() {
                return this.get(_recordFields.NOTES);
            } set notes(value) {
                this.set(_recordFields.NOTES, value)
            }
           
           
            
            get status() {
                return this.get(_recordFields.STATUS);
            } set status(value) {
                this.set(_recordFields.STATUS, value)
            }
            get statusName() { return this.getText(_recordFields.STATUS); }
            
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
            PersistentRecord: OSSMTWC_SRFWorkflow,

            get: function (id) {
                var rec = new OSSMTWC_SRFWorkflow(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SRFWorkflow();
                return rec.select(options);
            }

        }
    });
