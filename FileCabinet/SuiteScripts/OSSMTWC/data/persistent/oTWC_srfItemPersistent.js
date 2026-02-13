/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_srf_itm';
        var _recordFields = {
            SRF: 'custrecord_twc_srf_itm_srf',
            REQUEST_TYPE: 'custrecord_twc_srf_itm_req_type',
            STEP_TYPE: 'custrecord_twc_srf_itm_stype',
            ITEM_TYPE: 'custrecord_twc_srf_itm_type',
            EQUIPMENT_ID: 'custrecord_twc_srf_itm_equip_id',
            DESCRIPTION: 'custrecord_twc_srf_itm_desc',
            LOCATION: 'custrecord_twc_srf_itm_loc',
            LENGTH_MM: 'custrecord_twc_srf_itm_length_mm',
            WIDTH_MM: 'custrecord_twc_srf_itm_width_mm',
            DEPTH_MM: 'custrecord_twc_srf_itm_depth_mm',
            HEIGHT_ON_TOWER: 'custrecord_twc_srf_itm_ht_on_twr',
            WEIGHT_KG: 'custrecord_twc_srf_itm_weight_kg',
            VOLTAGE_TYPE: 'custrecord_twc_srf_itm_volt_type',
            VOLTAGE_RANGE: 'custrecord_twc_srf_itm_volt_range',
            AZIMUTH: 'custrecord_twc_srf_itm_azimuth',
            B_END: 'custrecord_twc_srf_itm_b_end',
            CUSTOMER_REF: 'custrecord_twc_srf_itm_cust_ref',
            INVENTORY_FLAG: 'custrecord_twc_srf_itm_invent_flag',
            FEEDER_COUNT: 'custrecord_twc_srf_itm_feeder_count',
            TYPE_OPT: 'custrecord_twc_srf_itm_type_opt',
            TME_ID: 'custrecord_twc_srf_itm_tme_id',
            FILENAME: 'custrecord_twc_srf_itm_filename',
            POWER_REQUESTED_FROM_TC: 'custrecord_twc_srf_itm_pwr_req_from_tc',
            ALTERNATE_SUPPLIER: 'custrecord_twc_srf_itm_alt_sup',
            NOTES__COMMENTS: 'custrecord_twc_srf_itm_notes_com',
            APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB: 'custrecord_twc_srf_itm_app_own_sup_esb',
            APPLICATION_DATE: 'custrecord_twc_srf_itm_app_date',
            APPLICATION_REFERENCE: 'custrecord_twc_srf_itm_app_ref',
            FEEDERS_DESCRIPTION: 'custrecord_twc_srf_itm_feeder_desc',
            LOCATION_TEXT: 'custrecord_twc_srf_itm_loc_txt',
        }
        var _recordFieldInfo = {
            SRF: { name: 'custrecord_twc_srf_itm_srf', type: 'select', alias: 'sRF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf,' },
            REQUEST_TYPE: { name: 'custrecord_twc_srf_itm_req_type', type: 'select', alias: 'requestType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_req_type,' },
            STEP_TYPE: { name: 'custrecord_twc_srf_itm_stype', type: 'select', alias: 'stepType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_stype,' },
            ITEM_TYPE: { name: 'custrecord_twc_srf_itm_type', type: 'select', alias: 'itemType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_type,' },
            EQUIPMENT_ID: { name: 'custrecord_twc_srf_itm_equip_id', type: 'text', alias: 'equipmentID', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_srf_itm_desc', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            LOCATION: { name: 'custrecord_twc_srf_itm_loc', type: 'select', alias: 'location', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_loc_type,' },
            LENGTH_MM: { name: 'custrecord_twc_srf_itm_length_mm', type: 'text', alias: 'lengthmm', display: 'normal', mandatory: false },
            WIDTH_MM: { name: 'custrecord_twc_srf_itm_width_mm', type: 'text', alias: 'widthmm', display: 'normal', mandatory: false },
            DEPTH_MM: { name: 'custrecord_twc_srf_itm_depth_mm', type: 'text', alias: 'depthmm', display: 'normal', mandatory: false },
            HEIGHT_ON_TOWER: { name: 'custrecord_twc_srf_itm_ht_on_twr', type: 'text', alias: 'heightonTower', display: 'normal', mandatory: false },
            WEIGHT_KG: { name: 'custrecord_twc_srf_itm_weight_kg', type: 'text', alias: 'weightkg', display: 'normal', mandatory: false },
            VOLTAGE_TYPE: { name: 'custrecord_twc_srf_itm_volt_type', type: 'select', alias: 'voltageType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_v_type,' },
            VOLTAGE_RANGE: { name: 'custrecord_twc_srf_itm_volt_range', type: 'select', alias: 'voltageRange', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_v_range,' },
            AZIMUTH: { name: 'custrecord_twc_srf_itm_azimuth', type: 'text', alias: 'azimuth', display: 'normal', mandatory: false },
            B_END: { name: 'custrecord_twc_srf_itm_b_end', type: 'text', alias: 'b_End', display: 'normal', mandatory: false },
            CUSTOMER_REF: { name: 'custrecord_twc_srf_itm_cust_ref', type: 'text', alias: 'customerRef', display: 'normal', mandatory: false },
            INVENTORY_FLAG: { name: 'custrecord_twc_srf_itm_invent_flag', type: 'select', alias: 'inventoryFlag', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_inv_flag,' },
            FEEDER_COUNT: { name: 'custrecord_twc_srf_itm_feeder_count', type: 'text', alias: 'feederCount', display: 'normal', mandatory: false },
            TYPE_OPT: { name: 'custrecord_twc_srf_itm_type_opt', type: 'select', alias: 'typeopt', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_itm_typ_opt,' },
            TME_ID: { name: 'custrecord_twc_srf_itm_tme_id', type: 'text', alias: 'tMEID', display: 'normal', mandatory: false },
            FILENAME: { name: 'custrecord_twc_srf_itm_filename', type: 'document', alias: 'filename', display: 'normal', mandatory: false },
            POWER_REQUESTED_FROM_TC: { name: 'custrecord_twc_srf_itm_pwr_req_from_tc', type: 'checkbox', alias: 'powerrequestedfromTC', display: 'normal', mandatory: false },
            ALTERNATE_SUPPLIER: { name: 'custrecord_twc_srf_itm_alt_sup', type: 'text', alias: 'alternateSupplier', display: 'normal', mandatory: false },
            NOTES__COMMENTS: { name: 'custrecord_twc_srf_itm_notes_com', type: 'textarea', alias: 'notesComments', display: 'normal', mandatory: false },
            APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB: { name: 'custrecord_twc_srf_itm_app_own_sup_esb', type: 'checkbox', alias: 'applicationforownsupplymadetoESB', display: 'normal', mandatory: false },
            APPLICATION_DATE: { name: 'custrecord_twc_srf_itm_app_date', type: 'date', alias: 'applicationdate', display: 'normal', mandatory: false },
            APPLICATION_REFERENCE: { name: 'custrecord_twc_srf_itm_app_ref', type: 'text', alias: 'applicationreference', display: 'normal', mandatory: false },
            FEEDERS_DESCRIPTION: { name: 'custrecord_twc_srf_itm_feeder_desc', type: 'text', alias: 'feedersDescription', display: 'normal', mandatory: false },
            LOCATION_TEXT: { name: 'custrecord_twc_srf_itm_loc_txt', type: 'text', alias: 'locationText', display: 'normal', mandatory: false },
        }

        class OSSMTWC_SRFItem extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get sRF() {
                return this.get(_recordFields.SRF);
            } set sRF(value) {
                this.set(_recordFields.SRF, value)
            }
            get sRFName() { return this.getText(_recordFields.SRF); }
            
            get requestType() {
                return this.get(_recordFields.REQUEST_TYPE);
            } set requestType(value) {
                this.set(_recordFields.REQUEST_TYPE, value)
            }
            get requestTypeName() { return this.getText(_recordFields.REQUEST_TYPE); }
            
            get stepType() {
                return this.get(_recordFields.STEP_TYPE);
            } set stepType(value) {
                this.set(_recordFields.STEP_TYPE, value)
            }
            get stepTypeName() { return this.getText(_recordFields.STEP_TYPE); }
            
            get itemType() {
                return this.get(_recordFields.ITEM_TYPE);
            } set itemType(value) {
                this.set(_recordFields.ITEM_TYPE, value)
            }
            get itemTypeName() { return this.getText(_recordFields.ITEM_TYPE); }
            
            get equipmentID() {
                return this.get(_recordFields.EQUIPMENT_ID);
            } set equipmentID(value) {
                this.set(_recordFields.EQUIPMENT_ID, value)
            }
            
            get description() {
                return this.get(_recordFields.DESCRIPTION);
            } set description(value) {
                this.set(_recordFields.DESCRIPTION, value)
            }
            
            get location() {
                return this.get(_recordFields.LOCATION);
            } set location(value) {
                this.set(_recordFields.LOCATION, value)
            }
            get locationName() { return this.getText(_recordFields.LOCATION); }
            
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
            
            get depthmm() {
                return this.get(_recordFields.DEPTH_MM);
            } set depthmm(value) {
                this.set(_recordFields.DEPTH_MM, value)
            }
            
            get heightonTower() {
                return this.get(_recordFields.HEIGHT_ON_TOWER);
            } set heightonTower(value) {
                this.set(_recordFields.HEIGHT_ON_TOWER, value)
            }
            
            get weightkg() {
                return this.get(_recordFields.WEIGHT_KG);
            } set weightkg(value) {
                this.set(_recordFields.WEIGHT_KG, value)
            }
            
            get voltageType() {
                return this.get(_recordFields.VOLTAGE_TYPE);
            } set voltageType(value) {
                this.set(_recordFields.VOLTAGE_TYPE, value)
            }
            get voltageTypeName() { return this.getText(_recordFields.VOLTAGE_TYPE); }
            
            get voltageRange() {
                return this.get(_recordFields.VOLTAGE_RANGE);
            } set voltageRange(value) {
                this.set(_recordFields.VOLTAGE_RANGE, value)
            }
            get voltageRangeName() { return this.getText(_recordFields.VOLTAGE_RANGE); }
            
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
            
            get feederCount() {
                return this.get(_recordFields.FEEDER_COUNT);
            } set feederCount(value) {
                this.set(_recordFields.FEEDER_COUNT, value)
            }
            
            get typeopt() {
                return this.get(_recordFields.TYPE_OPT);
            } set typeopt(value) {
                this.set(_recordFields.TYPE_OPT, value)
            }
            get typeoptName() { return this.getText(_recordFields.TYPE_OPT); }
            
            get tMEID() {
                return this.get(_recordFields.TME_ID);
            } set tMEID(value) {
                this.set(_recordFields.TME_ID, value)
            }
            
            get filename() {
                return this.get(_recordFields.FILENAME);
            } set filename(value) {
                this.set(_recordFields.FILENAME, value)
            }
            
            get powerrequestedfromTC() {
                return this.get(_recordFields.POWER_REQUESTED_FROM_TC);
            } set powerrequestedfromTC(value) {
                this.set(_recordFields.POWER_REQUESTED_FROM_TC, value)
            }
            
            get alternateSupplier() {
                return this.get(_recordFields.ALTERNATE_SUPPLIER);
            } set alternateSupplier(value) {
                this.set(_recordFields.ALTERNATE_SUPPLIER, value)
            }
            
            get notesComments() {
                return this.get(_recordFields.NOTES__COMMENTS);
            } set notesComments(value) {
                this.set(_recordFields.NOTES__COMMENTS, value)
            }
            
            get applicationforownsupplymadetoESB() {
                return this.get(_recordFields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB);
            } set applicationforownsupplymadetoESB(value) {
                this.set(_recordFields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB, value)
            }
            
            get applicationdate() {
                return this.get(_recordFields.APPLICATION_DATE);
            } set applicationdate(value) {
                this.set(_recordFields.APPLICATION_DATE, value)
            }
            
            get applicationreference() {
                return this.get(_recordFields.APPLICATION_REFERENCE);
            } set applicationreference(value) {
                this.set(_recordFields.APPLICATION_REFERENCE, value)
            }
            
            get feedersDescription() {
                return this.get(_recordFields.FEEDERS_DESCRIPTION);
            } set feedersDescription(value) {
                this.set(_recordFields.FEEDERS_DESCRIPTION, value)
            }
            
            get locationText() {
                return this.get(_recordFields.LOCATION_TEXT);
            } set locationText(value) {
                this.set(_recordFields.LOCATION_TEXT, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            PersistentRecord: OSSMTWC_SRFItem,

            get: function (id) {
                var rec = new OSSMTWC_SRFItem(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SRFItem();
                return rec.select(options);
            }

        }
    });
