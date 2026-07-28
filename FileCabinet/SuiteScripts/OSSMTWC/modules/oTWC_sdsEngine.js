/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_utils.js', '../data/oTWC_srf.js', '../data/oTWC_srfItem.js', '../data/oTWC_srfReview.js', '../data/oTWC_sds.js', '../data/oTWC_fileType.js', '../data/oTWC_company.js'],
    function (core, coreSql, recu, twcUtils, twcSrf, twcSrfItem, twcSrfReview, twcSds, twcFileType, twcCompany) {

        function getSrfInfo(recId) {
            var srfInfo = {}
            srfInfo.srf = coreSql.first(`
                    SELECT      srf.custrecord_twc_srf_op_site_id, srf.custrecord_twc_srf_site, srf.name, TO_CHAR(srf.custrecord_twc_srf_approval_date, 'DD-MM-YYYY') as approval_date,
                                srf.custrecord_twc_srf_op_site_id as operator_site_id, 
                                case srf.custrecord_twc_srf_pwr_supp_req_from_tl when 'T' then 'Yes' else 'No' end as power_supply_required,
                                srf.custrecord_twc_srf_power_notes,
                                company.name as customer_name,
                                company.custrecordtwc_entity, cae.addrtext AS customer_address, c.altname as operator_name, custrecord_twc_co_number as company_number,
                                TO_CHAR(srf.custrecord_twc_srf_lic_pack_signed, 'DD-MM-YYYY') as client_signed, BUILTIN.DF(srf.custrecord_twc_srf_lic_pack_sign_by) as client_singed_by,
                                TO_CHAR(srf.custrecord_twc_srf_lic_pack_exec, 'DD-MM-YYYY') as tl_signed, BUILTIN.DF(srf.custrecord_twc_srf_lic_pack_exec_by) as tl_signed_by,
                    FROM        ${twcSrf.Type} srf INNER JOIN customrecord_twc_company company ON srf.custrecord_twc_srf_cust = company.id
                    INNER JOIN  Customer c ON company.custrecordtwc_entity = c.id
                    LEFT  JOIN  CustomerAddressBook cab ON cab.entity = c.id
                    LEFT  JOIN  CustomerAddressBookEntityAddress cae ON cae.nkey = cab.addressbookaddress
                    WHERE   srf.id = ${recId} 
                    AND     cab.defaultbilling = 'T';`
            );

            if (!srfInfo.srf) { throw new Error(`No SRF Details fond using id: ${recId}`) }

            const siteID = srfInfo.srf.custrecord_twc_srf_site;
            srfInfo.siteDetails = coreSql.first(`
                    select custrecord_twc_site_id as site_id, custrecord_twc_site_name as site_name, custrecord_twc_site_address as address, custrecord_twc_site_address_zip as add_zipCode, 
                        BUILTIN.DF(custrecord_twc_site_address_county) as add_county, custrecord_twc_site_easting_access as easting, custrecord_twc_site_northing_access as northing, 
                        custrecord_twc_site_longitude_access as longitude, custrecord_twc_site_latitude_access as latitude,

                    from customrecord_twc_site 
                    where id = ${siteID}`)

            srfInfo.srfItems = coreSql.run(`
                    select custrecord_twc_srf_itm_stype as step_type, BUILTIN.DF(custrecord_twc_srf_itm_req_type) as status, BUILTIN.DF(custrecord_twc_srf_itm_srf) as srf_id, id, 
                        BUILTIN.DF(custrecord_twc_srf_itm_type) as type, custrecord_twc_srf_itm_desc as description, custrecord_twc_srf_itm_length_mm as length, custrecord_twc_srf_itm_width_mm as width, custrecord_twc_srf_itm_depth_mm as depth, custrecord_twc_srf_itm_ht_on_twr as equip_height,
                        custrecord_twc_srf_itm_weight_kg as weight, custrecord_twc_srf_itm_azimuth as azimuth, custrecord_twc_srf_itm_b_end as b_end, BUILTIN.DF(custrecord_twc_srf_itm_loc) as location, 
                        BUILTIN.DF(custrecord_twc_srf_itm_invent_flag) as inventory_flag, custrecord_twc_srf_itm_feeder_count as feeder_count, 
                    from ${twcSrfItem.Type} where custrecord_twc_srf_itm_srf = ${recId} `)
            return srfInfo;
        }


        function getSds(srf) {
            var sdsId = coreSql.first(`select id from ${twcSds.Type} where ${twcSds.Fields.SRF} = ${srf.id}`)?.id;
            var sds = twcSds.get(sdsId);
            if (!sdsId) {
                sds.name = srf[twcSrf.Fields.NAME].replace('SRF', 'SDS');
                sds.sRF = srf.id;
                sds.site = srf[twcSrf.Fields.SITE];
                sds.customer = srf[twcSrf.Fields.CUSTOMER];
                sds.status = twcUtils.SdsStatus.Draft;

                var srfReview = twcUtils.getSrfReviewRecord({ srf: srf.id });
                if (srfReview) {
                    srfReview = twcSrfReview.get(srfReview.id);
                    sds.feeChargeBreakDown = srfReview.feeChangeBreakdown;
                    sds.feeReduction = srfReview.feeReduction;
                    sds.feeUplift = srfReview.feeUplift;
                    sds.newLicenseFee = srfReview.newLicenceFee;
                    sds.previousLicenseFee = parseFloat(srfReview.newLicenceFee || 0) - parseFloat(srfReview.feeUplift || 0) + parseFloat(srfReview.feeReduction || 0);
                    sds.additionalSRFConiditons = srfReview.tLReviewComments;
                }

                sds.includeLicenseMap = recu.lookUp(twcCompany.Type, sds.customer, twcCompany.Fields.SDS_INCLUDE_LICENSE_MAP);

                sds.save();

                sds = twcSds.get(sds.id);
            }
            return sds;
        }

        function getFormData(srf) {
            return twcSds.select({ where: { [twcSds.Fields.SRF]: srf.id }, useNames: true, returnFirst: true });
        }

        function getSDSFileType() {
            var fileTypeOptions = {}
            fileTypeOptions.filters = { [`t.${twcFileType.Fields.SDS}`]: 'T' }

            var fileTypes = twcUtils.getFileTypes(fileTypeOptions);

            return fileTypes[0];
        }

        function setAsCurrent(srf) {
            // @@NOTE: set SD as current and previous one as superseded

            var sds = coreSql.first(`select id, ${twcSds.Fields.SITE} as site_id, ${twcSds.Fields.CUSTOMER} as cust_id from ${twcSds.Type} where ${twcSds.Fields.SRF} = ${srf.id}`);
            if (!sds) { throw new Error(`Cannot set SDS as current, no record found for id: ${srf.id}`) };
            recu.submit(twcSds.Type, sds.id, twcSds.Fields.STATUS, twcUtils.SdsStatus.Current)

            // now get previous one (i.e.: any other that is current on same site / client)
            coreSql.each(`
                select  id 
                from    ${twcSds.Type}
                where   ${twcSds.Fields.CUSTOMER} = ${sds.cust_id}
                and     ${twcSds.Fields.SITE} = ${sds.site_id}
                and     ${twcSds.Fields.STATUS} = ${twcUtils.SdsStatus.Current}
                and     id != ${sds.id}
            `, prevSds => {
                recu.submit(twcSds.Type, prevSds.id, twcSds.Fields.STATUS, twcUtils.SdsStatus.Superseded)
            })

        }

        return {
            getSds: getSds,
            getFormData: getFormData,
            getSDSFileType: getSDSFileType,
            setAsCurrent: setAsCurrent,
            getSrfInfo: getSrfInfo
        }

    });
