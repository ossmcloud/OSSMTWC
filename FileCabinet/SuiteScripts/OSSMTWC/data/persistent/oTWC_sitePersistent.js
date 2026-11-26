/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_site';
        var _recordFields = {
            NAME: 'name',
            RADIX_SITE_TABLE_ENTRY_NUMBER: 'custrecord_twc_site_radix_tbl_entry_no',
            SITE_ID: 'custrecord_twc_site_id',
            SITE_NAME: 'custrecord_twc_site_name',
            ALIAS: 'custrecord_twc_site_alias',
            SITE_STATUS: 'custrecord_twc_site_status',
            SITE_TYPE: 'custrecord_twc_site_type',
            SITE_OLD_ID: 'custrecord_twc_site_old_id',
            HEIGHT_ASL_M: 'custrecord_twc_site_height_asl',
            SITE_LEVEL: 'custrecord_twc_site_level',
            SITE_PORTFOLIO: 'custrecord_twc_site_portfolio',
            SITE_PUBLIC: 'custrecord_twc_site_public',
            BTS_STATUS: 'custrecord_twc_site_bts_status',
            ADDRESS: 'custrecord_twc_site_address',
            ADDRESS_EIRCODE: 'custrecord_twc_site_address_zip',
            ADDRESS_COUNTY: 'custrecord_twc_site_address_county',
            SITE_EASTING: 'custrecord_twc_site_easting',
            SITE_NORTHING: 'custrecord_twc_site_northing',
            SITE_LONGITUDE: 'custrecord_twc_site_longitude',
            SITE_LATITUDE: 'custrecord_twc_site_latitude',
            SITE_SAF_AUTO_APPROVE: 'custrecord_twc_site_saf_auto_approve',
            SITE_SAF_STATUS: 'custrecord_twc_site_saf_status',
            TRACK_TYPE: 'custrecord_twc_site_track_type',
            ACCESS_EASTING: 'custrecord_twc_site_easting_access',
            ACCESS_NORTHING: 'custrecord_twc_site_northing_access',
            ACCESS_LONGITUDE: 'custrecord_twc_site_longitude_access',
            ACCESS_LATITUDE: 'custrecord_twc_site_latitude_access',
            DIRECTIONS: 'custrecord_twc_site_directions',
            ACCESS_INSTRUCTIONS: 'custrecord_twc_site_instructions',
            TENANT_CARD_REQUIRED: 'custrecord_twc_site_tenant_card_req',
            FOURX4_REQUIRED: 'custrecord_twc_site_4x4_req',
            PARKING_RESTRICTIONS: 'custrecord_twc_site_parking_restr',
            CRANEMEWP_ACCESS: 'custrecord_twc_site_crane_mewp_access',
            SAFETY__SPECIAL_NOTES: 'custrecord_twc_site_safety_spl_notes',
            FULL_DEMISED_AREA_FENCED: 'custrecord_twc_site_full_dmed_area_fncd',
            ADJACENT_GROUND_SPACE: 'custrecord_twc_site_adj_grnd_space',
            ADJACENT_GROUND_OWNER: 'custrecord_twc_site_adj_grnd_owner',
            PERIMETER_TYPE: 'custrecord_twc_site_perimeter_type',
            FENCE_HEIGHT_M: 'custrecord_twc_site_fence_height_m',
            INDEPENDENT_POWER_SUPPLIES: 'custrecord_twc_site_indep_pwr_supp',
            NEXT_EARTH__AND__LP_TEST: 'custrecord_twc_site_nxt_earth_lp_test',
            MARKETING_STATUS: 'custrecord_twc_site_mktg_sts',
            MNO_OCCUPANCY: 'custrecord_twc_site_mno_occ',
            NON_MNO_OCCUPANCY: 'custrecord_twc_site_non_mno_occ',
            OCCUPANCY: 'custrecord_twc_site_occ',
            SITE_WHAT3WORDS: 'custrecord_twc_site_what3words',
            ACCESS_WHAT3WORDS: 'custrecord_twc_site_acc_wt3words',
            SITE_SRF_STATUS: 'custrecord_twc_site_srf_status',
            SITE_FIBRE_SERVICE_PROVIDERS: 'custrecord_twc_site_fiber_svc_providers',
            ORIGIN_SITE_ID: 'custrecord_twc_site_origin_site_id',
            FIRE_EXTINGUISHER: 'custrecord_twc_site_fire_exting',
            FINANCIAL_STATUS: 'custrecord_ossm_twcm_site_fin_status',
            PROXIMITY_TO_BODY_OF_WATER_KM: 'custrecord_twc_site_prox_body_wtr_km',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            RADIX_SITE_TABLE_ENTRY_NUMBER: { name: 'custrecord_twc_site_radix_tbl_entry_no', type: 'integer', alias: 'rADIXSiteTableentrynumber', display: 'normal', mandatory: false },
            SITE_ID: { name: 'custrecord_twc_site_id', type: 'text', alias: 'siteID', display: 'normal', mandatory: false },
            SITE_NAME: { name: 'custrecord_twc_site_name', type: 'text', alias: 'siteName', display: 'normal', mandatory: false },
            ALIAS: { name: 'custrecord_twc_site_alias', type: 'text', alias: 'alias', display: 'normal', mandatory: false },
            SITE_STATUS: { name: 'custrecord_twc_site_status', type: 'select', alias: 'siteStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_sts' },
            SITE_TYPE: { name: 'custrecord_twc_site_type', type: 'select', alias: 'siteType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_type' },
            SITE_OLD_ID: { name: 'custrecord_twc_site_old_id', type: 'text', alias: 'siteOldID', display: 'normal', mandatory: false },
            HEIGHT_ASL_M: { name: 'custrecord_twc_site_height_asl', type: 'integer', alias: 'heightASLm', display: 'normal', mandatory: false },
            SITE_LEVEL: { name: 'custrecord_twc_site_level', type: 'select', alias: 'siteLevel', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_level' },
            SITE_PORTFOLIO: { name: 'custrecord_twc_site_portfolio', type: 'select', alias: 'sitePortfolio', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_portfolio' },
            SITE_PUBLIC: { name: 'custrecord_twc_site_public', type: 'select', alias: 'sitePublic', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_public' },
            BTS_STATUS: { name: 'custrecord_twc_site_bts_status', type: 'select', alias: 'bTSStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_bts_sts' },
            ADDRESS: { name: 'custrecord_twc_site_address', type: 'text', alias: 'address', display: 'normal', mandatory: false },
            ADDRESS_EIRCODE: { name: 'custrecord_twc_site_address_zip', type: 'text', alias: 'addressEircode', display: 'normal', mandatory: false },
            ADDRESS_COUNTY: { name: 'custrecord_twc_site_address_county', type: 'select', alias: 'addressCounty', display: 'normal', mandatory: false, recordType: '-195' },
            SITE_EASTING: { name: 'custrecord_twc_site_easting', type: 'float', alias: 'siteEasting', display: 'normal', mandatory: false },
            SITE_NORTHING: { name: 'custrecord_twc_site_northing', type: 'float', alias: 'siteNorthing', display: 'normal', mandatory: false },
            SITE_LONGITUDE: { name: 'custrecord_twc_site_longitude', type: 'float', alias: 'siteLongitude', display: 'normal', mandatory: false },
            SITE_LATITUDE: { name: 'custrecord_twc_site_latitude', type: 'float', alias: 'siteLatitude', display: 'normal', mandatory: false },
            SITE_SAF_AUTO_APPROVE: { name: 'custrecord_twc_site_saf_auto_approve', type: 'checkbox', alias: 'siteSAFAutoApprove', display: 'normal', mandatory: false },
            SITE_SAF_STATUS: { name: 'custrecord_twc_site_saf_status', type: 'select', alias: 'siteSAFStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_saf_sts' },
            TRACK_TYPE: { name: 'custrecord_twc_site_track_type', type: 'select', alias: 'trackType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_track_type' },
            ACCESS_EASTING: { name: 'custrecord_twc_site_easting_access', type: 'float', alias: 'accessEasting', display: 'normal', mandatory: false },
            ACCESS_NORTHING: { name: 'custrecord_twc_site_northing_access', type: 'float', alias: 'accessNorthing', display: 'normal', mandatory: false },
            ACCESS_LONGITUDE: { name: 'custrecord_twc_site_longitude_access', type: 'float', alias: 'accessLongitude', display: 'normal', mandatory: false },
            ACCESS_LATITUDE: { name: 'custrecord_twc_site_latitude_access', type: 'float', alias: 'accessLatitude', display: 'normal', mandatory: false },
            DIRECTIONS: { name: 'custrecord_twc_site_directions', type: 'clobtext', alias: 'directions', display: 'normal', mandatory: false },
            ACCESS_INSTRUCTIONS: { name: 'custrecord_twc_site_instructions', type: 'clobtext', alias: 'accessInstructions', display: 'normal', mandatory: false },
            TENANT_CARD_REQUIRED: { name: 'custrecord_twc_site_tenant_card_req', type: 'checkbox', alias: 'tenantCardRequired', display: 'normal', mandatory: false },
            FOURX4_REQUIRED: { name: 'custrecord_twc_site_4x4_req', type: 'checkbox', alias: 'fourx4Required', display: 'normal', mandatory: false },
            PARKING_RESTRICTIONS: { name: 'custrecord_twc_site_parking_restr', type: 'textarea', alias: 'parkingRestrictions', display: 'normal', mandatory: false },
            CRANEMEWP_ACCESS: { name: 'custrecord_twc_site_crane_mewp_access', type: 'checkbox', alias: 'craneMewpAccess', display: 'normal', mandatory: false },
            SAFETY__SPECIAL_NOTES: { name: 'custrecord_twc_site_safety_spl_notes', type: 'clobtext', alias: 'safetySpecialNotes', display: 'normal', mandatory: false },
            FULL_DEMISED_AREA_FENCED: { name: 'custrecord_twc_site_full_dmed_area_fncd', type: 'checkbox', alias: 'fullDemisedAreaFenced', display: 'normal', mandatory: false },
            ADJACENT_GROUND_SPACE: { name: 'custrecord_twc_site_adj_grnd_space', type: 'checkbox', alias: 'adjacentGroundSpace', display: 'normal', mandatory: false },
            ADJACENT_GROUND_OWNER: { name: 'custrecord_twc_site_adj_grnd_owner', type: 'text', alias: 'adjacentGroundOwner', display: 'normal', mandatory: false },
            PERIMETER_TYPE: { name: 'custrecord_twc_site_perimeter_type', type: 'select', alias: 'perimeterType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_perimeter_type' },
            FENCE_HEIGHT_M: { name: 'custrecord_twc_site_fence_height_m', type: 'float', alias: 'fenceHeightm', display: 'normal', mandatory: false },
            INDEPENDENT_POWER_SUPPLIES: { name: 'custrecord_twc_site_indep_pwr_supp', type: 'integer', alias: 'independentPowerSupplies', display: 'normal', mandatory: false },
            NEXT_EARTH__AND__LP_TEST: { name: 'custrecord_twc_site_nxt_earth_lp_test', type: 'date', alias: 'nextEarth_and_LPTest', display: 'normal', mandatory: false },
            MARKETING_STATUS: { name: 'custrecord_twc_site_mktg_sts', type: 'checkbox', alias: 'marketingStatus', display: 'normal', mandatory: false },
            MNO_OCCUPANCY: { name: 'custrecord_twc_site_mno_occ', type: 'integer', alias: 'mNOOccupancy', display: 'normal', mandatory: false },
            NON_MNO_OCCUPANCY: { name: 'custrecord_twc_site_non_mno_occ', type: 'integer', alias: 'non_MNOOccupancy', display: 'normal', mandatory: false },
            OCCUPANCY: { name: 'custrecord_twc_site_occ', type: 'integer', alias: 'occupancy', display: 'normal', mandatory: false },
            SITE_WHAT3WORDS: { name: 'custrecord_twc_site_what3words', type: 'text', alias: 'siteWhat3Words', display: 'normal', mandatory: false },
            ACCESS_WHAT3WORDS: { name: 'custrecord_twc_site_acc_wt3words', type: 'text', alias: 'accessWhat3Words', display: 'normal', mandatory: false },
            SITE_SRF_STATUS: { name: 'custrecord_twc_site_srf_status', type: 'select', alias: 'siteSRFStatus', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site_srf_status' },
            SITE_FIBRE_SERVICE_PROVIDERS: { name: 'custrecord_twc_site_fiber_svc_providers', type: 'multiselect', alias: 'siteFibreServiceProviders', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fibre_svc_provide' },
            ORIGIN_SITE_ID: { name: 'custrecord_twc_site_origin_site_id', type: 'text', alias: 'originSiteID', display: 'normal', mandatory: false },
            FIRE_EXTINGUISHER: { name: 'custrecord_twc_site_fire_exting', type: 'select', alias: 'fireExtinguisher', display: 'normal', mandatory: false, recordType: 'customrecord_ossm_twc_fire_extinguisher' },
            FINANCIAL_STATUS: { name: 'custrecord_ossm_twcm_site_fin_status', type: 'text', alias: 'financialStatus', display: 'normal', mandatory: false },
            PROXIMITY_TO_BODY_OF_WATER_KM: { name: 'custrecord_twc_site_prox_body_wtr_km', type: 'float', alias: 'proximitytoBodyofWaterkm', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_Site extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get rADIXSiteTableentrynumber() {
                return this.get(_recordFields.RADIX_SITE_TABLE_ENTRY_NUMBER);
            } set rADIXSiteTableentrynumber(value) {
                this.set(_recordFields.RADIX_SITE_TABLE_ENTRY_NUMBER, value)
            }
            
            get siteID() {
                return this.get(_recordFields.SITE_ID);
            } set siteID(value) {
                this.set(_recordFields.SITE_ID, value)
            }
            
            get siteName() {
                return this.get(_recordFields.SITE_NAME);
            } set siteName(value) {
                this.set(_recordFields.SITE_NAME, value)
            }
            
            get alias() {
                return this.get(_recordFields.ALIAS);
            } set alias(value) {
                this.set(_recordFields.ALIAS, value)
            }
            
            get siteStatus() {
                return this.get(_recordFields.SITE_STATUS);
            } set siteStatus(value) {
                this.set(_recordFields.SITE_STATUS, value)
            }
            get siteStatusName() { return this.getText(_recordFields.SITE_STATUS); }
            
            get siteType() {
                return this.get(_recordFields.SITE_TYPE);
            } set siteType(value) {
                this.set(_recordFields.SITE_TYPE, value)
            }
            get siteTypeName() { return this.getText(_recordFields.SITE_TYPE); }
            
            get siteOldID() {
                return this.get(_recordFields.SITE_OLD_ID);
            } set siteOldID(value) {
                this.set(_recordFields.SITE_OLD_ID, value)
            }
            
            get heightASLm() {
                return this.get(_recordFields.HEIGHT_ASL_M);
            } set heightASLm(value) {
                this.set(_recordFields.HEIGHT_ASL_M, value)
            }
            
            get siteLevel() {
                return this.get(_recordFields.SITE_LEVEL);
            } set siteLevel(value) {
                this.set(_recordFields.SITE_LEVEL, value)
            }
            get siteLevelName() { return this.getText(_recordFields.SITE_LEVEL); }
            
            get sitePortfolio() {
                return this.get(_recordFields.SITE_PORTFOLIO);
            } set sitePortfolio(value) {
                this.set(_recordFields.SITE_PORTFOLIO, value)
            }
            get sitePortfolioName() { return this.getText(_recordFields.SITE_PORTFOLIO); }
            
            get sitePublic() {
                return this.get(_recordFields.SITE_PUBLIC);
            } set sitePublic(value) {
                this.set(_recordFields.SITE_PUBLIC, value)
            }
            get sitePublicName() { return this.getText(_recordFields.SITE_PUBLIC); }
            
            get bTSStatus() {
                return this.get(_recordFields.BTS_STATUS);
            } set bTSStatus(value) {
                this.set(_recordFields.BTS_STATUS, value)
            }
            get bTSStatusName() { return this.getText(_recordFields.BTS_STATUS); }
            
            get address() {
                return this.get(_recordFields.ADDRESS);
            } set address(value) {
                this.set(_recordFields.ADDRESS, value)
            }
            
            get addressEircode() {
                return this.get(_recordFields.ADDRESS_EIRCODE);
            } set addressEircode(value) {
                this.set(_recordFields.ADDRESS_EIRCODE, value)
            }
            
            get addressCounty() {
                return this.get(_recordFields.ADDRESS_COUNTY);
            } set addressCounty(value) {
                this.set(_recordFields.ADDRESS_COUNTY, value)
            }
            get addressCountyName() { return this.getText(_recordFields.ADDRESS_COUNTY); }
            
            get siteEasting() {
                return this.get(_recordFields.SITE_EASTING);
            } set siteEasting(value) {
                this.set(_recordFields.SITE_EASTING, value)
            }
            
            get siteNorthing() {
                return this.get(_recordFields.SITE_NORTHING);
            } set siteNorthing(value) {
                this.set(_recordFields.SITE_NORTHING, value)
            }
            
            get siteLongitude() {
                return this.get(_recordFields.SITE_LONGITUDE);
            } set siteLongitude(value) {
                this.set(_recordFields.SITE_LONGITUDE, value)
            }
            
            get siteLatitude() {
                return this.get(_recordFields.SITE_LATITUDE);
            } set siteLatitude(value) {
                this.set(_recordFields.SITE_LATITUDE, value)
            }
            
            get siteSAFAutoApprove() {
                return this.get(_recordFields.SITE_SAF_AUTO_APPROVE);
            } set siteSAFAutoApprove(value) {
                this.set(_recordFields.SITE_SAF_AUTO_APPROVE, value)
            }
            
            get siteSAFStatus() {
                return this.get(_recordFields.SITE_SAF_STATUS);
            } set siteSAFStatus(value) {
                this.set(_recordFields.SITE_SAF_STATUS, value)
            }
            get siteSAFStatusName() { return this.getText(_recordFields.SITE_SAF_STATUS); }
            
            get trackType() {
                return this.get(_recordFields.TRACK_TYPE);
            } set trackType(value) {
                this.set(_recordFields.TRACK_TYPE, value)
            }
            get trackTypeName() { return this.getText(_recordFields.TRACK_TYPE); }
            
            get accessEasting() {
                return this.get(_recordFields.ACCESS_EASTING);
            } set accessEasting(value) {
                this.set(_recordFields.ACCESS_EASTING, value)
            }
            
            get accessNorthing() {
                return this.get(_recordFields.ACCESS_NORTHING);
            } set accessNorthing(value) {
                this.set(_recordFields.ACCESS_NORTHING, value)
            }
            
            get accessLongitude() {
                return this.get(_recordFields.ACCESS_LONGITUDE);
            } set accessLongitude(value) {
                this.set(_recordFields.ACCESS_LONGITUDE, value)
            }
            
            get accessLatitude() {
                return this.get(_recordFields.ACCESS_LATITUDE);
            } set accessLatitude(value) {
                this.set(_recordFields.ACCESS_LATITUDE, value)
            }
            
            get directions() {
                return this.get(_recordFields.DIRECTIONS);
            } set directions(value) {
                this.set(_recordFields.DIRECTIONS, value)
            }
            
            get accessInstructions() {
                return this.get(_recordFields.ACCESS_INSTRUCTIONS);
            } set accessInstructions(value) {
                this.set(_recordFields.ACCESS_INSTRUCTIONS, value)
            }
            
            get tenantCardRequired() {
                return this.get(_recordFields.TENANT_CARD_REQUIRED);
            } set tenantCardRequired(value) {
                this.set(_recordFields.TENANT_CARD_REQUIRED, value)
            }
            
            get fourx4Required() {
                return this.get(_recordFields.FOURX4_REQUIRED);
            } set fourx4Required(value) {
                this.set(_recordFields.FOURX4_REQUIRED, value)
            }
            
            get parkingRestrictions() {
                return this.get(_recordFields.PARKING_RESTRICTIONS);
            } set parkingRestrictions(value) {
                this.set(_recordFields.PARKING_RESTRICTIONS, value)
            }
            
            get craneMewpAccess() {
                return this.get(_recordFields.CRANEMEWP_ACCESS);
            } set craneMewpAccess(value) {
                this.set(_recordFields.CRANEMEWP_ACCESS, value)
            }
            
            get safetySpecialNotes() {
                return this.get(_recordFields.SAFETY__SPECIAL_NOTES);
            } set safetySpecialNotes(value) {
                this.set(_recordFields.SAFETY__SPECIAL_NOTES, value)
            }
            
            get fullDemisedAreaFenced() {
                return this.get(_recordFields.FULL_DEMISED_AREA_FENCED);
            } set fullDemisedAreaFenced(value) {
                this.set(_recordFields.FULL_DEMISED_AREA_FENCED, value)
            }
            
            get adjacentGroundSpace() {
                return this.get(_recordFields.ADJACENT_GROUND_SPACE);
            } set adjacentGroundSpace(value) {
                this.set(_recordFields.ADJACENT_GROUND_SPACE, value)
            }
            
            get adjacentGroundOwner() {
                return this.get(_recordFields.ADJACENT_GROUND_OWNER);
            } set adjacentGroundOwner(value) {
                this.set(_recordFields.ADJACENT_GROUND_OWNER, value)
            }
            
            get perimeterType() {
                return this.get(_recordFields.PERIMETER_TYPE);
            } set perimeterType(value) {
                this.set(_recordFields.PERIMETER_TYPE, value)
            }
            get perimeterTypeName() { return this.getText(_recordFields.PERIMETER_TYPE); }
            
            get fenceHeightm() {
                return this.get(_recordFields.FENCE_HEIGHT_M);
            } set fenceHeightm(value) {
                this.set(_recordFields.FENCE_HEIGHT_M, value)
            }
            
            get independentPowerSupplies() {
                return this.get(_recordFields.INDEPENDENT_POWER_SUPPLIES);
            } set independentPowerSupplies(value) {
                this.set(_recordFields.INDEPENDENT_POWER_SUPPLIES, value)
            }
            
            get nextEarth_and_LPTest() {
                return this.get(_recordFields.NEXT_EARTH__AND__LP_TEST);
            } set nextEarth_and_LPTest(value) {
                this.set(_recordFields.NEXT_EARTH__AND__LP_TEST, value)
            }
            
            get marketingStatus() {
                return this.get(_recordFields.MARKETING_STATUS);
            } set marketingStatus(value) {
                this.set(_recordFields.MARKETING_STATUS, value)
            }
            
            get mNOOccupancy() {
                return this.get(_recordFields.MNO_OCCUPANCY);
            } set mNOOccupancy(value) {
                this.set(_recordFields.MNO_OCCUPANCY, value)
            }
            
            get non_MNOOccupancy() {
                return this.get(_recordFields.NON_MNO_OCCUPANCY);
            } set non_MNOOccupancy(value) {
                this.set(_recordFields.NON_MNO_OCCUPANCY, value)
            }
            
            get occupancy() {
                return this.get(_recordFields.OCCUPANCY);
            } set occupancy(value) {
                this.set(_recordFields.OCCUPANCY, value)
            }
            
            get siteWhat3Words() {
                return this.get(_recordFields.SITE_WHAT3WORDS);
            } set siteWhat3Words(value) {
                this.set(_recordFields.SITE_WHAT3WORDS, value)
            }
            
            get accessWhat3Words() {
                return this.get(_recordFields.ACCESS_WHAT3WORDS);
            } set accessWhat3Words(value) {
                this.set(_recordFields.ACCESS_WHAT3WORDS, value)
            }
            
            get siteSRFStatus() {
                return this.get(_recordFields.SITE_SRF_STATUS);
            } set siteSRFStatus(value) {
                this.set(_recordFields.SITE_SRF_STATUS, value)
            }
            get siteSRFStatusName() { return this.getText(_recordFields.SITE_SRF_STATUS); }
            
            get siteFibreServiceProviders() {
                return this.get(_recordFields.SITE_FIBRE_SERVICE_PROVIDERS);
            } set siteFibreServiceProviders(value) {
                this.set(_recordFields.SITE_FIBRE_SERVICE_PROVIDERS, value)
            }
            get siteFibreServiceProvidersName() { return this.getText(_recordFields.SITE_FIBRE_SERVICE_PROVIDERS); }
            
            get originSiteID() {
                return this.get(_recordFields.ORIGIN_SITE_ID);
            } set originSiteID(value) {
                this.set(_recordFields.ORIGIN_SITE_ID, value)
            }
            
            get fireExtinguisher() {
                return this.get(_recordFields.FIRE_EXTINGUISHER);
            } set fireExtinguisher(value) {
                this.set(_recordFields.FIRE_EXTINGUISHER, value)
            }
            get fireExtinguisherName() { return this.getText(_recordFields.FIRE_EXTINGUISHER); }
            
            get financialStatus() {
                return this.get(_recordFields.FINANCIAL_STATUS);
            } set financialStatus(value) {
                this.set(_recordFields.FINANCIAL_STATUS, value)
            }
            
            get proximitytoBodyofWaterkm() {
                return this.get(_recordFields.PROXIMITY_TO_BODY_OF_WATER_KM);
            } set proximitytoBodyofWaterkm(value) {
                this.set(_recordFields.PROXIMITY_TO_BODY_OF_WATER_KM, value)
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
            PersistentRecord: OSSMTWC_Site,

            get: function (id, staticLoad) {
                var rec = new OSSMTWC_Site(id, staticLoad);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_Site();
                return rec.select(options);
            }

        }
    });
