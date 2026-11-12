/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_profilec';
        var _recordFields = {
            NAME: 'name',
            PROFILE: 'custrecord_twc_profilec_parent',
            COMPANY: 'custrecord_twc_profilec_company',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            PROFILE: { name: 'custrecord_twc_profilec_parent', type: 'select', alias: 'profile', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof' },
            COMPANY: { name: 'custrecord_twc_profilec_company', type: 'select', alias: 'company', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_ProfileCompany extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get profile() {
                return this.get(_recordFields.PROFILE);
            } set profile(value) {
                this.set(_recordFields.PROFILE, value)
            }
            get profileName() { return this.getText(_recordFields.PROFILE); }
            
            get company() {
                return this.get(_recordFields.COMPANY);
            } set company(value) {
                this.set(_recordFields.COMPANY, value)
            }
            get companyName() { return this.getText(_recordFields.COMPANY); }
            
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
            PersistentRecord: OSSMTWC_ProfileCompany,

            get: function (id, staticLoad) {
                var rec = new OSSMTWC_ProfileCompany(id, staticLoad);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_ProfileCompany();
                return rec.select(options);
            }

        }
    });
