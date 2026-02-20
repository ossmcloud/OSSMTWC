/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_utils.js', './data/oTWC_site.js', './data/oTWC_config.js', './data/oTWC_configUIFields.js', './data/oTWC_rolePermission.js', './data/oTWC_configUIFields.js', './ui/modules/oTWC_siteInfoUtils.js', './data/oTWC_infrastructure.js', './data/oTWC_srfUI.js', './data/oTWC_equipment.js'],
    function (core, coreSQL, dialog, recu, twcUtils, twcSite, twcConfig, configUIFields, rolePermission, twcConfigUIFields, siteInfoUtils, twcInfra, twcSrfUI, twcEquipment) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())

        }

        function deleteAllSrf() {
            if (!confirm('sure ??????')) { return; }
            coreSQL.each(`select id from customrecord_twc_srf`, srf => {
                console.log(srf);
                deleteSrf(srf.id);
            })

        }
    



        function deleteSrf(id) {
    
            coreSQL.each(`select id from customrecord_twc_srf_itm where custrecord_twc_srf_itm_srf = ${id}`, srfItem => {
                recu.del('customrecord_twc_srf_itm', srfItem.id)
            })

            recu.del('customrecord_twc_srf', id)

        }


        return {
            pageInit: pageInit,
            deleteAllSrf: deleteAllSrf,
            testFunction() {
                try {
                    var testData = {
                        type: 'customrecord_twc_srf_itm',
                        "custrecord_twc_srf_itm_req_type": "1",
                        "custrecord_twc_srf_itm_equip_id": "",
                        "custrecord_twc_srf_itm_type": "1",
                        "custrecord_twc_srf_itm_desc": "Test Dish Install",
                        "custrecord_twc_srf_itm_loc": "1",
                        "custrecord_twc_srf_itm_length_mm": "60",
                        "custrecord_twc_srf_itm_width_mm": "60",
                        "custrecord_twc_srf_itm_depth_mm": "60",
                        "custrecord_twc_srf_itm_ht_on_twr": "5",
                        "custrecord_twc_srf_itm_weight_kg": "1",
                        "custrecord_twc_srf_itm_volt_type": "1",
                        "custrecord_twc_srf_itm_volt_range": "1",
                        "custrecord_twc_srf_itm_azimuth": "0",
                        "custrecord_twc_srf_itm_b_end": "0",
                        "custrecord_twc_srf_itm_cust_ref": "XXX",
                        "custrecord_twc_srf_itm_invent_flag": "18"
                    }
                    console.log(twcSrfUI.getSrfChildRecord({}, testData))
                    // var options = { fields: { id: 'value' } };
                    // options.fields[twcEquipment.Fields.EQUIPMENT_ID] = 'text';

                    // options.where = {};
                    // options.where[twcEquipment.Fields.CUSTOMER] = 219;

                    // options.orderBy = [twcEquipment.Fields.EQUIPMENT_ID];

                    // console.log(twcEquipment.select(options));

                    
                    //  var rec = {};
                    //  rec['custrecord_twc_srf_cust'] = 210;
                    //  console.log(twcSrfUI.getSRFInfoPanels(rec, {}))


                    // var payload = {
                        
                    //     "custrecord_twc_site_level": "1",
                    //     "custrecord_twc_site_level___name": "Premium (TEST)",
                    //     "custrecord_twc_site_alias": "peppo",
                    //     "custrecord_twc_site_type": "1",
                    //     "id": 417
                    // }

                    // siteInfoUtils.saveSiteInfo(payload)

                    //throw new Error('no test')

                    // coreSQL.each('select id, custrecord_twc_site_longitude as lng, custrecord_twc_site_latitude as lat from customrecord_twc_site order by id', s => {
                    //     console.log(s)
                    //     recu.submit('customrecord_twc_site', s.id, ['custrecord_twc_site_latitude', 'custrecord_twc_site_longitude'], [s.lng, s.lat])
                    // })

                    // console.log(twcUtils.getFields(twcSite.Type));


                    // var s = twcSite.get(2);
                    // console.log(s)

                    // var allCounties = coreSQL.run("select id, shortname from state where country = 'IE'");

                    // var sql = `
                    //     select  id, custrecord_twc_site_country as county
                    //     from    customrecord_twc_site
                    //     where   custrecord_twc_site_address_county is null
                    //     order by id
                    // `

                    // coreSQL.each(sql, site => {
                    //     try {
                    //         console.log(site)

                    //         var county = allCounties.find(c => { return c.shortname == site.county });
                    //         if (!county) { throw new Error('No county found for: ' + site.county); }

                    //         recu.submit('customrecord_twc_site', site.id, 'custrecord_twc_site_address_county', county.id)

                    //     } catch (error) {
                    //         console.log(site, error)
                    //     }
                    // })

                    // var s = coreSQL.first(`
                    //     select *
                    //     from   customrecord_twc_site s
                    //     left join  customrecord_twc_row r on r.id = s.custrecord_twc_site_curr_row
                    //     where  s.id = 2
                    // `)

                    //console.log(siteInfoUtils.getSiteInfo(40));
                    // console.log(configUIFields.getSitePanelFields_estates(siteInfoUtils.getSiteInfo(2).site));

                    // console.log(twcInfra.select({
                    //     fields: {
                    //         [twcInfra.Fields.INFRASTRUCTURE_ID]: 'Infra Id',
                    //         [twcInfra.Fields.INFRASTRUCTURE_TYPE]: 'Type',
                    //         [twcInfra.Fields.STATUS]: 'Status',
                    //         [twcInfra.Fields.INFRASTRUCTURE_OWNERSHIP]: 'Ownership',
                    //         [twcInfra.Fields.STRUCTURE_TYPE]: 'Struct. Type',
                    //         [twcInfra.Fields.TOWER_FAMILY]: 'Family',
                    //     },
                    //     where: { [twcInfra.Fields.SITE]: 2 }
                    // }))


                    //console.log(rolePermission.get(1))

                    // console.log(rolePermission.select({
                    //     fields: [rolePermission.Fields.ROLE, rolePermission.Fields.PERMISSION_LEVEL],
                    //     where: { [rolePermission.Fields.PERMISSION_LEVEL]: 1 }
                    // }))

                    // console.log(rolePermission.select({
                    //     fields: { [rolePermission.Fields.ROLE]: 'role_test', [rolePermission.Fields.PERMISSION_LEVEL]: 'test_2' },
                    //     where: [{ field: rolePermission.Fields.PERMISSION_LEVEL, op: '>', values: 1 }]
                    // }))

                } catch (error) {
                    console.log(error)
                    dialog.error(error)
                }

            }
        }
    });


