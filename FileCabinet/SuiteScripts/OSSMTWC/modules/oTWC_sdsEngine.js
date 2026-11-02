/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_utils.js', '../data/oTWC_srf.js', '../data/oTWC_srfItem.js', '../data/oTWC_srfReview.js', '../data/oTWC_sds.js', '../data/oTWC_sdsEquipment.js', '../data/oTWC_fileType.js', '../data/oTWC_company.js', '../data/oTWC_site.js', '../data/oTWC_file.js', '../data/oTWC_equipment.js'],
    function (core, coreSql, b64, recu, twcUtils, twcSrf, twcSrfItem, twcSrfReview, twcSds, twcSdsEquipment, twcFileType, twcCompany, twcSite, twcFile, twcEquipment) {

        function getSrfDrawingFiles(srfId, fileId) {
            var filters = {
                [twcFile.Fields.RECORD_TYPE]: twcSrf.Type,
                [twcFile.Fields.RECORD_ID]: srfId,
                [twcFileType.Fields.DRAWING]: 'T'
            };
            if (fileId) {
                filters['f.id'] = fileId;
            }
            return twcUtils.getFiles({ filters: filters });
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
                                case srf.custrecord_twc_srf_pwr_supp_req_from_tl when 'T' then 'Yes' else 'No' end as power_supply_required,
                                srf.custrecord_twc_srf_power_notes,
                                srf.custrecord_twc_srf_cust as company_id, company.name as customer_name,
                                company.custrecordtwc_entity, cae.addrtext AS customer_address, c.altname as operator_name, custrecord_twc_co_number as company_number, custrecord_twc_co_regd_office as registered_office,
                                TO_CHAR(srf.custrecord_twc_srf_lic_pack_signed, 'DD-MM-YYYY @ HH24:Mi:ss') as client_signed, BUILTIN.DF(srf.custrecord_twc_srf_lic_pack_sign_by) as client_singed_by,
                                TO_CHAR(srf.custrecord_twc_srf_lic_pack_exec, 'DD-MM-YYYY @ HH24:Mi:ss') as tl_signed, BUILTIN.DF(srf.custrecord_twc_srf_lic_pack_exec_by) as tl_signed_by,
                                
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

            var sdsCondData = null;
            if (srfInfo.agreement.sds_cond_data) {
                // @@NOTE: we try/catch to be backward compatible
                try {
                    sdsCondData = JSON.parse(b64.decode(srfInfo.agreement.sds_cond_data) || '{}');
                } catch (error) {
                    sdsCondData = JSON.parse(srfInfo.agreement.sds_cond_data || '{}');
                }
            }

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



            var srfItems = coreSql.run(`
                select  sds.id as sds_id, sdsi.id as sds_eq_id,
                        eq.id, eq.custrecord_twc_equip_parent_tme_id as parent_tme, BUILTIN.DF(eqAct.custrecord_twc_eq_action_srf) as srf_id, sdsi.custrecord_twc_sds_item_equipment_class as equip_class,
                        NVL(lsts.custrecord_twc_equip_licence_status_sds, lsts.name) as status, BUILTIN.DF(sdsi.custrecord_twc_sds_item_equipment_type) as type,
                        sdsi.custrecord_twc_sds_item_description as description, sdsi.custrecord_twc_sds_item_length as length,
                        sdsi.custrecord_twc_sds_item_width as width, sdsi.custrecord_twc_sds_item_depth as depth,
                        sdsi.custrecord_twc_sds_item_height_on_tower as equip_height, sdsi.custrecord_twc_sds_item_weight as weight,
                        sdsi.custrecord_twc_sds_item_azimuth as azimuth, sdsi.custrecord_twc_sds_item_b_end as b_end, 
                        BUILTIN.DF(eq.custrecord_twc_equip_str) as location,
                        BUILTIN.DF(sdsi.custrecord_twc_sds_item_inventory_flag) as inventory_flag
                from    customrecord_twc_sds_item sdsi
                join    customrecord_twc_sds sds on sds.id = sdsi.custrecord_twc_sds_item_parent 
                join    customrecord_twc_equip eq on eq.id = sdsi.custrecord_twc_sds_item_eq
                join    customrecord_twc_equip_licence_status lsts on lsts.id = sdsi.custrecord_twc_sds_item_license_status
                left join customrecord_twc_eq_action eqAct on eqAct.id = eq.custrecord_twc_equip_assoc_eq_action
                where   sds.custrecord_twc_sds_srf = ${recId}
                and     sdsi.custrecord_twc_sds_item_include = 'T'
                order by eq.custrecord_twc_equip_class, sdsi.created
            `)

            // @@NOTE: print the equipment in the same order as the SDS equipment dialog (SRF oldest to newest, see getSdsEquipments)
            //         the template groups by class (TME table / GIE table) and lists ATME then Feeders under each TME, each group keeps this order
            if (srfItems.length > 0) {
                var sdsEqOrder = {};
                core.array.each(getSdsEquipments({ id: srfItems[0].sds_id }), (sdsEq, idx) => { sdsEqOrder[sdsEq.id] = idx; });
                srfItems.sort((a, b) => {
                    var idxA = sdsEqOrder[a.sds_eq_id] ?? Number.MAX_SAFE_INTEGER;
                    var idxB = sdsEqOrder[b.sds_eq_id] ?? Number.MAX_SAFE_INTEGER;
                    return idxA - idxB;
                });
            }

            srfInfo.srfItems = [];
            core.array.each(srfItems, i => {
                if (i.equip_class == twcUtils.SrfStepType.TME || i.equip_class == twcUtils.SrfStepType.GIE) {
                    srfInfo.srfItems.push(i);
                    i.status = i.status.replaceAll(' ', '<br />')
                    if (i.equip_class == twcUtils.SrfStepType.TME) {
                        i.items = srfItems.filter(si => { return si.parent_tme == i.id && si.equip_class == twcUtils.SrfStepType.ATME });
                        i.feeders = srfItems.filter(si => { return si.parent_tme == i.id && si.equip_class == twcUtils.SrfStepType.FEEDER });
                        i.atme_count = i.items.length;
                        i.feeder_count = i.feeders.length;
                    }

                }
            })


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
                sds.powerSupplyComments = srf[twcSrf.Fields.POWER_NOTES];

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

            setSdsEquipments(sds.id);

            return {
                id: sds.id,
                includeLicenseMap: includeLicenseMap
            };
        }

        function setSdsEquipments(sdsId) {

            var copyFields = {
                'custrecord_twc_sds_item_equipment_id': 'name',
                'custrecord_twc_sds_item_site': 'custrecord_twc_equip_site',
                'custrecord_twc_sds_item_infra': 'custrecord_twc_equip_str',
                'custrecord_twc_sds_item_install_status': 'custrecordtwc_eq_install_status',
                'custrecord_twc_sds_item_license_status': 'custrecord_twc_eq_licence_status',
                'custrecord_twc_sds_item_cust': 'custrecord_twc_equip_customer',
                'custrecord_twc_sds_item_equipment_class': 'custrecord_twc_equip_class',
                'custrecord_twc_sds_item_equipment_type': 'custrecord_twc_equip_type',
                'custrecord_twc_sds_item_make': 'custrecord_twc_equip_make',
                'custrecord_twc_sds_item_model': 'custrecord_twc_equip_model',
                'custrecord_twc_sds_item_description': 'custrecord_twc_equip_description',
                'custrecord_twc_sds_item_length': 'custrecord_twc_equip_length_mm',
                'custrecord_twc_sds_item_width': 'custrecord_twc_equip_width_mm',
                'custrecord_twc_sds_item_depth': 'custrecord_twc_equip_ht_depth_mm',
                'custrecord_twc_sds_item_weight': 'custrecord_twc_equip_weight_kg',
                'custrecord_twc_sds_item_height_on_tower': 'custrecord_twc_equip_ht_on_twr_m',
                'custrecord_twc_sds_item_azimuth': 'custrecord_twc_equip_azimuth',
                'custrecord_twc_sds_item_b_end': 'custrecord_twc_equip_b_end',
                'custrecord_twc_sds_item_cust_ref': 'custrecord_twc_equip_cust_ref',
                'custrecord_twc_sds_item_inventory_flag': 'custrecord_twc_equip_inv_flag',
                'custrecord_twc_sds_item_package': 'custrecord_twc_equip_package',
            }

            var sqlFields = '';
            for (var k in copyFields) {
                sqlFields += `eq.${copyFields[k]}, `;
            }

            // @@NOTE: default licence status on the SDS (the equipment record is not changed):
            //         'to licence' statuses   => Licenced
            //         'to unlicence' statuses => Prop to Unlicence
            var sdsLicenceStatusDefaults = {
                [twcUtils.EqLicenseStatus.ReqtoLicence]: twcUtils.EqLicenseStatus.Licenced,
                [twcUtils.EqLicenseStatus.ProptoLicence]: twcUtils.EqLicenseStatus.Licenced,
                [twcUtils.EqLicenseStatus.ProptoLicence_LicenceRequested]: twcUtils.EqLicenseStatus.Licenced,
                [twcUtils.EqLicenseStatus.ProptoLicence_LicenceIssued]: twcUtils.EqLicenseStatus.Licenced,
                [twcUtils.EqLicenseStatus.ReqtoUnlicence]: twcUtils.EqLicenseStatus.ProptoUnlicence,
                [twcUtils.EqLicenseStatus.ProptoUnlicence]: twcUtils.EqLicenseStatus.ProptoUnlicence,
                [twcUtils.EqLicenseStatus.ProptoUnlicence_LicenceRequested]: twcUtils.EqLicenseStatus.ProptoUnlicence,
                [twcUtils.EqLicenseStatus.ProptoUnlicence_LicenceIssued]: twcUtils.EqLicenseStatus.ProptoUnlicence,
            };

            coreSql.each(`
                select  eq.id as eq_id, sdsi.id as sds_eq_id, srfi.id as srf_eq_id, srfi.custrecord_twc_srf_itm_invent_flag as srf_inventory_flag,
                        sdsi.${twcSdsEquipment.Fields.LICENSE_STATUS} as sds_licence_status,
                        ${sqlFields}
                
                from    customrecord_twc_sds sds 
                
                join    customrecord_twc_equip eq on  eq.custrecord_twc_equip_customer = sds.custrecord_twc_sds_cust
                                                and eq.custrecord_twc_equip_site = sds.custrecord_twc_sds_site

                left join customrecord_twc_sds_item sdsi on  sdsi.custrecord_twc_sds_item_parent = sds.id
                                                        and sdsi.custrecord_twc_sds_item_eq = eq.id

                left join customrecord_twc_srf_itm srfi on srfi.custrecord_twc_srf_itm_srf = sds.custrecord_twc_sds_srf
                                                       and srfi.custrecord_twc_srf_itm_equip_id = eq.id

                where   sds.id = ${sdsId}
                order by eq.created, BUILTIN.DF(eq.custrecord_twc_equip_class)
            `, eq => {

                var sdsLicenceStatus = sdsLicenceStatusDefaults[eq.custrecord_twc_eq_licence_status];

                // @@TODO: we should check if something has changed and update the sds eq. table???
                if (eq.sds_eq_id) {
                    // @@NOTE: existing sds eq.: apply the default licence status only if the user has not changed it (i.e.: still the same as the equipment)
                    if (sdsLicenceStatus && eq.sds_licence_status == eq.custrecord_twc_eq_licence_status && sdsLicenceStatus != eq.sds_licence_status) {
                        recu.submit(twcSdsEquipment.Type, eq.sds_eq_id, twcSdsEquipment.Fields.LICENSE_STATUS, sdsLicenceStatus);
                    }
                    return;
                }

                var sdsEq = twcSdsEquipment.get(eq.sds_eq_id);
                sdsEq.sDS = sdsId;
                sdsEq.sRFItem = eq.srf_eq_id;
                sdsEq.equipment = eq.eq_id;
                sdsEq.partofSDS = (eq.srf_eq_id) != null;
                // @@NOTE: equipment with licence status Draft or Unlicenced is not included by default
                sdsEq.includeinSDS = [twcUtils.EqLicenseStatus.Draft, twcUtils.EqLicenseStatus.Unlicenced].indexOf(parseInt(eq.custrecord_twc_eq_licence_status)) < 0;

                for (var k in copyFields) {
                    sdsEq.set(k, eq[copyFields[k]])
                }

                if (sdsLicenceStatus) {
                    sdsEq.set(twcSdsEquipment.Fields.LICENSE_STATUS, sdsLicenceStatus);
                }

                if (eq.srf_inventory_flag) {
                    sdsEq.set('custrecord_twc_sds_item_inventory_flag', eq.srf_inventory_flag);
                }

                sdsEq.save();

            })

        }

        function updateSdsEquipments(payload) {
            recu.submit(twcSdsEquipment.Type, payload.id, payload.field, payload.value);
        }

        // @@NOTE: returns the sds equipment ordered as parent / child: each parent (TME / GIE) is followed by its related equipment (ATME / Feeders)
        //         the relation comes from the equipment record (PARENT_TME_ID), children get child_level > 0
        //         equipment whose parent is not in the list is shown as a parent (child_level = 0)
        //         also adds: infra_id (infrastructure id of the structure) and srf_id / srf_name:
        //              the SRF that licensed the equipment (SRF of the equipment 'associated eq. action', set on licence only)
        //              @@IMPORTANT: same SRF as the 'SRF ID' column on the SDS PDF (getSrfInfo), which is also printed in this order
        function getSdsEquipments(sds) {
            var sdsEquipments = twcSdsEquipment.select({
                where: { [twcSdsEquipment.Fields.SDS]: sds.id },
                orderBy: ['id'],
                useNames: true
            });

            var extraInfo = {};
            coreSql.each(`
                select  sdsi.id,
                        eq.${twcEquipment.Fields.PARENT_TME_ID} as parent_eq_id,
                        infra.custrecord_twc_infra_id as infra_id,
                        eqAct.custrecord_twc_eq_action_srf as srf_id, BUILTIN.DF(eqAct.custrecord_twc_eq_action_srf) as srf_name
                from    ${twcSdsEquipment.Type} sdsi
                left join ${twcEquipment.Type} eq on eq.id = sdsi.${twcSdsEquipment.Fields.EQUIPMENT}
                left join customrecord_twc_infra infra on infra.id = sdsi.${twcSdsEquipment.Fields.INFRASTRUCTURE}
                left join customrecord_twc_eq_action eqAct on eqAct.id = eq.custrecord_twc_equip_assoc_eq_action
                where   sdsi.${twcSdsEquipment.Fields.SDS} = ${sds.id}
            `, info => {
                extraInfo[info.id] = info;
            });

            core.array.each(sdsEquipments, sdsEq => {
                var info = extraInfo[sdsEq.id] || {};
                sdsEq.parent_eq_id = info.parent_eq_id || null;
                sdsEq.infra_id = info.infra_id || '';
                sdsEq.srf_id = info.srf_id || null;
                sdsEq.srf_name = info.srf_name || '';
            });

            // @@NOTE: order by SRF, oldest to newest (by SRF internal id), equipment with no SRF last, then by sds eq. id
            //         applies to parents and to the children within each parent (nesting below keeps this order)
            sdsEquipments.sort((a, b) => {
                var srfA = parseInt(a.srf_id) || Number.MAX_SAFE_INTEGER;
                var srfB = parseInt(b.srf_id) || Number.MAX_SAFE_INTEGER;
                if (srfA != srfB) { return srfA - srfB; }
                return parseInt(a.id) - parseInt(b.id);
            });

            var orderedEquipments = [];
            var added = {};
            const addWithChildren = (sdsEq, level) => {
                if (added[sdsEq.id]) { return; }
                added[sdsEq.id] = true;
                sdsEq.child_level = level;
                orderedEquipments.push(sdsEq);
                var children = sdsEquipments.filter(c => { return c.parent_eq_id && c.parent_eq_id == sdsEq[twcSdsEquipment.Fields.EQUIPMENT]; });
                core.array.each(children, child => { addWithChildren(child, level + 1); });
            }

            core.array.each(sdsEquipments, sdsEq => {
                var hasParent = sdsEq.parent_eq_id && sdsEquipments.find(p => { return p[twcSdsEquipment.Fields.EQUIPMENT] == sdsEq.parent_eq_id; });
                if (!hasParent) { addWithChildren(sdsEq, 0); }
            });
            // @@NOTE: safety net (e.g.: circular references), anything not added yet is shown as a parent
            core.array.each(sdsEquipments, sdsEq => { addWithChildren(sdsEq, 0); });

            return orderedEquipments;
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

            setSdsEquipments: setSdsEquipments,
            getSdsEquipments: getSdsEquipments,
            updateSdsEquipments: updateSdsEquipments,
        }

    });
