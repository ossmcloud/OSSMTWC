/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_role_perm';
        var _recordFields = {
            ROLE: 'custrecord_twc_role_perm_role',
            FEATURE: 'custrecord_twc_role_perm_feat',
            PERMISSION_LEVEL: 'custrecord_twc_role_perm_lvl',
            OWN_RECORDS_ONLY: 'custrecord_twc_role_perm_own',
        }
        var _recordFieldInfo = {
            ROLE: { name: 'custrecord_twc_role_perm_role', type: 'select', alias: 'role', display: 'normal', mandatory: false, recordType: 'customrecord_twc_role,' },
            FEATURE: { name: 'custrecord_twc_role_perm_feat', type: 'select', alias: 'feature', display: 'normal', mandatory: false, recordType: 'customrecord_twc_role_feat,' },
            PERMISSION_LEVEL: { name: 'custrecord_twc_role_perm_lvl', type: 'integer', alias: 'permissionLevel', display: 'normal', mandatory: false },
            OWN_RECORDS_ONLY: { name: 'custrecord_twc_role_perm_own', type: 'checkbox', alias: 'ownRecordsOnly', display: 'normal', mandatory: false },
        }

        class OSSMTWC_RolePermission extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get role() {
                return this.get(_recordFields.ROLE);
            } set role(value) {
                this.set(_recordFields.ROLE, value)
            }
            get roleName() { return this.getText(_recordFields.ROLE); }
            
            get feature() {
                return this.get(_recordFields.FEATURE);
            } set feature(value) {
                this.set(_recordFields.FEATURE, value)
            }
            get featureName() { return this.getText(_recordFields.FEATURE); }
            
            get permissionLevel() {
                return this.get(_recordFields.PERMISSION_LEVEL);
            } set permissionLevel(value) {
                this.set(_recordFields.PERMISSION_LEVEL, value)
            }
            
            get ownRecordsOnly() {
                return this.get(_recordFields.OWN_RECORDS_ONLY);
            } set ownRecordsOnly(value) {
                this.set(_recordFields.OWN_RECORDS_ONLY, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,

            get: function (id) {
                var rec = new OSSMTWC_RolePermission(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_RolePermission();
                return rec.select(options);
            }

        }
    });
