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
            PART_OF_SDS: 'custrecord_twc_sds_item_part_of',
            INCLUDE_IN_SDS: 'custrecord_twc_sds_item_include',
            EQUIPMENT_ID: 'custrecord_twc_sds_item_equipment_id',
            SITE: 'custrecord_twc_sds_item_site',
            INFRASTRUCTURE: 'custrecord_twc_sds_item_infra',
            INSTALL_STATUS: 'custrecord_twc_sds_item_install_status',
            LICENSE_STATUS: 'custrecord_twc_sds_item_license_status',
            CUSTOMER: 'custrecord_twc_sds_item_cust',
            EQUIPMENT_CLASS: 'custrecord_twc_sds_item_equipment_class',
            EQUIPMENT_TYPE: 'custrecord_twc_sds_item_equipment_type',
            MAKE: 'custrecord_twc_sds_item_make',
            MODEL: 'custrecord_twc_sds_item_model',
            DESCRIPTION: 'custrecord_twc_sds_item_description',
            LENGTH_MM: 'custrecord_twc_sds_item_length',
            WIDTH_MM: 'custrecord_twc_sds_item_width',
            HEOGHTDEPTH_MM: 'custrecord_twc_sds_item_depth',
            WEIGHT: 'custrecord_twc_sds_item_weight',
            HEIGHT_ON_TOWER: 'custrecord_twc_sds_item_height_on_tower',
            AZIMUTH: 'custrecord_twc_sds_item_azimuth',
            B_END: 'custrecord_twc_sds_item_b_end',
            CUSTOMER_REF: 'custrecord_twc_sds_item_cust_ref',
            INVENTORY_FLAG: 'custrecord_twc_sds_item_inventory_flag',
            PACKAGE: 'custrecord_twc_sds_item_package',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SDS: { name: 'custrecord_twc_sds_item_parent', type: 'select', alias: 'sDS', display: 'normal', mandatory: false, recordType: 'customrecord_twc_sds' },
            EQUIPMENT: { name: 'custrecord_twc_sds_item_eq', type: 'select', alias: 'equipment', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip' },
            PART_OF_SDS: { name: 'custrecord_twc_sds_item_part_of', type: 'checkbox', alias: 'partofSDS', display: 'normal', mandatory: false },
            INCLUDE_IN_SDS: { name: 'custrecord_twc_sds_item_include', type: 'checkbox', alias: 'includeinSDS', display: 'normal', mandatory: false },
            EQUIPMENT_ID: { name: 'custrecord_twc_sds_item_equipment_id', type: 'text', alias: 'equipmentID', display: 'normal', mandatory: false },
            SITE: { name: 'custrecord_twc_sds_item_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            INFRASTRUCTURE: { name: 'custrecord_twc_sds_item_infra', type: 'select', alias: 'infrastructure', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra' },
            INSTALL_STATUS: { name: 'custrecord_twc_sds_item_install_status', type: 'select', alias: 'installStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip_install_status' },
            LICENSE_STATUS: { name: 'custrecord_twc_sds_item_license_status', type: 'select', alias: 'licenseStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip_licence_status' },
            CUSTOMER: { name: 'custrecord_twc_sds_item_cust', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            EQUIPMENT_CLASS: { name: 'custrecord_twc_sds_item_equipment_class', type: 'select', alias: 'equipmentClass', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_class' },
            EQUIPMENT_TYPE: { name: 'custrecord_twc_sds_item_equipment_type', type: 'select', alias: 'equipmentType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_eq_type' },
            MAKE: { name: 'custrecord_twc_sds_item_make', type: 'text', alias: 'make', display: 'normal', mandatory: false },
            MODEL: { name: 'custrecord_twc_sds_item_model', type: 'text', alias: 'model', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_sds_item_description', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            LENGTH_MM: { name: 'custrecord_twc_sds_item_length', type: 'integer', alias: 'lengthmm', display: 'normal', mandatory: false },
            WIDTH_MM: { name: 'custrecord_twc_sds_item_width', type: 'integer', alias: 'widthmm', display: 'normal', mandatory: false },
            HEOGHTDEPTH_MM: { name: 'custrecord_twc_sds_item_depth', type: 'integer', alias: 'heoghtDepthmm', display: 'normal', mandatory: false },
            WEIGHT: { name: 'custrecord_twc_sds_item_weight', type: 'float', alias: 'weight', display: 'normal', mandatory: false },
            HEIGHT_ON_TOWER: { name: 'custrecord_twc_sds_item_height_on_tower', type: 'float', alias: 'heightonTower', display: 'normal', mandatory: false },
            AZIMUTH: { name: 'custrecord_twc_sds_item_azimuth', type: 'float', alias: 'azimuth', display: 'normal', mandatory: false },
            B_END: { name: 'custrecord_twc_sds_item_b_end', type: 'text', alias: 'b_End', display: 'normal', mandatory: false },
            CUSTOMER_REF: { name: 'custrecord_twc_sds_item_cust_ref', type: 'text', alias: 'customerRef', display: 'normal', mandatory: false },
            INVENTORY_FLAG: { name: 'custrecord_twc_sds_item_inventory_flag', type: 'select', alias: 'inventoryFlag', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_inv_flag' },
            PACKAGE: { name: 'custrecord_twc_sds_item_package', type: 'select', alias: 'package', display: 'normal', mandatory: false, recordType: 'customrecord_twc_package' },
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
            
            get partofSDS() {
                return this.get(_recordFields.PART_OF_SDS);
            } set partofSDS(value) {
                this.set(_recordFields.PART_OF_SDS, value)
            }
            
            get includeinSDS() {
                return this.get(_recordFields.INCLUDE_IN_SDS);
            } set includeinSDS(value) {
                this.set(_recordFields.INCLUDE_IN_SDS, value)
            }
            
            get equipmentID() {
                return this.get(_recordFields.EQUIPMENT_ID);
            } set equipmentID(value) {
                this.set(_recordFields.EQUIPMENT_ID, value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get infrastructure() {
                return this.get(_recordFields.INFRASTRUCTURE);
            } set infrastructure(value) {
                this.set(_recordFields.INFRASTRUCTURE, value)
            }
            get infrastructureName() { return this.getText(_recordFields.INFRASTRUCTURE); }
            
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
            
            get customer() {
                return this.get(_recordFields.CUSTOMER);
            } set customer(value) {
                this.set(_recordFields.CUSTOMER, value)
            }
            get customerName() { return this.getText(_recordFields.CUSTOMER); }
            
            get equipmentClass() {
                return this.get(_recordFields.EQUIPMENT_CLASS);
            } set equipmentClass(value) {
                this.set(_recordFields.EQUIPMENT_CLASS, value)
            }
            get equipmentClassName() { return this.getText(_recordFields.EQUIPMENT_CLASS); }
            
            get equipmentType() {
                return this.get(_recordFields.EQUIPMENT_TYPE);
            } set equipmentType(value) {
                this.set(_recordFields.EQUIPMENT_TYPE, value)
            }
            get equipmentTypeName() { return this.getText(_recordFields.EQUIPMENT_TYPE); }
            
            get make() {
                return this.get(_recordFields.MAKE);
            } set make(value) {
                this.set(_recordFields.MAKE, value)
            }
            
            get model() {
                return this.get(_recordFields.MODEL);
            } set model(value) {
                this.set(_recordFields.MODEL, value)
            }
            
            get description() {
                return this.get(_recordFields.DESCRIPTION);
            } set description(value) {
                this.set(_recordFields.DESCRIPTION, value)
            }
            
            get lengthmm() {
                return this.get(_recordFields.LENGTH_MM);
            } set lengthmm(value) {
                this.set(_recordFields.LENGTH_MM, value)
            }
            
            get widthmm() {
                return this.get(_recordFields.WIDTH_MM);
            } set widthmm(value) {
                this.set(_recordFields.WIDTH_MM, value)
            }
            
            get heoghtDepthmm() {
                return this.get(_recordFields.HEOGHTDEPTH_MM);
            } set heoghtDepthmm(value) {
                this.set(_recordFields.HEOGHTDEPTH_MM, value)
            }
            
            get weight() {
                return this.get(_recordFields.WEIGHT);
            } set weight(value) {
                this.set(_recordFields.WEIGHT, value)
            }
            
            get heightonTower() {
                return this.get(_recordFields.HEIGHT_ON_TOWER);
            } set heightonTower(value) {
                this.set(_recordFields.HEIGHT_ON_TOWER, value)
            }
            
            get azimuth() {
                return this.get(_recordFields.AZIMUTH);
            } set azimuth(value) {
                this.set(_recordFields.AZIMUTH, value)
            }
            
            get b_End() {
                return this.get(_recordFields.B_END);
            } set b_End(value) {
                this.set(_recordFields.B_END, value)
            }
            
            get customerRef() {
                return this.get(_recordFields.CUSTOMER_REF);
            } set customerRef(value) {
                this.set(_recordFields.CUSTOMER_REF, value)
            }
            
            get inventoryFlag() {
                return this.get(_recordFields.INVENTORY_FLAG);
            } set inventoryFlag(value) {
                this.set(_recordFields.INVENTORY_FLAG, value)
            }
            get inventoryFlagName() { return this.getText(_recordFields.INVENTORY_FLAG); }
            
            get package() {
                return this.get(_recordFields.PACKAGE);
            } set package(value) {
                this.set(_recordFields.PACKAGE, value)
            }
            get packageName() { return this.getText(_recordFields.PACKAGE); }
            
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
