/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js', '../data/oTWC_srfWorkflow.js', '../data/oTWC_srfWorkflowItem.js', '../data/oTWC_srfWorkflowStage.js', '../data/oTWC_srf.js', '../data/oTWC_srfReview.js', '../data/oTWC_equipment.js', '../data/oTWC_equipAction.js', '../data/oTWC_srfItem.js', '../data/oTWC_sds.js', './oTWC_sdsEngine.js', '../data/oTWC_file.js'],
    function (core, coreSql, recu, twcProfile, twcCompany, twcUtils, twcSrfWorkflow, twcSrfWorkflowItem, twcSrfWorkflowStage, twcSrf, twcSrfReview, twcEquipment, twcEqAct, twcSrfItem, twcSds, twcSdsEngine, twcFile) {


        // @IMPORTANT NOTE: API Governance
        //      initEquipment = 10 units + 6 units per action
        //      after init equip = 58 units
        //      so we have 1000 - 10 - 58 = 932 / 6 => 155 Max Actions to process we round to 150
        const MAX_ACTIONS_TO_INIT = 150;

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

            //
            // @@IMPORTANT NOTE: The sorting of this query if very important DO NOT CHANGE
            //                   The sorting ensures that in case of swap the 'Install' action comes first and the Remove next
            //                   This is because function initEquipment will set the newly generated equipment id on the  srf item line
            //                   However, for swap the eq. id should be the one being swapped, NOT the new one
            //                   So the Install action will set the newly created eq. id into the srf line
            //                   But then the 'Remove' action, processed AFTER because of the sorting, will put the old eq.id back
            //
            // @@REVIEW:         I am sure there is a better and safer way to do this but for now thiks is what it is
            //                  
            //
            //
            return coreSql.run(`
                select  act.id as act_id, act.custrecord_twc_eq_action_eq as eq_id, act.custrecord_twc_eq_action_type as ea_type,
                        srf.custrecord_twc_srf_site, srf.custrecord_twc_srf_cust, 
                        srfi.*
                from    customrecord_twc_eq_action as act
                join    customrecord_twc_srf_itm as srfi on srfi.id = act.custrecord_twc_eq_action_srf_item
                join    customrecord_twc_srf as srf on srf.id = srfi.custrecord_twc_srf_itm_srf
                where   act.custrecord_twc_eq_action_srf = ${options.srf}
                order by custrecord_twc_eq_action_type, custrecord_twc_srf_itm_tme_srf desc
            `)
            //
            // @@IMPORTANT NOTE: END
            //
            //
        }

        function initEquipment(options) {

            var actions = getEqActions(options);
            if (actions.length > MAX_ACTIONS_TO_INIT) { throw new Error(`Too many actions to save: ${MAX_ACTIONS_TO_INIT}`); }

            core.array.each(actions, action => {
                // LOOP: 2 units (save rec) + 2 UNITS * 2 for submit = 6 units
                var eq = twcEquipment.get(action.eq_id);

                if (action.ea_type == twcUtils.EqActionType.Licence || action.ea_type == twcUtils.EqActionType.SwapLicence) {
                    eq.equipmentLicenceStatus = twcUtils.EqLicenseStatus.ReqtoLicence;

                    eq.site = action[twcSrf.Fields.SITE];
                    eq.customer = action[twcSrf.Fields.CUSTOMER];
                    eq.equipmentClass = action[twcSrfItem.Fields.STEP_TYPE];
                    eq.equipmentType = action[twcSrfItem.Fields.ITEM_TYPE];
                    eq.infrastructure = action[twcSrfItem.Fields.STRUCTURE];
                    eq.equipmentInstallStatus = twcUtils.EqInstallStatus.NotInstalled;
                    eq.equipmentLibraryEntry = action[twcSrfItem.Fields.EQUIPMENT_LIBRARY];
                    eq.useLibrary = (eq.equipmentLibraryEntry) ? twcUtils.EqLibUse.Yes : twcUtils.EqLibUse.No;
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
                    eq.feederType = action[twcSrfItem.Fields.FEEDER_TYPE];
                    eq.voltageType = action[twcSrfItem.Fields.VOLTAGE_TYPE];
                    // @@NOTE: SRF item 'Modified Antenna Location' => equipment custrecord_twc_equip_location (same list), SRF item 'GIE Location' => equipment 'GIE Location'
                    eq.modifiedAntennaLocation = action[twcSrfItem.Fields.MODIFIED_ANTENNA_LOCATION];
                    eq.gIELocation = action[twcSrfItem.Fields.GIE_LOCATION];
                    eq.associatedEQUIP_ACTIONs = action.act_id;

                    // get the parent equipment
                    // @@NOTE: TMI_ID_SRF = parent TME is a line of this SRF (its equipment is created above, the actions are sorted so TMEs come first)
                    //         TME_ID     = parent TME is an existing equipment picked from the site (this used to read a non-existing 'TMI_ID' constant so the parent was never set)
                    var parentEqId = null;
                    if (action[twcSrfItem.Fields.TMI_ID_SRF]) {
                        var parent = actions.find(a => { return a.id == action[twcSrfItem.Fields.TMI_ID_SRF]; })
                        parentEqId = parent?.eq_id;
                    }
                    if (!parentEqId && action[twcSrfItem.Fields.TME_ID]) {
                        parentEqId = action[twcSrfItem.Fields.TME_ID];
                    }
                    if (parentEqId) { eq.parentTMEID = parentEqId; }


                } else if (action.ea_type == twcUtils.EqActionType.Unlicence || action.ea_type == twcUtils.EqActionType.SwapUnlicence) {
                    eq.equipmentLicenceStatus = twcUtils.EqLicenseStatus.ReqtoUnlicence;
                } else {
                    // @@NOTE: this should not happen
                    throw new Error(`Invalid Eq. Action Type: ${action.ea_type}`);
                }
                
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

                // @@TODO: this should not happen but it did so I need to keep going but we should remove this line
                if (!action.eq_id) { return; }


                var s = licenseStatus;
                if (action.ea_type == twcUtils.EqActionType.Unlicence || action.ea_type == twcUtils.EqActionType.SwapUnlicence) {
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

                if (s == twcUtils.EqLicenseStatus.Licenced) {
                    // @@NOTE: the equipment becomes licenced => stamp the licenced date (same submit as the status)
                    //         unlicence actions never get here as 'Licenced' (mapped to 'Unlicenced' above)
                    recu.submit(twcEquipment.Type, action.eq_id, [twcEquipment.Fields.EQUIPMENT_LICENCE_STATUS, twcEquipment.Fields.LICENCED_DATE], [s, new Date()]);
                } else {
                    recu.submit(twcEquipment.Type, action.eq_id, twcEquipment.Fields.EQUIPMENT_LICENCE_STATUS, s);
                }
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

            // @@NOTE: the user must enter a comment when submitting / re-submitting (ui/js/oTWC_spaceRequest.js: askSubmitComment)
            var submitComment = (options.submitComment || '').trim();
            if (!submitComment) { throw new Error(`A comment is required to submit the SRF`); }

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
                `, (stage, idx) => {
                    plannedDate = addWorkingDays(plannedDate, stage.delta_days || 0);

                    var srfWorkflowItem = twcSrfWorkflowItem.get();
                    srfWorkflowItem.workflow = wkf.id;
                    srfWorkflowItem.workflowStage = stage.id;
                    srfWorkflowItem.status = (idx == 0) ? WORKFLOW_STATUS.IN_PROGRESS : WORKFLOW_STATUS.NEW;
                    srfWorkflowItem.planned = plannedDate;
                    srfWorkflowItem.save();
                });

                recu.submit(twcSrfWorkflowItem.Type, feedbackIssuedStage[0].id, [twcSrfWorkflowItem.Fields.STATUS, twcSrfWorkflowItem.Fields.ACTUAL], [WORKFLOW_STATUS.COMPLETED, new Date()]);

                // increase feed back count (and keep the latest submission comment on the SRF)
                recu.submit(twcSrf.Type, options.srf, [twcSrf.Fields.SRF_STATUS, twcSrf.Fields.FEEDBACK_LOOP_ITERATIONS, twcSrf.Fields.SUBMISSION_NOTES], [twcUtils.SrfStatus.Resubmitted, (srf.feedbackLoopIterations || 1) + 1, submitComment]);

                saveSubmissionComment(options.srf, submitComment, options.profile);

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

            recu.submit(twcSrf.Type, options.srf, [twcSrf.Fields.SRF_STATUS, twcSrf.Fields.FEEDBACK_LOOP_ITERATIONS, twcSrf.Fields.SUBMISSION_NOTES], [twcUtils.SrfStatus.Submitted, 1, submitComment]);

            saveSubmissionComment(options.srf, submitComment, options.profile);
        }

        // @@NOTE: stores the submission / re-submission comment (and who submitted) on the SRF Review record of the current iteration (SRF feedback loop count, so this must run after it is set)
        //         the review record is created here if not there yet, the review stage (updateWorkflow) will then pick up this same record (twcUtils.getSrfReviewRecord)
        function saveSubmissionComment(srfId, comment, profile) {
            var reviewRecordInfo = twcUtils.getSrfReviewRecord({ srf: srfId });
            if (!reviewRecordInfo) { throw new Error(`Could not find the workflow for srf: ${srfId}`); }
            var reviewRecord = twcSrfReview.get(reviewRecordInfo.id);
            reviewRecord.name = `R${reviewRecordInfo.srf_name}_${reviewRecordInfo.feedback_loop_count}`;
            if (!reviewRecordInfo.id) {
                reviewRecord.sRF = reviewRecordInfo.srf;
                reviewRecord.reviewIteration = reviewRecordInfo.feedback_loop_count;
            }
            reviewRecord.customerSubmissionComments = comment;
            // @@NOTE: profile of the user submitting / re-submitting (set by ui/modules/oTWC_siteRequestUtils.js: submitSiteSrf)
            reviewRecord.submittedBy = profile || null;
            reviewRecord.save();
        }

        function getNextStepId(workflowId, stepId) {
            return coreSql.first(`
                select      wi.id
                from        customrecord_twc_srf_wkfi wi
                where       wi.custrecord_twc_srf_wkfi_parent = ${workflowId}
                and         wi.custrecord_twc_srf_wkfi_stage = (
                    select  ws.custrecord_twc_srf_wks_next 
                    from    customrecord_twc_srf_wkfi wi2
                    join    customrecord_twc_srf_wks ws on ws.id = wi2.custrecord_twc_srf_wkfi_stage
                    where   wi2.id = ${stepId}
                )
                and wi.id > ${stepId}
            `)?.id;
        }

        // @@NOTE: PLANNED DATES - propagation of a planned date change to the following steps
        //         - a step planned date moved later / earlier by N working days => the following steps are moved by the same N working days
        //         - the checks (consecutive review steps) are one group: the group ends on the LATEST planned date of its enabled checks
        //           so the steps after the checks move only when that latest check date moves (and by the same amount)
        //         - disabled checks / steps (NOT REQUIRED) are skipped: no planned date and they do not count
        //         - a check enabled again with no planned date gets: end of the previous step + stage 'planned date delta'
        //         - completed / cancelled steps are never moved, the actual date is never used
        //         - dates already set (e.g. typed by the user) are kept, they are only moved by the shift
        //         working days (no weekends), same as the dates set when the workflow is created (addWorkingDays)
        const PLAN_DATE = {
            toDate: (s) => { if (!s) { return null; } var p = s.split('-'); return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)); },
            toJs: (d) => { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },
            isWorkDay: (d) => { return d.getDay() != 0 && d.getDay() != 6; },
            // signed number of working days from a to b ('YYYY-MM-DD')
            diff: (a, b) => {
                if (!a || !b || a == b) { return 0; }
                var sign = (b > a) ? 1 : -1;
                var d = PLAN_DATE.toDate(a); var end = PLAN_DATE.toJs(PLAN_DATE.toDate(b)); var n = 0;
                while (PLAN_DATE.toJs(d) != end) {
                    d.setDate(d.getDate() + sign);
                    if (PLAN_DATE.isWorkDay(d)) { n += sign; }
                }
                return n;
            },
            // moves a date ('YYYY-MM-DD') by n working days (n can be negative)
            shift: (s, n) => {
                if (!s || !n) { return s; }
                var sign = (n > 0) ? 1 : -1;
                var d = PLAN_DATE.toDate(s); var moved = 0;
                while (moved < Math.abs(n)) {
                    d.setDate(d.getDate() + sign);
                    if (PLAN_DATE.isWorkDay(d)) { moved++; }
                }
                return PLAN_DATE.toJs(d);
            }
        }

        // @@NOTE: workflow steps in the same order as getWorkFlow (the workflow table), with what is needed for the planned dates
        function getPlanSteps(workflowId) {
            return coreSql.run(`
                select  wi.id, wi.custrecord_twc_srf_wkfi_status as status,
                        TO_CHAR(wi.custrecord_twc_srf_wkfi_planned, 'YYYY-MM-DD') as planned,
                        ws.custrecord_twc_srf_wks_plan_delta_days as delta_days, ws.custrecord_twc_srf_wks_is_review as is_review
                from    customrecord_twc_srf_wkfi wi
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                where   wi.custrecord_twc_srf_wkfi_parent = ${workflowId}
                order by custrecord_twc_srf_wks_seq_outer, wi.created, ws.custrecord_twc_srf_wks_seq_no, wi.created
            `);
        }

        // @@NOTE: propagates the planned date changes made by an update (before = getPlanSteps taken before the update was saved)
        //         returns true if any planned date was changed
        function propagatePlannedDates(workflowId, before) {
            if (!workflowId || !before || before.length == 0) { return false; }

            var after = getPlanSteps(workflowId);
            var beforeById = {};
            core.array.each(before, s => { beforeById[s.id] = s; });

            // @@NOTE: segments: one step, or a group of consecutive review steps (the checks)
            var segments = [];
            core.array.each(after, s => {
                s.status = parseInt(s.status);
                var last = segments[segments.length - 1];
                if (s.is_review == 'T' && last?.isGroup) {
                    last.steps.push(s);
                } else {
                    segments.push({ isGroup: s.is_review == 'T', steps: [s] });
                }
            });

            const isActive = (status) => { return status != WORKFLOW_STATUS.NOT_REQUIRED && status != WORKFLOW_STATUS.CANCELLED; };
            const isLocked = (status) => { return status == WORKFLOW_STATUS.COMPLETED || status == WORKFLOW_STATUS.CANCELLED; };
            // end of a segment: latest planned date of its active steps, the end of the previous segment if none
            const segmentEnd = (steps, prevEnd, useBefore) => {
                var end = null;
                core.array.each(steps, s => {
                    var status = useBefore ? parseInt(beforeById[s.id]?.status) : s.status;
                    var planned = useBefore ? beforeById[s.id]?.planned : s.planned;
                    if (!isActive(status) || !planned) { return; }
                    if (!end || planned > end) { end = planned; }
                });
                return end || prevEnd;
            };

            var changed = false;
            const setPlanned = (s, planned) => {
                if ((s.planned || null) == (planned || null)) { return; }
                recu.submit(twcSrfWorkflowItem.Type, s.id, twcSrfWorkflowItem.Fields.PLANNED, planned ? twcUtils.fromJsToNs(planned) : null);
                s.planned = planned;
                changed = true;
            }

            var shift = 0; var prevEndBefore = null; var prevEndAfter = null;
            core.array.each(segments, seg => {
                // @@NOTE: recalc = the segment end must be re-evaluated (it has open steps or steps changed by this update)
                //         a segment with only completed / not required steps not touched by this update does not change the shift (it passes through)
                var recalc = false;
                core.array.each(seg.steps, s => {
                    var b = beforeById[s.id];
                    // @@NOTE: plannedChanged: the planned date was set by this update (e.g. typed by the user) => it is kept as it is, never shifted
                    var plannedChanged = !b || (b.planned || null) != (s.planned || null);
                    var statusChanged = !b || parseInt(b.status) != s.status;
                    if (plannedChanged || statusChanged) { recalc = true; }

                    if (s.status == WORKFLOW_STATUS.NOT_REQUIRED) {
                        setPlanned(s, null);
                        return;
                    }
                    if (isLocked(s.status)) { return; }
                    recalc = true;

                    if (!s.planned) {
                        // @@NOTE: step enabled again by this update (e.g. a check) with no planned date: end of the previous segment + stage delta
                        if (statusChanged && prevEndAfter) {
                            setPlanned(s, PLAN_DATE.shift(prevEndAfter, parseInt(s.delta_days) || 0));
                        }
                    } else if (!plannedChanged && shift) {
                        setPlanned(s, PLAN_DATE.shift(s.planned, shift));
                    }
                });

                var endBefore = segmentEnd(seg.steps, prevEndBefore, true);
                var endAfter = segmentEnd(seg.steps, prevEndAfter, false);
                if (recalc) { shift = PLAN_DATE.diff(endBefore, endAfter); }
                prevEndBefore = endBefore;
                prevEndAfter = endAfter;
            });

            return changed;
        }

        function updateWorkflow(userInfo, options) {
            var response = { status: 'success' };

            var items = null;
            if (options.item) {
                items = [options.item];
            } else if (options.items) {
                items = options.items;
            }

            // @@NOTE: planned dates before this update, used to move the following steps when a planned date / check changes (propagatePlannedDates)
            var planStepsBefore = (items && options.wkf) ? getPlanSteps(options.wkf) : null;

            if (items) {
                var stepNotRequired = false; var someStepIsInProgress = false; var lastReviewStepId = null;
                core.array.each(items, (item, idx) => {
                    var fields = []; var values = [];
                    // @@NOTE: only the first item is the step being actioned by the user; the following items are the subsequent steps
                    //         (set to in progress / not required) and must NOT be stamped with the profile of the user completing this step
                    if (idx == 0) {
                        fields.push(twcSrfWorkflowItem.Fields.PROFILE);
                        values.push(userInfo.profile)
                    }
                    for (var k in item) {
                        if (!k.startsWith('cust')) { continue; }
                        fields.push(k);
                        var fieldType = twcSrfWorkflowItem.getField(k)?.type;
                        if (fieldType == 'date') {
                            values.push(twcUtils.fromJsToNs(item[k]));
                        } else {
                            values.push(item[k]);
                        }

                        if (k == twcSrfWorkflowItem.Fields.STATUS) {
                            if (item[k] == WORKFLOW_STATUS.NOT_REQUIRED) {
                                stepNotRequired = true;
                            } else if (item[k] == WORKFLOW_STATUS.IN_PROGRESS) {
                                if (item.isReview) { someStepIsInProgress = true; }
                            }
                        }

                        if (item.isReview) { lastReviewStepId = item.id; }
                    }
                    recu.submit(twcSrfWorkflowItem.Type, item.id, fields, values);

                    if (stepNotRequired) { return; }

                    if (item.formData) {
                        var recordType = ''; var fields = []; var values = [];
                        if (item.formData.record == twcSrfReview.Type) {

                            var reviewRecordInfo = twcUtils.getSrfReviewRecord(options);
                            var reviewRecord = twcSrfReview.get(reviewRecordInfo.id);
                            reviewRecord.name = `R${reviewRecordInfo.srf_name}_${reviewRecordInfo.feedback_loop_count}`;
                            if (!reviewRecordInfo.id) {
                                reviewRecord.sRF = reviewRecordInfo.srf;
                                reviewRecord.reviewIteration = reviewRecordInfo.feedback_loop_count;
                            }
                            for (var k in item.formData) {
                                // @@NOTE: the form is generally associated to one record but one or more field could relate to a different record (srf or workflow)
                                //         these fields are identified by the fact that the id will be [table_name]-[field_name]
                                // @@IMPORTANT: @@REVIEW: this only supports one 'other' record type
                                if (k.indexOf('-') > 0) {
                                    recordType = k.split('-');
                                    fields.push(recordType[1]);
                                    values.push(item.formData[k]);
                                    recordType = recordType[0];
                                    continue;
                                }

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
                            recordType = item.formData.record;
                            for (var k in item.formData) {
                                if (!k.startsWith('cust')) { continue; }
                                fields.push(k);
                                var val = item.formData[k];
                                if (val?.length == 10 && val?.indexOf('-') == 4) { val = twcUtils.fromJsToNs(val); }
                                values.push(val);
                                // @@NOTE: license is issued when reviewed not sure why we have 2 dates
                                //         however we agreed that the user will only set the reviewed date and the issued date will be same
                                if (k == twcSrf.Fields.LICENCE_PACK_REVIEWED) {
                                    fields.push(twcSrf.Fields.LICENCE_PACK_ISSUED);
                                    values.push(val);
                                }
                            }

                        }

                        if (recordType && fields.length > 0) {
                            var recordId = null;
                            if (recordType == twcSrf.Type) { recordId = options.srf; }
                            if (recordType == twcSrfWorkflow.Type) { recordId = options.wkf; }
                            recu.submit(recordType, recordId, fields, values)
                        }
                    }

                })

                // @@NOTE: TL Response (approve / feedback) comments back to the customer (oTWC_srfWorkflowEngineUI.js: WorkflowFormItem.render)
                //         saved on the current SRF Review record (TL Review Comments): shown to the customer on the SRF page (oTWC_srfUI.js: getFeedbackReviewRecords)
                //         and used as default 'Additional SRF Conditions' when the SDS is created (oTWC_sdsEngine.js: getSds)
                //         saved BEFORE the SRF status changes (below) so it is there when the customer is notified
                if (options.tlReviewComments !== undefined && options.tlReviewComments !== null) {
                    var reviewRecordInfo = twcUtils.getSrfReviewRecord(options);
                    if (reviewRecordInfo.id) {
                        recu.submit(twcSrfReview.Type, reviewRecordInfo.id, twcSrfReview.Fields.TL_REVIEW_COMMENTS, options.tlReviewComments);
                    } else {
                        var reviewRecord = twcSrfReview.get();
                        reviewRecord.name = `R${reviewRecordInfo.srf_name}_${reviewRecordInfo.feedback_loop_count}`;
                        reviewRecord.sRF = reviewRecordInfo.srf;
                        reviewRecord.reviewIteration = reviewRecordInfo.feedback_loop_count;
                        reviewRecord.tLReviewComments = options.tlReviewComments;
                        reviewRecord.save();
                    }
                }

                if (!someStepIsInProgress && lastReviewStepId) {
                    // @@NOTE: this can hapen if the 'Initial Review' or 'Re-Submit Review' (basically the TL Review and any feedback loop) was processed withiout selecting any review stage
                    var nextStep = getNextStepId(options.wkf, lastReviewStepId);
                    if (nextStep) {
                        recu.submit(twcSrfWorkflowItem.Type, nextStep, twcSrfWorkflowItem.Fields.STATUS, WORKFLOW_STATUS.IN_PROGRESS);
                        response.reload = true;
                    }
                }

                // @@NOTE: a planned date moved / a check enabled or disabled by this update: move the planned dates of the following steps (see PLAN_DATE notes above)
                if (planStepsBefore && propagatePlannedDates(options.wkf, planStepsBefore)) { response.reload = true; }

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

                    } else if (options.setStatus == twcUtils.SrfStatus.LicenceExecuted) {
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

            if (isWorkFlowCompleted(options)) {
                response.wkfStatus = WORKFLOW_STATUS.COMPLETED;
                response.wkfStatusName = 'Completed';
            }

            return response;
        }

        function isWorkFlowCompleted(options) {
            var wkf = options.wkf?.id || options.wkf;
            if (!wkf) { return; }

            var wkfRemainingSteps = coreSql.run(`
                select  wkfi.id, srf.custrecord_twc_srf_permit_date, wkfi.custrecord_twc_srf_wkfi_status, wks.custrecord_twc_srf_wks_is_last, wks.name
                from    customrecord_twc_srf_wkf wkf
                join    customrecord_twc_srf srf on srf.id = wkf.custrecord_twc_srf_wkf_parent
                join    customrecord_twc_srf_wkfi wkfi on wkfi.custrecord_twc_srf_wkfi_parent = wkf.id
                join    customrecord_twc_srf_wks wks on wks.id = wkfi.custrecord_twc_srf_wkfi_stage
                where   wkf.id = ${wkf}
                and     NVL(wks.custrecord_twc_srf_wks_hide, 'F') = 'F'
                and     wkfi.custrecord_twc_srf_wkfi_status not in (${WORKFLOW_STATUS.COMPLETED}, ${WORKFLOW_STATUS.NOT_REQUIRED})
                order by wkfi.created desc
            `)

            if (wkfRemainingSteps.length == 1 && wkfRemainingSteps[0].custrecord_twc_srf_permit_date != null) {
                recu.submit(twcSrfWorkflowItem.Type, wkfRemainingSteps[0].id, twcSrfWorkflowItem.Fields.STATUS, WORKFLOW_STATUS.COMPLETED);
                recu.submit(twcSrfWorkflow.Type, options.wkf, twcSrfWorkflow.Fields.STATUS, WORKFLOW_STATUS.COMPLETED);
                return true;
            } else if (wkfRemainingSteps.length == 0) {
                recu.submit(twcSrfWorkflow.Type, options.wkf, twcSrfWorkflow.Fields.STATUS, WORKFLOW_STATUS.COMPLETED);
                return true;
            }
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
                        TO_CHAR(srf.custrecord_twc_srf_tl_drg_upl, 'YYYY-MM-DD') as custrecord_twc_srf_tl_drg_upl,
                        TO_CHAR(srf.custrecord_twc_srf_approval_date, 'YYYY-MM-DD') as custrecord_twc_srf_approval_date,
                        TO_CHAR(srf.custrecord_twc_srf_lic_req, 'YYYY-MM-DD') as custrecord_twc_srf_lic_req,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_prod, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_prod,
                        srf.custrecord_twc_srf_lic_pack_rev,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_revd, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_revd,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_issued, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_issued,
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_signed, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_signed,
                        srf.custrecord_twc_srf_lic_pack_sign_by, 
                        TO_CHAR(srf.custrecord_twc_srf_lic_pack_exec, 'YYYY-MM-DD') as custrecord_twc_srf_lic_pack_exec,
                        srf.custrecord_twc_srf_lic_pack_exec_by,
                        srf.custrecord_twc_srf_type, srf.custrecord_twc_srf_reveue_impact
                        
                    
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
                select  wi.id, ws.id as stage, ws.name as stage_name, ws.custrecord_twc_srf_wks_seq_name as stage_alt_name, ws.custrecord_twc_srf_wks_step_no step_no, ws.custrecord_twc_srf_wks_seq_no as seq_no,
                        wi.custrecord_twc_srf_wkfi_status as status, BUILTIN.DF(custrecord_twc_srf_wkfi_status) as status_name,
                        wi.custrecord_twc_srf_wkfi_status_msg as status_message, 
                        TO_CHAR(wi.custrecord_twc_srf_wkfi_planned, 'YYYY-MM-DD') as planned, TO_CHAR(wi.custrecord_twc_srf_wkfi_actual, 'YYYY-MM-DD') as actual,
                        custrecord_twc_srf_wkfi_cprofile as profile, BUILTIN.DF(custrecord_twc_srf_wkfi_cprofile) as profile_name,
                        wi.custrecord_twc_srf_wkfi_assigned_to as assigned_to, BUILTIN.DF(wi.custrecord_twc_srf_wkfi_assigned_to) as assigned_to_name,

                        ws.custrecord_twc_srf_wks_next as next_stage, ws.custrecord_twc_srf_wks_next_pick as next_stage_pick,
                        ws.custrecord_twc_srf_wks_status_to as set_status, BUILTIN.DF(ws.custrecord_twc_srf_wks_status_to) as set_status_name,
                        ws.custrecord_twc_srf_wks_form as form_data, ws.custrecord_twc_srf_wks_is_review as is_review, ws.custrecord_twc_srf_wks_is_review_passf review_pass_field,
                        ws.custrecord_twc_srf_wks_can_edit as can_edit, ws.custrecord_twc_srf_wks_assign as can_assign, ws.custrecord_twc_srf_wks_can_skip as can_skip,
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
                    [twcSrf.Fields.LICENCE_PACK_EXECUTED]: new Date(),
                    [twcSrf.Fields.LICENCE_PACK_EXECUTED_BY]: userInfo.recordId,
                }
            } else {
                formData = {
                    record: twcSrf.Type,
                    [twcSrf.Fields.LICENCE_PACK_SIGNED]: new Date(),
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
                    //[twcSrfWorkflowItem.Fields.STATUS]: nextStage.is_last == 'T' ? WORKFLOW_STATUS.COMPLETED : WORKFLOW_STATUS.IN_PROGRESS,
                    [twcSrfWorkflowItem.Fields.STATUS]: WORKFLOW_STATUS.IN_PROGRESS,
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


        function rejectSds(userInfo, options) {
            var sdsProduced = options.wkf.items.find(i => { return i.next_stage.indexOf(options.item.stage) >= 0; });
            if (!sdsProduced) { throw new Error(`Cannot find SDS Produced Workflow Stage`); }

            var data = JSON.parse(sdsProduced.form_data);
            var formData = {
                record: data.record
            }
            core.array.each(data.fields, f => {
                if (f.type == 'button') { return; }
                formData[f.id] = null;
            })

            var updateOptions = {
                wkf: options.wkf.id,
                srf: options.wkf.srf,
                items: [
                    {
                        id: options.item.id,
                        [twcSrfWorkflowItem.Fields.STATUS]: WORKFLOW_STATUS.NEW,
                        [twcSrfWorkflowItem.Fields.ACTUAL]: null,
                    },
                    {
                        id: sdsProduced.id,
                        [twcSrfWorkflowItem.Fields.STATUS]: WORKFLOW_STATUS.IN_PROGRESS,
                        [twcSrfWorkflowItem.Fields.STATUS_MESSAGE]: `<b>SDS Was rejected (by ${userInfo.name}):</b><br />${options.comment}`,
                        [twcSrfWorkflowItem.Fields.ACTUAL]: null,
                        formData: formData
                    }
                ]
            }

            var response = updateWorkflow(userInfo, updateOptions);
            response.reload = true;
            return response;
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
                            [twcSrf.Fields.LICENSE_REQUESTED_BY]: userInfo.profile,
                            [twcSrf.Fields.SRF_APPROVAL_DATE]: (new Date()).format(),
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

            if (wkf) {
                recu.submit(twcSrfWorkflow.Type, wkf, twcSrfWorkflow.Fields.STATUS, WORKFLOW_STATUS.CANCELLED);
            }
        }

        // @@IMPORTANT: SRF cancellation (client rules, Issue: SRF Cancellation)
        //              who can cancel at which status, used to show the 'Cancel SRF' button (oTWC_spaceRequest_sl.js) AND enforced by cancelSrf
        //                  Draft                                           : user and TL
        //                  Submitted, Under Review, Resubmitted            : TL only
        //                  Feedback Issued                                 : user and TL
        //                  SRF Approved                                    : TL only
        //                  Licence Requested, Licence Issued, Licence Signed : TL power users only (employee flag custentity_twc_prj_power_user)
        //                  any other status (Licence Executed, Completed, Cancelled): nobody
        //              the customer access check (twcConfig.isUserAllowedCustomers) is done by the caller (the SRF page already enforces it on load)
        const SRF_CANCEL_STAGE = { DRAFT: 'draft', REVIEW: 'review', APPROVED: 'approved', LICENCE: 'licence' };
        function getSrfCancelStage(srfStatus) {
            var s = parseInt(srfStatus);
            if (s == twcUtils.SrfStatus.Draft) { return SRF_CANCEL_STAGE.DRAFT; }
            if ([twcUtils.SrfStatus.Submitted, twcUtils.SrfStatus.UnderReview, twcUtils.SrfStatus.FeedbackIssued, twcUtils.SrfStatus.Resubmitted].indexOf(s) >= 0) { return SRF_CANCEL_STAGE.REVIEW; }
            if (s == twcUtils.SrfStatus.SRFApproved) { return SRF_CANCEL_STAGE.APPROVED; }
            if ([twcUtils.SrfStatus.LicenceRequested, twcUtils.SrfStatus.LicenceIssued, twcUtils.SrfStatus.LicenceSigned].indexOf(s) >= 0) { return SRF_CANCEL_STAGE.LICENCE; }
            return null;
        }
        function canCancelSrf(userInfo, srfStatus) {
            var s = parseInt(srfStatus);
            var stage = getSrfCancelStage(s);
            if (!stage) { return false; }
            if (stage == SRF_CANCEL_STAGE.DRAFT || s == twcUtils.SrfStatus.FeedbackIssued) { return true; }
            if (!userInfo.isEmployee) { return false; }
            if (stage == SRF_CANCEL_STAGE.LICENCE) { return !!userInfo.powerUser; }
            return true;
        }

        // @@NOTE: cancels an SRF and tidies up (see canCancelSrf for who can do it)
        //          Draft    : SRF items and equipment actions (EA) are deleted
        //          any other: pending EAs are cancelled and their equipment licence status reset BY EA TYPE (whatever the current status):
        //                          install (Licence / Swap Licence)   => equipment Cancelled
        //                          remove  (Unlicence / Swap Unlicence) => equipment Licenced
        //                     (a swap is 2 EAs, so both sides are handled)
        //                     SRF Approved and later: SRF Approved date cleared
        //                     Licence Requested / Issued / Signed: Works Permitted date cleared, SDS status Cancelled,
        //                          EAs with a SAF action are left alone (EA and equipment): the SAF will complete them
        //          the SRF status is set to Cancelled LAST: if units run low we return { keepGoing: true } and the client calls again (all steps are re-runnable)
        const CANCEL_MIN_UNITS = 100;
        function cancelSrf(userInfo, options) {
            if (!options?.srf) { throw new Error('invalid parameters passed'); }
            var srfId = parseInt(options.srf);

            var srf = coreSql.first(`select id, ${twcSrf.Fields.SRF_STATUS} as status, ${twcSrf.Fields.CUSTOMER} as customer from ${twcSrf.Type} where id = ${srfId}`);
            if (!srf) { throw new Error(`No SRF found using id ${srfId}`); }
            if (!canCancelSrf(userInfo, srf.status)) { throw new Error('You are not allowed to cancel this SRF at its current status'); }

            var stage = getSrfCancelStage(srf.status);
            const unitsLow = () => { return core.env.units() < CANCEL_MIN_UNITS; };

            if (stage == SRF_CANCEL_STAGE.DRAFT) {
                if (!cancelSrfDraftCleanUp(srfId, unitsLow)) { return { keepGoing: true }; }

            } else {
                // @@NOTE: only open EAs (Pending, and removals of equipment not on site: Never Installed / Already Removed, see oTWC_siteRequestUtils.js: saveEqAction)
                //         already cancelled / completed ones are not touched (this makes the function re-runnable)
                var eqActions = coreSql.run(`
                    select  ea.id, ea.${twcEqAct.Fields.EA_EQUIPMENT} as eq_id, ea.${twcEqAct.Fields.EA_TYPE} as ea_type,
                            (select count(*) from customrecord_twc_saf_action sa where sa.custrecord_twc_saf_a_ea = ea.id and sa.custrecord_twc_saf_a_status != ${twcUtils.SafActionStatus.Detached}) as saf_actions
                    from    ${twcEqAct.Type} ea
                    where   ea.${twcEqAct.Fields.EA_SRF} = ${srfId}
                    and     ea.${twcEqAct.Fields.EA_STATUS} in (${twcUtils.EqActionStatus.Pending}, ${twcUtils.EqActionStatus.NeverInstalled}, ${twcUtils.EqActionStatus.AlreadyRemoved})
                `);
                for (var x = 0; x < eqActions.length; x++) {
                    if (unitsLow()) { return { keepGoing: true }; }
                    var ea = eqActions[x];
                    // @@NOTE: works permitted and a SAF raised: let the SAF / SAF action go through, it will tidy up the EA
                    if (stage == SRF_CANCEL_STAGE.LICENCE && parseInt(ea.saf_actions) > 0) { continue; }

                    if (ea.eq_id) {
                        var eqStatus = null;
                        if (ea.ea_type == twcUtils.EqActionType.Licence || ea.ea_type == twcUtils.EqActionType.SwapLicence) {
                            eqStatus = twcUtils.EqLicenseStatus.Cancelled;
                        } else if (ea.ea_type == twcUtils.EqActionType.Unlicence || ea.ea_type == twcUtils.EqActionType.SwapUnlicence) {
                            eqStatus = twcUtils.EqLicenseStatus.Licenced;
                        }
                        if (eqStatus) { recu.submit(twcEquipment.Type, ea.eq_id, twcEquipment.Fields.EQUIPMENT_LICENCE_STATUS, eqStatus); }
                    }
                    recu.submit(twcEqAct.Type, ea.id, twcEqAct.Fields.EA_STATUS, twcUtils.EqActionStatus.Cancelled);
                }

                if (unitsLow()) { return { keepGoing: true }; }
                if (stage == SRF_CANCEL_STAGE.LICENCE && twcUtils.SdsStatus.Cancelled) {
                    coreSql.each(`select id from ${twcSds.Type} where ${twcSds.Fields.SRF} = ${srfId} and NVL(${twcSds.Fields.STATUS}, 0) != ${twcUtils.SdsStatus.Cancelled}`, sds => {
                        recu.submit(twcSds.Type, sds.id, twcSds.Fields.STATUS, twcUtils.SdsStatus.Cancelled);
                    });
                }

                if (unitsLow()) { return { keepGoing: true }; }
                cancelWorkflow({ srf: srfId });
            }

            if (unitsLow()) { return { keepGoing: true }; }
            var fields = [twcSrf.Fields.SRF_STATUS]; var values = [twcUtils.SrfStatus.SRFCancelled];
            if (stage == SRF_CANCEL_STAGE.APPROVED || stage == SRF_CANCEL_STAGE.LICENCE) { fields.push(twcSrf.Fields.SRF_APPROVAL_DATE); values.push(null); }
            if (stage == SRF_CANCEL_STAGE.LICENCE) { fields.push(twcSrf.Fields.WORKS_PERMITTED_DATE); values.push(null); }
            recu.submit(twcSrf.Type, srfId, fields, values);

            return { cancelled: true };
        }

        // @@NOTE: Draft SRF cancellation: delete EAs and SRF items, references between records are cleared first or NetSuite refuses the delete
        //         returns false if it ran out of units (re-runnable: it only works on the records still there)
        //         a draft SRF never ran initEquipment: install EAs have no equipment, remove EAs point to existing (licenced) equipment that must NOT change
        function cancelSrfDraftCleanUp(srfId, unitsLow) {
            var eqActions = coreSql.run(`
                select  ea.id, ea.${twcEqAct.Fields.EA_EQUIPMENT} as eq_id, ea.${twcEqAct.Fields.RELATED_EA} as related_ea,
                        eq.${twcEquipment.Fields.ASSOCIATED_EQUIP_ACTIONS} as eq_assoc_ea
                from    ${twcEqAct.Type} ea
                left join ${twcEquipment.Type} eq on eq.id = ea.${twcEqAct.Fields.EA_EQUIPMENT}
                where   ea.${twcEqAct.Fields.EA_SRF} = ${srfId}
            `);
            // @@NOTE: 1st pass clear the references to the EAs (EA => EA, equipment => EA, only if the equipment points to this EA)
            for (var x = 0; x < eqActions.length; x++) {
                if (unitsLow()) { return false; }
                var ea = eqActions[x];
                if (ea.related_ea) { recu.submit(twcEqAct.Type, ea.id, twcEqAct.Fields.RELATED_EA, null); }
                if (ea.eq_id && ea.eq_assoc_ea == ea.id) { recu.submit(twcEquipment.Type, ea.eq_id, twcEquipment.Fields.ASSOCIATED_EQUIP_ACTIONS, null); }
            }
            if (unitsLow()) { return false; }
            recu.submit(twcSrf.Type, srfId, twcSrf.Fields.RELATED_EQUIPMENT_ACTIONS, null);
            for (var x = 0; x < eqActions.length; x++) {
                if (unitsLow()) { return false; }
                recu.del(twcEqAct.Type, eqActions[x].id);
            }

            // @@NOTE: child items (ATME linked to a TME of this SRF) first, then the rest
            var srfItems = coreSql.run(`
                select  id, ${twcSrfItem.Fields.TMI_ID_SRF} as parent_item
                from    ${twcSrfItem.Type}
                where   ${twcSrfItem.Fields.SRF} = ${srfId}
                order by case when ${twcSrfItem.Fields.TMI_ID_SRF} is null then 1 else 0 end, id
            `);
            for (var x = 0; x < srfItems.length; x++) {
                if (unitsLow()) { return false; }
                recu.del(twcSrfItem.Type, srfItems[x].id);
            }
            return true;
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
                coreSql.each(`select id from customrecord_twc_sds_item where custrecord_twc_sds_item_parent = ${sds.id}`, r => {
                    recu.del('customrecord_twc_sds_item', r.id);
                })
                recu.del(twcSds.Type, sds.id);
                // @@NOTE: the actual PDF file is not deleted but we do not care as this function will never be used on live
                if (sds.file_id) { recu.del(twcFile.Type, sds.file_id) }
            }
        }


        function setSRFCompleteStatus(srf) {
            // @@TODO: we should check if all actions were cancelled than the SRF should be cancelled ????
            var pendingActionCount = coreSql.first(`
                select      count(*) as c
                from        customrecord_twc_eq_action
                where       custrecord_twc_eq_action_srf = ${srf}
                and         custrecord_twc_eq_action_sts = ${twcUtils.EqActionStatus.Pending}
            `)?.c;
            if (pendingActionCount == 0) {
                recu.submit(twcSrf.Type, srf, twcSrf.Fields.SRF_STATUS, twcUtils.SrfStatus.Completed)
            }
            
        }


        return {
            WorkflowStatus: WORKFLOW_STATUS,
            initWorkFlow: initWorkFlow,
            initEquipment: initEquipment,
            getWorkFlow: getWorkFlow,
            updateWorkflow: updateWorkflow,
            deleteWorkflow: deleteWorkflow,
            cancelWorkflow: cancelWorkflow,
            canCancelSrf: canCancelSrf,
            cancelSrf: cancelSrf,
            isWaitingForSignature: isWaitingForSignature,
            postSignature: postSignature,
            acceptSrf: acceptSrf,
            rejectSds: rejectSds,
            setSRFCompleteStatus: setSRFCompleteStatus

        }
    });
