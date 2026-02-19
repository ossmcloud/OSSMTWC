/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_lock';
        var _recordFields = {
            SITE: 'custrecord_twc_lock_site',
            LOCK_ID: 'custrecord_twc_lock_id',
            LOCK_LOCATION_CATEGORY: 'custrecord_twc_lock_loc_cat',
            SECURED_INFRASTRUCTURE: 'custrecord_twc_lock_infra',
            COMMENT: 'custrecord_twc_lock_comment',
            LOCK_TYPE: 'custrecord_twc_lock_type',
            LOCK_CONFIG: 'custrecord_twc_lock_config',
            LOCKEN_LOCK_NAME: 'custrecord_twc_lock_locken_lock_name',
            LOCKEN_ACCESS_POINT_REFERENCE: 'custrecord_twc_lock_access_point_ref',
            OTHER_REFERENCE: 'custrecord_twc_lock_other_ref',
        }
        var _recordFieldInfo = {
            SITE: { name: 'custrecord_twc_lock_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            LOCK_ID: { name: 'custrecord_twc_lock_id', type: 'text', alias: 'lockID', display: 'normal', mandatory: false },
            LOCK_LOCATION_CATEGORY: { name: 'custrecord_twc_lock_loc_cat', type: 'select', alias: 'lockLocationCategory', display: 'normal', mandatory: false, recordType: 'customrecord_twc_lock_loc_cat,' },
            SECURED_INFRASTRUCTURE: { name: 'custrecord_twc_lock_infra', type: 'select', alias: 'securedInfrastructure', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra,' },
            COMMENT: { name: 'custrecord_twc_lock_comment', type: 'text', alias: 'comment', display: 'normal', mandatory: false },
            LOCK_TYPE: { name: 'custrecord_twc_lock_type', type: 'select', alias: 'lockType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_lock_type,' },
            LOCK_CONFIG: { name: 'custrecord_twc_lock_config', type: 'select', alias: 'lockConfig', display: 'normal', mandatory: false, recordType: 'customrecord_twc_lock_config_type,' },
            LOCKEN_LOCK_NAME: { name: 'custrecord_twc_lock_locken_lock_name', type: 'text', alias: 'lockenLockName', display: 'normal', mandatory: false },
            LOCKEN_ACCESS_POINT_REFERENCE: { name: 'custrecord_twc_lock_access_point_ref', type: 'text', alias: 'lockenAccessPointReference', display: 'normal', mandatory: false },
            OTHER_REFERENCE: { name: 'custrecord_twc_lock_other_ref', type: 'text', alias: 'otherReference', display: 'normal', mandatory: false },
        }

        class OSSMTWC_Lock extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get lockID() {
                return this.get(_recordFields.LOCK_ID);
            } set lockID(value) {
                this.set(_recordFields.LOCK_ID, value)
            }
            
            get lockLocationCategory() {
                return this.get(_recordFields.LOCK_LOCATION_CATEGORY);
            } set lockLocationCategory(value) {
                this.set(_recordFields.LOCK_LOCATION_CATEGORY, value)
            }
            get lockLocationCategoryName() { return this.getText(_recordFields.LOCK_LOCATION_CATEGORY); }
            
            get securedInfrastructure() {
                return this.get(_recordFields.SECURED_INFRASTRUCTURE);
            } set securedInfrastructure(value) {
                this.set(_recordFields.SECURED_INFRASTRUCTURE, value)
            }
            get securedInfrastructureName() { return this.getText(_recordFields.SECURED_INFRASTRUCTURE); }
            
            get comment() {
                return this.get(_recordFields.COMMENT);
            } set comment(value) {
                this.set(_recordFields.COMMENT, value)
            }
            
            get lockType() {
                return this.get(_recordFields.LOCK_TYPE);
            } set lockType(value) {
                this.set(_recordFields.LOCK_TYPE, value)
            }
            get lockTypeName() { return this.getText(_recordFields.LOCK_TYPE); }
            
            get lockConfig() {
                return this.get(_recordFields.LOCK_CONFIG);
            } set lockConfig(value) {
                this.set(_recordFields.LOCK_CONFIG, value)
            }
            get lockConfigName() { return this.getText(_recordFields.LOCK_CONFIG); }
            
            get lockenLockName() {
                return this.get(_recordFields.LOCKEN_LOCK_NAME);
            } set lockenLockName(value) {
                this.set(_recordFields.LOCKEN_LOCK_NAME, value)
            }
            
            get lockenAccessPointReference() {
                return this.get(_recordFields.LOCKEN_ACCESS_POINT_REFERENCE);
            } set lockenAccessPointReference(value) {
                this.set(_recordFields.LOCKEN_ACCESS_POINT_REFERENCE, value)
            }
            
            get otherReference() {
                return this.get(_recordFields.OTHER_REFERENCE);
            } set otherReference(value) {
                this.set(_recordFields.OTHER_REFERENCE, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_Lock,

            get: function (id) {
                var rec = new OSSMTWC_Lock(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Lock();
                return rec.select(options);
            }

        }
    });
