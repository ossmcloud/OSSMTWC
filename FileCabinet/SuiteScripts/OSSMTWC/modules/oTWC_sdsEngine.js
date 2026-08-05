/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_utils.js', '../data/oTWC_srf.js', '../data/oTWC_srfItem.js', '../data/oTWC_srfReview.js', '../data/oTWC_sds.js', '../data/oTWC_sdsEquipment.js', '../data/oTWC_fileType.js', '../data/oTWC_company.js', '../data/oTWC_site.js', '../data/oTWC_file.js'],
    function (core, coreSql, recu, twcUtils, twcSrf, twcSrfItem, twcSrfReview, twcSds, twcSdsEquipment, twcFileType, twcCompany, twcSite, twcFile) {

        function getSrfDrawingFiles(srfId) {
            return twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: twcSrf.Type,
                    [twcFile.Fields.RECORD_ID]: srfId,
                    [twcFileType.Fields.DRAWING]: 'T'
                }
            });
        }
        function getSiteLicenseMapFiles(siteId, companyId) {
            return twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: twcSite.Type,
                    [twcFile.Fields.RECORD_ID]: siteId,
                    [twcFileType.Fields.LICENSE_MAP]: 'T',
                    [twcFile.Fields.META_DATA]: `c:${companyId}`,
                }
            });
        }
        function getSiteAccessFiles(siteId) {
            return twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: twcSite.Type,
                    [twcFile.Fields.RECORD_ID]: siteId,
                    [twcFileType.Fields.ACCESS_DOCUMENT]: 'T'
                }
            });
        }
        function getSiteDrawingFiles(siteId) {
            return twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: twcSite.Type,
                    [twcFile.Fields.RECORD_ID]: siteId,
                    [twcFileType.Fields.DRAWING]: 'T'
                }
            });
        }

        function getSrfInfo(recId) {
            var srfInfo = {}
            srfInfo.srf = coreSql.first(`
                    SELECT      srf.id, srf.custrecord_twc_srf_op_site_id, srf.custrecord_twc_srf_site, srf.name, TO_CHAR(srf.custrecord_twc_srf_approval_date, 'DD-MM-YYYY') as approval_date,
                                srf.custrecord_twc_srf_op_site_id as operator_site_id, 
                                case srf.custrecord_twc_srf_pwr_supp_req_from_tl when 'T' then 'Yes' else 'No' end as power_supply_required,
                                srf.custrecord_twc_srf_power_notes,
                                srf.custrecord_twc_srf_cust as company_id, company.name as customer_name,
                                company.custrecordtwc_entity, cae.addrtext AS customer_address, c.altname as operator_name, custrecord_twc_co_number as company_number,
                                TO_CHAR(srf.custrecord_twc_srf_lic_pack_signed, 'DD-MM-YYYY') as client_signed, BUILTIN.DF(srf.custrecord_twc_srf_lic_pack_sign_by) as client_singed_by,
                                TO_CHAR(srf.custrecord_twc_srf_lic_pack_exec, 'DD-MM-YYYY') as tl_signed, BUILTIN.DF(srf.custrecord_twc_srf_lic_pack_exec_by) as tl_signed_by,
                    FROM        ${twcSrf.Type} srf 
                    INNER JOIN  customrecord_twc_company company ON srf.custrecord_twc_srf_cust = company.id
                    INNER JOIN  Customer c ON company.custrecordtwc_entity = c.id
                    LEFT  JOIN  CustomerAddressBook cab ON cab.entity = c.id
                    LEFT  JOIN  CustomerAddressBookEntityAddress cae ON cae.nkey = cab.addressbookaddress
                    WHERE   srf.id = ${recId} 
                    AND     cab.defaultbilling = 'T';`
            );

            if (!srfInfo.srf) { throw new Error(`No SRF Details fond using id: ${recId}`) }

            srfInfo.agreement = coreSql.first(`
                SELECT  custrecord_twc_agreement_name, custrecord_twc_agreement_code, TO_CHAR(custrecord_twc_agreement_date, 'DD-MM-YYYY') as custrecord_twc_agreement_date, custrecord_twc_agreement_party,
                        sds.custrecord_twc_sds_agr_cond_data as sds_cond_data, sds.custrecord_twc_sds_agr_conds
                FROM    customrecord_twc_agreement ag
                JOIN    customrecord_twc_sds sds on sds.custrecord_twc_sds_agr_tmpl = ag.id
                
                WHERE   sds.custrecord_twc_sds_srf =  ${recId}
            `)

            // @@TODO: SDS: we should probably b64 this one
            var sdsCondData = JSON.parse(srfInfo.agreement.sds_cond_data || '{}');
            //srfInfo.sdsConditions = [];
            coreSql.each(`
                SELECT  *
                FROM    customrecord_twc_agreement_cond 
                where   id in (${srfInfo.agreement.custrecord_twc_sds_agr_conds})
                order by custrecord_twc_agreement_cond_sort, name
            `, cond => {
                var conditionField = `sdsCondition_${cond.custrecord_twc_agreement_cond_section}`;
                if (!srfInfo[conditionField]) {
                    srfInfo[conditionField] = { conditions: [] };
                }
                var condition = {
                    description: cond.custrecord_twc_agreement_cond_descr,
                    fields: []
                }
                srfInfo[conditionField].conditions.push(condition);
                for (var k in sdsCondData) {
                    var cId = k.split('-')[0];
                    if (cId != cond.id) { continue; }

                    var fId = k.split('-')[1];
                    condition.fields.push({
                        label: cond[`custrecord_twc_agreement_cond_${fId}`],
                        value: sdsCondData[k]
                    })
                }

            });

            const siteID = srfInfo.srf.custrecord_twc_srf_site;
            srfInfo.siteDetails = coreSql.first(`
                    select id, custrecord_twc_site_id as site_id, custrecord_twc_site_name as site_name, custrecord_twc_site_address as address, custrecord_twc_site_address_zip as add_zipCode, 
                        BUILTIN.DF(custrecord_twc_site_address_county) as add_county, custrecord_twc_site_easting_access as easting, custrecord_twc_site_northing_access as northing, 
                        custrecord_twc_site_longitude_access as longitude, custrecord_twc_site_latitude_access as latitude,

                    from customrecord_twc_site 
                    where id = ${siteID}`)

            srfInfo.srfItems = coreSql.run(`
                select  eq.id, BUILTIN.DF(sds.custrecord_twc_sds_srf) as srf_id, eq.custrecord_twc_equip_class as equip_class,
                        NVL(lsts.custrecord_twc_equip_licence_status_sds, lsts.name) as status, BUILTIN.DF(custrecord_twc_equip_type) as type,
                        eq.custrecord_twc_equip_description as description, eq.custrecord_twc_equip_length_mm as length,
                        eq.custrecord_twc_equip_width_mm as width, eq.custrecord_twc_equip_ht_depth_mm as depth,
                        eq.custrecord_twc_equip_ht_on_twr_m as equip_height, eq.custrecord_twc_equip_weight_kg as weight,
                        eq.custrecord_twc_equip_azimuth as azimuth, eq.custrecord_twc_equip_b_end as b_end, 
                        BUILTIN.DF(eq.custrecord_twc_equip_str) as location,
                        BUILTIN.DF(eq.custrecord_twc_equip_inv_flag) as inventory_flag
                from    customrecord_twc_sds_item sdsi
                join    customrecord_twc_sds sds on sds.id = sdsi.custrecord_twc_sds_item_parent 
                join    customrecord_twc_equip eq on eq.id = sdsi.custrecord_twc_sds_item_eq
                join    customrecord_twc_equip_licence_status lsts on lsts.id = sdsi.custrecord_twc_sds_item_license_status
                where   sds.custrecord_twc_sds_srf = ${recId}
            `)
            

            return srfInfo;
        }




        function getSds(srf) {
            var sdsId = coreSql.first(`select id from ${twcSds.Type} where ${twcSds.Fields.SRF} = ${srf.id}`)?.id;
            var sds = twcSds.get(sdsId);

            var customer = sds.customer;
            if (!sdsId) {
                customer = coreSql.first(`select ${twcSrf.Fields.CUSTOMER} as cust from ${twcSrf.Type} where id = ${srf.id}`)?.cust;
            }

            var includeLicenseMap = recu.lookUp(twcCompany.Type, customer, twcCompany.Fields.SDS_INCLUDE_LICENSE_MAP);
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
                sds.includeLicenseMap = includeLicenseMap;
                sds.save();
            }

            getSdsEquipments(sds.id);

            return {
                id: sds.id,
                includeLicenseMap: includeLicenseMap
            };
        }

        function getSdsEquipments(sdsId) {

            coreSql.each(`
                select  eq.id as eq_id, sdsi.id as sds_eq_id,
                        eq.custrecordtwc_eq_install_status as eq_install_status,
                        eq.custrecord_twc_eq_licence_status as eq_license_status,
                        sdsi.custrecord_twc_sds_item_install_status as sds_eq_install_status,
                        sdsi.custrecord_twc_sds_item_license_status as sds_eq_license_status,
                from    customrecord_twc_sds sds 
                join    customrecord_twc_equip eq on  eq.custrecord_twc_equip_customer = sds.custrecord_twc_sds_cust
                                                and eq.custrecord_twc_equip_site = sds.custrecord_twc_sds_site

                left join customrecord_twc_sds_item sdsi on  sdsi.custrecord_twc_sds_item_parent = sds.id
                                                        and sdsi.custrecord_twc_sds_item_eq = eq.id

                where   sds.id = ${sdsId}
                order by eq.created, BUILTIN.DF(eq.custrecord_twc_equip_class)
            `, eq => {

                // @@TODO: we should check if something has changed and update the sds eq. table
                if (eq.sds_eq_id) { return; }

                var sdsEq = twcSdsEquipment.get(eq.sds_eq_id);
                sdsEq.sDS = sdsId;
                sdsEq.equipment = eq.eq_id;
                sdsEq.installStatus = eq.eq_install_status;
                sdsEq.licenseStatus = eq.eq_license_status;
                sdsEq.save();

            })

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
            getSrfInfo: getSrfInfo,
            getSrfDrawingFiles: getSrfDrawingFiles,
            getSiteDrawingFiles: getSiteDrawingFiles,
            getSiteLicenseMapFiles: getSiteLicenseMapFiles,
            getSiteAccessFiles: getSiteAccessFiles,

            getSdsEquipments: getSdsEquipments
        }

    });
