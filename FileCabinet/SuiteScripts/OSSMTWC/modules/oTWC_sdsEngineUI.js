/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../O/oTWC_dialogEx.js', '../O/controls/oTWC_ui_ctrl.js', '../data/oTWC_utils.js', '../data/oTWC_srf.js', '../data/oTWC_sds.js', '../data/oTWC_file.js', '../data/oTWC_fileType.js', '../data/oTWC_site.js', './oTWC_sdsEngine.js'],
    function (core, coreSql, recu, dialog, twcUI, twcUtils, twcSrf, twcSds, twcFile, twcFileType, twcSite, twcSdsEngine) {

        function getDialogContent(srf) {

            var fibreProviders = coreSql.run(`select id as value, name as text from customrecord_twc_infra_fibre_svc_provide where isinactive ='F' order by name`);
            var agreementTemplates = coreSql.run(`
                select  id as value, custrecord_twc_agreement_template as text
                from    customrecord_twc_agreement
                where   isinactive ='F'
                and     custrecord_twc_agreement_customer = ${srf[twcSrf.Fields.CUSTOMER]}
                and     custrecord_twc_agreement_expiry > CURRENT_DATE
                and     custrecord_twc_agreement_date <= CURRENT_DATE
                order   by name`);

            var agreementSiteTypes = coreSql.run(`
                select  id as value, custrecord_twc_agreement_cond_name as text, 
                        custrecord_twc_agreement_cond_descr as description, BUILTIN.DF(custrecord_twc_agreement_cond_section) as sds_section,
                        custrecord_twc_agreement_cond_field_1 as field_1,
                        custrecord_twc_agreement_cond_field_2 as field_2,
                        custrecord_twc_agreement_cond_field_3 as field_3,
                        custrecord_twc_agreement_cond_field_4 as field_4,
                        custrecord_twc_agreement_cond_field_5 as field_5,
                        custrecord_twc_agreement_cond_field_6 as field_6,
                        custrecord_twc_agreement_cond_field_7 as field_7,
                        custrecord_twc_agreement_cond_field_8 as field_8,
                        custrecord_twc_agreement_cond_field_9 as field_9,
                        custrecord_twc_agreement_cond_field_10 as field_10,
                from    customrecord_twc_agreement_cond 
                where   isinactive ='F' 
                and     (
                       custrecord_twc_agreement_cond_cust_all = 'T'
                    or BUILTIN.MNFILTER(custrecord_twc_agreement_cond_cust , 'MN_INCLUDE', '', 'TRUE', ${srf[twcSrf.Fields.CUSTOMER]}) = 'T'
                )
                order by name
            `);

            var srfDrawingFiles = twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: twcSrf.Type,
                    [twcFile.Fields.RECORD_ID]: srf.id,
                    [twcFileType.Fields.DRAWING]: 'T'
                }
            });

            var drawingFiles = twcUtils.getFiles({
                filters: {
                    [twcFile.Fields.RECORD_TYPE]: twcSite.Type,
                    [twcFile.Fields.RECORD_ID]: srf[twcSrf.Fields.SITE],
                    [twcFileType.Fields.DRAWING]: 'T'
                }
            });

            return jQuery(`
                <div>
                    <div style=" display:flex; align-items:flex-start;">
                        <!-- LEFT COLUMN -->
                        <div style="flex:1;">
                            <div class="twc-div-table">
                                <div style="width: 150px;">
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'Commencement Date', id: twcSds.Fields.COMMENCMENT_DATE, mandatory: true })}
                                </div>
                                <div>
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, label: 'Drawing', dataSource: srfDrawingFiles, id: twcSds.Fields.DRAWING, width: 'calc(50% - 5px)' })}
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: 'Drawing Reference', id: twcSds.Fields.DRAWING_REFERENCE, mandatory: true, width: 'calc(50% - 5px)' })}
                                </div>
                                <div style="width: 130px;">
                                    <label>Include Licence Map</label>
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, label: '', id: twcSds.Fields.INCLUDE_LICENSE_MAP })}
                                </div>
                            </div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXTAREA, label: 'Additional SRF Conditions', id: twcSds.Fields.ADDITIONAL_SRF_CONIDITONS, mandatory: true, width: '100%', rows: 4 })}
                            </div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXTAREA, label: 'Power Supply Comments', id: twcSds.Fields.POWER_SUPPLY_COMMENTS, mandatory: true, width: '100%', rows: 4 })}
                            </div>
                        </div>

                        <!-- VERTICAL DIVIDER -->
                        <div style=" width:1px; background:#d0d0d0; min-height:295px; margin:0 10px;"></div>

                        <!-- RIGHT COLUMN -->
                        <div style="flex:1;">
                            <div class="twc-div-table">
                                <div style="width: 100px;">
                                    <label>Fibre Rights</label>
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, label: '', id: twcSds.Fields.FIBRE_RIGHTS })}
                                </div>
                                <div style="width: 200px;">
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, label: 'Fibre Provider', id: twcSds.Fields.FIBRE_PROVIDER, dataSource: fibreProviders, width: '100%' })}
                                </div>
                                <div>
                                    ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: 'Other Provider', id: twcSds.Fields.FIBRE_OTHER_PROVIDER, width: '100%', mandatory: true, hide: true })}
                                </div>
                            </div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, label: 'Fibre Duct Route', id: twcSds.Fields.FIBRE_DUCT_ROUTE, dataSource: drawingFiles, width: 'calc(50% - 5px)' })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: 'Drawing Reference', id: twcSds.Fields.FIBRE_DUCT_ROUTE_REFERENCE, width: 'calc(50% - 5px)' })}
                            </div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXTAREA, label: 'Notes / Conditions', id: twcSds.Fields.FIBRE_NOTES, width: '100%', rows: 7 })}
                            </div>
                        </div>
                    </div>

                    <hr style="margin:10px 0;" />

                    <div style="display:flex; align-items:flex-start;">
                        <!-- LEFT COLUMN -->
                        <div style="flex:1;">
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Previous Fee', id: twcSds.Fields.PREVIOUS_LICENSE_FEE })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Fee Reduction', id: twcSds.Fields.FEE_REDUCTION })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Fee Uplift', id: twcSds.Fields.FEE_UPLIFT })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'New Fee', id: twcSds.Fields.NEW_LICENSE_FEE })}
                            </div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXTAREA, label: 'Fee Change Breakdown', id: twcSds.Fields.FEE_CHARGE_BREAK_DOWN, mandatory: true, width: '100%', rows: 7 })}
                            </div>
                        </div>

                        <!-- DIVIDER -->
                        <div style=" width:1px; background:#d0d0d0; min-height:230px; margin:0 10px;"></div>
                        
                        <!-- RIGHT COLUMN -->
                        <div style="flex:1;">
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, label: 'Agreement Template', id: twcSds.Fields.AGREEMENT_TEMPLATE, mandatory: true, dataSource: agreementTemplates, width: '100%' })}
                            </div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Agreement Condition', id: twcSds.Fields.AGREEMENT_CONDITIONS, multiSelect: true, mandatory: true, dataSource: agreementSiteTypes, width: 'calc(100% - 35px)' })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, label: '', id: 'set-conditions', value: '...', width: '25px' })}
                            </div>

                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, label: 'Access Drawing', dataSource: drawingFiles, id: twcSds.Fields.ACCESS_DRAWING, width: 'calc(50% - 5px)' })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: 'Drawing Reference', id: twcSds.Fields.ACCESS_DRAWING_REFERENCE, width: 'calc(50% - 5px)' })}
                                
                            </div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, label: 'Fibre Drawing', dataSource: drawingFiles, id: twcSds.Fields.FIBRE_DRAWING, width: 'calc(50% - 5px)' })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: 'Drawing Reference', id: twcSds.Fields.FIBRE_DRAWING_REFERENCE, width: 'calc(50% - 5px)' })}
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }


        function openDialog(page, srf, callback) {
            var formData = twcSdsEngine.getSds(srf);
            var form = twcUI.init({}, getDialogContent(srf));

            form.getControl(twcSds.Fields.FIBRE_PROVIDER).on('change', e => {
                form.getControl(twcSds.Fields.FIBRE_OTHER_PROVIDER).visible = e.target.valueObj?.text.toLowerCase().indexOf('other') >= 0;
            })

            form.getControl(twcSds.Fields.FIBRE_RIGHTS).on('change', e => {
                form.getControl(twcSds.Fields.FIBRE_DUCT_ROUTE).disabled = !e.value;
                form.getControl(twcSds.Fields.FIBRE_DUCT_ROUTE_REFERENCE).disabled = !e.value;
                form.getControl(twcSds.Fields.FIBRE_PROVIDER).disabled = !e.value;
                form.getControl(twcSds.Fields.FIBRE_OTHER_PROVIDER).disabled = !e.value;
                form.getControl(twcSds.Fields.FIBRE_NOTES).disabled = !e.value;

                form.getControl(twcSds.Fields.FIBRE_DUCT_ROUTE).mandatory = e.value;
                form.getControl(twcSds.Fields.FIBRE_DUCT_ROUTE_REFERENCE).mandatory = e.value;
                form.getControl(twcSds.Fields.FIBRE_PROVIDER).mandatory = e.value;
                form.getControl(twcSds.Fields.FIBRE_OTHER_PROVIDER).mandatory = e.value;
                form.getControl(twcSds.Fields.FIBRE_NOTES).mandatory = e.value;
            })

            form.getControl(twcSds.Fields.INCLUDE_LICENSE_MAP).on('change', e => {
                form.getControl(twcSds.Fields.ACCESS_DRAWING).disabled = !e.value;
                form.getControl(twcSds.Fields.ACCESS_DRAWING_REFERENCE).disabled = !e.value;
                form.getControl(twcSds.Fields.FIBRE_DRAWING_REFERENCE).disabled = !e.value;
                form.getControl(twcSds.Fields.FIBRE_DRAWING).disabled = !e.value;

                form.getControl(twcSds.Fields.ACCESS_DRAWING).mandatory = e.value;
                form.getControl(twcSds.Fields.ACCESS_DRAWING_REFERENCE).mandatory = e.value;
                form.getControl(twcSds.Fields.FIBRE_DRAWING_REFERENCE).mandatory = e.value;
                form.getControl(twcSds.Fields.FIBRE_DRAWING).mandatory = e.value;
            })

            form.getControl(twcSds.Fields.DRAWING).on('change', e => {
                form.getControl(twcSds.Fields.DRAWING_REFERENCE).value = e.target.valueObj[twcFile.Fields.DESCRIPTION]
            });

            form.getControl(twcSds.Fields.ACCESS_DRAWING).on('change', e => {
                form.getControl(twcSds.Fields.ACCESS_DRAWING_REFERENCE).value = e.target.valueObj[twcFile.Fields.DESCRIPTION]
            });

            form.getControl(twcSds.Fields.AGREEMENT_CONDITIONS).on('change', e => {
                formData.set(twcSds.Fields.AGREEMENT_CONDITIONS_DATA, '')
            });
            form.getControl('set-conditions').on('click', e => {
                try {
                    manageAgreementConditions(form.getControl(twcSds.Fields.AGREEMENT_CONDITIONS).valueObj, formData)
                } catch (error) {
                    dialog.error(error);
                }
            })

            dialog.confirm({ title: 'SDS Pack Produce Info', message: form.ui, width: '1265px', height: '645px', }, (dlg) => {
                try {
                    
                    // @@NOTE: just to run mandatory validations
                    form.getValues();
                    // @@NOTE: SDS: make sure we have forms data
                    if (!formData.get(twcSds.Fields.AGREEMENT_CONDITIONS_DATA)) { throw new Error('Please, specify sds conditions values'); }

                    for (var k in formData.fields) {
                        var ctrl = form.getControl(formData.fields[k].name);
                        if (ctrl) {
                            if (ctrl.multiSelect) {
                                formData.set(formData.fields[k].name, ctrl.value.split(',').map(i => { return parseInt(i); }))   
                            } else {
                                formData.set(formData.fields[k].name, ctrl.value)
                            }
                        }
                    }
                    formData.save();
                    printSDS(page, srf);
                    if (callback) { callback(); }
                    return true;
                } catch (error) {
                    dialog.error(error);
                    return false;
                }
            });

            for (var k in formData.fields) {
                var ctrl = form.getControl(formData.fields[k].name);
                if (!ctrl) { continue; }
                var v = formData.get(formData.fields[k].name)
                if (formData.fields[k].type == 'date' && v) { v = v.format(); }
                if (ctrl.multiSelect) {
                    // @@IMPORTANT: we use set value because we do not want to fire the change event in this case
                    ctrl.setValue(v.join(','));
                } else {
                    ctrl.value = v;
                }
            }



        }

        function manageAgreementConditions(sdsConditions, sds) {
            if (!sdsConditions || sdsConditions.length == 0) { throw new Error('Please, specify a condition'); }
            var formData = sds.get(twcSds.Fields.AGREEMENT_CONDITIONS_DATA);
            // @@TODO: SDS: we should probably b64 this one
            formData = JSON.parse(formData || '{}');

            var formUi = jQuery(`<div></div>`);

            core.array.each(sdsConditions, sdsCondition => {
                var condForm = jQuery(`
                    <div>
                        <div style="font-size: 1em; font-weight: bold; border-bottom: 1px dotted silver; margin-bottom: 5px;">${sdsCondition.description}</div>
                        <div style="font-size: 0.75em; border-bottom: 1px solid silver; margin-bottom: 13px;">${sdsCondition.sds_section}</div>
                    </div>
                `);
                formUi.append(condForm);

                var condFormValues = jQuery(`<div class="twc-div-table-r"></div>`)
                condForm.append(condFormValues);

                for (var f = 1; f < 11; f++) {
                    var fId = `${sdsCondition.value}-field_${f}`;
                    var fName = sdsCondition[`field_${f}`];
                    if (!fName) { continue; }

                    condFormValues.append(`
                        <div>
                            <div>
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: fName, id: fId, width: '100%', mandatory: true, value: formData[fId] })}
                            </div>
                        </div>
                    `)
                }

            })

            var form = twcUI.init({}, formUi);

            dialog.confirm({ title: 'SDS Agreement Conditions', message: form.ui, width: '750px', height: '625px', }, (dlg) => {
                try {
                    formData = form.getValues();
                    // @@TODO: SDS: we should probably b64 this one
                    sds.set(twcSds.Fields.AGREEMENT_CONDITIONS_DATA, JSON.stringify(formData));

                    return true;

                } catch (error) {
                    dialog.error(error);
                    return false;
                }
            });

            //
        }

        function printSDS(page, srf, fromFile) {
            var popup = window.open(core.url.script('otwc_print_srf_sds_sl', { recId: srf.id, fromFile: (fromFile) ? 'T' : 'F' }), '_blank', 'width=750,height=900');
            if (!popup || popup.closed || typeof popup.closed === 'undefined') { alert('Popup was blocked. Please allow popups for this site.'); }

        }

        function signSDS(page, srf, isTL) {

            var disclaimer = "By clicking the 'Approve & Sign SDS' button, you (as an authorised representative of the Operator identified in the SDS) indicate that the Operator accepts the terms set out in this SDS and that it agrees to be contractually bound by this SDS (issued pursuant to the Master Services and Licence Agreement in place with Towercom Limited). If the Operator does not agree to these terms of the SDS, please cancel this process by clicking the 'Cancel' button.";
            var checkBox = `
                <div style="padding-top: 13px">
                    <label>Approve & Sign SDS</label>
                    ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'terms-and-cond-agreed' })}
                </div>
            `
            if (isTL) {
                disclaimer = 'By clicking "Ok" you are entering into a legally binding agreement';
                checkBox = '';
            }

            var html = jQuery(`
                    <div>
                        <label>Disclaimer</label>
                        ${disclaimer}
                    </div>
                    ${checkBox}
                `);

            var form = twcUI.init({}, html);

            dialog.confirm({ title: 'Sign SDS', message: html, size: { width: '550px', height: '400px' } }, dlg => {
                try {

                    if (!isTL) {
                        if (!form.getControl('terms-and-cond-agreed').value) { throw new Error('You need to check the "Approve & Sign SDS" toggle'); }
                    }

                    dialog.saving(dlg, 'signing document...<br />do not close the pop-up or refresh the page.');
                    page.post({ action: isTL ? 'sign-sds-tl' : 'sign-sds' }, { srf: srf.id })
                        .then(res => {
                            location.reload();
                        }).catch(err => {
                            dialog.savingError(dlg, err);
                        });

                    return false;
                } catch (error) {
                    dialog.error(error);
                    return false;
                }
            })
        }

        return {
            openDialog: openDialog,
            printSDS: printSDS,
            signSDS: signSDS,
            signSDSTL: function (page, srf) {
                signSDS(page, srf, true);
            }
        }
    });
