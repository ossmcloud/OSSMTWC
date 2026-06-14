/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js', '../data/oTWC_srfWorkflow.js', '../data/oTWC_srfWorkflowItem.js', '../data/oTWC_srfWorkflowStage.js', '../data/oTWC_srf.js', '../data/oTWC_srfReview.js'],
    function (core, coreSql, recu, twcProfile, twcCompany, twcUtils, twcSrfWorkflow, twcSrfWorkflowItem, twcSrfWorkflowStage, twcSrf, twcSrfReview) {

        // @@HARDCODED
        const WORKFLOW_STATUS = {
            NEW: 1,
            IN_PROGRESS: 2,
            COMPLETED: 3,
            CANCELLED: 4
        }

        function initWorkFlow(options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

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

                // complete it and get 
                coreSql.each(`
                    select  id, name
                    from    customrecord_twc_srf_wks 
                    where  	custrecord_twc_srf_wks_loop ='T'
                    order by 	custrecord_twc_srf_wks_step_no, custrecord_twc_srf_wks_seq_no
                `, stage => {
                    var srfWorkflowItem = twcSrfWorkflowItem.get();
                    srfWorkflowItem.workflow = wkf.id;
                    srfWorkflowItem.workflowStage = stage.id;
                    srfWorkflowItem.status = WORKFLOW_STATUS.NEW;
                    srfWorkflowItem.save();
                });

                recu.submit(twcSrfWorkflowItem.Type, feedbackIssuedStage[0].id, twcSrfWorkflowItem.Fields.STATUS, WORKFLOW_STATUS.COMPLETED);

                // increase feed back count
                recu.submit(twcSrf.Type, options.srf, [twcSrf.Fields.STATUS, twcSrf.Fields.FEEDBACK_LOOP_ITERATIONS], [twcUtils.SrfStatus.Resubmitted, (srf.feedbackLoopIterations || 1) + 1]);

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

            core.array.each(srfWorkflowStages, (stage, idx) => {
                // @@NOTE: this stage is only used if the SRF is re-submitted
                if (stage[twcSrfWorkflowStage.Fields.DO_NOT_CREATE] == 'T' ) { return; }
                var srfWorkflowItem = twcSrfWorkflowItem.get();
                //srfWorkflowItem.name = `W${srf.name}_S${stage.stepnumber}/${stage.sequencenumber}`;
                srfWorkflowItem.workflow = srfWorkflow.id;
                srfWorkflowItem.workflowStage = stage.id;
                if (idx == 0) {
                    srfWorkflowItem.customerProfile = options.profile;
                    srfWorkflowItem.actual = new Date();
                    srfWorkflowItem.status = WORKFLOW_STATUS.COMPLETED;
                } else {
                    srfWorkflowItem.status = WORKFLOW_STATUS.NEW;
                }
                srfWorkflowItem.save();
            })

            recu.submit(twcSrf.Type, options.srf, twcSrf.Fields.SRF_STATUS, twcUtils.SrfStatus.Submitted);

        }

        function getParentReviewRecord(wkf, item) {
            return coreSql.first(`
                select  wi.id, NVL(srf.custrecord_twc_srf_fdbk_loop_iter, 1) as feedback_loop_count, w.custrecord_twc_srf_wkf_parent as srf, BUILTIN.DF(w.custrecord_twc_srf_wkf_parent) as srf_name, 
                        wi.custrecord_twc_srf_wkfi_stage as stage, ws.custrecord_twc_srf_wks_next as stage_next, 
                        ws.custrecord_twc_srf_wks_is_review as is_review, custrecord_twc_srf_wkfi_review as review
                from    customrecord_twc_srf_wkfi wi
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                join    customrecord_twc_srf_wkf w on w.id = wi.custrecord_twc_srf_wkfi_parent 
                join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent

                where  wi.custrecord_twc_srf_wkfi_parent = ${wkf}
                and    BUILTIN.MNFILTER(ws.custrecord_twc_srf_wks_next , 'MN_INCLUDE', '', 'TRUE', ${item.stage}) = 'T'
                and    wi.id < ${item.id}
                order by wi.created desc
            `)
        }
        function updateWorkflow(userInfo, options) {

            var items = null;
            if (options.item) {
                items = [options.item];
            } else if (options.items) {
                items = options.items;
            }

            if (items) {
                core.array.each(items, item => {
                    var fields = [];
                    var values = [];
                    for (var k in item) {
                        if (!k.startsWith('cust')) { continue; }
                        fields.push(k);
                        if (twcSrfWorkflowItem.getField(k)?.type == 'date') {
                            values.push(twcUtils.fromJsToNs(item[k]));
                        } else {
                            values.push(item[k]);
                        }
                    }
                    recu.submit(twcSrfWorkflowItem.Type, item.id, fields, values);

                    if (item.formData) {
                        var parentReview = getParentReviewRecord(options.wkf, item);
                        var reviewRecord = twcSrfReview.get(parentReview.review);
                        reviewRecord.name = `R${parentReview.srf_name}_${parentReview.feedback_loop_count}`;
                        if (!parentReview.review) {
                            reviewRecord.sRF = parentReview.srf;
                            reviewRecord.reviewIteration = parentReview.feedback_loop_count;
                        }
                        for (var k in item.formData) {
                            if (!reviewRecord.hasField(k)) { continue; }
                            reviewRecord.set(k, item.formData[k]);
                        }
                        reviewRecord.save();
                        if (!parentReview.review) {
                            recu.submit(twcSrfWorkflowItem.Type, parentReview.id, twcSrfWorkflowItem.Fields.REVIEW, reviewRecord.id);
                        }

                        var passed = item.formData[item.formData.passField];

                        recu.submit(twcSrfWorkflowItem.Type, item.id, [twcSrfWorkflowItem.Fields.REVIEW, twcSrfWorkflowItem.Fields.REVIEW_PASSED], [reviewRecord.id, passed]);
                    }



                })

                if (options.setStatus) {
                    recu.submit(twcSrf.Type, options.srf, twcSrf.Fields.SRF_STATUS, options.setStatus);
                    recu.submit(twcSrfWorkflow.Type, options.wkf, twcSrfWorkflow.Fields.STATUS, WORKFLOW_STATUS.IN_PROGRESS);
                }

            }



            return { status: 'success' };

        }

        function deleteWorkflow(options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            options.id = coreSql.first(`select id from ${twcSrfWorkflow.Type} where ${twcSrfWorkflow.Fields.SRF} = ${options.srf}`).id;

            coreSql.each(`select id from ${twcSrfWorkflowItem.Type} where ${twcSrfWorkflowItem.Fields.WORKFLOW} = ${options.id}`, wi => {
                recu.del(twcSrfWorkflowItem.Type, wi.id);
            });
            recu.del(twcSrfWorkflow.Type, options.id);

            recu.submit(twcSrf.Type, options.srf, twcSrf.Fields.SRF_STATUS, twcUtils.SrfStatus.Draft);
        }


        function getWorkFlow(userInfo, options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            var workflow = coreSql.first(`
                select  w.id, custrecord_twc_srf_wkf_status as status, BUILTIN.DF(custrecord_twc_srf_wkf_status) as status_name, custrecord_twc_srf_wkf_notes as notes,
                        custrecord_twc_srf_wkf_parent as srf, srf.name as srf_name,
                        srf.custrecord_twc_srf_site as site, BUILTIN.DF(custrecord_twc_srf_site) as site_name,
                        srf.custrecord_twc_srf_cust as customer, BUILTIN.DF(srf.custrecord_twc_srf_cust) as customer_name,
                        srf.custrecord_twc_srf_cust_plan_ins_date as customer_planned_date
                    
                from    ${twcSrfWorkflow.Type} w
                join    customrecord_twc_srf srf on srf.id = w.custrecord_twc_srf_wkf_parent
                where   ${twcSrfWorkflow.Fields.SRF} = ${options.srf}
            `);
            if (!workflow) { throw new Error(`No Workflow found for SRF: ${options.srf}`); }

            var srfReviewFields = twcSrfReview.getFields();
            var srfReviewFieldSql = '';
            srfReviewFields.map(f => { if (f.field_id.startsWith('cust')) { srfReviewFieldSql += `${f.field_id},`; } })

            // @@TODO: use constants
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
                        ws.custrecord_twc_srf_wks_hide as stage_hidden, ws.custrecord_twc_srf_wks_loop as stage_loop, 
                        ws.custrecord_twc_srf_wks_is_last as is_last_stage,

                        wi.custrecord_twc_srf_wkfi_review_passed as review_passed,
                        wr.id as review_id, ${srfReviewFieldSql}

                from    customrecord_twc_srf_wkfi wi
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                left join customrecord_twc_srf_rev wr on wr.id = wi.custrecord_twc_srf_wkfi_review
                where   wi.custrecord_twc_srf_wkfi_parent = ${workflow.id}
                order by custrecord_twc_srf_wks_seq_outer, wi.created, ws.custrecord_twc_srf_wks_step_no, ws.custrecord_twc_srf_wks_seq_no, wi.created
            `, wi => {
                wi.next_stage = (wi.next_stage || '').split(',').map(ns => { return parseInt(ns.trim()); })
                workflow.items.push(wi);
            })

            return workflow;
        }


        return {
            WorkflowStatus: WORKFLOW_STATUS,
            initWorkFlow: initWorkFlow,
            getWorkFlow: getWorkFlow,
            updateWorkflow: updateWorkflow,
            deleteWorkflow: deleteWorkflow,

        }
    });
