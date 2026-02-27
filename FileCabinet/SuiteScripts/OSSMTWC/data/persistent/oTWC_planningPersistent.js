/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_plan';
        var _recordFields = {
            PLANNING_RECORD_ID: 'custrecord_twc_plan_record_id',
            SITE: 'custrecord_twc_plan_site',
            INFRASTRUCTURE: 'custrecord_twc_plan_infra',
            CURRENT_PLANNING_RECORD_FOR_STRUCTURE: 'custrecord_twc_plan_curr_plan_rec_str',
            IN_PROGRESS_PLANNING_RECORD_FOR_STRUCTURE: 'custrecord_twc_plan_prog_plan_rec_str',
            PLANNING_TYPE: 'custrecord_twc_plan_type',
            PLANNING_STATUS: 'custrecord_twc_plan_status',
            PLANNING_EXPIRY_DATE: 'custrecord_twc_plan_expiry_date',
            COMMENTS: 'custrecord_twc_plan_comments',
            LOCAL_AUTHORITY: 'custrecord_twc_plan_local_authority',
            LOCAL_AUTHORITY_REFERENCE: 'custrecord_twc_plan_local_auth_ref',
            PLANNING_COMPANY: 'custrecord_twc_plan_co',
            PLANNER: 'custrecord_twc_plan_planner',
            CONSULTANT: 'custrecord_twc_plan_consultant',
            FORECAST_SUBMISSION_DATE: 'custrecord_twc_plan_forecast_sub_date',
            SUBMITTED_DATE: 'custrecord_twc_plan_submitted_date',
            FI_REQUESTED: 'custrecord_twc_plan_fi_req',
            FI_SUBMITTED: 'custrecord_twc_plan_fi_submitted',
            NOTIFICATION_OF_DECISION_DATE: 'custrecord_twc_plan_notif_decision_date',
            LOCAL_AUTHORITY_DECISION: 'custrecord_twc_plan_local_auth_dec',
            LOCAL_AUTHORITY_FINAL_DECISION_DATE: 'custrecord_twc_plan_loc_auth_final_date',
            RESTRICTED: 'custrecord_twc_plan_restricted',
            CONDITIONS: 'custrecord_twc_plan_condition',
            CONDITIONS_DISCHARGED: 'custrecord_twc_plan_condition_discharged',
            CONDITIONS_OUTSTANDING: 'custrecord_twc_plan_condition_outstand',
            FINANCIAL_CONDITION_STATUS: 'custrecord_twc_plan_fin_con_sts',
            FINANCIAL_CONDITION_AMOUNT: 'custrecord_twc_plan_fin_con_amt',
            FIRST_PARTY_APPEAL: 'custrecord_twc_plan_1_party_appeal',
            THIRD_PARTY_APPEAL: 'custrecord_twc_plan_3_party_appeal',
            FINANCIAL_APPEAL: 'custrecord_twc_plan_fin_appeal',
            ACP_REFERENCE: 'custrecord_twc_plan_acp_ref',
            APPEAL_SUBMISSION_DATE: 'custrecord_twc_plan_appeal_subm_date',
            ACP_DECISION: 'custrecord_twc_plan_acp_decision',
            ACP_FORECAST_DECISION_DATE: 'custrecord_twc_plan_acp_fcst_dec_date',
            ACP_DECISION_DATE: 'custrecord_twc_plan_acp_dec_date',
            SECTION_5_SUBMITTED: 'custrecord_twc_plan_sec_5_sub',
            SECTION_5_DECIDED: 'custrecord_twc_plan_sec_5_dec',
            SECTION_5_REFERENCE: 'custrecord_twc_plan_sec_5_ref',
            SECTION_5_DECISION: 'custrecord_twc_plan_sec_5_decision',
            SECTION_5_COMMENT: 'custrecord_twc_plan_sec_5_comments',
            RISK_LEVEL: 'custrecord_twc_plan_risk_level',
            CR_SENSITIVITY: 'custrecord_twc_plan_cr_sensitivity',
            CR_COMMENTS: 'custrecord_twc_plan_cr_comments',
            PR_SENSITIVITY: 'custrecord_twc_plan_pr_sensitivity',
            PR_COMMENTS: 'custrecord_twc_plan_pr_comments',
            JUDICIAL_REVIEW_STATUS: 'custrecord_twc_plan_judicial_review_sts',
            JR_APPLICATION_MADE: 'custrecord_twc_plan_jr_app_made',
            HEARING_COMMENCEMENT: 'custrecord_twc_plan_hearing_comm',
            JR_COMMENTS: 'custrecord_twc_plan_jr_comments',
            JR_RESULT: 'custrecord_twc_plan_jr_result',
            FILES_AVAILABLE: 'custrecord_twc_plan_files_available',
            PLANNING_DESIGNER: 'custrecord_twc_plan_designer',
            PLANNING_FILES: 'custrecord_twc_plan_files',
        }
        var _recordFieldInfo = {
            PLANNING_RECORD_ID: { name: 'custrecord_twc_plan_record_id', type: 'text', alias: 'planningRecordID', display: 'normal', mandatory: false },
            SITE: { name: 'custrecord_twc_plan_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            INFRASTRUCTURE: { name: 'custrecord_twc_plan_infra', type: 'select', alias: 'infrastructure', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra,' },
            CURRENT_PLANNING_RECORD_FOR_STRUCTURE: { name: 'custrecord_twc_plan_curr_plan_rec_str', type: 'checkbox', alias: 'currentPlanningRecordforStructure', display: 'normal', mandatory: false },
            IN_PROGRESS_PLANNING_RECORD_FOR_STRUCTURE: { name: 'custrecord_twc_plan_prog_plan_rec_str', type: 'checkbox', alias: 'inProgressPlanningRecordforStructure', display: 'normal', mandatory: false },
            PLANNING_TYPE: { name: 'custrecord_twc_plan_type', type: 'select', alias: 'planningType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_planning_type,' },
            PLANNING_STATUS: { name: 'custrecord_twc_plan_status', type: 'select', alias: 'planningStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_planning_status,' },
            PLANNING_EXPIRY_DATE: { name: 'custrecord_twc_plan_expiry_date', type: 'date', alias: 'planningExpiryDate', display: 'normal', mandatory: false },
            COMMENTS: { name: 'custrecord_twc_plan_comments', type: 'clobtext', alias: 'comments', display: 'normal', mandatory: false },
            LOCAL_AUTHORITY: { name: 'custrecord_twc_plan_local_authority', type: 'text', alias: 'localAuthority', display: 'normal', mandatory: false },
            LOCAL_AUTHORITY_REFERENCE: { name: 'custrecord_twc_plan_local_auth_ref', type: 'text', alias: 'localAuthorityReference', display: 'normal', mandatory: false },
            PLANNING_COMPANY: { name: 'custrecord_twc_plan_co', type: 'select', alias: 'planningCompany', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company,' },
            PLANNER: { name: 'custrecord_twc_plan_planner', type: 'select', alias: 'planner', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            CONSULTANT: { name: 'custrecord_twc_plan_consultant', type: 'select', alias: 'consultant', display: 'normal', mandatory: false, recordType: '-2' },
            FORECAST_SUBMISSION_DATE: { name: 'custrecord_twc_plan_forecast_sub_date', type: 'date', alias: 'forecastSubmissionDate', display: 'normal', mandatory: false },
            SUBMITTED_DATE: { name: 'custrecord_twc_plan_submitted_date', type: 'date', alias: 'submittedDate', display: 'normal', mandatory: false },
            FI_REQUESTED: { name: 'custrecord_twc_plan_fi_req', type: 'date', alias: 'fIRequested', display: 'normal', mandatory: false },
            FI_SUBMITTED: { name: 'custrecord_twc_plan_fi_submitted', type: 'date', alias: 'fISubmitted', display: 'normal', mandatory: false },
            NOTIFICATION_OF_DECISION_DATE: { name: 'custrecord_twc_plan_notif_decision_date', type: 'date', alias: 'notificationofDecisionDate', display: 'normal', mandatory: false },
            LOCAL_AUTHORITY_DECISION: { name: 'custrecord_twc_plan_local_auth_dec', type: 'select', alias: 'localAuthorityDecision', display: 'normal', mandatory: false, recordType: 'customrecord_twc_local_auth_decisios,' },
            LOCAL_AUTHORITY_FINAL_DECISION_DATE: { name: 'custrecord_twc_plan_loc_auth_final_date', type: 'date', alias: 'localAuthorityFinalDecisionDate', display: 'normal', mandatory: false },
            RESTRICTED: { name: 'custrecord_twc_plan_restricted', type: 'checkbox', alias: 'restricted', display: 'normal', mandatory: false },
            CONDITIONS: { name: 'custrecord_twc_plan_condition', type: 'clobtext', alias: 'conditions', display: 'normal', mandatory: false },
            CONDITIONS_DISCHARGED: { name: 'custrecord_twc_plan_condition_discharged', type: 'checkbox', alias: 'conditionsDischarged', display: 'normal', mandatory: false },
            CONDITIONS_OUTSTANDING: { name: 'custrecord_twc_plan_condition_outstand', type: 'checkbox', alias: 'conditionsOutstanding', display: 'normal', mandatory: false },
            FINANCIAL_CONDITION_STATUS: { name: 'custrecord_twc_plan_fin_con_sts', type: 'select', alias: 'financialConditionStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_financial_condition_sts,' },
            FINANCIAL_CONDITION_AMOUNT: { name: 'custrecord_twc_plan_fin_con_amt', type: 'currency', alias: 'financialConditionAmount', display: 'normal', mandatory: false },
            FIRST_PARTY_APPEAL: { name: 'custrecord_twc_plan_1_party_appeal', type: 'checkbox', alias: '1stPartyAppeal', display: 'normal', mandatory: false },
            THIRD_PARTY_APPEAL: { name: 'custrecord_twc_plan_3_party_appeal', type: 'checkbox', alias: '3rdPartyAppeal', display: 'normal', mandatory: false },
            FINANCIAL_APPEAL: { name: 'custrecord_twc_plan_fin_appeal', type: 'checkbox', alias: 'financialAppeal', display: 'normal', mandatory: false },
            ACP_REFERENCE: { name: 'custrecord_twc_plan_acp_ref', type: 'text', alias: 'aCPReference', display: 'normal', mandatory: false },
            APPEAL_SUBMISSION_DATE: { name: 'custrecord_twc_plan_appeal_subm_date', type: 'date', alias: 'appealSubmissionDate', display: 'normal', mandatory: false },
            ACP_DECISION: { name: 'custrecord_twc_plan_acp_decision', type: 'select', alias: 'aCPDecision', display: 'normal', mandatory: false, recordType: 'customrecord_twc_local_auth_decisios,' },
            ACP_FORECAST_DECISION_DATE: { name: 'custrecord_twc_plan_acp_fcst_dec_date', type: 'date', alias: 'aCPForecastDecisionDate', display: 'normal', mandatory: false },
            ACP_DECISION_DATE: { name: 'custrecord_twc_plan_acp_dec_date', type: 'date', alias: 'aCPDecisionDate', display: 'normal', mandatory: false },
            SECTION_5_SUBMITTED: { name: 'custrecord_twc_plan_sec_5_sub', type: 'date', alias: 'section5Submitted', display: 'normal', mandatory: false },
            SECTION_5_DECIDED: { name: 'custrecord_twc_plan_sec_5_dec', type: 'date', alias: 'section5Decided', display: 'normal', mandatory: false },
            SECTION_5_REFERENCE: { name: 'custrecord_twc_plan_sec_5_ref', type: 'text', alias: 'section5Reference', display: 'normal', mandatory: false },
            SECTION_5_DECISION: { name: 'custrecord_twc_plan_sec_5_decision', type: 'select', alias: 'section5Decision', display: 'normal', mandatory: false, recordType: 'customrecord_twc_section_5_decision,' },
            SECTION_5_COMMENT: { name: 'custrecord_twc_plan_sec_5_comments', type: 'clobtext', alias: 'section5Comment', display: 'normal', mandatory: false },
            RISK_LEVEL: { name: 'custrecord_twc_plan_risk_level', type: 'select', alias: 'riskLevel', display: 'normal', mandatory: false, recordType: 'customrecord_twc_risk_level,' },
            CR_SENSITIVITY: { name: 'custrecord_twc_plan_cr_sensitivity', type: 'select', alias: 'c.R.Sensitivity', display: 'normal', mandatory: false, recordType: 'customrecord_twc_risk_level,' },
            CR_COMMENTS: { name: 'custrecord_twc_plan_cr_comments', type: 'clobtext', alias: 'c.R.Comments', display: 'normal', mandatory: false },
            PR_SENSITIVITY: { name: 'custrecord_twc_plan_pr_sensitivity', type: 'select', alias: 'p.R.Sensitivity', display: 'normal', mandatory: false, recordType: 'customrecord_twc_risk_level,' },
            PR_COMMENTS: { name: 'custrecord_twc_plan_pr_comments', type: 'clobtext', alias: 'p.R.Comments', display: 'normal', mandatory: false },
            JUDICIAL_REVIEW_STATUS: { name: 'custrecord_twc_plan_judicial_review_sts', type: 'select', alias: 'judicialReviewStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_judicial_review_sts,' },
            JR_APPLICATION_MADE: { name: 'custrecord_twc_plan_jr_app_made', type: 'date', alias: 'jRApplicationMade', display: 'normal', mandatory: false },
            HEARING_COMMENCEMENT: { name: 'custrecord_twc_plan_hearing_comm', type: 'date', alias: 'hearingCommencement', display: 'normal', mandatory: false },
            JR_COMMENTS: { name: 'custrecord_twc_plan_jr_comments', type: 'clobtext', alias: 'jRComments', display: 'normal', mandatory: false },
            JR_RESULT: { name: 'custrecord_twc_plan_jr_result', type: 'select', alias: 'jRResult', display: 'normal', mandatory: false, recordType: 'customrecord_twc_jr_result,' },
            FILES_AVAILABLE: { name: 'custrecord_twc_plan_files_available', type: 'checkbox', alias: 'filesAvailable', display: 'normal', mandatory: false },
            PLANNING_DESIGNER: { name: 'custrecord_twc_plan_designer', type: 'select', alias: 'planningDesigner', display: 'normal', mandatory: false, recordType: '-2' },
            PLANNING_FILES: { name: 'custrecord_twc_plan_files', type: 'document', alias: 'planningFiles', display: 'normal', mandatory: false },
        }

        class OSSMTWC_Planning extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get planningRecordID() {
                return this.get(_recordFields.PLANNING_RECORD_ID);
            } set planningRecordID(value) {
                this.set(_recordFields.PLANNING_RECORD_ID, value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get infrastructure() {
                return this.get(_recordFields.INFRASTRUCTURE);
            } set infrastructure(value) {
                this.set(_recordFields.INFRASTRUCTURE, value)
            }
            get infrastructureName() { return this.getText(_recordFields.INFRASTRUCTURE); }
            
            get currentPlanningRecordforStructure() {
                return this.get(_recordFields.CURRENT_PLANNING_RECORD_FOR_STRUCTURE);
            } set currentPlanningRecordforStructure(value) {
                this.set(_recordFields.CURRENT_PLANNING_RECORD_FOR_STRUCTURE, value)
            }
            
            get inProgressPlanningRecordforStructure() {
                return this.get(_recordFields.IN_PROGRESS_PLANNING_RECORD_FOR_STRUCTURE);
            } set inProgressPlanningRecordforStructure(value) {
                this.set(_recordFields.IN_PROGRESS_PLANNING_RECORD_FOR_STRUCTURE, value)
            }
            
            get planningType() {
                return this.get(_recordFields.PLANNING_TYPE);
            } set planningType(value) {
                this.set(_recordFields.PLANNING_TYPE, value)
            }
            get planningTypeName() { return this.getText(_recordFields.PLANNING_TYPE); }
            
            get planningStatus() {
                return this.get(_recordFields.PLANNING_STATUS);
            } set planningStatus(value) {
                this.set(_recordFields.PLANNING_STATUS, value)
            }
            get planningStatusName() { return this.getText(_recordFields.PLANNING_STATUS); }
            
            get planningExpiryDate() {
                return this.get(_recordFields.PLANNING_EXPIRY_DATE);
            } set planningExpiryDate(value) {
                this.set(_recordFields.PLANNING_EXPIRY_DATE, value)
            }
            
            get comments() {
                return this.get(_recordFields.COMMENTS);
            } set comments(value) {
                this.set(_recordFields.COMMENTS, value)
            }
            
            get localAuthority() {
                return this.get(_recordFields.LOCAL_AUTHORITY);
            } set localAuthority(value) {
                this.set(_recordFields.LOCAL_AUTHORITY, value)
            }
            
            get localAuthorityReference() {
                return this.get(_recordFields.LOCAL_AUTHORITY_REFERENCE);
            } set localAuthorityReference(value) {
                this.set(_recordFields.LOCAL_AUTHORITY_REFERENCE, value)
            }
            
            get planningCompany() {
                return this.get(_recordFields.PLANNING_COMPANY);
            } set planningCompany(value) {
                this.set(_recordFields.PLANNING_COMPANY, value)
            }
            get planningCompanyName() { return this.getText(_recordFields.PLANNING_COMPANY); }
            
            get planner() {
                return this.get(_recordFields.PLANNER);
            } set planner(value) {
                this.set(_recordFields.PLANNER, value)
            }
            get plannerName() { return this.getText(_recordFields.PLANNER); }
            
            get consultant() {
                return this.get(_recordFields.CONSULTANT);
            } set consultant(value) {
                this.set(_recordFields.CONSULTANT, value)
            }
            get consultantName() { return this.getText(_recordFields.CONSULTANT); }
            
            get forecastSubmissionDate() {
                return this.get(_recordFields.FORECAST_SUBMISSION_DATE);
            } set forecastSubmissionDate(value) {
                this.set(_recordFields.FORECAST_SUBMISSION_DATE, value)
            }
            
            get submittedDate() {
                return this.get(_recordFields.SUBMITTED_DATE);
            } set submittedDate(value) {
                this.set(_recordFields.SUBMITTED_DATE, value)
            }
            
            get fIRequested() {
                return this.get(_recordFields.FI_REQUESTED);
            } set fIRequested(value) {
                this.set(_recordFields.FI_REQUESTED, value)
            }
            
            get fISubmitted() {
                return this.get(_recordFields.FI_SUBMITTED);
            } set fISubmitted(value) {
                this.set(_recordFields.FI_SUBMITTED, value)
            }
            
            get notificationofDecisionDate() {
                return this.get(_recordFields.NOTIFICATION_OF_DECISION_DATE);
            } set notificationofDecisionDate(value) {
                this.set(_recordFields.NOTIFICATION_OF_DECISION_DATE, value)
            }
            
            get localAuthorityDecision() {
                return this.get(_recordFields.LOCAL_AUTHORITY_DECISION);
            } set localAuthorityDecision(value) {
                this.set(_recordFields.LOCAL_AUTHORITY_DECISION, value)
            }
            get localAuthorityDecisionName() { return this.getText(_recordFields.LOCAL_AUTHORITY_DECISION); }
            
            get localAuthorityFinalDecisionDate() {
                return this.get(_recordFields.LOCAL_AUTHORITY_FINAL_DECISION_DATE);
            } set localAuthorityFinalDecisionDate(value) {
                this.set(_recordFields.LOCAL_AUTHORITY_FINAL_DECISION_DATE, value)
            }
            
            get restricted() {
                return this.get(_recordFields.RESTRICTED);
            } set restricted(value) {
                this.set(_recordFields.RESTRICTED, value)
            }
            
            get conditions() {
                return this.get(_recordFields.CONDITIONS);
            } set conditions(value) {
                this.set(_recordFields.CONDITIONS, value)
            }
            
            get conditionsDischarged() {
                return this.get(_recordFields.CONDITIONS_DISCHARGED);
            } set conditionsDischarged(value) {
                this.set(_recordFields.CONDITIONS_DISCHARGED, value)
            }
            
            get conditionsOutstanding() {
                return this.get(_recordFields.CONDITIONS_OUTSTANDING);
            } set conditionsOutstanding(value) {
                this.set(_recordFields.CONDITIONS_OUTSTANDING, value)
            }
            
            get financialConditionStatus() {
                return this.get(_recordFields.FINANCIAL_CONDITION_STATUS);
            } set financialConditionStatus(value) {
                this.set(_recordFields.FINANCIAL_CONDITION_STATUS, value)
            }
            get financialConditionStatusName() { return this.getText(_recordFields.FINANCIAL_CONDITION_STATUS); }
            
            get financialConditionAmount() {
                return this.get(_recordFields.FINANCIAL_CONDITION_AMOUNT);
            } set financialConditionAmount(value) {
                this.set(_recordFields.FINANCIAL_CONDITION_AMOUNT, value)
            }
            
            get firstPartyAppeal() {
                return this.get(_recordFields.FIRSTST_PARTY_APPEAL);
            } set firstPartyAppeal(value) {
                this.set(_recordFields.FIRSTST_PARTY_APPEAL, value)
            }
            
            get thirdPartyAppeal() {
                return this.get(_recordFields.THIRD_PARTY_APPEAL);
            } set thirdPartyAppeal(value) {
                this.set(_recordFields.THIRD_PARTY_APPEAL, value)
            }
            
            get financialAppeal() {
                return this.get(_recordFields.FINANCIAL_APPEAL);
            } set financialAppeal(value) {
                this.set(_recordFields.FINANCIAL_APPEAL, value)
            }
            
            get aCPReference() {
                return this.get(_recordFields.ACP_REFERENCE);
            } set aCPReference(value) {
                this.set(_recordFields.ACP_REFERENCE, value)
            }
            
            get appealSubmissionDate() {
                return this.get(_recordFields.APPEAL_SUBMISSION_DATE);
            } set appealSubmissionDate(value) {
                this.set(_recordFields.APPEAL_SUBMISSION_DATE, value)
            }
            
            get aCPDecision() {
                return this.get(_recordFields.ACP_DECISION);
            } set aCPDecision(value) {
                this.set(_recordFields.ACP_DECISION, value)
            }
            get aCPDecisionName() { return this.getText(_recordFields.ACP_DECISION); }
            
            get aCPForecastDecisionDate() {
                return this.get(_recordFields.ACP_FORECAST_DECISION_DATE);
            } set aCPForecastDecisionDate(value) {
                this.set(_recordFields.ACP_FORECAST_DECISION_DATE, value)
            }
            
            get aCPDecisionDate() {
                return this.get(_recordFields.ACP_DECISION_DATE);
            } set aCPDecisionDate(value) {
                this.set(_recordFields.ACP_DECISION_DATE, value)
            }
            
            get section5Submitted() {
                return this.get(_recordFields.SECTION_5_SUBMITTED);
            } set section5Submitted(value) {
                this.set(_recordFields.SECTION_5_SUBMITTED, value)
            }
            
            get section5Decided() {
                return this.get(_recordFields.SECTION_5_DECIDED);
            } set section5Decided(value) {
                this.set(_recordFields.SECTION_5_DECIDED, value)
            }
            
            get section5Reference() {
                return this.get(_recordFields.SECTION_5_REFERENCE);
            } set section5Reference(value) {
                this.set(_recordFields.SECTION_5_REFERENCE, value)
            }
            
            get section5Decision() {
                return this.get(_recordFields.SECTION_5_DECISION);
            } set section5Decision(value) {
                this.set(_recordFields.SECTION_5_DECISION, value)
            }
            get section5DecisionName() { return this.getText(_recordFields.SECTION_5_DECISION); }
            
            get section5Comment() {
                return this.get(_recordFields.SECTION_5_COMMENT);
            } set section5Comment(value) {
                this.set(_recordFields.SECTION_5_COMMENT, value)
            }
            
            get riskLevel() {
                return this.get(_recordFields.RISK_LEVEL);
            } set riskLevel(value) {
                this.set(_recordFields.RISK_LEVEL, value)
            }
            get riskLevelName() { return this.getText(_recordFields.RISK_LEVEL); }
            
            get cr_Sensitivity() {
                return this.get(_recordFields.C.R._SENSITIVITY);
            } set cr_Sensitivity(value) {
                this.set(_recordFields.C.R._SENSITIVITY, value)
            }
            get cr_SensitivityName() { return this.getText(_recordFields.C.R._SENSITIVITY); }
            
            get cr_Comments() {
                return this.get(_recordFields.C.R._COMMENTS);
            } set cr_Comments(value) {
                this.set(_recordFields.C.R._COMMENTS, value)
            }
            
            get pr_Sensitivity() {
                return this.get(_recordFields.P.R._SENSITIVITY);
            } set pr_Sensitivity(value) {
                this.set(_recordFields.P.R._SENSITIVITY, value)
            }
            get pr_SensitivityName() { return this.getText(_recordFields.P.R._SENSITIVITY); }
            
            get pr_Comments() {
                return this.get(_recordFields.P.R._COMMENTS);
            } set pr_Comments(value) {
                this.set(_recordFields.P.R._COMMENTS, value)
            }
            
            get judicialReviewStatus() {
                return this.get(_recordFields.JUDICIAL_REVIEW_STATUS);
            } set judicialReviewStatus(value) {
                this.set(_recordFields.JUDICIAL_REVIEW_STATUS, value)
            }
            get judicialReviewStatusName() { return this.getText(_recordFields.JUDICIAL_REVIEW_STATUS); }
            
            get jRApplicationMade() {
                return this.get(_recordFields.JR_APPLICATION_MADE);
            } set jRApplicationMade(value) {
                this.set(_recordFields.JR_APPLICATION_MADE, value)
            }
            
            get hearingCommencement() {
                return this.get(_recordFields.HEARING_COMMENCEMENT);
            } set hearingCommencement(value) {
                this.set(_recordFields.HEARING_COMMENCEMENT, value)
            }
            
            get jRComments() {
                return this.get(_recordFields.JR_COMMENTS);
            } set jRComments(value) {
                this.set(_recordFields.JR_COMMENTS, value)
            }
            
            get jRResult() {
                return this.get(_recordFields.JR_RESULT);
            } set jRResult(value) {
                this.set(_recordFields.JR_RESULT, value)
            }
            get jRResultName() { return this.getText(_recordFields.JR_RESULT); }
            
            get filesAvailable() {
                return this.get(_recordFields.FILES_AVAILABLE);
            } set filesAvailable(value) {
                this.set(_recordFields.FILES_AVAILABLE, value)
            }
            
            get planningDesigner() {
                return this.get(_recordFields.PLANNING_DESIGNER);
            } set planningDesigner(value) {
                this.set(_recordFields.PLANNING_DESIGNER, value)
            }
            get planningDesignerName() { return this.getText(_recordFields.PLANNING_DESIGNER); }
            
            get planningFiles() {
                return this.get(_recordFields.PLANNING_FILES);
            } set planningFiles(value) {
                this.set(_recordFields.PLANNING_FILES, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_Planning,

            get: function (id) {
                var rec = new OSSMTWC_Planning(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Planning();
                return rec.select(options);
            }

        }
    });
