/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_company';
        var _recordFields = {
            NAME: 'name',
            RADIX_COMPANY_TABLE_ENTRY_NUMBER: 'custrecord_twc_co_radix_entry_num',
            ENTITY: 'custrecordtwc_entity',
            ACCREDITATION_STATUS: 'custrecord_twc_co_accred_status',
            ACCREDITATION_STATUS_COMMENT: 'custrecord_twc_co_accred_sts_cmt',
            ACCREDITATION_SUBMITTED: 'custrecord_twc_co_accred_submitted',
            ACCREDITATION_STATUS_CHANGE_DATE: 'custrecord_twc_co_accred_sts_date',
            COMPANY_ADDRESS: 'custrecord_twc_co_address',
            COMPANY_TYPE: 'custrecord_twc_co_type',
            COMPANY_CLASSIFICATION: 'custrecord_twc_co_classification',
            PRIMARY_CONTACT: 'custrecord_twc_co_primary_cnct',
            APPROVAL_DATE: 'custrecord_twc_co_approval_date',
            SAF_AUTO_APPROVE: 'custrecord_twc_co_saf_auto_approve',
            INSURER: 'custrecord_twc_co_insurer',
            RESTRICTIONS: 'custrecord_twc_co_restrictions',
            EL_STATUS: 'custrecord_twc_co_el_status',
            EL_AVAILABLETYPE: 'custrecord_twc_co_el_available_typ',
            EL_LIMIT: 'custrecord_twc_co_el_limit',
            EL_LIMIT_CURRENCY: 'custrecord_twc_co_el_limit_cur',
            EL_EXPIRY: 'custrecord_twc_co_el_expiry',
            EL_INSURANCE_MANDATORY: 'custrecord_twc_co_el_insur_mand',
            EL_EXISTING_FILES: 'custrecord_twc_co_el_existing_file',
            EL_UPLOAD_NEW_FILE: 'custrecord_twc_co_el_upld_new_file',
            PL_STATUS: 'custrecord_twc_co_pl_status',
            PL_AVAILABLETYPE: 'custrecord_twc_co_pl_available_typ',
            PL_LIMIT: 'custrecord_twc_co_pl_limit',
            PL_LIMIT_CURRENCY: 'custrecord_twc_co_pl_limit_cur',
            PL_EXPIRY: 'custrecord_twc_co_pl_expiry',
            PL_INSURANCE_MANDATORY: 'custrecord_twc_co_pl_insur_mand',
            PL_EXISTING_FILES: 'custrecord_twc_co_pl_existing_file',
            PL_UPLOAD_NEW_FILE: 'custrecord_twc_co_pl_upld_new_file',
            PI_STATUS: 'custrecord_twc_co_pi_status',
            PI_AVAILABLETYPE: 'custrecord_twc_co_pi_available_typ',
            PI_LIMIT: 'custrecord_twc_co_pi_limit',
            PI_LIMIT_CURRENCY: 'custrecord_twc_co_pi_limit_cur',
            PI_EXPIRY: 'custrecord_twc_co_pi_expiry',
            PI_INSURANCE_MANDATORY: 'custrecord_twc_co_pi_insur_mand',
            PI_EXISTING_FILES: 'custrecord_twc_co_pi_existing_file',
            PI_UPLOAD_NEW_FILE: 'custrecord_twc_co_pi_upld_new_file',
            KEYS: 'custrecord_twc_co_keys',
            EXISTING_FILES: 'custrecord_twc_co_existing_files',
            UPLOAD_NEW_FILE: 'custrecord_twc_co_upld_new_file',
            ACCREDITED_CONTRACTOR_COMMENCEMENT: 'custrecord_twc_co_accred_cont_comm',
            ACCREDITED_CONTRACTOR_EXPIRY: 'custrecord_twc_co_accred_cont_exp',
            ACCREDITED_CONTRACTOR_FEE: 'custrecord_twc_co_accred_cont_fee',
            TL_COMPANY_ID: 'custrecord_twc_co_tl_co_id',
            ON_LINE_LICENCING: 'custrecord_twc_co_on_line_licence',
            MSLA_DATE: 'custrecord_twc_co_msla_date',
            COMPANY_NUMBER: 'custrecord_twc_co_number',
            TA_COMPANY_NAME: 'custrecord_twc_co_ta_name',
            REGISTERED_OFFICE: 'custrecord_twc_co_regd_office',
            FINANCE_VENDOR: 'custrecord_twc_co_fin_vend',
            FINANCE_VENDOR_REF: 'custrecord_twc_co_fin_vend_ref',
            FINANCE_CUSTOMER: 'custrecord_twc_co_fin_cust',
            FINANCE_CUSTOMER_REF: 'custrecord_twc_co_fin_cust_ref',
            PORTAL_USER: 'custrecord_twc_co_portal_user',
            ACCREDITATION_APPROVED: 'custrecord_twc_co_accred_appr',
            CUSTOMER_FLAG: 'custrecord_twc_cus_flag',
            CONTRACTOR_FLAG: 'custrecord_twc_con_flag',
            LANDLORD_FLAG: 'custrecord_twc_landlord_flag',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            RADIX_COMPANY_TABLE_ENTRY_NUMBER: { name: 'custrecord_twc_co_radix_entry_num', type: 'integer', alias: 'rADIXCompanyTableentrynumber', display: 'normal', mandatory: false },
            ENTITY: { name: 'custrecordtwc_entity', type: 'select', alias: 'entity', display: 'normal', mandatory: false, recordType: '-9' },
            ACCREDITATION_STATUS: { name: 'custrecord_twc_co_accred_status', type: 'select', alias: 'accreditationStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_co_accred_status' },
            ACCREDITATION_STATUS_COMMENT: { name: 'custrecord_twc_co_accred_sts_cmt', type: 'text', alias: 'accreditationStatusComment', display: 'normal', mandatory: false },
            ACCREDITATION_SUBMITTED: { name: 'custrecord_twc_co_accred_submitted', type: 'text', alias: 'accreditationSubmitted', display: 'normal', mandatory: false },
            ACCREDITATION_STATUS_CHANGE_DATE: { name: 'custrecord_twc_co_accred_sts_date', type: 'date', alias: 'accreditationStatusChangeDate', display: 'normal', mandatory: false },
            COMPANY_ADDRESS: { name: 'custrecord_twc_co_address', type: 'clobtext', alias: 'companyAddress', display: 'normal', mandatory: false },
            COMPANY_TYPE: { name: 'custrecord_twc_co_type', type: 'select', alias: 'companyType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_co_type' },
            COMPANY_CLASSIFICATION: { name: 'custrecord_twc_co_classification', type: 'select', alias: 'companyClassification', display: 'normal', mandatory: false, recordType: 'customrecord_twc_co_classification' },
            PRIMARY_CONTACT: { name: 'custrecord_twc_co_primary_cnct', type: 'select', alias: 'primaryContact', display: 'normal', mandatory: false, recordType: 'customrecord_twc_co_primary_cnct' },
            APPROVAL_DATE: { name: 'custrecord_twc_co_approval_date', type: 'date', alias: 'approvalDate', display: 'normal', mandatory: false },
            SAF_AUTO_APPROVE: { name: 'custrecord_twc_co_saf_auto_approve', type: 'checkbox', alias: 'sAFAuto_Approve', display: 'normal', mandatory: false },
            INSURER: { name: 'custrecord_twc_co_insurer', type: 'text', alias: 'insurer', display: 'normal', mandatory: false },
            RESTRICTIONS: { name: 'custrecord_twc_co_restrictions', type: 'clobtext', alias: 'restrictions', display: 'normal', mandatory: false },
            EL_STATUS: { name: 'custrecord_twc_co_el_status', type: 'select', alias: 'eLStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            EL_AVAILABLETYPE: { name: 'custrecord_twc_co_el_available_typ', type: 'select', alias: 'eLAvailableType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_co_available_type' },
            EL_LIMIT: { name: 'custrecord_twc_co_el_limit', type: 'currency', alias: 'eLLimit', display: 'normal', mandatory: false },
            EL_LIMIT_CURRENCY: { name: 'custrecord_twc_co_el_limit_cur', type: 'text', alias: 'eLLimitCurrency', display: 'normal', mandatory: false },
            EL_EXPIRY: { name: 'custrecord_twc_co_el_expiry', type: 'date', alias: 'eLExpiry', display: 'normal', mandatory: false },
            EL_INSURANCE_MANDATORY: { name: 'custrecord_twc_co_el_insur_mand', type: 'checkbox', alias: 'eLInsuranceMandatory', display: 'normal', mandatory: false },
            EL_EXISTING_FILES: { name: 'custrecord_twc_co_el_existing_file', type: 'document', alias: 'eLExistingFiles', display: 'normal', mandatory: false },
            EL_UPLOAD_NEW_FILE: { name: 'custrecord_twc_co_el_upld_new_file', type: 'document', alias: 'eLUploadNewFile', display: 'normal', mandatory: false },
            PL_STATUS: { name: 'custrecord_twc_co_pl_status', type: 'select', alias: 'pLStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            PL_AVAILABLETYPE: { name: 'custrecord_twc_co_pl_available_typ', type: 'select', alias: 'pLAvailableType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_co_available_type' },
            PL_LIMIT: { name: 'custrecord_twc_co_pl_limit', type: 'currency', alias: 'pLLimit', display: 'normal', mandatory: false },
            PL_LIMIT_CURRENCY: { name: 'custrecord_twc_co_pl_limit_cur', type: 'text', alias: 'pLLimitCurrency', display: 'normal', mandatory: false },
            PL_EXPIRY: { name: 'custrecord_twc_co_pl_expiry', type: 'date', alias: 'pLExpiry', display: 'normal', mandatory: false },
            PL_INSURANCE_MANDATORY: { name: 'custrecord_twc_co_pl_insur_mand', type: 'checkbox', alias: 'pLInsuranceMandatory', display: 'normal', mandatory: false },
            PL_EXISTING_FILES: { name: 'custrecord_twc_co_pl_existing_file', type: 'document', alias: 'pLExistingFiles', display: 'normal', mandatory: false },
            PL_UPLOAD_NEW_FILE: { name: 'custrecord_twc_co_pl_upld_new_file', type: 'document', alias: 'pLUploadNewFile', display: 'normal', mandatory: false },
            PI_STATUS: { name: 'custrecord_twc_co_pi_status', type: 'select', alias: 'pIStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            PI_AVAILABLETYPE: { name: 'custrecord_twc_co_pi_available_typ', type: 'select', alias: 'pIAvailableType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_co_available_type' },
            PI_LIMIT: { name: 'custrecord_twc_co_pi_limit', type: 'currency', alias: 'pILimit', display: 'normal', mandatory: false },
            PI_LIMIT_CURRENCY: { name: 'custrecord_twc_co_pi_limit_cur', type: 'text', alias: 'pILimitCurrency', display: 'normal', mandatory: false },
            PI_EXPIRY: { name: 'custrecord_twc_co_pi_expiry', type: 'date', alias: 'pIExpiry', display: 'normal', mandatory: false },
            PI_INSURANCE_MANDATORY: { name: 'custrecord_twc_co_pi_insur_mand', type: 'checkbox', alias: 'pIInsuranceMandatory', display: 'normal', mandatory: false },
            PI_EXISTING_FILES: { name: 'custrecord_twc_co_pi_existing_file', type: 'document', alias: 'pIExistingFiles', display: 'normal', mandatory: false },
            PI_UPLOAD_NEW_FILE: { name: 'custrecord_twc_co_pi_upld_new_file', type: 'document', alias: 'pIUploadNewFile', display: 'normal', mandatory: false },
            KEYS: { name: 'custrecord_twc_co_keys', type: 'select', alias: 'keys', display: 'normal', mandatory: false, recordType: 'customrecord_twc_track_key' },
            EXISTING_FILES: { name: 'custrecord_twc_co_existing_files', type: 'document', alias: 'existingFiles', display: 'normal', mandatory: false },
            UPLOAD_NEW_FILE: { name: 'custrecord_twc_co_upld_new_file', type: 'document', alias: 'uploadNewFile', display: 'normal', mandatory: false },
            ACCREDITED_CONTRACTOR_COMMENCEMENT: { name: 'custrecord_twc_co_accred_cont_comm', type: 'date', alias: 'accreditedContractorCommencement', display: 'normal', mandatory: false },
            ACCREDITED_CONTRACTOR_EXPIRY: { name: 'custrecord_twc_co_accred_cont_exp', type: 'date', alias: 'accreditedContractorExpiry', display: 'normal', mandatory: false },
            ACCREDITED_CONTRACTOR_FEE: { name: 'custrecord_twc_co_accred_cont_fee', type: 'currency', alias: 'accreditedContractorFee', display: 'normal', mandatory: false },
            TL_COMPANY_ID: { name: 'custrecord_twc_co_tl_co_id', type: 'text', alias: 'tLCompanyID', display: 'normal', mandatory: false },
            ON_LINE_LICENCING: { name: 'custrecord_twc_co_on_line_licence', type: 'checkbox', alias: 'on_LineLicencing', display: 'normal', mandatory: false },
            MSLA_DATE: { name: 'custrecord_twc_co_msla_date', type: 'date', alias: 'mSLADate', display: 'normal', mandatory: false },
            COMPANY_NUMBER: { name: 'custrecord_twc_co_number', type: 'text', alias: 'companyNumber', display: 'normal', mandatory: false },
            TA_COMPANY_NAME: { name: 'custrecord_twc_co_ta_name', type: 'text', alias: 'tACompanyName', display: 'normal', mandatory: false },
            REGISTERED_OFFICE: { name: 'custrecord_twc_co_regd_office', type: 'text', alias: 'registeredOffice', display: 'normal', mandatory: false },
            FINANCE_VENDOR: { name: 'custrecord_twc_co_fin_vend', type: 'checkbox', alias: 'financeVendor', display: 'normal', mandatory: false },
            FINANCE_VENDOR_REF: { name: 'custrecord_twc_co_fin_vend_ref', type: 'text', alias: 'financeVendorRef', display: 'normal', mandatory: false },
            FINANCE_CUSTOMER: { name: 'custrecord_twc_co_fin_cust', type: 'checkbox', alias: 'financeCustomer', display: 'normal', mandatory: false },
            FINANCE_CUSTOMER_REF: { name: 'custrecord_twc_co_fin_cust_ref', type: 'text', alias: 'financeCustomerRef', display: 'normal', mandatory: false },
            PORTAL_USER: { name: 'custrecord_twc_co_portal_user', type: 'checkbox', alias: 'portalUser', display: 'normal', mandatory: false },
            ACCREDITATION_APPROVED: { name: 'custrecord_twc_co_accred_appr', type: 'date', alias: 'accreditationApproved', display: 'normal', mandatory: false },
            CUSTOMER_FLAG: { name: 'custrecord_twc_cus_flag', type: 'select', alias: 'customerFlag', display: 'normal', mandatory: false, recordType: 'customrecord_twc_cus_flag' },
            CONTRACTOR_FLAG: { name: 'custrecord_twc_con_flag', type: 'select', alias: 'contractorFlag', display: 'normal', mandatory: false, recordType: 'customrecord_twc_con_flag' },
            LANDLORD_FLAG: { name: 'custrecord_twc_landlord_flag', type: 'select', alias: 'landlordFlag', display: 'normal', mandatory: false, recordType: 'customrecord_twc_landlord_flag' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_Company extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get rADIXCompanyTableentrynumber() {
                return this.get(_recordFields.RADIX_COMPANY_TABLE_ENTRY_NUMBER);
            } set rADIXCompanyTableentrynumber(value) {
                this.set(_recordFields.RADIX_COMPANY_TABLE_ENTRY_NUMBER, value)
            }
            
            get entity() {
                return this.get(_recordFields.ENTITY);
            } set entity(value) {
                this.set(_recordFields.ENTITY, value)
            }
            get entityName() { return this.getText(_recordFields.ENTITY); }
            
            get accreditationStatus() {
                return this.get(_recordFields.ACCREDITATION_STATUS);
            } set accreditationStatus(value) {
                this.set(_recordFields.ACCREDITATION_STATUS, value)
            }
            get accreditationStatusName() { return this.getText(_recordFields.ACCREDITATION_STATUS); }
            
            get accreditationStatusComment() {
                return this.get(_recordFields.ACCREDITATION_STATUS_COMMENT);
            } set accreditationStatusComment(value) {
                this.set(_recordFields.ACCREDITATION_STATUS_COMMENT, value)
            }
            
            get accreditationSubmitted() {
                return this.get(_recordFields.ACCREDITATION_SUBMITTED);
            } set accreditationSubmitted(value) {
                this.set(_recordFields.ACCREDITATION_SUBMITTED, value)
            }
            
            get accreditationStatusChangeDate() {
                return this.get(_recordFields.ACCREDITATION_STATUS_CHANGE_DATE);
            } set accreditationStatusChangeDate(value) {
                this.set(_recordFields.ACCREDITATION_STATUS_CHANGE_DATE, value)
            }
            
            get companyAddress() {
                return this.get(_recordFields.COMPANY_ADDRESS);
            } set companyAddress(value) {
                this.set(_recordFields.COMPANY_ADDRESS, value)
            }
            
            get companyType() {
                return this.get(_recordFields.COMPANY_TYPE);
            } set companyType(value) {
                this.set(_recordFields.COMPANY_TYPE, value)
            }
            get companyTypeName() { return this.getText(_recordFields.COMPANY_TYPE); }
            
            get companyClassification() {
                return this.get(_recordFields.COMPANY_CLASSIFICATION);
            } set companyClassification(value) {
                this.set(_recordFields.COMPANY_CLASSIFICATION, value)
            }
            get companyClassificationName() { return this.getText(_recordFields.COMPANY_CLASSIFICATION); }
            
            get primaryContact() {
                return this.get(_recordFields.PRIMARY_CONTACT);
            } set primaryContact(value) {
                this.set(_recordFields.PRIMARY_CONTACT, value)
            }
            get primaryContactName() { return this.getText(_recordFields.PRIMARY_CONTACT); }
            
            get approvalDate() {
                return this.get(_recordFields.APPROVAL_DATE);
            } set approvalDate(value) {
                this.set(_recordFields.APPROVAL_DATE, value)
            }
            
            get sAFAuto_Approve() {
                return this.get(_recordFields.SAF_AUTO_APPROVE);
            } set sAFAuto_Approve(value) {
                this.set(_recordFields.SAF_AUTO_APPROVE, value)
            }
            
            get insurer() {
                return this.get(_recordFields.INSURER);
            } set insurer(value) {
                this.set(_recordFields.INSURER, value)
            }
            
            get restrictions() {
                return this.get(_recordFields.RESTRICTIONS);
            } set restrictions(value) {
                this.set(_recordFields.RESTRICTIONS, value)
            }
            
            get eLStatus() {
                return this.get(_recordFields.EL_STATUS);
            } set eLStatus(value) {
                this.set(_recordFields.EL_STATUS, value)
            }
            get eLStatusName() { return this.getText(_recordFields.EL_STATUS); }
            
            get eLAvailableType() {
                return this.get(_recordFields.EL_AVAILABLETYPE);
            } set eLAvailableType(value) {
                this.set(_recordFields.EL_AVAILABLETYPE, value)
            }
            get eLAvailableTypeName() { return this.getText(_recordFields.EL_AVAILABLETYPE); }
            
            get eLLimit() {
                return this.get(_recordFields.EL_LIMIT);
            } set eLLimit(value) {
                this.set(_recordFields.EL_LIMIT, value)
            }
            
            get eLLimitCurrency() {
                return this.get(_recordFields.EL_LIMIT_CURRENCY);
            } set eLLimitCurrency(value) {
                this.set(_recordFields.EL_LIMIT_CURRENCY, value)
            }
            
            get eLExpiry() {
                return this.get(_recordFields.EL_EXPIRY);
            } set eLExpiry(value) {
                this.set(_recordFields.EL_EXPIRY, value)
            }
            
            get eLInsuranceMandatory() {
                return this.get(_recordFields.EL_INSURANCE_MANDATORY);
            } set eLInsuranceMandatory(value) {
                this.set(_recordFields.EL_INSURANCE_MANDATORY, value)
            }
            
            get eLExistingFiles() {
                return this.get(_recordFields.EL_EXISTING_FILES);
            } set eLExistingFiles(value) {
                this.set(_recordFields.EL_EXISTING_FILES, value)
            }
            
            get eLUploadNewFile() {
                return this.get(_recordFields.EL_UPLOAD_NEW_FILE);
            } set eLUploadNewFile(value) {
                this.set(_recordFields.EL_UPLOAD_NEW_FILE, value)
            }
            
            get pLStatus() {
                return this.get(_recordFields.PL_STATUS);
            } set pLStatus(value) {
                this.set(_recordFields.PL_STATUS, value)
            }
            get pLStatusName() { return this.getText(_recordFields.PL_STATUS); }
            
            get pLAvailableType() {
                return this.get(_recordFields.PL_AVAILABLETYPE);
            } set pLAvailableType(value) {
                this.set(_recordFields.PL_AVAILABLETYPE, value)
            }
            get pLAvailableTypeName() { return this.getText(_recordFields.PL_AVAILABLETYPE); }
            
            get pLLimit() {
                return this.get(_recordFields.PL_LIMIT);
            } set pLLimit(value) {
                this.set(_recordFields.PL_LIMIT, value)
            }
            
            get pLLimitCurrency() {
                return this.get(_recordFields.PL_LIMIT_CURRENCY);
            } set pLLimitCurrency(value) {
                this.set(_recordFields.PL_LIMIT_CURRENCY, value)
            }
            
            get pLExpiry() {
                return this.get(_recordFields.PL_EXPIRY);
            } set pLExpiry(value) {
                this.set(_recordFields.PL_EXPIRY, value)
            }
            
            get pLInsuranceMandatory() {
                return this.get(_recordFields.PL_INSURANCE_MANDATORY);
            } set pLInsuranceMandatory(value) {
                this.set(_recordFields.PL_INSURANCE_MANDATORY, value)
            }
            
            get pLExistingFiles() {
                return this.get(_recordFields.PL_EXISTING_FILES);
            } set pLExistingFiles(value) {
                this.set(_recordFields.PL_EXISTING_FILES, value)
            }
            
            get pLUploadNewFile() {
                return this.get(_recordFields.PL_UPLOAD_NEW_FILE);
            } set pLUploadNewFile(value) {
                this.set(_recordFields.PL_UPLOAD_NEW_FILE, value)
            }
            
            get pIStatus() {
                return this.get(_recordFields.PI_STATUS);
            } set pIStatus(value) {
                this.set(_recordFields.PI_STATUS, value)
            }
            get pIStatusName() { return this.getText(_recordFields.PI_STATUS); }
            
            get pIAvailableType() {
                return this.get(_recordFields.PI_AVAILABLETYPE);
            } set pIAvailableType(value) {
                this.set(_recordFields.PI_AVAILABLETYPE, value)
            }
            get pIAvailableTypeName() { return this.getText(_recordFields.PI_AVAILABLETYPE); }
            
            get pILimit() {
                return this.get(_recordFields.PI_LIMIT);
            } set pILimit(value) {
                this.set(_recordFields.PI_LIMIT, value)
            }
            
            get pILimitCurrency() {
                return this.get(_recordFields.PI_LIMIT_CURRENCY);
            } set pILimitCurrency(value) {
                this.set(_recordFields.PI_LIMIT_CURRENCY, value)
            }
            
            get pIExpiry() {
                return this.get(_recordFields.PI_EXPIRY);
            } set pIExpiry(value) {
                this.set(_recordFields.PI_EXPIRY, value)
            }
            
            get pIInsuranceMandatory() {
                return this.get(_recordFields.PI_INSURANCE_MANDATORY);
            } set pIInsuranceMandatory(value) {
                this.set(_recordFields.PI_INSURANCE_MANDATORY, value)
            }
            
            get pIExistingFiles() {
                return this.get(_recordFields.PI_EXISTING_FILES);
            } set pIExistingFiles(value) {
                this.set(_recordFields.PI_EXISTING_FILES, value)
            }
            
            get pIUploadNewFile() {
                return this.get(_recordFields.PI_UPLOAD_NEW_FILE);
            } set pIUploadNewFile(value) {
                this.set(_recordFields.PI_UPLOAD_NEW_FILE, value)
            }
            
            get keys() {
                return this.get(_recordFields.KEYS);
            } set keys(value) {
                this.set(_recordFields.KEYS, value)
            }
            get keysName() { return this.getText(_recordFields.KEYS); }
            
            get existingFiles() {
                return this.get(_recordFields.EXISTING_FILES);
            } set existingFiles(value) {
                this.set(_recordFields.EXISTING_FILES, value)
            }
            
            get uploadNewFile() {
                return this.get(_recordFields.UPLOAD_NEW_FILE);
            } set uploadNewFile(value) {
                this.set(_recordFields.UPLOAD_NEW_FILE, value)
            }
            
            get accreditedContractorCommencement() {
                return this.get(_recordFields.ACCREDITED_CONTRACTOR_COMMENCEMENT);
            } set accreditedContractorCommencement(value) {
                this.set(_recordFields.ACCREDITED_CONTRACTOR_COMMENCEMENT, value)
            }
            
            get accreditedContractorExpiry() {
                return this.get(_recordFields.ACCREDITED_CONTRACTOR_EXPIRY);
            } set accreditedContractorExpiry(value) {
                this.set(_recordFields.ACCREDITED_CONTRACTOR_EXPIRY, value)
            }
            
            get accreditedContractorFee() {
                return this.get(_recordFields.ACCREDITED_CONTRACTOR_FEE);
            } set accreditedContractorFee(value) {
                this.set(_recordFields.ACCREDITED_CONTRACTOR_FEE, value)
            }
            
            get tLCompanyID() {
                return this.get(_recordFields.TL_COMPANY_ID);
            } set tLCompanyID(value) {
                this.set(_recordFields.TL_COMPANY_ID, value)
            }
            
            get on_LineLicencing() {
                return this.get(_recordFields.ON_LINE_LICENCING);
            } set on_LineLicencing(value) {
                this.set(_recordFields.ON_LINE_LICENCING, value)
            }
            
            get mSLADate() {
                return this.get(_recordFields.MSLA_DATE);
            } set mSLADate(value) {
                this.set(_recordFields.MSLA_DATE, value)
            }
            
            get companyNumber() {
                return this.get(_recordFields.COMPANY_NUMBER);
            } set companyNumber(value) {
                this.set(_recordFields.COMPANY_NUMBER, value)
            }
            
            get tACompanyName() {
                return this.get(_recordFields.TA_COMPANY_NAME);
            } set tACompanyName(value) {
                this.set(_recordFields.TA_COMPANY_NAME, value)
            }
            
            get registeredOffice() {
                return this.get(_recordFields.REGISTERED_OFFICE);
            } set registeredOffice(value) {
                this.set(_recordFields.REGISTERED_OFFICE, value)
            }
            
            get financeVendor() {
                return this.get(_recordFields.FINANCE_VENDOR);
            } set financeVendor(value) {
                this.set(_recordFields.FINANCE_VENDOR, value)
            }
            
            get financeVendorRef() {
                return this.get(_recordFields.FINANCE_VENDOR_REF);
            } set financeVendorRef(value) {
                this.set(_recordFields.FINANCE_VENDOR_REF, value)
            }
            
            get financeCustomer() {
                return this.get(_recordFields.FINANCE_CUSTOMER);
            } set financeCustomer(value) {
                this.set(_recordFields.FINANCE_CUSTOMER, value)
            }
            
            get financeCustomerRef() {
                return this.get(_recordFields.FINANCE_CUSTOMER_REF);
            } set financeCustomerRef(value) {
                this.set(_recordFields.FINANCE_CUSTOMER_REF, value)
            }
            
            get portalUser() {
                return this.get(_recordFields.PORTAL_USER);
            } set portalUser(value) {
                this.set(_recordFields.PORTAL_USER, value)
            }
            
            get accreditationApproved() {
                return this.get(_recordFields.ACCREDITATION_APPROVED);
            } set accreditationApproved(value) {
                this.set(_recordFields.ACCREDITATION_APPROVED, value)
            }
            
            get customerFlag() {
                return this.get(_recordFields.CUSTOMER_FLAG);
            } set customerFlag(value) {
                this.set(_recordFields.CUSTOMER_FLAG, value)
            }
            get customerFlagName() { return this.getText(_recordFields.CUSTOMER_FLAG); }
            
            get contractorFlag() {
                return this.get(_recordFields.CONTRACTOR_FLAG);
            } set contractorFlag(value) {
                this.set(_recordFields.CONTRACTOR_FLAG, value)
            }
            get contractorFlagName() { return this.getText(_recordFields.CONTRACTOR_FLAG); }
            
            get landlordFlag() {
                return this.get(_recordFields.LANDLORD_FLAG);
            } set landlordFlag(value) {
                this.set(_recordFields.LANDLORD_FLAG, value)
            }
            get landlordFlagName() { return this.getText(_recordFields.LANDLORD_FLAG); }
            
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
            PersistentRecord: OSSMTWC_Company,

            get: function (id) {
                var rec = new OSSMTWC_Company(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Company();
                return rec.select(options);
            }

        }
    });
