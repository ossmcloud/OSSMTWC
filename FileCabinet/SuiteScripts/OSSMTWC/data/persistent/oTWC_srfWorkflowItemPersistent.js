/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_wkfi';
        var _recordFields = {
            NAME: 'name',
            WORKFLOW: 'custrecord_twc_srf_wkfi_parent',
            WORKFLOW_STAGE: 'custrecord_twc_srf_wkfi_stage',
            STATUS: 'custrecord_twc_srf_wkfi_status',
            PLANNED: 'custrecord_twc_srf_wkfi_planned',
            ACTUAL: 'custrecord_twc_srf_wkfi_actual',
            REVIEW: 'custrecord_twc_srf_wkfi_review',
            CUSTOMER_PROFILE: 'custrecord_twc_srf_wkfi_cprofile',
            ASSIGNED_TO: 'custrecord_twc_srf_wkfi_assigned_to',
            REVIEW_PASSED: 'custrecord_twc_srf_wkfi_review_passed',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            WORKFLOW: { name: 'custrecord_twc_srf_wkfi_parent', type: 'select', alias: 'workflow', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_wkf' },
            WORKFLOW_STAGE: { name: 'custrecord_twc_srf_wkfi_stage', type: 'select', alias: 'workflowStage', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_wks' },
            STATUS: { name: 'custrecord_twc_srf_wkfi_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_wkf_status' },
            PLANNED: { name: 'custrecord_twc_srf_wkfi_planned', type: 'date', alias: 'planned', display: 'normal', mandatory: false },
            ACTUAL: { name: 'custrecord_twc_srf_wkfi_actual', type: 'date', alias: 'actual', display: 'normal', mandatory: false },
            REVIEW: { name: 'custrecord_twc_srf_wkfi_review', type: 'select', alias: 'review', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_rev' },
            CUSTOMER_PROFILE: { name: 'custrecord_twc_srf_wkfi_cprofile', type: 'select', alias: 'customerProfile', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            ASSIGNED_TO: { name: 'custrecord_twc_srf_wkfi_assigned_to', type: 'select', alias: 'assignedto', display: 'normal', mandatory: false, recordType: '-4' },
            REVIEW_PASSED: { name: 'custrecord_twc_srf_wkfi_review_passed', type: 'checkbox', alias: 'reviewPassed', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SRFWorkflowItem extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get workflow() {
                return this.get(_recordFields.WORKFLOW);
            } set workflow(value) {
                this.set(_recordFields.WORKFLOW, value)
            }
            get workflowName() { return this.getText(_recordFields.WORKFLOW); }
            
            get workflowStage() {
                return this.get(_recordFields.WORKFLOW_STAGE);
            } set workflowStage(value) {
                this.set(_recordFields.WORKFLOW_STAGE, value)
            }
            get workflowStageName() { return this.getText(_recordFields.WORKFLOW_STAGE); }
            
            get status() {
                return this.get(_recordFields.STATUS);
            } set status(value) {
                this.set(_recordFields.STATUS, value)
            }
            get statusName() { return this.getText(_recordFields.STATUS); }
            
            get planned() {
                return this.get(_recordFields.PLANNED);
            } set planned(value) {
                this.set(_recordFields.PLANNED, value)
            }
            
            get actual() {
                return this.get(_recordFields.ACTUAL);
            } set actual(value) {
                this.set(_recordFields.ACTUAL, value)
            }
            
            get review() {
                return this.get(_recordFields.REVIEW);
            } set review(value) {
                this.set(_recordFields.REVIEW, value)
            }
            get reviewName() { return this.getText(_recordFields.REVIEW); }
            
            get customerProfile() {
                return this.get(_recordFields.CUSTOMER_PROFILE);
            } set customerProfile(value) {
                this.set(_recordFields.CUSTOMER_PROFILE, value)
            }
            get customerProfileName() { return this.getText(_recordFields.CUSTOMER_PROFILE); }
            
            get assignedto() {
                return this.get(_recordFields.ASSIGNED_TO);
            } set assignedto(value) {
                this.set(_recordFields.ASSIGNED_TO, value)
            }
            get assignedtoName() { return this.getText(_recordFields.ASSIGNED_TO); }
            
            get reviewPassed() {
                return this.get(_recordFields.REVIEW_PASSED);
            } set reviewPassed(value) {
                this.set(_recordFields.REVIEW_PASSED, value)
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
            PersistentRecord: OSSMTWC_SRFWorkflowItem,

            get: function (id) {
                var rec = new OSSMTWC_SRFWorkflowItem(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SRFWorkflowItem();
                return rec.select(options);
            }

        }
    });
