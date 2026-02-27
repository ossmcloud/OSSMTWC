/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_pwr_sply';
        var _recordFields = {
            SITE: 'custrecord_twc_pwr_sply_site',
            POWER_SUPPLY_ID: 'custrecord_twc_pwr_sply_id',
            POWER_SUPPLER: 'custrecord_twc_pwr_sply_pwr_suppler',
            POWER_SUPPLY_STATUS: 'custrecord_twc_pwr_sply_status',
            POWER_SUPPLIER_TYPE: 'custrecord_twc_pwr_sply_type',
            POWER_SUPPLY_CATEGORY: 'custrecord_twc_pwr_sply_category',
            GENERATOR_BACKUP: 'custrecord_twc_pwr_sply_gen_bakup',
            MPRN: 'custrecord_twc_pwr_sply_mprn',
            METER_NUMBER: 'custrecord_twc_pwr_sply_meter_no',
            METER_LOCATION: 'custrecord_twc_pwr_sply_meter_loc',
            METER_MULTIPLIER: 'custrecord_twc_pwr_sply_mete_mul',
            AVAILABLE_METER_SLOTS: 'custrecord_twc_pwr_sply_avail_meter_slot',
            POWER_PHASE: 'custrecord_twc_pwr_sply_pwr_phase',
            POWER_CAPACITY_KVA: 'custrecord_twc_pwr_sply_capacity_kva',
            AVAILABLE_POWER_CAPACITY_KVA: 'custrecord_twc_pwr_sply_avail_pwr_cap',
            POWER_BEING_USED: 'custrecord_twc_pwr_sply_being_used',
            POWER_TLM: 'custrecord_twc_pwr_sply_tlm',
            POWER_SUPPLIER_MUST_READ_METER: 'custrecord_twc_pwr_sply_must_read_meter',
            NEXT_METER_READING_DATE: 'custrecord_twc_pwr_sply_nxt_mtr_rdg_date',
            COMMENT: 'custrecord_twc_pwr_sply_comment',
            POWER_READINGS: 'custrecord_twc_pwr_sply_pwr_readings',
            POWER_USER_LIST: 'custrecord_twc_pwr_sply_pwr_usr_list',
            POWER_READING_LIST: 'custrecord_twc_pwr_sply_pwr_read_list',
        }
        var _recordFieldInfo = {
            SITE: { name: 'custrecord_twc_pwr_sply_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            POWER_SUPPLY_ID: { name: 'custrecord_twc_pwr_sply_id', type: 'text', alias: 'powerSupplyID', display: 'normal', mandatory: false },
            POWER_SUPPLER: { name: 'custrecord_twc_pwr_sply_pwr_suppler', type: 'select', alias: 'powerSuppler', display: 'normal', mandatory: false, recordType: '-2' },
            POWER_SUPPLY_STATUS: { name: 'custrecord_twc_pwr_sply_status', type: 'select', alias: 'powerSupplyStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_supply_sts,' },
            POWER_SUPPLIER_TYPE: { name: 'custrecord_twc_pwr_sply_type', type: 'select', alias: 'powerSupplierType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_sply_type,' },
            POWER_SUPPLY_CATEGORY: { name: 'custrecord_twc_pwr_sply_category', type: 'select', alias: 'powerSupplyCategory', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_sply_category,' },
            GENERATOR_BACKUP: { name: 'custrecord_twc_pwr_sply_gen_bakup', type: 'select', alias: 'generatorBackup', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra,' },
            MPRN: { name: 'custrecord_twc_pwr_sply_mprn', type: 'text', alias: 'mPRN', display: 'normal', mandatory: false },
            METER_NUMBER: { name: 'custrecord_twc_pwr_sply_meter_no', type: 'text', alias: 'meterNumber', display: 'normal', mandatory: false },
            METER_LOCATION: { name: 'custrecord_twc_pwr_sply_meter_loc', type: 'text', alias: 'meterLocation', display: 'normal', mandatory: false },
            METER_MULTIPLIER: { name: 'custrecord_twc_pwr_sply_mete_mul', type: 'integer', alias: 'meterMultiplier', display: 'normal', mandatory: false },
            AVAILABLE_METER_SLOTS: { name: 'custrecord_twc_pwr_sply_avail_meter_slot', type: 'integer', alias: 'availableMeterSlots', display: 'normal', mandatory: false },
            POWER_PHASE: { name: 'custrecord_twc_pwr_sply_pwr_phase', type: 'select', alias: 'powerPhase', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_phase,' },
            POWER_CAPACITY_KVA: { name: 'custrecord_twc_pwr_sply_capacity_kva', type: 'integer', alias: 'powerCapacitykVA', display: 'normal', mandatory: false },
            AVAILABLE_POWER_CAPACITY_KVA: { name: 'custrecord_twc_pwr_sply_avail_pwr_cap', type: 'integer', alias: 'availablePowerCapacitykVA', display: 'normal', mandatory: false },
            POWER_BEING_USED: { name: 'custrecord_twc_pwr_sply_being_used', type: 'integer', alias: 'powerBeingUsed', display: 'normal', mandatory: false },
            POWER_TLM: { name: 'custrecord_twc_pwr_sply_tlm', type: 'select', alias: 'powerTLM', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_tlm,' },
            POWER_SUPPLIER_MUST_READ_METER: { name: 'custrecord_twc_pwr_sply_must_read_meter', type: 'checkbox', alias: 'powerSuppliermustreadmeter', display: 'normal', mandatory: false },
            NEXT_METER_READING_DATE: { name: 'custrecord_twc_pwr_sply_nxt_mtr_rdg_date', type: 'date', alias: 'nextMeterReadingDate', display: 'normal', mandatory: false },
            COMMENT: { name: 'custrecord_twc_pwr_sply_comment', type: 'text', alias: 'comment', display: 'normal', mandatory: false },
            POWER_READINGS: { name: 'custrecord_twc_pwr_sply_pwr_readings', type: 'select', alias: 'powerReadings', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_rdg,' },
            POWER_USER_LIST: { name: 'custrecord_twc_pwr_sply_pwr_usr_list', type: 'select', alias: 'powerUserList', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_usr,' },
            POWER_READING_LIST: { name: 'custrecord_twc_pwr_sply_pwr_read_list', type: 'select', alias: 'powerReadingList', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_rdg,' },
        }

        class OSSMTWC_PowerSupply extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
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
            
            get powerSuppler() {
                return this.get(_recordFields.POWER_SUPPLER);
            } set powerSuppler(value) {
                this.set(_recordFields.POWER_SUPPLER, value)
            }
            get powerSupplerName() { return this.getText(_recordFields.POWER_SUPPLER); }
            
            get powerSupplyStatus() {
                return this.get(_recordFields.POWER_SUPPLY_STATUS);
            } set powerSupplyStatus(value) {
                this.set(_recordFields.POWER_SUPPLY_STATUS, value)
            }
            get powerSupplyStatusName() { return this.getText(_recordFields.POWER_SUPPLY_STATUS); }
            
            get powerSupplierType() {
                return this.get(_recordFields.POWER_SUPPLIER_TYPE);
            } set powerSupplierType(value) {
                this.set(_recordFields.POWER_SUPPLIER_TYPE, value)
            }
            get powerSupplierTypeName() { return this.getText(_recordFields.POWER_SUPPLIER_TYPE); }
            
            get powerSupplyCategory() {
                return this.get(_recordFields.POWER_SUPPLY_CATEGORY);
            } set powerSupplyCategory(value) {
                this.set(_recordFields.POWER_SUPPLY_CATEGORY, value)
            }
            get powerSupplyCategoryName() { return this.getText(_recordFields.POWER_SUPPLY_CATEGORY); }
            
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
            
            get meterNumber() {
                return this.get(_recordFields.METER_NUMBER);
            } set meterNumber(value) {
                this.set(_recordFields.METER_NUMBER, value)
            }
            
            get meterLocation() {
                return this.get(_recordFields.METER_LOCATION);
            } set meterLocation(value) {
                this.set(_recordFields.METER_LOCATION, value)
            }
            
            get meterMultiplier() {
                return this.get(_recordFields.METER_MULTIPLIER);
            } set meterMultiplier(value) {
                this.set(_recordFields.METER_MULTIPLIER, value)
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
            
            get powerBeingUsed() {
                return this.get(_recordFields.POWER_BEING_USED);
            } set powerBeingUsed(value) {
                this.set(_recordFields.POWER_BEING_USED, value)
            }
            
            get powerTLM() {
                return this.get(_recordFields.POWER_TLM);
            } set powerTLM(value) {
                this.set(_recordFields.POWER_TLM, value)
            }
            get powerTLMName() { return this.getText(_recordFields.POWER_TLM); }
            
            get powerSuppliermustreadmeter() {
                return this.get(_recordFields.POWER_SUPPLIER_MUST_READ_METER);
            } set powerSuppliermustreadmeter(value) {
                this.set(_recordFields.POWER_SUPPLIER_MUST_READ_METER, value)
            }
            
            get nextMeterReadingDate() {
                return this.get(_recordFields.NEXT_METER_READING_DATE);
            } set nextMeterReadingDate(value) {
                this.set(_recordFields.NEXT_METER_READING_DATE, value)
            }
            
            get comment() {
                return this.get(_recordFields.COMMENT);
            } set comment(value) {
                this.set(_recordFields.COMMENT, value)
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
