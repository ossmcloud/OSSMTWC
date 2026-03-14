/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_prof';
        var _recordFields = {
            NAME: 'name',
            RADIX_PROFILE_TABLE_ENTRY_NUMBER: 'custrecord_twc_prof_radix_entry_num',
            COMPANY: 'custrecord_twc_prof_company',
            ACCREDITATION_STATUS: 'custrecord_twc_prof_accred_status',
            ACCREDITATION_STATUS_COMMENT: 'custrecord_twc_prof_accred_comment',
            ACCREDITATION_SUBMITTED: 'custrecord_twc_prof_accred_submitted',
            ACCREDITATION_STATUS_CHANGE_DATE: 'custrecord_twc_prof_accred_sts_date',
            COMMENTS: 'custrecord_twc_prof_comments',
            E_MAIL: 'custrecord_twc_prof_email',
            USERNAME: 'custrecord_twc_prof_username',
            PHONE: 'custrecord_twc_prof_phone',
            POSITION: 'custrecord_twc_prof_position',
            EXPERIENCE: 'custrecord_twc_prof_experience',
            ENSUP_CARD: 'custrecord_twc_prof_ensup_card',
            TL_KEYS_ASSIGNED: 'custrecord_twc_prof_tl_key_assigned',
            SAFE_PASS_ID: 'custrecord_twc_prof_safe_pass_id',
            SAFE_PASS_EXPIRY: 'custrecord_twc_prof_safe_pass_expiry',
            PICW_ACCEPTABLE: 'custrecord_twc_prof_picw_acceptable',
            SAF_AVAILABLE: 'custrecord_twc_prof_saf_available',
            ATHLONE_APPROVED: 'custrecord_twc_prof_athlone_approved',
            WORKING_ON_BEHALF: 'custrecord_twc_prof_wkg_on_behalf',
            CLIMBER_CERTIFIED_STATUS: 'custrecord_twc_prof_climber_cert_sts',
            CLIMBER_FILENAME: 'custrecord_twc_prof_climber_filename',
            CLIMBER_CERTIFIED_EXPIRY: 'custrecord_twc_prof_climber_cert_exp',
            RESCUE_CERTIFIED_STATUS: 'custrecord_twc_prof_rescue_cert_sts',
            RESCUE_FILENAME: 'custrecord_twc_prof_rescue_filename',
            RESCUE_CERTIFIED_EXPIRY: 'custrecord_twc_prof_rescue_cert_exp',
            RF_CERTIFIED_STATUS: 'custrecord_twc_prof_rf_cert_sts',
            RF_FILENAME: 'custrecord_twc_prof_rf_filename',
            RF_CERTIFIED_EXPIRY: 'custrecord_twc_prof_rf_cert_expiry',
            ROOFTOP_CERTIFIED_STATUS: 'custrecord_twc_prof_rooftop_cert_sts',
            ROOFTOP_FILENAME: 'custrecord_twc_prof_rooftop_filename',
            ROOFTOP_CERTIFIED_EXPIRY: 'custrecord_twc_prof_rooftop_cert_exp',
            ELECTRICIAN_CERTIFIED_STATUS: 'custrecord_twc_prof_elec_cert_sts',
            ELECTRICIAN_FILENAME: 'custrecord_twc_prof_elec_filename',
            ELECTRICIAN_CERTIFIED_EXPIRY: 'custrecord_twc_prof_elec_cert_exp',
            DRONE_CERTIFIED_STATUS: 'custrecord_twc_prof_drone_cert_sts',
            DRONE_FILENAME: 'custrecord_twc_prof_drone_filename',
            DRONE_CERTIFIED_EXPIRY: 'custrecord_twc_prof_drone_cert_exp',
            AGENT_PASSES: 'custrecord_twc_prof_agent_passes',
            TL_PROFILE_ID: 'custrecord_twc_prof_tl_profile_id',
            OVERRIDE_PERMISSIONS: 'custrecord_twc_prof_override_perm',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            RADIX_PROFILE_TABLE_ENTRY_NUMBER: { name: 'custrecord_twc_prof_radix_entry_num', type: 'integer', alias: 'rADIXProfileTableentrynumber', display: 'normal', mandatory: false },
            COMPANY: { name: 'custrecord_twc_prof_company', type: 'select', alias: 'company', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            ACCREDITATION_STATUS: { name: 'custrecord_twc_prof_accred_status', type: 'select', alias: 'accreditationStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof_accred_status' },
            ACCREDITATION_STATUS_COMMENT: { name: 'custrecord_twc_prof_accred_comment', type: 'text', alias: 'accreditationStatusComment', display: 'normal', mandatory: false },
            ACCREDITATION_SUBMITTED: { name: 'custrecord_twc_prof_accred_submitted', type: 'date', alias: 'accreditationSubmitted', display: 'normal', mandatory: false },
            ACCREDITATION_STATUS_CHANGE_DATE: { name: 'custrecord_twc_prof_accred_sts_date', type: 'date', alias: 'accreditationStatusChangeDate', display: 'normal', mandatory: false },
            COMMENTS: { name: 'custrecord_twc_prof_comments', type: 'text', alias: 'comments', display: 'normal', mandatory: false },
            E_MAIL: { name: 'custrecord_twc_prof_email', type: 'text', alias: 'e_mail', display: 'normal', mandatory: false },
            USERNAME: { name: 'custrecord_twc_prof_username', type: 'select', alias: 'username', display: 'normal', mandatory: false, recordType: '-9' },
            PHONE: { name: 'custrecord_twc_prof_phone', type: 'text', alias: 'phone', display: 'normal', mandatory: false },
            POSITION: { name: 'custrecord_twc_prof_position', type: 'text', alias: 'position', display: 'normal', mandatory: false },
            EXPERIENCE: { name: 'custrecord_twc_prof_experience', type: 'text', alias: 'experience', display: 'normal', mandatory: false },
            ENSUP_CARD: { name: 'custrecord_twc_prof_ensup_card', type: 'text', alias: 'eNSUPCard', display: 'normal', mandatory: false },
            TL_KEYS_ASSIGNED: { name: 'custrecord_twc_prof_tl_key_assigned', type: 'select', alias: 'tLKeysAssigned', display: 'normal', mandatory: false, recordType: 'customrecord_twc_track_key' },
            SAFE_PASS_ID: { name: 'custrecord_twc_prof_safe_pass_id', type: 'text', alias: 'safePassID', display: 'normal', mandatory: false },
            SAFE_PASS_EXPIRY: { name: 'custrecord_twc_prof_safe_pass_expiry', type: 'date', alias: 'safePassExpiry', display: 'normal', mandatory: false },
            PICW_ACCEPTABLE: { name: 'custrecord_twc_prof_picw_acceptable', type: 'checkbox', alias: 'pICWAcceptable', display: 'normal', mandatory: false },
            SAF_AVAILABLE: { name: 'custrecord_twc_prof_saf_available', type: 'checkbox', alias: 'sAFAvailable', display: 'normal', mandatory: false },
            ATHLONE_APPROVED: { name: 'custrecord_twc_prof_athlone_approved', type: 'checkbox', alias: 'athloneApproved', display: 'normal', mandatory: false },
            WORKING_ON_BEHALF: { name: 'custrecord_twc_prof_wkg_on_behalf', type: 'text', alias: 'workingonBehalf', display: 'normal', mandatory: false },
            CLIMBER_CERTIFIED_STATUS: { name: 'custrecord_twc_prof_climber_cert_sts', type: 'select', alias: 'climberCertifiedStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            CLIMBER_FILENAME: { name: 'custrecord_twc_prof_climber_filename', type: 'document', alias: 'climberFilename', display: 'normal', mandatory: false },
            CLIMBER_CERTIFIED_EXPIRY: { name: 'custrecord_twc_prof_climber_cert_exp', type: 'date', alias: 'climberCertifiedExpiry', display: 'normal', mandatory: false },
            RESCUE_CERTIFIED_STATUS: { name: 'custrecord_twc_prof_rescue_cert_sts', type: 'select', alias: 'rescueCertifiedStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            RESCUE_FILENAME: { name: 'custrecord_twc_prof_rescue_filename', type: 'document', alias: 'rescueFilename', display: 'normal', mandatory: false },
            RESCUE_CERTIFIED_EXPIRY: { name: 'custrecord_twc_prof_rescue_cert_exp', type: 'date', alias: 'rescueCertifiedExpiry', display: 'normal', mandatory: false },
            RF_CERTIFIED_STATUS: { name: 'custrecord_twc_prof_rf_cert_sts', type: 'select', alias: 'rFCertifiedStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            RF_FILENAME: { name: 'custrecord_twc_prof_rf_filename', type: 'document', alias: 'rFFilename', display: 'normal', mandatory: false },
            RF_CERTIFIED_EXPIRY: { name: 'custrecord_twc_prof_rf_cert_expiry', type: 'date', alias: 'rFCertifiedExpiry', display: 'normal', mandatory: false },
            ROOFTOP_CERTIFIED_STATUS: { name: 'custrecord_twc_prof_rooftop_cert_sts', type: 'select', alias: 'rooftopCertifiedStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            ROOFTOP_FILENAME: { name: 'custrecord_twc_prof_rooftop_filename', type: 'document', alias: 'rooftopFilename', display: 'normal', mandatory: false },
            ROOFTOP_CERTIFIED_EXPIRY: { name: 'custrecord_twc_prof_rooftop_cert_exp', type: 'date', alias: 'rooftopCertifiedExpiry', display: 'normal', mandatory: false },
            ELECTRICIAN_CERTIFIED_STATUS: { name: 'custrecord_twc_prof_elec_cert_sts', type: 'select', alias: 'electricianCertifiedStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            ELECTRICIAN_FILENAME: { name: 'custrecord_twc_prof_elec_filename', type: 'document', alias: 'electricianFilename', display: 'normal', mandatory: false },
            ELECTRICIAN_CERTIFIED_EXPIRY: { name: 'custrecord_twc_prof_elec_cert_exp', type: 'date', alias: 'electricianCertifiedExpiry', display: 'normal', mandatory: false },
            DRONE_CERTIFIED_STATUS: { name: 'custrecord_twc_prof_drone_cert_sts', type: 'select', alias: 'droneCertifiedStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_no_active_options' },
            DRONE_FILENAME: { name: 'custrecord_twc_prof_drone_filename', type: 'document', alias: 'droneFilename', display: 'normal', mandatory: false },
            DRONE_CERTIFIED_EXPIRY: { name: 'custrecord_twc_prof_drone_cert_exp', type: 'date', alias: 'droneCertifiedExpiry', display: 'normal', mandatory: false },
            AGENT_PASSES: { name: 'custrecord_twc_prof_agent_passes', type: 'select', alias: 'agentPasses', display: 'normal', mandatory: false, recordType: 'customrecord_twc_profile_agent_passes_o' },
            TL_PROFILE_ID: { name: 'custrecord_twc_prof_tl_profile_id', type: 'text', alias: 'tLProfileID', display: 'normal', mandatory: false },
            OVERRIDE_PERMISSIONS: { name: 'custrecord_twc_prof_override_perm', type: 'checkbox', alias: 'overridePermissions', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_Profile extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get rADIXProfileTableentrynumber() {
                return this.get(_recordFields.RADIX_PROFILE_TABLE_ENTRY_NUMBER);
            } set rADIXProfileTableentrynumber(value) {
                this.set(_recordFields.RADIX_PROFILE_TABLE_ENTRY_NUMBER, value)
            }
            
            get company() {
                return this.get(_recordFields.COMPANY);
            } set company(value) {
                this.set(_recordFields.COMPANY, value)
            }
            get companyName() { return this.getText(_recordFields.COMPANY); }
            
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
            
            get comments() {
                return this.get(_recordFields.COMMENTS);
            } set comments(value) {
                this.set(_recordFields.COMMENTS, value)
            }
            
            get e_mail() {
                return this.get(_recordFields.E_MAIL);
            } set e_mail(value) {
                this.set(_recordFields.E_MAIL, value)
            }
            
            get username() {
                return this.get(_recordFields.USERNAME);
            } set username(value) {
                this.set(_recordFields.USERNAME, value)
            }
            get usernameName() { return this.getText(_recordFields.USERNAME); }
            
            get phone() {
                return this.get(_recordFields.PHONE);
            } set phone(value) {
                this.set(_recordFields.PHONE, value)
            }
            
            get position() {
                return this.get(_recordFields.POSITION);
            } set position(value) {
                this.set(_recordFields.POSITION, value)
            }
            
            get experience() {
                return this.get(_recordFields.EXPERIENCE);
            } set experience(value) {
                this.set(_recordFields.EXPERIENCE, value)
            }
            
            get eNSUPCard() {
                return this.get(_recordFields.ENSUP_CARD);
            } set eNSUPCard(value) {
                this.set(_recordFields.ENSUP_CARD, value)
            }
            
            get tLKeysAssigned() {
                return this.get(_recordFields.TL_KEYS_ASSIGNED);
            } set tLKeysAssigned(value) {
                this.set(_recordFields.TL_KEYS_ASSIGNED, value)
            }
            get tLKeysAssignedName() { return this.getText(_recordFields.TL_KEYS_ASSIGNED); }
            
            get safePassID() {
                return this.get(_recordFields.SAFE_PASS_ID);
            } set safePassID(value) {
                this.set(_recordFields.SAFE_PASS_ID, value)
            }
            
            get safePassExpiry() {
                return this.get(_recordFields.SAFE_PASS_EXPIRY);
            } set safePassExpiry(value) {
                this.set(_recordFields.SAFE_PASS_EXPIRY, value)
            }
            
            get pICWAcceptable() {
                return this.get(_recordFields.PICW_ACCEPTABLE);
            } set pICWAcceptable(value) {
                this.set(_recordFields.PICW_ACCEPTABLE, value)
            }
            
            get sAFAvailable() {
                return this.get(_recordFields.SAF_AVAILABLE);
            } set sAFAvailable(value) {
                this.set(_recordFields.SAF_AVAILABLE, value)
            }
            
            get athloneApproved() {
                return this.get(_recordFields.ATHLONE_APPROVED);
            } set athloneApproved(value) {
                this.set(_recordFields.ATHLONE_APPROVED, value)
            }
            
            get workingonBehalf() {
                return this.get(_recordFields.WORKING_ON_BEHALF);
            } set workingonBehalf(value) {
                this.set(_recordFields.WORKING_ON_BEHALF, value)
            }
            
            get climberCertifiedStatus() {
                return this.get(_recordFields.CLIMBER_CERTIFIED_STATUS);
            } set climberCertifiedStatus(value) {
                this.set(_recordFields.CLIMBER_CERTIFIED_STATUS, value)
            }
            get climberCertifiedStatusName() { return this.getText(_recordFields.CLIMBER_CERTIFIED_STATUS); }
            
            get climberFilename() {
                return this.get(_recordFields.CLIMBER_FILENAME);
            } set climberFilename(value) {
                this.set(_recordFields.CLIMBER_FILENAME, value)
            }
            
            get climberCertifiedExpiry() {
                return this.get(_recordFields.CLIMBER_CERTIFIED_EXPIRY);
            } set climberCertifiedExpiry(value) {
                this.set(_recordFields.CLIMBER_CERTIFIED_EXPIRY, value)
            }
            
            get rescueCertifiedStatus() {
                return this.get(_recordFields.RESCUE_CERTIFIED_STATUS);
            } set rescueCertifiedStatus(value) {
                this.set(_recordFields.RESCUE_CERTIFIED_STATUS, value)
            }
            get rescueCertifiedStatusName() { return this.getText(_recordFields.RESCUE_CERTIFIED_STATUS); }
            
            get rescueFilename() {
                return this.get(_recordFields.RESCUE_FILENAME);
            } set rescueFilename(value) {
                this.set(_recordFields.RESCUE_FILENAME, value)
            }
            
            get rescueCertifiedExpiry() {
                return this.get(_recordFields.RESCUE_CERTIFIED_EXPIRY);
            } set rescueCertifiedExpiry(value) {
                this.set(_recordFields.RESCUE_CERTIFIED_EXPIRY, value)
            }
            
            get rFCertifiedStatus() {
                return this.get(_recordFields.RF_CERTIFIED_STATUS);
            } set rFCertifiedStatus(value) {
                this.set(_recordFields.RF_CERTIFIED_STATUS, value)
            }
            get rFCertifiedStatusName() { return this.getText(_recordFields.RF_CERTIFIED_STATUS); }
            
            get rFFilename() {
                return this.get(_recordFields.RF_FILENAME);
            } set rFFilename(value) {
                this.set(_recordFields.RF_FILENAME, value)
            }
            
            get rFCertifiedExpiry() {
                return this.get(_recordFields.RF_CERTIFIED_EXPIRY);
            } set rFCertifiedExpiry(value) {
                this.set(_recordFields.RF_CERTIFIED_EXPIRY, value)
            }
            
            get rooftopCertifiedStatus() {
                return this.get(_recordFields.ROOFTOP_CERTIFIED_STATUS);
            } set rooftopCertifiedStatus(value) {
                this.set(_recordFields.ROOFTOP_CERTIFIED_STATUS, value)
            }
            get rooftopCertifiedStatusName() { return this.getText(_recordFields.ROOFTOP_CERTIFIED_STATUS); }
            
            get rooftopFilename() {
                return this.get(_recordFields.ROOFTOP_FILENAME);
            } set rooftopFilename(value) {
                this.set(_recordFields.ROOFTOP_FILENAME, value)
            }
            
            get rooftopCertifiedExpiry() {
                return this.get(_recordFields.ROOFTOP_CERTIFIED_EXPIRY);
            } set rooftopCertifiedExpiry(value) {
                this.set(_recordFields.ROOFTOP_CERTIFIED_EXPIRY, value)
            }
            
            get electricianCertifiedStatus() {
                return this.get(_recordFields.ELECTRICIAN_CERTIFIED_STATUS);
            } set electricianCertifiedStatus(value) {
                this.set(_recordFields.ELECTRICIAN_CERTIFIED_STATUS, value)
            }
            get electricianCertifiedStatusName() { return this.getText(_recordFields.ELECTRICIAN_CERTIFIED_STATUS); }
            
            get electricianFilename() {
                return this.get(_recordFields.ELECTRICIAN_FILENAME);
            } set electricianFilename(value) {
                this.set(_recordFields.ELECTRICIAN_FILENAME, value)
            }
            
            get electricianCertifiedExpiry() {
                return this.get(_recordFields.ELECTRICIAN_CERTIFIED_EXPIRY);
            } set electricianCertifiedExpiry(value) {
                this.set(_recordFields.ELECTRICIAN_CERTIFIED_EXPIRY, value)
            }
            
            get droneCertifiedStatus() {
                return this.get(_recordFields.DRONE_CERTIFIED_STATUS);
            } set droneCertifiedStatus(value) {
                this.set(_recordFields.DRONE_CERTIFIED_STATUS, value)
            }
            get droneCertifiedStatusName() { return this.getText(_recordFields.DRONE_CERTIFIED_STATUS); }
            
            get droneFilename() {
                return this.get(_recordFields.DRONE_FILENAME);
            } set droneFilename(value) {
                this.set(_recordFields.DRONE_FILENAME, value)
            }
            
            get droneCertifiedExpiry() {
                return this.get(_recordFields.DRONE_CERTIFIED_EXPIRY);
            } set droneCertifiedExpiry(value) {
                this.set(_recordFields.DRONE_CERTIFIED_EXPIRY, value)
            }
            
            get agentPasses() {
                return this.get(_recordFields.AGENT_PASSES);
            } set agentPasses(value) {
                this.set(_recordFields.AGENT_PASSES, value)
            }
            get agentPassesName() { return this.getText(_recordFields.AGENT_PASSES); }
            
            get tLProfileID() {
                return this.get(_recordFields.TL_PROFILE_ID);
            } set tLProfileID(value) {
                this.set(_recordFields.TL_PROFILE_ID, value)
            }
            
            get overridePermissions() {
                return this.get(_recordFields.OVERRIDE_PERMISSIONS);
            } set overridePermissions(value) {
                this.set(_recordFields.OVERRIDE_PERMISSIONS, value)
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
            PersistentRecord: OSSMTWC_Profile,

            get: function (id) {
                var rec = new OSSMTWC_Profile(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Profile();
                return rec.select(options);
            }

        }
    });
