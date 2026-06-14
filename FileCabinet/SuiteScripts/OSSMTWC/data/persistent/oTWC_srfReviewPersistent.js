/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_rev';
        var _recordFields = {
            NAME: 'name',
            SRF: 'custrecord_twc_srf_rev_srf',
            REVIEW_ITERATION: 'custrecord_twc_srf_rev_iter',
            SUBMISSION_DATE: 'custrecord_twc_srf_rev_sub_date',
            CUSTOMER_SUBMISSION_COMMENTS: 'custrecord_twc_srf_rev_cust_sub_com',
            TL_REVIEW_COMMENTS: 'custrecord_twc_srf_rev_com',
            TL_REVIEW_RESULT: 'custrecord_twc_srf_rev_tl_rev_res',
            TL_REVIEW_COMPLETE: 'custrecord_twc_srf_rev_tl_rev_comp',
            STRUCTURAL_ANALYSIS_REQUIRED: 'custrecord_twc_srf_rev_str_analysis_req',
            SA_REQUESTED_PLANNED: 'custrecord_twc_srf_rev_sa_req_planned',
            SA_REQUESTED_ACTUAL: 'custrecord_twc_srf_rev_sa_req_actual',
            SA_COMPLETE_PLANNED: 'custrecord_twc_srf_rev_sa_comp_plan',
            SA_COMPLETE_ACTUAL: 'custrecord_twc_srf_rev_sa_comp_actual',
            SPACE_CHECK_PASSED: 'custrecord_twc_srf_rev_space_check_pass',
            SPACE_CHECK_COMMENTS: 'custrecord_twc_srf_rev_spc_check_com',
            TL_SERVICES_REQUESTED: 'custrecord_twc_srf_rev_tl_req_svc',
            SERVICES_REQUESTED_PLANNED: 'custrecord_twc_srf_rev_svc_req_plan',
            SERVICES_REQUESTED_ACTUAL: 'custrecord_twc_srf_rev_svc_req_actual',
            SERVICES_COMPLETE_PLANNED: 'custrecord_twc_srf_rev_svc_comp_plan',
            SERVICES_COMPLETE_ACTUAL: 'custrecord_twc_srf_rev_svc_comp_actual',
            FACILITIES_CHECK_PASSED: 'custrecord_twc_srf_rev_fac_check_pass',
            FACILITIES_CHECK_COMMENTS: 'custrecord_twc_srf_rev_fac_check_com',
            FULL_PLANNING_REQUIRED: 'custrecord_twc_srf_rev_full_plan_req',
            FP_REQUESTED_PLANNED: 'custrecord_twc_srf_rev_fp_req_plan',
            FP_REQUESTED_ACTUAL: 'custrecord_twc_srf_rev_fp_req_actual',
            FP_COMPLETE_PLANNED: 'custrecord_twc_srf_rev_fp_comp_plan',
            FP_COMPLETE_ACTUAL: 'custrecord_twc_srf_rev_fp_comp_actual',
            ESTATES_CHECK_PASSED: 'custrecord_twc_srf_rev_est_check_pass',
            ESTATES_CHECK_COMMENTS: 'custrecord_twc_srf_rev_est_check_com',
            PRICING_REQUIRED: 'custrecord_twc_srf_rev_prc_req',
            FEE_REDUCTION: 'custrecord_twc_srf_rev_fee_redu',
            FEE_UPLIFT: 'custrecord_twc_srf_rev_fee_uplift',
            NEW_LICENCE_FEE: 'custrecord_twc_srf_rev_new_lic_fee',
            FEE_CHANGE_BREAKDOWN: 'custrecord_twc_srf_rev_fee_chg_brkdwn',
            CUSTOMER_ACCOUNTS_CHECK_PASSED: 'custrecord_twc_srf_rev_cust_acc_chk_pass',
            CUSTOMER_ACCOUNTS_CHECK_COMMENTS: 'custrecord_twc_srf_rev_cust_acc_chk_com',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SRF: { name: 'custrecord_twc_srf_rev_srf', type: 'select', alias: 'sRF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf' },
            REVIEW_ITERATION: { name: 'custrecord_twc_srf_rev_iter', type: 'integer', alias: 'reviewIteration', display: 'normal', mandatory: false },
            SUBMISSION_DATE: { name: 'custrecord_twc_srf_rev_sub_date', type: 'date', alias: 'submissionDate', display: 'normal', mandatory: false },
            CUSTOMER_SUBMISSION_COMMENTS: { name: 'custrecord_twc_srf_rev_cust_sub_com', type: 'textarea', alias: 'customerSubmissionComments', display: 'normal', mandatory: false },
            TL_REVIEW_COMMENTS: { name: 'custrecord_twc_srf_rev_com', type: 'textarea', alias: 'tLReviewComments', display: 'normal', mandatory: false },
            TL_REVIEW_RESULT: { name: 'custrecord_twc_srf_rev_tl_rev_res', type: 'select', alias: 'tLReviewResult', display: 'normal', mandatory: false, recordType: 'customrecord_twc_tl_review_result' },
            TL_REVIEW_COMPLETE: { name: 'custrecord_twc_srf_rev_tl_rev_comp', type: 'date', alias: 'tLReviewComplete', display: 'normal', mandatory: false },
            STRUCTURAL_ANALYSIS_REQUIRED: { name: 'custrecord_twc_srf_rev_str_analysis_req', type: 'checkbox', alias: 'structuralAnalysisRequired', display: 'normal', mandatory: false },
            SA_REQUESTED_PLANNED: { name: 'custrecord_twc_srf_rev_sa_req_planned', type: 'date', alias: 'sARequestedPlanned', display: 'normal', mandatory: false },
            SA_REQUESTED_ACTUAL: { name: 'custrecord_twc_srf_rev_sa_req_actual', type: 'date', alias: 'sARequestedActual', display: 'normal', mandatory: false },
            SA_COMPLETE_PLANNED: { name: 'custrecord_twc_srf_rev_sa_comp_plan', type: 'date', alias: 'sACompletePlanned', display: 'normal', mandatory: false },
            SA_COMPLETE_ACTUAL: { name: 'custrecord_twc_srf_rev_sa_comp_actual', type: 'date', alias: 'sACompleteActual', display: 'normal', mandatory: false },
            SPACE_CHECK_PASSED: { name: 'custrecord_twc_srf_rev_space_check_pass', type: 'checkbox', alias: 'spaceCheckPassed', display: 'normal', mandatory: false },
            SPACE_CHECK_COMMENTS: { name: 'custrecord_twc_srf_rev_spc_check_com', type: 'textarea', alias: 'spaceCheckComments', display: 'normal', mandatory: false },
            TL_SERVICES_REQUESTED: { name: 'custrecord_twc_srf_rev_tl_req_svc', type: 'checkbox', alias: 'tLServicesRequested', display: 'normal', mandatory: false },
            SERVICES_REQUESTED_PLANNED: { name: 'custrecord_twc_srf_rev_svc_req_plan', type: 'date', alias: 'servicesRequestedPlanned', display: 'normal', mandatory: false },
            SERVICES_REQUESTED_ACTUAL: { name: 'custrecord_twc_srf_rev_svc_req_actual', type: 'date', alias: 'servicesRequestedActual', display: 'normal', mandatory: false },
            SERVICES_COMPLETE_PLANNED: { name: 'custrecord_twc_srf_rev_svc_comp_plan', type: 'date', alias: 'servicesCompletePlanned', display: 'normal', mandatory: false },
            SERVICES_COMPLETE_ACTUAL: { name: 'custrecord_twc_srf_rev_svc_comp_actual', type: 'date', alias: 'servicesCompleteActual', display: 'normal', mandatory: false },
            FACILITIES_CHECK_PASSED: { name: 'custrecord_twc_srf_rev_fac_check_pass', type: 'checkbox', alias: 'facilitiesCheckPassed', display: 'normal', mandatory: false },
            FACILITIES_CHECK_COMMENTS: { name: 'custrecord_twc_srf_rev_fac_check_com', type: 'textarea', alias: 'facilitiesCheckComments', display: 'normal', mandatory: false },
            FULL_PLANNING_REQUIRED: { name: 'custrecord_twc_srf_rev_full_plan_req', type: 'checkbox', alias: 'fullPlanningRequired', display: 'normal', mandatory: false },
            FP_REQUESTED_PLANNED: { name: 'custrecord_twc_srf_rev_fp_req_plan', type: 'date', alias: 'fPRequestedPlanned', display: 'normal', mandatory: false },
            FP_REQUESTED_ACTUAL: { name: 'custrecord_twc_srf_rev_fp_req_actual', type: 'date', alias: 'fPRequestedActual', display: 'normal', mandatory: false },
            FP_COMPLETE_PLANNED: { name: 'custrecord_twc_srf_rev_fp_comp_plan', type: 'date', alias: 'fPCompletePlanned', display: 'normal', mandatory: false },
            FP_COMPLETE_ACTUAL: { name: 'custrecord_twc_srf_rev_fp_comp_actual', type: 'date', alias: 'fPCompleteActual', display: 'normal', mandatory: false },
            ESTATES_CHECK_PASSED: { name: 'custrecord_twc_srf_rev_est_check_pass', type: 'checkbox', alias: 'estatesCheckPassed', display: 'normal', mandatory: false },
            ESTATES_CHECK_COMMENTS: { name: 'custrecord_twc_srf_rev_est_check_com', type: 'textarea', alias: 'estatesCheckComments', display: 'normal', mandatory: false },
            PRICING_REQUIRED: { name: 'custrecord_twc_srf_rev_prc_req', type: 'checkbox', alias: 'pricingRequired', display: 'normal', mandatory: false },
            FEE_REDUCTION: { name: 'custrecord_twc_srf_rev_fee_redu', type: 'currency', alias: 'feeReduction', display: 'normal', mandatory: false },
            FEE_UPLIFT: { name: 'custrecord_twc_srf_rev_fee_uplift', type: 'currency', alias: 'feeUplift', display: 'normal', mandatory: false },
            NEW_LICENCE_FEE: { name: 'custrecord_twc_srf_rev_new_lic_fee', type: 'currency', alias: 'newLicenceFee', display: 'normal', mandatory: false },
            FEE_CHANGE_BREAKDOWN: { name: 'custrecord_twc_srf_rev_fee_chg_brkdwn', type: 'textarea', alias: 'feeChangeBreakdown', display: 'normal', mandatory: false },
            CUSTOMER_ACCOUNTS_CHECK_PASSED: { name: 'custrecord_twc_srf_rev_cust_acc_chk_pass', type: 'checkbox', alias: 'customerAccountsCheckPassed', display: 'normal', mandatory: false },
            CUSTOMER_ACCOUNTS_CHECK_COMMENTS: { name: 'custrecord_twc_srf_rev_cust_acc_chk_com', type: 'textarea', alias: 'customerAccountsCheckComments', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SRFReview extends customRec.RecordBase {
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
            
            get reviewIteration() {
                return this.get(_recordFields.REVIEW_ITERATION);
            } set reviewIteration(value) {
                this.set(_recordFields.REVIEW_ITERATION, value)
            }
            
            get submissionDate() {
                return this.get(_recordFields.SUBMISSION_DATE);
            } set submissionDate(value) {
                this.set(_recordFields.SUBMISSION_DATE, value)
            }
            
            get customerSubmissionComments() {
                return this.get(_recordFields.CUSTOMER_SUBMISSION_COMMENTS);
            } set customerSubmissionComments(value) {
                this.set(_recordFields.CUSTOMER_SUBMISSION_COMMENTS, value)
            }
            
            get tLReviewComments() {
                return this.get(_recordFields.TL_REVIEW_COMMENTS);
            } set tLReviewComments(value) {
                this.set(_recordFields.TL_REVIEW_COMMENTS, value)
            }
            
            get tLReviewResult() {
                return this.get(_recordFields.TL_REVIEW_RESULT);
            } set tLReviewResult(value) {
                this.set(_recordFields.TL_REVIEW_RESULT, value)
            }
            get tLReviewResultName() { return this.getText(_recordFields.TL_REVIEW_RESULT); }
            
            get tLReviewComplete() {
                return this.get(_recordFields.TL_REVIEW_COMPLETE);
            } set tLReviewComplete(value) {
                this.set(_recordFields.TL_REVIEW_COMPLETE, value)
            }
            
            get structuralAnalysisRequired() {
                return this.get(_recordFields.STRUCTURAL_ANALYSIS_REQUIRED);
            } set structuralAnalysisRequired(value) {
                this.set(_recordFields.STRUCTURAL_ANALYSIS_REQUIRED, value)
            }
            
            get sARequestedPlanned() {
                return this.get(_recordFields.SA_REQUESTED_PLANNED);
            } set sARequestedPlanned(value) {
                this.set(_recordFields.SA_REQUESTED_PLANNED, value)
            }
            
            get sARequestedActual() {
                return this.get(_recordFields.SA_REQUESTED_ACTUAL);
            } set sARequestedActual(value) {
                this.set(_recordFields.SA_REQUESTED_ACTUAL, value)
            }
            
            get sACompletePlanned() {
                return this.get(_recordFields.SA_COMPLETE_PLANNED);
            } set sACompletePlanned(value) {
                this.set(_recordFields.SA_COMPLETE_PLANNED, value)
            }
            
            get sACompleteActual() {
                return this.get(_recordFields.SA_COMPLETE_ACTUAL);
            } set sACompleteActual(value) {
                this.set(_recordFields.SA_COMPLETE_ACTUAL, value)
            }
            
            get spaceCheckPassed() {
                return this.get(_recordFields.SPACE_CHECK_PASSED);
            } set spaceCheckPassed(value) {
                this.set(_recordFields.SPACE_CHECK_PASSED, value)
            }
            
            get spaceCheckComments() {
                return this.get(_recordFields.SPACE_CHECK_COMMENTS);
            } set spaceCheckComments(value) {
                this.set(_recordFields.SPACE_CHECK_COMMENTS, value)
            }
            
            get tLServicesRequested() {
                return this.get(_recordFields.TL_SERVICES_REQUESTED);
            } set tLServicesRequested(value) {
                this.set(_recordFields.TL_SERVICES_REQUESTED, value)
            }
            
            get servicesRequestedPlanned() {
                return this.get(_recordFields.SERVICES_REQUESTED_PLANNED);
            } set servicesRequestedPlanned(value) {
                this.set(_recordFields.SERVICES_REQUESTED_PLANNED, value)
            }
            
            get servicesRequestedActual() {
                return this.get(_recordFields.SERVICES_REQUESTED_ACTUAL);
            } set servicesRequestedActual(value) {
                this.set(_recordFields.SERVICES_REQUESTED_ACTUAL, value)
            }
            
            get servicesCompletePlanned() {
                return this.get(_recordFields.SERVICES_COMPLETE_PLANNED);
            } set servicesCompletePlanned(value) {
                this.set(_recordFields.SERVICES_COMPLETE_PLANNED, value)
            }
            
            get servicesCompleteActual() {
                return this.get(_recordFields.SERVICES_COMPLETE_ACTUAL);
            } set servicesCompleteActual(value) {
                this.set(_recordFields.SERVICES_COMPLETE_ACTUAL, value)
            }
            
            get facilitiesCheckPassed() {
                return this.get(_recordFields.FACILITIES_CHECK_PASSED);
            } set facilitiesCheckPassed(value) {
                this.set(_recordFields.FACILITIES_CHECK_PASSED, value)
            }
            
            get facilitiesCheckComments() {
                return this.get(_recordFields.FACILITIES_CHECK_COMMENTS);
            } set facilitiesCheckComments(value) {
                this.set(_recordFields.FACILITIES_CHECK_COMMENTS, value)
            }
            
            get fullPlanningRequired() {
                return this.get(_recordFields.FULL_PLANNING_REQUIRED);
            } set fullPlanningRequired(value) {
                this.set(_recordFields.FULL_PLANNING_REQUIRED, value)
            }
            
            get fPRequestedPlanned() {
                return this.get(_recordFields.FP_REQUESTED_PLANNED);
            } set fPRequestedPlanned(value) {
                this.set(_recordFields.FP_REQUESTED_PLANNED, value)
            }
            
            get fPRequestedActual() {
                return this.get(_recordFields.FP_REQUESTED_ACTUAL);
            } set fPRequestedActual(value) {
                this.set(_recordFields.FP_REQUESTED_ACTUAL, value)
            }
            
            get fPCompletePlanned() {
                return this.get(_recordFields.FP_COMPLETE_PLANNED);
            } set fPCompletePlanned(value) {
                this.set(_recordFields.FP_COMPLETE_PLANNED, value)
            }
            
            get fPCompleteActual() {
                return this.get(_recordFields.FP_COMPLETE_ACTUAL);
            } set fPCompleteActual(value) {
                this.set(_recordFields.FP_COMPLETE_ACTUAL, value)
            }
            
            get estatesCheckPassed() {
                return this.get(_recordFields.ESTATES_CHECK_PASSED);
            } set estatesCheckPassed(value) {
                this.set(_recordFields.ESTATES_CHECK_PASSED, value)
            }
            
            get estatesCheckComments() {
                return this.get(_recordFields.ESTATES_CHECK_COMMENTS);
            } set estatesCheckComments(value) {
                this.set(_recordFields.ESTATES_CHECK_COMMENTS, value)
            }
            
            get pricingRequired() {
                return this.get(_recordFields.PRICING_REQUIRED);
            } set pricingRequired(value) {
                this.set(_recordFields.PRICING_REQUIRED, value)
            }
            
            get feeReduction() {
                return this.get(_recordFields.FEE_REDUCTION);
            } set feeReduction(value) {
                this.set(_recordFields.FEE_REDUCTION, value)
            }
            
            get feeUplift() {
                return this.get(_recordFields.FEE_UPLIFT);
            } set feeUplift(value) {
                this.set(_recordFields.FEE_UPLIFT, value)
            }
            
            get newLicenceFee() {
                return this.get(_recordFields.NEW_LICENCE_FEE);
            } set newLicenceFee(value) {
                this.set(_recordFields.NEW_LICENCE_FEE, value)
            }
            
            get feeChangeBreakdown() {
                return this.get(_recordFields.FEE_CHANGE_BREAKDOWN);
            } set feeChangeBreakdown(value) {
                this.set(_recordFields.FEE_CHANGE_BREAKDOWN, value)
            }
            
            get customerAccountsCheckPassed() {
                return this.get(_recordFields.CUSTOMER_ACCOUNTS_CHECK_PASSED);
            } set customerAccountsCheckPassed(value) {
                this.set(_recordFields.CUSTOMER_ACCOUNTS_CHECK_PASSED, value)
            }
            
            get customerAccountsCheckComments() {
                return this.get(_recordFields.CUSTOMER_ACCOUNTS_CHECK_COMMENTS);
            } set customerAccountsCheckComments(value) {
                this.set(_recordFields.CUSTOMER_ACCOUNTS_CHECK_COMMENTS, value)
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
            PersistentRecord: OSSMTWC_SRFReview,

            get: function (id) {
                var rec = new OSSMTWC_SRFReview(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SRFReview();
                return rec.select(options);
            }

        }
    });
