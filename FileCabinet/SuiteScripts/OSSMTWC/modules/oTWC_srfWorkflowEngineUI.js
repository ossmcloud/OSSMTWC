
/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'SuiteBundles/Bundle 548734/O/core.https.j.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js', '../data/oTWC_srfWorkflow.js', '../data/oTWC_srfWorkflowItem.js', '../data/oTWC_srfWorkflowStage.js', '../data/oTWC_srf.js', '../data/oTWC_site.js', '../O/oTWC_dialogEx.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_srfWorkflowEngine.js', '../data/oTWC_icons.js', './oTWC_sdsEngineUI.js', '../data/oTWC_file.js', '../data/oTWC_srfReview.js'],
    function (core, cored, coreSql, recu, https, twcProfile, twcCompany, twcUtils, twcSrfWorkflow, twcSrfWorkflowItem, twcSrfWorkflowStage, twcSrf, twcSite, dialog, twcUi, twcSrfWorkflowEngine, twcIcons, twcSdsEngineUI, twcFile, twcSrfReview) {

        const TODAY = (new Date()).format();
        // @@NOTE: planned dates turn amber when due within this many days (red when due today or overdue)
        const PLANNED_WARN_DAYS = 2;

        // @@NOTE: highlight of the step planned date, compared to a reference date:
        //         - step completed: the actual (completion) date, so the date keeps the colour it had when the step was completed
        //         - step not completed (and workflow still open): today
        //         red   = planned date is on or before the reference date
        //         amber = planned date is within PLANNED_WARN_DAYS days after the reference date
        //         dates are 'YYYY-MM-DD' strings (see getWorkflow in oTWC_srfWorkflowEngine.js) so they compare as strings
        function getPlannedDateClass(item, workflow) {
            if (!item.planned) { return ''; }
            if (item.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED || item.status == twcSrfWorkflowEngine.WorkflowStatus.NOT_REQUIRED) { return ''; }

            var refDate = TODAY;
            if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) {
                if (!item.actual) { return ''; }
                refDate = item.actual;
            } else if (workflow.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || workflow.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED) {
                return '';
            }

            var d = new Date(`${refDate}T00:00:00`);
            d.setDate(d.getDate() + PLANNED_WARN_DAYS);
            var warnDate = d.format();

            if (item.planned <= refDate) { return 'ktl-highlight-red'; }
            if (item.planned <= warnDate) { return 'ktl-highlight-amber'; }
            return '';
        }

        function getStatusStyles(status, isItem) {
            var styles = { color: 'white', bkgd: 'silver' };
            if (status == twcSrfWorkflowEngine.WorkflowStatus.NEW) {
                if (isItem) {
                    styles.bkgd = 'rgb(220, 220, 220)';
                    styles.color = 'black';
                } else {
                    styles.bkgd = 'yellow';
                    styles.color = 'maroon';
                }
            } else if (status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS) {
                styles.bkgd = 'steelblue';
            } else if (status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) {
                styles.bkgd = 'green';
            } else if (status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED) {
                styles.bkgd = 'indianred';
                styles.color = 'silver';
            } else if (status == twcSrfWorkflowEngine.WorkflowStatus.NOT_REQUIRED) {
                styles.bkgd = 'silver';
                styles.color = 'darkgray';
            }
            return `color: ${styles.color}; background-color: ${styles.bkgd}`;
        }



        class WorkflowFormItem {
            #workflowForm = null;
            #item = null;
            #workflow = null;
            #ui = null;
            #form = null;
            #dlg = null;
            #readOnly = false;
            constructor(form, item) {
                this.#workflowForm = form;
                this.#workflow = form.workflow;
                this.#item = item;

                this.#readOnly = !this.#workflowForm.canEditWorkflowItem(item, form.data.userInfo);
                //this.#readOnly = this.#item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#item.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED;
            }

            renderDrawingFileList(container) {
                if (!container) {
                    container = jQuery('#workflow-form-data');
                }
                var fileListContainer = container.find('#workflow-form-data-drawings');
                if (fileListContainer.length == 0) {
                    fileListContainer = jQuery(`<div id="workflow-form-data-drawings" style="margin-top: 7px;"></div>`);
                    container.append(fileListContainer);
                }
                fileListContainer.html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 64)}</span>`)


                this.#workflowForm.post('get-drawing-files', { srf: this.#workflowForm.page.data.siteRequestInfo.id })
                    .then(res => {
                        if (res.error) { throw new Error(res.error); }

                        var fileList = jQuery(`<div class="twc-div-table-r"></div>`);
                        core.array.each(res.files, f => {
                            var desc = f[twcFile.Fields.DESCRIPTION] || '';
                            if (desc) { desc = ` (${desc})`; }
                            fileList.append(`
                                <div class="file-table-row">
                                    <div style="width: 30px;">${f.preview_link}</div>    
                                    <div>${f.name}${desc}</div>
                                    <div style="width: 30px;">${f.delete_link}</div>    
                                </div>
                            `);
                        })
                        fileList.find('.twc-preview-file').click(async e => {
                            var fileId = jQuery(e.currentTarget).data('file');
                            await this.#workflowForm.page.previewFile(fileId, e)
                        })
                        fileList.find('.twc-delete-file').click(async e => {
                            var fileId = jQuery(e.currentTarget).data('twc-file');
                            await dialog.confirmAsync('are you sure you wish to delete the file?');
                            container.find('#workflow-form-data-drawings').html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 64)}</span>`)
                            this.#workflowForm.post('delete-drawing-files', { twcFile: fileId })
                                .then(res => {
                                    if (res.error) { throw new Error(res.error); }
                                    jQuery(e.currentTarget).closest('.file-table-row').remove();
                                }).catch(err => {
                                    dialog.error(err.error || err.message)

                                }).finally(() => {
                                    this.renderDrawingFileList();
                                })


                        })

                        fileListContainer.html(fileList)

                    }).catch(err => {
                        fileListContainer.html(`<div style="color: red; padding: 7px;">${err.error || err.message}</div>`)
                    })
            }

            // @@NOTE: sets value, readOnly and data source of a stage form field (form_data) before rendering it
            //         sourceItem is the workflow item the values are read from (the step being edited or, for the checks summary, the check step)
            //         noDefaults: do not apply the field default when there is no value (summary of a check: show what was entered)
            prepareFormField(field, sourceItem, readOnly, noDefaults) {
                if (field.type != 'button') {
                    // @@NOTE: the form is generally associated to one record but one or more field could relate to a different record (srf or workflow)
                    //         these fields are identified by the fact that the id will be [table_name]-[field_name]
                    var fieldId = field.id;
                    if (fieldId.indexOf('-') > 0) { fieldId = fieldId.split('-')[1]; }

                    var v = sourceItem[fieldId] || this.#workflow[fieldId];
                    if (v && v.value !== undefined) { v = v.value; }

                    if (field.type?.toLowerCase() == 'date' && v) {
                        // @@NOTE: there can be some inconsistency on the way dates are returned, could be DD/MM/YYYY but control expects YYYY-MM-DD
                        if (v.indexOf('/') > 0) { v = twcUtils.fromNsToJs(v) }
                    }

                    if (!v && field.default && !noDefaults) {
                        if (field.type?.toLowerCase() == 'date') {
                            // @@REVIEW: do we need more default date values???
                            if (field.default == 'TODAY') { v = (new Date()).format(); }
                        } else {
                            v = field.default;
                        }
                    }

                    field.value = v;
                }
                if (field.readOnly === undefined) { field.readOnly = readOnly; }

                if (field.dataSourceConfig) {
                    if (field.dataSourceConfig.startsWith('utils')) {
                        field.dataSource = twcUtils[field.dataSourceConfig.split(':')[1]]();
                    } else {
                        field.dataSource = this.#workflowForm.data[field.dataSourceConfig] || [];
                    }
                }
                return field;
            }

            // @@NOTE: read-only summary of the checks (review steps) feeding the TL Response step: result, who / when and the fields of each check form
            //         the check fields are rendered from each check stage form_data (no per-stage hard-coding), with unique ids so they do not clash with this form
            renderChecksSummary(checkSteps) {
                var container = jQuery(`
                    <div id="workflow-checks-summary" style="margin-top: 7px; padding: 3px; border: 1px solid var(--grid-color);">
                        <h3 style="margin-bottom: 7px; border-bottom: 1px solid var(--grid-color);">Checks Summary</h3>
                    </div>
                `);
                if (!checkSteps || checkSteps.length == 0) {
                    container.append(`<div style="padding: 3px; font-style: italic;">no checks found</div>`);
                    return container;
                }

                core.array.each(checkSteps, step => {
                    var completed = step.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED;
                    var result = { text: 'Pending', styles: 'background-color: silver; color: black;' };
                    if (completed) {
                        result = (step.review_passed == 'T')
                            ? { text: 'Passed', styles: 'background-color: green; color: white;' }
                            : { text: 'Failed', styles: 'background-color: red; color: white;' };
                    }

                    var by = [];
                    if (step.profile_name) { by.push(`by ${step.profile_name}`); }
                    if (step.actual) { by.push(`on ${twcUtils.fromJsToNs(step.actual)}`); }
                    if (!completed && step.assigned_to_name) { by.push(`assigned to ${step.assigned_to_name}`); }

                    var checkContainer = jQuery(`
                        <div style="margin-bottom: 7px; padding: 3px; border-bottom: 1px dotted var(--grid-color);">
                            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                                <span class="twc-record-status" style="width: auto; ${result.styles}">${result.text}</span>
                                <strong style="margin-left: 7px;">${step.stage_alt_name || step.stage_name}</strong>
                                <span style="margin-left: 7px; color: var(--label-color); font-style: italic;">${by.join(' ')}</span>
                            </div>
                        </div>
                    `);

                    if (step.form_data) {
                        var stepForm = null;
                        try { stepForm = JSON.parse(step.form_data); } catch (e) { stepForm = null; }
                        for (var k in (stepForm?.fields || {})) {
                            var f = stepForm.fields[k];
                            if (f.type == 'button' || f.type == 'drawings') { continue; }
                            // @@NOTE: the pass/fail field is shown as the result above
                            if (step.review_pass_field && f.id == step.review_pass_field) { continue; }

                            this.prepareFormField(f, step, true, true);
                            f.readOnly = true;
                            f.mandatory = false;
                            f.id = `check_summary_${step.id}_${f.id}`;
                            checkContainer.append(twcUi.render(f));
                        }
                    }
                    container.append(checkContainer);
                })
                return container;
            }

            render(callback) {
                var statusLabel = '';
                if (this.#item.set_status_name) {
                    statusLabel = `
                        <div>
                            <label style="margin-top: 2px; margin-bottom: 11px;">SRF Status Transition</label>
                            <span class="twc-record-status" style="${getStatusStyles(this.#item.set_status)}">
                                ${this.#item.set_status_name}
                            </span>
                        </div>
                    `;
                }
                this.#ui = jQuery(`
                    <div>
                        <div class="omt-ui-flex-panel" style="margin-bottom: 3px;">
                            ${twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: 'actual_date', label: 'Actual', value: this.#item.actual || TODAY, readOnly: this.#readOnly })}
                            ${twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: 'planned_date', label: 'Planned', value: this.#item.planned, readOnly: this.#readOnly })}
                            ${statusLabel}
                        </div>
                    </div>
                `);

                var isTLResponse = this.#item.next_stage_pick == 'T';

                var completedCount = 0; var passedCount = 0;
                if (isTLResponse) {
                    // @@NOTE: get the last feedback issue step id
                    var feedbackIssued = this.#workflow.items.filter(i => { return i.set_status == twcUtils.SrfStatus.FeedbackIssued && i.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED; });
                    feedbackIssued = (feedbackIssued.length > 0) ? feedbackIssued[feedbackIssued.length - 1].id : 0;
                    // @@NOTE: get all previous steps but AFTER the last feedback
                    var prevSteps = this.#workflow.items.filter(i => { return i.next_stage.indexOf(this.#item.stage) >= 0 && i.status != twcSrfWorkflowEngine.WorkflowStatus.NOT_REQUIRED && i.id > feedbackIssued; });
                    // @@NOTE: now loop and count completed and passed
                    core.array.each(prevSteps, prevStep => {
                        if (prevStep.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) {
                            completedCount++;
                            if (prevStep.review_passed == 'T') { passedCount++; }
                        }
                    })

                    if (completedCount < prevSteps.length) { this.#readOnly = true; }
                } else {
                    if (this.#item.set_status == twcUtils.SrfStatus.SRFApproved) {
                        if (!this.#workflowForm.data.userInfo.powerUser) {
                            this.#readOnly = true;
                        }
                    }
                }



                var nextStepsTemp = this.#workflow.items.filter((i, x, y) => {
                    if (this.#item.next_stage_pick == 'T') {
                        return (this.#item.next_stage.indexOf(i.stage) >= 0 && (i.status == twcSrfWorkflowEngine.WorkflowStatus.NEW || i.status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS));
                    } else {
                        return this.#item.next_stage.indexOf(i.stage) >= 0 && this.#item.id < i.id;
                    }
                })

                // @@NOTE: if one or mre feedback is issued we get all next steps for all other issued feedbacks
                //          because they are in chronological order we only get the 1st set of next stages
                var nextSteps = [];
                core.array.each(nextStepsTemp, nextStepsTemp => {
                    if (nextSteps.find(ns => { return ns.stage == nextStepsTemp.stage })) { return; }
                    nextSteps.push(nextStepsTemp);
                })

                if (nextSteps.length > 0) {
                    var nextStepContainerOuter = jQuery(`<div style="margin-top: 7px; padding: 3px; border: 1px solid var(--grid-color);"><h3 style="margin-bottom: 7px; border-bottom: 1px solid var(--grid-color);">Next Steps</h3></div>`);
                    var nextStepContainer = jQuery(`<div class="twc-div-table-r" style="table-layout: auto;"></div>`);
                    nextStepContainerOuter.append(nextStepContainer);
                    core.array.each(nextSteps, next => {
                        var radioButton = '';

                        if (isTLResponse) {
                            // @@NOTE: if we have a TL Response stage then only allow for approve/feedback depending if all required checks have passed
                            if (next.set_status != twcUtils.SrfStatus.SRFApproved && next.set_status != twcUtils.SrfStatus.FeedbackIssued) { return; }
                            if (next.set_status == twcUtils.SrfStatus.SRFApproved && passedCount < completedCount) { return; }
                            //if (next.set_status == twcUtils.SrfStatus.FeedbackIssued && passedCount == completedCount) { return; }
                            radioButton = `<div style="width: 30px;"><input type="radio" style="transform: scale(2);" name="pick_next_stage" data-id="${next.id}" ${this.#readOnly ? 'readonly' : 'checked'} /></div>`;
                        }

                        // @@NOTE: a next step already completed (e.g.: the Initial Review is re-opened to assign one more check) is shown read-only
                        //         and it is NOT touched when saving (see the confirm callback below), otherwise it would be reset to in progress
                        var nextCompleted = next.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED;
                        var nextReadOnly = this.#readOnly || nextCompleted;

                        var assignToDropDOwn = '';
                        if (next.is_review == 'T' || next.can_assign == 'T') {
                            assignToDropDOwn = `<div>${twcUi.render({ type: twcUi.CTRL_TYPE.DROPDOWN, id: `assigned_to_${next.id}`, value: next.assigned_to, dataSource: this.#workflowForm.data.assignToList, hint: 'Assign to', readOnly: nextReadOnly })}</div>`;
                        }

                        var requiredToggle = '<div></div>';
                        if (next.can_skip == 'T') {
                            requiredToggle = `<div style="width: 50px;">${twcUi.render({ type: twcUi.CTRL_TYPE.TOGGLE, id: `required_${next.id}`, value: next.status != twcSrfWorkflowEngine.WorkflowStatus.NOT_REQUIRED, readOnly: nextReadOnly })}</div>`;
                        }

                        var nextStepPlannedDate = '';
                        if (nextSteps.length > 0) {
                            // nextStepPlannedDate = `
                            //     <div style="padding: 0px 3px;">
                            //         ${twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: `planned_date_${next.id}`, value: next.planned, readOnly: this.#readOnly })}
                            //     </div>
                            // `
                        }

                        nextStepContainer.append(`
                                <div>
                                    ${radioButton}
                                    <div style="width: 150px; padding: 0px 3px;">
                                        ${next.stage_alt_name || next.stage_name}
                                        ${nextCompleted ? '<span style="color: var(--label-color); font-style: italic;">(completed)</span>' : ''}
                                    </div>
                                    ${requiredToggle}
                                    ${nextStepPlannedDate}
                                    ${assignToDropDOwn}
                                    
                                </div>
                            `)
                    })
                    this.#ui.append(nextStepContainerOuter);
                }

                var formData = null;
                if (this.#item.form_data) {
                    formData = JSON.parse(this.#item.form_data);
                    var formDataContainer = jQuery(`
                        <div id="workflow-form-data" style="margin-top: 7px; padding: 3px; border: 1px solid var(--grid-color);">
                            <h3 style="margin-bottom: 7px; border-bottom: 1px solid var(--grid-color);">${formData.title}</h3>
                        </div>
                    `);
                    for (var k in formData.fields) {
                        if (formData.fields[k].type == 'drawings') {
                            this.renderDrawingFileList(formDataContainer);
                            continue;
                        }
                        this.prepareFormField(formData.fields[k], this.#item, this.#readOnly);
                        formDataContainer.append(twcUi.render(formData.fields[k]))
                    }
                    this.#ui.append(formDataContainer);
                }

                // @@NOTE: TL Response (the step where the SRF is approved or feedback is issued): show a summary of each check (review step) so it can be reviewed
                //         and a comment back to the customer (TL Review Comments on the SRF Review record, see updateWorkflow in oTWC_srfWorkflowEngine.js)
                //         the comment field is only added if the stage form does not already have it (form_data is configured on the stage record)
                var customerCommentsControl = null;
                if (isTLResponse) {
                    this.#ui.append(this.renderChecksSummary(prevSteps));

                    var formHasComments = formData?.fields && Object.values(formData.fields).some(f => { return (f.id || '').split('-').pop() == twcSrfReview.Fields.TL_REVIEW_COMMENTS; });
                    if (!formHasComments) {
                        // @@NOTE: the review fields are on each review step (getWorkFlow joins the SRF Review record), take the value from the checks of this iteration
                        var reviewStep = prevSteps.find(s => { return s.review_id; });
                        customerCommentsControl = 'tl_review_comments_to_customer';
                        this.#ui.append(`
                            <div style="margin-top: 7px; padding: 3px; border: 1px solid var(--grid-color);">
                                <h3 style="margin-bottom: 7px; border-bottom: 1px solid var(--grid-color);">Comments to Customer</h3>
                                ${twcUi.render({ type: twcUi.CTRL_TYPE.TEXTAREA, id: customerCommentsControl, label: 'Comments (visible to the customer on the SRF)', value: reviewStep?.[twcSrfReview.Fields.TL_REVIEW_COMMENTS] || '', width: '100%', rows: 5, readOnly: this.#readOnly })}
                            </div>
                        `);
                    }
                }

                this.#form = twcUi.init({}, this.#ui);

                if (this.#item.status_message) {
                    function decodeHTMLEntities(text) {
                        const doc = new DOMParser().parseFromString(text, 'text/html');
                        return doc.documentElement.textContent;
                    }

                    this.#ui.append(`
                        <div style="padding: 7px; border: 1px solid var(--grid-color); margin-top: 7px;">
                            ${decodeHTMLEntities(this.#item.status_message)}
                        </div>
                    `)
                }

                var method = this.#readOnly ? 'open' : 'confirm';
                // @@NOTE: the TL Response pop-up also shows the checks summary, give it more room
                var dlgSize = isTLResponse ? { width: '900px', height: '85vh' } : { width: '700px', height: '550px' };
                this.#dlg = dialog[method]({ title: 'manage item', content: this.#ui, size: dlgSize }, dlg => {
                    try {
                        var values = this.#form.getValues(true);

                        var pickedNextStage = null;
                        if (this.#item.next_stage_pick == 'T') {
                            var checked = this.#ui.find('input[type="radio"]:checked');
                            if (checked.length == 0) { throw new Error(`Please specify the next stage`); }
                            pickedNextStage = checked.data('id');
                        }

                        var items = [];
                        const appendItem = (item, form) => {
                            var i = {
                                id: item.id,
                                stage: item.stage,
                                last: item.is_last_stage == 'T',
                                isReview: item.is_review == 'T',
                                [twcSrfWorkflowItem.Fields.PLANNED]: item.planned,
                                [twcSrfWorkflowItem.Fields.STATUS]: item.status,
                                [twcSrfWorkflowItem.Fields.ASSIGNED_TO]: item.assigned_to,
                                //[twcSrfWorkflowItem.Fields.PROFILE]: item.profile,
                            };
                            if (item.actual) { i[twcSrfWorkflowItem.Fields.ACTUAL] = item.actual; }
                            if (form) {
                                i.formData = { record: form.record, passField: item.review_pass_field };
                                for (var k in form.fields) {
                                    var v = values[form.fields[k].id];
                                    i.formData[form.fields[k].id] = v?.value || v;
                                }
                                item.review_passed = values[item.review_pass_field] ? 'T' : 'F';
                            }
                            items.push(i);

                        }

                        this.#item.actual = values.actual_date;
                        this.#item.planned = values.planned_date;
                        this.#item.status = twcSrfWorkflowEngine.WorkflowStatus.COMPLETED;
                        this.#item.status_name = 'Completed';
                        this.#item.profile = this.#workflowForm.data.userInfo.profile;
                        this.#item.profile_name = this.#workflowForm.data.userInfo.profileInfo.name;
                        if (formData) {
                            for (var k in formData.fields) {
                                // @@NOTE: the form is generally associated to one record but one or more field could relate to a different record (srf or workflow)
                                //         these fields are identified by the fact that the id will be [table_name]-[field_name]
                                var fieldId = formData.fields[k].id;
                                if (fieldId.indexOf('-') > 0) { fieldId = fieldId.split('-')[1]; }

                                if (this.#workflow[fieldId] === undefined) {
                                    this.#item[fieldId] = values[formData.fields[k].id];
                                } else {
                                    this.#workflow[fieldId] = values[formData.fields[k].id];
                                }

                            }
                        }
                        appendItem(this.#item, formData);

                        var setStatus = this.#item.set_status;
                        core.array.each(nextSteps, next => {
                            if (pickedNextStage && pickedNextStage != next.id) { return; }
                            // @@NOTE: never reset a next step that is already completed (status, assignee and form data are kept as they are)
                            if (next.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) { return; }

                            var required = values[`required_${next.id}`];
                            if (required === undefined) { required = true; }
                            if (required) {
                                if (values[`planned_date_${next.id}`]) {
                                    next.planned = values[`planned_date_${next.id}`];
                                }
                                next.assigned_to = values[`assigned_to_${next.id}`]?.value;
                                next.assigned_to_name = values[`assigned_to_${next.id}`]?.text;
                                next.status = (next.is_last_stage == 'T') ? twcSrfWorkflowEngine.WorkflowStatus.COMPLETED : twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS;
                            } else {
                                next.planned = '';
                                next.assigned_to = '';
                                next.assigned_to_name = '';
                                next.status = twcSrfWorkflowEngine.WorkflowStatus.NOT_REQUIRED;
                            }

                            if (next.set_status) { setStatus = next.set_status; }
                            appendItem(next);
                        })

                        dialog.saving(dlg, 'saving data...<br />do not close the pop-up or refresh the page.');

                        var updatePayload = { setStatus: this.#readOnly ? null : setStatus, items: items };
                        // @@NOTE: TL Response comments back to the customer (see renderChecksSummary / updateWorkflow in oTWC_srfWorkflowEngine.js)
                        if (customerCommentsControl && !this.#readOnly) {
                            updatePayload.tlReviewComments = (values[customerCommentsControl] || '').toString().trim();
                        }
                        this.#workflowForm.post('update-workflow', updatePayload)
                            .then(res => {
                                callback(res);
                                dlg.close();
                            }).catch(err => {
                                dialog.savingError(dlg, err);
                            });

                        return false;

                    } catch (error) {
                        dialog.error(error);
                        return false;
                    }
                });


                var generateSdsButton = this.#form.getControl('generate_sds');
                if (generateSdsButton) {
                    if (this.#item.status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS) {
                        // @@NOTE: this is a bit dirty but will do for now
                        generateSdsButton.input.on('click', async e => {
                            try {
                                generateSdsButton.disabled = true;
                                await twcSdsEngineUI.openDialog(this.#workflowForm.page, this.#workflowForm.data.siteRequestInfo, () => {
                                    this.#form.getControl('custrecord_twc_srf_lic_pack_prod').value = TODAY;
                                    generateSdsButton.disabled = false;
                                })
                            } catch (error) {
                                generateSdsButton.disabled = false;
                                dialog.error(error)
                            }
                        })
                    } else {
                        generateSdsButton.hide = true;
                    }
                }

                var issueSdsButton = this.#form.getControl('issue_sds');
                if (issueSdsButton) {
                    this.#dlg.dialog.find('#o-dialog_ok').css('display', 'none');
                    if (this.#item.status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS) {
                        // @@NOTE: this is a bit dirty but will do for now
                        issueSdsButton.on('click', e => {
                            dialog.confirm('are you sure you wish to Issue the SDS', (dlg) => {

                                this.#dlg.dialog.find('#o-dialog_ok').click();
                            })
                        })
                    }
                }

                var rejectSdsButton = this.#form.getControl('reject_sds');
                if (rejectSdsButton) {
                    if (this.#item.status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS) {
                        // @@NOTE: this is a bit dirty but will do for now
                        rejectSdsButton.on('click', e => {
                            var html = `
                                ${twcUi.render({ type: twcUi.CTRL_TYPE.TEXTAREA, id: 'rejection_comment', label: 'rejection comment', width: '100%', rows: 9, mandatory: true })}
                            `
                            dialog.confirm(html, (dlg) => {
                                try {
                                    var comment = dlg.dialog.find('#rejection_comment').val().trim();
                                    if (!comment) { throw new Error(`Please, specify a rejection comment`); }

                                    this.#workflowForm.post('reject-sds', { wkf: this.#workflow, item: this.#item, comment: comment })
                                        .then(res => {
                                            callback(res);
                                            this.#dlg.close();
                                        }).catch(err => {
                                            dialog.savingError(this.#dlg, err);
                                        });

                                } catch (error) {
                                    dialog.error(error)
                                    return false;
                                }
                            })
                        })
                    } else {
                        rejectSdsButton.hide = true;
                    }
                }

                // @@NOTE: this is a bit dirty but will do for now
                this.#form.getControl('print_sds')?.on('click', e => {
                    twcSdsEngineUI.printSDS(this.#workflowForm.page, this.#workflowForm.data.siteRequestInfo, true);
                })

                this.#form.getControl('upload_file')?.on('click', e => {
                    this.#workflowForm.uploadFile(this);
                })


            }

            static open(workflowForm, item, callback) {
                try {
                    var form = new WorkflowFormItem(workflowForm, item);
                    form.render(callback);
                } catch (error) {
                    dialog.error(error);
                }
            }
        }

        class WorkflowForm {
            #options = null;
            #page = null;
            #workflow = null;
            #ui = null;
            #uiTable = null;
            #container = null;
            #readOnly = false;
            constructor(page, options) {
                this.#page = page;
                this.#options = options;

                dialog.CONFIGS.Buttons.Ok.text = 'Confirm';
                dialog.CONFIGS.Buttons.Close.text = 'Close';
                dialog.CONFIGS.Buttons.Close.textWithOk = 'Cancel';
            }

            get workflow() { return this.#workflow; }
            get data() { return this.#page.data; }
            get page() { return this.#page; }

            async post(action, payload) {
                if (action == 'update-workflow') {
                    if (!payload.wkf) { payload.wkf = this.#workflow.id; }
                    if (!payload.srf) { payload.srf = this.#workflow.srf };
                }
                return this.#page.post({ action: action }, payload);
            }

            render(container) {
                if (container) { this.#container = container; }
                this.#container.html(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 64)}</span>`)
                this.post('get-workflow', this.#options).then(res => {
                    console.log(res);
                    if (res.error) { throw res; }
                    this.#workflow = res;
                    this.renderWorkflow();
                }).catch(res => {
                    this.#container.html(`
                        <div style="color: red;">
                            ${res.error || res.message}
                            <hr />
                            ${(res.stack || 'no stack trace').replaceAll('\n', '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')}
                        </div>
                    `)
                });
            }

            async updateValue(e, payload) {
                var value = '';
                var input = jQuery(e.currentTarget);
                var display = input.css('display');
                var waitIcon = jQuery(`<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 16)}</span>`);
                try {
                    input.css('display', 'none');
                    input.parent().append(waitIcon);

                    value = input.val();

                    var res = await this.post('update-workflow', payload);

                    // @@NOTE: planned date highlight is refreshed by the caller (see getPlannedDateClass)
                    //         res.reload: the planned dates of the following steps were moved (oTWC_srfWorkflowEngine.js: propagatePlannedDates) => reload the table
                    if (input.attr('id') == 'works-permitted-date' || res?.reload) {
                        this.render();
                    }

                } catch (error) {
                    input.val('');
                    dialog.error(error);
                } finally {
                    input.css('display', display);
                    waitIcon.remove();
                }
                return value;
            }

            renderWorkflow() {
                this.#readOnly = this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED;

                var worksPermittedDate = this.#workflow.works_permitted_date ? twcUtils.fromJsToNs(this.#workflow.works_permitted_date) : 'NA';

                // @@NOTE: (client request) TL can set / change the Works Permitted Date at any step from Licence Requested to SRF Workflow Complete
                //         NOT when the SRF is only approved (the submitter must request the licence first), still editable once the SRF is Completed
                var worksPermittedStatuses = [
                    twcUtils.SrfStatus.LicenceRequested, twcUtils.SrfStatus.LicenceIssued, twcUtils.SrfStatus.LicenceSigned,
                    twcUtils.SrfStatus.LicenceExecuted, twcUtils.SrfStatus.Completed
                ];
                if (worksPermittedStatuses.includes(parseInt(this.#workflow.srf_status))) {
                    worksPermittedDate = `<input id="works-permitted-date" type="date" style="text-align: center; border: none; background-color: transparent; color: inherit;" value="${this.#workflow.works_permitted_date}" />`;
                }

                this.#ui = jQuery(`
                    <div>
                        <div id="srf-workflow-header" style="display: flex; ">
                            <div class="twc-div-table-r" style="width: 40%">
                                <div>
                                    <div style="width: 100px"><label style="margin: 0px;">Site Name</label></div>
                                    <div><a href="${core.url.record(twcSite.Type)}&id=${this.#workflow.site}" target="_blank">${this.#workflow.site_name}</a></div>
                                </div>
                                <div>
                                    <div><label style="margin: 0px;">Customer</label></div>
                                    <div><a href="${core.url.record(twcCompany.Type)}&id=${this.#workflow.customer}" target="_blank">${this.#workflow.customer_name}</a></div>
                                </div>
                                <div>
                                    <div><label style="margin: 0px;">SRF #</label></div>
                                    <div><a href="${core.url.script('otwc_spacerequest_sl')}&recId=${this.#workflow.srf}" target="_blank">${this.#workflow.srf_name}</a></div>
                                </div>
                            </div>
                            <div style="width: 20%; text-align: center; display: flex; flex-direction: column; align-items: center;">
                                <span>SRF Workflow</span>
                                <span class="twc-record-status" style="width: auto; ${getStatusStyles(this.#workflow.status)}">${this.#workflow.status_name}</span>
                            </div>
                            <div class="twc-div-table-r" style="width: 40%; text-align: right;">
                                <div>
                                    <div><label style="margin: 0px;">Works Permitted Date</label></div>
                                    <div style="text-align: center; width: 120px">${worksPermittedDate}</div>
                                </div>
                            </div>
                        </div>
                        <div id="srf-workflow-table">
                        </div>
                    </div>
                `)
                // @@NOTE: Notes control removed from the workflow (client request), commented out as it may be put back
                //         to restore: add this after the 'srf-workflow-table' div in the template above and uncomment the change handler below
                //
                //  <div id="srf-workflow-notes">
                //      ${twcUi.render({ type: twcUi.CTRL_TYPE.TEXTAREA, id: 'srf-workflow-notes', label: 'Notes', value: this.#workflow.notes || '', width: '100%', rows: 7, readOnly: this.#readOnly })}
                //  </div>
                //
                // this.#ui.find('#srf-workflow-notes').change(async e => {
                //     var payload = { wkf: { id: this.#workflow.id, [twcSrfWorkflow.Fields.NOTES]: jQuery(e.currentTarget).val() } }
                //     this.#workflow.notes = await this.updateValue(e, payload);
                // })

                this.#ui.find('#works-permitted-date').change(async e => {
                    var workDate = jQuery(e.currentTarget).val()
                    if (workDate > TODAY) {
                        await dialog.errorAsync('Work pemritted date cannot be in the future')
                        this.#ui.find('#works-permitted-date').val('');
                        return;
                    }
                    var payload = { srf: { id: this.#workflow.srf, [twcSrf.Fields.WORKS_PERMITTED_DATE]: workDate } }
                    this.#workflow.works_permitted_date = await this.updateValue(e, payload);
                    // @@NOTE: refresh the Works Permitted flag on the SRF title bar (ui/oTWC_spaceRequest_sl.js)
                    jQuery('#srf-works-permitted').html(twcSrf.getSrfWorksPermittedHtml(this.#workflow.works_permitted_date));
                })


                // @@NOTE: one font for the whole table (the planned date inputs use the same font as the other cells)
                this.#uiTable = jQuery(`
                    <table class="twc-table-b twc-srf-wkf-table">
                        <thead>
                            <tr>
                                <th style="width: 25px;"></th>
                                <th style="width: 75px; text-align: center;">Step</th>
                                <th>Description</th>
                                <th style="width: 150px; text-align: center;">Assigned To</th>
                                <th style="width: 120px; text-align: center;">Planned</th>
                                <th style="width: 120px; text-align: center;">Actual</th>
                                <th style="width: 150px; text-align: center;">Profile</th>
                                <th style="width: 24px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                `)
                this.#ui.find('#srf-workflow-table').html(this.#uiTable);

                var tblBody = this.#uiTable.find('tbody'); var loopStart = false; var loopCellAdded = false; var prevItem = null; var loopCount = 0;
                core.array.each(this.#workflow.items, (item, idx) => {
                    if (item.stage_hidden == 'T') {
                        loopStart = true;
                        loopCellAdded = false;
                        tblBody.append(`<tr><td cellspan="7"></td></tr>`);
                        return;
                    }
                    if (item.stage_loop != 'T') { loopStart = false; loopCellAdded = false; }


                    var editIcon = `<span class="edit-item" style="cursor: pointer;">${twcIcons.get(this.canEditWorkflowItem(item, this.data.userInfo) ? 'pencil' : 'lock', 16)}</span>`;;
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.NEW && prevItem?.status != twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) {
                        editIcon = ''
                    }

                    var plannedDateInput = `<input type="date" style="text-align: center; border: none; background-color: transparent; color: inherit;" id="date-planned-${item.id}" value="${item.planned || ''}" />`;
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED) {
                        plannedDateInput = item.planned ? twcUtils.fromJsToNs(item.planned) : '-';
                    }

                    var stageName = item.stage_name;
                    var styles = getStatusStyles(item.status, true);
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED && item.is_review == 'T' && item.review_passed != 'T') {
                        styles = `background-color: red !important; color: white !important`;
                    } else if (item.next_stage_pick == 'T') {
                        if (this.#workflow.items[idx + 1]?.stage_hidden == 'T') {
                            if (this.#workflow.items[idx + 1]?.status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS || this.#workflow.items[idx + 1]?.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) {
                                styles = `background-color: magenta !important; color: white !important`;
                                stageName = this.#workflow.items[idx + 1].stage_name;
                            } else if (this.#workflow.items[idx + 1]?.status == twcSrfWorkflowEngine.WorkflowStatus.NEW) {
                                stageName = `SRF Approved`;
                            }
                        }
                    }

                    var loopTCell = `<td></td>`;
                    if (loopStart) {
                        if (loopCellAdded) {
                            loopTCell = '';
                        } else {
                            loopTCell = `<td rowspan="6" style="vertical-align: middle; max-width: 25px;"><div style="-webkit-transform: rotate(-90deg); white-space: nowrap; margin-top: 100px;">Feedback Loop (${++loopCount})</div></td>`;
                            loopCellAdded = true;
                        }
                    }

                    var tableRow = jQuery(`
                        <tr style="${styles}">
                            ${loopTCell}
                            <td style="text-align: center;">${item.step_no}</td>
                            <td>${stageName}</td>
                            <td style="text-align: center;">${item.assigned_to_name || ''}</td>
                            <td class="${getPlannedDateClass(item, this.#workflow)}" style="text-align: center;">
                                ${plannedDateInput}
                            </td>
                            <td style="text-align: center;">${item.actual ? twcUtils.fromJsToNs(item.actual) : '-'}</td>
                            <td style="text-align: center;">${item.profile_name || ''}</td>
                            <td style="text-align: center;">${editIcon}</td>
                        </tr>
                    `);
                    tblBody.append(tableRow);


                    tableRow.find('input').change(async e => {
                        var payload = { item: { id: item.id, [twcSrfWorkflowItem.Fields.PLANNED]: jQuery(e.currentTarget).val() } }
                        item.planned = await this.updateValue(e, payload);
                        jQuery(e.currentTarget).closest('td').removeClass('ktl-highlight-red ktl-highlight-amber').addClass(getPlannedDateClass(item, this.#workflow));
                    })
                    tableRow.find('.edit-item').click(async e => {
                        WorkflowFormItem.open(this, item, (resp) => {
                            if (resp.reload) {
                                this.render();
                            } else {
                                if (resp.wkfStatus) {
                                    this.#workflow.status = resp.wkfStatus;
                                    this.#workflow.status_name = resp.wkfStatusName;
                                }
                                if (resp.srfStatus) {
                                    jQuery('#srf-record-status').html(twcSrf.getSrfStatusHtml(resp.srfStatus));
                                    this.#workflow.srf_status = resp.srfStatus;
                                }
                                this.renderWorkflow();
                            }
                        })
                    })

                    prevItem = item;

                })

                this.#container.html(this.#ui);
            }

            canEditWorkflowItem(item, userInfo) {
                if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || item.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED) {
                    if (item.can_edit == 'T' && item.profile == userInfo.profile) {

                        return this.#workflow.items.filter(i => { return i.id > item.id && i.next_stage_pick == 'T'; })[0].status != twcSrfWorkflowEngine.WorkflowStatus.COMPLETED;

                    }
                } else {
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.NEW || item.status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS) {
                        return true;
                    }
                }
                return false;
            }

            popUp() {
                this.render(jQuery('<div></div>'));
                dialog.open({ title: 'manage item', content: this.#container, size: { width: '1000px', height: '90vh' } });
            }


            async uploadFile(form) {
                await this.page.uploadFile({
                    showParent: false,
                    // @@NOTE: Revision and Status are not used for TL Drawings (oTWC_fileUI.js: getUIFields)
                    hideRevisionStatus: true,
                    recordType: twcSrf.Type,
                    recordId: this.page.data.siteRequestInfo.id,
                    filters: {
                        'custrecord_twc_file_type_use_in_srf': 'T',
                        'custrecord_twc_file_type_drawing': 'T',

                    }
                }, (file, res) => {
                    form.renderDrawingFileList();
                    // console.log(file, res);
                    // location.reload();
                })
            }
        }




        return {
            getForm: (page, options) => {
                return new WorkflowForm(page, options);
            }
        }
    });
