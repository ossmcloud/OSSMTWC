/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['N/currentRecord', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './O/controls/oTWC_ui_ctrl.js', './data/oTWC_profile.js', './ui/js/oTWC_companyProfile.js', './data/oTWC_utils.js'],
    function (currentRecord, core, coreSQL, dialog, recu, twcUI, twcProfile, twcCompanyProfile, twcUtils) {

        function pageInit(context) {
            console.log('debug -------------> ')
        }

        function viewCertsHistory() {
            twcCompanyProfile.viewCertsHistory(currentRecord.get().id);
        }

        function openCompany() {
            location.href = core.url.script('otwc_companyprofile_sl', { recId: recu.lookUp(twcProfile.Type, currentRecord.get().id, twcProfile.Fields.COMPANY).value });
        }


        function saveRecord(context) {
            var errorMessages = ''; const TODAY = new Date();
            var rec = context.currentRecord;
            for (var k in twcUtils.Certs) {
                var cerStatus = rec.getValue(twcUtils.Certs[k].field);
                if (cerStatus == twcUtils.NoActiveExpired.No) { continue; }

                var value = rec.getValue({ fieldId: twcUtils.Certs[k].fieldEx });
                if (value) {
                    if (cerStatus == twcUtils.NoActiveExpired.Active || cerStatus == twcUtils.NoActiveExpired.Pending) {
                        if (value < TODAY) {
                            errorMessages += `<li><b>${rec.getField({ fieldId: twcUtils.Certs[k].fieldEx }).label}</b> must be in the future</li>`;            
                        }

                        
                    }
                } else {
                    errorMessages += `<li><b>${rec.getField({ fieldId: twcUtils.Certs[k].fieldEx }).label}</b> is mandatory</li>`;
                }
            }

            if (errorMessages) {
                dialog.error({ message: `<ul>${errorMessages}</ul>` });
                return false;
            }

            return true;

        }



        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            viewCertsHistory: viewCertsHistory,
            openCompany: openCompany
        }
    });


