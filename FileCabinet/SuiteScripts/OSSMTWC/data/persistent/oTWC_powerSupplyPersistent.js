/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_pwr_sply';
        var _recordFields = {
            NAME: 'name',
            SITE: 'custrecord_twc_pwr_sply_site',
            POWER_SUPPLY_ID: 'custrecord_twc_pwr_sply_id',
            POWER_SUPPLIER: 'custrecord_twc_pwr_sply_pwr_suppler',
            POWER_SUPPLY_STATUS: 'custrecord_twc_pwr_sply_status',
            POWER_SUPPLY_TYPE: 'custrecord_twc_pwr_sply_type',
            GENERATOR_BACKUP: 'custrecord_twc_pwr_sply_gen_bakup',
            MPRN: 'custrecord_twc_pwr_sply_mprn',
            AVAILABLE_METER_SLOTS: 'custrecord_twc_pwr_sply_avail_meter_slot',
            POWER_PHASE: 'custrecord_twc_pwr_sply_pwr_phase',
            POWER_CAPACITY_KVA: 'custrecord_twc_pwr_sply_capacity_kva',
            AVAILABLE_POWER_CAPACITY_KVA: 'custrecord_twc_pwr_sply_avail_pwr_cap',
            POWER_TLM: 'custrecord_twc_pwr_sply_tlm',
            POWER_SUPPLY_COMMENT: 'custrecord_twc_pwr_sply_comment',
            POWER_READINGS: 'custrecord_twc_pwr_sply_pwr_readings',
            POWER_USER_LIST: 'custrecord_twc_pwr_sply_pwr_usr_list',
            POWER_READING_LIST: 'custrecord_twc_pwr_sply_pwr_read_list',
            POWER_SUPPLIER_REFERENCE: 'custrecord_twc_pwr_sply_supref',
            POWER_SUPPLY_NAME: 'custrecord_twc_pwr_sply_name',
            POWER_SUPPLY_ADDRESS: 'custrecord_twc_pwr_sply_addr',
            POWER_SUPPLY_TARIFF: 'custrecord_twc_pwr_sply_trf',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SITE: { name: 'custrecord_twc_pwr_sply_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            POWER_SUPPLY_ID: { name: 'custrecord_twc_pwr_sply_id', type: 'text', alias: 'powerSupplyID', display: 'normal', mandatory: false },
            POWER_SUPPLIER: { name: 'custrecord_twc_pwr_sply_pwr_suppler', type: 'select', alias: 'powerSupplier', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            POWER_SUPPLY_STATUS: { name: 'custrecord_twc_pwr_sply_status', type: 'select', alias: 'powerSupplyStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_supply_sts' },
            POWER_SUPPLY_TYPE: { name: 'custrecord_twc_pwr_sply_type', type: 'select', alias: 'powerSupplyType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_sply_type' },
            GENERATOR_BACKUP: { name: 'custrecord_twc_pwr_sply_gen_bakup', type: 'select', alias: 'generatorBackup', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra' },
            MPRN: { name: 'custrecord_twc_pwr_sply_mprn', type: 'text', alias: 'mPRN', display: 'normal', mandatory: false },
            AVAILABLE_METER_SLOTS: { name: 'custrecord_twc_pwr_sply_avail_meter_slot', type: 'integer', alias: 'availableMeterSlots', display: 'normal', mandatory: false },
            POWER_PHASE: { name: 'custrecord_twc_pwr_sply_pwr_phase', type: 'select', alias: 'powerPhase', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_phase' },
            POWER_CAPACITY_KVA: { name: 'custrecord_twc_pwr_sply_capacity_kva', type: 'integer', alias: 'powerCapacitykVA', display: 'normal', mandatory: false },
            AVAILABLE_POWER_CAPACITY_KVA: { name: 'custrecord_twc_pwr_sply_avail_pwr_cap', type: 'integer', alias: 'availablePowerCapacitykVA', display: 'normal', mandatory: false },
            POWER_TLM: { name: 'custrecord_twc_pwr_sply_tlm', type: 'select', alias: 'powerTLM', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_tlm' },
            POWER_SUPPLY_COMMENT: { name: 'custrecord_twc_pwr_sply_comment', type: 'textarea', alias: 'powerSupplyComment', display: 'normal', mandatory: false },
            POWER_READINGS: { name: 'custrecord_twc_pwr_sply_pwr_readings', type: 'select', alias: 'powerReadings', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_rdg' },
            POWER_USER_LIST: { name: 'custrecord_twc_pwr_sply_pwr_usr_list', type: 'select', alias: 'powerUserList', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_usr' },
            POWER_READING_LIST: { name: 'custrecord_twc_pwr_sply_pwr_read_list', type: 'select', alias: 'powerReadingList', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_rdg' },
            POWER_SUPPLIER_REFERENCE: { name: 'custrecord_twc_pwr_sply_supref', type: 'text', alias: 'powerSupplierReference', display: 'normal', mandatory: false },
            POWER_SUPPLY_NAME: { name: 'custrecord_twc_pwr_sply_name', type: 'text', alias: 'powerSupplyName', display: 'normal', mandatory: false },
            POWER_SUPPLY_ADDRESS: { name: 'custrecord_twc_pwr_sply_addr', type: 'textarea', alias: 'powerSupplyAddress', display: 'normal', mandatory: false },
            POWER_SUPPLY_TARIFF: { name: 'custrecord_twc_pwr_sply_trf', type: 'select', alias: 'powerSupplyTariff', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_sply_trf' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_PowerSupply extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get powerSupplyID() {
                return this.get(_recordFields.POWER_SUPPLY_ID);
            } set powerSupplyID(value) {
                this.set(_recordFields.POWER_SUPPLY_ID, value)
            }
            
            get powerSupplier() {
                return this.get(_recordFields.POWER_SUPPLIER);
            } set powerSupplier(value) {
                this.set(_recordFields.POWER_SUPPLIER, value)
            }
            get powerSupplierName() { return this.getText(_recordFields.POWER_SUPPLIER); }
            
            get powerSupplyStatus() {
                return this.get(_recordFields.POWER_SUPPLY_STATUS);
            } set powerSupplyStatus(value) {
                this.set(_recordFields.POWER_SUPPLY_STATUS, value)
            }
            get powerSupplyStatusName() { return this.getText(_recordFields.POWER_SUPPLY_STATUS); }
            
            get powerSupplyType() {
                return this.get(_recordFields.POWER_SUPPLY_TYPE);
            } set powerSupplyType(value) {
                this.set(_recordFields.POWER_SUPPLY_TYPE, value)
            }
            get powerSupplyTypeName() { return this.getText(_recordFields.POWER_SUPPLY_TYPE); }
            
            get generatorBackup() {
                return this.get(_recordFields.GENERATOR_BACKUP);
            } set generatorBackup(value) {
                this.set(_recordFields.GENERATOR_BACKUP, value)
            }
            get generatorBackupName() { return this.getText(_recordFields.GENERATOR_BACKUP); }
            
            get mPRN() {
                return this.get(_recordFields.MPRN);
            } set mPRN(value) {
                this.set(_recordFields.MPRN, value)
            }
            
            get availableMeterSlots() {
                return this.get(_recordFields.AVAILABLE_METER_SLOTS);
            } set availableMeterSlots(value) {
                this.set(_recordFields.AVAILABLE_METER_SLOTS, value)
            }
            
            get powerPhase() {
                return this.get(_recordFields.POWER_PHASE);
            } set powerPhase(value) {
                this.set(_recordFields.POWER_PHASE, value)
            }
            get powerPhaseName() { return this.getText(_recordFields.POWER_PHASE); }
            
            get powerCapacitykVA() {
                return this.get(_recordFields.POWER_CAPACITY_KVA);
            } set powerCapacitykVA(value) {
                this.set(_recordFields.POWER_CAPACITY_KVA, value)
            }
            
            get availablePowerCapacitykVA() {
                return this.get(_recordFields.AVAILABLE_POWER_CAPACITY_KVA);
            } set availablePowerCapacitykVA(value) {
                this.set(_recordFields.AVAILABLE_POWER_CAPACITY_KVA, value)
            }
            
            get powerTLM() {
                return this.get(_recordFields.POWER_TLM);
            } set powerTLM(value) {
                this.set(_recordFields.POWER_TLM, value)
            }
            get powerTLMName() { return this.getText(_recordFields.POWER_TLM); }
            
            get powerSupplyComment() {
                return this.get(_recordFields.POWER_SUPPLY_COMMENT);
            } set powerSupplyComment(value) {
                this.set(_recordFields.POWER_SUPPLY_COMMENT, value)
            }
            
            get powerReadings() {
                return this.get(_recordFields.POWER_READINGS);
            } set powerReadings(value) {
                this.set(_recordFields.POWER_READINGS, value)
            }
            get powerReadingsName() { return this.getText(_recordFields.POWER_READINGS); }
            
            get powerUserList() {
                return this.get(_recordFields.POWER_USER_LIST);
            } set powerUserList(value) {
                this.set(_recordFields.POWER_USER_LIST, value)
            }
            get powerUserListName() { return this.getText(_recordFields.POWER_USER_LIST); }
            
            get powerReadingList() {
                return this.get(_recordFields.POWER_READING_LIST);
            } set powerReadingList(value) {
                this.set(_recordFields.POWER_READING_LIST, value)
            }
            get powerReadingListName() { return this.getText(_recordFields.POWER_READING_LIST); }
            
            get powerSupplierReference() {
                return this.get(_recordFields.POWER_SUPPLIER_REFERENCE);
            } set powerSupplierReference(value) {
                this.set(_recordFields.POWER_SUPPLIER_REFERENCE, value)
            }
            
            get powerSupplyName() {
                return this.get(_recordFields.POWER_SUPPLY_NAME);
            } set powerSupplyName(value) {
                this.set(_recordFields.POWER_SUPPLY_NAME, value)
            }
            
            get powerSupplyAddress() {
                return this.get(_recordFields.POWER_SUPPLY_ADDRESS);
            } set powerSupplyAddress(value) {
                this.set(_recordFields.POWER_SUPPLY_ADDRESS, value)
            }
            
            get powerSupplyTariff() {
                return this.get(_recordFields.POWER_SUPPLY_TARIFF);
            } set powerSupplyTariff(value) {
                this.set(_recordFields.POWER_SUPPLY_TARIFF, value)
            }
            get powerSupplyTariffName() { return this.getText(_recordFields.POWER_SUPPLY_TARIFF); }
            
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
            PersistentRecord: OSSMTWC_PowerSupply,

            get: function (id) {
                var rec = new OSSMTWC_PowerSupply(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_PowerSupply();
                return rec.select(options);
            }

        }
    });
