/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../O/oTWC_dialogEx.js', '../O/controls/oTWC_ui_ctrl.js', '../data/oTWC_icons.js', '../data/oTWC_utils.js', '../data/oTWC_srf.js', '../data/oTWC_sds.js', '../data/oTWC_sdsEquipment.js', '../data/oTWC_file.js', '../data/oTWC_fileType.js', '../data/oTWC_site.js', './oTWC_sdsEngine.js'],
    function (core, coreSql, b64, recu, dialog, twcUI, twcIcons, twcUtils, twcSrf, twcSds, twcSdsEquipment, twcFile, twcFileType, twcSite, twcSdsEngine) {

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
                order by custrecord_twc_agreement_cond_sort, name
            `);

            var srfDrawingFiles = twcSdsEngine.getSrfDrawingFiles(srf.id);

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
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXTAREA, label: 'Additional SRF Conditions', id: twcSds.Fields.ADDITIONAL_SRF_CONIDITONS, mandatory: false, width: '100%', rows: 4 })}
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
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: 'Fibre Duct Route', id: twcSds.Fields.FIBRE_DUCT_ROUTE_REFERENCE, width: '100%' })}
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
                        </div>
                    </div>
                </div>
            `);
        }


        async function openDialog(page, srf, callback) {
            try {

                var resp = await page.post({ action: 'get-sds' }, srf)
                var formData = twcSds.get(resp.id);
                var form = twcUI.init({}, getDialogContent(srf));

                if (!resp.includeLicenseMap) {
                    form.getControl(twcSds.Fields.INCLUDE_LICENSE_MAP).ui.parent().parent().remove();
                }
                //if (formData[twcSds.F INCLUDE_LICENSE_MAP])

                form.getControl(twcSds.Fields.FIBRE_PROVIDER).on('change', e => {
                    form.getControl(twcSds.Fields.FIBRE_OTHER_PROVIDER).visible = e.target.valueObj && e.target.valueObj?.text.toLowerCase().indexOf('other') >= 0;
                })

                form.getControl(twcSds.Fields.FIBRE_RIGHTS).on('change', e => {
                    form.getControl(twcSds.Fields.FIBRE_DUCT_ROUTE_REFERENCE).disabled = !e.value;
                    form.getControl(twcSds.Fields.FIBRE_PROVIDER).disabled = !e.value;
                    form.getControl(twcSds.Fields.FIBRE_OTHER_PROVIDER).disabled = !e.value;
                    form.getControl(twcSds.Fields.FIBRE_NOTES).disabled = !e.value;

                    form.getControl(twcSds.Fields.FIBRE_DUCT_ROUTE_REFERENCE).mandatory = e.value;
                    form.getControl(twcSds.Fields.FIBRE_PROVIDER).mandatory = e.value;
                    form.getControl(twcSds.Fields.FIBRE_OTHER_PROVIDER).mandatory = e.value;
                    form.getControl(twcSds.Fields.FIBRE_NOTES).mandatory = e.value;
                })

                form.getControl(twcSds.Fields.DRAWING).on('change', e => {
                    if (!e.target.valueObj) { return; }
                    form.getControl(twcSds.Fields.DRAWING_REFERENCE).value = e.target.valueObj[twcFile.Fields.DESCRIPTION]
                });

                form.getControl(twcSds.Fields.AGREEMENT_CONDITIONS).on('change', e => {
                    formData.set(twcSds.Fields.AGREEMENT_CONDITIONS_DATA, '')
                    manageAgreementConditions(form.getControl(twcSds.Fields.AGREEMENT_CONDITIONS).valueObj, formData)
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
                                var v = ctrl.value;
                                if (ctrl.multiSelect) { v = v.split(',').map(i => { return parseInt(i); }); }
                                formData.set(formData.fields[k].name, v)
                            }
                        }
                        formData.save();
                        manageSDEquipment(page, srf, formData, callback);
                        // if (callback) { callback(); }
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

            } catch (error) {
                dialog.error(error);
            }


        }

        function manageAgreementConditions(sdsConditions, sds) {
            if (!sdsConditions || sdsConditions.length == 0) { throw new Error('Please, specify a condition'); }
            var formData = sds.get(twcSds.Fields.AGREEMENT_CONDITIONS_DATA);
            if (formData) {
                // @@NOTE: we try/catch to be backward compatible
                try {
                    formData = JSON.parse(b64.decode(formData) || '{}');
                } catch (error) {
                    formData = JSON.parse(formData || '{}');
                }
            }


            var formUi = jQuery(`<div></div>`);
            core.array.each(sdsConditions, sdsCondition => {
                var condForm = jQuery(`
                    <div style="border-bottom: 1px solid silver; padding-bottom: 13px; margin-bottom: 13px;">
                        <div style="font-size: 1em; font-weight: bold; margin-bottom: 5px; text-decoration: underline; color: var(--accent-fore-color);">${sdsCondition.sds_section}</div>
                        <div style="font-size: 0.75em;">${sdsCondition.description}</div>
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
            dialog.confirm({ title: 'SDS Agreement Conditions', message: form.ui, width: '750px', height: '675px', }, (dlg) => {
                try {
                    formData = form.getValues();
                    sds.set(twcSds.Fields.AGREEMENT_CONDITIONS_DATA, b64.encode(JSON.stringify(formData)));
                    return true;
                } catch (error) {
                    dialog.error(error);
                    return false;
                }
            });

        }

        // @@NOTE: escape a value written into an html attribute (e.g. a description with a quote: 19" Rack)
        const escAttr = (v) => {
            if (v === null || v === undefined) { return ''; }
            return v.toString().replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        }

        async function manageSDEquipment(page, srf, sds, callback) {
            //
            var resp = await page.post({ action: 'get-sds-equipment' }, { id: sds.id });

            var form = jQuery('<div></div>');

            var sdsEqTable = jQuery(`
                <div class="twc-div-table-r twc-div-table-rh">
                    <div>
                        <div style="width: 30px; text-align: center; padding: 0px;"><span class="twc-srf-item-expand-all" data-collapsed="false">-</span></div>
                        <div class="twc-sds-eq-sort" data-sort="equipment">Equipment<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="srf">SRF #<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="part" style="text-align: center;">Part of<br />SDS<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="include" style="text-align: center;">Include<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="infra">Infrastructure ID<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="class">Class<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="type">Type<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="makeModel">Make / Model<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="description" style="min-width: 200px;">Description<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="bEnd">B-End<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="install">Install Status<span class="twc-sds-eq-sort-dir"></span></div>
                        <div class="twc-sds-eq-sort" data-sort="licence">Licence Status<span class="twc-sds-eq-sort-dir"></span></div>
                    </div>
                </div>
            `);
            sdsEqTable.find('.twc-sds-eq-sort').css({ cursor: 'pointer', 'user-select': 'none' });
            form.append(sdsEqTable);

            // @@NOTE: parent / child: the server returns the equipment already ordered (parent followed by its children, see twcSdsEngine.getSdsEquipments)
            //         each parent (child_level = 0) starts a group, children are tagged with the group id and can be collapsed (via 'o-row-hidden')
            var srfLinkBase = core.url.script('otwc_spacerequest_sl');
            var groupId = 0;
            var sdsEqRows = [];
            core.array.each(resp.data, eq => {
                var isChild = eq.child_level > 0;
                if (!isChild) { groupId++; }
                var eqIdStyle = isChild ? `style="padding-left: ${27 * eq.child_level}px; font-style: italic;"` : '';
                var srfLink = eq.srf_id ? `<a href="${srfLinkBase}&recId=${eq.srf_id}" target="_blank">${eq.srf_name || eq.srf_id}</a>` : '';
                var sdsEqTableRow = jQuery(`
                    <div class="${isChild ? 'twc-sds-eq-child' : 'twc-sds-eq-header'}" data-sds-eq-group="${groupId}">
                        <div class="twc-sds-eq-toggle" style="width: 30px; text-align: center; padding: 0px;"></div>
                        <div ${eqIdStyle}>${eq[twcSdsEquipment.Fields.EQUIPMENT_ID]}</div>
                        <div>${srfLink}</div>
                        <div style="text-align: center;">
                            ${eq[twcSdsEquipment.Fields.PART_OF_SDS] == 'T' ? twcIcons.get('checkBox', 16) : ''}
                        </div>
                        <div style="text-align: center;">
                            <input type="checkbox" id="${twcSdsEquipment.Fields.INCLUDE_IN_SDS}" style="transform: scale(1.5);" ${eq[twcSdsEquipment.Fields.INCLUDE_IN_SDS] == 'T' ? 'checked' : ''} />
                        </div>
                        <div>${eq.infra_id || ''}</div>
                        <div>${eq[twcSdsEquipment.Fields.EQUIPMENT_CLASS + '_name']}</div>
                        <div>${eq[twcSdsEquipment.Fields.EQUIPMENT_TYPE + '_name']}</div>
                        <div>${[eq[twcSdsEquipment.Fields.MAKE], eq[twcSdsEquipment.Fields.MODEL]].filter(v => { return v; }).join(' / ')}</div>
                        <!-- @@NOTE: editable description (printed on the SDS), saved on change like the other inputs of the row -->
                        <div><input type="text" class="twc" id="${twcSdsEquipment.Fields.DESCRIPTION}" style="width: 100%;" value="${escAttr(eq[twcSdsEquipment.Fields.DESCRIPTION])}" /></div>
                        <div>${eq[twcSdsEquipment.Fields.B_END] || ''}</div>
                        <div>${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, id: twcSdsEquipment.Fields.INSTALL_STATUS, value: eq[twcSdsEquipment.Fields.INSTALL_STATUS], dataSource: twcUtils.EqInstallStatus.lookUp(), noEmpty: true, width: '100%' })}</div>
                        <div>${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, id: twcSdsEquipment.Fields.LICENSE_STATUS, value: eq[twcSdsEquipment.Fields.LICENSE_STATUS], dataSource: twcUtils.EqLicenseStatus.lookUp(), noEmpty: true, width: '100%' })}</div>
                    </div>
                `);
                sdsEqTable.append(sdsEqTableRow);
                sdsEqRows.push({ eq: eq, row: sdsEqTableRow });

                sdsEqTableRow.find('input, select').change(async e => {
                    var input = jQuery(e.currentTarget);
                    var wait = jQuery(twcIcons.wait());
                    try {
                        input.css('display', 'none');
                        input.parent().append(wait);

                        var val = input.val();
                        if (input.attr('type') == 'checkbox') {
                            val = input.is(':checked');
                        }

                        var payload = { id: eq.id, field: input.attr('id'), value: val };
                        await page.post({ action: 'update-sds-equipment' }, payload);

                        // @@NOTE: include on a parent (TME / GIE) applies to all its children (ATME / Feeders), each child can then be changed on its own
                        //         (the include change event of each child saves it)
                        if (payload.field == twcSdsEquipment.Fields.INCLUDE_IN_SDS && sdsEqTableRow.hasClass('twc-sds-eq-header')) {
                            sdsEqTable.find(`.twc-sds-eq-child[data-sds-eq-group="${sdsEqTableRow.data('sds-eq-group')}"] input[id="${twcSdsEquipment.Fields.INCLUDE_IN_SDS}"]`).each((idx, el) => {
                                var childInclude = jQuery(el);
                                if (childInclude.is(':checked') != val) { childInclude.prop('checked', val).trigger('change'); }
                            });
                        }

                        // @@NOTE: equipment set to licence status Draft or Unlicenced is not included (the include change event saves it)
                        if (payload.field == twcSdsEquipment.Fields.LICENSE_STATUS && [twcUtils.EqLicenseStatus.Draft, twcUtils.EqLicenseStatus.Unlicenced].indexOf(parseInt(val)) >= 0) {
                            var include = sdsEqTableRow.find(`input[id="${twcSdsEquipment.Fields.INCLUDE_IN_SDS}"]`);
                            if (include.is(':checked')) { include.prop('checked', false).trigger('change'); }
                        }

                    } catch (error) {
                        dialog.error(error);
                    } finally {
                        input.css('display', 'inline-block');
                        wait.remove();
                    }


                })
            })

            initSDEquipmentSort(sdsEqTable, sdsEqRows);

            // @@NOTE: only parents that actually have children get the +/- toggle (expanded by default)
            sdsEqTable.find('.twc-sds-eq-header').each((idx, el) => {
                var header = jQuery(el);
                if (sdsEqTable.find(`.twc-sds-eq-child[data-sds-eq-group="${header.data('sds-eq-group')}"]`).length > 0) {
                    header.find('.twc-sds-eq-toggle').html(`<span class="twc-srf-item-expand" data-collapsed="false">-</span>`);
                }
            });

            sdsEqTable.find('.twc-srf-item-expand').click(e => {
                e.preventDefault();
                e.stopPropagation();
                var toggle = jQuery(e.currentTarget);
                var collapse = !(toggle.data('collapsed') || false);
                toggle.data('collapsed', collapse);
                toggle.html(collapse ? '+' : '-');
                var group = toggle.closest('.twc-sds-eq-header').data('sds-eq-group');
                sdsEqTable.find(`.twc-sds-eq-child[data-sds-eq-group="${group}"]`).toggleClass('o-row-hidden', collapse);
            });

            sdsEqTable.find('.twc-srf-item-expand-all').click(e => {
                e.preventDefault();
                e.stopPropagation();
                var toggle = jQuery(e.currentTarget);
                var collapse = !(toggle.data('collapsed') || false);
                toggle.data('collapsed', collapse);
                toggle.html(collapse ? '+' : '-');
                sdsEqTable.find('.twc-srf-item-expand').data('collapsed', collapse).html(collapse ? '+' : '-');
                sdsEqTable.find('.twc-sds-eq-child').toggleClass('o-row-hidden', collapse);
            });

            dialog.confirm({ title: 'SDS Equipments', message: form, width: '80%', height: '80vh', }, (dlg) => {
                try {
                    printSDS(page, srf);
                    if (callback) { callback(); }
                    return true;
                } catch (error) {
                    dialog.error(error);
                    return false;
                }
            });


        }

        // @@NOTE: column sorting on the SDS Equipments dialog
        //         rows are kept as a tree (built from the server order using child_level): parents are sorted, children are sorted within their parent
        //         clicking a column cycles: ascending => descending => original order (SRF, see twcSdsEngine.getSdsEquipments)
        //         empty values always go last, ties keep the original order
        //         Include / Install Status / Licence Status sort on the current (possibly just changed) value on screen
        function initSDEquipmentSort(sdsEqTable, sdsEqRows) {
            const selectedText = (row, field) => { return row.find(`select[id="${field}"] option:selected`).text(); };
            const SORT_VALUES = {
                equipment: (eq, row) => { return eq[twcSdsEquipment.Fields.EQUIPMENT_ID]; },
                srf: (eq, row) => { return parseInt(eq.srf_id) || null; },
                part: (eq, row) => { return eq[twcSdsEquipment.Fields.PART_OF_SDS] == 'T' ? 1 : 0; },
                include: (eq, row) => { return row.find(`input[id="${twcSdsEquipment.Fields.INCLUDE_IN_SDS}"]`).is(':checked') ? 1 : 0; },
                infra: (eq, row) => { return eq.infra_id; },
                class: (eq, row) => { return eq[twcSdsEquipment.Fields.EQUIPMENT_CLASS + '_name']; },
                type: (eq, row) => { return eq[twcSdsEquipment.Fields.EQUIPMENT_TYPE + '_name']; },
                makeModel: (eq, row) => { return [eq[twcSdsEquipment.Fields.MAKE], eq[twcSdsEquipment.Fields.MODEL]].filter(v => { return v; }).join(' / '); },
                description: (eq, row) => { return row.find(`input[id="${twcSdsEquipment.Fields.DESCRIPTION}"]`).val(); },
                bEnd: (eq, row) => { return eq[twcSdsEquipment.Fields.B_END]; },
                install: (eq, row) => { return selectedText(row, twcSdsEquipment.Fields.INSTALL_STATUS); },
                licence: (eq, row) => { return selectedText(row, twcSdsEquipment.Fields.LICENSE_STATUS); },
            };

            // @@NOTE: build the tree (server order is depth first: parent followed by its children)
            var roots = [];
            var path = [];
            core.array.each(sdsEqRows, (sdsEqRow, idx) => {
                var level = parseInt(sdsEqRow.eq.child_level) || 0;
                var node = { eq: sdsEqRow.eq, row: sdsEqRow.row, idx: idx, children: [] };
                path.length = level;
                var parent = path[level - 1];
                if (parent) { parent.children.push(node); } else { roots.push(node); }
                path[level] = node;
            });

            const isEmpty = (v) => { return v === null || v === undefined || v === ''; };
            const compare = (a, b, sortKey, dir) => {
                if (sortKey) {
                    var va = SORT_VALUES[sortKey](a.eq, a.row);
                    var vb = SORT_VALUES[sortKey](b.eq, b.row);
                    if (isEmpty(va) && !isEmpty(vb)) { return 1; }
                    if (!isEmpty(va) && isEmpty(vb)) { return -1; }
                    if (!isEmpty(va) && !isEmpty(vb)) {
                        var res = (typeof va == 'number' && typeof vb == 'number')
                            ? va - vb
                            : String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
                        if (res != 0) { return res * dir; }
                    }
                }
                return a.idx - b.idx;
            };
            const sortNodes = (nodes, sortKey, dir) => {
                nodes.sort((a, b) => { return compare(a, b, sortKey, dir); });
                core.array.each(nodes, n => { sortNodes(n.children, sortKey, dir); });
            };
            // @@NOTE: re-appending moves the existing rows (events, values and collapsed state are kept)
            const appendNodes = (nodes) => {
                core.array.each(nodes, n => {
                    sdsEqTable.append(n.row);
                    appendNodes(n.children);
                });
            };

            var currentKey = null;
            var currentDir = 0;
            sdsEqTable.find('.twc-sds-eq-sort').click(e => {
                var sortKey = jQuery(e.currentTarget).data('sort');
                if (sortKey != currentKey) {
                    currentKey = sortKey;
                    currentDir = 1;
                } else if (currentDir == 1) {
                    currentDir = -1;
                } else {
                    currentKey = null;
                    currentDir = 0;
                }

                sdsEqTable.find('.twc-sds-eq-sort-dir').html('');
                if (currentKey) {
                    jQuery(e.currentTarget).find('.twc-sds-eq-sort-dir').html(currentDir == 1 ? ' &#9650;' : ' &#9660;');
                }

                sortNodes(roots, currentKey, currentDir);
                appendNodes(roots);
            });
        }

        function printSDS(page, srf, fromFile) {
            var popup = window.open(core.url.script('otwc_print_srf_sds_sl', { recId: srf.id, fromFile: (fromFile) ? 'T' : 'F' }), '_blank', 'width=750,height=900');
            if (!popup || popup.closed || typeof popup.closed === 'undefined') { alert('Popup was blocked. Please allow popups for this site.'); }

        }

        async function signSDS(page, srf, isTL) {
            try {

                var twcFile = await page.post({ action: 'get-sds-twc-file' }, { srf: srf.id })
                var preview = await page.previewFile(twcFile, null, true);

                var disclaimer = "By clicking the 'Approve & Sign SDS' button, you (as an authorised representative of the Operator identified in the SDS) indicate that the Operator accepts the terms set out in this SDS and that it agrees to be contractually bound by this SDS (issued pursuant to the Master Services and Licence Agreement in place with Towercom Limited). If the Operator does not agree to these terms of the SDS, please cancel this process by clicking the 'Cancel' button.";
                var checkBox = `
                    <div style="padding-top: 13px">
                        <label>Approve & Sign SDS</label>
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'terms-and-cond-agreed' })}
                    </div>
                `

                var signedByOperator = '';
                if (isTL) {
                    checkBox = '';
                    disclaimer = 'By clicking "Ok" you are entering into a legally binding agreement';
                    signedByOperator = `
                        <div>
                            <label>Signed by</label>
                             ${srf.pack_sign_by_name} on ${srf.pack_sign_by_date}
                        </div>
                    `
                }

                var html = jQuery(`
                    <div class="twc-div-table-t" >
                        <div style="height: calc(90vh - 100px);">
                            ${preview}
                        </div>
                        <div style="width: 550px">
                            ${signedByOperator}
                            <div>
                                <label>Disclaimer</label>
                                ${disclaimer}
                            </div>
                            ${checkBox}
                        </div>
                    </div>
                `);

                var form = twcUI.init({}, html);
                dialog.confirm({ title: 'Sign SDS', message: html, size: { width: '70%', height: '90vh' } }, dlg => {
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
            } catch (error) {
                dialog.error(error);
            }

        }

        // @@NOTE: developer only (Test button on the SRF workflow view): opens the SDS Equipments dialog directly
        //         goes through 'get-sds' like openDialog so the sds equipment records are created / updated (setSdsEquipments)
        async function testSDSEquipment(page, srf) {
            try {
                var resp = await page.post({ action: 'get-sds' }, srf);
                if (!resp?.id) { throw new Error('No SDS found for this SRF'); }
                await manageSDEquipment(page, srf, { id: resp.id });
            } catch (error) {
                dialog.error(error);
            }
        }

        return {
            openDialog: openDialog,
            testSDSEquipment: testSDSEquipment,
            printSDS: printSDS,
            signSDS: signSDS,
            signSDSTL: function (page, srf) {
                signSDS(page, srf, true);
            }
        }
    });
