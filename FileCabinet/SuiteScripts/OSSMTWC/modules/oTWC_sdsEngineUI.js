/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../O/oTWC_dialogEx.js', '../O/controls/oTWC_ui_ctrl.js', '../data/oTWC_utils.js', '../data/oTWC_srf.js'],
    function (core, coreSql, recu, dialog, twcUI, twcUtils, twcSrf) {

        function getDialogContent() {

            var fibreProviders = coreSql.run(`select id as value, name as text from customrecord_twc_infra_fibre_svc_provide where isinactive ='F' order by name`);

            return jQuery(`
                <div style="padding:15px;">
                    <div style=" display:flex; align-items:flex-start;">
                        <!-- LEFT COLUMN -->
                        <div style="flex:1;">
                            <div style="margin-bottom:12px;">
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.TEXT, label: 'Drawing Reference', id: 'drawingReference', width: '100%'})}
                            </div>

                            <div style="margin-bottom:12px;">
                                <label>Include Licence Map</label>
                                <div>
                                    <span><input type="radio" name="includeLicenceMap" value="T" checked /> Yes </span>
                                    <sapn style="margin-left:15px;"> <input type="radio" name="includeLicenceMap" value="F" /> No </sapn>
                                </div>
                            </div>

                            
                            <div style="margin-bottom:12px;">
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.DATE, label: 'Commencement Date', id: 'commencementDate', mandatory: true })}
                            </div>

                            <div style="margin-bottom:12px;">
                                <label>Additional SRF Conditions</label>
                                <textarea id="additionalSrfConditions" style="width:100%;height:80px;"></textarea>
                            </div>

                            <div>
                                <label>Power Supply Comments</label>
                                <textarea id="powerSupplyComments" style="width:100%;height:80px;"></textarea>
                            </div>
                        </div>
                        <!-- VERTICAL DIVIDER -->
                        <div style=" width:1px; background:#d0d0d0; min-height:475px; margin:0 20px;"></div>

                        <!-- RIGHT COLUMN -->
                        <div style="flex:1;">

                            <div style="margin-bottom:12px;">
                                <label>Fibre Rights</label>
                                <div>
                                    <sapn><input type="radio" name="fibreRights" value="T" checked /> Yes </sapn>
                                    <sapn style="margin-left:15px;"><input type="radio" name="fibreRights" value="F" /> No </sapn>
                                </div>
                            </div>

                            <div style="margin-bottom:12px;">
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, label: 'Fibre Provider', id: 'fibreProvider', dataSource: fibreProviders })}
                            </div>
                            <div style="margin-bottom:12px;">
                                <label>Other Provider</label>
                                <input id="otherProvider" type="text" class="twc" style="width:100%;" />
                            </div>
                            <div style="margin-bottom:12px;">
                                <label>Fibre Duct Route</label>
                                <input id="fibreDuctRoute" type="text" class="twc" style="width:100%;" />
                            </div>
                            <div>
                                <label>Notes / Conditions</label>
                                <textarea id="notesConditions" style="width:100%;height:170px;"></textarea>
                            </div>
                        </div>
                    </div>
                    <hr style="margin:25px 0;" />
                    <div style="display:flex; align-items:flex-start;">
                        <!-- LEFT COLUMN -->
                        <div style="flex:1;">
                            <div style="margin-bottom:12px;">
                                <label>Previous Licence Fee</label>
                                <div style="display:flex; align-items:center;">
                                    <input id="previousLicenceFee" type="number" class="twc" style="flex:1; border-top-right-radius:0; border-bottom-right-radius:0;" />
                                    <input type="text" value="€" disabled style=" width:30px; height:34px;  text-align:center; border-radius:3px" />
                                </div>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label>Fee Reduction</label>
                                <div style="display:flex; align-items:center;">
                                    <input id="feeReduction" type="number" class="twc" style="width:100%;" />
                                    <input type="text" value="€" disabled style=" width:30px; height:34px;  text-align:center; border-radius:3px" />
                                </div>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label>Fee Uplift</label>
                                <div style="display:flex; align-items:center;">
                                    <input id="feeUplift" type="number" class="twc" style="width:100%;" />
                                    <input type="text" value="€" disabled style=" width:30px; height:34px;  text-align:center; border-radius:3px" />
                                </div>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label>New Licence Fee</label>
                                <div style="display:flex; align-items:center;">
                                    <input id="newLicenceFee" type="number" class="twc" style="width:100%;" />
                                    <input type="text" value="€" disabled style=" width:30px; height:34px;  text-align:center; border-radius:3px" />
                                </div>
                            </div>
                            <div>
                                <label>Fee Change Breakdown</label>
                                <textarea id="feeChangeBreakdown" style="width:100%;height:80px;"></textarea>
                            </div>
                        </div>
                        <!-- DIVIDER -->
                        <div style=" width:1px; background:#d0d0d0; min-height:320px; margin:0 20px;"></div>
                        <!-- RIGHT COLUMN -->
                        <div style="flex:1;">
                            <div style="margin-bottom:12px;">
                                <label>Agreement Template</label>
                                <select id="agreementTemplate" class="twc" style="width:100%;">
                                    <option value="VF MSLA">VF MSLA</option>
                                    <option value="VF SDS">VF SDS</option>
                                    <option value="Tower Lease">Tower Lease</option>
                                </select>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label>Site Type</label>
                                <select id="siteType" class="twc" multiple style="width:100%;height:100px;">
                                    <option>AirSpeed Schools</option>
                                    <option>AirFibre Hub</option>
                                    <option>AirFibre Yr1 Discount</option>
                                    <option>Imagine (LTE upgrade)</option>
                                    <option>VF SDS</option>
                                </select>
                            </div>

                            <div style="margin-bottom:12px;">
                                <label>Access Drawing</label>
                                <input id="accessDrawing" type="text" class="twc" style="width:100%;" />
                            </div>
                            <div style="margin-bottom:12px;">
                                <label>Fibre Drawing</label>
                                <input id="fibreDrawing" type="text" class="twc" style="width:100%;" />
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:20px; text-align:center; width:100%;">
                        <a href="#" id="previewSds" style="text-decoration:none;"> Preview SDS</a>
                    </div>
                </div>
            `);
        }


        function openDialog(page, srf, callback) {

            const srfInfo = coreSql.first(`
                select  ${twcSrf.Fields.SDS_FORM_DATA} as form_data
                from    ${twcSrf.Type}
                where   id = ${srf.id}
            `);

            var formData = JSON.parse(srfInfo?.form_data || '{}');
            

            const content = getDialogContent(srf);

            for (var k in formData) {
                content.find(`#${k}`).val(formData[k]);
            }

            dialog.confirm({ title: 'SDS/SRF Pack Produced Check', message: content, width: '75%', height: '70hv', }, (dlg) => {
                const getValue = selector => content.find(selector).val()?.trim() || '';
                const getRadioValue = name => content.find(`input[name="${name}"]:checked`).val() || '';
                const values = {
                    drawingReference: getValue('#drawingReference'),
                    includeLicenceMap: getRadioValue('includeLicenceMap'),
                    commencementDate: getValue('#commencementDate'),
                    additionalSrfConditions: getValue('#additionalSrfConditions'),
                    powerSupplyComments: getValue('#powerSupplyComments'),

                    fibreRights: getRadioValue('fibreRights'),
                    fibreProvider: getValue('#fibreProvider'),
                    otherProvider: getValue('#otherProvider'),
                    fibreDuctRoute: getValue('#fibreDuctRoute'),
                    notesConditions: getValue('#notesConditions'),

                    previousLicenceFee: Number(getValue('#previousLicenceFee')) || 0,
                    feeReduction: Number(getValue('#feeReduction')) || 0,
                    feeUplift: Number(getValue('#feeUplift')) || 0,
                    newLicenceFee: Number(getValue('#newLicenceFee')) || 0,
                    feeChangeBreakdown: getValue('#feeChangeBreakdown'),

                    agreementTemplate: getValue('#agreementTemplate'),
                    siteType: content.find('#siteType').val() || [],
                    accessDrawing: getValue('#accessDrawing'),
                    fibreDrawing: getValue('#fibreDrawing')
                };

                recu.submit(twcSrf.Type, srf.id, twcSrf.Fields.SDS_FORM_DATA, JSON.stringify(values));

                printSDS(page, srf);

                if (callback) { callback(); }

            });
        }


        function printSDS(page, srf) {
            // @@TODO: user core.url
            var popup = window.open(`/app/site/hosting/scriptlet.nl?script=customscript_otwc_print_srf_sds_sl&deploy=1&recId=${srf.id}`, '_blank', 'width=750,height=900');
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                alert('Popup was blocked. Please allow popups for this site.');
            }

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
