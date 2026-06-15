
/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'SuiteBundles/Bundle 548734/O/core.https.j.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js', '../data/oTWC_srfWorkflow.js', '../data/oTWC_srfWorkflowItem.js', '../data/oTWC_srfWorkflowStage.js', '../data/oTWC_srf.js', '../data/oTWC_site.js', '../O/oTWC_dialogEx.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_srfWorkflowEngine.js', '../data/oTWC_icons.js'],
    function (core, coreSql, recu, https, twcProfile, twcCompany, twcUtils, twcSrfWorkflow, twcSrfWorkflowItem, twcSrfWorkflowStage, twcSrf, twcSite, dialog, twcUi, twcSrfWorkflowEngine, twcIcons) {

        const TODAY = (new Date()).format();

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
                styles.bkgd = 'red';
            }
            return `color: ${styles.color}; background-color: ${styles.bkgd}`;
        }



        class WorkflowFormItem {
            #workflowForm = null;
            #item = null;
            #workflow = null;
            #ui = null;
            #form = null;
            #readOnly = false;
            constructor(form, item) {
                this.#workflowForm = form;
                this.#workflow = form.workflow;
                this.#item = item;
                this.#readOnly = this.#item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#item.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED;
            }

            render(callback) {


                var statusLabel = '';
                if (this.#item.set_status_name) {
                    statusLabel = `
                        <span class="twc-record-status" style="${getStatusStyles(this.#item.set_status)}">
                            ${this.#item.set_status_name}
                        </span>
                    `;
                }
                this.#ui = jQuery(`
                    <div>
                        <div class="omt-ui-flex-panel" style="margin-bottom: 3px;">
                            ${twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: 'actual_date', label: 'Actual', value: this.#item.actual || TODAY, readOnly: this.#readOnly })}
                            ${twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: 'planned_date', label: 'Planned', value: this.#item.planned, readOnly: this.#readOnly })}
                            <div>
                                <label style="margin-top: 2px; margin-bottom: 11px;">SRF Status Transition</label>
                                ${statusLabel}
                            </div>
                        </div>
                        
                    </div>
                `);

                var nextSteps = [];
                if (!this.#readOnly) {

                    nextSteps = this.#workflow.items.filter(i => {
                        if (this.#item.next_stage_pick == 'T') {
                            return this.#item.next_stage.indexOf(i.stage) >= 0 && i.status == twcSrfWorkflowEngine.WorkflowStatus.NEW;
                        } else {
                            return this.#item.next_stage.indexOf(i.stage) >= 0 && this.#item.id < i.id;
                        }

                    })
                    if (nextSteps.length > 0) {

                        var nextStepContainerOuter = jQuery(`<div style="margin-top: 7px; padding: 3px; border: 1px solid var(--grid-color);"><h3 style="margin-bottom: 7px; border-bottom: 1px solid var(--grid-color);">Next Steps Planned Dates</h3></div>`);
                        var nextStepContainer = jQuery(`<div class="twc-div-table-r" style="table-layout: fixed;"></div>`);
                        nextStepContainerOuter.append(nextStepContainer);
                        core.array.each(nextSteps, next => {
                            var assignToDropDOwn = '';
                            if (next.is_review == 'T' || next.can_assign == 'T') {
                                assignToDropDOwn = `<div>${twcUi.render({ type: twcUi.CTRL_TYPE.DROPDOWN, id: `assigned_to_${next.id}`, value: next.assigned_to, dataSource: this.#workflowForm.data.assignToList, hint: 'Assign to' })}</div>`;
                            }

                            var radioButton = '';
                            if (this.#item.next_stage_pick == 'T') {
                                radioButton = `<div style="width: 30px;"><input type="radio" style="transform: scale(2);" name="pick_next_stage" data-id="${next.id}" /></div>`;
                            }

                            nextStepContainer.append(`
                                <div>
                                    ${radioButton}
                                    <div style="width: 150px; padding: 0px 3px;">
                                        ${next.stage_name}
                                    </div>
                                    <div style="padding: 0px 3px;">
                                        ${twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: `planned_date_${next.id}`, value: next.planned })}
                                    </div>
                                    ${assignToDropDOwn}
                                </div>
                            `)
                        })
                        this.#ui.append(nextStepContainerOuter);
                    }
                }


                var formData = null;
                if (this.#item.form_data) {
                    formData = JSON.parse(this.#item.form_data);
                    var formDataContainer = jQuery(`
                        <div style="margin-top: 7px; padding: 3px; border: 1px solid var(--grid-color);">
                            <h3 style="margin-bottom: 7px; border-bottom: 1px solid var(--grid-color);">${formData.title}</h3>
                        </div>
                    `);
                    for (var k in formData.fields) {
                        formData.fields[k].value = this.#item[formData.fields[k].id] || this.#workflow[formData.fields[k].id];
                        formData.fields[k].readOnly = this.#readOnly;

                        if (formData.fields[k].dataSourceConfig) {
                            formData.fields[k].dataSource = this.#workflowForm.data[formData.fields[k].dataSourceConfig] || [];
                        }

                        formDataContainer.append(twcUi.render(formData.fields[k]))
                    }
                    this.#ui.append(formDataContainer);
                }



                this.#form = twcUi.init({}, this.#ui);

                var method = this.#readOnly ? 'open' : 'confirm';

                dialog[method]({ title: 'manage item', content: this.#ui, size: { width: '700px', height: '550px' } }, dlg => {
                    try {
                        var values = this.#form.getValues();

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
                                [twcSrfWorkflowItem.Fields.PLANNED]: item.planned,
                                [twcSrfWorkflowItem.Fields.STATUS]: item.status,
                                [twcSrfWorkflowItem.Fields.ASSIGNED_TO]: item.assigned_to,
                                [twcSrfWorkflowItem.Fields.PROFILE]: item.profile,
                            };
                            if (item.actual) { i[twcSrfWorkflowItem.Fields.ACTUAL] = item.actual; }
                            if (form) {
                                i.formData = { record: form.record, passField: item.review_pass_field };
                                for (var k in form.fields) { i.formData[form.fields[k].id] = values[form.fields[k].id]; }
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
                                this.#item[formData.fields[k].id] = values[formData.fields[k].id];
                            }
                        }
                        appendItem(this.#item, formData);

                        var setStatus = this.#item.set_status;
                        core.array.each(nextSteps, next => {
                            if (pickedNextStage && pickedNextStage != next.id) { return; }
                            next.planned = values[`planned_date_${next.id}`];
                            next.assigned_to = values[`assigned_to_${next.id}`];
                            next.status = (next.is_last_stage == 'T') ? twcSrfWorkflowEngine.WorkflowStatus.COMPLETED : twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS;
                            next.status_name = 'In Progress';

                            setStatus = next.set_status;

                            appendItem(next);
                        })

                        dialog.saving(dlg, 'saving data...<br />do not close the pop-up or refresh the page.');

                        this.#workflowForm.post('update-workflow', { setStatus: this.#readOnly ? null : setStatus, items: items })
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
            }

            static open(workflowForm, item, callback) {
                var form = new WorkflowFormItem(workflowForm, item);
                form.render(callback);
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

                    await this.post('update-workflow', payload);

                    if (input.attr('type') == 'date') {
                        if (value && value < TODAY) {
                            input.parent().addClass('ktl-highlight-red');
                        } else {
                            input.parent().removeClass('ktl-highlight-red');
                        }
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

                var customerPlannedDate = this.#workflow.customer_planned_date ? twcUtils.fromJsToNs(this.#workflow.customer_planned_date) : 'NA';
                var worksPermittedDate = this.#workflow.works_permitted_date ? twcUtils.fromJsToNs(this.#workflow.works_permitted_date) : 'NA';
                if (!this.#readOnly) {
                    customerPlannedDate = `<input id="customer-planned-date" type="date" style="text-align: center; border: none; background-color: transparent; color: inherit;" value="${this.#workflow.customer_planned_date}" />`;
                }

                if (this.#workflow.srf_status == twcUtils.SrfStatus.SRFApproved || this.#workflow.srf_status == twcUtils.SrfStatus.LicenceRequested || this.#workflow.srf_status == twcUtils.SrfStatus.LicenceIssued || this.#workflow.srf_status == twcUtils.SrfStatus.LicenceExecuted) {
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
                                    <div><label style="margin: 0px;">Customer Planned Date</label></div>
                                    <div class="${!this.#readOnly && this.#workflow.customer_planned_date && this.#workflow.customer_planned_date < TODAY ? 'ktl-highlight-red' : ''}" style="text-align: center; width: 120px">${customerPlannedDate}</div>
                                </div>
                                <div>
                                    <div><label style="margin: 0px;">Works Permitted Date</label></div>
                                    <div class="${!this.#readOnly && this.#workflow.works_permitted_date && this.#workflow.works_permitted_date < TODAY ? 'ktl-highlight-red' : ''}" style="text-align: center; width: 120px">${worksPermittedDate}</div>
                                </div>
                            </div>
                        </div>
                        <div id="srf-workflow-table">
                        </div>
                        <div id="srf-workflow-notes">
                            ${twcUi.render({ type: twcUi.CTRL_TYPE.TEXTAREA, id: 'srf-workflow-notes', label: 'Notes', value: this.#workflow.notes || '', width: '100%', rows: 7, readOnly: this.#readOnly })}
                        </div>
                    </div>
                `)

                this.#ui.find('#customer-planned-date').change(async e => {
                    var payload = { srf: { id: this.#workflow.srf, [twcSrf.Fields.CUSTOMER_PLANNED_INSTALL_DATE]: jQuery(e.currentTarget).val() } }
                    this.#workflow.customer_planned_date = await this.updateValue(e, payload);
                })

                this.#ui.find('#works-permitted-date').change(async e => {
                    var payload = { srf: { id: this.#workflow.srf, [twcSrf.Fields.WORKS_PERMITTED_DATE]: jQuery(e.currentTarget).val() } }
                    this.#workflow.works_permitted_date = await this.updateValue(e, payload);
                })

                this.#ui.find('#srf-workflow-notes').change(async e => {
                    var payload = { wkf: { id: this.#workflow.id, [twcSrfWorkflow.Fields.NOTES]: jQuery(e.currentTarget).val() } }
                    this.#workflow.notes = await this.updateValue(e, payload);
                })


                this.#uiTable = jQuery(`
                    <table class="twc-table-b">
                        <thead>
                            <tr>
                                <th style="width: 25px;"></th>
                                <th style="width: 75px; text-align: center;">Step</th>
                                <th>Description</th>
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

                    var editIcon = '';
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || item.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED) {
                        editIcon = `<span class="edit-item" style="cursor: pointer;">${twcIcons.get('lock', 16)}</span>`;
                    } else {
                        if (item.status == twcSrfWorkflowEngine.WorkflowStatus.NEW || item.status == twcSrfWorkflowEngine.WorkflowStatus.IN_PROGRESS) {
                            editIcon = `<span class="edit-item" style="cursor: pointer;">${twcIcons.get('pencil', 16)}</span>`;
                            if (item.status == twcSrfWorkflowEngine.WorkflowStatus.NEW && prevItem?.status != twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) {
                                editIcon = ''
                            }
                        }
                    }

                    var plannedDateInput = `<input type="date" style="text-align: center; border: none; background-color: transparent; color: inherit;" id="date-planned-${item.id}" value="${item.planned || ''}" />`;
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED) {
                        plannedDateInput = item.planned ? twcUtils.fromJsToNs(item.planned) : '-';
                    }

                    var styles = getStatusStyles(item.status, true);
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED && item.is_review == 'T' && item.review_passed != 'T') {
                        styles = `background-color: red !important; color: white !important`;
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
                            <td>${item.stage_name}</td>
                            <td class="${(item.planned && item.planned < TODAY) ? 'ktl-highlight-red' : ''}" style="text-align: center;">
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
                    })
                    tableRow.find('.edit-item').click(async e => {
                        WorkflowFormItem.open(this, item, (resp) => {
                            if (resp.wkfStatus) {
                                this.#workflow.status = resp.wkfStatus;
                                this.#workflow.status_name = resp.wkfStatusName;
                            }
                            if (resp.srfStatus) {
                                jQuery('#srf-record-status').html(twcSrf.getSrfStatusHtml(resp.srfStatus));
                                this.#workflow.srf_status = resp.srfStatus;
                            }
                            this.renderWorkflow();
                        })
                    })

                    prevItem = item;

                })

                this.#container.html(this.#ui);
            }


            popUp() {
                this.render(jQuery('<div></div>'));
                dialog.open({ title: 'manage item', content: this.#container, size: { width: '1000px', height: '90vh' } });
            }
        }



        return {
            getForm: (page, options) => {
                return new WorkflowForm(page, options);
            }
        }
    });
