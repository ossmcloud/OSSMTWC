/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', './data/oTWC_utils.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js'],
    function (currentRecord, core, twcUtils, dialog) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())
        }

        function openCompany() {
            location.href = core.url.script('otwc_companyprofile_sl', { recId: currentRecord.get().id });
        }

        function saveRecord(context) {
            var errorMessages = ''; const TODAY = new Date();
            var rec = context.currentRecord;
            for (var k in twcUtils.Insurances) {
                var insStatus = rec.getValue(twcUtils.Insurances[k].field);
                if (insStatus != twcUtils.NoActiveExpired.Active) { continue; }

                var value = rec.getValue({ fieldId: twcUtils.Insurances[k].fieldEx });
                if (value) {
                    if (value < TODAY) {
                        errorMessages += `<li><b>${rec.getField({ fieldId: twcUtils.Insurances[k].fieldEx }).label}</b> must be in the future</li>`;
                    }
                } else {
                    errorMessages += `<li><b>${rec.getField({ fieldId: twcUtils.Insurances[k].fieldEx }).label}</b> is mandatory</li>`;
                }
            }

            if (errorMessages) {
                dialog.error({ message: `<ul>${errorMessages}</ul>` });
                return false;
            }

            return true;

        }

        // function fieldChanged(context) {
        //     if (context.fieldId === 'custrecord_twc_co_el_expiry' || context.fieldId === 'custrecord_twc_co_pl_expiry') {
        //         updateStatus(context.currentRecord, context.fieldId);
        //     }
        // }

        // function updateStatus(currRec, field) {
        //     try {
        //         var statusMapping = {
        //             'custrecord_twc_co_el_expiry': 'custrecord_twc_co_el_status',
        //             'custrecord_twc_co_pl_expiry': 'custrecord_twc_co_pl_status'
        //         }
        //         var expiryDate = currRec.getValue({ fieldId: field });
        //         if (!expiryDate) {
        //             return;
        //         }
        //         var expDate = new Date(expiryDate).setHours(0, 0, 0, 0);
        //         var today = new Date().setHours(0, 0, 0, 0);

        //         if (expDate < today) {
        //             currRec.setValue({ fieldId: statusMapping[field], value: twcUtils.NoActiveExpired.Expired })
        //         } else {
        //             currRec.setValue({ fieldId: statusMapping[field], value: twcUtils.NoActiveExpired.Pending })
        //         }
        //     }
        //     catch (error) {
        //         log.error("Error @ updateStatus", error)
        //     }
        // }


        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            openCompany: openCompany,
            // fieldChanged: fieldChanged
        }
    });


