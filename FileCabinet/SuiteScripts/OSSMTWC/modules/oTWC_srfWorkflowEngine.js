/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js', '../data/oTWC_srfWorkflow.js', '../data/oTWC_srfWorkflowItem.js', '../data/oTWC_srfWorkflowStage.js', '../data/oTWC_srf.js', '../data/oTWC_srfReview.js', '../data/oTWC_equipment.js', '../data/oTWC_equipAction.js', '../data/oTWC_srfItem.js', '../data/oTWC_sds.js', './oTWC_sdsEngine.js', '../data/oTWC_file.js'],
    function (core, coreSql, recu, twcProfile, twcCompany, twcUtils, twcSrfWorkflow, twcSrfWorkflowItem, twcSrfWorkflowStage, twcSrf, twcSrfReview, twcEquipment, twcEqAct, twcSrfItem, twcSds, twcSdsEngine, twcFile) {

        // @@HARDCODED
        const WORKFLOW_STATUS = {
            NEW: 1,
            IN_PROGRESS: 2,
            COMPLETED: 3,
            CANCELLED: 4,
            NOT_REQUIRED: 5
        }

        function addWorkingDays(date, days) {
            if (!days) { return date; }
            var d = date;
            var daysAdded = 0;
            while (daysAdded < days) {
                d = d.addDays(1);
                if (d.getDay() != 0 && d.getDay() != 6) {
                    // @@TODO: handle bank holidays
                    daysAdded++;
                }
            }
            return d;
        }

        function getEqActions(options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            return coreSql.run(`
                select  act.id as act_id, act.custrecord_twc_eq_action_eq as eq_id, act.custrecord_twc_eq_action_type as ea_type,
                        srf.custrecord_twc_srf_site, srf.custrecord_twc_srf_cust, 
                        srfi.*
                from    customrecord_twc_eq_action as act
                join    customrecord_twc_srf_itm as srfi on srfi.id = act.custrecord_twc_eq_action_srf_item
                join    customrecord_twc_srf as srf on srf.id = srfi.custrecord_twc_srf_itm_srf
                where   act.custrecord_twc_eq_action_srf = ${options.srf}
                order by custrecord_twc_srf_itm_tme_srf desc
            `)
        }

        function initEquipment(options) {
            var actions = getEqActions(options);
            core.array.each(actions, action => {
                var eq = twcEquipment.get(action.eq_id);
                eq.site = action[twcSrf.Fields.SITE];
                eq.equipmentClass = action[twcSrfItem.Fields.STEP_TYPE];
                eq.equipmentType = action[twcSrfItem.Fields.ITEM_TYPE];
                eq.infrastructure = action[twcSrfItem.Fields.STRUCTURE];
                // @@TODO: SRF: review fields to populate
                // eq.locationNotes
                eq.equipmentInstallStatus = twcUtils.EqInstallStatus.Draft;

                if (action.ea_type == twcUtils.EqActionType.Install || action.ea_type == twcUtils.EqActionType.Licence || action.ea_type == twcUtils.EqActionType.SwapLicence) {
                    eq.equipmentLicenceStatus = twcUtils.EqLicenseStatus.ReqtoLicence;
                } else if (action.ea_type == twcUtils.EqActionType.Remove || action.ea_type == twcUtils.EqActionType.Unlicence || action.ea_type == twcUtils.EqActionType.SwapUnlicence) {
                    eq.equipmentLicenceStatus = twcUtils.EqLicenseStatus.ReqtoUnlicence;
                } else {
                    // @@NOTE: this should not happen
                    eq.equipmentLicenceStatus = twcUtils.EqLicenseStatus.Draft;
                }

                eq.customer = action[twcSrf.Fields.CUSTOMER];

                // get the parent equipment
                if (action[twcSrfItem.Fields.TMI_ID_SRF]) {
                    var parent = actions.find(a => { return a.id == action[twcSrfItem.Fields.TMI_ID_SRF]; })
                    eq.parentTMEID = parent?.eq_id;
                }

                // @@TODO: SRF: get the lib entry used if we have one set useLib = yes, otherwqise set no
                // eq.useLibrary = twcEqLib.EqLibUse.Draft;    
                // eq.equipmentLibraryEntry
                // eq.activePassive
                eq.make = action[twcSrfItem.Fields.MAKE];
                eq.model = action[twcSrfItem.Fields.MODEL];
                eq.description = action[twcSrfItem.Fields.DESCRIPTION];
                eq.lengthmm = action[twcSrfItem.Fields.LENGTH_MM];
                eq.widthmm = action[twcSrfItem.Fields.WIDTH_MM];
                eq.heightDepthmm = action[twcSrfItem.Fields.DEPTH_MM];
                eq.weightkg = action[twcSrfItem.Fields.WEIGHT_KG];
                eq.heightonTowerm = action[twcSrfItem.Fields.HEIGHT_ON_TOWER];
                eq.azimuth = action[twcSrfItem.Fields.AZIMUTH];
                eq.b_End = action[twcSrfItem.Fields.B_END];
                eq.customerRef = action[twcSrfItem.Fields.CUSTOMER_REF];
                eq.inventoryFlag = action[twcSrfItem.Fields.INVENTORY_FLAG];
                eq.optType = action[twcSrfItem.Fields.TYPE_OPT];

                // eq.windLoadingNm2Front
                // eq.windLoadingNm2Side
                // eq.windLoadingNm2Rear
                // eq.windLoadingNm2Max
                // eq.windRegime
                eq.voltageType = action[twcSrfItem.Fields.VOLTAGE_TYPE];
                eq.voltageRange = action[twcSrfItem.Fields.VOLTAGE_RANGE];
                // eq.customerNote
                // eq.tLNote
                eq.associatedEQUIP_ACTIONs = action.act_id;

                eq.save();
                action.eq_id = eq.id;

                recu.submit(twcEqAct.Type, action.act_id, twcEqAct.Fields.EA_EQUIPMENT, eq.id);
                recu.submit(twcSrfItem.Type, action.id, twcSrfItem.Fields.EQUIPMENT_ID, eq.id);
            })

            return actions;

        }

        function updateEquipment(options, licenseStatus) {
            var actions = getEqActions(options);
            core.array.each(actions, action => {

                var s = licenseStatus;
                if (action.ea_type == twcUtils.EqActionType.Remove || action.ea_type == twcUtils.EqActionType.Unlicence || action.ea_type == twcUtils.EqActionType.SwapUnlicence) {
                    // @@NOTE: this is called with 'license' stuff but we may have an unlicense

                    if (licenseStatus == twcUtils.EqLicenseStatus.ProptoLicence) {
                        s = twcUtils.EqLicenseStatus.ProptoUnlicence;
                    } else if (licenseStatus == twcUtils.EqLicenseStatus.ReqtoLicence) {
                        s = twcUtils.EqLicenseStatus.ReqtoUnlicence;
                    } else if (licenseStatus == twcUtils.EqLicenseStatus.ProptoLicence_LicenceRequested) {
                        s = twcUtils.EqLicenseStatus.ProptoUnlicence_LicenceRequested;
                    } else if (licenseStatus == twcUtils.EqLicenseStatus.ProptoLicence_LicenceIssued) {
                        s = twcUtils.EqLicenseStatus.ProptoUnlicence_LicenceIssued;
                    } else if (licenseStatus == twcUtils.EqLicenseStatus.Licenced) {
                        s = twcUtils.EqLicenseStatus.Unlicenced;
                    }

                }

                recu.submit(twcEquipment.Type, action.eq_id, twcEquipment.Fields.EQUIPMENT_LICENCE_STATUS, s);
            });
        }

        function initWorkFlow(options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            initEquipment(options);

            // @@NOTE: get SRF and make sure status is Submitted
            var srf = twcSrf.get(options.srf);
            if (srf.state == 'new') { throw new Error(`No SRF Found for id: ${options.srf}`); }
            if (srf.sRFStatus != twcUtils.SrfStatus.Draft && srf.sRFStatus != twcUtils.SrfStatus.FeedbackIssued) { throw new Error(`Invalid SRF Status: ${srf.sRFStatusName}`); }

            var wkf = coreSql.first(`select id from ${twcSrfWorkflow.Type} where ${twcSrfWorkflow.Fields.SRF} = ${options.srf}`)
            if (srf.sRFStatus == twcUtils.SrfStatus.FeedbackIssued) {
                if (wkf == null) { throw new Error(`No Workflow Found for id: ${options.srf}`); }

                // find the stage with status 'FeedbackIssued' that is in progress
                var feedbackIssuedStage = coreSql.run(`
                    select  wi.id
                    from    customrecord_twc_srf_wkfi wi 
                    join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                    where  	wi.custrecord_twc_srf_wkfi_parent = ${wkf.id}
                    and     ws.custrecord_twc_srf_wks_status_to = ${twcUtils.SrfStatus.FeedbackIssued}
                    and     wi.custrecord_twc_srf_wkfi_status = ${WORKFLOW_STATUS.IN_PROGRESS}
                `)
                if (feedbackIssuedStage.length != 1) { throw new Error(`Invalid Workflow Stage, expected feedback issued, found records: ${feedbackIssuedStage.length}`); }

                var plannedDate = new Date();
                // complete it and get 
                coreSql.each(`
                    select  id, name, custrecord_twc_srf_wks_plan_delta_days as delta_days
                    from    customrecord_twc_srf_wks 
                    where  	custrecord_twc_srf_wks_loop ='T'
                    order by custrecord_twc_srf_wks_seq_no
                `, stage => {
                    plannedDate = addWorkingDays(plannedDate, stage.delta_days || 0);

                    var srfWorkflowItem = twcSrfWorkflowItem.get();
                    srfWorkflowItem.workflow = wkf.id;
                    srfWorkflowItem.workflowStage = stage.id;
                    srfWorkflowItem.status = WORKFLOW_STATUS.NEW;
                    srfWorkflowItem.planned = plannedDate;
                    srfWorkflowItem.save();
                });

                recu.submit(twcSrfWorkflowItem.Type, feedbackIssuedStage[0].id, [twcSrfWorkflowItem.Fields.STATUS, twcSrfWorkflowItem.Fields.ACTUAL], [WORKFLOW_STATUS.COMPLETED, new Date()]);

                // increase feed back count
                recu.submit(twcSrf.Type, options.srf, [twcSrf.Fields.SRF_STATUS, twcSrf.Fields.FEEDBACK_LOOP_ITERATIONS], [twcUtils.SrfStatus.Resubmitted, (srf.feedbackLoopIterations || 1) + 1]);

                return;
            } else {
                // @@NOTE: this function creates the initial work flow so it can only be run once against an SRF
                if (wkf != null) { throw new Error(`There is already a workflow set up for this SRF`); }
            }


            // now load the stages to create the workflow
            var srfWorkflowStages = twcSrfWorkflowStage.select({ orderBy: [twcSrfWorkflowStage.Fields.STEP_NUMBER, twcSrfWorkflowStage.Fields.SEQUENCE_NUMBER], noAlias: true });

            var srfWorkflow = twcSrfWorkflow.get();
            srfWorkflow.sRF = options.srf;
            srfWorkflow.name = `W${srf.name}`;
            srfWorkflow.status = WORKFLOW_STATUS.NEW;
            srfWorkflow.save();

            var plannedDate = null;
            core.array.each(srfWorkflowStages, (stage, idx) => {
                // @@NOTE: this stage is only used if the SRF is re-submitted
                if (stage[twcSrfWorkflowStage.Fields.DO_NOT_CREATE] == 'T') { return; }
                var srfWorkflowItem = twcSrfWorkflowItem.get();
                //srfWorkflowItem.name = `W${srf.name}_S${stage.stepnumber}/${stage.sequencenumber}`;
                srfWorkflowItem.workflow = srfWorkflow.id;
                srfWorkflowItem.workflowStage = stage.id;
                if (idx == 0) {
                    srfWorkflowItem.profile = options.profile;
                    srfWorkflowItem.actual = new Date();
                    srfWorkflowItem.status = WORKFLOW_STATUS.COMPLETED;
                    plannedDate = new Date();
                } else {
                    srfWorkflowItem.status = WORKFLOW_STATUS.NEW;
                    if (stage[twcSrfWorkflowStage.Fields.HIDDEN] != 'T') {
                        plannedDate = addWorkingDays(plannedDate, stage[twcSrfWorkflowStage.Fields.PLANNED_DATE_DELTA] || 0);
                    }
                    srfWorkflowItem.planned = plannedDate;
                }
                srfWorkflowItem.save();
            })

            recu.submit(twcSrf.Type, options.srf, [twcSrf.Fields.SRF_STATUS, twcSrf.Fields.FEEDBACK_LOOP_ITERATIONS], [twcUtils.SrfStatus.Submitted, 1]);

        }

        // function getParentReviewRecord(wkf, item) {
        //     return coreSql.first(`
        //         select  wi.id, NVL(srf.custrecord_twc_srf_fdbk_loop_iter, 1) as feedback_loop_count, w.custrecord_twc_srf_wkf_parent as srf, BUILTIN.DF(w.custrecord_twc_srf_wkf_parent) as srf_name, 
        //                 wi.custrecord_twc_srf_wkfi_stage as stage, ws.custrecord_twc_srf_wks_next as stage_next, 
        //                 ws.custrecord_twc_srf_wks_is_review as is_review, custrecord_twc_srf_wkfi_review as review
        //         from    customrecord_twc_srf_wkfi wi
        //         join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
        //         join    customrecord_twc_srf_wkf w on w.id = wi.custrecord_twc_srf_wkfi_parent 
        //         join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent

        //         where  wi.custrecord_twc_srf_wkfi_parent = ${wkf}
        //         and    BUILTIN.MNFILTER(ws.custrecord_twc_srf_wks_next , 'MN_INCLUDE', '', 'TRUE', ${item.stage}) = 'T'
        //         and    wi.id < ${item.id}
        //         order by wi.created desc
        //     `)
        // }

        // function getReviewRecord(options) {
        //     return coreSql.first(`
        //         select  sr.id, w.custrecord_twc_srf_wkf_parent as srf, BUILTIN.DF(w.custrecord_twc_srf_wkf_parent) as srf_name, srf.custrecord_twc_srf_fdbk_loop_iter as feedback_loop_count
        //         from    customrecord_twc_srf_wkf w
        //         join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent
        //         left join    customrecord_twc_srf_rev sr on sr.custrecord_twc_srf_rev_srf = srf.id and sr.custrecord_twc_srf_rev_iter = srf.custrecord_twc_srf_fdbk_loop_iter
        //         where   w.id = ${options.wkf}
        //         order by sr.created desc
        //     `)
        // }

        function updateWorkflow(userInfo, options) {
            var response = { status: 'success' };

            var items = null;
            if (options.item) {
                items = [options.item];
            } else if (options.items) {
                items = options.items;
            }

            if (items) {
                var isLastStage = false; var stepNotRequired = false;
                core.array.each(items, item => {
                    var fields = []; var values = [];
                    fields.push(twcSrfWorkflowItem.Fields.PROFILE);
                    values.push(userInfo.profile)
                    for (var k in item) {
                        if (!k.startsWith('cust')) { continue; }
                        fields.push(k);
                        if (twcSrfWorkflowItem.getField(k)?.type == 'date') {
                            values.push(twcUtils.fromJsToNs(item[k]));
                        } else {
                            values.push(item[k]);
                        }

                        if (k == twcSrfWorkflowItem.Fields.STATUS && item[k] == WORKFLOW_STATUS.NOT_REQUIRED) {
                            stepNotRequired = true;
                        }
                    }
                    recu.submit(twcSrfWorkflowItem.Type, item.id, fields, values);

                    isLastStage = item.last;

                    if (stepNotRequired) { return; }

                    if (item.formData) {
                        if (item.formData.record == twcSrfReview.Type) {
                            var reviewRecordInfo = twcUtils.getSrfReviewRecord(options);
                            var reviewRecord = twcSrfReview.get(reviewRecordInfo.id);
                            reviewRecord.name = `R${reviewRecordInfo.srf_name}_${reviewRecordInfo.feedback_loop_count}`;
                            if (!reviewRecordInfo.id) {
                                reviewRecord.sRF = reviewRecordInfo.srf;
                                reviewRecord.reviewIteration = reviewRecordInfo.feedback_loop_count;
                            }
                            for (var k in item.formData) {
                                if (!reviewRecord.hasField(k)) { continue; }
                                reviewRecord.set(k, item.formData[k]);
                            }
                            if (options.setStatus == twcUtils.SrfStatus.FeedbackIssued) {
                                reviewRecord.tLReviewResult = twcUtils.SrfReviewStatus.FeedbackIssued;
                            } else if (options.setStatus == twcUtils.SrfStatus.SRFApproved) {
                                reviewRecord.tLReviewResult = twcUtils.SrfReviewStatus.Approved;
                            }

                            reviewRecord.save();

                            recu.submit(twcSrfWorkflowItem.Type, item.id, [twcSrfWorkflowItem.Fields.REVIEW, twcSrfWorkflowItem.Fields.REVIEW_PASSED], [reviewRecord.id, item.formData[item.formData.passField]]);
                        } else {
                            var fields = []; var values = [];
                            for (var k in item.formData) {
                                if (!k.startsWith('cust')) { continue; }
                                fields.push(k);
                                var val = item.formData[k];
                                if (val.length == 10 && val.indexOf('-') == 4) { val = twcUtils.fromJsToNs(val); }
                                values.push(val);
                            }
                            var recordId = null;
                            if (item.formData.record == twcSrf.Type) { recordId = options.srf; }
                            if (item.formData.record == twcSrfWorkflow.Type) { recordId = options.wkf; }
                            recu.submit(item.formData.record, recordId, fields, values)
                        }

                    }

                })

                if (options.setStatus) {
                    recu.submit(twcSrf.Type, options.srf, twcSrf.Fields.SRF_STATUS, options.setStatus);
                    if (options.setStatus == twcUtils.SrfStatus.SRFApproved) {
                        updateEquipment(options, twcUtils.EqLicenseStatus.ProptoLicence)
                    } else if (options.setStatus == twcUtils.SrfStatus.Resubmitted) {
                        updateEquipment(options, twcUtils.EqLicenseStatus.ReqtoLicence)
                    } else if (options.setStatus == twcUtils.SrfStatus.LicenceRequested) {
                        updateEquipment(options, twcUtils.EqLicenseStatus.ProptoLicence_LicenceRequested)
                    } else if (options.setStatus == twcUtils.SrfStatus.LicenceIssued) {
                        updateEquipment(options, twcUtils.EqLicenseStatus.ProptoLicence_LicenceIssued)
                    } else if (options.setStatus == twcUtils.SrfStatus.LicenseSigned) {
                        updateEquipment(options, twcUtils.EqLicenseStatus.Licenced)
                    }

                    if (options.wkf) {
                        recu.submit(twcSrfWorkflow.Type, options.wkf, twcSrfWorkflow.Fields.STATUS, WORKFLOW_STATUS.IN_PROGRESS);
                        if (options.setStatus == twcUtils.SrfStatus.SRFApproved) {
                            var reviewRecordInfo = twcUtils.getSrfReviewRecord(options);
                            if (reviewRecordInfo.id) {
                                recu.submit(twcSrfReview.Type, reviewRecordInfo.id, twcSrfReview.Fields.TL_REVIEW_RESULT, twcUtils.SrfReviewStatus.Approved)
                            }
                        }
                    }

                    response.srfStatus = options.setStatus;
                    response.wkfStatus = WORKFLOW_STATUS.IN_PROGRESS;
                    response.wkfStatusName = 'In Progress';

                }
                if (isLastStage) {
                    recu.submit(twcSrfWorkflow.Type, options.wkf, twcSrfWorkflow.Fields.STATUS, WORKFLOW_STATUS.COMPLETED);

                    response.wkfStatus = WORKFLOW_STATUS.COMPLETED;
                    response.wkfStatusName = 'Completed';
                }

            } else if (core.utils.isObj(options.srf)) {
                var fields = []; var values = [];
                for (var k in options.srf) {
                    if (!k.startsWith('cust')) { continue; }
                    fields.push(k);
                    if (twcSrf.getField(k)?.type == 'date') {

                        values.push(twcUtils.fromJsToNs(options.srf[k]));
                    } else {
                        values.push(options.srf[k]);
                    }
                }
                recu.submit(twcSrf.Type, options.srf.id, fields, values);

            } else if (options.wkf) {
                var fields = []; var values = [];
                for (var k in options.wkf) {
                    if (!k.startsWith('cust')) { continue; }
                    fields.push(k);
                    if (twcSrfWorkflow.getField(k)?.type == 'date') {
                        values.push(twcUtils.fromJsToNs(options.wkf[k]));
                    } else {
                        values.push(options.wkf[k]);
                    }
                }
                recu.submit(twcSrfWorkflow.Type, options.wkf.id, fields, values);
            }

            return response;
        }



        function getWorkFlow(userInfo, options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            var workflow = coreSql.first(`
                select  w.id, custrecord_twc_srf_wkf_status as status, BUILTIN.DF(custrecord_twc_srf_wkf_status) as status_name, custrecord_twc_srf_wkf_notes as notes,
                        custrecord_twc_srf_wkf_parent as srf, srf.name as srf_name,
                        srf.custrecord_twc_srf_site as site, BUILTIN.DF(custrecord_twc_srf_site) as site_name, 
                        srf.custrecord_twc_srf_status as srf_status, BUILTIN.DF(srf.custrecord_twc_srf_status) as srf_status_name,
                        srf.custrecord_twc_srf_cust as customer, BUILTIN.DF(srf.custrecord_twc_srf_cust) as customer_name,
                        TO_CHAR(srf.custrecord_twc_srf_cust_plan_ins_date, 'YYYY-MM-DD') as customer_planned_date,
                        TO_CHAR(srf.custrecord_twc_srf_permit_date, 'YYYY-MM-DD') as works_permitted_date,
                        TO_CHAR(srf.custrecord_twc_srf_tl_drg_draft, 'YYYY-MM-DD') as custrecord_twc_srf_tl_drg_draft,
                        TO_CHAR(srf.custrecord_twc_srf_tl_drg_rev, 'YYYY-MM-DD') as custrecord_twc_srf_tl_drg_rev,
                        TO_CHAR(srf.custrecord_twc_srf_tl_drg_upl, 'YYYY-MM-DD') as custrecord_twc_srf_tl_drg_upl,
                        TO_CHAR(srf.custrecord_twc_srf_approval_date, 'YYYY-MM-DD') as custrecord_twc_srf_approval_date,
                        TO_CHAR(srf.custrecord_twc_srf_lic_req, 'YYYY-MM-DD') as custrecord_twc_srf_lic_req,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_prod, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_prod,
                        srf.custrecord_twc_srf_lic_pack_rev,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_revd, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_revd,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_issued, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_issued,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_signed, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_signed,
                        srf.custrecord_twc_srf_lic_pack_sign_by
                        
                    
                from    ${twcSrfWorkflow.Type} w
                join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent
                where   ${twcSrfWorkflow.Fields.SRF} = ${options.srf}
            `);
            if (!workflow) { throw new Error(`No Workflow found for SRF: ${options.srf}`); }

            var srfReviewFields = twcSrfReview.getFields();
            var srfReviewFieldSql = '';
            srfReviewFields.map(f => { if (f.field_id.startsWith('cust')) { srfReviewFieldSql += `${f.field_id},`; } })

            workflow.items = [];
            coreSql.each(`
                select  wi.id, ws.id as stage, ws.name as stage_name, ws.custrecord_twc_srf_wks_step_no step_no, ws.custrecord_twc_srf_wks_seq_no as seq_no,
                        wi.custrecord_twc_srf_wkfi_status as status, BUILTIN.DF(custrecord_twc_srf_wkfi_status) as status_name,
                        TO_CHAR(wi.custrecord_twc_srf_wkfi_planned, 'YYYY-MM-DD') as planned, TO_CHAR(wi.custrecord_twc_srf_wkfi_actual, 'YYYY-MM-DD') as actual,
                        custrecord_twc_srf_wkfi_cprofile as profile, BUILTIN.DF(custrecord_twc_srf_wkfi_cprofile) as profile_name,
                        wi.custrecord_twc_srf_wkfi_assigned_to as assigned_to, BUILTIN.DF(wi.custrecord_twc_srf_wkfi_assigned_to) as assigned_to_name,

                        ws.custrecord_twc_srf_wks_next as next_stage, ws.custrecord_twc_srf_wks_next_pick as next_stage_pick,
                        ws.custrecord_twc_srf_wks_status_to as set_status, BUILTIN.DF(ws.custrecord_twc_srf_wks_status_to) as set_status_name,
                        ws.custrecord_twc_srf_wks_form as form_data, ws.custrecord_twc_srf_wks_is_review as is_review, ws.custrecord_twc_srf_wks_is_review_passf review_pass_field,
                        ws.custrecord_twc_srf_wks_assign as can_assign, ws.custrecord_twc_srf_wks_can_skip as can_skip,
                        ws.custrecord_twc_srf_wks_hide as stage_hidden, ws.custrecord_twc_srf_wks_loop as stage_loop, 
                        ws.custrecord_twc_srf_wks_is_last as is_last_stage,

                        
                        wi.custrecord_twc_srf_wkfi_review_passed as review_passed,
                        wr.id as review_id, ${srfReviewFieldSql}

                from    customrecord_twc_srf_wkfi wi
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                left join customrecord_twc_srf_rev wr on wr.id = wi.custrecord_twc_srf_wkfi_review
                where   wi.custrecord_twc_srf_wkfi_parent = ${workflow.id}
                order by custrecord_twc_srf_wks_seq_outer, wi.created, ws.custrecord_twc_srf_wks_seq_no, wi.created
            `, wi => {
                wi.next_stage = (wi.next_stage || '').split(',').map(ns => { return parseInt(ns.trim()); })
                workflow.items.push(wi);
            })

            return workflow;
        }


        function isWaitingForSignature(userInfo, options) {
            if (!options.srf && !options.id) { return null; }


            var sql = `
                select  w.id as wkf, wi.id, wi.custrecord_twc_srf_wkfi_cprofile as profile, custrecord_twc_srf_wks_next as next_stage, ws.id as stage, ws.name as stage_name
                from    customrecord_twc_srf_wkf w
                join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent
                join    customrecord_twc_srf_wkfi wi on wi.custrecord_twc_srf_wkfi_parent = w.id
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                
                where   custrecord_twc_srf_wkf_parent = ${options.srf || options.id}
                and     ws.custrecord_twc_srf_wks_to_sign = 'T'
                and     wi.custrecord_twc_srf_wkfi_status = ${WORKFLOW_STATUS.IN_PROGRESS}
            `;

            return coreSql.first(sql);
        }
        function postSignature(userInfo, options) {
            if (options.isTLSignature) {
                if (!userInfo.canExecutePack) { throw new Error(`You do not have permissions to sign the document`); }
            } else {
                if (!userInfo.canSign) { throw new Error(`You do not have permissions to sign the document`); }
            }
            var signatureRecord = isWaitingForSignature(userInfo, options);
            if (!signatureRecord) { throw new Error(`Could not find a pending signature workflow item for srf: ${options.srf}`); }

            var formData = null;
            if (options.isTLSignature) {
                formData = {
                    record: twcSrf.Type,
                    [twcSrf.Fields.LICENCE_PACK_EXECUTED]: (new Date()).format(),
                    [twcSrf.Fields.LICENCE_PACK_EXECUTED_BY]: userInfo.recordId,
                }
            } else {
                formData = {
                    record: twcSrf.Type,
                    [twcSrf.Fields.LICENCE_PACK_SIGNED]: (new Date()).format(),
                    [twcSrf.Fields.LICENCE_PACK_SIGNED_BY]: userInfo.profile,
                }
            }

            var updateOptions = {
                srf: options.srf,
                wkf: signatureRecord.wkf,
                items: [
                    {
                        id: signatureRecord.id,
                        [twcSrfWorkflowItem.Fields.STATUS]: WORKFLOW_STATUS.COMPLETED,
                        [twcSrfWorkflowItem.Fields.ACTUAL]: (new Date()).format(),
                        formData: formData
                    }
                ]
            }


            coreSql.each(`
                select  wi.id, ws.custrecord_twc_srf_wks_status_to as set_status, ws.custrecord_twc_srf_wks_is_last as is_last
                from    customrecord_twc_srf_wkf w
                join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent
                join    customrecord_twc_srf_wkfi wi on wi.custrecord_twc_srf_wkfi_parent = w.id
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage

                where   custrecord_twc_srf_wkf_parent = ${options.srf || options.id}  
                and     ws.id in (${signatureRecord.next_stage})

            `, nextStage => {
                updateOptions.items.push({
                    id: nextStage.id,
                    [twcSrfWorkflowItem.Fields.STATUS]: nextStage.is_last == 'T' ? WORKFLOW_STATUS.COMPLETED : WORKFLOW_STATUS.IN_PROGRESS,
                    last: nextStage.is_last == 'T'
                })

                if (nextStage.set_status) {
                    updateOptions.setStatus = nextStage.set_status;
                }
            });

            updateWorkflow(userInfo, updateOptions)

            if (options.isTLSignature) { twcSdsEngine.setAsCurrent({ id: options.srf }) }

            return { status: 'success', srf: options.srf }
        }





        function isWaitingForAcceptance(userInfo, options) {
            if (!options.srf && !options.id) { return null; }
            var sql = `
                select  wi.id, wi.custrecord_twc_srf_wkfi_cprofile as profile, custrecord_twc_srf_wks_next as next_stage
                from    customrecord_twc_srf_wkf w
                join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent
                join    customrecord_twc_srf_wkfi wi on wi.custrecord_twc_srf_wkfi_parent = w.id
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                
                where   custrecord_twc_srf_wkf_parent = ${options.srf || options.id}
                and     ws.custrecord_twc_srf_wks_status_to = ${twcUtils.SrfStatus.SRFApproved}
                and     wi.custrecord_twc_srf_wkfi_status = ${WORKFLOW_STATUS.IN_PROGRESS}
            `;
            return coreSql.first(sql);
        }

        function acceptSrf(userInfo, options) {
            var approvalRecord = isWaitingForAcceptance(userInfo, options);
            if (!approvalRecord) { throw new Error(`Could not find a pending acceptance workflow item for srf: ${options.srf}`); }

            var updateOptions = {
                srf: options.srf,
                items: [
                    {
                        id: approvalRecord.id,
                        [twcSrfWorkflowItem.Fields.STATUS]: WORKFLOW_STATUS.COMPLETED,
                        [twcSrfWorkflowItem.Fields.ACTUAL]: (new Date()).format(),
                        formData: {
                            record: twcSrf.Type,
                            [twcSrf.Fields.LICENCE_REQUESTED]: (new Date()).format(),
                        }
                    }
                ]
            }

            coreSql.each(`
                select  wi.id, ws.custrecord_twc_srf_wks_status_to as set_status
                from    customrecord_twc_srf_wkf w
                join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent
                join    customrecord_twc_srf_wkfi wi on wi.custrecord_twc_srf_wkfi_parent = w.id
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage

                where   custrecord_twc_srf_wkf_parent = ${options.srf || options.id}  
                and     ws.id in (${approvalRecord.next_stage})

            `, nextStage => {
                updateOptions.items.push({
                    id: nextStage.id,
                    [twcSrfWorkflowItem.Fields.STATUS]: WORKFLOW_STATUS.IN_PROGRESS,
                })

                if (nextStage.set_status) {
                    updateOptions.setStatus = nextStage.set_status;
                }
            });

            updateWorkflow(userInfo, updateOptions)

            return { status: 'success' }
        }


        function cancelWorkflow(options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            var wkf = null;
            coreSql.each(`
                select  wi.id, w.id as wkf
                from    customrecord_twc_srf_wkf w
                join    customrecord_twc_srf_wkfi wi on wi.custrecord_twc_srf_wkfi_parent = w.id
                where   custrecord_twc_srf_wkf_parent = ${options.srf}  
                and     wi.custrecord_twc_srf_wkfi_status != ${WORKFLOW_STATUS.COMPLETED}
            `, wi => {
                wkf = wi.wkf;
                recu.submit(twcSrfWorkflowItem.Type, wi.id, twcSrfWorkflowItem.Fields.STATUS, WORKFLOW_STATUS.CANCELLED);
            })

            recu.submit(twcSrfWorkflow.Type, wkf, twcSrfWorkflow.Fields.STATUS, WORKFLOW_STATUS.CANCELLED);
        }


        function deleteWorkflow(options) {
            if (!options) { throw new Error('no parameters passed'); }

            if (options.wkf) {
                options.srf = coreSql.first(`select ${twcSrfWorkflow.Fields.SRF} as srf from ${twcSrfWorkflow.Type} where id = ${options.wkf}`)?.srf;
            }

            if (!options.srf) { throw new Error('invalid parameters passed'); }

            updateEquipment(options, twcUtils.EqLicenseStatus.ReqtoLicence)

            options.id = coreSql.first(`select id from ${twcSrfWorkflow.Type} where ${twcSrfWorkflow.Fields.SRF} = ${options.srf}`)?.id;

            if (options.id) {
                coreSql.each(`select id from ${twcSrfWorkflowItem.Type} where ${twcSrfWorkflowItem.Fields.WORKFLOW} = ${options.id}`, wi => {
                    recu.del(twcSrfWorkflowItem.Type, wi.id);
                });
                recu.del(twcSrfWorkflow.Type, options.id);
            }

            coreSql.each(`select id from customrecord_twc_srf_rev where custrecord_twc_srf_rev_srf = ${options.srf}`, review => {
                recu.del('customrecord_twc_srf_rev', review.id);
            })

            var fields = [
                twcSrf.Fields.SRF_STATUS, twcSrf.Fields.FEEDBACK_LOOP_ITERATIONS, twcSrf.Fields.WORKS_PERMITTED_DATE,
                twcSrf.Fields.TL_DRAWING_UPLOADED, twcSrf.Fields.SRF_APPROVAL_DATE,
                twcSrf.Fields.LICENCE_PACK_ISSUED, twcSrf.Fields.LICENCE_REQUESTED, twcSrf.Fields.LICENCE_PACK_PRODUCED,
                twcSrf.Fields.LICENCE_PACK_REVIEWER, twcSrf.Fields.LICENCE_PACK_REVIEWED,
                twcSrf.Fields.LICENCE_PACK_SIGNED, twcSrf.Fields.LICENCE_PACK_SIGNED_BY,
                twcSrf.Fields.LICENCE_PACK_EXECUTED, twcSrf.Fields.LICENCE_PACK_EXECUTED_BY
            ]
            var values = [
                twcUtils.SrfStatus.Draft, 0, null,
                null, null,
                null, null, null,
                null, null,
                null, null,
                null, null,
            ]

            recu.submit(twcSrf.Type, options.srf, fields, values);

            var sds = coreSql.first(`select id, ${twcSds.Fields.PDF} as file_id from ${twcSds.Type} where ${twcSds.Fields.SRF} = ${options.srf}`);
            if (sds) {
                recu.del(twcSds.Type, sds.id);
                // @@NOTE: the actual PDF file is not deleted but we do not care as this function will never be used on live
                if (sds.file_id) { recu.del(twcFile.Type, sds.file_id) }
            }
        }


        return {
            WorkflowStatus: WORKFLOW_STATUS,
            initWorkFlow: initWorkFlow,
            getWorkFlow: getWorkFlow,
            updateWorkflow: updateWorkflow,
            deleteWorkflow: deleteWorkflow,
            cancelWorkflow: cancelWorkflow,
            isWaitingForSignature: isWaitingForSignature,
            postSignature: postSignature,
            acceptSrf: acceptSrf,
            

        }
    });
