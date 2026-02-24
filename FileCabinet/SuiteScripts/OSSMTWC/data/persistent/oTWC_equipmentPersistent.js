/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_equip';
        var _recordFields = {
            EQUIPMENT_ID: 'custrecord_twc_equip_id',
            RADIX_EQUIPMENT_TABLE_ROW: 'custrecord_twc_equip_radix_tbl_row',
            SITE: 'custrecord_twc_equip_site',
            EQ_TYPE: 'custrecord_twc_equip_type',
            INFRASTRUCTURE: 'custrecord_twc_equip_str',
            ACCOMMODATION: 'custrecord_twc_equip_ac',
            LOCATION: 'custrecord_twc_equip_location',
            EQUIPMENT_STATUS: 'custrecord_twc_equip_status',
            EQUIPMENT_PROPOSED_STATUS: 'custrecord_twc_equip_prop_sts',
            CUSTOMER: 'custrecord_twc_equip_customer',
            PARENT_TME_ID: 'custrecord_twc_equip_parent_tme_id',
            USE_LIBRARY: 'custrecord_twc_equip_use_lib',
            EQUIPMENT_LIBRARY_ENTRY: 'custrecord_twc_equip_lib_entry',
            EQUIPMENT_CLASS: 'custrecord_twc_equip_class',
            ACTIVEPASSIVE: 'custrecord_twc_equip_act_passive',
            MAKE: 'custrecord_twc_equip_make',
            MODEL: 'custrecord_twc_equip_model',
            DESCRIPTION: 'custrecord_twc_equip_description',
            LENGTH_MM: 'custrecord_twc_equip_length_mm',
            WIDTH_MM: 'custrecord_twc_equip_width_mm',
            HEIGHTDEPTH_MM: 'custrecord_twc_equip_ht_depth_mm',
            WEIGHT_KG: 'custrecord_twc_equip_weight_kg',
            WIND_LOADING_NM2: 'custrecord_twc_equip_wind_ldg_nm2',
            VOLTAGE_TYPE: 'custrecord_twc_equip_voltage_type',
            VOLTAGE_RANGE: 'custrecord_twc_equip_voltage_range',
            ASSOCIATED_EQUIP_ACTIONS: 'custrecord_twc_equip_assoc_eq_action',
            TO_BE_BILLED: 'custrecord_twc_equip_to_be_billed',
            BILL_FROM: 'custrecord_twc_equip_bill_from',
            BILL_TO: 'custrecord_twc_equip_bill_to',
            LICENCED_DATE: 'custrecord_twc_equip_licenced_date',
            INSTALLED_DATE: 'custrecord_twc_equip_installed_date',
            REMOVED_DATE: 'custrecord_twc_equip_rmv_date',
            GIE_LOCATION: 'custrecord_twc_equip_gie_loc',
            HEIGHT_ON_TOWER_M: 'custrecord_twc_equip_ht_on_twr_m',
            AZIMUTH: 'custrecord_twc_equip_azimuth',
            B_END: 'custrecord_twc_equip_b_end',
            CUSTOMER_REF: 'custrecord_twc_equip_cust_ref',
            INVENTORY_FLAG: 'custrecord_twc_equip_inv_flag',
            FEEDER_COUNT: 'custrecord_twc_equip_feeder_count',
            FEEDERS: 'custrecord_twc_equip_feeders',
        }
        var _recordFieldInfo = {
            EQUIPMENT_ID: { name: 'custrecord_twc_equip_id', type: 'text', alias: 'equipmentID', display: 'normal', mandatory: false },
            RADIX_EQUIPMENT_TABLE_ROW: { name: 'custrecord_twc_equip_radix_tbl_row', type: 'integer', alias: 'rADIXEquipmentTableRow', display: 'normal', mandatory: false },
            SITE: { name: 'custrecord_twc_equip_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            EQ_TYPE: { name: 'custrecord_twc_equip_type', type: 'select', alias: 'eqType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf_eqtype,' },
            INFRASTRUCTURE: { name: 'custrecord_twc_equip_str', type: 'select', alias: 'infrastructure', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra,' },
            ACCOMMODATION: { name: 'custrecord_twc_equip_ac', type: 'select', alias: 'accommodation', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra,' },
            LOCATION: { name: 'custrecord_twc_equip_location', type: 'text', alias: 'location', display: 'normal', mandatory: false },
            EQUIPMENT_STATUS: { name: 'custrecord_twc_equip_status', type: 'text', alias: 'equipmentStatus', display: 'normal', mandatory: false },
            EQUIPMENT_PROPOSED_STATUS: { name: 'custrecord_twc_equip_prop_sts', type: 'text', alias: 'equipmentProposedStatus', display: 'normal', mandatory: false },
            CUSTOMER: { name: 'custrecord_twc_equip_customer', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: '-2' },
            PARENT_TME_ID: { name: 'custrecord_twc_equip_parent_tme_id', type: 'text', alias: 'parentTMEID', display: 'normal', mandatory: false },
            USE_LIBRARY: { name: 'custrecord_twc_equip_use_lib', type: 'select', alias: 'useLibrary', display: 'normal', mandatory: false, recordType: 'customrecord_twc_equip_use_lib,' },
            EQUIPMENT_LIBRARY_ENTRY: { name: 'custrecord_twc_equip_lib_entry', type: 'text', alias: 'equipmentLibraryEntry', display: 'normal', mandatory: false },
            EQUIPMENT_CLASS: { name: 'custrecord_twc_equip_class', type: 'text', alias: 'equipmentClass', display: 'normal', mandatory: false },
            ACTIVEPASSIVE: { name: 'custrecord_twc_equip_act_passive', type: 'text', alias: 'activePassive', display: 'normal', mandatory: false },
            MAKE: { name: 'custrecord_twc_equip_make', type: 'text', alias: 'make', display: 'normal', mandatory: false },
            MODEL: { name: 'custrecord_twc_equip_model', type: 'text', alias: 'model', display: 'normal', mandatory: false },
            DESCRIPTION: { name: 'custrecord_twc_equip_description', type: 'text', alias: 'description', display: 'normal', mandatory: false },
            LENGTH_MM: { name: 'custrecord_twc_equip_length_mm', type: 'integer', alias: 'lengthmm', display: 'normal', mandatory: false },
            WIDTH_MM: { name: 'custrecord_twc_equip_width_mm', type: 'integer', alias: 'widthmm', display: 'normal', mandatory: false },
            HEIGHTDEPTH_MM: { name: 'custrecord_twc_equip_ht_depth_mm', type: 'integer', alias: 'heightDepthmm', display: 'normal', mandatory: false },
            WEIGHT_KG: { name: 'custrecord_twc_equip_weight_kg', type: 'float', alias: 'weightkg', display: 'normal', mandatory: false },
            WIND_LOADING_NM2: { name: 'custrecord_twc_equip_wind_ldg_nm2', type: 'integer', alias: 'windLoadingNm2', display: 'normal', mandatory: false },
            VOLTAGE_TYPE: { name: 'custrecord_twc_equip_voltage_type', type: 'text', alias: 'voltageType', display: 'normal', mandatory: false },
            VOLTAGE_RANGE: { name: 'custrecord_twc_equip_voltage_range', type: 'text', alias: 'voltageRange', display: 'normal', mandatory: false },
            ASSOCIATED_EQUIP_ACTIONS: { name: 'custrecord_twc_equip_assoc_eq_action', type: 'text', alias: 'associatedEQUIP_ACTIONs', display: 'normal', mandatory: false },
            TO_BE_BILLED: { name: 'custrecord_twc_equip_to_be_billed', type: 'checkbox', alias: 'toBeBilled', display: 'normal', mandatory: false },
            BILL_FROM: { name: 'custrecord_twc_equip_bill_from', type: 'date', alias: 'billFrom', display: 'normal', mandatory: false },
            BILL_TO: { name: 'custrecord_twc_equip_bill_to', type: 'date', alias: 'billTo', display: 'normal', mandatory: false },
            LICENCED_DATE: { name: 'custrecord_twc_equip_licenced_date', type: 'date', alias: 'licencedDate', display: 'normal', mandatory: false },
            INSTALLED_DATE: { name: 'custrecord_twc_equip_installed_date', type: 'date', alias: 'installedDate', display: 'normal', mandatory: false },
            REMOVED_DATE: { name: 'custrecord_twc_equip_rmv_date', type: 'date', alias: 'removedDate', display: 'normal', mandatory: false },
            GIE_LOCATION: { name: 'custrecord_twc_equip_gie_loc', type: 'text', alias: 'gIELocation', display: 'normal', mandatory: false },
            HEIGHT_ON_TOWER_M: { name: 'custrecord_twc_equip_ht_on_twr_m', type: 'float', alias: 'heightonTowerm', display: 'normal', mandatory: false },
            AZIMUTH: { name: 'custrecord_twc_equip_azimuth', type: 'integer', alias: 'azimuth', display: 'normal', mandatory: false },
            B_END: { name: 'custrecord_twc_equip_b_end', type: 'text', alias: 'b_End', display: 'normal', mandatory: false },
            CUSTOMER_REF: { name: 'custrecord_twc_equip_cust_ref', type: 'text', alias: 'customerRef', display: 'normal', mandatory: false },
            INVENTORY_FLAG: { name: 'custrecord_twc_equip_inv_flag', type: 'text', alias: 'inventoryFlag', display: 'normal', mandatory: false },
            FEEDER_COUNT: { name: 'custrecord_twc_equip_feeder_count', type: 'integer', alias: 'feederCount', display: 'normal', mandatory: false },
            FEEDERS: { name: 'custrecord_twc_equip_feeders', type: 'text', alias: 'feeders', display: 'normal', mandatory: false },
        }

        class OSSMTWC_Equipment extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get equipmentID() {
                return this.get(_recordFields.EQUIPMENT_ID);
            } set equipmentID(value) {
                this.set(_recordFields.EQUIPMENT_ID, value)
            }
            
            get rADIXEquipmentTableRow() {
                return this.get(_recordFields.RADIX_EQUIPMENT_TABLE_ROW);
            } set rADIXEquipmentTableRow(value) {
                this.set(_recordFields.RADIX_EQUIPMENT_TABLE_ROW, value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get eqType() {
                return this.get(_recordFields.EQ_TYPE);
            } set eqType(value) {
                this.set(_recordFields.EQ_TYPE, value)
            }
            get eqTypeName() { return this.getText(_recordFields.EQ_TYPE); }
            
            get infrastructure() {
                return this.get(_recordFields.INFRASTRUCTURE);
            } set infrastructure(value) {
                this.set(_recordFields.INFRASTRUCTURE, value)
            }
            get infrastructureName() { return this.getText(_recordFields.INFRASTRUCTURE); }
            
            get accommodation() {
                return this.get(_recordFields.ACCOMMODATION);
            } set accommodation(value) {
                this.set(_recordFields.ACCOMMODATION, value)
            }
            get accommodationName() { return this.getText(_recordFields.ACCOMMODATION); }
            
            get location() {
                return this.get(_recordFields.LOCATION);
            } set location(value) {
                this.set(_recordFields.LOCATION, value)
            }
            
            get equipmentStatus() {
                return this.get(_recordFields.EQUIPMENT_STATUS);
            } set equipmentStatus(value) {
                this.set(_recordFields.EQUIPMENT_STATUS, value)
            }
            
            get equipmentProposedStatus() {
                return this.get(_recordFields.EQUIPMENT_PROPOSED_STATUS);
            } set equipmentProposedStatus(value) {
                this.set(_recordFields.EQUIPMENT_PROPOSED_STATUS, value)
            }
            
            get customer() {
                return this.get(_recordFields.CUSTOMER);
            } set customer(value) {
                this.set(_recordFields.CUSTOMER, value)
            }
            get customerName() { return this.getText(_recordFields.CUSTOMER); }
            
            get parentTMEID() {
                return this.get(_recordFields.PARENT_TME_ID);
            } set parentTMEID(value) {
                this.set(_recordFields.PARENT_TME_ID, value)
            }
            
            get useLibrary() {
                return this.get(_recordFields.USE_LIBRARY);
            } set useLibrary(value) {
                this.set(_recordFields.USE_LIBRARY, value)
            }
            get useLibraryName() { return this.getText(_recordFields.USE_LIBRARY); }
            
            get equipmentLibraryEntry() {
                return this.get(_recordFields.EQUIPMENT_LIBRARY_ENTRY);
            } set equipmentLibraryEntry(value) {
                this.set(_recordFields.EQUIPMENT_LIBRARY_ENTRY, value)
            }
            
            get equipmentClass() {
                return this.get(_recordFields.EQUIPMENT_CLASS);
            } set equipmentClass(value) {
                this.set(_recordFields.EQUIPMENT_CLASS, value)
            }
            
            get activePassive() {
                return this.get(_recordFields.ACTIVEPASSIVE);
            } set activePassive(value) {
                this.set(_recordFields.ACTIVEPASSIVE, value)
            }
            
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
            
            get heightDepthmm() {
                return this.get(_recordFields.HEIGHTDEPTH_MM);
            } set heightDepthmm(value) {
                this.set(_recordFields.HEIGHTDEPTH_MM, value)
            }
            
            get weightkg() {
                return this.get(_recordFields.WEIGHT_KG);
            } set weightkg(value) {
                this.set(_recordFields.WEIGHT_KG, value)
            }
            
            get windLoadingNm2() {
                return this.get(_recordFields.WIND_LOADING_NM2);
            } set windLoadingNm2(value) {
                this.set(_recordFields.WIND_LOADING_NM2, value)
            }
            
            get voltageType() {
                return this.get(_recordFields.VOLTAGE_TYPE);
            } set voltageType(value) {
                this.set(_recordFields.VOLTAGE_TYPE, value)
            }
            
            get voltageRange() {
                return this.get(_recordFields.VOLTAGE_RANGE);
            } set voltageRange(value) {
                this.set(_recordFields.VOLTAGE_RANGE, value)
            }
            
            get associatedEQUIP_ACTIONs() {
                return this.get(_recordFields.ASSOCIATED_EQUIP_ACTIONS);
            } set associatedEQUIP_ACTIONs(value) {
                this.set(_recordFields.ASSOCIATED_EQUIP_ACTIONS, value)
            }
            
            get toBeBilled() {
                return this.get(_recordFields.TO_BE_BILLED);
            } set toBeBilled(value) {
                this.set(_recordFields.TO_BE_BILLED, value)
            }
            
            get billFrom() {
                return this.get(_recordFields.BILL_FROM);
            } set billFrom(value) {
                this.set(_recordFields.BILL_FROM, value)
            }
            
            get billTo() {
                return this.get(_recordFields.BILL_TO);
            } set billTo(value) {
                this.set(_recordFields.BILL_TO, value)
            }
            
            get licencedDate() {
                return this.get(_recordFields.LICENCED_DATE);
            } set licencedDate(value) {
                this.set(_recordFields.LICENCED_DATE, value)
            }
            
            get installedDate() {
                return this.get(_recordFields.INSTALLED_DATE);
            } set installedDate(value) {
                this.set(_recordFields.INSTALLED_DATE, value)
            }
            
            get removedDate() {
                return this.get(_recordFields.REMOVED_DATE);
            } set removedDate(value) {
                this.set(_recordFields.REMOVED_DATE, value)
            }
            
            get gIELocation() {
                return this.get(_recordFields.GIE_LOCATION);
            } set gIELocation(value) {
                this.set(_recordFields.GIE_LOCATION, value)
            }
            
            get heightonTowerm() {
                return this.get(_recordFields.HEIGHT_ON_TOWER_M);
            } set heightonTowerm(value) {
                this.set(_recordFields.HEIGHT_ON_TOWER_M, value)
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
            
            get feederCount() {
                return this.get(_recordFields.FEEDER_COUNT);
            } set feederCount(value) {
                this.set(_recordFields.FEEDER_COUNT, value)
            }
            
            get feeders() {
                return this.get(_recordFields.FEEDERS);
            } set feeders(value) {
                this.set(_recordFields.FEEDERS, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            PersistentRecord: OSSMTWC_Equipment,

            get: function (id) {
                var rec = new OSSMTWC_Equipment(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Equipment();
                return rec.select(options);
            }

        }
    });
