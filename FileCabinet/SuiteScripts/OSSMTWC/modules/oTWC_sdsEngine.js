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

            if (!recu.lookUp(twcCompany.Type, companyId, twcCompany.Fields.SDS_INCLUDE_LICENSE_MAP)) { return []; }

            return twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: twcSite.Type,
                    [twcFile.Fields.RECORD_ID]: siteId,
                    [twcFileType.Fields.LICENSE_MAP]: 'T',
                    // @@IMPORTANT NOTE: License Maps are only available for Vodafone but it that changes we'll need to add a 'customer' field to the TWC File table and use it here
                    // [twcFile.Fields.META_DATA]: `c:${companyId}`,
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
            // @@NOTE: operator name = company 'T/A' (trading as) name, falls back to the NetSuite customer name
            srfInfo.srf = coreSql.first(`
                    SELECT      srf.id, srf.custrecord_twc_srf_op_site_id, srf.custrecord_twc_srf_site, srf.name, TO_CHAR(srf.custrecord_twc_srf_approval_date, 'DD-MM-YYYY') as approval_date,
                                case srf.custrecord_twc_srf_pwr_supp_req_from_tl when 'T' then 'Yes' else 'No' end as power_supply_required,
                                srf.custrecord_twc_srf_power_notes,
                                srf.custrecord_twc_srf_cust as company_id, company.name as customer_name,
                                company.custrecordtwc_entity, cae.addrtext AS customer_address, NVL(company.custrecord_twc_co_ta_name, c.altname) as operator_name, custrecord_twc_co_number as company_number, custrecord_twc_co_regd_office as registered_office,
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
            // @@NOTE: coordinates from the site Location section (not the Access section)
            srfInfo.siteDetails = coreSql.first(`
                    select id, custrecord_twc_site_id as site_id, custrecord_twc_site_name as site_name, custrecord_twc_site_address as address, custrecord_twc_site_address_zip as add_zipCode, 
                        BUILTIN.DF(custrecord_twc_site_address_county) as add_county, custrecord_twc_site_easting as easting, custrecord_twc_site_northing as northing, 
                        custrecord_twc_site_longitude as longitude, custrecord_twc_site_latitude as latitude,

                    from customrecord_twc_site 
                    where id = ${siteID}`)

            // @@NOTE: SDS 'Site Access Reference Documents': names of the site access documents, the same files attached to the SDS pack (oTWC_sdsRender.js: getDrawings)
            srfInfo.srf.site_access_doc = getSiteAccessFiles(siteID).map(f => { return f.name; }).filter(n => { return !!n; }).join(', ');



            var srfItems = coreSql.run(`
                select  sds.id as sds_id, sdsi.id as sds_eq_id,
                        eq.id, eq.name as eq_name, eq.custrecord_twc_equip_parent_tme_id as parent_tme, BUILTIN.DF(eqAct.custrecord_twc_eq_action_srf) as srf_id, sdsi.custrecord_twc_sds_item_equipment_class as equip_class,
                        NVL(lsts.custrecord_twc_equip_licence_status_sds, lsts.name) as status, BUILTIN.DF(sdsi.custrecord_twc_sds_item_equipment_type) as type,
                        sdsi.custrecord_twc_sds_item_description as description, sdsi.custrecord_twc_sds_item_length as length,
                        sdsi.custrecord_twc_sds_item_width as width, sdsi.custrecord_twc_sds_item_depth as depth,
                        sdsi.custrecord_twc_sds_item_height_on_tower as equip_height, sdsi.custrecord_twc_sds_item_weight as weight,
                        sdsi.custrecord_twc_sds_item_azimuth as azimuth, sdsi.custrecord_twc_sds_item_b_end as b_end, 
                        BUILTIN.DF(eq.custrecord_twc_equip_str) as location,
                        BUILTIN.DF(sdsi.custrecord_twc_sds_item_inventory_flag) as inventory_flag,
                        sdsi.custrecord_twc_sds_item_make as make, sdsi.custrecord_twc_sds_item_model as model, BUILTIN.DF(eq.custrecord_twc_equip_opt_type) as feeder_type,
                        eq.${twcEquipment.Fields.TME_GROUP} as tme_group
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
            var sdsEqGroup = {};
            if (srfItems.length > 0) {
                var sdsEqOrder = {};
                core.array.each(getSdsEquipments({ id: srfItems[0].sds_id }), (sdsEq, idx) => {
                    sdsEqOrder[sdsEq.id] = idx;
                    sdsEqGroup[sdsEq.id] = { idx: sdsEq.group_idx, key: sdsEq.group_key };
                });
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

            srfInfo.tmeGroups = getSrfInfoTmeGroups(srfItems, srfInfo.srfItems, sdsEqGroup);

            return srfInfo;
        }

        // @@NOTE: Tower Mounted Equipment table of the SDS PDF (XML/oTwc_print_SDS.xml), grouped by TME Group (TMEG, see getSdsEquipments):
        //              [{ tme_group, multi ('T' when the group has more than one TME, i.e. a TME swap: the template prints a 'TME Group ... (swap)' label row), tmes, orphans }]
        //              tmes    : the TMEs of the group in SDS order (swap-out first), each with its ATMEs (items) and Feeders (feeders) as on srfInfo.srfItems
        //              orphans : ATMEs / Feeders whose parent TME is not on the SDS (not printed under any TME, they used to be dropped from the PDF)
        //         groups are in SDS order (srfItems is already sorted as getSdsEquipments)
        //         @@IMPORTANT: the result is a deep copy: the same objects are also in srfInfo.srfItems and oTWC_sdsRender.js (escapeForTemplate) escapes every object it visits,
        //                      a shared object would be escaped twice ('&' => '&amp;amp;')
        function getSrfInfoTmeGroups(srfItems, srfInfoItems, sdsEqGroup) {
            var tmeIds = {};
            core.array.each(srfInfoItems, i => { if (i.equip_class == twcUtils.SrfStepType.TME) { tmeIds[i.id] = true; } });

            var tmeGroups = [];
            var tmeGroupsByKey = {};
            core.array.each(srfItems, i => {
                var isTme = i.equip_class == twcUtils.SrfStepType.TME;
                var isOrphan = (i.equip_class == twcUtils.SrfStepType.ATME || i.equip_class == twcUtils.SrfStepType.FEEDER) && !tmeIds[i.parent_tme];
                if (!isTme && !isOrphan) { return; }

                // @@NOTE: group from the SDS equipment order (getSdsEquipments), falls back to the equipment TMEG (or a group of its own)
                var key = String(sdsEqGroup[i.sds_eq_id]?.key || i.tme_group || `EQ-${i.id}`);
                var group = tmeGroupsByKey[key];
                if (!group) {
                    group = { tme_group: key.startsWith('EQ-') ? (i.tme_group || '') : key, multi: 'F', tmes: [], orphans: [] };
                    tmeGroupsByKey[key] = group;
                    tmeGroups.push(group);
                }
                if (isTme) { group.tmes.push(i); } else { group.orphans.push(i); }
            });

            core.array.each(tmeGroups, group => { group.multi = group.tmes.length > 1 ? 'T' : 'F'; });

            return JSON.parse(JSON.stringify(tmeGroups));
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
                [twcUtils.EqLicenseStatus.ReqtoUnlicence]: twcUtils.EqLicenseStatus.ProptoUnlicence,
                [twcUtils.EqLicenseStatus.ProptoUnlicence]: twcUtils.EqLicenseStatus.ProptoUnlicence,
                // @@NOTE: Issue 299 - the 'Prop to Licence / Unlicence - Licence Requested / Issued' statuses are retired (equipment stays Prop to Licence / Unlicence until executed)
            };

            // @@NOTE: equipment associated with a cancelled SRF is not included in the SDS: the equipment associated EA is an install (Licence / Swap Licence)
            //         raised by an SRF that has been cancelled (i.e. equipment that only exists because of that SRF)
            //         removals on a cancelled SRF are NOT excluded: that equipment is still on site / licenced (cancelSrf resets it to Licenced)
            var cancelledSrfSql = `
                case when srfa.${twcSrf.Fields.SRF_STATUS} = ${twcUtils.SrfStatus.SRFCancelled}
                      and eqa.custrecord_twc_eq_action_type in (${twcUtils.EqActionType.Licence}, ${twcUtils.EqActionType.SwapLicence})
                     then 'T' else 'F' end`;

            coreSql.each(`
                select  eq.id as eq_id, sdsi.id as sds_eq_id, srfi.id as srf_eq_id, srfi.custrecord_twc_srf_itm_invent_flag as srf_inventory_flag,
                        sdsi.${twcSdsEquipment.Fields.LICENSE_STATUS} as sds_licence_status,
                        sdsi.${twcSdsEquipment.Fields.INSTALL_STATUS} as sds_install_status,
                        sdsi.${twcSdsEquipment.Fields.INCLUDE_IN_SDS} as sds_include,
                        ${cancelledSrfSql} as srf_cancelled,
                        ${sqlFields}
                
                from    customrecord_twc_sds sds 
                
                join    customrecord_twc_equip eq on  eq.custrecord_twc_equip_customer = sds.custrecord_twc_sds_cust
                                                and eq.custrecord_twc_equip_site = sds.custrecord_twc_sds_site

                left join customrecord_twc_sds_item sdsi on  sdsi.custrecord_twc_sds_item_parent = sds.id
                                                        and sdsi.custrecord_twc_sds_item_eq = eq.id

                left join customrecord_twc_srf_itm srfi on srfi.custrecord_twc_srf_itm_srf = sds.custrecord_twc_sds_srf
                                                       and srfi.custrecord_twc_srf_itm_equip_id = eq.id

                left join customrecord_twc_eq_action eqa on eqa.id = eq.custrecord_twc_equip_assoc_eq_action
                left join ${twcSrf.Type} srfa on srfa.id = eqa.custrecord_twc_eq_action_srf

                where   sds.id = ${sdsId}
                order by eq.created, BUILTIN.DF(eq.custrecord_twc_equip_class)
            `, eq => {

                if (eq.srf_cancelled == 'T') {
                    // @@NOTE: already on the SDS (added before the SRF was cancelled): exclude it rather than deleting it
                    if (eq.sds_eq_id && eq.sds_include == 'T') {
                        recu.submit(twcSdsEquipment.Type, eq.sds_eq_id, twcSdsEquipment.Fields.INCLUDE_IN_SDS, false);
                    }
                    return;
                }

                var sdsLicenceStatus = sdsLicenceStatusDefaults[eq.custrecord_twc_eq_licence_status];

                // @@TODO: we should check if something has changed and update the sds eq. table???
                if (eq.sds_eq_id) {
                    // @@NOTE: existing sds eq.: apply the default licence status only if the user has not changed it (i.e.: still the same as the equipment)
                    if (sdsLicenceStatus && eq.sds_licence_status == eq.custrecord_twc_eq_licence_status && sdsLicenceStatus != eq.sds_licence_status) {
                        recu.submit(twcSdsEquipment.Type, eq.sds_eq_id, twcSdsEquipment.Fields.LICENSE_STATUS, sdsLicenceStatus);
                    }
                    // @@NOTE: install status: the sds eq. is created the 1st time the Generate SDS dialog is opened (copied from the equipment)
                    //         works permitted: the works can be completed after that (SAF photos review approved => equipment Installed / Removed, oTWC_siteAccessUtils.js)
                    //         so the actual site work wins: if the equipment is Installed / Removed and the sds eq. is still behind (Draft / Not Installed, or Installed => Removed) it is updated
                    //         a manual change on the dialog is otherwise kept (status ahead of / same as the equipment)
                    var eqInstall = parseInt(eq.custrecordtwc_eq_install_status) || 0;
                    var sdsInstall = parseInt(eq.sds_install_status) || 0;
                    if ((eqInstall == twcUtils.EqInstallStatus.Installed || eqInstall == twcUtils.EqInstallStatus.Removed) && sdsInstall < eqInstall) {
                        recu.submit(twcSdsEquipment.Type, eq.sds_eq_id, twcSdsEquipment.Fields.INSTALL_STATUS, eqInstall);
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

        // @@NOTE: SDS Equipments dialog (oTWC_sdsEngineUI.js: manageSDEquipment), only the fields editable on the dialog can be updated
        const SDS_EQ_EDITABLE_FIELDS = [twcSdsEquipment.Fields.INCLUDE_IN_SDS, twcSdsEquipment.Fields.INSTALL_STATUS, twcSdsEquipment.Fields.LICENSE_STATUS, twcSdsEquipment.Fields.DESCRIPTION];
        function updateSdsEquipments(payload) {
            if (SDS_EQ_EDITABLE_FIELDS.indexOf(payload.field) < 0) { throw new Error(`Field cannot be updated: ${payload.field}`); }
            var value = payload.value;
            // @@NOTE: description is a free-form text field (max 300 chars)
            if (payload.field == twcSdsEquipment.Fields.DESCRIPTION) { value = (value || '').toString().trim().substring(0, 300); }
            recu.submit(twcSdsEquipment.Type, payload.id, payload.field, value);
        }

        // @@NOTE: returns the sds equipment ordered as parent / child: each parent (TME / GIE) is followed by its related equipment (ATME / Feeders)
        //         the relation comes from the equipment record (PARENT_TME_ID), children get child_level > 0
        //         equipment whose parent is not in the list is shown as a parent (child_level = 0)
        //         parents are grouped by TME Group (swapped TMEs together, see below): group_idx / group_key on each row (oTWC_sdsEngineUI.js: column sort keeps a group together)
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
                        eq.${twcEquipment.Fields.EQUIPMENT_CLASS} as eq_class,
                        eq.${twcEquipment.Fields.TME_GROUP} as tme_group, peq.${twcEquipment.Fields.TME_GROUP} as parent_tme_group,
                        infra.custrecord_twc_infra_id as infra_id,
                        eqAct.custrecord_twc_eq_action_srf as srf_id, BUILTIN.DF(eqAct.custrecord_twc_eq_action_srf) as srf_name
                from    ${twcSdsEquipment.Type} sdsi
                left join ${twcEquipment.Type} eq on eq.id = sdsi.${twcSdsEquipment.Fields.EQUIPMENT}
                left join ${twcEquipment.Type} peq on peq.id = eq.${twcEquipment.Fields.PARENT_TME_ID}
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
                sdsEq.eq_class = info.eq_class || sdsEq[twcSdsEquipment.Fields.EQUIPMENT_CLASS] || null;
                sdsEq.tme_group = info.tme_group || null;
                sdsEq.parent_tme_group = info.parent_tme_group || null;
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
            const addWithChildren = (sdsEq, level, groupIdx, groupKey) => {
                if (added[sdsEq.id]) { return; }
                added[sdsEq.id] = true;
                sdsEq.child_level = level;
                sdsEq.group_idx = groupIdx;
                sdsEq.group_key = groupKey;
                orderedEquipments.push(sdsEq);
                var children = sdsEquipments.filter(c => { return c.parent_eq_id && c.parent_eq_id == sdsEq[twcSdsEquipment.Fields.EQUIPMENT]; });
                core.array.each(children, child => { addWithChildren(child, level + 1, groupIdx, groupKey); });
            }

            // @@NOTE: TME Group (TMEG, see modules/oTWC_eqTmeGroup.js): the roots (equipment with no parent in the list) are grouped so that a swapped TME
            //         (swap-out and swap-in TMEs share the same TMEG) and its children are listed together
            //         group key: the equipment TMEG, else its parent TMEG (child whose parent is not on the SDS), else 'EQ-' + equipment id (GIE, data not backfilled: a group of its own)
            //         groups are ordered by the position of their first root (i.e. the SRF order above), within a group: TMEs first (SRF order: swap-out before swap-in), then the other roots
            //         each root is then followed by its children (addWithChildren), every row gets group_idx (1 based) and group_key
            var groups = [];
            var groupsByKey = {};
            core.array.each(sdsEquipments, sdsEq => {
                var hasParent = sdsEq.parent_eq_id && sdsEquipments.find(p => { return p[twcSdsEquipment.Fields.EQUIPMENT] == sdsEq.parent_eq_id; });
                if (hasParent) { return; }
                var key = sdsEq.tme_group || sdsEq.parent_tme_group || `EQ-${sdsEq[twcSdsEquipment.Fields.EQUIPMENT] || sdsEq.id}`;
                var group = groupsByKey[key];
                if (!group) {
                    group = { key: key, tmes: [], others: [] };
                    groupsByKey[key] = group;
                    groups.push(group);
                }
                if (parseInt(sdsEq.eq_class) == twcUtils.SrfStepType.TME) { group.tmes.push(sdsEq); } else { group.others.push(sdsEq); }
            });

            core.array.each(groups, (group, idx) => {
                core.array.each(group.tmes.concat(group.others), sdsEq => { addWithChildren(sdsEq, 0, idx + 1, group.key); });
            });
            // @@NOTE: safety net (e.g.: circular references), anything not added yet is shown as a parent (in a group of its own)
            var groupIdx = groups.length;
            core.array.each(sdsEquipments, sdsEq => {
                if (added[sdsEq.id]) { return; }
                groupIdx++;
                addWithChildren(sdsEq, 0, groupIdx, `EQ-${sdsEq[twcSdsEquipment.Fields.EQUIPMENT] || sdsEq.id}`);
            });

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
