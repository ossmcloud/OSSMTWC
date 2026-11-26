/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../data/oTWC_utils.js', '../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSQL, twcIcons, twcConfig, twcUtils, twcUI) => {

        // @@HARDCODED @@GO-LIVE :: SRF workflow stage (customrecord_twc_srf_wks) 'Feedback to be Issued'
        const FEEDBACK_STAGE = twcConfig.SB ? 7 : 9;
        // @@HARDCODED @@GO-LIVE :: SRF workflow stage (customrecord_twc_srf_wks) 'Initial Review'
        const INITIAL_REVIEW_STAGE = twcConfig.SB ? 2 : 14;

        // @@NOTE: date of an SRF workflow step (latest one: the loop stages are created again on every re-submission), formatted as the other list dates
        //         stageWhere: condition on the workflow stage (alias ws), dateField: workflow item date field (alias wkfi)
        function getSrfStepDateSql(stageWhere, dateField) {
            return `TO_CHAR((
                select  max(wkfi.${dateField})
                from    customrecord_twc_srf_wkf wkf
                join    customrecord_twc_srf_wkfi wkfi on wkfi.custrecord_twc_srf_wkfi_parent = wkf.id
                join    customrecord_twc_srf_wks ws on ws.id = wkfi.custrecord_twc_srf_wkfi_stage
                where   wkf.custrecord_twc_srf_wkf_parent = s.id
                and     ${stageWhere}
            ), 'DD/MM/YYYY')`;
        }
        // @@HARDCODED :: SRF workflow item status 'In Progress' (= oTWC_srfWorkflowEngine.js: WORKFLOW_STATUS.IN_PROGRESS, not exported and the engine is too heavy to load here)
        const WKF_ITEM_IN_PROGRESS = 2;

        // @@NOTE: who can see a KPI (getUserRoles):
        //              tl      = Towercom (employees)
        //              agent   = Customer Agent (agent passes), Customer Signatory (designated contact that can sign), Contractor with Agent Pass
        //              basic   = Customer Basic (customer, no agent pass, not a signatory), Contractor User (contractor, no agent pass)
        const ROLE = { TL: 'tl', AGENT: 'agent', BASIC: 'basic' };
        const ALL_ROLES = [ROLE.TL, ROLE.AGENT, ROLE.BASIC];

        // @@NOTE: one entry per entity: table, site field (the locators inner join the site, so do we to match their counts) and the user access filter
        //         access filters (oTWC_config.js) return '' for employees, so the same sql serves every user
        //         KPI details list (renderKpiDetails):
        //              recordScript:   the record page the 'View' link opens (view mode, recId)
        //              fields:         the list columns, sql = select expression on the entity table (alias 's'), type = ui table column type (optional)
        //                              @@NOTE: dates are formatted in sql (DD/MM/YYYY text): the table is rendered on the server and a 'date' column would be converted in the server time zone
        //                              customerColumn: hidden to customer only users (always their own company)
        const ENTITY = {
            srf: {
                table: 'customrecord_twc_srf', siteField: 'custrecord_twc_srf_site', accessFilter: (userInfo) => { return twcConfig.getSrfAccessFilter(userInfo, 's'); },
                recordScript: 'otwc_spacerequest_sl',
                fields: [
                    { id: 'record_name', title: 'SRF', sql: 's.name' },
                    { id: 'site_name', title: 'Site', sql: 'BUILTIN.DF(s.custrecord_twc_srf_site)' },
                    { id: 'customer_name', title: 'Customer', sql: 'BUILTIN.DF(s.custrecord_twc_srf_cust)', customerColumn: true },
                    { id: 'status_name', title: 'Status', sql: 'BUILTIN.DF(s.custrecord_twc_srf_status)' },
                    { id: 'srf_type', title: 'Type', sql: 'BUILTIN.DF(s.custrecord_twc_srf_type)' },
                    { id: 'submitted_by', title: 'Submitted By', sql: 'BUILTIN.DF(s.custrecord_twc_srf_sub_by)' },
                    { id: 'requested_date', title: 'Requested', sql: `TO_CHAR(s.custrecord_twc_srf_req_date, 'DD/MM/YYYY')` },
                    { id: 'created_date', title: 'Created', sql: `TO_CHAR(s.created, 'DD/MM/YYYY')` },
                ]
            },
            saf: {
                table: 'customrecord_twc_saf', siteField: 'custrecord_twc_saf_site', accessFilter: (userInfo) => { return twcConfig.getSafAccessFilter(userInfo, 's'); },
                recordScript: 'otwc_siteaccess_sl',
                fields: [
                    { id: 'record_name', title: 'SAF', sql: 's.name' },
                    { id: 'site_name', title: 'Site', sql: 'BUILTIN.DF(s.custrecord_twc_saf_site)' },
                    { id: 'customer_name', title: 'Customer', sql: 'BUILTIN.DF(s.custrecord_twc_saf_customer)', customerColumn: true },
                    { id: 'primary_contractor', title: 'Primary Contractor', sql: 'BUILTIN.DF(s.custrecord_twc_saf_primary_contractor)' },
                    { id: 'saf_type', title: 'Type', sql: 'BUILTIN.DF(s.custrecord_twc_saf_type)' },
                    { id: 'status_name', title: 'Status', sql: 'BUILTIN.DF(s.custrecord_twc_saf_status)' },
                    { id: 'author', title: 'Author', sql: 'BUILTIN.DF(s.custrecord_twc_saf_author)' },
                    { id: 'works_end_date', title: 'Works End', sql: `TO_CHAR(s.custrecord_twc_saf_word_end_date, 'DD/MM/YYYY')` },
                    { id: 'created_date', title: 'Created', sql: `TO_CHAR(s.created, 'DD/MM/YYYY')` },
                ]
            },
            tkt: {
                table: 'customrecord_twc_trbl_tkt', siteField: 'custrecord_twc_trbl_tkt_site', accessFilter: (userInfo) => { return twcConfig.getTktAccessFilter(userInfo, 's'); },
                recordScript: 'otwc_troubleticket_sl',
                fields: [
                    { id: 'record_name', title: 'Ticket', sql: 's.name' },
                    { id: 'site_name', title: 'Site', sql: 'BUILTIN.DF(s.custrecord_twc_trbl_tkt_site)' },
                    { id: 'customer_name', title: 'Customer', sql: 'BUILTIN.DF(s.custrecord_twc_trbl_tkt_customer)', customerColumn: true },
                    { id: 'category', title: 'Category', sql: 'BUILTIN.DF(s.custrecord_twc_trbl_tkt_category)' },
                    { id: 'priority', title: 'Priority', sql: 'BUILTIN.DF(s.custrecord_twc_trbl_tkt_priority)' },
                    { id: 'status_name', title: 'Status', sql: 'BUILTIN.DF(s.custrecord_twc_trbl_tkt_status)' },
                    { id: 'author', title: 'Author', sql: 'BUILTIN.DF(s.custrecord_twc_trbl_tkt_author)' },
                    { id: 'assigned_to', title: 'Assigned To', sql: 'BUILTIN.DF(s.custrecord_twc_trbl_tkt_assigned_to)' },
                    { id: 'created_date', title: 'Created', sql: `TO_CHAR(s.created, 'DD/MM/YYYY')` },
                ]
            },
        }

        // @@IMPORTANT: KPI ids must be unique and stable (the client and the KPI details page, url parameter 'kpi', key on them)
        //              where:      sql condition on the entity table (alias 's'), a function so the ids are resolved at run time
        //              custOnly:   the SDS (licence agreement) is customer information only (oTWC_config.js: canSeeSds),
        //                          non employees only count the SRFs of their own company
        //              fields:     extra KPI specific columns on the details list (added after the entity fields, same format)
        //              hideFields: entity fields (id) not shown on this KPI details list
        const _sections = [
            {
                title: 'SRF Processing',
                kpis: [
                    {
                        id: 1, title: 'Draft SRFs', entity: 'srf', roles: [ROLE.TL, ROLE.AGENT], where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.Draft}`; },
                        hideFields: ['created_date'],
                        fields: [
                            { id: 'approval_date', title: 'Approval Date', sql: `TO_CHAR(s.custrecord_twc_srf_approval_date, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        id: 2, title: 'Initial Review / Resubmitted', entity: 'srf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_srf_status in (${twcUtils.SrfStatus.Submitted}, ${twcUtils.SrfStatus.Resubmitted})`; },
                        hideFields: ['created_date'],
                        fields: [
                            // @@NOTE: Initial Review = planned (due) date of the Initial Review step
                            //         Towercom Response = actual date of the 'Feedback to be Issued' step (feedback issued to the customer)
                            //         Resubmitted = actual date of the step that sets the SRF to Feedback Issued: completed when the customer re-submits (oTWC_srfWorkflowEngine.js: initWorkFlow)
                            { id: 'initial_review_date', title: 'Initial Review Date', sql: getSrfStepDateSql(`ws.id = ${INITIAL_REVIEW_STAGE}`, 'custrecord_twc_srf_wkfi_planned') },
                            { id: 'tl_response_date', title: 'Towercom Response Date', sql: getSrfStepDateSql(`ws.id = ${FEEDBACK_STAGE}`, 'custrecord_twc_srf_wkfi_actual') },
                            { id: 'resubmitted_date', title: 'Resubmitted Date', sql: getSrfStepDateSql(`ws.custrecord_twc_srf_wks_status_to = ${twcUtils.SrfStatus.FeedbackIssued}`, 'custrecord_twc_srf_wkfi_actual') },
                            { id: 'loop_counter', title: 'Loop Counter', sql: 'NVL(s.custrecord_twc_srf_fdbk_loop_iter, 1)' },
                            { id: 'approval_date', title: 'Approval Date', sql: `TO_CHAR(s.custrecord_twc_srf_approval_date, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        // @@NOTE: customer side of the feedback loop: Towercom issued feedback, the customer must review it and re-submit the SRF
                        id: 18, title: 'Feedback to Review', entity: 'srf', roles: [ROLE.AGENT], where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.FeedbackIssued}`; },
                        hideFields: ['created_date'],
                        fields: [
                            { id: 'tl_response_date', title: 'Towercom Response Date', sql: getSrfStepDateSql(`ws.id = ${FEEDBACK_STAGE}`, 'custrecord_twc_srf_wkfi_actual') },
                            { id: 'loop_counter', title: 'Loop Counter', sql: 'NVL(s.custrecord_twc_srf_fdbk_loop_iter, 1)' },
                        ]
                    },
                    {
                        // @@NOTE: customer side of 'Customer to Request Licence' (id 6): SRF approved, the customer must accept it and request the licence
                        id: 19, title: 'SRF to Accept (Request Licence)', entity: 'srf', roles: [ROLE.AGENT], where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.SRFApproved}`; },
                        hideFields: ['created_date'],
                        fields: [
                            { id: 'approval_date', title: 'Approval Date', sql: `TO_CHAR(s.custrecord_twc_srf_approval_date, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        // @@NOTE: customer side of 'SDS to be Signed' (id 8): licence agreement issued, to be signed by the customer
                        //         customers only: agent pass (contractor) users can never see / sign the SDS (oTWC_config.js: canSeeSds)
                        id: 20, title: 'Agreements to Sign', entity: 'srf', roles: [ROLE.AGENT], custOnly: true, where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceIssued}`; },
                        hideFields: ['created_date'],
                        fields: [
                            { id: 'licence_issued', title: 'Agreement Issued', sql: `TO_CHAR(s.custrecord_twc_srf_lic_pack_issued, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        // @@NOTE: works permitted (licence executed + works permitted date) and at least one pending equipment action not on a SAF yet (non detached SAF action)
                        //         once all the equipment actions are done the SRF is completed (svc/oTWC_srf_sts_update_svc.js)
                        id: 21, title: 'Works Permitted (SAF Required)', entity: 'srf', roles: [ROLE.AGENT], where: () => {
                            return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceExecuted} and s.custrecord_twc_srf_permit_date is not null
                                    and exists (
                                        select  1
                                        from    customrecord_twc_eq_action ea
                                        where   ea.custrecord_twc_eq_action_srf = s.id
                                        and     ea.custrecord_twc_eq_action_sts = ${twcUtils.EqActionStatus.Pending}
                                        and     not exists (
                                                    select  1
                                                    from    customrecord_twc_saf_action sa
                                                    where   sa.custrecord_twc_saf_a_ea = ea.id
                                                    and     sa.custrecord_twc_saf_a_status != ${twcUtils.SafActionStatus.Detached}
                                                )
                                    )`;
                        },
                        hideFields: ['created_date'],
                        fields: [
                            { id: 'permit_date', title: 'Works Permitted', sql: `TO_CHAR(s.custrecord_twc_srf_permit_date, 'DD/MM/YYYY')` },
                        ]
                    },
                    { id: 3, title: 'TL Checks', entity: 'srf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.UnderReview}`; } },
                    {
                        id: 4, title: 'Feedback to be Issued', entity: 'srf', roles: [ROLE.TL], where: () => {
                            return `exists (
                                select  1
                                from    customrecord_twc_srf_wkf wkf
                                join    customrecord_twc_srf_wkfi wkfi on wkfi.custrecord_twc_srf_wkfi_parent = wkf.id
                                where   wkf.custrecord_twc_srf_wkf_parent = s.id
                                and     wkfi.custrecord_twc_srf_wkfi_stage = ${FEEDBACK_STAGE}
                                and     wkfi.custrecord_twc_srf_wkfi_status = ${WKF_ITEM_IN_PROGRESS}
                            )`;
                        }
                    },
                    {
                        id: 5, title: 'Drawing Required', entity: 'srf', roles: [ROLE.TL], where: () => {
                            return `s.custrecord_twc_srf_tl_drg_req = 'T' and s.custrecord_twc_srf_tl_drg_upl is null
                                    and NVL(s.custrecord_twc_srf_status, 0) not in (${twcUtils.SrfStatus.SRFCancelled}, ${twcUtils.SrfStatus.Completed})`;
                        },
                        fields: [
                            { id: 'drawing_assigned_to', title: 'Drawing Assigned To', sql: 'BUILTIN.DF(s.custrecord_twc_srf_tl_drg_assinged_to)' },
                        ]
                    },
                ]
            },
            {
                title: 'Licence Delivery',
                kpis: [
                    {
                        id: 6, title: 'Customer to Request Licence', entity: 'srf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.SRFApproved}`; },
                        fields: [
                            { id: 'approval_date', title: 'Approved', sql: `TO_CHAR(s.custrecord_twc_srf_approval_date, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        id: 7, title: 'SDS to be Issued', entity: 'srf', roles: [ROLE.TL], custOnly: true, where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceRequested}`; },
                        fields: [
                            { id: 'licence_requested', title: 'Licence Requested', sql: `TO_CHAR(s.custrecord_twc_srf_lic_req, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        id: 8, title: 'SDS to be Signed', entity: 'srf', roles: [ROLE.TL], custOnly: true, where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceIssued}`; },
                        fields: [
                            { id: 'licence_issued', title: 'Licence Issued', sql: `TO_CHAR(s.custrecord_twc_srf_lic_pack_issued, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        id: 9, title: 'SDS to be Executed', entity: 'srf', roles: [ROLE.TL], custOnly: true, where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceSigned}`; },
                        fields: [
                            { id: 'licence_signed', title: 'Licence Signed', sql: `TO_CHAR(s.custrecord_twc_srf_lic_pack_signed, 'DD/MM/YYYY')` },
                        ]
                    },
                    // @@NOTE: licence executed but TL has not entered the Works Permitted Date yet (oTWC_utils.js: getSrfWorksPermittedHtml)
                    {
                        id: 10, title: 'Permit Works', entity: 'srf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_srf_status = ${twcUtils.SrfStatus.LicenceExecuted} and s.custrecord_twc_srf_permit_date is null`; },
                        fields: [
                            { id: 'licence_executed', title: 'Licence Executed', sql: `TO_CHAR(s.custrecord_twc_srf_lic_pack_exec, 'DD/MM/YYYY')` },
                        ]
                    },
                ]
            },
            {
                // @@NOTE: customer / contractor view of the SAF process (the TL view is in 'Construction SAFs' and 'Pending SAFs')
                title: 'SAF Processing',
                kpis: [
                    { id: 22, title: 'Pending Approval', entity: 'saf', roles: [ROLE.AGENT, ROLE.BASIC], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.Pending}`; } },
                    // @@NOTE: TL sent the SAF back with a comment, the submitter must review it, edit and re-submit
                    { id: 23, title: 'Feedback to Review', entity: 'saf', roles: [ROLE.AGENT], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.FeedbackIssued}`; } },
                    {
                        id: 24, title: 'Awaiting Photos', entity: 'saf', roles: [ROLE.AGENT], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.AwaitingPhotos}`; },
                        fields: [
                            { id: 'photos_requested', title: 'Photos Requested', sql: `TO_CHAR(s.custrecord_twc_saf_comp_photo_req, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        // @@NOTE: all the SAFs with photos received (the TL review steps - reviewer, pending approval - are not split here)
                        id: 25, title: 'Photos Received', entity: 'saf', roles: [ROLE.AGENT], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.PhotosReceived}`; },
                        fields: [
                            { id: 'photos_received', title: 'Photos Received', sql: `TO_CHAR(s.custrecord_twc_saf_comp_photo_rec, 'DD/MM/YYYY')` },
                        ]
                    },
                    { id: 26, title: 'Partially Completed', entity: 'saf', roles: [ROLE.AGENT], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.PartiallyComplete}`; } },
                ]
            },
            {
                // @@NOTE: completion photos review process (ui/modules/oTWC_siteAccessUtils.js: setSafReviewer / setSafReviewed / approveSafReview)
                //         Photos Received (no reviewer yet) -> Pending Review (reviewer assigned) -> Review Pending Approval (reviewed, TL only)
                title: 'Construction SAFs',
                kpis: [
                    {
                        id: 11, title: 'Awaiting Photos', entity: 'saf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.AwaitingPhotos}`; },
                        fields: [
                            { id: 'photos_requested', title: 'Photos Requested', sql: `TO_CHAR(s.custrecord_twc_saf_comp_photo_req, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        id: 12, title: 'Photos Received', entity: 'saf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.PhotosReceived} and s.custrecord_twc_saf_comp_reviewer is null`; },
                        fields: [
                            { id: 'photos_received', title: 'Photos Received', sql: `TO_CHAR(s.custrecord_twc_saf_comp_photo_rec, 'DD/MM/YYYY')` },
                        ]
                    },
                    {
                        id: 13, title: 'Pending Review', entity: 'saf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.PhotosReceived} and s.custrecord_twc_saf_comp_reviewer is not null and NVL(s.custrecord_twc_saf_rev_pending, 'F') = 'F'`; },
                        fields: [
                            { id: 'photos_received', title: 'Photos Received', sql: `TO_CHAR(s.custrecord_twc_saf_comp_photo_rec, 'DD/MM/YYYY')` },
                            { id: 'reviewer', title: 'Reviewer', sql: 'BUILTIN.DF(s.custrecord_twc_saf_comp_reviewer)' },
                        ]
                    },
                    {
                        id: 14, title: 'Review Pending Approval', entity: 'saf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_saf_rev_pending = 'T'`; },
                        fields: [
                            { id: 'reviewer', title: 'Reviewer', sql: 'BUILTIN.DF(s.custrecord_twc_saf_comp_reviewer)' },
                        ]
                    },
                    { id: 15, title: 'Partially Completed', entity: 'saf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.PartiallyComplete}`; } },
                ]
            },
            {
                title: 'Pending SAFs / Trouble Tickets',
                kpis: [
                    { id: 16, title: 'Pending Approval', entity: 'saf', roles: [ROLE.TL], where: () => { return `s.custrecord_twc_saf_status = ${twcUtils.SafStatus.Pending}`; } },
                    { id: 17, title: 'Open TTs', entity: 'tkt', roles: [ROLE.TL], where: () => { return `NVL(s.custrecord_twc_trbl_tkt_status, 0) not in (${twcUtils.tktStatus.Resolved}, ${twcUtils.tktStatus.Cancelled})`; } },
                ]
            },
            {
                title: 'Trouble Tickets',
                kpis: [
                    { id: 27, title: 'Open TTs', entity: 'tkt', roles: [ROLE.AGENT, ROLE.BASIC], where: () => { return `NVL(s.custrecord_twc_trbl_tkt_status, 0) not in (${twcUtils.tktStatus.Resolved}, ${twcUtils.tktStatus.Cancelled})`; } },
                ]
            },
        ]

        // @@NOTE: see ROLE: a user has one role, agent passes = at least one customer on the profile Agent Passes field (custrecord_twc_prof_agent_passes)
        //         the result is kept on userInfo (dashboardRoles) as it is needed more than once per request
        function getUserRoles(userInfo) {
            if (userInfo.isEmployee) { return [ROLE.TL]; }
            if (userInfo.dashboardRoles) { return userInfo.dashboardRoles; }

            var agentPasses = coreSQL.first(`select custrecord_twc_prof_agent_passes as agent_passes from customrecord_twc_prof where id = ${parseInt(userInfo.profile) || 0}`)?.agent_passes;
            var hasAgentPasses = !!(agentPasses && String(agentPasses).trim());

            userInfo.dashboardRoles = [(hasAgentPasses || userInfo.canSign) ? ROLE.AGENT : ROLE.BASIC];
            return userInfo.dashboardRoles;
        }

        // @@NOTE: custOnly KPIs (SDS / licence agreement) are never visible to contractor companies, even with an agent pass (oTWC_config.js: canSeeSds)
        function isKpiVisible(kpi, userRoles, userInfo) {
            if (kpi.custOnly && !userInfo.isEmployee && !userInfo.companyProfile?.isCustomer) { return false; }
            return !!kpi.roles.find(r => { return userRoles.indexOf(r) >= 0; });
        }

        function getVisibleKpis(userInfo) {
            var userRoles = getUserRoles(userInfo);
            var kpis = [];
            core.array.each(_sections, section => {
                core.array.each(section.kpis, kpi => {
                    if (isKpiVisible(kpi, userRoles, userInfo)) { kpis.push(kpi); }
                })
            })
            return kpis;
        }

        // @@NOTE: returns { section, kpi } for a KPI the user can see, throws otherwise
        function getUserKpi(userInfo, id) {
            var userRoles = getUserRoles(userInfo);
            var found = null;
            core.array.each(_sections, section => {
                var kpi = section.kpis.find(k => { return k.id == id; });
                if (kpi && !found) { found = { section: section, kpi: kpi }; }
            })
            if (!found) { throw new Error(`No dashboard found [${id}]`); }
            if (!isKpiVisible(found.kpi, userRoles, userInfo)) { throw new Error('You do not have access to this KPI'); }
            return found;
        }


        function buildDashHtml(dashboard) {
            // @@NOTE: clicking the KPI opens the details list (oTWC_dashBoards.js => oTWC_dashBoards_sl.js?kpi=[id])
            return `
                <div class="twc-dashboard" data-id="${dashboard.id}">
                    <div class="twc-dashboard-title">
                        ${dashboard.title}
                    </div>
                    <div class="twc-dashboard-content">
                        <span class="twc-wait-cursor">
                            ${twcIcons.get('waitWheel', 34)}
                        </span>
                    </div>
                </div>
            `
        }

        function buildDashboardsHtml(userInfo) {
            var userRoles = getUserRoles(userInfo);
            var html = '';
            core.array.each(_sections, section => {
                var tiles = '';
                core.array.each(section.kpis, kpi => {
                    if (isKpiVisible(kpi, userRoles, userInfo)) { tiles += buildDashHtml(kpi); }
                })
                if (!tiles) { return; }

                html += `
                    <div class="twc-dashboard-section">
                        <div class="twc-dashboard-section-title">${section.title}</div>
                        <div class="twc-dashboards">
                            ${tiles}
                        </div>
                    </div>
                `;
            })
            return html;
        }

        // @@IMPORTANT: the from / where of a KPI, shared by the count (runDashboards) and the details list (getKpiDetails) so they always match
        //              accessFilters caches the access filter per entity for the request (agent pass filters run a few queries each)
        function getKpiFromWhere(userInfo, kpi, accessFilters) {
            var entity = ENTITY[kpi.entity];
            if (!entity) { throw new Error(`Invalid KPI entity [${kpi.entity}]`); }
            if (!accessFilters) { accessFilters = {}; }
            if (accessFilters[kpi.entity] === undefined) { accessFilters[kpi.entity] = entity.accessFilter(userInfo); }

            var custOnlyFilter = '';
            if (kpi.custOnly && !userInfo.isEmployee) {
                if (!userInfo.companyProfile?.isCustomer) { throw new Error('You do not have access to this KPI'); }
                custOnlyFilter = ` and s.custrecord_twc_srf_cust = ${parseInt(userInfo.companyProfile.id) || 0} `;
            }

            return `
                from    ${entity.table} s
                join    customrecord_twc_site site on site.id = s.${entity.siteField}
                where   (${kpi.where()})
                ${custOnlyFilter}
                ${accessFilters[kpi.entity]}
            `;
        }

        function getErrorHtml(error) {
            return `
                <div>
                    ${twcIcons.get('sadFace', 28, 'red')}
                </div>
                <div style="font-size: 0.5em; font-weight: normal;">
                    ${error.message}
                </div>
            `;
        }

        // @@NOTE: returns { [kpi id]: count or error html } for all the KPIs the user can see
        //         each KPI has its own try / catch so one failing KPI does not affect the others
        function runDashboards(userInfo) {
            var values = {};
            var accessFilters = {};
            core.array.each(getVisibleKpis(userInfo), kpi => {
                try {
                    values[kpi.id] = coreSQL.first(`select count(*) as c ${getKpiFromWhere(userInfo, kpi, accessFilters)}`)?.c || 0;
                } catch (error) {
                    core.logError('DASHBOARD-KPI', `${kpi.id} :: ${error.message}`);
                    values[kpi.id] = getErrorHtml(error);
                }
            })
            return values;
        }

        // @@NOTE: the list columns of a KPI: entity fields + KPI specific fields (customer column hidden to customer only users)
        function getKpiFields(userInfo, kpi) {
            var customerOnly = !userInfo.isEmployee && !userInfo.companyProfile?.isVendor;
            var hideFields = kpi.hideFields || [];
            var fields = ENTITY[kpi.entity].fields.filter(f => { return !(f.customerColumn && customerOnly) && hideFields.indexOf(f.id) < 0; });
            return fields.concat(kpi.fields || []);
        }

        // @@NOTE: KPI details: same from / where as the KPI count, oldest to newest (created, then id)
        function getKpiDetails(userInfo, id) {
            var info = getUserKpi(userInfo, id);
            var fields = getKpiFields(userInfo, info.kpi);
            var selectFields = fields.map(f => { return `${f.sql} as ${f.id}`; }).join(', ');

            info.fields = fields;
            info.rows = coreSQL.run(`
                select  s.id as record_id, 'View' as view_link, ${selectFields}
                ${getKpiFromWhere(userInfo, info.kpi)}
                order by s.created asc, s.id asc
            `);
            return info;
        }

        // @@NOTE: KPI details page (oTWC_dashBoards_sl.js?kpi=[id]): title (used as page title) + table
        //         the left most column opens the record page (view mode) in a new tab, the record count is on the footer of the 2nd column (addCount)
        function renderKpiDetails(userInfo, id) {
            var info = getKpiDetails(userInfo, id);
            var entity = ENTITY[info.kpi.entity];

            var columns = [
                {
                    id: 'view_link', title: '', styles: { width: '60px', 'text-align': 'center' }, noSort: true, noFilter: true, noExport: true,
                    link: { url: core.url.script(entity.recordScript) + '&recId=${record_id}', valueField: 'record_id', target: '_blank' }
                },
            ];
            core.array.each(info.fields, f => {
                var col = { id: f.id, title: f.title, nullText: '' };
                if (f.type) { col.type = f.type; }
                if (columns.length == 1) { col.addCount = true; }
                columns.push(col);
            });

            return {
                title: `${info.section.title} / ${info.kpi.title}`,
                table: twcUI.render({
                    id: 'kpi-details-table',
                    type: twcUI.CTRL_TYPE.TABLE,
                    label: info.kpi.title,
                    columns: columns,
                    dataSource: info.rows,
                    showToolbar: true,
                    showEditDelete: false,
                    readOnly: true,
                    // @@NOTE: table height = window height, so the table scrolls vertically (the table option is fitScreen)
                    fitScreen: true,
                    showFooter: true
                })
            }
        }

        return {

            buildDashboardsHtml: buildDashboardsHtml,
            runDashboards: runDashboards,
            renderKpiDetails: renderKpiDetails,
            getErrorHtml: getErrorHtml

        }
    });
