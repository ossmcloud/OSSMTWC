/**
 * @NApiVersion 2.1
 * @NModuleScope public
*/
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_lock';
        var _recordFields = {
            SITE: 'custrecord_twc_lock_site',
            LOCK_ID: 'custrecord_twc_lock_id',
            LOCK_LOCATION_CATEGORY: 'custrecord_twc_lock_loc_cat',
            STRUCTURE: 'custrecord_twc_lock_structure',
            ACCOMMODATION: 'custrecord_twc_lock_accom',
            GENERATOR: 'custrecord_twc_lock_generator',
            COMMENT: 'custrecord_twc_lock_comment',
            LOCK_TYPE: 'custrecord_twc_lock_type',
            LOCKEN_ACCESS_POINT_REFERENCE: 'custrecord_twc_lock_access_point_ref',
            ABLOY_REFERENCE: 'custrecord_twc_lock_abloy_ref',
            A1_SHORT: 'custrecord_twc_lock_a1_short',
            A1_LONG: 'custrecord_twc_lock_a1_long',
            B1_SHORT: 'custrecord_twc_lock_b1_short',
            B1_LONG: 'custrecord_twc_lock_b1_long',
            ABLOY_CYLINDERS: 'custrecord_twc_lock_abloy_cylinders',
            DIFFER_NUMBER: 'custrecord_twc_lock_differ_no',
            ABLOY_LUBRICATION_DATE: 'custrecord_twc_lock_abloy_lub_date',
        }
        var _recordFieldInfo = {
            SITE: { name: 'custrecord_twc_lock_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            LOCK_ID: { name: 'custrecord_twc_lock_id', type: 'text', alias: 'lockID', display: 'normal', mandatory: false },
            LOCK_LOCATION_CATEGORY: { name: 'custrecord_twc_lock_loc_cat', type: 'select', alias: 'lockLocationCategory', display: 'normal', mandatory: false, recordType: 'customrecord_twc_lock_loc_cat,' },
            STRUCTURE: { name: 'custrecord_twc_lock_structure', type: 'select', alias: 'structure', display: 'normal', mandatory: false, recordType: 'customrecord_twc_str_,' },
            ACCOMMODATION: { name: 'custrecord_twc_lock_accom', type: 'select', alias: 'accommodation', display: 'normal', mandatory: false, recordType: 'customrecord_twc_ac,' },
            GENERATOR: { name: 'custrecord_twc_lock_generator', type: 'select', alias: 'generator', display: 'normal', mandatory: false, recordType: 'customrecord_twc_gen,' },
            COMMENT: { name: 'custrecord_twc_lock_comment', type: 'text', alias: 'comment', display: 'normal', mandatory: false },
            LOCK_TYPE: { name: 'custrecord_twc_lock_type', type: 'select', alias: 'lockType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_lock_type,' },
            LOCKEN_ACCESS_POINT_REFERENCE: { name: 'custrecord_twc_lock_access_point_ref', type: 'text', alias: 'lockenAccessPointReference', display: 'normal', mandatory: false },
            ABLOY_REFERENCE: { name: 'custrecord_twc_lock_abloy_ref', type: 'text', alias: 'abloyReference', display: 'normal', mandatory: false },
            A1_SHORT: { name: 'custrecord_twc_lock_a1_short', type: 'text', alias: 'a1Short', display: 'normal', mandatory: false },
            A1_LONG: { name: 'custrecord_twc_lock_a1_long', type: 'text', alias: 'a1Long', display: 'normal', mandatory: false },
            B1_SHORT: { name: 'custrecord_twc_lock_b1_short', type: 'text', alias: 'b1Short', display: 'normal', mandatory: false },
            B1_LONG: { name: 'custrecord_twc_lock_b1_long', type: 'text', alias: 'b1Long', display: 'normal', mandatory: false },
            ABLOY_CYLINDERS: { name: 'custrecord_twc_lock_abloy_cylinders', type: 'text', alias: 'abloyCylinders', display: 'normal', mandatory: false },
            DIFFER_NUMBER: { name: 'custrecord_twc_lock_differ_no', type: 'text', alias: 'differNumber', display: 'normal', mandatory: false },
            ABLOY_LUBRICATION_DATE: { name: 'custrecord_twc_lock_abloy_lub_date', type: 'date', alias: 'abloyLubricationDate', display: 'normal', mandatory: false },
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
            
            get structure() {
                return this.get(_recordFields.STRUCTURE);
            } set structure(value) {
                this.set(_recordFields.STRUCTURE, value)
            }
            get structureName() { return this.getText(_recordFields.STRUCTURE); }
            
            get accommodation() {
                return this.get(_recordFields.ACCOMMODATION);
            } set accommodation(value) {
                this.set(_recordFields.ACCOMMODATION, value)
            }
            get accommodationName() { return this.getText(_recordFields.ACCOMMODATION); }
            
            get generator() {
                return this.get(_recordFields.GENERATOR);
            } set generator(value) {
                this.set(_recordFields.GENERATOR, value)
            }
            get generatorName() { return this.getText(_recordFields.GENERATOR); }
            
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
            
            get lockenAccessPointReference() {
                return this.get(_recordFields.LOCKEN_ACCESS_POINT_REFERENCE);
            } set lockenAccessPointReference(value) {
                this.set(_recordFields.LOCKEN_ACCESS_POINT_REFERENCE, value)
            }
            
            get abloyReference() {
                return this.get(_recordFields.ABLOY_REFERENCE);
            } set abloyReference(value) {
                this.set(_recordFields.ABLOY_REFERENCE, value)
            }
            
            get a1Short() {
                return this.get(_recordFields.A1_SHORT);
            } set a1Short(value) {
                this.set(_recordFields.A1_SHORT, value)
            }
            
            get a1Long() {
                return this.get(_recordFields.A1_LONG);
            } set a1Long(value) {
                this.set(_recordFields.A1_LONG, value)
            }
            
            get b1Short() {
                return this.get(_recordFields.B1_SHORT);
            } set b1Short(value) {
                this.set(_recordFields.B1_SHORT, value)
            }
            
            get b1Long() {
                return this.get(_recordFields.B1_LONG);
            } set b1Long(value) {
                this.set(_recordFields.B1_LONG, value)
            }
            
            get abloyCylinders() {
                return this.get(_recordFields.ABLOY_CYLINDERS);
            } set abloyCylinders(value) {
                this.set(_recordFields.ABLOY_CYLINDERS, value)
            }
            
            get differNumber() {
                return this.get(_recordFields.DIFFER_NUMBER);
            } set differNumber(value) {
                this.set(_recordFields.DIFFER_NUMBER, value)
            }
            
            get abloyLubricationDate() {
                return this.get(_recordFields.ABLOY_LUBRICATION_DATE);
            } set abloyLubricationDate(value) {
                this.set(_recordFields.ABLOY_LUBRICATION_DATE, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,

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
