/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/xml', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', './O/oTWC_dialogEx.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js',
    './data/oTWC_utils.js', './data/oTWC_site.js', './data/oTWC_config.js', './data/oTWC_configUIFields.js', './data/oTWC_rolePermission.js', './data/oTWC_configUIFields.js',
    './ui/modules/oTWC_siteInfoUtils.js', './data/oTWC_saf.js', './data/oTWC_srfUI.js', './data/oTWC_equipment.js', './O/oTWC_nsFileUtils.js', './O/controls/oTWC_ui_ctrl.js',
    './oTWC_otop_test.js', './data/oTWC_profileUI.js', './modules/oTWC_certStatusEngine.js', './data/oTWC_equipAction.js', './modules/oTWC_srfWorkflowEngine.js',
    './modules/oTWC_srfWorkflowEngineUI.js', './ui/modules/oTWC_siteRequestUtils.js', './ui/modules/oTWC_siteAccessUtils.js', './modules/oTWC_sdsEngine.js', './modules/oTWC_sdsEngineUI.js', './ui/modules/oTWC_siteLocatorUtils.js', './data/oTWC_srfItem.js'],
    function (xml, core, coreSQL, dialog, recu,
        twcUtils, twcSite, twcConfig, configUIFields, rolePermission, twcConfigUIFields,
        siteInfoUtils, twcSaf, twcSrfUI, twcEquipment, nsFileUtils, twcUI,
        otop, twcProfileUI, twcCertStatusEngine, twcEquipAction, twcSrfWorkflowEngine,
        twcSrfWorkflowEngineUI, twcSiteRequestUtils, twcSiteAccessUtils, twcSdsEngine, twcSdsEngineUI, twcSiteLocatorUtils, twcSrfItem) {
        var _ui;

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())
            _ui = twcUI.init({}, jQuery('#main_form'));
            _ui.on('change', e => {
                console.log(e.value)
                console.log(e.target.getDateContent(e.value))
            })


        }

        function deleteAllSrf() {
            if (!confirm('sure ??????')) { return; }
            coreSQL.each(`select id from customrecord_twc_srf`, srf => {
                console.log(srf);
                deleteSrf(srf.id);
            })

        }




        function deleteSds(id) {

            coreSQL.each(`select id from customrecord_twc_sds_item where custrecord_twc_sds_item_parent = ${id}`, sdsItem => {
                recu.del('customrecord_twc_sds_item', sdsItem.id)
            })

            recu.del('customrecord_twc_sds', id)

        }


        return {
            pageInit: pageInit,
            deleteAllSrf: deleteAllSrf,
            testFunction() {

                try {
                    // @@NOTE: ONE-OFF FIX - equipment 'Associated Equip Action' (custrecord_twc_equip_assoc_eq_action) lost (field deleted by mistake and re-created empty)
                    //         rebuilt as oTWC_srfWorkflowEngine.js: initEquipment sets it: the Licence / Swap Licence EA of the equipment
                    //         more than one => the latest (highest id, initEquipment overwrites it on every licence), whatever its status
                    //         only equipment with the field empty is touched; equipment with no licence EA (e.g. not created by an SRF) stays empty
                    var assocEas = {};
                    coreSQL.each(`
                        select  eq.id, eq.name, ea.id as ea_id, ea.name as ea_name, BUILTIN.DF(ea.custrecord_twc_eq_action_type) as ea_type,
                                BUILTIN.DF(ea.custrecord_twc_eq_action_sts) as ea_status, BUILTIN.DF(ea.custrecord_twc_eq_action_srf) as srf
                        from    customrecord_twc_equip eq
                        join    customrecord_twc_eq_action ea on ea.custrecord_twc_eq_action_eq = eq.id
                        where   eq.custrecord_twc_equip_assoc_eq_action is null
                        and     ea.custrecord_twc_eq_action_type in (${twcUtils.EqActionType.Licence}, ${twcUtils.EqActionType.SwapLicence})
                        order by eq.id, ea.id desc
                    `, r => {
                        // @@NOTE: rows ordered by EA id desc, the first one per equipment is the latest
                        if (assocEas[r.id]) { assocEas[r.id].candidates++; return; }
                        assocEas[r.id] = { id: r.id, name: r.name, ea_id: r.ea_id, ea_name: r.ea_name, ea_type: r.ea_type, ea_status: r.ea_status, srf: r.srf, candidates: 1 };
                    });
                    var toFix = Object.values(assocEas);
                    console.table(toFix);
                    if (toFix.length == 0) { alert('Nothing to fix'); return; }
                    if (!confirm(`Set 'Associated Equip Action' on ${toFix.length} equipment record(s)? (see console for the list, candidates > 1 => the latest EA is used)`)) { return; }

                    var fixed = 0; var failed = 0;
                    core.array.each(toFix, r => {
                        try {
                            recu.submit(twcEquipment.Type, r.id, twcEquipment.Fields.ASSOCIATED_EQUIP_ACTIONS, r.ea_id);
                            fixed++;
                            console.log(`FIXED: equipment ${r.id} (${r.name}) -> EA ${r.ea_id} (${r.ea_name} - ${r.ea_type} - ${r.ea_status} - ${r.srf})`);
                        } catch (error) {
                            failed++;
                            console.log(`FAILED: equipment ${r.id} (${r.name})`, error);
                        }
                    });
                    console.log(`DONE - fixed: ${fixed} - failed: ${failed}`);
                    alert(`Done - fixed: ${fixed} - failed: ${failed} (see console)`);
                    return;

                    // @@NOTE: ONE-OFF FIX - Issue 299: retired equipment licence statuses 'Prop to Licence - Licence Requested / Issued / Signed' and 'Prop to Unlicence - ...'
                    //         equipment (and SDS equipment lines) in one of those statuses go back to 'Prop to Licence' / 'Prop to Unlicence' (the equipment stays there until the licence is executed)
                    //         the retired values are found by name on customrecord_twc_equip_licence_status (some of them are not in twcUtils.EqLicenseStatus)
                    //         run BEFORE inactivating the retired values in NetSuite
                    var retired = coreSQL.run(`
                        select  id, name,
                                case when LOWER(name) like 'prop to licence -%' then ${twcUtils.EqLicenseStatus.ProptoLicence} else ${twcUtils.EqLicenseStatus.ProptoUnlicence} end as new_status
                        from    customrecord_twc_equip_licence_status
                        where   LOWER(name) like 'prop to licence -%' or LOWER(name) like 'prop to unlicence -%'
                    `);
                    console.table(retired);
                    if (retired.length == 0) { alert('No retired licence status found'); return; }
                    var newStatus = {}; core.array.each(retired, r => { newStatus[r.id] = r.new_status; });
                    var retiredIds = retired.map(r => { return r.id; }).join(',');

                    var toFix = coreSQL.run(`
                        select  'customrecord_twc_equip' as rec_type, 'custrecord_twc_eq_licence_status' as field, id, name, custrecord_twc_eq_licence_status as status, BUILTIN.DF(custrecord_twc_eq_licence_status) as status_name
                        from    customrecord_twc_equip
                        where   custrecord_twc_eq_licence_status in (${retiredIds})
                        union all
                        select  'customrecord_twc_sds_item' as rec_type, 'custrecord_twc_sds_item_license_status' as field, id, name, custrecord_twc_sds_item_license_status as status, BUILTIN.DF(custrecord_twc_sds_item_license_status) as status_name
                        from    customrecord_twc_sds_item
                        where   custrecord_twc_sds_item_license_status in (${retiredIds})
                    `);
                    console.table(toFix.map(r => { return { type: r.rec_type, id: r.id, name: r.name, status: r.status_name, new_status: newStatus[r.status] == twcUtils.EqLicenseStatus.ProptoLicence ? 'Prop to Licence' : 'Prop to Unlicence' }; }));
                    if (toFix.length == 0) { alert('Nothing to fix (see console for the retired statuses)'); return; }
                    if (!confirm(`Move ${toFix.length} record(s) (equipment / SDS lines) out of the retired licence statuses? (see console for the list)`)) { return; }

                    var fixed = 0; var failed = 0;
                    core.array.each(toFix, r => {
                        try {
                            recu.submit(r.rec_type, r.id, r.field, newStatus[r.status]);
                            fixed++;
                            console.log(`FIXED: ${r.rec_type} ${r.id} (${r.name}) - ${r.status_name} -> ${newStatus[r.status]}`);
                        } catch (error) {
                            failed++;
                            console.log(`FAILED: ${r.rec_type} ${r.id} (${r.name})`, error);
                        }
                    });
                    console.log(`DONE - fixed: ${fixed} - failed: ${failed}`);
                    alert(`Done - fixed: ${fixed} - failed: ${failed} (see console)`);
                    return;

                    // @@NOTE: ONE-OFF FIX - completed SAF actions wrongly detached (SAF action picker offered 'detach from <SAF>' on completed EAs, fixed in data/oTWC_utils.js: getSrfActions)
                    //         wrongly detached = SAF action status Detached but 'complete' still ticked (a legit detach only happens while pending, so complete is never ticked)
                    //         for each one:
                    //              - the SAF action goes back to Complete (detach reason / comment cleared)
                    //              - the SAF actions created on OTHER SAFs for the same EA after it, not completed themselves, are deleted (the wrong attach)
                    //              - the EA points back to the original SAF
                    var wrongDetached = coreSQL.run(`
                        select  sa.id, sa.custrecord_twc_saf_a_saf as saf, BUILTIN.DF(sa.custrecord_twc_saf_a_saf) as saf_name,
                                sa.custrecord_twc_saf_a_ea as ea, ea.name as ea_name, sa.created,
                                ea.custrecord_twc_eq_action_saf as ea_saf, BUILTIN.DF(ea.custrecord_twc_eq_action_saf) as ea_saf_name,
                                BUILTIN.DF(ea.custrecord_twc_eq_action_sts) as ea_status
                        from    customrecord_twc_saf_action sa
                        join    customrecord_twc_eq_action ea on ea.id = sa.custrecord_twc_saf_a_ea
                        where   sa.custrecord_twc_saf_a_status = ${twcUtils.SafActionStatus.Detached}
                        and     sa.custrecord_twc_saf_a_complete = 'T'
                        order by sa.id
                    `);
                    core.array.each(wrongDetached, w => {
                        w.wrongAttached = coreSQL.run(`
                            select  sa.id, sa.custrecord_twc_saf_a_saf as saf, BUILTIN.DF(sa.custrecord_twc_saf_a_saf) as saf_name, BUILTIN.DF(sa.custrecord_twc_saf_a_status) as status
                            from    customrecord_twc_saf_action sa
                            where   sa.custrecord_twc_saf_a_ea = ${w.ea}
                            and     sa.custrecord_twc_saf_a_saf != ${w.saf}
                            and     sa.id > ${w.id}
                            and     NVL(sa.custrecord_twc_saf_a_complete, 'F') = 'F'
                        `);
                    });
                    console.table(wrongDetached.map(w => {
                        return {
                            saf_action: w.id, ea: w.ea_name, ea_status: w.ea_status, restore_on: w.saf_name, ea_saf_now: w.ea_saf_name,
                            delete_saf_actions: w.wrongAttached.map(a => { return `${a.id} (${a.saf_name} - ${a.status})`; }).join(', ')
                        };
                    }));
                    if (wrongDetached.length == 0) { alert('Nothing to fix'); return; }
                    if (!confirm(`Restore ${wrongDetached.length} wrongly detached SAF action(s)? (see console for the list)`)) { return; }

                    var fixed = 0; var failed = 0;
                    core.array.each(wrongDetached, w => {
                        try {
                            core.array.each(w.wrongAttached, a => {
                                recu.del('customrecord_twc_saf_action', a.id);
                                console.log(`DELETED: SAF action ${a.id} on ${a.saf_name} (${w.ea_name})`);
                            });
                            recu.submit('customrecord_twc_saf_action', w.id,
                                ['custrecord_twc_saf_a_status', 'custrecord_twc_saf_a_detach_reason', 'custrecord_twc_saf_a_detach_comment'],
                                [twcUtils.SafActionStatus.Complete, null, null]);
                            recu.submit('customrecord_twc_eq_action', w.ea, 'custrecord_twc_eq_action_saf', w.saf);
                            fixed++;
                            console.log(`FIXED: SAF action ${w.id} restored on ${w.saf_name} (${w.ea_name})`);
                        } catch (error) {
                            failed++;
                            console.log(`FAILED: SAF action ${w.id} on ${w.saf_name} (${w.ea_name})`, error);
                        }
                    });
                    console.log(`DONE - fixed: ${fixed} - failed: ${failed}`);
                    alert(`Done - fixed: ${fixed} - failed: ${failed} (see console)`);
                    return;

                    /*
                    // @@NOTE: ONE-OFF FIX - SRF Review Space / Facilities check passed
                    //         the Facilities workflow stage (id 4) was configured with pass field / form field custrecord_twc_srf_rev_space_check_pass instead of custrecord_twc_srf_rev_fac_check_pass
                    //         so the Facilities check overwrote the Space check result and the Facilities check result was never saved on the review record
                    //         the right results are on the workflow items (custrecord_twc_srf_wkfi_review_passed): resets both fields on the review record from the latest completed Space / Facilities item
                    // @@HARDCODED: workflow stage ids 3 (Space) and 4 (Facilities)
                    const STAGE_SPACE = 3; const STAGE_FACILITIES = 4;
                    var reviews = {};
                    coreSQL.each(`
                        select  r.id as review_id, BUILTIN.DF(r.custrecord_twc_srf_rev_srf) as srf, r.custrecord_twc_srf_rev_iter as iter,
                                r.custrecord_twc_srf_rev_space_check_pass as cur_space, r.custrecord_twc_srf_rev_fac_check_pass as cur_fac,
                                wi.id as item_id, wi.custrecord_twc_srf_wkfi_stage as stage, wi.custrecord_twc_srf_wkfi_review_passed as passed
                        from    customrecord_twc_srf_rev r
                        join    customrecord_twc_srf_wkfi wi on wi.custrecord_twc_srf_wkfi_review = r.id
                        where   wi.custrecord_twc_srf_wkfi_stage in (${STAGE_SPACE}, ${STAGE_FACILITIES})
                        and     wi.custrecord_twc_srf_wkfi_status = ${twcSrfWorkflowEngine.WorkflowStatus.COMPLETED}
                        order by r.id, wi.id desc
                    `, row => {
                        var rev = reviews[row.review_id];
                        if (!rev) {
                            rev = reviews[row.review_id] = { id: row.review_id, srf: row.srf, iter: row.iter, curSpace: row.cur_space == 'T', curFac: row.cur_fac == 'T', space: null, fac: null };
                        }
                        // @@NOTE: rows are ordered by item id desc, so the first one per stage is the latest (a stage can be completed more than once in the same iteration)
                        if (row.stage == STAGE_SPACE && rev.space === null) { rev.space = row.passed == 'T'; }
                        if (row.stage == STAGE_FACILITIES && rev.fac === null) { rev.fac = row.passed == 'T'; }
                    });

                    var toFix = [];
                    for (var k in reviews) {
                        var rev = reviews[k];
                        rev.fields = []; rev.values = [];
                        // @@NOTE: only set a field when its check has been completed, otherwise leave it as it is
                        if (rev.space !== null && rev.space !== rev.curSpace) { rev.fields.push('custrecord_twc_srf_rev_space_check_pass'); rev.values.push(rev.space); }
                        if (rev.fac !== null && rev.fac !== rev.curFac) { rev.fields.push('custrecord_twc_srf_rev_fac_check_pass'); rev.values.push(rev.fac); }
                        if (rev.fields.length > 0) { toFix.push(rev); }
                    }
                    console.table(toFix.map(r => { return { review: r.id, srf: r.srf, iter: r.iter, cur_space: r.curSpace, new_space: r.space, cur_fac: r.curFac, new_fac: r.fac }; }));
                    if (toFix.length == 0) { alert('Nothing to fix'); return; }
                    if (!confirm(`Fix Space / Facilities check passed on ${toFix.length} SRF Review record(s)? (see console for the list)`)) { return; }

                    var fixed = 0; var failed = 0;
                    core.array.each(toFix, r => {
                        try {
                            recu.submit('customrecord_twc_srf_rev', r.id, r.fields, r.values);
                            fixed++;
                            console.log(`FIXED: review ${r.id} (${r.srf} - iter ${r.iter}) -> space: ${r.space} - facilities: ${r.fac}`);
                        } catch (error) {
                            failed++;
                            console.log(`FAILED: review ${r.id} (${r.srf} - iter ${r.iter})`, error);
                        }
                    });
                    console.log(`DONE - fixed: ${fixed} - failed: ${failed}`);
                    alert(`Done - fixed: ${fixed} - failed: ${failed} (see console)`);
                    return;
                    */
                    
                    

                    //twcSrfWorkflowEngine.initEquipment({ srf: 156 });

                    // @@NOTE: ONE-OFF FIX - ATME / Feeders added to an existing TME via SRF were created without parent TME
                    //         (initEquipment read a non existing constant TMI_ID instead of TME_ID, fixed in modules/oTWC_srfWorkflowEngine.js)
                    //         sets the equipment Parent TME from the SRF item TME (custrecord_twc_srf_itm_tme_id)
                    // if (!confirm('Fix missing Parent TME on equipment created from SRF items?')) { return; }
                    // var fixed = 0; var failed = 0; var done = {};
                    // var toFix = coreSQL.run(`
                        // select  eq.id, eq.name, srfi.custrecord_twc_srf_itm_tme_id as parent_id, BUILTIN.DF(srfi.custrecord_twc_srf_itm_tme_id) as parent_name,
                                // BUILTIN.DF(srfi.custrecord_twc_srf_itm_srf) as srf
                        // from    customrecord_twc_equip eq
                        // join    customrecord_twc_eq_action ea on ea.custrecord_twc_eq_action_eq = eq.id
                        // join    customrecord_twc_srf_itm srfi on srfi.id = ea.custrecord_twc_eq_action_srf_item
                        // where   eq.custrecord_twc_equip_parent_tme_id is null
                        // and     srfi.custrecord_twc_srf_itm_tme_id is not null
                        // order by eq.id
                    // `);
                    // console.log(`EQUIPMENT TO FIX: ${toFix.length}`, toFix);
                    // core.array.each(toFix, e => {
                        // // @@NOTE: the same equipment could come back more than once (more than one action), only fix it once
                        // if (done[e.id]) { return; }
                        // done[e.id] = true;
                        // try {
                            // recu.submit(twcEquipment.Type, e.id, twcEquipment.Fields.PARENT_TME_ID, e.parent_id);
                            // fixed++;
                            // console.log(`FIXED: ${e.name} -> parent: ${e.parent_name} (${e.srf})`);
                        // } catch (error) {
                            // failed++;
                            // console.log(`FAILED: ${e.name} -> parent: ${e.parent_name} (${e.srf})`, error);
                        // }
                    // });
                    // console.log(`DONE - fixed: ${fixed} - failed: ${failed}`);
                    // alert(`Done - fixed: ${fixed} - failed: ${failed} (see console)`);
                    //console.log(twcSdsEngine.getFormData({ id: 133 }))

                    //twcSrfWorkflowEngine.initWorkFlow({srf: 136})
                    //recu.submit('customrecord_twc_srf', 101, 'custrecord_twc_srf_lic_pack_signed', new Date(2026, 8, 18, 11, 25, 15))
                    // deleteSds(51)

                    // coreSQL.each(`
                    //      select f.id, f.name, s.custrecord_twc_site_id, sf.name,sf.id as site_folder, sf.parent
                    //     from  mediaitemfolder f
                    //     join customrecord_twc_srf srf on srf.name = f.name
                    //     join customrecord_twc_site s on s.id = srf.custrecord_twc_srf_site
                    //     join  mediaitemfolder sf on sf.name = s.custrecord_twc_site_id
                    //     where  f.parent=2250
                    //     and f.name like 'SRF%'
                       
                    //     order by f.name
                    // `, f => {
                    //    try {
                    //        console.log(f)
                    //         recu.submit('folder', f.id, 'parent', f.site_folder);
                    //    } catch (error) {
                    //        console.log(error);
                    //    }
                    // })
                    // var dataSource = { id: 85 }


                    // var f = recu.load('folder', 2908)
                    // f.set('parent', 5175)
                    
                    // console.log(f)

                    // console.log(recu.lookUp('customrecord_twc_prof', 1, 'custrecord_twc_prof_company'))
                    // console.log(recu.lookUp('customrecord_twc_prof', 2, 'custrecord_twc_prof_company'))

                    // dialog.siteFinder({ fullInfo: true }, e => {
                    //     console.log(e)
                    // })

                    // var items = twcSrfItem.select(
                    //     {
                    //         where: { [twcSrfItem.Fields.SRF]: dataSource.id || 0, },
                    //         useNames: true,
                    //         // tablePrefix: 'r',
                    //         joins: 
                    //             {
                    //                 type: 'left',
                    //                 table: 'customrecord_twc_eq_type',
                    //                 fx: 'custrecord_twc_srf_itm_type',
                    //                 // alias: 'eqt',
                    //                 fields: [
                    //                     { name: 'custrecord_twc_eq_type_create_lib_item', alias: 'create_lib_item' },
                    //                 ]
                    //             }
                    //         ,
                    //         getSql: true
                    //     }
                    // );

                    // console.log(items.query);
                    // console.log(coreSQL.run(items));
                    // //deleteSds(30)
                    //recu.submit('customrecord_twc_srf', 28, 'custrecord_twc_srf_sds_form_data', null);

                    //twcSiteAccessUtils.deleteSaf(147);
                    //twcSiteRequestUtils.deleteSrf(35)


                    //                    console.log(twcSdsEngine.getFormData({id: 36}))
                    //console.log(twcSdsEngine.setAsCurrent({ id: 36 }))

                    //console.log(twcSiteLocatorUtils.getSites(null, twcConfig.userInfo()))
                    // console.log(twcSdsEngine.getSrfInfo(101).srfItems)
                    //twcSdsEngine.getSdsEquipments(31)

                    // console.log(xml.escape({ xmlText: '/core/media/media.nl?id=25190&c=9061443_SB1&h=0x8UEtEYj_WI0zAlZrm7m_qYnvhXfgsOCm6N2VuCknGLV6DH&_xt=.pdf' }));

                    // console.log(
                    //     twcSiteRequestUtils.initEquipment({
                    //         srf: 28
                    //     })
                    // );
                    // var toggle = jQuery(`
                    //     <div>
                    //         ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'null_state', mandatory: true })}
                    //         ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'true_state', value: true, mandatory: false })}
                    //         ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'false_state', value: false, mandatory: true })}
                    //     </div>`
                    // );
                    // // var toggle = jQuery(`
                    // //     <div>
                    // //         ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'null_state', mandatory: true })}
                    // //     </div>`
                    // // );
                    // var form = twcUI.init({}, toggle);
                    // dialog.confirm({ message: form.ui }, dlg => {
                    //     try {

                    //         var val = form.getValues();
                    //         console.log(val);

                    //     } catch (error) {
                    //         dialog.error(error)
                    //         return false;
                    //     } 
                    // });

                    //twcSrfWorkflowEngineUI.getForm({ srf: 22 }).popUp();
                    // twcSrfWorkflowEngine.deleteWorkflow({ srf: 22 })
                    // twcSrfWorkflowEngine.initWorkFlow({ srf: 83, profile: 4201 });

                    //var eqAction = twcEquipAction.get();


                    // var tbl = jQuery(twcProfileUI.getCertFileHistory({
                    //     profile: 4277,
                    //     //certCode: 'safe_pass'
                    // }));
                    // var ui = twcUI.init({}, tbl);
                    // ui.ui.find('#file_history').css('display', 'table')
                    // ui.controls[0].onInitEvents = (tbl) => {
                    //     tbl.ui.find('#file_history').css('display', 'table')
                    // }
                    // dialog.message({
                    //     title: 'File History',
                    //     message: ui.ui,
                    //     size: { width: '70%', height: '500px' }
                    // })

                    // coreSQL.each('select id, 	custrecord_twc_equip_type, from customrecord_twc_equip where 	custrecord_twc_equip_class is null ', e => {
                    //     recu.submit('customrecord_twc_equip', e.id, 'custrecord_twc_equip_class', e.custrecord_twc_equip_type)
                    // })

                    // const getCurrency = (txt) => {
                    //     if (!txt) { return null; }
                    //     if (txt.toLowerCase() == 'eur' || txt.toLowerCase() == 'euro') { return 1; }
                    //     if (txt.toLowerCase() == 'gbp') { return 4; }
                    //     if (txt.toLowerCase() == 'usd') { return 2; }
                    //     if (txt.toLowerCase() == 'cad') { return 3; }
                    //     return null;
                    // }

                    // coreSQL.each(`
                    //     select  id, 	custrecord_twc_co_el_limit_cur as el_cur_txt, custrecord_twc_co_el_limit_currx as el_cur,    
                    //                     custrecord_twc_co_pl_limit_cur as pl_cur_txt, custrecord_twc_co_pl_limit_currx as pl_cur,
                    //                     custrecord_twc_co_pi_limit_cur as pi_cur_txt, custrecord_twc_co_pi_limit_currx as pi_cur,
                    //     from    customrecord_twc_company
                    //     order by id
                    // `, c => {
                    //     console.log(c);

                    //     var fields = ['custrecord_twc_co_el_limit_currx', 'custrecord_twc_co_pl_limit_currx', 'custrecord_twc_co_pi_limit_currx']
                    //     var values = [];
                    //     values.push(getCurrency(c.el_cur_txt));
                    //     values.push(getCurrency(c.pl_cur_txt));
                    //     values.push(getCurrency(c.pi_cur_txt));

                    //     recu.submit('customrecord_twc_company', c.id, fields, values);

                    // });


                    //console.log(twcUtils.getInfraStructures({ siteId : 55}))
                    //twcUtils.getSafImages()

                    // var saf = twcSaf.get(11);
                    // saf.health_and_Safety = [7]
                    // saf.save();

                    // var p = twcProfile.get(1088);
                    // console.log(p.climberFilenameName)

                    // coreSQL.each(`
                    //     select   id, name, 	custrecord_twc_prof_name
                    //     from  customrecord_twc_prof
                    //     where   id > 
                    //     order by id
                    // `, c => {
                    //     console.log(c);
                    //     recu.submit('customrecord_twc_prof', c.id, 'name', c.custrecord_twc_prof_name)
                    // })

                    // _ui.getControl('twc-calendar').specialDates = { '2026-03-03': 'test' }
                    // _ui.getControl('twc-calendar').datesContent = { '2026-03-03': 'test' }
                    // _ui.getControl('twc-calendar').value = new Date(2026, 1, 15)


                    // console.log(coreSQL.first(`
                    //     select  s.name, site.${twcSite.Fields.SITE_ID} as site_id
                    //     from    ${twcSrf.Type} s
                    //     join    ${twcSite.Type} site on site.id = s.${twcSrf.Fields.SITE}
                    //     where   s.id = 13

                    // `));

                    // console.log(recu.lookUp(twcSrf.Type, 13, ['name', twcSrf.Fields.SITE]));

                    // var testData = {
                    //     type: 'customrecord_twc_srf_itm',
                    //     "custrecord_twc_srf_itm_req_type": "1",
                    //     "custrecord_twc_srf_itm_equip_id": "",
                    //     "custrecord_twc_srf_itm_type": "1",
                    //     "custrecord_twc_srf_itm_desc": "Test Dish Install",
                    //     "custrecord_twc_srf_itm_loc": "1",
                    //     "custrecord_twc_srf_itm_length_mm": "60",
                    //     "custrecord_twc_srf_itm_width_mm": "60",
                    //     "custrecord_twc_srf_itm_depth_mm": "60",
                    //     "custrecord_twc_srf_itm_ht_on_twr": "5",
                    //     "custrecord_twc_srf_itm_weight_kg": "1",
                    //     "custrecord_twc_srf_itm_volt_type": "1",
                    //     "custrecord_twc_srf_itm_azimuth": "0",
                    //     "custrecord_twc_srf_itm_b_end": "0",
                    //     "custrecord_twc_srf_itm_cust_ref": "XXX",
                    //     "custrecord_twc_srf_itm_invent_flag": "18"
                    // }
                    // console.log(twcSrfUI.getSrfChildRecord({}, testData))
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


