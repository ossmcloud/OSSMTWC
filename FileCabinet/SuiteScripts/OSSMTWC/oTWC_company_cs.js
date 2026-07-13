/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js','./data/oTWC_utils.js'],
    function (currentRecord, core, twcUtils) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())
        }

        function openCompany() {
            location.href = core.url.script('otwc_companyprofile_sl', { recId: currentRecord.get().id });
        }

        function fieldChanged(context) {
        if (context.fieldId === 'custrecord_twc_co_el_expiry' || context.fieldId === 'custrecord_twc_co_pl_expiry') {
            updateStatus(context.currentRecord, context.fieldId);
        }

            function updateStatus(currRec, field) {
                try {
                    var statusMapping = {
                        'custrecord_twc_co_el_expiry': 'custrecord_twc_co_el_status',
                        'custrecord_twc_co_pl_expiry': 'custrecord_twc_co_pl_status'
                    }
                    var expiryDate = currRec.getValue({ fieldId: field });
                    if (!expiryDate) {
                        return;
                    }
                    var expDate = new Date(expiryDate).setHours(0, 0, 0, 0);
                    var today = new Date().setHours(0, 0, 0, 0);

                    if (expDate < today) {
                        currRec.setValue({ fieldId: statusMapping[field], value: twcUtils.NoActiveExpired.Expired })
                    } else {
                        currRec.setValue({ fieldId: statusMapping[field], value: twcUtils.NoActiveExpired.Pending })
                    }
                }
                catch (error) {
                    log.error("Error @ updateStatus", error)
                }
            }
    }


        return {
            pageInit: pageInit,
            openCompany: openCompany,
            fieldChanged:fieldChanged
        }
    });


