/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf';
        var _recordFields = {
            NAME: 'name',
            PHOTO_ASSESSMENT_CATEGORY: 'custrecord_twc_srf_photo_asses_cat',
            SRF_TYPE: 'custrecord_twc_srf_type',
            OPERATOR_SITE_ID: 'custrecord_twc_srf_op_site_id',
            COMPLETION_PHOTOS_REQUESTED: 'custrecord_twc_srf_completion_photo_req',
            COMPLETION_PHOTOS_RECEIVED: 'custrecord_twc_srf_completion_photo_rec',
            SITE: 'custrecord_twc_srf_site',
            COMPLETION_PHOTOS_REVIEWED: 'custrecord_twc_srf_completion_photo_rev',
            CUSTOMER: 'custrecord_twc_srf_cust',
            SRF_SUBMITTED_BY: 'custrecord_twc_srf_sub_by',
            SRF_ID: 'custrecord_twc_srf_id',
            RELATED_EQUIPMENT_ACTIONS: 'custrecord_twc_srf_related_eqip_actions',
            APPLICATION_DATE: 'custrecord_twc_srf_app_date',
            SRF_DRAWINGS: 'custrecord_twc_srf_drg',
            POWER_SUPPLY_REQUESTED_FROM_TL: 'custrecord_twc_srf_pwr_supp_req_from_tl',
            APPLICATION_REFERENCE: 'custrecord_twc_srf_app_reference',
            ALTERNATE_POWER_SUPPLIER: 'custrecord_twc_srf_alternate_pwr_supp',
            APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB: 'custrecord_twc_srf_app_supp_made_esb',
            POWER_NOTES: 'custrecord_twc_srf_power_notes',
            SRF_STATUS: 'custrecord_twc_srf_status',
            SRF_REQUESTED_DATE: 'custrecord_twc_srf_req_date',
            INITIAL_REVIEW_COMMENTS: 'custrecord_twc_srf_init_rev_comm',
            CUSTOMER_PLANNED_INSTALL_DATE: 'custrecord_twc_srf_cust_plan_ins_date',
            TL_DRAWING_REQUESTED: 'custrecord_twc_srf_tl_drg_req',
            FEEDBACK_LOOP_ITERATIONS: 'custrecord_twc_srf_fdbk_loop_iter',
            SRF_REVIEWS: 'custrecord_twc_srf_review',
            SRF_APPROVAL_DATE: 'custrecord_twc_srf_approval_date',
            WORKS_PERMITTED_DATE: 'custrecord_twc_srf_permit_date',
            TO_BE_BILLED: 'custrecord_twc_srf_to_be_billed',
            BILL_FROM: 'custrecord_twc_srf_bill_from',
            HOLD_ACTION: 'custrecord_twc_srf_hold_action',
            SRF_CONDITIONS: 'custrecord_twc_srf_cond',
            TL_DRAWING_DRAFTED: 'custrecord_twc_srf_tl_drg_draft',
            TL_DRAWING_REVIEWED: 'custrecord_twc_srf_tl_drg_rev',
            TL_DRAWING_UPLOADED: 'custrecord_twc_srf_tl_drg_upl',
            TL_DRAWING: 'custrecord_twc_srf_tl_drg',
            LICENCE_MECHANISM: 'custrecord_twc_srf_lic_mech',
            LICENCE_REQUESTED: 'custrecord_twc_srf_lic_req',
            LICENCE_PACK_PRODUCED: 'custrecord_twc_srf_lic_pack_prod',
            LICENCE_PACK_REVIEWER: 'custrecord_twc_srf_lic_pack_rev',
            LICENCE_PACK_REVIEWED: 'custrecord_twc_srf_lic_pack_revd',
            LICENCE_PACK_ISSUED: 'custrecord_twc_srf_lic_pack_issued',
            LICENCE_PACK_SIGNED: 'custrecord_twc_srf_lic_pack_signed',
            LICENCE_PACK_SIGNED_BY: 'custrecord_twc_srf_lic_pack_sign_by',
            LICENCE_PACK_EXECUTED: 'custrecord_twc_srf_lic_pack_exec',
            LICENCE_PACK_EXECUTED_BY: 'custrecord_twc_srf_lic_pack_exec_by',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            PHOTO_ASSESSMENT_CATEGORY: { name: 'custrecord_twc_srf_photo_asses_cat', type: 'select', alias: 'photoAssessmentCategory', display: 'normal', mandatory: false, recordType: 'customrecord_twc_photo_assessment_cat,' },
            SRF_TYPE: { name: 'custrecord_twc_srf_type', type: 'select', alias: 'sRFType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_type,' },
            OPERATOR_SITE_ID: { name: 'custrecord_twc_srf_op_site_id', type: 'text', alias: 'operatorSiteID', display: 'normal', mandatory: false },
            COMPLETION_PHOTOS_REQUESTED: { name: 'custrecord_twc_srf_completion_photo_req', type: 'date', alias: 'completionPhotosRequested', display: 'normal', mandatory: false },
            COMPLETION_PHOTOS_RECEIVED: { name: 'custrecord_twc_srf_completion_photo_rec', type: 'date', alias: 'completionPhotosReceived', display: 'normal', mandatory: false },
            SITE: { name: 'custrecord_twc_srf_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            COMPLETION_PHOTOS_REVIEWED: { name: 'custrecord_twc_srf_completion_photo_rev', type: 'date', alias: 'completionPhotosReviewed', display: 'normal', mandatory: false },
            CUSTOMER: { name: 'custrecord_twc_srf_cust', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: '-2' },
            SRF_SUBMITTED_BY: { name: 'custrecord_twc_srf_sub_by', type: 'select', alias: 'sRFSubmittedBy', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            SRF_ID: { name: 'custrecord_twc_srf_id', type: 'text', alias: 'sRFID', display: 'normal', mandatory: false },
            RELATED_EQUIPMENT_ACTIONS: { name: 'custrecord_twc_srf_related_eqip_actions', type: 'select', alias: 'relatedEquipmentActions', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_action,' },
            APPLICATION_DATE: { name: 'custrecord_twc_srf_app_date', type: 'date', alias: 'applicationDate', display: 'normal', mandatory: false },
            SRF_DRAWINGS: { name: 'custrecord_twc_srf_drg', type: 'document', alias: 'sRFDrawings', display: 'normal', mandatory: false },
            POWER_SUPPLY_REQUESTED_FROM_TL: { name: 'custrecord_twc_srf_pwr_supp_req_from_tl', type: 'checkbox', alias: 'powerSupplyRequestedfromTL', display: 'normal', mandatory: false },
            APPLICATION_REFERENCE: { name: 'custrecord_twc_srf_app_reference', type: 'text', alias: 'applicationReference', display: 'normal', mandatory: false },
            ALTERNATE_POWER_SUPPLIER: { name: 'custrecord_twc_srf_alternate_pwr_supp', type: 'text', alias: 'alternatePowerSupplier', display: 'normal', mandatory: false },
            APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB: { name: 'custrecord_twc_srf_app_supp_made_esb', type: 'date', alias: 'applicationforownsupplymadetoESB', display: 'normal', mandatory: false },
            POWER_NOTES: { name: 'custrecord_twc_srf_power_notes', type: 'text', alias: 'powerNotes', display: 'normal', mandatory: false },
            SRF_STATUS: { name: 'custrecord_twc_srf_status', type: 'select', alias: 'sRFStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_status,' },
            SRF_REQUESTED_DATE: { name: 'custrecord_twc_srf_req_date', type: 'date', alias: 'sRFRequestedDate', display: 'normal', mandatory: false },
            INITIAL_REVIEW_COMMENTS: { name: 'custrecord_twc_srf_init_rev_comm', type: 'textarea', alias: 'initialReviewComments', display: 'normal', mandatory: false },
            CUSTOMER_PLANNED_INSTALL_DATE: { name: 'custrecord_twc_srf_cust_plan_ins_date', type: 'date', alias: 'customerPlannedInstallDate', display: 'normal', mandatory: false },
            TL_DRAWING_REQUESTED: { name: 'custrecord_twc_srf_tl_drg_req', type: 'checkbox', alias: 'tLDrawingRequested', display: 'normal', mandatory: false },
            FEEDBACK_LOOP_ITERATIONS: { name: 'custrecord_twc_srf_fdbk_loop_iter', type: 'integer', alias: 'feedbackLoopIterations', display: 'normal', mandatory: false },
            SRF_REVIEWS: { name: 'custrecord_twc_srf_review', type: 'select', alias: 'sRFReviews', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_rev,' },
            SRF_APPROVAL_DATE: { name: 'custrecord_twc_srf_approval_date', type: 'date', alias: 'sRFApprovalDate', display: 'normal', mandatory: false },
            WORKS_PERMITTED_DATE: { name: 'custrecord_twc_srf_permit_date', type: 'date', alias: 'worksPermittedDate', display: 'normal', mandatory: false },
            TO_BE_BILLED: { name: 'custrecord_twc_srf_to_be_billed', type: 'checkbox', alias: 'tobeBilled', display: 'normal', mandatory: false },
            BILL_FROM: { name: 'custrecord_twc_srf_bill_from', type: 'date', alias: 'billFrom', display: 'normal', mandatory: false },
            HOLD_ACTION: { name: 'custrecord_twc_srf_hold_action', type: 'checkbox', alias: 'holdAction', display: 'normal', mandatory: false },
            SRF_CONDITIONS: { name: 'custrecord_twc_srf_cond', type: 'textarea', alias: 'sRFConditions', display: 'normal', mandatory: false },
            TL_DRAWING_DRAFTED: { name: 'custrecord_twc_srf_tl_drg_draft', type: 'date', alias: 'tLDrawingDrafted', display: 'normal', mandatory: false },
            TL_DRAWING_REVIEWED: { name: 'custrecord_twc_srf_tl_drg_rev', type: 'date', alias: 'tLDrawingReviewed', display: 'normal', mandatory: false },
            TL_DRAWING_UPLOADED: { name: 'custrecord_twc_srf_tl_drg_upl', type: 'date', alias: 'tLDrawingUploaded', display: 'normal', mandatory: false },
            TL_DRAWING: { name: 'custrecord_twc_srf_tl_drg', type: 'document', alias: 'tLDrawing', display: 'normal', mandatory: false },
            LICENCE_MECHANISM: { name: 'custrecord_twc_srf_lic_mech', type: 'select', alias: 'licenceMechanism', display: 'normal', mandatory: false, recordType: 'customrecord_twc_lic_mech,' },
            LICENCE_REQUESTED: { name: 'custrecord_twc_srf_lic_req', type: 'date', alias: 'licenceRequested', display: 'normal', mandatory: false },
            LICENCE_PACK_PRODUCED: { name: 'custrecord_twc_srf_lic_pack_prod', type: 'date', alias: 'licencePackProduced', display: 'normal', mandatory: false },
            LICENCE_PACK_REVIEWER: { name: 'custrecord_twc_srf_lic_pack_rev', type: 'select', alias: 'licencePackReviewer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            LICENCE_PACK_REVIEWED: { name: 'custrecord_twc_srf_lic_pack_revd', type: 'text', alias: 'licencePackReviewed', display: 'normal', mandatory: false },
            LICENCE_PACK_ISSUED: { name: 'custrecord_twc_srf_lic_pack_issued', type: 'date', alias: 'licencePackIssued', display: 'normal', mandatory: false },
            LICENCE_PACK_SIGNED: { name: 'custrecord_twc_srf_lic_pack_signed', type: 'date', alias: 'licencePackSigned', display: 'normal', mandatory: false },
            LICENCE_PACK_SIGNED_BY: { name: 'custrecord_twc_srf_lic_pack_sign_by', type: 'select', alias: 'licencePackSignedBy', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            LICENCE_PACK_EXECUTED: { name: 'custrecord_twc_srf_lic_pack_exec', type: 'date', alias: 'licencePackExecuted', display: 'normal', mandatory: false },
            LICENCE_PACK_EXECUTED_BY: { name: 'custrecord_twc_srf_lic_pack_exec_by', type: 'select', alias: 'licencePackExecutedBy', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
        }

        class OSSMTWC_SRF extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get photoAssessmentCategory() {
                return this.get(_recordFields.PHOTO_ASSESSMENT_CATEGORY);
            } set photoAssessmentCategory(value) {
                this.set(_recordFields.PHOTO_ASSESSMENT_CATEGORY, value)
            }
            get photoAssessmentCategoryName() { return this.getText(_recordFields.PHOTO_ASSESSMENT_CATEGORY); }
            
            get sRFType() {
                return this.get(_recordFields.SRF_TYPE);
            } set sRFType(value) {
                this.set(_recordFields.SRF_TYPE, value)
            }
            get sRFTypeName() { return this.getText(_recordFields.SRF_TYPE); }
            
            get operatorSiteID() {
                return this.get(_recordFields.OPERATOR_SITE_ID);
            } set operatorSiteID(value) {
                this.set(_recordFields.OPERATOR_SITE_ID, value)
            }
            
            get completionPhotosRequested() {
                return this.get(_recordFields.COMPLETION_PHOTOS_REQUESTED);
            } set completionPhotosRequested(value) {
                this.set(_recordFields.COMPLETION_PHOTOS_REQUESTED, value)
            }
            
            get completionPhotosReceived() {
                return this.get(_recordFields.COMPLETION_PHOTOS_RECEIVED);
            } set completionPhotosReceived(value) {
                this.set(_recordFields.COMPLETION_PHOTOS_RECEIVED, value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get completionPhotosReviewed() {
                return this.get(_recordFields.COMPLETION_PHOTOS_REVIEWED);
            } set completionPhotosReviewed(value) {
                this.set(_recordFields.COMPLETION_PHOTOS_REVIEWED, value)
            }
            
            get customer() {
                return this.get(_recordFields.CUSTOMER);
            } set customer(value) {
                this.set(_recordFields.CUSTOMER, value)
            }
            get customerName() { return this.getText(_recordFields.CUSTOMER); }
            
            get sRFSubmittedBy() {
                return this.get(_recordFields.SRF_SUBMITTED_BY);
            } set sRFSubmittedBy(value) {
                this.set(_recordFields.SRF_SUBMITTED_BY, value)
            }
            get sRFSubmittedByName() { return this.getText(_recordFields.SRF_SUBMITTED_BY); }
            
            get sRFID() {
                return this.get(_recordFields.SRF_ID);
            } set sRFID(value) {
                this.set(_recordFields.SRF_ID, value)
            }
            
            get relatedEquipmentActions() {
                return this.get(_recordFields.RELATED_EQUIPMENT_ACTIONS);
            } set relatedEquipmentActions(value) {
                this.set(_recordFields.RELATED_EQUIPMENT_ACTIONS, value)
            }
            get relatedEquipmentActionsName() { return this.getText(_recordFields.RELATED_EQUIPMENT_ACTIONS); }
            
            get applicationDate() {
                return this.get(_recordFields.APPLICATION_DATE);
            } set applicationDate(value) {
                this.set(_recordFields.APPLICATION_DATE, value)
            }
            
            get sRFDrawings() {
                return this.get(_recordFields.SRF_DRAWINGS);
            } set sRFDrawings(value) {
                this.set(_recordFields.SRF_DRAWINGS, value)
            }
            
            get powerSupplyRequestedfromTL() {
                return this.get(_recordFields.POWER_SUPPLY_REQUESTED_FROM_TL);
            } set powerSupplyRequestedfromTL(value) {
                this.set(_recordFields.POWER_SUPPLY_REQUESTED_FROM_TL, value)
            }
            
            get applicationReference() {
                return this.get(_recordFields.APPLICATION_REFERENCE);
            } set applicationReference(value) {
                this.set(_recordFields.APPLICATION_REFERENCE, value)
            }
            
            get alternatePowerSupplier() {
                return this.get(_recordFields.ALTERNATE_POWER_SUPPLIER);
            } set alternatePowerSupplier(value) {
                this.set(_recordFields.ALTERNATE_POWER_SUPPLIER, value)
            }
            
            get applicationforownsupplymadetoESB() {
                return this.get(_recordFields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB);
            } set applicationforownsupplymadetoESB(value) {
                this.set(_recordFields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB, value)
            }
            
            get powerNotes() {
                return this.get(_recordFields.POWER_NOTES);
            } set powerNotes(value) {
                this.set(_recordFields.POWER_NOTES, value)
            }
            
            get sRFStatus() {
                return this.get(_recordFields.SRF_STATUS);
            } set sRFStatus(value) {
                this.set(_recordFields.SRF_STATUS, value)
            }
            get sRFStatusName() { return this.getText(_recordFields.SRF_STATUS); }
            
            get sRFRequestedDate() {
                return this.get(_recordFields.SRF_REQUESTED_DATE);
            } set sRFRequestedDate(value) {
                this.set(_recordFields.SRF_REQUESTED_DATE, value)
            }
            
            get initialReviewComments() {
                return this.get(_recordFields.INITIAL_REVIEW_COMMENTS);
            } set initialReviewComments(value) {
                this.set(_recordFields.INITIAL_REVIEW_COMMENTS, value)
            }
            
            get customerPlannedInstallDate() {
                return this.get(_recordFields.CUSTOMER_PLANNED_INSTALL_DATE);
            } set customerPlannedInstallDate(value) {
                this.set(_recordFields.CUSTOMER_PLANNED_INSTALL_DATE, value)
            }
            
            get tLDrawingRequested() {
                return this.get(_recordFields.TL_DRAWING_REQUESTED);
            } set tLDrawingRequested(value) {
                this.set(_recordFields.TL_DRAWING_REQUESTED, value)
            }
            
            get feedbackLoopIterations() {
                return this.get(_recordFields.FEEDBACK_LOOP_ITERATIONS);
            } set feedbackLoopIterations(value) {
                this.set(_recordFields.FEEDBACK_LOOP_ITERATIONS, value)
            }
            
            get sRFReviews() {
                return this.get(_recordFields.SRF_REVIEWS);
            } set sRFReviews(value) {
                this.set(_recordFields.SRF_REVIEWS, value)
            }
            get sRFReviewsName() { return this.getText(_recordFields.SRF_REVIEWS); }
            
            get sRFApprovalDate() {
                return this.get(_recordFields.SRF_APPROVAL_DATE);
            } set sRFApprovalDate(value) {
                this.set(_recordFields.SRF_APPROVAL_DATE, value)
            }
            
            get worksPermittedDate() {
                return this.get(_recordFields.WORKS_PERMITTED_DATE);
            } set worksPermittedDate(value) {
                this.set(_recordFields.WORKS_PERMITTED_DATE, value)
            }
            
            get tobeBilled() {
                return this.get(_recordFields.TO_BE_BILLED);
            } set tobeBilled(value) {
                this.set(_recordFields.TO_BE_BILLED, value)
            }
            
            get billFrom() {
                return this.get(_recordFields.BILL_FROM);
            } set billFrom(value) {
                this.set(_recordFields.BILL_FROM, value)
            }
            
            get holdAction() {
                return this.get(_recordFields.HOLD_ACTION);
            } set holdAction(value) {
                this.set(_recordFields.HOLD_ACTION, value)
            }
            
            get sRFConditions() {
                return this.get(_recordFields.SRF_CONDITIONS);
            } set sRFConditions(value) {
                this.set(_recordFields.SRF_CONDITIONS, value)
            }
            
            get tLDrawingDrafted() {
                return this.get(_recordFields.TL_DRAWING_DRAFTED);
            } set tLDrawingDrafted(value) {
                this.set(_recordFields.TL_DRAWING_DRAFTED, value)
            }
            
            get tLDrawingReviewed() {
                return this.get(_recordFields.TL_DRAWING_REVIEWED);
            } set tLDrawingReviewed(value) {
                this.set(_recordFields.TL_DRAWING_REVIEWED, value)
            }
            
            get tLDrawingUploaded() {
                return this.get(_recordFields.TL_DRAWING_UPLOADED);
            } set tLDrawingUploaded(value) {
                this.set(_recordFields.TL_DRAWING_UPLOADED, value)
            }
            
            get tLDrawing() {
                return this.get(_recordFields.TL_DRAWING);
            } set tLDrawing(value) {
                this.set(_recordFields.TL_DRAWING, value)
            }
            
            get licenceMechanism() {
                return this.get(_recordFields.LICENCE_MECHANISM);
            } set licenceMechanism(value) {
                this.set(_recordFields.LICENCE_MECHANISM, value)
            }
            get licenceMechanismName() { return this.getText(_recordFields.LICENCE_MECHANISM); }
            
            get licenceRequested() {
                return this.get(_recordFields.LICENCE_REQUESTED);
            } set licenceRequested(value) {
                this.set(_recordFields.LICENCE_REQUESTED, value)
            }
            
            get licencePackProduced() {
                return this.get(_recordFields.LICENCE_PACK_PRODUCED);
            } set licencePackProduced(value) {
                this.set(_recordFields.LICENCE_PACK_PRODUCED, value)
            }
            
            get licencePackReviewer() {
                return this.get(_recordFields.LICENCE_PACK_REVIEWER);
            } set licencePackReviewer(value) {
                this.set(_recordFields.LICENCE_PACK_REVIEWER, value)
            }
            get licencePackReviewerName() { return this.getText(_recordFields.LICENCE_PACK_REVIEWER); }
            
            get licencePackReviewed() {
                return this.get(_recordFields.LICENCE_PACK_REVIEWED);
            } set licencePackReviewed(value) {
                this.set(_recordFields.LICENCE_PACK_REVIEWED, value)
            }
            
            get licencePackIssued() {
                return this.get(_recordFields.LICENCE_PACK_ISSUED);
            } set licencePackIssued(value) {
                this.set(_recordFields.LICENCE_PACK_ISSUED, value)
            }
            
            get licencePackSigned() {
                return this.get(_recordFields.LICENCE_PACK_SIGNED);
            } set licencePackSigned(value) {
                this.set(_recordFields.LICENCE_PACK_SIGNED, value)
            }
            
            get licencePackSignedBy() {
                return this.get(_recordFields.LICENCE_PACK_SIGNED_BY);
            } set licencePackSignedBy(value) {
                this.set(_recordFields.LICENCE_PACK_SIGNED_BY, value)
            }
            get licencePackSignedByName() { return this.getText(_recordFields.LICENCE_PACK_SIGNED_BY); }
            
            get licencePackExecuted() {
                return this.get(_recordFields.LICENCE_PACK_EXECUTED);
            } set licencePackExecuted(value) {
                this.set(_recordFields.LICENCE_PACK_EXECUTED, value)
            }
            
            get licencePackExecutedBy() {
                return this.get(_recordFields.LICENCE_PACK_EXECUTED_BY);
            } set licencePackExecutedBy(value) {
                this.set(_recordFields.LICENCE_PACK_EXECUTED_BY, value)
            }
            get licencePackExecutedByName() { return this.getText(_recordFields.LICENCE_PACK_EXECUTED_BY); }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            PersistentRecord: OSSMTWC_SRF,

            get: function (id) {
                var rec = new OSSMTWC_SRF(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SRF();
                return rec.select(options);
            }

        }
    });
