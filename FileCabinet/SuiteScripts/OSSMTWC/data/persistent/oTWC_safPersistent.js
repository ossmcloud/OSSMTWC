/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_saf';
        var _recordFields = {
            STATUS: 'custrecord_twc_saf_status',
            STATUS_COMMENTS: 'custrecord_twc_saf_status_comments',
            SAF_ID: 'custrecord_twc_saf_id',
            START_TIME_BLOCK: 'custrecord_twc_saf_start_time_block',
            END_TIME_BLOCK: 'custrecord_twc_saf_end_time_block',
            SITE: 'custrecord_twc_saf_site',
            WORKS_END_DATE: 'custrecord_twc_saf_word_end_date',
            TYPE: 'custrecord_twc_saf_type',
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
            ASSOCIATED_SRFS: 'custrecord_twc_saf_associated_srfs',
            PLANNED_EQUIPMENT_WORK: 'custrecord_twc_saf_planned_equip_work',
            PICW: 'custrecord_twc_saf_picw',
            CREW__VISITORS: 'custrecord_twc_saf_crew_visitors',
            HEALTH__AND__SAFETY: 'custrecord_twc_saf_health_safety',
            METHOD_STATEMENT: 'custrecord_twc_saf_method_statement',
            SAF_AUTHOR: 'custrecord_twc_saf_author',
            WORKS_PHOTOS_REQ_DELAY: 'custrecord_twc_saf_wrk_photo_req_delay',
            COMPLETION_PHOTOS_REQUESTED: 'custrecord_twc_saf_comp_photo_req',
            COMPLETION_PHOTOS_RECEIVED: 'custrecord_twc_saf_comp_photo_rec',
            COMPLETION_REVIEWER: 'custrecord_twc_saf_comp_reviewer',
            REVIEW_COMMENT: 'custrecord_twc_saf_rev_cmt',
            SAF_COMPLETION_PHOTOS: 'custrecord_twc_saf_comp_photo',
        }
        var _recordFieldInfo = {
            STATUS: { name: 'custrecord_twc_saf_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf_status,' },
            STATUS_COMMENTS: { name: 'custrecord_twc_saf_status_comments', type: 'text', alias: 'statusComments', display: 'normal', mandatory: false },
            SAF_ID: { name: 'custrecord_twc_saf_id', type: 'text', alias: 'sAFID', display: 'normal', mandatory: false },
            START_TIME_BLOCK: { name: 'custrecord_twc_saf_start_time_block', type: 'datetimetz', alias: 'startTimeBlock', display: 'normal', mandatory: false },
            END_TIME_BLOCK: { name: 'custrecord_twc_saf_end_time_block', type: 'datetimetz', alias: 'endTimeBlock', display: 'normal', mandatory: false },
            SITE: { name: 'custrecord_twc_saf_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            WORKS_END_DATE: { name: 'custrecord_twc_saf_word_end_date', type: 'date', alias: 'worksEndDate', display: 'normal', mandatory: false },
            //@@REVIEW TYPE was recursively called and was getting error maximum call stack reached, so changed alias to safType

            TYPE: { name: 'custrecord_twc_saf_type', type: 'select', alias: 'type', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf_type,' },
           // TYPE: { name: 'custrecord_twc_saf_type', type: 'select', alias: 'safType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf_type,' },

           PHOTO_ASSESSMENT_CATEGORY: { name: 'custrecord_twc_saf_photo_assess_category', type: 'select', alias: 'photoAssessmentCategory', display: 'normal', mandatory: false, recordType: 'customrecord_twc_photo_assessment_cat,' },
            MAST_ACCESS: { name: 'custrecord_twc_saf_mast_access', type: 'checkbox', alias: 'mastAccess', display: 'normal', mandatory: false },
            TL_BUILDING_ACCESS: { name: 'custrecord_twc_saf_tl_building_access', type: 'checkbox', alias: 'tLBuildingAccess', display: 'normal', mandatory: false },
            CRANE__CHERRYPICKER: { name: 'custrecord_twc_saf_crane_cherrypicker', type: 'checkbox', alias: 'craneCherrypicker', display: 'normal', mandatory: false },
            ROOFTOP_ACCESS: { name: 'custrecord_twc_saf_rooftop_access', type: 'checkbox', alias: 'rooftopAccess', display: 'normal', mandatory: false },
            ELECTRICAL_WORKS: { name: 'custrecord_twc_saf_electrical_works', type: 'checkbox', alias: 'electricalWorks', display: 'normal', mandatory: false },
            CONDITIONS_OF_ACCESS: { name: 'custrecord_twc_saf_conditions_access', type: 'text', alias: 'conditionsofAccess', display: 'normal', mandatory: false },
            CUSTOMER: { name: 'custrecord_twc_saf_customer', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: '-2' },
            PRIMARY_CONTRACTOR: { name: 'custrecord_twc_saf_primary_contractor', type: 'select', alias: 'primaryContractor', display: 'normal', mandatory: false, recordType: '-2' },
            SUMMARY_OF_WORKS: { name: 'custrecord_twc_saf_summary_works', type: 'textarea', alias: 'summaryofWorks', display: 'normal', mandatory: false },
            ASSOCIATED_SRFS: { name: 'custrecord_twc_saf_associated_srfs', type: 'select', alias: 'associatedSRFs', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf,' },
            PLANNED_EQUIPMENT_WORK: { name: 'custrecord_twc_saf_planned_equip_work', type: 'select', alias: 'plannedEquipmentWork', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_action,' },
            PICW: { name: 'custrecord_twc_saf_picw', type: 'select', alias: 'pICW', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            CREW__VISITORS: { name: 'custrecord_twc_saf_crew_visitors', type: 'select', alias: 'crewVisitors', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            HEALTH__AND__SAFETY: { name: 'custrecord_twc_saf_health_safety', type: 'document', alias: 'health_and_Safety', display: 'normal', mandatory: false },
            METHOD_STATEMENT: { name: 'custrecord_twc_saf_method_statement', type: 'document', alias: 'methodStatement', display: 'normal', mandatory: false },
            SAF_AUTHOR: { name: 'custrecord_twc_saf_author', type: 'select', alias: 'sAFAuthor', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            WORKS_PHOTOS_REQ_DELAY: { name: 'custrecord_twc_saf_wrk_photo_req_delay', type: 'integer', alias: 'worksPhotosReqDelay', display: 'normal', mandatory: false },
            COMPLETION_PHOTOS_REQUESTED: { name: 'custrecord_twc_saf_comp_photo_req', type: 'date', alias: 'completionPhotosRequested', display: 'normal', mandatory: false },
            COMPLETION_PHOTOS_RECEIVED: { name: 'custrecord_twc_saf_comp_photo_rec', type: 'date', alias: 'completionPhotosReceived', display: 'normal', mandatory: false },
            COMPLETION_REVIEWER: { name: 'custrecord_twc_saf_comp_reviewer', type: 'select', alias: 'completionReviewer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            REVIEW_COMMENT: { name: 'custrecord_twc_saf_rev_cmt', type: 'text', alias: 'reviewComment', display: 'normal', mandatory: false },
            SAF_COMPLETION_PHOTOS: { name: 'custrecord_twc_saf_comp_photo', type: 'document', alias: 'sAFCompletionPhotos', display: 'normal', mandatory: false },
        }

        class OSSMTWC_SAF extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
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
            
            //@@REVIEW type() was recursively called and was getting error maximum call stack reached, so changed type() to saftype()
            // get type() {
            //     return this.get(_recordFields.TYPE);
            // } set type(value) {
            //     this.set(_recordFields.TYPE, value)
            // }
            // get typeName() { return this.getText(_recordFields.TYPE); }
            
            get safType() {
                return this.get(_recordFields.TYPE);
            } set safType(value) {
                this.set(_recordFields.TYPE, value)
            }
            get safTypeName() { return this.getText(_recordFields.TYPE); }
            

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
            
            get associatedSRFs() {
                return this.get(_recordFields.ASSOCIATED_SRFS);
            } set associatedSRFs(value) {
                this.set(_recordFields.ASSOCIATED_SRFS, value)
            }
            get associatedSRFsName() { return this.getText(_recordFields.ASSOCIATED_SRFS); }
            
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
            
            get crewVisitors() {
                return this.get(_recordFields.CREW__VISITORS);
            } set crewVisitors(value) {
                this.set(_recordFields.CREW__VISITORS, value)
            }
            get crewVisitorsName() { return this.getText(_recordFields.CREW__VISITORS); }
            
            get health_and_Safety() {
                return this.get(_recordFields.HEALTH__AND__SAFETY);
            } set health_and_Safety(value) {
                this.set(_recordFields.HEALTH__AND__SAFETY, value)
            }
            
            get methodStatement() {
                return this.get(_recordFields.METHOD_STATEMENT);
            } set methodStatement(value) {
                this.set(_recordFields.METHOD_STATEMENT, value)
            }
            
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
            
            get sAFCompletionPhotos() {
                return this.get(_recordFields.SAF_COMPLETION_PHOTOS);
            } set sAFCompletionPhotos(value) {
                this.set(_recordFields.SAF_COMPLETION_PHOTOS, value)
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
