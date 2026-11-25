/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/file', 'N/record', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_config.js', './data/oTWC_troubleTickets.js', './data/oTWC_company.js', './data/oTWC_file.js', './data/oTWC_utils.js', './O/oTWC_nsFileUtils.js'],
    (file, record, core, coreSQL, recu, twcConfig, twcTrblTkts, twcCompany, twcFile, twcUtils, nsFileUtils) => {

        // @@NOTE: FSA Job (OSSMFSA app, customrecord_fsa_job): a submitted "Support Case" job creates a NetSuite support case
        //          the job status is set to Submitted by the app (modules/fsa_formPost.js), then the FSA job engine (svc/oFSA_jobEngine_svc.js)
        //          attaches the photos / files (customrecord_fsa_job_attach) and sets the processing status to Processed (field submit = XEDIT)
        //          the case is created at that point (Submitted + Processed) so the files can be attached to it
        //          the case is linked on the job (custrecord_fsa_job_case): that is also the guard against creating it twice (re-submit, re-process)
        const FSA_JOB = {
            Type: 'customrecord_fsa_job',
            Fields: {
                NAME: 'name',
                FSA_SITE: 'custrecord_fsa_job_site',
                FSA_FORM: 'custrecord_fsa_job_form',
                FSA_USER: 'custrecord_fsa_job_user',
                JOB_STATUS: 'custrecord_fsa_job_status',
                JOB_PAYLOAD: 'custrecord_fsa_job_payload',
                PROC_STATUS: 'custrecord_fsa_job_proc_status',
                CASE: 'custrecord_fsa_job_case',
            },
            Status: { SUBMITTED: 'Submitted' },
            ProcStatus: { PROCESSED: 'Processed' },
        }

        // @@HARDCODED @@GO-LIVE :: FSA form "Support Case" (customrecord_fsa_form internal id)
        const FSA_FORM_SUPPORT_CASE = 33;

        // @@NOTE: the control ids of the FSA form "Support Case" (form layout JSON): if the form is rebuilt with other ids this must change too
        const CTRL = {
            SITE: 'dropDown_1_1_1',
            SITE_ADDRESS: 'textArea_1_1_2',
            CASE_FOR: 'radio_buttons_1_2_1',
            CUSTOMER: 'dropDown_1_2_2',
            SUBJECT: 'text_1_2_3',
            TYPE: 'select_1_2_4',
            PRIORITY: 'select_1_2_5',           // @@NOTE: support case priority (supportcasepriority), mapped to the ticket priority (see getTicketPriority)
            TKT_CATEGORY: 'select_1_2_11',      // @@NOTE: trouble ticket category (custrecord_twc_trbl_tkt_category)
            REPORTED_ON: 'date_1_2_6',
            DESCRIPTION: 'textArea_1_2_7',
            LOGGED_BY: 'text_1_2_10',
            CONTACT_NAME: 'text_1_3_1',
            CONTACT_EMAIL: 'email_1_3_2',
            CONTACT_PHONE: 'phone_1_3_3',
        }
        const CASE_FOR_CUSTOMER = 'customer';

        // @@HARDCODED @@GO-LIVE :: case category used for trouble ticket cases when the form type is empty (same as oTWC_trouble_tkt_ue.js)
        const TKT_CASE_CATEGORY = 4;

        // @@IMPORTANT: job with a customer => an OSSMTWC Trouble Ticket (customrecord_twc_trbl_tkt) is created as well, linked to the case
        //              records saved from a user event do NOT trigger user events: the ticket user event (oTWC_trouble_tkt_ue.js) does not run here
        //              so the case is created by this script and linked both ways (case custevent_twc_trbl_tkt / ticket custrecord_twc_trbl_tkt_case), as the ticket user event does

        function afterSubmit(context) {
            if (context.type == context.UserEventType.DELETE) { return; }
            var jobId = context.newRecord.id;
            try {
                // @@NOTE: the job engine updates the job with field submits (XEDIT): newRecord only has the submitted fields, so read the job
                var job = coreSQL.first({
                    query: `
                        select  j.id, j.${FSA_JOB.Fields.NAME} as name, j.${FSA_JOB.Fields.FSA_FORM} as form_id,
                                j.${FSA_JOB.Fields.JOB_STATUS} as status, j.${FSA_JOB.Fields.PROC_STATUS} as proc_status,
                                j.${FSA_JOB.Fields.JOB_PAYLOAD} as payload_id, j.${FSA_JOB.Fields.CASE} as case_id,
                                j.${FSA_JOB.Fields.FSA_SITE} as site_id, BUILTIN.DF(j.${FSA_JOB.Fields.FSA_USER}) as user_name
                        from    ${FSA_JOB.Type} j
                        where   j.id = ?
                    `,
                    params: [parseInt(jobId) || 0]
                });
                if (!job) { return; }
                if (parseInt(job.form_id) != FSA_FORM_SUPPORT_CASE) { return; }
                if (job.status != FSA_JOB.Status.SUBMITTED || job.proc_status != FSA_JOB.ProcStatus.PROCESSED) { return; }
                if (job.case_id) { return; }
                if (!job.payload_id) { throw new Error('the job has no payload'); }

                var values = readPayload(job.payload_id);
                var customer = getCustomer(values);

                var ticketId = customer ? createTicket(job, values, customer) : null;
                var caseId = null;
                try {
                    caseId = createCase(job, values, customer, ticketId);
                } catch (error) {
                    // @@NOTE: no ticket without its case: the job is processed again on the next save (no case linked) and would create a 2nd ticket
                    if (ticketId) {
                        try {
                            // @@NOTE: the ticket files (customrecord_twc_file) are made inactive, as the portal does when a file is deleted
                            coreSQL.each({
                                query: `select id from ${twcFile.Type} where ${twcFile.Fields.RECORD_TYPE} = ? and ${twcFile.Fields.RECORD_ID} = ?`,
                                params: [twcTrblTkts.Type, `${ticketId}`]
                            }, f => { recu.submit(twcFile.Type, f.id, 'isinactive', true); });
                            recu.del(twcTrblTkts.Type, ticketId);
                        } catch (e) { core.logError('FSA-JOB-CASE', `${jobId}: ticket ${ticketId} not deleted: ${e.message}`); }
                    }
                    throw error;
                }

                if (ticketId) { recu.submit(twcTrblTkts.Type, ticketId, twcTrblTkts.Fields.CASE_REFERENCE, caseId); }
                recu.submit(FSA_JOB.Type, job.id, FSA_JOB.Fields.CASE, caseId);
                jobLog(job.id, 'Info', ticketId ? `trouble ticket ${ticketId} and support case ${caseId} created` : `support case ${caseId} created`);

            } catch (error) {
                core.logError('FSA-JOB-CASE', `${jobId}: ${error.message}`);
                jobLog(jobId, 'ERROR', `support case not created: ${error.message}`, error.stack);
            }
        }

        // ---------------------------------------------------------------------------------------------
        // @@NOTE: the customer picked on the form (dropDown_1_2_2): returns { companyId (customrecord_twc_company), entityId (NetSuite customer) } or null
        //          the value is the customer entity (it was used as the case company), resolved to its OSSMTWC company (custrecordtwc_entity)
        //          fallback: the value is an OSSMTWC company id
        function getCustomer(values) {
            var customerValue = int(values[CTRL.CUSTOMER]);
            if (!customerValue) {
                // @@NOTE: case "To customer": the customer is mandatory
                if (str(values[CTRL.CASE_FOR]) == CASE_FOR_CUSTOMER) { throw new Error('case for customer but no customer selected'); }
                return null;
            }

            var company = coreSQL.first({
                query: `select id, ${twcCompany.Fields.ENTITY} as entity_id from ${twcCompany.Type} where ${twcCompany.Fields.ENTITY} = ? order by isinactive, id`,
                params: [customerValue]
            });
            if (!company) {
                company = coreSQL.first({
                    query: `select id, ${twcCompany.Fields.ENTITY} as entity_id from ${twcCompany.Type} where id = ?`,
                    params: [customerValue]
                });
            }
            if (!company) { throw new Error(`customer ${customerValue} is not linked to any OSSMTWC company`); }
            if (!company.entity_id) { throw new Error(`OSSMTWC company ${company.id} has no NetSuite entity`); }
            return { companyId: parseInt(company.id), entityId: parseInt(company.entity_id) };
        }

        function getFsaSite(job, values) {
            var siteId = int(values[CTRL.SITE]) || int(job.site_id);
            return siteId ? coreSQL.first({
                query: `select name, custrecord_fsa_site_address as address, custrecord_fsa_site_entity_id as twc_site_id from customrecord_fsa_site where id = ?`,
                params: [siteId]
            }) : null;
        }

        // @@NOTE: the trouble ticket, as created by the portal (ui/modules/oTWC_troubleTicketUtils.js: save): status New, site, submitted date, customer, issue
        //          the FSA site is linked to the OSSMTWC site by custrecord_fsa_site_entity_id (modules/oTWC_fsaSiteSyncEngine.js)
        //          category: from the form (TKT_CATEGORY), priority: the case priority on the form mapped to the ticket priority (getTicketPriority)
        //          the job photos / documents become ticket files (createTicketFiles)
        //          @@TODO: author (OSSMTWC profile) not set: the FSA user is not mapped to a profile
        function createTicket(job, values, customer) {
            var site = getFsaSite(job, values);
            var twcSiteId = int(site?.twc_site_id);
            if (!twcSiteId) { throw new Error('the FSA site is not linked to an OSSMTWC site, trouble ticket not created'); }

            var issue = [str(values[CTRL.SUBJECT]), str(values[CTRL.DESCRIPTION])].filter(v => v).join('\n\n');

            var tkt = twcTrblTkts.get();
            tkt.r.set('name', 'XYZ');   // @@NOTE: as the portal does (the name is generated)
            tkt.set(twcTrblTkts.Fields.STATUS, twcTrblTkts.Status.New);
            tkt.set(twcTrblTkts.Fields.SITE, twcSiteId);
            tkt.set(twcTrblTkts.Fields.SUBMITTED, toDate(values[CTRL.REPORTED_ON]) || new Date());
            tkt.set(twcTrblTkts.Fields.CUSTOMER, customer.companyId);
            tkt.set(twcTrblTkts.Fields.REPORT_ISSUE__WORKS_REQUIRED, issue);
            if (int(values[CTRL.TKT_CATEGORY])) { tkt.set(twcTrblTkts.Fields.CATEGORY, int(values[CTRL.TKT_CATEGORY])); }
            var priority = getTicketPriority(values);
            if (priority) { tkt.set(twcTrblTkts.Fields.PRIORITY, priority); }
            var ticketId = tkt.save();

            createTicketFiles(job, ticketId);
            return ticketId;
        }

        // @@NOTE: the form priority is a support case priority (supportcasepriority): the ticket priority is the one mapped to it
        //          (customrecord_twc_trbl_tkt_priority.custrecord_twc_trbl_tkt_case_priority), none if not mapped
        function getTicketPriority(values) {
            var casePriority = int(values[CTRL.PRIORITY]);
            if (!casePriority) { return null; }
            return int(coreSQL.first({
                query: `select id from customrecord_twc_trbl_tkt_priority where custrecord_twc_trbl_tkt_case_priority = ? and isinactive = 'F' order by id`,
                params: [casePriority]
            })?.id);
        }

        // @@NOTE: the job photos / documents (customrecord_fsa_job_attach, created by the FSA job engine) become ticket files (customrecord_twc_file)
        //          as the portal does (ui/modules/oTWC_troubleTicketUtils.js: saveTktImage): the file is copied in the ticket folder (TL Files/<site id>/TTK/<ticket id>)
        //          photos get the ticket image file type (Image, not completion), documents no file type
        //          a file that fails is logged on the job, the others go on (the original file stays on the job / case)
        function createTicketFiles(job, ticketId) {
            var attachments = coreSQL.run({
                query: `select distinct custrecord_fsa_job_attach_doc_id as doc_id from customrecord_fsa_job_attach where custrecord_fsa_job_attach_job = ? and custrecord_fsa_job_attach_doc_id is not null`,
                params: [parseInt(job.id)]
            });
            if (attachments.length == 0) { return; }

            var tktInfo = coreSQL.first({
                query: `select site.custrecord_twc_site_id as site_id from ${twcTrblTkts.Type} tk join customrecord_twc_site site on site.id = tk.${twcTrblTkts.Fields.SITE} where tk.id = ?`,
                params: [parseInt(ticketId)]
            });
            var tktFolder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/${tktInfo?.site_id}/TTK/${ticketId}`);
            var imageFileType = int(coreSQL.first(`select id from customrecord_twc_file_type where custrecord_twc_file_type_image = 'T' and NVL(custrecord_twc_file_type_completion_img, 'F') = 'F' order by id`)?.id);

            core.array.each(attachments, a => {
                try {
                    var srcFile = file.load({ id: a.doc_id });
                    var copied = file.copy({ id: a.doc_id, folder: tktFolder, conflictResolution: file.NameConflictResolution.RENAME_TO_UNIQUE });
                    var isImage = `${srcFile.fileType || ''}`.toUpperCase().indexOf('IMAGE') >= 0;

                    var tktFile = twcFile.get();
                    tktFile.name = srcFile.name;
                    tktFile.recordType = twcTrblTkts.Type;
                    tktFile.recordID = ticketId;
                    tktFile.file = copied.id;
                    if (isImage && imageFileType) { tktFile.r_type = imageFileType; }
                    tktFile.save();
                } catch (error) {
                    core.logError('FSA-JOB-CASE', `${job.id}: file ${a.doc_id} not added to ticket ${ticketId}: ${error.message}`);
                    jobLog(job.id, 'Warning', `file ${a.doc_id} not added to trouble ticket ${ticketId}`, error.message);
                }
            });
        }

        function createCase(job, values, customer, ticketId) {
            var subject = str(values[CTRL.SUBJECT]);
            if (!subject) { throw new Error('no subject'); }

            var site = getFsaSite(job, values);

            var reportedOn = toDate(values[CTRL.REPORTED_ON]) || new Date();

            // @@NOTE: with a customer: the customer entity, otherwise Towercom (as for the trouble ticket cases, oTWC_trouble_tkt_ue.js)
            var caseRec = recu.new('supportcase', true);
            caseRec.set('title', subject.substring(0, 200));
            caseRec.set('company', customer?.entityId || twcConfig.TOWERCOM_ENTITY);
            caseRec.set('profile', twcConfig.TKT_CASE_PROFILE);
            caseRec.set('status', twcConfig.TKT_CASE_STATUS);
            caseRec.set('startdate', reportedOn);
            if (int(values[CTRL.TYPE])) {
                caseRec.set('category', int(values[CTRL.TYPE]));
            } else if (ticketId) {
                caseRec.set('category', TKT_CASE_CATEGORY);
            }
            if (int(values[CTRL.PRIORITY])) { caseRec.set('priority', int(values[CTRL.PRIORITY])); }
            if (ticketId) { caseRec.set(twcConfig.Fields.CASE.TKT_RECORD, ticketId); }
            if (str(values[CTRL.CONTACT_EMAIL])) { caseRec.set('email', str(values[CTRL.CONTACT_EMAIL])); }
            if (str(values[CTRL.CONTACT_PHONE])) { caseRec.set('phone', str(values[CTRL.CONTACT_PHONE])); }
            caseRec.set('incomingmessage', caseMessage(job, values, site, reportedOn));
            var caseId = caseRec.save(true);

            attachFiles(job.id, caseId);
            return caseId;
        }

        // @@NOTE: the case has no site / contact name fields: these go in the case message, with the description
        function caseMessage(job, values, site, reportedOn) {
            var lines = [];
            lines.push(`FSA Job: ${str(job.name)}`);
            if (site) {
                lines.push(`Site: ${str(site.name)}`);
                var address = str(values[CTRL.SITE_ADDRESS]) || str(site.address);
                if (address) { lines.push(`Site address: ${address.replace(/\r?\n/g, ', ')}`); }
            }
            lines.push(`Reported on: ${reportedOn.toISOString().substring(0, 16).replace('T', ' ')}`);
            lines.push(`Logged by: ${str(values[CTRL.LOGGED_BY]) || str(job.user_name)}`);
            lines.push(`Site contact: ${[str(values[CTRL.CONTACT_NAME]), str(values[CTRL.CONTACT_EMAIL]), str(values[CTRL.CONTACT_PHONE])].filter(v => v).join(' / ')}`);
            lines.push('');
            lines.push(str(values[CTRL.DESCRIPTION]));
            return lines.join('\n');
        }

        // the photos / files of the job (customrecord_fsa_job_attach, created by the FSA job engine) attached to the case
        function attachFiles(jobId, caseId) {
            coreSQL.each({
                query: `select distinct custrecord_fsa_job_attach_doc_id as doc_id from customrecord_fsa_job_attach where custrecord_fsa_job_attach_job = ? and custrecord_fsa_job_attach_doc_id is not null`,
                params: [parseInt(jobId)]
            }, a => {
                try {
                    record.attach({ record: { type: 'file', id: a.doc_id }, to: { type: record.Type.SUPPORT_CASE, id: caseId } });
                } catch (error) {
                    core.logError('FSA-JOB-CASE', `${jobId}: file ${a.doc_id} not attached to case ${caseId}: ${error.message}`);
                    jobLog(jobId, 'Warning', `file ${a.doc_id} not attached to case ${caseId}`, error.message);
                }
            });
        }

        // ---------------------------------------------------------------------------------------------
        // @@NOTE: the payload (json file saved by the app) is { ui: { pages: [ { sections: [ { controls: [...] } ] } ] } }, a control has the
        //          entered value in c.value (a section may hold sub sections: c.controls); returns { controlId: value }
        function readPayload(fileId) {
            var payload = JSON.parse(file.load({ id: fileId }).getContents());
            var values = {};
            const walk = (controls) => {
                (controls || []).forEach(c => {
                    if (c.controls) { walk(c.controls); } else if (c.id) { values[c.id] = c.value; }
                });
            }
            (payload?.ui?.pages || []).forEach(p => { (p.sections || []).forEach(s => walk(s.controls)); });
            return values;
        }

        // @@NOTE: list values may come as { id, text } / { value, text } objects or plain values
        function val(v) {
            if (Array.isArray(v)) { v = v[0]; }
            if (v && typeof v == 'object') { v = v.id ?? v.value; }
            return v;
        }
        function str(v) { return `${val(v) ?? ''}`.trim(); }
        function int(v) { return parseInt(val(v)) || null; }

        // @@NOTE: the app sends the local date/time (i.e. 2026-11-19T10:30): built from its parts so the server time zone does not shift the day
        function toDate(v) {
            v = str(v);
            if (!v) { return null; }
            var m = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
            if (m) { return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]), parseInt(m[4] || 0), parseInt(m[5] || 0)); }
            var d = new Date(v);
            return isNaN(d.getTime()) ? null : d;
        }

        // the FSA job log (customrecord_fsa_job_log, shown on the FSA job): back-office can see why a case was not created
        function jobLog(jobId, type, msg, info) {
            try {
                var l = recu.new('customrecord_fsa_job_log');
                l.set('custrecord_fsa_job_log_job', jobId);
                l.set('custrecord_fsa_job_log_type', type);
                l.set('custrecord_fsa_job_log_msg', `${msg || ''}`.substring(0, 300));
                l.set('custrecord_fsa_job_log_info', `${info || ''}`.substring(0, 4000));
                l.save();
            } catch (error) {
                core.logError('FSA-JOB-LOG', `${jobId}: ${error.message}`);
            }
        }

        return {
            afterSubmit: afterSubmit
        }
    });
