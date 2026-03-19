/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_saf_action';
        var _recordFields = {
            NAME: 'name',
            SAF: 'custrecord_twc_saf_a_saf',
            SAF_ACTION_EA: 'custrecord_twc_saf_a_ea',
            SAF_ACTION_STATUS: 'custrecord_twc_saf_a_status',
            SAF_ACTION_COMPLETE: 'custrecord_twc_saf_a_complete',
            SITE_DELETE: 'custrecord_twc_saf_a_site',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SAF: { name: 'custrecord_twc_saf_a_saf', type: 'select', alias: 'sAF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf' },
            SAF_ACTION_EA: { name: 'custrecord_twc_saf_a_ea', type: 'select', alias: 'sAF_ACTIONEA', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_action' },
            SAF_ACTION_STATUS: { name: 'custrecord_twc_saf_a_status', type: 'select', alias: 'sAF_ACTIONStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf_action_status' },
            SAF_ACTION_COMPLETE: { name: 'custrecord_twc_saf_a_complete', type: 'checkbox', alias: 'sAF_ACTIONComplete', display: 'normal', mandatory: false },
            SITE_DELETE: { name: 'custrecord_twc_saf_a_site', type: 'select', alias: 'siteDELETE', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SAFAction extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get sAF() {
                return this.get(_recordFields.SAF);
            } set sAF(value) {
                this.set(_recordFields.SAF, value)
            }
            get sAFName() { return this.getText(_recordFields.SAF); }
            
            get sAF_ACTIONEA() {
                return this.get(_recordFields.SAF_ACTION_EA);
            } set sAF_ACTIONEA(value) {
                this.set(_recordFields.SAF_ACTION_EA, value)
            }
            get sAF_ACTIONEAName() { return this.getText(_recordFields.SAF_ACTION_EA); }
            
            get sAF_ACTIONStatus() {
                return this.get(_recordFields.SAF_ACTION_STATUS);
            } set sAF_ACTIONStatus(value) {
                this.set(_recordFields.SAF_ACTION_STATUS, value)
            }
            get sAF_ACTIONStatusName() { return this.getText(_recordFields.SAF_ACTION_STATUS); }
            
            get sAF_ACTIONComplete() {
                return this.get(_recordFields.SAF_ACTION_COMPLETE);
            } set sAF_ACTIONComplete(value) {
                this.set(_recordFields.SAF_ACTION_COMPLETE, value)
            }
            
            get siteDELETE() {
                return this.get(_recordFields.SITE_DELETE);
            } set siteDELETE(value) {
                this.set(_recordFields.SITE_DELETE, value)
            }
            get siteDELETEName() { return this.getText(_recordFields.SITE_DELETE); }
            
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
            PersistentRecord: OSSMTWC_SAFAction,

            get: function (id) {
                var rec = new OSSMTWC_SAFAction(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SAFAction();
                return rec.select(options);
            }

        }
    });
