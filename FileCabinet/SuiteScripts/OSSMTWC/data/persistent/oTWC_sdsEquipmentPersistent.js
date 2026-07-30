/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_sds_item';
        var _recordFields = {
            NAME: 'name',
            SDS: 'custrecord_twc_sds_item_parent',
            EQUIPMENT: 'custrecord_twc_sds_item_eq',
            INSTALL_STATUS: 'custrecord_twc_sds_item_install_status',
            LICENSE_STATUS: 'custrecord_twc_sds_item_license_status',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SDS: { name: 'custrecord_twc_sds_item_parent', type: 'select', alias: 'sDS', display: 'normal', mandatory: false, recordType: 'customrecord_twc_sds' },
            EQUIPMENT: { name: 'custrecord_twc_sds_item_eq', type: 'select', alias: 'equipment', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip' },
            INSTALL_STATUS: { name: 'custrecord_twc_sds_item_install_status', type: 'select', alias: 'installStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip_install_status' },
            LICENSE_STATUS: { name: 'custrecord_twc_sds_item_license_status', type: 'select', alias: 'licenseStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip_licence_status' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SDSEquipment extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get sDS() {
                return this.get(_recordFields.SDS);
            } set sDS(value) {
                this.set(_recordFields.SDS, value)
            }
            get sDSName() { return this.getText(_recordFields.SDS); }
            
            get equipment() {
                return this.get(_recordFields.EQUIPMENT);
            } set equipment(value) {
                this.set(_recordFields.EQUIPMENT, value)
            }
            get equipmentName() { return this.getText(_recordFields.EQUIPMENT); }
            
            get installStatus() {
                return this.get(_recordFields.INSTALL_STATUS);
            } set installStatus(value) {
                this.set(_recordFields.INSTALL_STATUS, value)
            }
            get installStatusName() { return this.getText(_recordFields.INSTALL_STATUS); }
            
            get licenseStatus() {
                return this.get(_recordFields.LICENSE_STATUS);
            } set licenseStatus(value) {
                this.set(_recordFields.LICENSE_STATUS, value)
            }
            get licenseStatusName() { return this.getText(_recordFields.LICENSE_STATUS); }
            
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
            PersistentRecord: OSSMTWC_SDSEquipment,

            get: function (id) {
                var rec = new OSSMTWC_SDSEquipment(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SDSEquipment();
                return rec.select(options);
            }

        }
    });
