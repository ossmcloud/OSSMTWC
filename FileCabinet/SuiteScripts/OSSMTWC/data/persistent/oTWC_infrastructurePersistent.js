/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_infra';
        var _recordFields = {
            NAME: 'name',
            SITE: 'custrecord_twc_infra_site',
            INFRASTRUCTURE_TYPE: 'custrecord_twc_infra_type',
            INFRASTRUCTURE_ID: 'custrecord_twc_infra_id',
            LEGACY_ID: 'custrecord_twc_infra_legacy_id',
            INFRASTRUCTURE_STATUS: 'custrecord_twc_infra_status',
            INFRASTRUCTURE_UTS_STATUS: 'custrecord_twc_infra_uts_sts',
            INFRASTRUCTURE_SRF_STATUS: 'custrecord_twc_infra_srf_status',
            INFRASTRUCTURE_SAF_STATUS: 'custrecord_twc_infra_saf_status',
            INFRASTRUCTURE_SAF_AUTO_APPROVE: 'custrecord_twc_infra_saf_auto_apprv',
            INFRASTRUCTURE_SCHEDULE: 'custrecord_twc_infra_sch',
            INFRASTRUCTURE_OWNERSHIP: 'custrecord_twc_infra_ownshp',
            O_AND_M_OWNERSHIP: 'custrecord_twc_infra_om_ownshp',
            INSURANCE_OWNERSHIP: 'custrecord_twc_infra_insur_ownshp',
            MARKETING_STATUS: 'custrecord_twc_infra_mktg_sts',
            INFRASTRUCTURE_PUBLIC: 'custrecord_twc_infra_public',
            INFRASTRUCTURE_COMMENTS: 'custrecord_twc_infra_com',
            INFRASTRUCTURE_EASTING: 'custrecord_twc_infra_easting',
            INFRASTRUCTURE_NORTHING: 'custrecord_twc_infra_northing',
            INFRASTRUCTURE_LONGITUDE: 'custrecord_twc_infra_lng',
            INFRASTRUCTURE_LATITUDE: 'custrecord_twc_infra_lat',
            STRUCTURE_TYPE: 'custrecord_twc_infra_str_type',
            TOWER_FAMILY: 'custrecord_twc_infra_tw_fam',
            STRUCTURE_HEIGHT_M: 'custrecord_twc_infra_str_ht_m',
            ROOFTOP_HEIGHT_M: 'custrecord_twc_infra_rooftop_ht_m',
            FALL_ARREST_STATUS: 'custrecord_twc_infra_fall_arr_sts',
            FALL_ARREST_TYPE: 'custrecord_twc_infra_fall_arr_type',
            ANTI_CLIMB: 'custrecord_twc_infra_anti_climb',
            LAST_SITE_INSPECTION_DATE: 'custrecord_twc_infra_last_site_insp_date',
            NEXT_SITE_INSPECTION_DATE: 'custrecord_twc_infra_nxt_site_insp_date',
            LAST_FALL_ARREST_CERTIFICATION_DATE: 'custrecord_twc_last_fall_cert_date',
            NEXT_FALL_ARREST_CERTIFICATION_DATE: 'custrecord_twc_infra_nxt_fall_cert_date',
            TOWER_LAST_PAINTED_DATE: 'custrecord_twc_infra_twr_lst_pnt_date',
            SCHEDULED_NEXT_PAINTING_DATE: 'custrecord_twc_infra_sch_nxt_pnt_date',
            PAINTING_WARRANTY_EXPIRY_DATE: 'custrecord_twc_infra_pnt_war_exp_date',
            PAINT_COLOUR: 'custrecord_twc_infra_twr_lst_pnt_color',
            PAINTING_YEAR: 'custrecord_twc_infra_twr_lst_pnt_year',
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
            ACCOMMODATION_TYPE: 'custrecord_twc_accom_type',
            LAST_AC_SERVICE: 'custrecord_twc_last_ser_date',
            NEXT_AC_SERVICE: 'custrecord_twc_infra_nxt_aircon_svc',
            INTRUDER_ALARM_PRESENT: 'custrecord_twc_infra_intru_alrm_pres',
            INTRUDER_CODE: 'custrecord_twc_infra_intru_code',
            LAST_INTRUDER_ALARM_SERVICE: 'custrecord_twc_last_int_al_ser',
            NEXT_INTRUDER_ALARM_SERVICE: 'custrecord_twc_infra_nxt_alrm_svc',
            INTRUDER_ALARM_COMMENT: 'custrecord_twc_int_al_com',
            FIRE_ALARM_PRESENT: 'custrecord_twc_infra_fire_alrm_pres',
            LAST_FIRE_ALARM_SERVICE: 'custrecord_twc_last_fire_ser',
            NEXT_FIRE_ALARM_SERVICE: 'custrecord_twc_infra_nxt_fire_svc',
            FIRE_ALARM_COMMENT: 'custrecord_twc_fire_al_com',
            FIRE_EXTINGUISHER: 'custrecord_twc_infra_fire_extin',
            LAST_FIRE_EXTINGUISHER_SERVICE: 'custrecord_twc_last_fire_ser_date',
            NEXT_FIRE_EXTINGUISHER_SERVICE: 'custrecord_twc_nxt_fire_ser_date',
            GENERATOR_MODEL: 'custrecord_twc_infra_gen_model',
            POWER_CAPACITY: 'custrecord_twc_infra_pwr_cap',
            TANK_CAPACITY_L: 'custrecord_twc_infra_tnk_cap_l',
            NEXT_GENERATOR_SERVICE: 'custrecord_twc_infra_nxt_gen_svc',
            NEXT_GENERATOR_SERVICE_TYPE: 'custrecord_twc_infra_nxt_gen_svc_type',
            FIBRE_DUCT_INSTALLED: 'custrecord_twc_infra_fibre_duct_instal',
            FIBRE_INFRASTRUCTURE_TYPE: 'custrecord_twc_infra_fibre_infra_type',
            FIBRE_SERVICE_PROVIDERS: 'custrecord_twc_infra_fibre_svc_providers',
            FIBRE_COMMENTS: 'custrecord_twc_infra_fibre_comm',
            BOTTOM_WIDTH_MM: 'custrecord_twc_infra_bot_width',
            TOP_WIDTH_MM: 'custrecord_twc_infra_top_width',
            TOWER_SECTIONS_BOTTOM_TOP: 'custrecord_twc_infra_sect_bot_top',
            TOWER_SECTION_1: 'custrecord_twc_infra_sect_1',
            TOWER_SECTION_2: 'custrecord_twc_infra_sect_2',
            TOWER_SECTION_3: 'custrecord_twc_infra_sect_3',
            TOWER_SECTION_4: 'custrecord_twc_infra_sect_4',
            TOWER_SECTION_5: 'custrecord_twc_infra_sect_5',
            TOWER_SECTION_6: 'custrecord_twc_infra_sect_6',
            STRUCTURAL_COMMENTS: 'custrecord_twc_infra_struct_comments',
            HEIGHT_ASL_M: 'custrecord_twc_infra_height_asl',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SITE: { name: 'custrecord_twc_infra_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            INFRASTRUCTURE_TYPE: { name: 'custrecord_twc_infra_type', type: 'select', alias: 'infrastructureType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_type' },
            INFRASTRUCTURE_ID: { name: 'custrecord_twc_infra_id', type: 'text', alias: 'infrastructureID', display: 'normal', mandatory: false },
            LEGACY_ID: { name: 'custrecord_twc_infra_legacy_id', type: 'text', alias: 'legacyID', display: 'normal', mandatory: false },
            INFRASTRUCTURE_STATUS: { name: 'custrecord_twc_infra_status', type: 'select', alias: 'infrastructureStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_sts' },
            INFRASTRUCTURE_UTS_STATUS: { name: 'custrecord_twc_infra_uts_sts', type: 'select', alias: 'infrastructureUTSStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_uts_sts' },
            INFRASTRUCTURE_SRF_STATUS: { name: 'custrecord_twc_infra_srf_status', type: 'select', alias: 'infrastructureSRFStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_srf_sts' },
            INFRASTRUCTURE_SAF_STATUS: { name: 'custrecord_twc_infra_saf_status', type: 'select', alias: 'infrastructureSAFStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_saf_sts' },
            INFRASTRUCTURE_SAF_AUTO_APPROVE: { name: 'custrecord_twc_infra_saf_auto_apprv', type: 'checkbox', alias: 'infrastructureSAFAutoApprove', display: 'normal', mandatory: false },
            INFRASTRUCTURE_SCHEDULE: { name: 'custrecord_twc_infra_sch', type: 'select', alias: 'infrastructureSchedule', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_sch' },
            INFRASTRUCTURE_OWNERSHIP: { name: 'custrecord_twc_infra_ownshp', type: 'select', alias: 'infrastructureOwnership', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            O_AND_M_OWNERSHIP: { name: 'custrecord_twc_infra_om_ownshp', type: 'select', alias: 'o_and_MOwnership', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            INSURANCE_OWNERSHIP: { name: 'custrecord_twc_infra_insur_ownshp', type: 'select', alias: 'insuranceOwnership', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            MARKETING_STATUS: { name: 'custrecord_twc_infra_mktg_sts', type: 'checkbox', alias: 'marketingStatus', display: 'normal', mandatory: false },
            INFRASTRUCTURE_PUBLIC: { name: 'custrecord_twc_infra_public', type: 'select', alias: 'infrastructurePublic', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_publ' },
            INFRASTRUCTURE_COMMENTS: { name: 'custrecord_twc_infra_com', type: 'textarea', alias: 'infrastructureComments', display: 'normal', mandatory: false },
            INFRASTRUCTURE_EASTING: { name: 'custrecord_twc_infra_easting', type: 'float', alias: 'infrastructureEasting', display: 'normal', mandatory: false },
            INFRASTRUCTURE_NORTHING: { name: 'custrecord_twc_infra_northing', type: 'float', alias: 'infrastructureNorthing', display: 'normal', mandatory: false },
            INFRASTRUCTURE_LONGITUDE: { name: 'custrecord_twc_infra_lng', type: 'float', alias: 'infrastructureLongitude', display: 'normal', mandatory: false },
            INFRASTRUCTURE_LATITUDE: { name: 'custrecord_twc_infra_lat', type: 'float', alias: 'infrastructureLatitude', display: 'normal', mandatory: false },
            STRUCTURE_TYPE: { name: 'custrecord_twc_infra_str_type', type: 'select', alias: 'structureType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_str_type' },
            TOWER_FAMILY: { name: 'custrecord_twc_infra_tw_fam', type: 'select', alias: 'towerFamily', display: 'normal', mandatory: false, recordType: 'customrecord_twc_tower_family' },
            STRUCTURE_HEIGHT_M: { name: 'custrecord_twc_infra_str_ht_m', type: 'float', alias: 'structureHeightm', display: 'normal', mandatory: false },
            ROOFTOP_HEIGHT_M: { name: 'custrecord_twc_infra_rooftop_ht_m', type: 'float', alias: 'rooftopHeightm', display: 'normal', mandatory: false },
            FALL_ARREST_STATUS: { name: 'custrecord_twc_infra_fall_arr_sts', type: 'select', alias: 'fallArrestStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fall_arr_sts' },
            FALL_ARREST_TYPE: { name: 'custrecord_twc_infra_fall_arr_type', type: 'select', alias: 'fallArrestType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fall_arr_types' },
            ANTI_CLIMB: { name: 'custrecord_twc_infra_anti_climb', type: 'checkbox', alias: 'antiClimb', display: 'normal', mandatory: false },
            LAST_SITE_INSPECTION_DATE: { name: 'custrecord_twc_infra_last_site_insp_date', type: 'date', alias: 'lastSiteInspectionDate', display: 'normal', mandatory: false },
            NEXT_SITE_INSPECTION_DATE: { name: 'custrecord_twc_infra_nxt_site_insp_date', type: 'date', alias: 'nextSiteInspectionDate', display: 'normal', mandatory: false },
            LAST_FALL_ARREST_CERTIFICATION_DATE: { name: 'custrecord_twc_last_fall_cert_date', type: 'date', alias: 'lastFallArrestCertificationDate', display: 'normal', mandatory: false },
            NEXT_FALL_ARREST_CERTIFICATION_DATE: { name: 'custrecord_twc_infra_nxt_fall_cert_date', type: 'date', alias: 'nextFallArrestCertificationDate', display: 'normal', mandatory: false },
            TOWER_LAST_PAINTED_DATE: { name: 'custrecord_twc_infra_twr_lst_pnt_date', type: 'date', alias: 'towerLastPaintedDate', display: 'normal', mandatory: false },
            SCHEDULED_NEXT_PAINTING_DATE: { name: 'custrecord_twc_infra_sch_nxt_pnt_date', type: 'date', alias: 'scheduledNextPaintingDate', display: 'normal', mandatory: false },
            PAINTING_WARRANTY_EXPIRY_DATE: { name: 'custrecord_twc_infra_pnt_war_exp_date', type: 'date', alias: 'paintingWarrantyExpiryDate', display: 'normal', mandatory: false },
            PAINT_COLOUR: { name: 'custrecord_twc_infra_twr_lst_pnt_color', type: 'text', alias: 'paintColour', display: 'normal', mandatory: false },
            PAINTING_YEAR: { name: 'custrecord_twc_infra_twr_lst_pnt_year', type: 'integer', alias: 'paintingYear', display: 'normal', mandatory: false },
            STRUCTURE_DESIGN: { name: 'custrecord_twc_infra_str_design', type: 'textarea', alias: 'structureDesign', display: 'normal', mandatory: false },
            YEAR_OF_BUILD: { name: 'custrecord_twc_infra_yr_of_build', type: 'text', alias: 'yearofBuild', display: 'normal', mandatory: false },
            GEOTYPE: { name: 'custrecord_twc_infra_geotype', type: 'select', alias: 'geotype', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_geotype' },
            PROXIMITY_TO_BODY_OF_WATER_KM: { name: 'custrecord_twc_infra_prox_body_wtr_km', type: 'float', alias: 'proximitytoBodyofWaterkm', display: 'normal', mandatory: false },
            LAND_TOPOLOGY: { name: 'custrecord_twc_infra_land_topo', type: 'select', alias: 'landTopology', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_land_topo' },
            WIND_MAP_VB_MAP_MS: { name: 'custrecord_twc_infra_wind_map_vb', type: 'float', alias: 'windMapVb_mapms', display: 'normal', mandatory: false },
            FOUNDATION_TYPE: { name: 'custrecord_twc_infra_fnd_type', type: 'select', alias: 'foundationType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fnd_type' },
            FOUNDATION_DESIGN: { name: 'custrecord_twc_infra_fnd_design', type: 'textarea', alias: 'foundationDesign', display: 'normal', mandatory: false },
            FOUNDATION_DIMENSIONS: { name: 'custrecord_twc_infra_fnd_dims', type: 'text', alias: 'foundationDimensions', display: 'normal', mandatory: false },
            FOUNDATION_CONTRACTOR: { name: 'custrecord_twc_infra_fnd_contr', type: 'select', alias: 'foundationContractor', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            SOIL_BEARING_DCPSI_KNM: { name: 'custrecord_twc_infra_soil_brg_dcp_si', type: 'float', alias: 'soilBearingDCPSIkNm', display: 'normal', mandatory: false },
            GROUND_WATER_BGL: { name: 'custrecord_twc_infra_grnd_wtr', type: 'float', alias: 'groundWaterBGL', display: 'normal', mandatory: false },
            FOUNDATION_FOS: { name: 'custrecord_twc_infra_fnd_fos', type: 'float', alias: 'foundationFOS', display: 'normal', mandatory: false },
            FOUNDATION_OVERTURNING_KNM: { name: 'custrecord_twc_infra_fnd_ot', type: 'float', alias: 'foundationOverturningkNm', display: 'normal', mandatory: false },
            STRUCTURE_CAPACITY_ESA: { name: 'custrecord_twc_infra_str_cap_esa', type: 'float', alias: 'structureCapacityESA', display: 'normal', mandatory: false },
            STRUCTURE_CAPACITY_E_BM: { name: 'custrecord_twc_infra_str_cap_ebm', type: 'float', alias: 'structureCapacityE_BM', display: 'normal', mandatory: false },
            STRUCTURE_EQUIPMENT_LOADING_E_BM: { name: 'custrecord_twc_infra_str_equip_ldg_ebm', type: 'float', alias: 'structureEquipmentloadingE_BM', display: 'normal', mandatory: false },
            _PC_CAPACITY_USED: { name: 'custrecord_twc_infra_pct_cap_used', type: 'percent', alias: '_pcCapacityused', display: 'normal', mandatory: false },
            _PC_CAPACITY_REMAINING: { name: 'custrecord_twc_infra_pct_cap_rem', type: 'percent', alias: '_pcCapacityremaining', display: 'normal', mandatory: false },
            TLM: { name: 'custrecord_twc_infra_tlm', type: 'select', alias: 'tLM', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_tlm' },
            ACCOMMODATION_TYPE: { name: 'custrecord_twc_accom_type', type: 'select', alias: 'accommodationType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_accom_type' },
            LAST_AC_SERVICE: { name: 'custrecord_twc_last_ser_date', type: 'date', alias: 'lastACService', display: 'normal', mandatory: false },
            NEXT_AC_SERVICE: { name: 'custrecord_twc_infra_nxt_aircon_svc', type: 'date', alias: 'nextACService', display: 'normal', mandatory: false },
            INTRUDER_ALARM_PRESENT: { name: 'custrecord_twc_infra_intru_alrm_pres', type: 'select', alias: 'intruderAlarmPresent', display: 'normal', mandatory: false, recordType: 'customrecord1052' },
            INTRUDER_CODE: { name: 'custrecord_twc_infra_intru_code', type: 'text', alias: 'intruderCode', display: 'normal', mandatory: false },
            LAST_INTRUDER_ALARM_SERVICE: { name: 'custrecord_twc_last_int_al_ser', type: 'date', alias: 'lastIntruderAlarmService', display: 'normal', mandatory: false },
            NEXT_INTRUDER_ALARM_SERVICE: { name: 'custrecord_twc_infra_nxt_alrm_svc', type: 'date', alias: 'nextIntruderAlarmService', display: 'normal', mandatory: false },
            INTRUDER_ALARM_COMMENT: { name: 'custrecord_twc_int_al_com', type: 'textarea', alias: 'intruderAlarmComment', display: 'normal', mandatory: false },
            FIRE_ALARM_PRESENT: { name: 'custrecord_twc_infra_fire_alrm_pres', type: 'select', alias: 'fireAlarmPresent', display: 'normal', mandatory: false, recordType: 'customrecord1053' },
            LAST_FIRE_ALARM_SERVICE: { name: 'custrecord_twc_last_fire_ser', type: 'date', alias: 'lastFireAlarmService', display: 'normal', mandatory: false },
            NEXT_FIRE_ALARM_SERVICE: { name: 'custrecord_twc_infra_nxt_fire_svc', type: 'date', alias: 'nextFireAlarmService', display: 'normal', mandatory: false },
            FIRE_ALARM_COMMENT: { name: 'custrecord_twc_fire_al_com', type: 'textarea', alias: 'fireAlarmComment', display: 'normal', mandatory: false },
            FIRE_EXTINGUISHER: { name: 'custrecord_twc_infra_fire_extin', type: 'select', alias: 'fireExtinguisher', display: 'normal', mandatory: false, recordType: 'customrecord_ossm_twc_fire_extinguisher' },
            LAST_FIRE_EXTINGUISHER_SERVICE: { name: 'custrecord_twc_last_fire_ser_date', type: 'date', alias: 'lastFireExtinguisherService', display: 'normal', mandatory: false },
            NEXT_FIRE_EXTINGUISHER_SERVICE: { name: 'custrecord_twc_nxt_fire_ser_date', type: 'date', alias: 'nextFireExtinguisherService', display: 'normal', mandatory: false },
            GENERATOR_MODEL: { name: 'custrecord_twc_infra_gen_model', type: 'text', alias: 'generatorModel', display: 'normal', mandatory: false },
            POWER_CAPACITY: { name: 'custrecord_twc_infra_pwr_cap', type: 'integer', alias: 'powerCapacity', display: 'normal', mandatory: false },
            TANK_CAPACITY_L: { name: 'custrecord_twc_infra_tnk_cap_l', type: 'integer', alias: 'tankCapacityl', display: 'normal', mandatory: false },
            NEXT_GENERATOR_SERVICE: { name: 'custrecord_twc_infra_nxt_gen_svc', type: 'date', alias: 'nextGeneratorService', display: 'normal', mandatory: false },
            NEXT_GENERATOR_SERVICE_TYPE: { name: 'custrecord_twc_infra_nxt_gen_svc_type', type: 'select', alias: 'nextGeneratorServiceType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_nxt_gen_svc_type' },
            FIBRE_DUCT_INSTALLED: { name: 'custrecord_twc_infra_fibre_duct_instal', type: 'select', alias: 'fibreDuctInstalled', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fibre_duct_inst' },
            FIBRE_INFRASTRUCTURE_TYPE: { name: 'custrecord_twc_infra_fibre_infra_type', type: 'select', alias: 'fibreInfrastructureType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fibre_type' },
            FIBRE_SERVICE_PROVIDERS: { name: 'custrecord_twc_infra_fibre_svc_providers', type: 'multiselect', alias: 'fibreServiceProviders', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fibre_svc_provide' },
            FIBRE_COMMENTS: { name: 'custrecord_twc_infra_fibre_comm', type: 'text', alias: 'fibreComments', display: 'normal', mandatory: false },
            BOTTOM_WIDTH_MM: { name: 'custrecord_twc_infra_bot_width', type: 'integer', alias: 'bottomWidthmm', display: 'normal', mandatory: false },
            TOP_WIDTH_MM: { name: 'custrecord_twc_infra_top_width', type: 'integer', alias: 'topWidthmm', display: 'normal', mandatory: false },
            TOWER_SECTIONS_BOTTOM_TOP: { name: 'custrecord_twc_infra_sect_bot_top', type: 'text', alias: 'towerSectionsBottom_Top', display: 'normal', mandatory: false },
            TOWER_SECTION_1: { name: 'custrecord_twc_infra_sect_1', type: 'text', alias: 'towerSection1', display: 'normal', mandatory: false },
            TOWER_SECTION_2: { name: 'custrecord_twc_infra_sect_2', type: 'text', alias: 'towerSection2', display: 'normal', mandatory: false },
            TOWER_SECTION_3: { name: 'custrecord_twc_infra_sect_3', type: 'text', alias: 'towerSection3', display: 'normal', mandatory: false },
            TOWER_SECTION_4: { name: 'custrecord_twc_infra_sect_4', type: 'text', alias: 'towerSection4', display: 'normal', mandatory: false },
            TOWER_SECTION_5: { name: 'custrecord_twc_infra_sect_5', type: 'text', alias: 'towerSection5', display: 'normal', mandatory: false },
            TOWER_SECTION_6: { name: 'custrecord_twc_infra_sect_6', type: 'text', alias: 'towerSection6', display: 'normal', mandatory: false },
            STRUCTURAL_COMMENTS: { name: 'custrecord_twc_infra_struct_comments', type: 'textarea', alias: 'structuralComments', display: 'normal', mandatory: false },
            HEIGHT_ASL_M: { name: 'custrecord_twc_infra_height_asl', type: 'integer', alias: 'heightASLm', display: 'locked', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_Infrastructure extends customRec.RecordBase {
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
            
            get infrastructureStatus() {
                return this.get(_recordFields.INFRASTRUCTURE_STATUS);
            } set infrastructureStatus(value) {
                this.set(_recordFields.INFRASTRUCTURE_STATUS, value)
            }
            get infrastructureStatusName() { return this.getText(_recordFields.INFRASTRUCTURE_STATUS); }
            
            get infrastructureUTSStatus() {
                return this.get(_recordFields.INFRASTRUCTURE_UTS_STATUS);
            } set infrastructureUTSStatus(value) {
                this.set(_recordFields.INFRASTRUCTURE_UTS_STATUS, value)
            }
            get infrastructureUTSStatusName() { return this.getText(_recordFields.INFRASTRUCTURE_UTS_STATUS); }
            
            get infrastructureSRFStatus() {
                return this.get(_recordFields.INFRASTRUCTURE_SRF_STATUS);
            } set infrastructureSRFStatus(value) {
                this.set(_recordFields.INFRASTRUCTURE_SRF_STATUS, value)
            }
            get infrastructureSRFStatusName() { return this.getText(_recordFields.INFRASTRUCTURE_SRF_STATUS); }
            
            get infrastructureSAFStatus() {
                return this.get(_recordFields.INFRASTRUCTURE_SAF_STATUS);
            } set infrastructureSAFStatus(value) {
                this.set(_recordFields.INFRASTRUCTURE_SAF_STATUS, value)
            }
            get infrastructureSAFStatusName() { return this.getText(_recordFields.INFRASTRUCTURE_SAF_STATUS); }
            
            get infrastructureSAFAutoApprove() {
                return this.get(_recordFields.INFRASTRUCTURE_SAF_AUTO_APPROVE);
            } set infrastructureSAFAutoApprove(value) {
                this.set(_recordFields.INFRASTRUCTURE_SAF_AUTO_APPROVE, value)
            }
            
            get infrastructureSchedule() {
                return this.get(_recordFields.INFRASTRUCTURE_SCHEDULE);
            } set infrastructureSchedule(value) {
                this.set(_recordFields.INFRASTRUCTURE_SCHEDULE, value)
            }
            get infrastructureScheduleName() { return this.getText(_recordFields.INFRASTRUCTURE_SCHEDULE); }
            
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
            
            get infrastructurePublic() {
                return this.get(_recordFields.INFRASTRUCTURE_PUBLIC);
            } set infrastructurePublic(value) {
                this.set(_recordFields.INFRASTRUCTURE_PUBLIC, value)
            }
            get infrastructurePublicName() { return this.getText(_recordFields.INFRASTRUCTURE_PUBLIC); }
            
            get infrastructureComments() {
                return this.get(_recordFields.INFRASTRUCTURE_COMMENTS);
            } set infrastructureComments(value) {
                this.set(_recordFields.INFRASTRUCTURE_COMMENTS, value)
            }
            
            get infrastructureEasting() {
                return this.get(_recordFields.INFRASTRUCTURE_EASTING);
            } set infrastructureEasting(value) {
                this.set(_recordFields.INFRASTRUCTURE_EASTING, value)
            }
            
            get infrastructureNorthing() {
                return this.get(_recordFields.INFRASTRUCTURE_NORTHING);
            } set infrastructureNorthing(value) {
                this.set(_recordFields.INFRASTRUCTURE_NORTHING, value)
            }
            
            get infrastructureLongitude() {
                return this.get(_recordFields.INFRASTRUCTURE_LONGITUDE);
            } set infrastructureLongitude(value) {
                this.set(_recordFields.INFRASTRUCTURE_LONGITUDE, value)
            }
            
            get infrastructureLatitude() {
                return this.get(_recordFields.INFRASTRUCTURE_LATITUDE);
            } set infrastructureLatitude(value) {
                this.set(_recordFields.INFRASTRUCTURE_LATITUDE, value)
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
            
            get lastSiteInspectionDate() {
                return this.get(_recordFields.LAST_SITE_INSPECTION_DATE);
            } set lastSiteInspectionDate(value) {
                this.set(_recordFields.LAST_SITE_INSPECTION_DATE, value)
            }
            
            get nextSiteInspectionDate() {
                return this.get(_recordFields.NEXT_SITE_INSPECTION_DATE);
            } set nextSiteInspectionDate(value) {
                this.set(_recordFields.NEXT_SITE_INSPECTION_DATE, value)
            }
            
            get lastFallArrestCertificationDate() {
                return this.get(_recordFields.LAST_FALL_ARREST_CERTIFICATION_DATE);
            } set lastFallArrestCertificationDate(value) {
                this.set(_recordFields.LAST_FALL_ARREST_CERTIFICATION_DATE, value)
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
            
            get paintColour() {
                return this.get(_recordFields.PAINT_COLOUR);
            } set paintColour(value) {
                this.set(_recordFields.PAINT_COLOUR, value)
            }
            
            get paintingYear() {
                return this.get(_recordFields.PAINTING_YEAR);
            } set paintingYear(value) {
                this.set(_recordFields.PAINTING_YEAR, value)
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
            
            get accommodationType() {
                return this.get(_recordFields.ACCOMMODATION_TYPE);
            } set accommodationType(value) {
                this.set(_recordFields.ACCOMMODATION_TYPE, value)
            }
            get accommodationTypeName() { return this.getText(_recordFields.ACCOMMODATION_TYPE); }
            
            get lastACService() {
                return this.get(_recordFields.LAST_AC_SERVICE);
            } set lastACService(value) {
                this.set(_recordFields.LAST_AC_SERVICE, value)
            }
            
            get nextACService() {
                return this.get(_recordFields.NEXT_AC_SERVICE);
            } set nextACService(value) {
                this.set(_recordFields.NEXT_AC_SERVICE, value)
            }
            
            get intruderAlarmPresent() {
                return this.get(_recordFields.INTRUDER_ALARM_PRESENT);
            } set intruderAlarmPresent(value) {
                this.set(_recordFields.INTRUDER_ALARM_PRESENT, value)
            }
            get intruderAlarmPresentName() { return this.getText(_recordFields.INTRUDER_ALARM_PRESENT); }
            
            get intruderCode() {
                return this.get(_recordFields.INTRUDER_CODE);
            } set intruderCode(value) {
                this.set(_recordFields.INTRUDER_CODE, value)
            }
            
            get lastIntruderAlarmService() {
                return this.get(_recordFields.LAST_INTRUDER_ALARM_SERVICE);
            } set lastIntruderAlarmService(value) {
                this.set(_recordFields.LAST_INTRUDER_ALARM_SERVICE, value)
            }
            
            get nextIntruderAlarmService() {
                return this.get(_recordFields.NEXT_INTRUDER_ALARM_SERVICE);
            } set nextIntruderAlarmService(value) {
                this.set(_recordFields.NEXT_INTRUDER_ALARM_SERVICE, value)
            }
            
            get intruderAlarmComment() {
                return this.get(_recordFields.INTRUDER_ALARM_COMMENT);
            } set intruderAlarmComment(value) {
                this.set(_recordFields.INTRUDER_ALARM_COMMENT, value)
            }
            
            get fireAlarmPresent() {
                return this.get(_recordFields.FIRE_ALARM_PRESENT);
            } set fireAlarmPresent(value) {
                this.set(_recordFields.FIRE_ALARM_PRESENT, value)
            }
            get fireAlarmPresentName() { return this.getText(_recordFields.FIRE_ALARM_PRESENT); }
            
            get lastFireAlarmService() {
                return this.get(_recordFields.LAST_FIRE_ALARM_SERVICE);
            } set lastFireAlarmService(value) {
                this.set(_recordFields.LAST_FIRE_ALARM_SERVICE, value)
            }
            
            get nextFireAlarmService() {
                return this.get(_recordFields.NEXT_FIRE_ALARM_SERVICE);
            } set nextFireAlarmService(value) {
                this.set(_recordFields.NEXT_FIRE_ALARM_SERVICE, value)
            }
            
            get fireAlarmComment() {
                return this.get(_recordFields.FIRE_ALARM_COMMENT);
            } set fireAlarmComment(value) {
                this.set(_recordFields.FIRE_ALARM_COMMENT, value)
            }
            
            get fireExtinguisher() {
                return this.get(_recordFields.FIRE_EXTINGUISHER);
            } set fireExtinguisher(value) {
                this.set(_recordFields.FIRE_EXTINGUISHER, value)
            }
            get fireExtinguisherName() { return this.getText(_recordFields.FIRE_EXTINGUISHER); }
            
            get lastFireExtinguisherService() {
                return this.get(_recordFields.LAST_FIRE_EXTINGUISHER_SERVICE);
            } set lastFireExtinguisherService(value) {
                this.set(_recordFields.LAST_FIRE_EXTINGUISHER_SERVICE, value)
            }
            
            get nextFireExtinguisherService() {
                return this.get(_recordFields.NEXT_FIRE_EXTINGUISHER_SERVICE);
            } set nextFireExtinguisherService(value) {
                this.set(_recordFields.NEXT_FIRE_EXTINGUISHER_SERVICE, value)
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
            
            get fibreDuctInstalled() {
                return this.get(_recordFields.FIBRE_DUCT_INSTALLED);
            } set fibreDuctInstalled(value) {
                this.set(_recordFields.FIBRE_DUCT_INSTALLED, value)
            }
            get fibreDuctInstalledName() { return this.getText(_recordFields.FIBRE_DUCT_INSTALLED); }
            
            get fibreInfrastructureType() {
                return this.get(_recordFields.FIBRE_INFRASTRUCTURE_TYPE);
            } set fibreInfrastructureType(value) {
                this.set(_recordFields.FIBRE_INFRASTRUCTURE_TYPE, value)
            }
            get fibreInfrastructureTypeName() { return this.getText(_recordFields.FIBRE_INFRASTRUCTURE_TYPE); }
            
            get fibreServiceProviders() {
                return this.get(_recordFields.FIBRE_SERVICE_PROVIDERS);
            } set fibreServiceProviders(value) {
                this.set(_recordFields.FIBRE_SERVICE_PROVIDERS, value)
            }
            get fibreServiceProvidersName() { return this.getText(_recordFields.FIBRE_SERVICE_PROVIDERS); }
            
            get fibreComments() {
                return this.get(_recordFields.FIBRE_COMMENTS);
            } set fibreComments(value) {
                this.set(_recordFields.FIBRE_COMMENTS, value)
            }
            
            get bottomWidthmm() {
                return this.get(_recordFields.BOTTOM_WIDTH_MM);
            } set bottomWidthmm(value) {
                this.set(_recordFields.BOTTOM_WIDTH_MM, value)
            }
            
            get topWidthmm() {
                return this.get(_recordFields.TOP_WIDTH_MM);
            } set topWidthmm(value) {
                this.set(_recordFields.TOP_WIDTH_MM, value)
            }
            
            get towerSectionsBottom_Top() {
                return this.get(_recordFields.TOWER_SECTIONS_BOTTOM_TOP);
            } set towerSectionsBottom_Top(value) {
                this.set(_recordFields.TOWER_SECTIONS_BOTTOM_TOP, value)
            }
            
            get towerSection1() {
                return this.get(_recordFields.TOWER_SECTION_1);
            } set towerSection1(value) {
                this.set(_recordFields.TOWER_SECTION_1, value)
            }
            
            get towerSection2() {
                return this.get(_recordFields.TOWER_SECTION_2);
            } set towerSection2(value) {
                this.set(_recordFields.TOWER_SECTION_2, value)
            }
            
            get towerSection3() {
                return this.get(_recordFields.TOWER_SECTION_3);
            } set towerSection3(value) {
                this.set(_recordFields.TOWER_SECTION_3, value)
            }
            
            get towerSection4() {
                return this.get(_recordFields.TOWER_SECTION_4);
            } set towerSection4(value) {
                this.set(_recordFields.TOWER_SECTION_4, value)
            }
            
            get towerSection5() {
                return this.get(_recordFields.TOWER_SECTION_5);
            } set towerSection5(value) {
                this.set(_recordFields.TOWER_SECTION_5, value)
            }
            
            get towerSection6() {
                return this.get(_recordFields.TOWER_SECTION_6);
            } set towerSection6(value) {
                this.set(_recordFields.TOWER_SECTION_6, value)
            }
            
            get structuralComments() {
                return this.get(_recordFields.STRUCTURAL_COMMENTS);
            } set structuralComments(value) {
                this.set(_recordFields.STRUCTURAL_COMMENTS, value)
            }
            
            get heightASLm() {
                return this.get(_recordFields.HEIGHT_ASL_M);
            } set heightASLm(value) {
                this.set(_recordFields.HEIGHT_ASL_M, value)
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
            PersistentRecord: OSSMTWC_Infrastructure,

            get: function (id, staticLoad) {
                var rec = new OSSMTWC_Infrastructure(id, staticLoad);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Infrastructure();
                return rec.select(options);
            }

        }
    });
