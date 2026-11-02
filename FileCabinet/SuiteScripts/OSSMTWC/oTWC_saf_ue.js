/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'N/redirect', 'O/form', './data/oTWC_saf.js', './O/oTWC_themes_ue.js', './data/oTWC_config.js','SuiteBundles/Bundle 548734/O/data/rec.utils.js','N/email'],
    (file, runtime, core, redirect, oui, twcSaf, twcThemesUE, twcConfig, recu, email) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);
                form.f.clientScriptModulePath = './oTWC_saf_cs.js';
                form.fieldIdCount = 199;
                
                form.pageInitView('OSSMTWC', 'oTWC_saf');
                if (context.type == 'create') {
                    form.fieldHide(twcSaf.Fields.CONDITIONS_OF_ACCESS);
                } else if (context.type == 'edit') {
                    form.fieldHide(twcSaf.Fields.CONDITIONS_OF_ACCESS)

                } else if (context.type == 'view') {
                    var condOfAccess = form.fieldHtml(`
                        <div style="margin-left: -8px; margin-right: 8px; border: 1px solid var(--grid-color);">
                            <div style="padding: 6px; border-radius: 0px; background-color: var(--nsn-uif-refreshed-color-primary-lighter)">
                                Conditions of Access
                            </div>
                            ${context.newRecord.getValue(twcSaf.Fields.CONDITIONS_OF_ACCESS)}
                        </div>
                    `)

                    form.f.insertField({ field: condOfAccess.f, nextfield: twcSaf.Fields.CONDITIONS_OF_ACCESS });
                    form.fieldHide(twcSaf.Fields.CONDITIONS_OF_ACCESS);

                    form.buttonAdd('Open SAF', 'openSaf');

                    if (twcConfig.isPowerUser()) {
                        form.buttonAdd('Delete SAF', 'deleteSaf');
                    }
                }
            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }


        function afterSubmit(context) {
            try {
                if (context.type == context.UserEventType.DELETE) return

                let rec = context.newRecord
                let oldRec = context.oldRecord
                let oldStatus = oldRec.getValue({ fieldId: twcSaf.Fields.STATUS })
                let newStatus = rec.getValue({ fieldId: twcSaf.Fields.STATUS })
                let oldStatusText = oldRec.getText({ fieldId: twcSaf.Fields.STATUS })
                let newStatusText = rec.getText({ fieldId: twcSaf.Fields.STATUS })
                log.debug('oldStatusText..' + oldStatusText, 'newStatusText..' + newStatusText)

                if (String(oldStatus) === String(newStatus)) return

                let statuses = [twcSaf.Status.Approved, twcSaf.Status.Rejected, twcSaf.Status.Cancelled]

                if (statuses.indexOf(Number(newStatus)) == -1) return
                var safData = recu.lookUp(rec.type, rec.id, [twcSaf.Fields.SAF_AUTHOR, twcSaf.Fields.SAF_ID, twcSaf.Fields.NAME])
                let authorId = safData[twcSaf.Fields.SAF_AUTHOR].value
                if (!authorId) return

                var recipient = recu.lookUp('customrecord_twc_prof', authorId, ['custrecord_twc_prof_email', 'name'])
                log.debug('recipient..', recipient)

                let address = recipient.custrecord_twc_prof_email
                let recordRef = safData[twcSaf.Fields.SAF_ID] + ' ' + safData[twcSaf.Fields.NAME]
                if (Array.isArray(address)) address = address[0] && address[0].value
                if (!address) return

                email.send({
                    author: twcConfig.NO_REPLY,
                    recipients: address,
                    subject: 'SAF ' + newStatusText,
                    body: 'Dear ' + recipient.name + ',<br><br>The status of SAF record - ' + recordRef +
                        ' has changed from ' + (oldStatusText || 'Blank') +
                        ' to ' + newStatusText + '.'
                })

            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }

        }

        return {
            beforeLoad: beforeLoad,
            afterSubmit: afterSubmit

        }
    });
