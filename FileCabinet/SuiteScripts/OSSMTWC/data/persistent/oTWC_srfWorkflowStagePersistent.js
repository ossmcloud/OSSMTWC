/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_wks';
        var _recordFields = {
            NAME: 'name',
            STEP_NUMBER: 'custrecord_twc_srf_wks_step_no',
            SEQUENCE_NUMBER: 'custrecord_twc_srf_wks_seq_no',
            DESCRIPTION: 'custrecord_twc_srf_wks_description',
            NEXT_STAGE: 'custrecord_twc_srf_wks_next',
            SET_STATUS: 'custrecord_twc_srf_wks_status_to',
            FORM_DATA: 'custrecord_twc_srf_wks_form',
            IS_REVIEW: 'custrecord_twc_srf_wks_is_review',
            IS_LAST_STAGE: 'custrecord_twc_srf_wks_is_last',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            STEP_NUMBER: { name: 'custrecord_twc_srf_wks_step_no', type: 'text', alias: 'stepNumber', display: 'normal', mandatory: false },
            SEQUENCE_NUMBER: { name: 'custrecord_twc_srf_wks_seq_no', type: 'integer', alias: 'sequenceNumber', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_srf_wks_description', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            NEXT_STAGE: { name: 'custrecord_twc_srf_wks_next', type: 'multiselect', alias: 'nextStage', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_wks' },
            SET_STATUS: { name: 'custrecord_twc_srf_wks_status_to', type: 'select', alias: 'setStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_status' },
            FORM_DATA: { name: 'custrecord_twc_srf_wks_form', type: 'clobtext', alias: 'formData', display: 'normal', mandatory: false },
            IS_REVIEW: { name: 'custrecord_twc_srf_wks_is_review', type: 'checkbox', alias: 'isReview', display: 'normal', mandatory: false },
            IS_LAST_STAGE: { name: 'custrecord_twc_srf_wks_is_last', type: 'checkbox', alias: 'isLastStage', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SRFWorkflowStage extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get stepNumber() {
                return this.get(_recordFields.STEP_NUMBER);
            } set stepNumber(value) {
                this.set(_recordFields.STEP_NUMBER, value)
            }
            
            get sequenceNumber() {
                return this.get(_recordFields.SEQUENCE_NUMBER);
            } set sequenceNumber(value) {
                this.set(_recordFields.SEQUENCE_NUMBER, value)
            }
            
            get description() {
                return this.get(_recordFields.DESCRIPTION);
            } set description(value) {
                this.set(_recordFields.DESCRIPTION, value)
            }
            
            get nextStage() {
                return this.get(_recordFields.NEXT_STAGE);
            } set nextStage(value) {
                this.set(_recordFields.NEXT_STAGE, value)
            }
            get nextStageName() { return this.getText(_recordFields.NEXT_STAGE); }
            
            get setStatus() {
                return this.get(_recordFields.SET_STATUS);
            } set setStatus(value) {
                this.set(_recordFields.SET_STATUS, value)
            }
            get setStatusName() { return this.getText(_recordFields.SET_STATUS); }
            
            get formData() {
                return this.get(_recordFields.FORM_DATA);
            } set formData(value) {
                this.set(_recordFields.FORM_DATA, value)
            }
            
            get isReview() {
                return this.get(_recordFields.IS_REVIEW);
            } set isReview(value) {
                this.set(_recordFields.IS_REVIEW, value)
            }
            
            get isLastStage() {
                return this.get(_recordFields.IS_LAST_STAGE);
            } set isLastStage(value) {
                this.set(_recordFields.IS_LAST_STAGE, value)
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
            PersistentRecord: OSSMTWC_SRFWorkflowStage,

            get: function (id) {
                var rec = new OSSMTWC_SRFWorkflowStage(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SRFWorkflowStage();
                return rec.select(options);
            }

        }
    });
