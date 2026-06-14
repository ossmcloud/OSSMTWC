/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_wks';
        var _recordFields = {
            NAME: 'name',
            OUTER_SEQUENCE: 'custrecord_twc_srf_wks_seq_outer',
            STEP_NUMBER: 'custrecord_twc_srf_wks_step_no',
            SEQUENCE_NUMBER: 'custrecord_twc_srf_wks_seq_no',
            DESCRIPTION: 'custrecord_twc_srf_wks_description',
            NEXT_STAGE: 'custrecord_twc_srf_wks_next',
            PICK_NEXT_STAGE: 'custrecord_twc_srf_wks_next_pick',
            SET_STATUS: 'custrecord_twc_srf_wks_status_to',
            FORM_DATA: 'custrecord_twc_srf_wks_form',
            IS_REVIEW: 'custrecord_twc_srf_wks_is_review',
            IS_LAST_STAGE: 'custrecord_twc_srf_wks_is_last',
            HIDDEN: 'custrecord_twc_srf_wks_hide',
            IS_LOOP: 'custrecord_twc_srf_wks_loop',
            DO_NOT_CREATE: 'custrecord_twc_srf_wks_no_create',
            REVIEW_PASSED_FIELD: 'custrecord_twc_srf_wks_is_review_passf',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            OUTER_SEQUENCE: { name: 'custrecord_twc_srf_wks_seq_outer', type: 'integer', alias: 'outerSequence', display: 'normal', mandatory: false },
            STEP_NUMBER: { name: 'custrecord_twc_srf_wks_step_no', type: 'text', alias: 'stepNumber', display: 'normal', mandatory: false },
            SEQUENCE_NUMBER: { name: 'custrecord_twc_srf_wks_seq_no', type: 'integer', alias: 'sequenceNumber', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_srf_wks_description', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            NEXT_STAGE: { name: 'custrecord_twc_srf_wks_next', type: 'multiselect', alias: 'nextStage', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_wks' },
            PICK_NEXT_STAGE: { name: 'custrecord_twc_srf_wks_next_pick', type: 'checkbox', alias: 'pickNextStage', display: 'normal', mandatory: false },
            SET_STATUS: { name: 'custrecord_twc_srf_wks_status_to', type: 'select', alias: 'setStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_status' },
            FORM_DATA: { name: 'custrecord_twc_srf_wks_form', type: 'clobtext', alias: 'formData', display: 'normal', mandatory: false },
            IS_REVIEW: { name: 'custrecord_twc_srf_wks_is_review', type: 'checkbox', alias: 'isReview', display: 'normal', mandatory: false },
            IS_LAST_STAGE: { name: 'custrecord_twc_srf_wks_is_last', type: 'checkbox', alias: 'isLastStage', display: 'normal', mandatory: false },
            HIDDEN: { name: 'custrecord_twc_srf_wks_hide', type: 'checkbox', alias: 'hidden', display: 'normal', mandatory: false },
            IS_LOOP: { name: 'custrecord_twc_srf_wks_loop', type: 'checkbox', alias: 'isLoop', display: 'normal', mandatory: false },
            DO_NOT_CREATE: { name: 'custrecord_twc_srf_wks_no_create', type: 'checkbox', alias: 'doNotCreate', display: 'normal', mandatory: false },
            REVIEW_PASSED_FIELD: { name: 'custrecord_twc_srf_wks_is_review_passf', type: 'text', alias: 'reviewPassedField', display: 'normal', mandatory: false },
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
            
            get outerSequence() {
                return this.get(_recordFields.OUTER_SEQUENCE);
            } set outerSequence(value) {
                this.set(_recordFields.OUTER_SEQUENCE, value)
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
            
            get pickNextStage() {
                return this.get(_recordFields.PICK_NEXT_STAGE);
            } set pickNextStage(value) {
                this.set(_recordFields.PICK_NEXT_STAGE, value)
            }
            
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
            
            get hidden() {
                return this.get(_recordFields.HIDDEN);
            } set hidden(value) {
                this.set(_recordFields.HIDDEN, value)
            }
            
            get isLoop() {
                return this.get(_recordFields.IS_LOOP);
            } set isLoop(value) {
                this.set(_recordFields.IS_LOOP, value)
            }
            
            get doNotCreate() {
                return this.get(_recordFields.DO_NOT_CREATE);
            } set doNotCreate(value) {
                this.set(_recordFields.DO_NOT_CREATE, value)
            }
            
            get reviewPassedField() {
                return this.get(_recordFields.REVIEW_PASSED_FIELD);
            } set reviewPassedField(value) {
                this.set(_recordFields.REVIEW_PASSED_FIELD, value)
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
