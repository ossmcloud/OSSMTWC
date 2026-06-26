/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './O/controls/oTWC_ui_ctrl.js', './data/oTWC_company.js', './data/oTWC_file.js', './data/oTWC_utils.js', './ui/views/oTWC_baseView.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcUI, twcCompany, twcFile, twcUtils, twcBaseView) {

        function pageInit(context) {
            console.log('debug -------------> ')
        }

        async function approveFile() {
            var fileInfo = recu.lookUp(twcFile.Type, currentRecord.get().id, [twcFile.Fields.RECORD_ID, twcFile.Fields.FILE]);
            var preview = await twcBaseView.previewFile(fileInfo[twcFile.Fields.FILE].value, null, true);
            var html = jQuery(`
                <div class="twc-div-table-t" >
                    <div style="height: calc(90vh - 100px);">
                        ${preview}
                    </div>
                    <div style="width: 200px">
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, id: 'file-accept', value: 'Accept' })}
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, id: 'file-reject', value: 'Reject' })}
                    </div>
                </div>
            `);

            var ui = twcUI.init({}, html);
            dialog.message({
                title: 'Verify File',
                message: ui.ui,
                size: { width: '70%', height: '90vh' }
            })

            ui.on('click', e => {
                try {
                    var submitFields = []; var submitValues = [];
                    if (e.id == 'file-accept') {
                        if (!confirm('Are you sure you wish tp accept this insurance?')) { return; }
                        recu.submit(twcFile.Type, currentRecord.get().id, twcFile.Fields.STATUS, twcUtils.FileStatus.Received)

                    } else if (e.id == 'file-reject') {
                        if (!confirm('Are you sure you wish tp reject this insurance?')) { return; }
                        recu.submit(twcFile.Type, currentRecord.get().id, twcFile.Fields.STATUS, twcUtils.FileStatus.Rejected)
                    }

                    location.reload();
                } catch (error) {
                    dialog.error(error);
                }
            })

        }


        async function approveInsuranceFile() {

            var insuranceTypes = [
                {
                    value: 'EL',
                    text: 'EL Insurance',
                    fields: {
                        status: twcCompany.Fields.EL_STATUS,
                        exDate: twcCompany.Fields.EL_EXPIRY,
                    }
                },
                {
                    value: 'PL',
                    text: 'PL Insurance',
                    fields: {
                        status: twcCompany.Fields.PL_STATUS,
                        exDate: twcCompany.Fields.PL_EXPIRY,
                    }
                },
                {
                    value: 'PI',
                    text: 'PI Insurance',
                    fields: {
                        status: twcCompany.Fields.PI_STATUS,
                        exDate: twcCompany.Fields.PI_EXPIRY,
                    }
                }
            ];


            var fileInfo = recu.lookUp(twcFile.Type, currentRecord.get().id, [twcFile.Fields.RECORD_ID, twcFile.Fields.FILE]);
            var preview = await twcBaseView.previewFile(fileInfo[twcFile.Fields.FILE].value, null, true);
            var companyRecId = fileInfo[twcFile.Fields.RECORD_ID];
            var html = jQuery(`
                <div class="twc-div-table-t" >
                    <div style="height: calc(90vh - 100px);">
                        ${preview}
                    </div>
                    <div style="width: 500px">
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'insuranceType', label: 'Insurance Type', dataSource: insuranceTypes, multiSelect: true })}
                        <br />
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.DATE, id: 'insuranceExpiry', label: 'Expiry Date' })}
                        <br />
                        <br />
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.TABLE, dataSource: twcUtils.getCompanyInsuranceDetails(companyRecId), label: 'Current Insurance Details',
                            columns: [
                                { id: 'el_limit', title: 'EL Limit', styles: { 'text-wrap': 'auto' }, },
                                { id: 'pl_limit', title: 'PL Limit', styles: { 'text-wrap': 'auto' }, },
                                { id: 'pi_limit', title: 'PI Limit', styles: { 'text-wrap': 'auto' }, },
                                { id: 'el_expiry', title: 'EL Expiry', styles: { 'text-wrap': 'auto' }, },
                                { id: 'pl_expiry', title: 'PL Expiry', styles: { 'text-wrap': 'auto' }, },
                                { id: 'pi_expiry', title: 'PI Expiry', styles: { 'text-wrap': 'auto' }, },
                            ],
                         })}
                        <br />
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, id: 'file-accept', value: 'Accept' })}
                        ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, id: 'file-reject', value: 'Reject' })}
                    </div>
                </div>
            `);

            var ui = twcUI.init({}, html);
            dialog.message({
                title: 'Verify Insurance File',
                message: ui.ui,
                size: { width: '70%', height: '90vh' }
            })

            ui.on('click', e => {
                try {
                    var submitFields = []; var submitValues = [];
                    if (e.id == 'file-accept') {
                        var values = ui.getValues(true);
                        if (!values.insuranceType) { throw new Error('Please specify an insurance type'); }
                        if (!values.insuranceExpiry) { throw new Error('Please specify an insurance expiry date'); }

                        if (!confirm('Are you sure you wish tp accept this insurance?')) { return; }

                        // @@TODO: values.insuranceType is now an array of values
                        //              store values.insuranceType into file meta data as JSON.styringify
                        //              add fields to company table: (ALSO ON LIVE)
                        //                  EL Insurance File (type: document)
                        //                  PL Insurance File (type: document)
                        //                  PI Insurance File (type: document)
                        //              populate the relavant field with the file ID (the actual file id not the TWC File record id)
                        //              after save (either accepted or rejected) forward the user to the comapny page


                        submitFields.push(values.insuranceType.fields.status)
                        submitFields.push(values.insuranceType.fields.exDate)

                        submitValues.push(twcUtils.NoActiveExpired.Active);
                        submitValues.push(new Date(values.insuranceExpiry));;

                        recu.submit(twcCompany.Type, fileInfo[twcFile.Fields.RECORD_ID], submitFields, submitValues);
                        recu.submit(twcFile.Type, currentRecord.get().id, twcFile.Fields.STATUS, twcUtils.FileStatus.Received)

                    } else if (e.id == 'file-reject') {
                        if (!confirm('Are you sure you wish tp reject this insurance?')) { return; }
                        recu.submit(twcFile.Type, currentRecord.get().id, twcFile.Fields.STATUS, twcUtils.FileStatus.Rejected)
                    }

                    location.reload();
                } catch (error) {
                    dialog.error(error);
                }


            })

        }

        return {
            pageInit: pageInit,
            approveFile: approveFile,
            approveInsuranceFile: approveInsuranceFile
        }
    });


