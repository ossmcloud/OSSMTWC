/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_trbl_tkt';
        var _recordFields = {
            TROUBLE_TICKET_ID: 'custrecord_twc_trbl_tkt_id',
            SITE: 'custrecord_twc_trbl_tkt_site',
            STATUS: 'custrecord_twc_trbl_tkt_status',
            SUBMITTED: 'custrecord_twc_trbl_tkt_submitted',
            AUTHOR: 'custrecord_twc_trbl_tkt_author',
            AUTHOR_PHONE_NUMBER: 'custrecord_twc_trbl_tkt_author_ph_no',
            REPORT_ISSUE__WORKS_REQUIRED: 'custrecord_twc_trbl_tkt_issue_works',
            PHOTOS_TAKEN: 'custrecord_twc_trbl_tkt_photos_tkn',
            ASSESSED_BY: 'custrecord_twc_trbl_tkt_assessed_by',
            ASSESSED: 'custrecord_twc_trbl_tkt_assessed',
            CATEGORY: 'custrecord_twc_trbl_tkt_category',
            CUSTOMER: 'custrecord_twc_trbl_tkt_customer',
            ASSIGNED_TO: 'custrecord_twc_trbl_tkt_assigned_to',
            ASSIGNED_TO_COMPANY: 'custrecord_twc_trbl_tkt_assigned_to_comp',
            PRIORITY: 'custrecord_twc_trbl_tkt_priority',
            WORKS_REQUIRED: 'custrecord_twc_trbl_tkt_works_req',
            CORRECTIVE_ACTION: 'custrecord_twc_trbl_tkt_corrective_act',
            SCHEDULED_COMPLETION_DATE: 'custrecord_twc_trbl_tkt_sch_compltn_date',
            CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE: 'custrecord_twc_trbl_tkt_cor_act_tkn_root',
            RESOLUTION_PHOTOS_TAKEN: 'custrecord_twc_trbl_tkt_resltn_photo_tkn',
        }
        var _recordFieldInfo = {
            TROUBLE_TICKET_ID: { name: 'custrecord_twc_trbl_tkt_id', type: 'integer', alias: 'troubleTicketID', display: 'normal', mandatory: false },
            SITE: { name: 'custrecord_twc_trbl_tkt_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            STATUS: { name: 'custrecord_twc_trbl_tkt_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_trbl_tkt_status,' },
            SUBMITTED: { name: 'custrecord_twc_trbl_tkt_submitted', type: 'datetimetz', alias: 'submitted', display: 'normal', mandatory: false },
            AUTHOR: { name: 'custrecord_twc_trbl_tkt_author', type: 'text', alias: 'author', display: 'normal', mandatory: false },
            AUTHOR_PHONE_NUMBER: { name: 'custrecord_twc_trbl_tkt_author_ph_no', type: 'text', alias: 'authorPhoneNumber', display: 'normal', mandatory: false },
            REPORT_ISSUE__WORKS_REQUIRED: { name: 'custrecord_twc_trbl_tkt_issue_works', type: 'text', alias: 'reportIssueWorksRequired', display: 'normal', mandatory: false },
            PHOTOS_TAKEN: { name: 'custrecord_twc_trbl_tkt_photos_tkn', type: 'select', alias: 'photosTaken', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file,' },
            ASSESSED_BY: { name: 'custrecord_twc_trbl_tkt_assessed_by', type: 'select', alias: 'assessedby', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            ASSESSED: { name: 'custrecord_twc_trbl_tkt_assessed', type: 'date', alias: 'assessed', display: 'normal', mandatory: false },
            CATEGORY: { name: 'custrecord_twc_trbl_tkt_category', type: 'select', alias: 'category', display: 'normal', mandatory: false, recordType: 'customrecord_twc_trbl_tkt_category,' },
            CUSTOMER: { name: 'custrecord_twc_trbl_tkt_customer', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company,' },
            ASSIGNED_TO: { name: 'custrecord_twc_trbl_tkt_assigned_to', type: 'select', alias: 'assignedTo', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            ASSIGNED_TO_COMPANY: { name: 'custrecord_twc_trbl_tkt_assigned_to_comp', type: 'select', alias: 'assignedToCompany', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company,' },
            PRIORITY: { name: 'custrecord_twc_trbl_tkt_priority', type: 'select', alias: 'priority', display: 'normal', mandatory: false, recordType: 'customrecord_twc_trbl_tkt_priority,' },
            WORKS_REQUIRED: { name: 'custrecord_twc_trbl_tkt_works_req', type: 'textarea', alias: 'worksRequired', display: 'normal', mandatory: false },
            CORRECTIVE_ACTION: { name: 'custrecord_twc_trbl_tkt_corrective_act', type: 'date', alias: 'correctiveAction', display: 'normal', mandatory: false },
            SCHEDULED_COMPLETION_DATE: { name: 'custrecord_twc_trbl_tkt_sch_compltn_date', type: 'date', alias: 'scheduledCompletionDate', display: 'normal', mandatory: false },
            CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE: { name: 'custrecord_twc_trbl_tkt_cor_act_tkn_root', type: 'textarea', alias: 'correctiveActionTakeninclRootCause', display: 'normal', mandatory: false },
            RESOLUTION_PHOTOS_TAKEN: { name: 'custrecord_twc_trbl_tkt_resltn_photo_tkn', type: 'select', alias: 'resolutionPhotosTaken', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file,' },
        }

        class OSSMTWC_TroubleTickets extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get troubleTicketID() {
                return this.get(_recordFields.TROUBLE_TICKET_ID);
            } set troubleTicketID(value) {
                this.set(_recordFields.TROUBLE_TICKET_ID, value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get status() {
                return this.get(_recordFields.STATUS);
            } set status(value) {
                this.set(_recordFields.STATUS, value)
            }
            get statusName() { return this.getText(_recordFields.STATUS); }
            
            get submitted() {
                return this.get(_recordFields.SUBMITTED);
            } set submitted(value) {
                this.set(_recordFields.SUBMITTED, value)
            }
            
            get author() {
                return this.get(_recordFields.AUTHOR);
            } set author(value) {
                this.set(_recordFields.AUTHOR, value)
            }
            
            get authorPhoneNumber() {
                return this.get(_recordFields.AUTHOR_PHONE_NUMBER);
            } set authorPhoneNumber(value) {
                this.set(_recordFields.AUTHOR_PHONE_NUMBER, value)
            }
            
            get reportIssueWorksRequired() {
                return this.get(_recordFields.REPORT_ISSUE__WORKS_REQUIRED);
            } set reportIssueWorksRequired(value) {
                this.set(_recordFields.REPORT_ISSUE__WORKS_REQUIRED, value)
            }
            
            get photosTaken() {
                return this.get(_recordFields.PHOTOS_TAKEN);
            } set photosTaken(value) {
                this.set(_recordFields.PHOTOS_TAKEN, value)
            }
            get photosTakenName() { return this.getText(_recordFields.PHOTOS_TAKEN); }
            
            get assessedby() {
                return this.get(_recordFields.ASSESSED_BY);
            } set assessedby(value) {
                this.set(_recordFields.ASSESSED_BY, value)
            }
            get assessedbyName() { return this.getText(_recordFields.ASSESSED_BY); }
            
            get assessed() {
                return this.get(_recordFields.ASSESSED);
            } set assessed(value) {
                this.set(_recordFields.ASSESSED, value)
            }
            
            get category() {
                return this.get(_recordFields.CATEGORY);
            } set category(value) {
                this.set(_recordFields.CATEGORY, value)
            }
            get categoryName() { return this.getText(_recordFields.CATEGORY); }
            
            get customer() {
                return this.get(_recordFields.CUSTOMER);
            } set customer(value) {
                this.set(_recordFields.CUSTOMER, value)
            }
            get customerName() { return this.getText(_recordFields.CUSTOMER); }
            
            get assignedTo() {
                return this.get(_recordFields.ASSIGNED_TO);
            } set assignedTo(value) {
                this.set(_recordFields.ASSIGNED_TO, value)
            }
            get assignedToName() { return this.getText(_recordFields.ASSIGNED_TO); }
            
            get assignedToCompany() {
                return this.get(_recordFields.ASSIGNED_TO_COMPANY);
            } set assignedToCompany(value) {
                this.set(_recordFields.ASSIGNED_TO_COMPANY, value)
            }
            get assignedToCompanyName() { return this.getText(_recordFields.ASSIGNED_TO_COMPANY); }
            
            get priority() {
                return this.get(_recordFields.PRIORITY);
            } set priority(value) {
                this.set(_recordFields.PRIORITY, value)
            }
            get priorityName() { return this.getText(_recordFields.PRIORITY); }
            
            get worksRequired() {
                return this.get(_recordFields.WORKS_REQUIRED);
            } set worksRequired(value) {
                this.set(_recordFields.WORKS_REQUIRED, value)
            }
            
            get correctiveAction() {
                return this.get(_recordFields.CORRECTIVE_ACTION);
            } set correctiveAction(value) {
                this.set(_recordFields.CORRECTIVE_ACTION, value)
            }
            
            get scheduledCompletionDate() {
                return this.get(_recordFields.SCHEDULED_COMPLETION_DATE);
            } set scheduledCompletionDate(value) {
                this.set(_recordFields.SCHEDULED_COMPLETION_DATE, value)
            }
            
            get correctiveActionTakeninclRootCause() {
                return this.get(_recordFields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE);
            } set correctiveActionTakeninclRootCause(value) {
                this.set(_recordFields.CORRECTIVE_ACTION_TAKEN_INCL_ROOT_CAUSE, value)
            }
            
            get resolutionPhotosTaken() {
                return this.get(_recordFields.RESOLUTION_PHOTOS_TAKEN);
            } set resolutionPhotosTaken(value) {
                this.set(_recordFields.RESOLUTION_PHOTOS_TAKEN, value)
            }
            get resolutionPhotosTakenName() { return this.getText(_recordFields.RESOLUTION_PHOTOS_TAKEN); }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_TroubleTickets,

            get: function (id) {
                var rec = new OSSMTWC_TroubleTickets(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_TroubleTickets();
                return rec.select(options);
            }

        }
    });
