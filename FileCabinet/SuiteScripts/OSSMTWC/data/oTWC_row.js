/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (core, coreSQL) => {

        var RECORD_TYPE = 'customrecord_twc_row';
        var _recordFields = {
            SITE: 'custrecord_twc_row_site',
            ROW_ID: 'custrecord_twc_row_id',
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



        return {
            Type: RECORD_TYPE,
            Fields: _recordFields,

            
        }
    });
