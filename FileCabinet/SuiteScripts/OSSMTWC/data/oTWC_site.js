/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (core, coreSQL) => {

        const RECORD_TYPE = 'customrecord_twc_site';

        const _recordFields = {
            NAME: 'name',
            RADIX_ID: 'custrecord_twc_site_radix_tbl_entry_no',
            SITE_ID: 'custrecord_twc_site_id',
            SITE_NAME: 'custrecord_twc_site_name',
            ALIAS: 'custrecord_twc_site_alias',
            SITE_STATUS: 'custrecord_twc_site_status',
            SITE_TYPE: 'custrecord_twc_site_type',
            MULTI_MAST_SITES: 'custrecord_twc_site_multi_mast_sites',
            OLD_ID: 'custrecord_twc_site_old_id',
            STRUCTURES_LIST: 'custrecord_twc_site_str_list',
            ACCOMMODATION_LIST: 'custrecord_twc_site_ac_list',
            FIBRE_LIST: 'custrecord_twc_site_fibre_list',
            HEIGHT_ASL_M: 'custrecord_twc_site_height_asl',
            SITE_LEVEL: 'custrecord_twc_site_level',
            PORTFOLIO: 'custrecord_twc_site_portfolio',
            SRF_STATUS: 'custrecord_twc_site_srf_status',
            SAF_STATUS: 'custrecord_twc_site_saf_status',
            PUBLIC: 'custrecord_twc_site_public',
            BTS_STATUS: 'custrecord_twc_site_bts_status',
            ADDRESS: 'custrecord_twc_site_address',
            COUNTY: 'custrecord_twc_site_country',
            EASTING: 'custrecord_twc_site_easting',
            NORTHING: 'custrecord_twc_site_northing',
            LONGITUDE: 'custrecord_twc_site_longitude',
            LATITUDE: 'custrecord_twc_site_latitude',
            SAF_AUTO_APPROVE: 'custrecord_twc_site_saf_auto_approve',
            TRACK_TYPE: 'custrecord_twc_site_track_type',
            EASTING_ACCESS: 'custrecord_twc_site_easting_access',
            NORTHING_ACCESS: 'custrecord_twc_site_northing_access',
            LONGITUDE_ACCESS: 'custrecord_twc_site_longitude_access',
            LATITUDE_ACCESS: 'custrecord_twc_site_latitude_access',
            DIRECTIONS: 'custrecord_twc_site_directions',
            INSTRUCTIONS: 'custrecord_twc_site_instructions',
            TENANT_CARD_REQUIRED: 'custrecord_twc_site_tenant_card_req',
            FOUR_BY_FOUR_REQUIRED: 'custrecord_twc_site_4x4_req',
            PARKING_RESTRICTIONS: 'custrecord_twc_site_parking_restr',
            CRANEMEWP_ACCESS: 'custrecord_twc_site_crane_mewp_access',
            DUAL_LOCK_INSTALLED: 'custrecord_twc_site_dual_lock_installed',
            SITE_LOCKS: 'custrecord_twc_site_lock',
            SAFETY__SPECIAL_NOTES: 'custrecord_twc_site_safety_spl_notes',
            CURRENT_LAND_AGREEMENT: 'custrecord_twc_site_curr_land_agr',
            SUPERCEDED_LAND_AGREEMENT: 'custrecord_twc_site_super_land_agr',
            IN_PROGRESS_LAND_AGREEMENT: 'custrecord_twc_site_in_prog_land_agr',
            CURRENT_ROW: 'custrecord_twc_site_curr_row',
            SECONDARY_ROW: 'custrecord_twc_site_sec_row',
            IN_PROGRESS_ROW: 'custrecord_twc_site_in_prog_row',
            FULL_DEMISED_AREA_FENCED: 'custrecord_twc_site_full_dmed_area_fncd',
            ADJACENT_GROUND_SPACE: 'custrecord_twc_site_adj_grnd_space',
            ADJACENT_GROUND_OWNER: 'custrecord_twc_site_adj_grnd_owner',
            PERIMETER_TYPE: 'custrecord_twc_site_perimeter_type',
            FENCE_HEIGHT_M: 'custrecord_twc_site_fence_height_m',
            INDEPENDENT_POWER_SUPPLIES: 'custrecord_twc_site_indep_pwr_supp',
            AVAILABLE_METER_SLOTS: 'custrecord_twc_site_avail_mtr_slots',
            POWER_SUPPLIES: 'custrecord_twc_site_pwr_supp',
            GENERATOR: 'custrecord_twc_site_generator',
            NEXT_GENERATOR_SERVICE: 'custrecord_twc_site_nxt_gen_svc',
            NEXT_EARTH__AND__LP_TEST: 'custrecord_twc_site_nxt_earth_lp_test',
            EARTH__AND__LP_INSPECTIONS: 'custrecord_twc_site_elp_insp',
            NEXT_STRUCTURE_INSPECTION_DATE: 'custrecord_twc_site_nxt_str_insp_date',
            NEXT_FALL_ARREST_CERTIFICATION_DATE: 'custrecord_twc_site_nxt_fall_cert_date',
            NEXT_TOWER_PAINTING_DATE: 'custrecord_twc_site_nxt_twr_pnt_date',
            INSPECTIONS: 'custrecord_twc_site_inspections',
            NEXT_AIRCON_SERVICE_DATE: 'custrecord_twc_site_nxt_aircon_svc_date',
            NEXT_FIRE_SERVICE_DATE: 'custrecord_twc_site_nxt_fire_svc_date',
            NEXT_ALARM_SERVICE_DATE: 'custrecord_twc_site_nxt_alarm_svc_date',
            FACILITIES_SERVICES: 'custrecord_twc_site_fac_svc',
            MARKETING_STATUS: 'custrecord_twc_site_mktg_sts',
            CUSTOMER_PRESENCE: 'custrecord_twc_site_cust_presence',
            THREE_SITE_REF: 'custrecord_twc_site_three_site_ref',
            VODAFONE_SITE_REF: 'custrecord_twc_site_vodafone_site_ref',
            EIR_MOBILE_SITE_REF: 'custrecord_twc_site_eir_mob_site_ref',
            TI_SITE_REF: 'custrecord_twc_site_ti_site_ref',
            MNO_OCCUPANCY: 'custrecord_twc_site_mno_occ',
            NON_MNO_OCCUPANCY: 'custrecord_twc_site_non_mno_occ',
            OCCUPANCY: 'custrecord_twc_site_occ',




            // @@TODO: this does not yet exists on site table
            REGION: 'custrecord_twc_site_region',
        }


        function getSiteFields() {
            return coreSQL.run(`
                select      cf.fieldvaluetype as field_type, LOWER(cf.scriptid) as field_id, cf.name as field_label, lower(l.scriptid) as field_foreign_table
                from        customfield cf
                join        customrecordtype c on c.internalid = cf.recordtype
                left join   customrecordtype l on l.internalid = cf.fieldvaluetyperecord
                where       c.scriptid = UPPER('${RECORD_TYPE}')
                order by id
            `);
        }


        return {
            Type: RECORD_TYPE,
            Fields: _recordFields,

            getFields: getSiteFields
        }
    });
