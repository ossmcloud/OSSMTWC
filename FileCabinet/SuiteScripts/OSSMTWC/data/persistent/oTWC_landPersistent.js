/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_land';
        var _recordFields = {
            SITE: 'custrecord_twc_land_site',
            LAND_ID: 'custrecord_twc_land_id',
            LAND_AGREEMENT_STATUS: 'custrecord_twc_land_agre_sts',
            COA: 'custrecord_twc_land_coa',
            TITLE_TYPE: 'custrecord_twc_land_title_type',
            FOLIO: 'custrecord_twc_land_folio',
            FOLIO_REGISTRATION_COMPLETE: 'custrecord_twc_land_folio_reg_complete',
            BURDEN: 'custrecord_twc_land_burden',
            BURDEN_DETAILS: 'custrecord_twc_land_burden_details',
            LAND_TAG: 'custrecord_twc_land_tag',
            START_DATE: 'custrecord_twc_land_start_date',
            EXPIRY_DATE: 'custrecord_twc_land_expiry_date',
            CURRENT_AMOUNT_PAYABLE: 'custrecord_twc_land_cur_amt_payable',
            LANDLORD_NAME: 'custrecord_twc_land_landlord_name',
            LANDLORD_CONTACT: 'custrecord_twc_land_landlord_contact',
            REVIEW_BASIS: 'custrecord_twc_land_review_basic',
            REVIEW_NEXT_DATE: 'custrecord_twc_land_review_next_date',
            AGREEMENT_COMMENT: 'custrecord_twc_land_agreement_comment',
            LANDLORD_GROUP: 'custrecord_twc_land_landlord_group',
        }
        var _recordFieldInfo = {
            SITE: { name: 'custrecord_twc_land_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            LAND_ID: { name: 'custrecord_twc_land_id', type: 'text', alias: 'landID', display: 'normal', mandatory: false },
            LAND_AGREEMENT_STATUS: { name: 'custrecord_twc_land_agre_sts', type: 'select', alias: 'landAgreementStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_land_agre_sts_type,' },
            COA: { name: 'custrecord_twc_land_coa', type: 'checkbox', alias: 'c.O.A', display: 'normal', mandatory: false },
            TITLE_TYPE: { name: 'custrecord_twc_land_title_type', type: 'select', alias: 'titleType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_land_title_type,' },
            FOLIO: { name: 'custrecord_twc_land_folio', type: 'text', alias: 'folio', display: 'normal', mandatory: false },
            FOLIO_REGISTRATION_COMPLETE: { name: 'custrecord_twc_land_folio_reg_complete', type: 'checkbox', alias: 'folioRegistrationComplete', display: 'normal', mandatory: false },
            BURDEN: { name: 'custrecord_twc_land_burden', type: 'checkbox', alias: 'burden', display: 'normal', mandatory: false },
            BURDEN_DETAILS: { name: 'custrecord_twc_land_burden_details', type: 'clobtext', alias: 'burdenDetails', display: 'normal', mandatory: false },
            LAND_TAG: { name: 'custrecord_twc_land_tag', type: 'text', alias: 'landTag', display: 'normal', mandatory: false },
            START_DATE: { name: 'custrecord_twc_land_start_date', type: 'date', alias: 'startDate', display: 'normal', mandatory: false },
            EXPIRY_DATE: { name: 'custrecord_twc_land_expiry_date', type: 'date', alias: 'expiryDate', display: 'normal', mandatory: false },
            CURRENT_AMOUNT_PAYABLE: { name: 'custrecord_twc_land_cur_amt_payable', type: 'currency', alias: 'currentAmountPayable', display: 'normal', mandatory: false },
            LANDLORD_NAME: { name: 'custrecord_twc_land_landlord_name', type: 'select', alias: 'landlordName', display: 'normal', mandatory: false, recordType: '-2' },
            LANDLORD_CONTACT: { name: 'custrecord_twc_land_landlord_contact', type: 'select', alias: 'landlordContact', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            REVIEW_BASIS: { name: 'custrecord_twc_land_review_basic', type: 'text', alias: 'reviewBasis', display: 'normal', mandatory: false },
            REVIEW_NEXT_DATE: { name: 'custrecord_twc_land_review_next_date', type: 'date', alias: 'reviewNextDate', display: 'normal', mandatory: false },
            AGREEMENT_COMMENT: { name: 'custrecord_twc_land_agreement_comment', type: 'text', alias: 'agreementComment', display: 'normal', mandatory: false },
            LANDLORD_GROUP: { name: 'custrecord_twc_land_landlord_group', type: 'select', alias: 'landlordGroup', display: 'normal', mandatory: false, recordType: 'customrecord_twc_row_landlord_group,' },
        }

        class OSSMTWC_Land extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get landID() {
                return this.get(_recordFields.LAND_ID);
            } set landID(value) {
                this.set(_recordFields.LAND_ID, value)
            }
            
            get landAgreementStatus() {
                return this.get(_recordFields.LAND_AGREEMENT_STATUS);
            } set landAgreementStatus(value) {
                this.set(_recordFields.LAND_AGREEMENT_STATUS, value)
            }
            get landAgreementStatusName() { return this.getText(_recordFields.LAND_AGREEMENT_STATUS); }
            
            get coa() {
                return this.get(_recordFields.COA);
            } set coa(value) {
                this.set(_recordFields.COA, value)
            }
            
            get titleType() {
                return this.get(_recordFields.TITLE_TYPE);
            } set titleType(value) {
                this.set(_recordFields.TITLE_TYPE, value)
            }
            get titleTypeName() { return this.getText(_recordFields.TITLE_TYPE); }
            
            get folio() {
                return this.get(_recordFields.FOLIO);
            } set folio(value) {
                this.set(_recordFields.FOLIO, value)
            }
            
            get folioRegistrationComplete() {
                return this.get(_recordFields.FOLIO_REGISTRATION_COMPLETE);
            } set folioRegistrationComplete(value) {
                this.set(_recordFields.FOLIO_REGISTRATION_COMPLETE, value)
            }
            
            get burden() {
                return this.get(_recordFields.BURDEN);
            } set burden(value) {
                this.set(_recordFields.BURDEN, value)
            }
            
            get burdenDetails() {
                return this.get(_recordFields.BURDEN_DETAILS);
            } set burdenDetails(value) {
                this.set(_recordFields.BURDEN_DETAILS, value)
            }
            
            get landTag() {
                return this.get(_recordFields.LAND_TAG);
            } set landTag(value) {
                this.set(_recordFields.LAND_TAG, value)
            }
            
            get startDate() {
                return this.get(_recordFields.START_DATE);
            } set startDate(value) {
                this.set(_recordFields.START_DATE, value)
            }
            
            get expiryDate() {
                return this.get(_recordFields.EXPIRY_DATE);
            } set expiryDate(value) {
                this.set(_recordFields.EXPIRY_DATE, value)
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
            PersistentRecord: OSSMTWC_Land,


            get: function (id) {
                var rec = new OSSMTWC_Land(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Land();
                return rec.select(options);
            }

        }
    });
