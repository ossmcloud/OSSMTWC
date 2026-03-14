/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_saf';
        var _recordFields = {
            NAME: 'name',
            STATUS: 'custrecord_twc_saf_status',
            STATUS_COMMENTS: 'custrecord_twc_saf_status_comments',
            SAF_ID: 'custrecord_twc_saf_id',
            START_TIME_BLOCK: 'custrecord_twc_saf_start_time_block',
            END_TIME_BLOCK: 'custrecord_twc_saf_end_time_block',
            SITE: 'custrecord_twc_saf_site',
            WORKS_END_DATE: 'custrecord_twc_saf_word_end_date',
            R_TYPE: 'custrecord_twc_saf_type',
            PHOTO_ASSESSMENT_CATEGORY: 'custrecord_twc_saf_photo_assess_category',
            MAST_ACCESS: 'custrecord_twc_saf_mast_access',
            TL_BUILDING_ACCESS: 'custrecord_twc_saf_tl_building_access',
            CRANE__CHERRYPICKER: 'custrecord_twc_saf_crane_cherrypicker',
            ROOFTOP_ACCESS: 'custrecord_twc_saf_rooftop_access',
            ELECTRICAL_WORKS: 'custrecord_twc_saf_electrical_works',
            CONDITIONS_OF_ACCESS: 'custrecord_twc_saf_conditions_access',
            CUSTOMER: 'custrecord_twc_saf_customer',
            PRIMARY_CONTRACTOR: 'custrecord_twc_saf_primary_contractor',
            SUMMARY_OF_WORKS: 'custrecord_twc_saf_summary_works',
            PLANNED_EQUIPMENT_WORK: 'custrecord_twc_saf_planned_equip_work',
            PICW: 'custrecord_twc_saf_picw',
            SAF_AUTHOR: 'custrecord_twc_saf_author',
            WORKS_PHOTOS_REQ_DELAY: 'custrecord_twc_saf_wrk_photo_req_delay',
            COMPLETION_PHOTOS_REQUESTED: 'custrecord_twc_saf_comp_photo_req',
            COMPLETION_PHOTOS_RECEIVED: 'custrecord_twc_saf_comp_photo_rec',
            COMPLETION_REVIEWER: 'custrecord_twc_saf_comp_reviewer',
            REVIEW_COMMENT: 'custrecord_twc_saf_rev_cmt',
            ACCOMMODATION: 'custrecord_twc_saf_accommodation',
            STRUCTURE: 'custrecord_twc_saf_strcture',
            SAF_COMPLETION_PHOTOS_DELETE: 'custrecord_twc_saf_comp_photo',
            HEALTH__AND__SAFETY_DELETE: 'custrecord_twc_saf_health_safety',
            METHOD_STATEMENT_DELETE: 'custrecord_twc_saf_method_statement',
            CREW__VISITORS_DELETE: 'custrecord_twc_saf_crew_visitors',
            ASSOCIATED_SRFS_DELETE: 'custrecord_twc_saf_associated_srfs',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            STATUS: { name: 'custrecord_twc_saf_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf_status' },
            STATUS_COMMENTS: { name: 'custrecord_twc_saf_status_comments', type: 'clobtext', alias: 'statusComments', display: 'normal', mandatory: false },
            SAF_ID: { name: 'custrecord_twc_saf_id', type: 'text', alias: 'sAFID', display: 'normal', mandatory: false },
            START_TIME_BLOCK: { name: 'custrecord_twc_saf_start_time_block', type: 'datetimetz', alias: 'startTimeBlock', display: 'normal', mandatory: false },
            END_TIME_BLOCK: { name: 'custrecord_twc_saf_end_time_block', type: 'datetimetz', alias: 'endTimeBlock', display: 'normal', mandatory: false },
            SITE: { name: 'custrecord_twc_saf_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            WORKS_END_DATE: { name: 'custrecord_twc_saf_word_end_date', type: 'date', alias: 'worksEndDate', display: 'normal', mandatory: false },
            R_TYPE: { name: 'custrecord_twc_saf_type', type: 'select', alias: 'r_type', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf_type' },
            PHOTO_ASSESSMENT_CATEGORY: { name: 'custrecord_twc_saf_photo_assess_category', type: 'select', alias: 'photoAssessmentCategory', display: 'normal', mandatory: false, recordType: 'customrecord_twc_photo_assessment_cat' },
            MAST_ACCESS: { name: 'custrecord_twc_saf_mast_access', type: 'checkbox', alias: 'mastAccess', display: 'normal', mandatory: false },
            TL_BUILDING_ACCESS: { name: 'custrecord_twc_saf_tl_building_access', type: 'checkbox', alias: 'tLBuildingAccess', display: 'normal', mandatory: false },
            CRANE__CHERRYPICKER: { name: 'custrecord_twc_saf_crane_cherrypicker', type: 'checkbox', alias: 'craneCherrypicker', display: 'normal', mandatory: false },
            ROOFTOP_ACCESS: { name: 'custrecord_twc_saf_rooftop_access', type: 'checkbox', alias: 'rooftopAccess', display: 'normal', mandatory: false },
            ELECTRICAL_WORKS: { name: 'custrecord_twc_saf_electrical_works', type: 'checkbox', alias: 'electricalWorks', display: 'normal', mandatory: false },
            CONDITIONS_OF_ACCESS: { name: 'custrecord_twc_saf_conditions_access', type: 'clobtext', alias: 'conditionsofAccess', display: 'normal', mandatory: false },
            CUSTOMER: { name: 'custrecord_twc_saf_customer', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            PRIMARY_CONTRACTOR: { name: 'custrecord_twc_saf_primary_contractor', type: 'select', alias: 'primaryContractor', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            SUMMARY_OF_WORKS: { name: 'custrecord_twc_saf_summary_works', type: 'textarea', alias: 'summaryofWorks', display: 'normal', mandatory: false },
            PLANNED_EQUIPMENT_WORK: { name: 'custrecord_twc_saf_planned_equip_work', type: 'select', alias: 'plannedEquipmentWork', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_action' },
            PICW: { name: 'custrecord_twc_saf_picw', type: 'select', alias: 'pICW', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            SAF_AUTHOR: { name: 'custrecord_twc_saf_author', type: 'select', alias: 'sAFAuthor', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            WORKS_PHOTOS_REQ_DELAY: { name: 'custrecord_twc_saf_wrk_photo_req_delay', type: 'integer', alias: 'worksPhotosReqDelay', display: 'normal', mandatory: false },
            COMPLETION_PHOTOS_REQUESTED: { name: 'custrecord_twc_saf_comp_photo_req', type: 'date', alias: 'completionPhotosRequested', display: 'normal', mandatory: false },
            COMPLETION_PHOTOS_RECEIVED: { name: 'custrecord_twc_saf_comp_photo_rec', type: 'date', alias: 'completionPhotosReceived', display: 'normal', mandatory: false },
            COMPLETION_REVIEWER: { name: 'custrecord_twc_saf_comp_reviewer', type: 'select', alias: 'completionReviewer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            REVIEW_COMMENT: { name: 'custrecord_twc_saf_rev_cmt', type: 'clobtext', alias: 'reviewComment', display: 'normal', mandatory: false },
            ACCOMMODATION: { name: 'custrecord_twc_saf_accommodation', type: 'select', alias: 'accommodation', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra' },
            STRUCTURE: { name: 'custrecord_twc_saf_strcture', type: 'select', alias: 'structure', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra' },
            SAF_COMPLETION_PHOTOS_DELETE: { name: 'custrecord_twc_saf_comp_photo', type: 'document', alias: 'sAFCompletionPhotosDELETE', display: 'normal', mandatory: false },
            HEALTH__AND__SAFETY_DELETE: { name: 'custrecord_twc_saf_health_safety', type: 'document', alias: 'health_and_SafetyDELETE', display: 'normal', mandatory: false },
            METHOD_STATEMENT_DELETE: { name: 'custrecord_twc_saf_method_statement', type: 'document', alias: 'methodStatementDELETE', display: 'normal', mandatory: false },
            CREW__VISITORS_DELETE: { name: 'custrecord_twc_saf_crew_visitors', type: 'select', alias: 'crewVisitorsDELETE', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            ASSOCIATED_SRFS_DELETE: { name: 'custrecord_twc_saf_associated_srfs', type: 'select', alias: 'associatedSRFsDELETE', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SAF extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get status() {
                return this.get(_recordFields.STATUS);
            } set status(value) {
                this.set(_recordFields.STATUS, value)
            }
            get statusName() { return this.getText(_recordFields.STATUS); }
            
            get statusComments() {
                return this.get(_recordFields.STATUS_COMMENTS);
            } set statusComments(value) {
                this.set(_recordFields.STATUS_COMMENTS, value)
            }
            
            get sAFID() {
                return this.get(_recordFields.SAF_ID);
            } set sAFID(value) {
                this.set(_recordFields.SAF_ID, value)
            }
            
            get startTimeBlock() {
                return this.get(_recordFields.START_TIME_BLOCK);
            } set startTimeBlock(value) {
                this.set(_recordFields.START_TIME_BLOCK, value)
            }
            
            get endTimeBlock() {
                return this.get(_recordFields.END_TIME_BLOCK);
            } set endTimeBlock(value) {
                this.set(_recordFields.END_TIME_BLOCK, value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get worksEndDate() {
                return this.get(_recordFields.WORKS_END_DATE);
            } set worksEndDate(value) {
                this.set(_recordFields.WORKS_END_DATE, value)
            }
            
            get r_type() {
                return this.get(_recordFields.R_TYPE);
            } set r_type(value) {
                this.set(_recordFields.R_TYPE, value)
            }
            get r_typeName() { return this.getText(_recordFields.R_TYPE); }
            
            get photoAssessmentCategory() {
                return this.get(_recordFields.PHOTO_ASSESSMENT_CATEGORY);
            } set photoAssessmentCategory(value) {
                this.set(_recordFields.PHOTO_ASSESSMENT_CATEGORY, value)
            }
            get photoAssessmentCategoryName() { return this.getText(_recordFields.PHOTO_ASSESSMENT_CATEGORY); }
            
            get mastAccess() {
                return this.get(_recordFields.MAST_ACCESS);
            } set mastAccess(value) {
                this.set(_recordFields.MAST_ACCESS, value)
            }
            
            get tLBuildingAccess() {
                return this.get(_recordFields.TL_BUILDING_ACCESS);
            } set tLBuildingAccess(value) {
                this.set(_recordFields.TL_BUILDING_ACCESS, value)
            }
            
            get craneCherrypicker() {
                return this.get(_recordFields.CRANE__CHERRYPICKER);
            } set craneCherrypicker(value) {
                this.set(_recordFields.CRANE__CHERRYPICKER, value)
            }
            
            get rooftopAccess() {
                return this.get(_recordFields.ROOFTOP_ACCESS);
            } set rooftopAccess(value) {
                this.set(_recordFields.ROOFTOP_ACCESS, value)
            }
            
            get electricalWorks() {
                return this.get(_recordFields.ELECTRICAL_WORKS);
            } set electricalWorks(value) {
                this.set(_recordFields.ELECTRICAL_WORKS, value)
            }
            
            get conditionsofAccess() {
                return this.get(_recordFields.CONDITIONS_OF_ACCESS);
            } set conditionsofAccess(value) {
                this.set(_recordFields.CONDITIONS_OF_ACCESS, value)
            }
            
            get customer() {
                return this.get(_recordFields.CUSTOMER);
            } set customer(value) {
                this.set(_recordFields.CUSTOMER, value)
            }
            get customerName() { return this.getText(_recordFields.CUSTOMER); }
            
            get primaryContractor() {
                return this.get(_recordFields.PRIMARY_CONTRACTOR);
            } set primaryContractor(value) {
                this.set(_recordFields.PRIMARY_CONTRACTOR, value)
            }
            get primaryContractorName() { return this.getText(_recordFields.PRIMARY_CONTRACTOR); }
            
            get summaryofWorks() {
                return this.get(_recordFields.SUMMARY_OF_WORKS);
            } set summaryofWorks(value) {
                this.set(_recordFields.SUMMARY_OF_WORKS, value)
            }
            
            get plannedEquipmentWork() {
                return this.get(_recordFields.PLANNED_EQUIPMENT_WORK);
            } set plannedEquipmentWork(value) {
                this.set(_recordFields.PLANNED_EQUIPMENT_WORK, value)
            }
            get plannedEquipmentWorkName() { return this.getText(_recordFields.PLANNED_EQUIPMENT_WORK); }
            
            get pICW() {
                return this.get(_recordFields.PICW);
            } set pICW(value) {
                this.set(_recordFields.PICW, value)
            }
            get pICWName() { return this.getText(_recordFields.PICW); }
            
            get sAFAuthor() {
                return this.get(_recordFields.SAF_AUTHOR);
            } set sAFAuthor(value) {
                this.set(_recordFields.SAF_AUTHOR, value)
            }
            get sAFAuthorName() { return this.getText(_recordFields.SAF_AUTHOR); }
            
            get worksPhotosReqDelay() {
                return this.get(_recordFields.WORKS_PHOTOS_REQ_DELAY);
            } set worksPhotosReqDelay(value) {
                this.set(_recordFields.WORKS_PHOTOS_REQ_DELAY, value)
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
            
            get completionReviewer() {
                return this.get(_recordFields.COMPLETION_REVIEWER);
            } set completionReviewer(value) {
                this.set(_recordFields.COMPLETION_REVIEWER, value)
            }
            get completionReviewerName() { return this.getText(_recordFields.COMPLETION_REVIEWER); }
            
            get reviewComment() {
                return this.get(_recordFields.REVIEW_COMMENT);
            } set reviewComment(value) {
                this.set(_recordFields.REVIEW_COMMENT, value)
            }
            
            get accommodation() {
                return this.get(_recordFields.ACCOMMODATION);
            } set accommodation(value) {
                this.set(_recordFields.ACCOMMODATION, value)
            }
            get accommodationName() { return this.getText(_recordFields.ACCOMMODATION); }
            
            get structure() {
                return this.get(_recordFields.STRUCTURE);
            } set structure(value) {
                this.set(_recordFields.STRUCTURE, value)
            }
            get structureName() { return this.getText(_recordFields.STRUCTURE); }
            
            get sAFCompletionPhotosDELETE() {
                return this.get(_recordFields.SAF_COMPLETION_PHOTOS_DELETE);
            } set sAFCompletionPhotosDELETE(value) {
                this.set(_recordFields.SAF_COMPLETION_PHOTOS_DELETE, value)
            }
            
            get health_and_SafetyDELETE() {
                return this.get(_recordFields.HEALTH__AND__SAFETY_DELETE);
            } set health_and_SafetyDELETE(value) {
                this.set(_recordFields.HEALTH__AND__SAFETY_DELETE, value)
            }
            
            get methodStatementDELETE() {
                return this.get(_recordFields.METHOD_STATEMENT_DELETE);
            } set methodStatementDELETE(value) {
                this.set(_recordFields.METHOD_STATEMENT_DELETE, value)
            }
            
            get crewVisitorsDELETE() {
                return this.get(_recordFields.CREW__VISITORS_DELETE);
            } set crewVisitorsDELETE(value) {
                this.set(_recordFields.CREW__VISITORS_DELETE, value)
            }
            get crewVisitorsDELETEName() { return this.getText(_recordFields.CREW__VISITORS_DELETE); }
            
            get associatedSRFsDELETE() {
                return this.get(_recordFields.ASSOCIATED_SRFS_DELETE);
            } set associatedSRFsDELETE(value) {
                this.set(_recordFields.ASSOCIATED_SRFS_DELETE, value)
            }
            get associatedSRFsDELETEName() { return this.getText(_recordFields.ASSOCIATED_SRFS_DELETE); }
            
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
            PersistentRecord: OSSMTWC_SAF,

            get: function (id) {
                var rec = new OSSMTWC_SAF(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SAF();
                return rec.select(options);
            }

        }
    });
