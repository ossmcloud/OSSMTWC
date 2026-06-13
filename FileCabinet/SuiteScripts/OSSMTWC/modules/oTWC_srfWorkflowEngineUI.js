/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js', '../data/oTWC_srfWorkflow.js', '../data/oTWC_srfWorkflowItem.js', '../data/oTWC_srfWorkflowStage.js', '../data/oTWC_srf.js', '../data/oTWC_site.js', '../O/oTWC_dialogEx.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_srfWorkflowEngine.js', '../data/oTWC_icons.js'],
    function (core, coreSql, recu, twcProfile, twcCompany, twcUtils, twcSrfWorkflow, twcSrfWorkflowItem, twcSrfWorkflowStage, twcSrf, twcSite, dialog, twcUi, twcSrfWorkflowEngine, twcIcons) {

        function getWorkFlow(options) {
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

            // @@TODO: use constants
            workflow.items = coreSql.run(`
                select  wi.id, ws.name as stage_name, ws.custrecord_twc_srf_wks_step_no step_no, ws.custrecord_twc_srf_wks_seq_no as seq_no,
                        wi.custrecord_twc_srf_wkfi_status as status, BUILTIN.DF(custrecord_twc_srf_wkfi_status) as status_name,
                        TO_CHAR(wi.custrecord_twc_srf_wkfi_planned, 'YYYY-MM-DD') as planned, TO_CHAR(wi.custrecord_twc_srf_wkfi_actual, 'YYYY-MM-DD') as actual,
                        custrecord_twc_srf_wkfi_cprofile as profile, BUILTIN.DF(custrecord_twc_srf_wkfi_cprofile) as profile_name
                from    customrecord_twc_srf_wkfi wi
                join    customrecord_twc_srf_wks ws on ws.id = wi.custrecord_twc_srf_wkfi_stage
                where   wi.custrecord_twc_srf_wkfi_parent = ${workflow.id}
                order by ws.custrecord_twc_srf_wks_step_no, ws.custrecord_twc_srf_wks_seq_no, wi.created
            `)


            return workflow;
        }

        class WorkflowFormItem {
            #item = null;
            #ui = null;
            #form = null;
            constructor(item) {
                this.#item = item;
            }

            render(callback) {
                this.#ui = jQuery(`<div></div>`);

                this.#ui.append(twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: 'planned_date', label: 'Planned', value: this.#item.planned }));
                this.#ui.append(twcUi.render({ type: twcUi.CTRL_TYPE.DATE, id: 'actual_date', label: 'Actual', value: this.#item.actual }));

                dialog.confirm({ title: 'manage item', message: this.#ui, width: '700px', height: '500px' }, dlg => {
                    try {
                        
                        callback(this.#item);
                    } catch (error) {
                        dialog.error(error);
                        return false;
                    }
                });
            }

            static open(item, callback) {
                var form = new WorkflowFormItem(item);
                form.render(callback);
            }
        }

        class WorkflowForm {
            #workflow = null;
            #ui = null;
            #uiTable = null;
            constructor(workflow) {
                this.#workflow = workflow;
            }

            render() {
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
                                
                                <span class="twc-record-status" style="width: auto; ${twcSrfWorkflowEngine.getStatusStyles(this.#workflow.status)}">${this.#workflow.status_name}</span>
                            </div>
                            <div class="twc-div-table-r" style="width: 40%; text-align: right;">
                                <div>
                                    <div><label style="margin: 0px;">Customer Planned Date</label></div>
                                    <div style="width: 120px">${this.#workflow.customer_planned_date || 'NA'}</div>
                                </div>
                                
                            </div>
                        </div>
                        <div id="srf-workflow-table">
                        </div>
                        <div id="srf-workflow-notes">
                            ${twcUi.render({ type: twcUi.CTRL_TYPE.TEXTAREA, id: 'srf-workflow-notes', label: 'Notes', value: this.#workflow.notes || '', width: '100%', rows: 7 })}
                        </div>
                    </div>
                `)

                this.#uiTable = jQuery(`
                    <table class="twc-table-b">
                        <thead>
                            <tr>
                                <th style="width: 25px;"></th>
                                <th style="width: 75px; text-align: center;">Step</th>
                                <th>Description</th>
                                <th style="width: 120px; text-align: center;">Planned</th>
                                <th style="width: 120px; text-align: center;">Actual</th>
                                <th style="width: 24px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                `)
                this.#ui.find('#srf-workflow-table').html(this.#uiTable);

                var tblBody = this.#uiTable.find('tbody');
                core.array.each(this.#workflow.items, (item, idx) => {

                    var editIcon = `<span class="edit-item" style="cursor: pointer;">${twcIcons.get('pencil', 16, 'green')}</span>`;
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.NEW && this.#workflow.items[idx - 1]?.status != twcSrfWorkflowEngine.WorkflowStatus.COMPLETED) { editIcon = ''; }

                    var plannedDateInput = `<input type="date" style="text-align: center;" id="date-planned-${item.id}" value="${item.planned || ''}" />`;
                    if (item.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.COMPLETED || this.#workflow.status == twcSrfWorkflowEngine.WorkflowStatus.CANCELLED) {
                        plannedDateInput = item.planned || '-';
                    }

                    var tableRow = jQuery(`
                        <tr style="${twcSrfWorkflowEngine.getItemStatusStyles(item.status)}">
                            <td></td>
                            <td style="text-align: center;">${item.step_no}</td>
                            <td>${item.stage_name}</td>
                            <td style="text-align: center;">
                                ${plannedDateInput}
                            </td>
                            <td style="text-align: center;">${item.actual || '-'}</td>
                            <td style="text-align: center;">${editIcon}</td>
                        </tr>
                    `);
                    tblBody.append(tableRow);

                    tableRow.find('.edit-item').click(async e => {
                        console.log(item);
                        WorkflowFormItem.open(item, () => {
                            console.log(item);
                        })
                    })
                })

                return this.#ui;
            }


            popUp() {
                if (!this.#ui) { this.render(); }

                dialog.open({ title: 'manage item', content: this.#ui, size: { width: '750px', height: '90vh' } });


            }
        }



        return {
            getForm: (options) => {
                return new WorkflowForm(getWorkFlow(options));
            }
        }
    });
