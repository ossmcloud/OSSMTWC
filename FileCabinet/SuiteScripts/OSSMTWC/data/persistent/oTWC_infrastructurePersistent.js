/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_infra';
        var _recordFields = {
            SITE: 'custrecord_twc_infra_site',
            INFRASTRUCTURE_TYPE: 'custrecord_twc_infra_type',
            INFRASTRUCTURE_ID: 'custrecord_twc_infra_id',
            LEGACY_ID: 'custrecord_twc_infra_legacy_id',
            STATUS: 'custrecord_twc_infra_status',
            SRF_STATUS: 'custrecord_twc_infra_srf_status',
            SAF_STATUS: 'custrecord_twc_infra_saf_status',
            SAF_AUTO_APPROVE: 'custrecord_twc_infra_saf_auto_apprv',
            SCHEDULE: 'custrecord_twc_infra_sch',
            INFRASTRUCTURE_OWNERSHIP: 'custrecord_twc_infra_ownshp',
            O_AND_M_OWNERSHIP: 'custrecord_twc_infra_om_ownshp',
            INSURANCE_OWNERSHIP: 'custrecord_twc_infra_insur_ownshp',
            MARKETING_STATUS: 'custrecord_twc_infra_mktg_sts',
            PUBLIC: 'custrecord_twc_infra_public',
            COMMENTS: 'custrecord_twc_infra_com',
            EASTING: 'custrecord_twc_infra_easting',
            NORTHING: 'custrecord_twc_infra_northing',
            LONGITUDE: 'custrecord_twc_infra_lng',
            LATITUDE: 'custrecord_twc_infra_lat',
            STRUCTURE_TYPE: 'custrecord_twc_infra_str_type',
            TOWER_FAMILY: 'custrecord_twc_infra_tw_fam',
            STRUCTURE_HEIGHT_M: 'custrecord_twc_infra_str_ht_m',
            FUTURE_PLANNED_STRUCTURE_HEIGHT_M: 'custrecord_twc_infra_fut_pln_str_ht_m',
            ROOFTOP_HEIGHT_M: 'custrecord_twc_infra_rooftop_ht_m',
            FALL_ARREST_STATUS: 'custrecord_twc_infra_fall_arr_sts',
            FALL_ARREST_TYPE: 'custrecord_twc_infra_fall_arr_type',
            ANTI_CLIMB: 'custrecord_twc_infra_anti_climb',
            NEXT_SITE_INSPECTION_DATE: 'custrecord_twc_infra_nxt_site_insp_date',
            NEXT_FALL_ARREST_CERTIFICATION_DATE: 'custrecord_twc_infra_nxt_fall_cert_date',
            TOWER_LAST_PAINTED_DATE: 'custrecord_twc_infra_twr_lst_pnt_date',
            SCHEDULED_NEXT_PAINTING_DATE: 'custrecord_twc_infra_sch_nxt_pnt_date',
            PAINTING_WARRANTY_EXPIRY_DATE: 'custrecord_twc_infra_pnt_war_exp_date',
            STRUCTURE_DESIGN: 'custrecord_twc_infra_str_design',
            YEAR_OF_BUILD: 'custrecord_twc_infra_yr_of_build',
            GEOTYPE: 'custrecord_twc_infra_geotype',
            PROXIMITY_TO_BODY_OF_WATER_KM: 'custrecord_twc_infra_prox_body_wtr_km',
            LAND_TOPOLOGY: 'custrecord_twc_infra_land_topo',
            WIND_MAP_VB_MAP_MS: 'custrecord_twc_infra_wind_map_vb',
            FOUNDATION_TYPE: 'custrecord_twc_infra_fnd_type',
            FOUNDATION_DESIGN: 'custrecord_twc_infra_fnd_design',
            FOUNDATION_DIMENSIONS: 'custrecord_twc_infra_fnd_dims',
            FOUNDATION_CONTRACTOR: 'custrecord_twc_infra_fnd_contr',
            SOIL_BEARING_DCPSI_KNM: 'custrecord_twc_infra_soil_brg_dcp_si',
            GROUND_WATER_BGL: 'custrecord_twc_infra_grnd_wtr',
            FOUNDATION_FOS: 'custrecord_twc_infra_fnd_fos',
            FOUNDATION_OVERTURNING_KNM: 'custrecord_twc_infra_fnd_ot',
            STRUCTURE_CAPACITY_ESA: 'custrecord_twc_infra_str_cap_esa',
            STRUCTURE_CAPACITY_E_BM: 'custrecord_twc_infra_str_cap_ebm',
            STRUCTURE_EQUIPMENT_LOADING_E_BM: 'custrecord_twc_infra_str_equip_ldg_ebm',
            _PC_CAPACITY_USED: 'custrecord_twc_infra_pct_cap_used',
            _PC_CAPACITY_REMAINING: 'custrecord_twc_infra_pct_cap_rem',
            TLM: 'custrecord_twc_infra_tlm',
            ACCOMMODATION_DIMENSIONS: 'custrecord_twc_infra_accom_dim',
            RACK_SPACES_AVAILABLE: 'custrecord_twc_infra_rack_space_avail',
            UNITS: 'custrecord_twc_infra_units',
            MODEL: 'custrecord_twc_infra_model',
            INSTALLED: 'custrecord_twc_infra_installed',
            AC_FEED_PHASE: 'custrecord_twc_infra_ac_feed_phase',
            LOADINGS: 'custrecord_twc_infra_ldg',
            NOISE_LEVEL: 'custrecord_twc_infra_noise_lvl',
            NEXT_AIRCON_SERVICE: 'custrecord_twc_infra_nxt_aircon_svc',
            INTRUDER_ALARM_PRESENT: 'custrecord_twc_infra_intru_alrm_pres',
            INTRUDER_CODE: 'custrecord_twc_infra_intru_code',
            FIRE_ALARM_PRESENT: 'custrecord_twc_infra_fire_alrm_pres',
            NEXT_FIRE_SERVICE: 'custrecord_twc_infra_nxt_fire_svc',
            NEXT_ALARM_SERVICE: 'custrecord_twc_infra_nxt_alrm_svc',
            GENERATOR_MODEL: 'custrecord_twc_infra_gen_model',
            POWER_CAPACITY: 'custrecord_twc_infra_pwr_cap',
            TANK_CAPACITY_L: 'custrecord_twc_infra_tnk_cap_l',
            NEXT_GENERATOR_SERVICE: 'custrecord_twc_infra_nxt_gen_svc',
            NEXT_GENERATOR_SERVICE_TYPE: 'custrecord_twc_infra_nxt_gen_svc_type',
        }
        var _recordFieldInfo = {
            SITE: { name: 'custrecord_twc_infra_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site,' },
            INFRASTRUCTURE_TYPE: { name: 'custrecord_twc_infra_type', type: 'select', alias: 'infrastructureType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_type,' },
            INFRASTRUCTURE_ID: { name: 'custrecord_twc_infra_id', type: 'text', alias: 'infrastructureID', display: 'normal', mandatory: false },
            LEGACY_ID: { name: 'custrecord_twc_infra_legacy_id', type: 'text', alias: 'legacyID', display: 'normal', mandatory: false },
            STATUS: { name: 'custrecord_twc_infra_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_sts,' },
            SRF_STATUS: { name: 'custrecord_twc_infra_srf_status', type: 'select', alias: 'sRFStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_srf_sts,' },
            SAF_STATUS: { name: 'custrecord_twc_infra_saf_status', type: 'select', alias: 'sAFStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_saf_sts,' },
            SAF_AUTO_APPROVE: { name: 'custrecord_twc_infra_saf_auto_apprv', type: 'checkbox', alias: 'sAFAutoApprove', display: 'normal', mandatory: false },
            SCHEDULE: { name: 'custrecord_twc_infra_sch', type: 'select', alias: 'schedule', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_sch,' },
            INFRASTRUCTURE_OWNERSHIP: { name: 'custrecord_twc_infra_ownshp', type: 'select', alias: 'infrastructureOwnership', display: 'normal', mandatory: false, recordType: '-2' },
            O_AND_M_OWNERSHIP: { name: 'custrecord_twc_infra_om_ownshp', type: 'select', alias: 'o_and_MOwnership', display: 'normal', mandatory: false, recordType: '-2' },
            INSURANCE_OWNERSHIP: { name: 'custrecord_twc_infra_insur_ownshp', type: 'select', alias: 'insuranceOwnership', display: 'normal', mandatory: false, recordType: '-2' },
            MARKETING_STATUS: { name: 'custrecord_twc_infra_mktg_sts', type: 'checkbox', alias: 'marketingStatus', display: 'normal', mandatory: false },
            PUBLIC: { name: 'custrecord_twc_infra_public', type: 'select', alias: 'public', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_publ,' },
            COMMENTS: { name: 'custrecord_twc_infra_com', type: 'text', alias: 'comments', display: 'normal', mandatory: false },
            EASTING: { name: 'custrecord_twc_infra_easting', type: 'float', alias: 'easting', display: 'normal', mandatory: false },
            NORTHING: { name: 'custrecord_twc_infra_northing', type: 'float', alias: 'northing', display: 'normal', mandatory: false },
            LONGITUDE: { name: 'custrecord_twc_infra_lng', type: 'float', alias: 'longitude', display: 'normal', mandatory: false },
            LATITUDE: { name: 'custrecord_twc_infra_lat', type: 'float', alias: 'latitude', display: 'normal', mandatory: false },
            STRUCTURE_TYPE: { name: 'custrecord_twc_infra_str_type', type: 'select', alias: 'structureType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_str_type,' },
            TOWER_FAMILY: { name: 'custrecord_twc_infra_tw_fam', type: 'select', alias: 'towerFamily', display: 'normal', mandatory: false, recordType: 'customrecord_twc_tower_family,' },
            STRUCTURE_HEIGHT_M: { name: 'custrecord_twc_infra_str_ht_m', type: 'float', alias: 'structureHeightm', display: 'normal', mandatory: false },
            FUTURE_PLANNED_STRUCTURE_HEIGHT_M: { name: 'custrecord_twc_infra_fut_pln_str_ht_m', type: 'float', alias: 'futurePlannedStructureHeightm', display: 'normal', mandatory: false },
            ROOFTOP_HEIGHT_M: { name: 'custrecord_twc_infra_rooftop_ht_m', type: 'float', alias: 'rooftopHeightm', display: 'normal', mandatory: false },
            FALL_ARREST_STATUS: { name: 'custrecord_twc_infra_fall_arr_sts', type: 'select', alias: 'fallArrestStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fall_arr_sts,' },
            FALL_ARREST_TYPE: { name: 'custrecord_twc_infra_fall_arr_type', type: 'select', alias: 'fallArrestType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fall_arr_types,' },
            ANTI_CLIMB: { name: 'custrecord_twc_infra_anti_climb', type: 'checkbox', alias: 'antiClimb', display: 'normal', mandatory: false },
            NEXT_SITE_INSPECTION_DATE: { name: 'custrecord_twc_infra_nxt_site_insp_date', type: 'date', alias: 'nextSiteInspectionDate', display: 'normal', mandatory: false },
            NEXT_FALL_ARREST_CERTIFICATION_DATE: { name: 'custrecord_twc_infra_nxt_fall_cert_date', type: 'date', alias: 'nextFallArrestCertificationDate', display: 'normal', mandatory: false },
            TOWER_LAST_PAINTED_DATE: { name: 'custrecord_twc_infra_twr_lst_pnt_date', type: 'date', alias: 'towerLastPaintedDate', display: 'normal', mandatory: false },
            SCHEDULED_NEXT_PAINTING_DATE: { name: 'custrecord_twc_infra_sch_nxt_pnt_date', type: 'date', alias: 'scheduledNextPaintingDate', display: 'normal', mandatory: false },
            PAINTING_WARRANTY_EXPIRY_DATE: { name: 'custrecord_twc_infra_pnt_war_exp_date', type: 'date', alias: 'paintingWarrantyExpiryDate', display: 'normal', mandatory: false },
            STRUCTURE_DESIGN: { name: 'custrecord_twc_infra_str_design', type: 'textarea', alias: 'structureDesign', display: 'normal', mandatory: false },
            YEAR_OF_BUILD: { name: 'custrecord_twc_infra_yr_of_build', type: 'text', alias: 'yearofBuild', display: 'normal', mandatory: false },
            GEOTYPE: { name: 'custrecord_twc_infra_geotype', type: 'select', alias: 'geotype', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_geotype,' },
            PROXIMITY_TO_BODY_OF_WATER_KM: { name: 'custrecord_twc_infra_prox_body_wtr_km', type: 'float', alias: 'proximitytoBodyofWaterkm', display: 'normal', mandatory: false },
            LAND_TOPOLOGY: { name: 'custrecord_twc_infra_land_topo', type: 'select', alias: 'landTopology', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_land_topo,' },
            WIND_MAP_VB_MAP_MS: { name: 'custrecord_twc_infra_wind_map_vb', type: 'float', alias: 'windMapVb_mapms', display: 'normal', mandatory: false },
            FOUNDATION_TYPE: { name: 'custrecord_twc_infra_fnd_type', type: 'select', alias: 'foundationType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fnd_type,' },
            FOUNDATION_DESIGN: { name: 'custrecord_twc_infra_fnd_design', type: 'textarea', alias: 'foundationDesign', display: 'normal', mandatory: false },
            FOUNDATION_DIMENSIONS: { name: 'custrecord_twc_infra_fnd_dims', type: 'text', alias: 'foundationDimensions', display: 'normal', mandatory: false },
            FOUNDATION_CONTRACTOR: { name: 'custrecord_twc_infra_fnd_contr', type: 'select', alias: 'foundationContractor', display: 'normal', mandatory: false, recordType: '-2' },
            SOIL_BEARING_DCPSI_KNM: { name: 'custrecord_twc_infra_soil_brg_dcp_si', type: 'float', alias: 'soilBearingDCPSIkNm', display: 'normal', mandatory: false },
            GROUND_WATER_BGL: { name: 'custrecord_twc_infra_grnd_wtr', type: 'float', alias: 'groundWaterBGL', display: 'normal', mandatory: false },
            FOUNDATION_FOS: { name: 'custrecord_twc_infra_fnd_fos', type: 'float', alias: 'foundationFOS', display: 'normal', mandatory: false },
            FOUNDATION_OVERTURNING_KNM: { name: 'custrecord_twc_infra_fnd_ot', type: 'float', alias: 'foundationOverturningkNm', display: 'normal', mandatory: false },
            STRUCTURE_CAPACITY_ESA: { name: 'custrecord_twc_infra_str_cap_esa', type: 'float', alias: 'structureCapacityESA', display: 'normal', mandatory: false },
            STRUCTURE_CAPACITY_E_BM: { name: 'custrecord_twc_infra_str_cap_ebm', type: 'float', alias: 'structureCapacityE_BM', display: 'normal', mandatory: false },
            STRUCTURE_EQUIPMENT_LOADING_E_BM: { name: 'custrecord_twc_infra_str_equip_ldg_ebm', type: 'float', alias: 'structureEquipmentloadingE_BM', display: 'normal', mandatory: false },
            _PC_CAPACITY_USED: { name: 'custrecord_twc_infra_pct_cap_used', type: 'float', alias: '_pcCapacityused', display: 'normal', mandatory: false },
            _PC_CAPACITY_REMAINING: { name: 'custrecord_twc_infra_pct_cap_rem', type: 'float', alias: '_pcCapacityremaining', display: 'normal', mandatory: false },
            TLM: { name: 'custrecord_twc_infra_tlm', type: 'select', alias: 'tLM', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_tlm,' },
            ACCOMMODATION_DIMENSIONS: { name: 'custrecord_twc_infra_accom_dim', type: 'text', alias: 'accommodationDimensions', display: 'normal', mandatory: false },
            RACK_SPACES_AVAILABLE: { name: 'custrecord_twc_infra_rack_space_avail', type: 'integer', alias: 'rackSpacesAvailable', display: 'normal', mandatory: false },
            UNITS: { name: 'custrecord_twc_infra_units', type: 'integer', alias: 'units', display: 'normal', mandatory: false },
            MODEL: { name: 'custrecord_twc_infra_model', type: 'text', alias: 'model', display: 'normal', mandatory: false },
            INSTALLED: { name: 'custrecord_twc_infra_installed', type: 'date', alias: 'installed', display: 'normal', mandatory: false },
            AC_FEED_PHASE: { name: 'custrecord_twc_infra_ac_feed_phase', type: 'select', alias: 'aCFeedPhase', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_ac_feed_phase,' },
            LOADINGS: { name: 'custrecord_twc_infra_ldg', type: 'integer', alias: 'loadings', display: 'normal', mandatory: false },
            NOISE_LEVEL: { name: 'custrecord_twc_infra_noise_lvl', type: 'integer', alias: 'noiseLevel', display: 'normal', mandatory: false },
            NEXT_AIRCON_SERVICE: { name: 'custrecord_twc_infra_nxt_aircon_svc', type: 'date', alias: 'nextAirconService', display: 'normal', mandatory: false },
            INTRUDER_ALARM_PRESENT: { name: 'custrecord_twc_infra_intru_alrm_pres', type: 'checkbox', alias: 'intruderAlarmPresent', display: 'normal', mandatory: false },
            INTRUDER_CODE: { name: 'custrecord_twc_infra_intru_code', type: 'text', alias: 'intruderCode', display: 'normal', mandatory: false },
            FIRE_ALARM_PRESENT: { name: 'custrecord_twc_infra_fire_alrm_pres', type: 'checkbox', alias: 'fireAlarmPresent', display: 'normal', mandatory: false },
            NEXT_FIRE_SERVICE: { name: 'custrecord_twc_infra_nxt_fire_svc', type: 'date', alias: 'nextFireService', display: 'normal', mandatory: false },
            NEXT_ALARM_SERVICE: { name: 'custrecord_twc_infra_nxt_alrm_svc', type: 'date', alias: 'nextAlarmService', display: 'normal', mandatory: false },
            GENERATOR_MODEL: { name: 'custrecord_twc_infra_gen_model', type: 'text', alias: 'generatorModel', display: 'normal', mandatory: false },
            POWER_CAPACITY: { name: 'custrecord_twc_infra_pwr_cap', type: 'integer', alias: 'powerCapacity', display: 'normal', mandatory: false },
            TANK_CAPACITY_L: { name: 'custrecord_twc_infra_tnk_cap_l', type: 'integer', alias: 'tankCapacityl', display: 'normal', mandatory: false },
            NEXT_GENERATOR_SERVICE: { name: 'custrecord_twc_infra_nxt_gen_svc', type: 'date', alias: 'nextGeneratorService', display: 'normal', mandatory: false },
            NEXT_GENERATOR_SERVICE_TYPE: { name: 'custrecord_twc_infra_nxt_gen_svc_type', type: 'select', alias: 'nextGeneratorServiceType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_nxt_gen_svc_type,' },
        }

        class OSSMTWC_Infrastructure extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get infrastructureType() {
                return this.get(_recordFields.INFRASTRUCTURE_TYPE);
            } set infrastructureType(value) {
                this.set(_recordFields.INFRASTRUCTURE_TYPE, value)
            }
            get infrastructureTypeName() { return this.getText(_recordFields.INFRASTRUCTURE_TYPE); }
            
            get infrastructureID() {
                return this.get(_recordFields.INFRASTRUCTURE_ID);
            } set infrastructureID(value) {
                this.set(_recordFields.INFRASTRUCTURE_ID, value)
            }
            
            get legacyID() {
                return this.get(_recordFields.LEGACY_ID);
            } set legacyID(value) {
                this.set(_recordFields.LEGACY_ID, value)
            }
            
            get status() {
                return this.get(_recordFields.STATUS);
            } set status(value) {
                this.set(_recordFields.STATUS, value)
            }
            get statusName() { return this.getText(_recordFields.STATUS); }
            
            get sRFStatus() {
                return this.get(_recordFields.SRF_STATUS);
            } set sRFStatus(value) {
                this.set(_recordFields.SRF_STATUS, value)
            }
            get sRFStatusName() { return this.getText(_recordFields.SRF_STATUS); }
            
            get sAFStatus() {
                return this.get(_recordFields.SAF_STATUS);
            } set sAFStatus(value) {
                this.set(_recordFields.SAF_STATUS, value)
            }
            get sAFStatusName() { return this.getText(_recordFields.SAF_STATUS); }
            
            get sAFAutoApprove() {
                return this.get(_recordFields.SAF_AUTO_APPROVE);
            } set sAFAutoApprove(value) {
                this.set(_recordFields.SAF_AUTO_APPROVE, value)
            }
            
            get schedule() {
                return this.get(_recordFields.SCHEDULE);
            } set schedule(value) {
                this.set(_recordFields.SCHEDULE, value)
            }
            get scheduleName() { return this.getText(_recordFields.SCHEDULE); }
            
            get infrastructureOwnership() {
                return this.get(_recordFields.INFRASTRUCTURE_OWNERSHIP);
            } set infrastructureOwnership(value) {
                this.set(_recordFields.INFRASTRUCTURE_OWNERSHIP, value)
            }
            get infrastructureOwnershipName() { return this.getText(_recordFields.INFRASTRUCTURE_OWNERSHIP); }
            
            get o_and_MOwnership() {
                return this.get(_recordFields.O_AND_M_OWNERSHIP);
            } set o_and_MOwnership(value) {
                this.set(_recordFields.O_AND_M_OWNERSHIP, value)
            }
            get o_and_MOwnershipName() { return this.getText(_recordFields.O_AND_M_OWNERSHIP); }
            
            get insuranceOwnership() {
                return this.get(_recordFields.INSURANCE_OWNERSHIP);
            } set insuranceOwnership(value) {
                this.set(_recordFields.INSURANCE_OWNERSHIP, value)
            }
            get insuranceOwnershipName() { return this.getText(_recordFields.INSURANCE_OWNERSHIP); }
            
            get marketingStatus() {
                return this.get(_recordFields.MARKETING_STATUS);
            } set marketingStatus(value) {
                this.set(_recordFields.MARKETING_STATUS, value)
            }
            
            get public() {
                return this.get(_recordFields.PUBLIC);
            } set public(value) {
                this.set(_recordFields.PUBLIC, value)
            }
            get publicName() { return this.getText(_recordFields.PUBLIC); }
            
            get comments() {
                return this.get(_recordFields.COMMENTS);
            } set comments(value) {
                this.set(_recordFields.COMMENTS, value)
            }
            
            get easting() {
                return this.get(_recordFields.EASTING);
            } set easting(value) {
                this.set(_recordFields.EASTING, value)
            }
            
            get northing() {
                return this.get(_recordFields.NORTHING);
            } set northing(value) {
                this.set(_recordFields.NORTHING, value)
            }
            
            get longitude() {
                return this.get(_recordFields.LONGITUDE);
            } set longitude(value) {
                this.set(_recordFields.LONGITUDE, value)
            }
            
            get latitude() {
                return this.get(_recordFields.LATITUDE);
            } set latitude(value) {
                this.set(_recordFields.LATITUDE, value)
            }
            
            get structureType() {
                return this.get(_recordFields.STRUCTURE_TYPE);
            } set structureType(value) {
                this.set(_recordFields.STRUCTURE_TYPE, value)
            }
            get structureTypeName() { return this.getText(_recordFields.STRUCTURE_TYPE); }
            
            get towerFamily() {
                return this.get(_recordFields.TOWER_FAMILY);
            } set towerFamily(value) {
                this.set(_recordFields.TOWER_FAMILY, value)
            }
            get towerFamilyName() { return this.getText(_recordFields.TOWER_FAMILY); }
            
            get structureHeightm() {
                return this.get(_recordFields.STRUCTURE_HEIGHT_M);
            } set structureHeightm(value) {
                this.set(_recordFields.STRUCTURE_HEIGHT_M, value)
            }
            
            get futurePlannedStructureHeightm() {
                return this.get(_recordFields.FUTURE_PLANNED_STRUCTURE_HEIGHT_M);
            } set futurePlannedStructureHeightm(value) {
                this.set(_recordFields.FUTURE_PLANNED_STRUCTURE_HEIGHT_M, value)
            }
            
            get rooftopHeightm() {
                return this.get(_recordFields.ROOFTOP_HEIGHT_M);
            } set rooftopHeightm(value) {
                this.set(_recordFields.ROOFTOP_HEIGHT_M, value)
            }
            
            get fallArrestStatus() {
                return this.get(_recordFields.FALL_ARREST_STATUS);
            } set fallArrestStatus(value) {
                this.set(_recordFields.FALL_ARREST_STATUS, value)
            }
            get fallArrestStatusName() { return this.getText(_recordFields.FALL_ARREST_STATUS); }
            
            get fallArrestType() {
                return this.get(_recordFields.FALL_ARREST_TYPE);
            } set fallArrestType(value) {
                this.set(_recordFields.FALL_ARREST_TYPE, value)
            }
            get fallArrestTypeName() { return this.getText(_recordFields.FALL_ARREST_TYPE); }
            
            get antiClimb() {
                return this.get(_recordFields.ANTI_CLIMB);
            } set antiClimb(value) {
                this.set(_recordFields.ANTI_CLIMB, value)
            }
            
            get nextSiteInspectionDate() {
                return this.get(_recordFields.NEXT_SITE_INSPECTION_DATE);
            } set nextSiteInspectionDate(value) {
                this.set(_recordFields.NEXT_SITE_INSPECTION_DATE, value)
            }
            
            get nextFallArrestCertificationDate() {
                return this.get(_recordFields.NEXT_FALL_ARREST_CERTIFICATION_DATE);
            } set nextFallArrestCertificationDate(value) {
                this.set(_recordFields.NEXT_FALL_ARREST_CERTIFICATION_DATE, value)
            }
            
            get towerLastPaintedDate() {
                return this.get(_recordFields.TOWER_LAST_PAINTED_DATE);
            } set towerLastPaintedDate(value) {
                this.set(_recordFields.TOWER_LAST_PAINTED_DATE, value)
            }
            
            get scheduledNextPaintingDate() {
                return this.get(_recordFields.SCHEDULED_NEXT_PAINTING_DATE);
            } set scheduledNextPaintingDate(value) {
                this.set(_recordFields.SCHEDULED_NEXT_PAINTING_DATE, value)
            }
            
            get paintingWarrantyExpiryDate() {
                return this.get(_recordFields.PAINTING_WARRANTY_EXPIRY_DATE);
            } set paintingWarrantyExpiryDate(value) {
                this.set(_recordFields.PAINTING_WARRANTY_EXPIRY_DATE, value)
            }
            
            get structureDesign() {
                return this.get(_recordFields.STRUCTURE_DESIGN);
            } set structureDesign(value) {
                this.set(_recordFields.STRUCTURE_DESIGN, value)
            }
            
            get yearofBuild() {
                return this.get(_recordFields.YEAR_OF_BUILD);
            } set yearofBuild(value) {
                this.set(_recordFields.YEAR_OF_BUILD, value)
            }
            
            get geotype() {
                return this.get(_recordFields.GEOTYPE);
            } set geotype(value) {
                this.set(_recordFields.GEOTYPE, value)
            }
            get geotypeName() { return this.getText(_recordFields.GEOTYPE); }
            
            get proximitytoBodyofWaterkm() {
                return this.get(_recordFields.PROXIMITY_TO_BODY_OF_WATER_KM);
            } set proximitytoBodyofWaterkm(value) {
                this.set(_recordFields.PROXIMITY_TO_BODY_OF_WATER_KM, value)
            }
            
            get landTopology() {
                return this.get(_recordFields.LAND_TOPOLOGY);
            } set landTopology(value) {
                this.set(_recordFields.LAND_TOPOLOGY, value)
            }
            get landTopologyName() { return this.getText(_recordFields.LAND_TOPOLOGY); }
            
            get windMapVb_mapms() {
                return this.get(_recordFields.WIND_MAP_VB_MAP_MS);
            } set windMapVb_mapms(value) {
                this.set(_recordFields.WIND_MAP_VB_MAP_MS, value)
            }
            
            get foundationType() {
                return this.get(_recordFields.FOUNDATION_TYPE);
            } set foundationType(value) {
                this.set(_recordFields.FOUNDATION_TYPE, value)
            }
            get foundationTypeName() { return this.getText(_recordFields.FOUNDATION_TYPE); }
            
            get foundationDesign() {
                return this.get(_recordFields.FOUNDATION_DESIGN);
            } set foundationDesign(value) {
                this.set(_recordFields.FOUNDATION_DESIGN, value)
            }
            
            get foundationDimensions() {
                return this.get(_recordFields.FOUNDATION_DIMENSIONS);
            } set foundationDimensions(value) {
                this.set(_recordFields.FOUNDATION_DIMENSIONS, value)
            }
            
            get foundationContractor() {
                return this.get(_recordFields.FOUNDATION_CONTRACTOR);
            } set foundationContractor(value) {
                this.set(_recordFields.FOUNDATION_CONTRACTOR, value)
            }
            get foundationContractorName() { return this.getText(_recordFields.FOUNDATION_CONTRACTOR); }
            
            get soilBearingDCPSIkNm() {
                return this.get(_recordFields.SOIL_BEARING_DCPSI_KNM);
            } set soilBearingDCPSIkNm(value) {
                this.set(_recordFields.SOIL_BEARING_DCPSI_KNM, value)
            }
            
            get groundWaterBGL() {
                return this.get(_recordFields.GROUND_WATER_BGL);
            } set groundWaterBGL(value) {
                this.set(_recordFields.GROUND_WATER_BGL, value)
            }
            
            get foundationFOS() {
                return this.get(_recordFields.FOUNDATION_FOS);
            } set foundationFOS(value) {
                this.set(_recordFields.FOUNDATION_FOS, value)
            }
            
            get foundationOverturningkNm() {
                return this.get(_recordFields.FOUNDATION_OVERTURNING_KNM);
            } set foundationOverturningkNm(value) {
                this.set(_recordFields.FOUNDATION_OVERTURNING_KNM, value)
            }
            
            get structureCapacityESA() {
                return this.get(_recordFields.STRUCTURE_CAPACITY_ESA);
            } set structureCapacityESA(value) {
                this.set(_recordFields.STRUCTURE_CAPACITY_ESA, value)
            }
            
            get structureCapacityE_BM() {
                return this.get(_recordFields.STRUCTURE_CAPACITY_E_BM);
            } set structureCapacityE_BM(value) {
                this.set(_recordFields.STRUCTURE_CAPACITY_E_BM, value)
            }
            
            get structureEquipmentloadingE_BM() {
                return this.get(_recordFields.STRUCTURE_EQUIPMENT_LOADING_E_BM);
            } set structureEquipmentloadingE_BM(value) {
                this.set(_recordFields.STRUCTURE_EQUIPMENT_LOADING_E_BM, value)
            }
            
            get _pcCapacityused() {
                return this.get(_recordFields._PC_CAPACITY_USED);
            } set _pcCapacityused(value) {
                this.set(_recordFields._PC_CAPACITY_USED, value)
            }
            
            get _pcCapacityremaining() {
                return this.get(_recordFields._PC_CAPACITY_REMAINING);
            } set _pcCapacityremaining(value) {
                this.set(_recordFields._PC_CAPACITY_REMAINING, value)
            }
            
            get tLM() {
                return this.get(_recordFields.TLM);
            } set tLM(value) {
                this.set(_recordFields.TLM, value)
            }
            get tLMName() { return this.getText(_recordFields.TLM); }
            
            get accommodationDimensions() {
                return this.get(_recordFields.ACCOMMODATION_DIMENSIONS);
            } set accommodationDimensions(value) {
                this.set(_recordFields.ACCOMMODATION_DIMENSIONS, value)
            }
            
            get rackSpacesAvailable() {
                return this.get(_recordFields.RACK_SPACES_AVAILABLE);
            } set rackSpacesAvailable(value) {
                this.set(_recordFields.RACK_SPACES_AVAILABLE, value)
            }
            
            get units() {
                return this.get(_recordFields.UNITS);
            } set units(value) {
                this.set(_recordFields.UNITS, value)
            }
            
            get model() {
                return this.get(_recordFields.MODEL);
            } set model(value) {
                this.set(_recordFields.MODEL, value)
            }
            
            get installed() {
                return this.get(_recordFields.INSTALLED);
            } set installed(value) {
                this.set(_recordFields.INSTALLED, value)
            }
            
            get aCFeedPhase() {
                return this.get(_recordFields.AC_FEED_PHASE);
            } set aCFeedPhase(value) {
                this.set(_recordFields.AC_FEED_PHASE, value)
            }
            get aCFeedPhaseName() { return this.getText(_recordFields.AC_FEED_PHASE); }
            
            get loadings() {
                return this.get(_recordFields.LOADINGS);
            } set loadings(value) {
                this.set(_recordFields.LOADINGS, value)
            }
            
            get noiseLevel() {
                return this.get(_recordFields.NOISE_LEVEL);
            } set noiseLevel(value) {
                this.set(_recordFields.NOISE_LEVEL, value)
            }
            
            get nextAirconService() {
                return this.get(_recordFields.NEXT_AIRCON_SERVICE);
            } set nextAirconService(value) {
                this.set(_recordFields.NEXT_AIRCON_SERVICE, value)
            }
            
            get intruderAlarmPresent() {
                return this.get(_recordFields.INTRUDER_ALARM_PRESENT);
            } set intruderAlarmPresent(value) {
                this.set(_recordFields.INTRUDER_ALARM_PRESENT, value)
            }
            
            get intruderCode() {
                return this.get(_recordFields.INTRUDER_CODE);
            } set intruderCode(value) {
                this.set(_recordFields.INTRUDER_CODE, value)
            }
            
            get fireAlarmPresent() {
                return this.get(_recordFields.FIRE_ALARM_PRESENT);
            } set fireAlarmPresent(value) {
                this.set(_recordFields.FIRE_ALARM_PRESENT, value)
            }
            
            get nextFireService() {
                return this.get(_recordFields.NEXT_FIRE_SERVICE);
            } set nextFireService(value) {
                this.set(_recordFields.NEXT_FIRE_SERVICE, value)
            }
            
            get nextAlarmService() {
                return this.get(_recordFields.NEXT_ALARM_SERVICE);
            } set nextAlarmService(value) {
                this.set(_recordFields.NEXT_ALARM_SERVICE, value)
            }
            
            get generatorModel() {
                return this.get(_recordFields.GENERATOR_MODEL);
            } set generatorModel(value) {
                this.set(_recordFields.GENERATOR_MODEL, value)
            }
            
            get powerCapacity() {
                return this.get(_recordFields.POWER_CAPACITY);
            } set powerCapacity(value) {
                this.set(_recordFields.POWER_CAPACITY, value)
            }
            
            get tankCapacityl() {
                return this.get(_recordFields.TANK_CAPACITY_L);
            } set tankCapacityl(value) {
                this.set(_recordFields.TANK_CAPACITY_L, value)
            }
            
            get nextGeneratorService() {
                return this.get(_recordFields.NEXT_GENERATOR_SERVICE);
            } set nextGeneratorService(value) {
                this.set(_recordFields.NEXT_GENERATOR_SERVICE, value)
            }
            
            get nextGeneratorServiceType() {
                return this.get(_recordFields.NEXT_GENERATOR_SERVICE_TYPE);
            } set nextGeneratorServiceType(value) {
                this.set(_recordFields.NEXT_GENERATOR_SERVICE_TYPE, value)
            }
            get nextGeneratorServiceTypeName() { return this.getText(_recordFields.NEXT_GENERATOR_SERVICE_TYPE); }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            PersistentRecord: OSSMTWC_Infrastructure,

            get: function (id) {
                var rec = new OSSMTWC_Infrastructure(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Infrastructure();
                return rec.select(options);
            }

        }
    });
