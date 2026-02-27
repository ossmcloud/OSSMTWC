/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_row';
        var _recordFields = {
            SITE: 'custrecord_twc_row_site',
            ROW_ID: 'custrecord_twc_row_id',
            ROW_STATUS: 'custrecord_twc_row_sts',
            ROW_TYPE: 'custrecord_twc_row_type',
            ROW_REGISTERED: 'custrecord_twc_row_registered',
            ROW_FOLIO: 'custrecord_twc_row_folio',
            ROW_CONDITIONS: 'custrecord_twc_row_conditions',
            LONG_TERM_USER: 'custrecord_twc_row_long_term_user',
            WAYLEAVE_REGISTERED: 'custrecord_twc_row_wayleave_registered',
            WAYLEAVE_FOLIO: 'custrecord_twc_row_wayleave_folio',
            WAYLEAVE_COMMENTS: 'custrecord_twc_row_wayleave_comments',
            CURRENT_AMOUNT_PAYABLE: 'custrecord_twc_row_currency_amt_payable',
            LANDLORD_NAME: 'custrecord_twc_row_landlord_name',
            LANDLORD_CONTACT: 'custrecord_twc_row_landlord_contact',
            REVIEW_BASIS: 'custrecord_twc_row_review_basis',
            REVIEW_NEXT_DATE: 'custrecord_twc_row_review_next_date',
            AGREEMENT_COMMENT: 'custrecord_twc_row_agreement_comment',
            LANDLORD_GROUP: 'custrecord_twc_row_landlord_group',
        }
        var _recordFieldInfo = {
            SITE: { name: 'custrecord_twc_row_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            ROW_ID: { name: 'custrecord_twc_row_id', type: 'text', alias: 'rowID', display: 'normal', mandatory: false },
            ROW_STATUS: { name: 'custrecord_twc_row_sts', type: 'select', alias: 'rOWStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_row_status,' },
            ROW_TYPE: { name: 'custrecord_twc_row_type', type: 'select', alias: 'r.O.W.Type', display: 'normal', mandatory: false, recordType: 'customrecord_twc_row_type,' },
            ROW_REGISTERED: { name: 'custrecord_twc_row_registered', type: 'checkbox', alias: 'r.O.W.Registered', display: 'normal', mandatory: false },
            ROW_FOLIO: { name: 'custrecord_twc_row_folio', type: 'text', alias: 'r.O.W.Folio', display: 'normal', mandatory: false },
            ROW_CONDITIONS: { name: 'custrecord_twc_row_conditions', type: 'textarea', alias: 'r.O.W.Conditions', display: 'normal', mandatory: false },
            LONG_TERM_USER: { name: 'custrecord_twc_row_long_term_user', type: 'checkbox', alias: 'longTermUser', display: 'normal', mandatory: false },
            WAYLEAVE_REGISTERED: { name: 'custrecord_twc_row_wayleave_registered', type: 'checkbox', alias: 'wayleaveRegistered', display: 'normal', mandatory: false },
            WAYLEAVE_FOLIO: { name: 'custrecord_twc_row_wayleave_folio', type: 'text', alias: 'wayleaveFolio', display: 'normal', mandatory: false },
            WAYLEAVE_COMMENTS: { name: 'custrecord_twc_row_wayleave_comments', type: 'text', alias: 'wayleaveComments', display: 'normal', mandatory: false },
            CURRENT_AMOUNT_PAYABLE: { name: 'custrecord_twc_row_currency_amt_payable', type: 'currency', alias: 'currentAmountPayable', display: 'normal', mandatory: false },
            LANDLORD_NAME: { name: 'custrecord_twc_row_landlord_name', type: 'select', alias: 'landlordName', display: 'normal', mandatory: false, recordType: '-2' },
            LANDLORD_CONTACT: { name: 'custrecord_twc_row_landlord_contact', type: 'select', alias: 'landlordContact', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            REVIEW_BASIS: { name: 'custrecord_twc_row_review_basis', type: 'text', alias: 'reviewBasis', display: 'normal', mandatory: false },
            REVIEW_NEXT_DATE: { name: 'custrecord_twc_row_review_next_date', type: 'date', alias: 'reviewNextDate', display: 'normal', mandatory: false },
            AGREEMENT_COMMENT: { name: 'custrecord_twc_row_agreement_comment', type: 'text', alias: 'agreementComment', display: 'normal', mandatory: false },
            LANDLORD_GROUP: { name: 'custrecord_twc_row_landlord_group', type: 'select', alias: 'landlordGroup', display: 'normal', mandatory: false, recordType: 'customrecord_twc_row_landlord_group,' },
        }

        class OSSMTWC_Row extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get rowID() {
                return this.get(_recordFields.ROW_ID);
            } set rowID(value) {
                this.set(_recordFields.ROW_ID, value)
            }
            
            get rOWStatus() {
                return this.get(_recordFields.ROW_STATUS);
            } set rOWStatus(value) {
                this.set(_recordFields.ROW_STATUS, value)
            }
            get rOWStatusName() { return this.getText(_recordFields.ROW_STATUS); }
            
            get rowType() {
                return this.get(_recordFields.R.O.W._TYPE);
            } set rowType(value) {
                this.set(_recordFields.R.O.W._TYPE, value)
            }
            get rowTypeName() { return this.getText(_recordFields.R.O.W._TYPE); }
            
            get rowRegistered() {
                return this.get(_recordFields.R.O.W._REGISTERED);
            } set rowRegistered(value) {
                this.set(_recordFields.R.O.W._REGISTERED, value)
            }
            
            get rowFolio() {
                return this.get(_recordFields.R.O.W._FOLIO);
            } set rowFolio(value) {
                this.set(_recordFields.R.O.W._FOLIO, value)
            }
            
            get rowConditions() {
                return this.get(_recordFields.R.O.W._CONDITIONS);
            } set rowConditions(value) {
                this.set(_recordFields.R.O.W._CONDITIONS, value)
            }
            
            get longTermUser() {
                return this.get(_recordFields.LONG_TERM_USER);
            } set longTermUser(value) {
                this.set(_recordFields.LONG_TERM_USER, value)
            }
            
            get wayleaveRegistered() {
                return this.get(_recordFields.WAYLEAVE_REGISTERED);
            } set wayleaveRegistered(value) {
                this.set(_recordFields.WAYLEAVE_REGISTERED, value)
            }
            
            get wayleaveFolio() {
                return this.get(_recordFields.WAYLEAVE_FOLIO);
            } set wayleaveFolio(value) {
                this.set(_recordFields.WAYLEAVE_FOLIO, value)
            }
            
            get wayleaveComments() {
                return this.get(_recordFields.WAYLEAVE_COMMENTS);
            } set wayleaveComments(value) {
                this.set(_recordFields.WAYLEAVE_COMMENTS, value)
            }
            
            get currentAmountPayable() {
                return this.get(_recordFields.CURRENT_AMOUNT_PAYABLE);
            } set currentAmountPayable(value) {
                this.set(_recordFields.CURRENT_AMOUNT_PAYABLE, value)
            }
            
            get landlordName() {
                return this.get(_recordFields.LANDLORD_NAME);
            } set landlordName(value) {
                this.set(_recordFields.LANDLORD_NAME, value)
            }
            get landlordNameName() { return this.getText(_recordFields.LANDLORD_NAME); }
            
            get landlordContact() {
                return this.get(_recordFields.LANDLORD_CONTACT);
            } set landlordContact(value) {
                this.set(_recordFields.LANDLORD_CONTACT, value)
            }
            get landlordContactName() { return this.getText(_recordFields.LANDLORD_CONTACT); }
            
            get reviewBasis() {
                return this.get(_recordFields.REVIEW_BASIS);
            } set reviewBasis(value) {
                this.set(_recordFields.REVIEW_BASIS, value)
            }
            
            get reviewNextDate() {
                return this.get(_recordFields.REVIEW_NEXT_DATE);
            } set reviewNextDate(value) {
                this.set(_recordFields.REVIEW_NEXT_DATE, value)
            }
            
            get agreementComment() {
                return this.get(_recordFields.AGREEMENT_COMMENT);
            } set agreementComment(value) {
                this.set(_recordFields.AGREEMENT_COMMENT, value)
            }
            
            get landlordGroup() {
                return this.get(_recordFields.LANDLORD_GROUP);
            } set landlordGroup(value) {
                this.set(_recordFields.LANDLORD_GROUP, value)
            }
            get landlordGroupName() { return this.getText(_recordFields.LANDLORD_GROUP); }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_Row,

            get: function (id) {
                var rec = new OSSMTWC_Row(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Row();
                return rec.select(options);
            }

        }
    });
