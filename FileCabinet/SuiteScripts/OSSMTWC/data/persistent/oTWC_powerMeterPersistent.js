/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_pwr_mtr';
        var _recordFields = {
            NAME: 'name',
            SITE: 'custrecord_twc_pwr_mtr_site',
            POWER_SUPPLY: 'custrecord_twc_pwr_mtr_sply',
            POWER_METER_ID: 'custrecord_twc_pwr_mtr_id',
            METER_NAME: 'custrecord_twc_pwr_mtr_name',
            METER_STATUS: 'custrecord_twc_pwr_mtr_sts',
            METER_UNIT_MULTIPLIER: 'custrecord_twc_pwr_mtr_mult',
            METER_COMMENT: 'custrecord_twc_pwr_mtr_comm',
            METER_NUMBER: 'custrecord_twc_pwr_mtr_num',
            POWER_SUPPLIER_MUST_READ_METER: 'custrecord_twc_pwr_mtr_mustread',
            METER_TYPE: 'custrecord_twc_pwr_mtr_type',
            METER_LOCATION: 'custrecord_twc_pwr_mtr_loc',
            NEXT_METER_READING_DATE: 'custrecord_twc_pwr_mtr_nxt_read',
            METER_POWER_PHASE: 'custrecord_twc_pwr_mtr_phase',
            METER_READING_FREQ: 'custrecord_twc_pwr_mtr_read_freq',
            LATEST_METER_READING_DATE: 'custrecord_twc_pwr_mtr_last_read_date',
            LATEST_DAY_READING: 'custrecord_twc_pwr_mtr_last_day_read',
            LATEST_NIGHT_READING: 'custrecord_twc_pwr_mtr_last_night_read',
            LATEST_PEAK_READING: 'custrecord_twc_pwr_mtr_last_peak_read',
            LATEST_KWH_USAGE___READING: 'custrecord_twc_pwr_mtr_last_usage',
            LATEST_KWH_USAGE___AMP_CHECK: 'custrecord_twc_pwr_mtr_last_usage_amp',
            SUPPLIER_INFORMED: 'custrecord_twc_pwr_mtr_supplier_informed',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SITE: { name: 'custrecord_twc_pwr_mtr_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            POWER_SUPPLY: { name: 'custrecord_twc_pwr_mtr_sply', type: 'select', alias: 'powerSupply', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_sply' },
            POWER_METER_ID: { name: 'custrecord_twc_pwr_mtr_id', type: 'text', alias: 'powerMeterID', display: 'normal', mandatory: false },
            METER_NAME: { name: 'custrecord_twc_pwr_mtr_name', type: 'text', alias: 'meterName', display: 'normal', mandatory: false },
            METER_STATUS: { name: 'custrecord_twc_pwr_mtr_sts', type: 'select', alias: 'meterStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_mtr_sts' },
            METER_UNIT_MULTIPLIER: { name: 'custrecord_twc_pwr_mtr_mult', type: 'select', alias: 'meterUnitMultiplier', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_mtr_mult_types' },
            METER_COMMENT: { name: 'custrecord_twc_pwr_mtr_comm', type: 'textarea', alias: 'meterComment', display: 'normal', mandatory: false },
            METER_NUMBER: { name: 'custrecord_twc_pwr_mtr_num', type: 'text', alias: 'meterNumber', display: 'normal', mandatory: false },
            POWER_SUPPLIER_MUST_READ_METER: { name: 'custrecord_twc_pwr_mtr_mustread', type: 'checkbox', alias: 'powerSuppliermustreadMeter', display: 'normal', mandatory: false },
            METER_TYPE: { name: 'custrecord_twc_pwr_mtr_type', type: 'select', alias: 'meterType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_mtr_type' },
            METER_LOCATION: { name: 'custrecord_twc_pwr_mtr_loc', type: 'text', alias: 'meterLocation', display: 'normal', mandatory: false },
            NEXT_METER_READING_DATE: { name: 'custrecord_twc_pwr_mtr_nxt_read', type: 'date', alias: 'nextMeterReadingDate', display: 'normal', mandatory: false },
            METER_POWER_PHASE: { name: 'custrecord_twc_pwr_mtr_phase', type: 'select', alias: 'meterPowerPhase', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_ac_feed_phase' },
            METER_READING_FREQ: { name: 'custrecord_twc_pwr_mtr_read_freq', type: 'integer', alias: 'meterReadingFreq', display: 'normal', mandatory: false },
            LATEST_METER_READING_DATE: { name: 'custrecord_twc_pwr_mtr_last_read_date', type: 'date', alias: 'latestMeterReadingDate', display: 'normal', mandatory: false },
            LATEST_DAY_READING: { name: 'custrecord_twc_pwr_mtr_last_day_read', type: 'integer', alias: 'latestDayReading', display: 'normal', mandatory: false },
            LATEST_NIGHT_READING: { name: 'custrecord_twc_pwr_mtr_last_night_read', type: 'integer', alias: 'latestNightReading', display: 'normal', mandatory: false },
            LATEST_PEAK_READING: { name: 'custrecord_twc_pwr_mtr_last_peak_read', type: 'integer', alias: 'latestPeakReading', display: 'normal', mandatory: false },
            LATEST_KWH_USAGE___READING: { name: 'custrecord_twc_pwr_mtr_last_usage', type: 'float', alias: 'latestkWhUsage_Reading', display: 'normal', mandatory: false },
            LATEST_KWH_USAGE___AMP_CHECK: { name: 'custrecord_twc_pwr_mtr_last_usage_amp', type: 'float', alias: 'latestkWhUsage_AmpCheck', display: 'normal', mandatory: false },
            SUPPLIER_INFORMED: { name: 'custrecord_twc_pwr_mtr_supplier_informed', type: 'checkbox', alias: 'supplierInformed', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_PowerMeter extends customRec.RecordBase {
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
            
            get powerSupply() {
                return this.get(_recordFields.POWER_SUPPLY);
            } set powerSupply(value) {
                this.set(_recordFields.POWER_SUPPLY, value)
            }
            get powerSupplyName() { return this.getText(_recordFields.POWER_SUPPLY); }
            
            get powerMeterID() {
                return this.get(_recordFields.POWER_METER_ID);
            } set powerMeterID(value) {
                this.set(_recordFields.POWER_METER_ID, value)
            }
            
            get meterName() {
                return this.get(_recordFields.METER_NAME);
            } set meterName(value) {
                this.set(_recordFields.METER_NAME, value)
            }
            
            get meterStatus() {
                return this.get(_recordFields.METER_STATUS);
            } set meterStatus(value) {
                this.set(_recordFields.METER_STATUS, value)
            }
            get meterStatusName() { return this.getText(_recordFields.METER_STATUS); }
            
            get meterUnitMultiplier() {
                return this.get(_recordFields.METER_UNIT_MULTIPLIER);
            } set meterUnitMultiplier(value) {
                this.set(_recordFields.METER_UNIT_MULTIPLIER, value)
            }
            get meterUnitMultiplierName() { return this.getText(_recordFields.METER_UNIT_MULTIPLIER); }
            
            get meterComment() {
                return this.get(_recordFields.METER_COMMENT);
            } set meterComment(value) {
                this.set(_recordFields.METER_COMMENT, value)
            }
            
            get meterNumber() {
                return this.get(_recordFields.METER_NUMBER);
            } set meterNumber(value) {
                this.set(_recordFields.METER_NUMBER, value)
            }
            
            get powerSuppliermustreadMeter() {
                return this.get(_recordFields.POWER_SUPPLIER_MUST_READ_METER);
            } set powerSuppliermustreadMeter(value) {
                this.set(_recordFields.POWER_SUPPLIER_MUST_READ_METER, value)
            }
            
            get meterType() {
                return this.get(_recordFields.METER_TYPE);
            } set meterType(value) {
                this.set(_recordFields.METER_TYPE, value)
            }
            get meterTypeName() { return this.getText(_recordFields.METER_TYPE); }
            
            get meterLocation() {
                return this.get(_recordFields.METER_LOCATION);
            } set meterLocation(value) {
                this.set(_recordFields.METER_LOCATION, value)
            }
            
            get nextMeterReadingDate() {
                return this.get(_recordFields.NEXT_METER_READING_DATE);
            } set nextMeterReadingDate(value) {
                this.set(_recordFields.NEXT_METER_READING_DATE, value)
            }
            
            get meterPowerPhase() {
                return this.get(_recordFields.METER_POWER_PHASE);
            } set meterPowerPhase(value) {
                this.set(_recordFields.METER_POWER_PHASE, value)
            }
            get meterPowerPhaseName() { return this.getText(_recordFields.METER_POWER_PHASE); }
            
            get meterReadingFreq() {
                return this.get(_recordFields.METER_READING_FREQ);
            } set meterReadingFreq(value) {
                this.set(_recordFields.METER_READING_FREQ, value)
            }
            
            get latestMeterReadingDate() {
                return this.get(_recordFields.LATEST_METER_READING_DATE);
            } set latestMeterReadingDate(value) {
                this.set(_recordFields.LATEST_METER_READING_DATE, value)
            }
            
            get latestDayReading() {
                return this.get(_recordFields.LATEST_DAY_READING);
            } set latestDayReading(value) {
                this.set(_recordFields.LATEST_DAY_READING, value)
            }
            
            get latestNightReading() {
                return this.get(_recordFields.LATEST_NIGHT_READING);
            } set latestNightReading(value) {
                this.set(_recordFields.LATEST_NIGHT_READING, value)
            }
            
            get latestPeakReading() {
                return this.get(_recordFields.LATEST_PEAK_READING);
            } set latestPeakReading(value) {
                this.set(_recordFields.LATEST_PEAK_READING, value)
            }
            
            get latestkWhUsage_Reading() {
                return this.get(_recordFields.LATEST_KWH_USAGE___READING);
            } set latestkWhUsage_Reading(value) {
                this.set(_recordFields.LATEST_KWH_USAGE___READING, value)
            }
            
            get latestkWhUsage_AmpCheck() {
                return this.get(_recordFields.LATEST_KWH_USAGE___AMP_CHECK);
            } set latestkWhUsage_AmpCheck(value) {
                this.set(_recordFields.LATEST_KWH_USAGE___AMP_CHECK, value)
            }
            
            get supplierInformed() {
                return this.get(_recordFields.SUPPLIER_INFORMED);
            } set supplierInformed(value) {
                this.set(_recordFields.SUPPLIER_INFORMED, value)
            }
            
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
            PersistentRecord: OSSMTWC_PowerMeter,

            get: function (id) {
                var rec = new OSSMTWC_PowerMeter(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_PowerMeter();
                return rec.select(options);
            }

        }
    });
