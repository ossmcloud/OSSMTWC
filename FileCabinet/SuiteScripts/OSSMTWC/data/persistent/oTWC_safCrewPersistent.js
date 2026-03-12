/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_saf_crew';
        var _recordFields = {
            SAF: 'custrecord_twc_saf_crew_saf',
            MEMBER: 'custrecord_twc_saf_crew_member',
            ATTEND_AS: 'custrecord_twc_saf_crew_attend_as',
        }
        var _recordFieldInfo = {
            SAF: { name: 'custrecord_twc_saf_crew_saf', type: 'select', alias: 'sAF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf,' },
            MEMBER: { name: 'custrecord_twc_saf_crew_member', type: 'select', alias: 'member', display: 'normal', mandatory: false, recordType: 'customrecord_twc_prof,' },
            ATTEND_AS: { name: 'custrecord_twc_saf_crew_attend_as', type: 'text', alias: 'attendAs', display: 'normal', mandatory: false },
        }

        class OSSMTWC_SAFCrew extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get sAF() {
                return this.get(_recordFields.SAF);
            } set sAF(value) {
                this.set(_recordFields.SAF, value)
            }
            get sAFName() { return this.getText(_recordFields.SAF); }
            
            get member() {
                return this.get(_recordFields.MEMBER);
            } set member(value) {
                this.set(_recordFields.MEMBER, value)
            }
            get memberName() { return this.getText(_recordFields.MEMBER); }
            
            get attendAs() {
                return this.get(_recordFields.ATTEND_AS);
            } set attendAs(value) {
                this.set(_recordFields.ATTEND_AS, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_SAFCrew,

            get: function (id) {
                var rec = new OSSMTWC_SAFCrew(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SAFCrew();
                return rec.select(options);
            }

        }
    });
