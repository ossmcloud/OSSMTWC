/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_file_type';
        var _recordFields = {
            NAME: 'name',
            HEALTH__AND__SAFETY: 'custrecord_twc_file_type_hs',
            METHOD_STATEMENTS: 'custrecord_twc_file_type_method',
            INSURANCE: 'custrecord_twc_file_type_insurance',
            IMAGE: 'custrecord_twc_file_type_image',
            COMPLETIONRESOLUTION_IMAGE: 'custrecord_twc_file_type_completion_img',
            ALLOWED_STATUSES: 'custrecord_twc_file_type_statuses',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            HEALTH__AND__SAFETY: { name: 'custrecord_twc_file_type_hs', type: 'checkbox', alias: 'health_and_Safety', display: 'normal', mandatory: false },
            METHOD_STATEMENTS: { name: 'custrecord_twc_file_type_method', type: 'checkbox', alias: 'methodStatements', display: 'normal', mandatory: false },
            INSURANCE: { name: 'custrecord_twc_file_type_insurance', type: 'checkbox', alias: 'insurance', display: 'normal', mandatory: false },
            IMAGE: { name: 'custrecord_twc_file_type_image', type: 'checkbox', alias: 'image', display: 'normal', mandatory: false },
            COMPLETIONRESOLUTION_IMAGE: { name: 'custrecord_twc_file_type_completion_img', type: 'checkbox', alias: 'completionResolutionImage', display: 'normal', mandatory: false },
            ALLOWED_STATUSES: { name: 'custrecord_twc_file_type_statuses', type: 'multiselect', alias: 'allowedStatuses', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file_status' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_FileType extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get health_and_Safety() {
                return this.get(_recordFields.HEALTH__AND__SAFETY);
            } set health_and_Safety(value) {
                this.set(_recordFields.HEALTH__AND__SAFETY, value)
            }
            
            get methodStatements() {
                return this.get(_recordFields.METHOD_STATEMENTS);
            } set methodStatements(value) {
                this.set(_recordFields.METHOD_STATEMENTS, value)
            }
            
            get insurance() {
                return this.get(_recordFields.INSURANCE);
            } set insurance(value) {
                this.set(_recordFields.INSURANCE, value)
            }
            
            get image() {
                return this.get(_recordFields.IMAGE);
            } set image(value) {
                this.set(_recordFields.IMAGE, value)
            }
            
            get completionResolutionImage() {
                return this.get(_recordFields.COMPLETIONRESOLUTION_IMAGE);
            } set completionResolutionImage(value) {
                this.set(_recordFields.COMPLETIONRESOLUTION_IMAGE, value)
            }
            
            get allowedStatuses() {
                return this.get(_recordFields.ALLOWED_STATUSES);
            } set allowedStatuses(value) {
                this.set(_recordFields.ALLOWED_STATUSES, value)
            }
            get allowedStatusesName() { return this.getText(_recordFields.ALLOWED_STATUSES); }
            
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
            PersistentRecord: OSSMTWC_FileType,

            get: function (id) {
                var rec = new OSSMTWC_FileType(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_FileType();
                return rec.select(options);
            }

        }
    });
