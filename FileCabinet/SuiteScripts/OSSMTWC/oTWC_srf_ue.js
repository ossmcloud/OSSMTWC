/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'N/redirect', 'O/form', './data/oTWC_srf.js', './O/oTWC_themes_ue.js', './data/oTWC_config.js','SuiteBundles/Bundle 548734/O/data/rec.utils.js','N/email',  'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (file, runtime, core, redirect, oui, twcSrf, twcThemesUE, twcConfig, recu, email, coreSQL) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);
                form.f.clientScriptModulePath = './oTWC_srf_cs.js';
                form.fieldIdCount = 199;
                
                form.pageInitView('OSSMTWC', 'oTWC_srf');
                if (context.type == 'view') {
                    

                    form.buttonAdd('Open SRF', 'openSrf');
                    if (twcConfig.isPowerUser()) {
                        form.buttonAdd('Delete SRF', 'deleteSrf');
                    }
                }
            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
                if (core.me()){throw error}
            }
        }


        function afterSubmit(context) {
            try {
                if (context.type == context.UserEventType.DELETE || !context.oldRecord) return

                let rec = context.newRecord
                let oldRec = context.oldRecord
                let oldStatus = oldRec.getValue({ fieldId: twcSrf.Fields.SRF_STATUS })
                let newStatus = rec.getValue({ fieldId: twcSrf.Fields.SRF_STATUS })
                log.debug("newStatus", newStatus)

                if (String(oldStatus) === String(newStatus)) return

                let oldStatusText = oldRec.getText({ fieldId: twcSrf.Fields.SRF_STATUS })
                let newStatusText = rec.getText({ fieldId: twcSrf.Fields.SRF_STATUS })
                let status = Number(newStatus)

                if ([twcSrf.Status.FeedbackIssued, twcSrf.Status.SRFApproved, twcSrf.Status.SRFCancelled].indexOf(status) !== -1) {
                    sendSrfRequestorEmail(rec, oldStatusText, newStatusText)
                } else if ([twcSrf.Status.LicenceIssued, twcSrf.Status.LicenceExecuted].indexOf(status) !== -1) {
                    sendSignatoryEmail(rec, oldStatusText, newStatusText)
                }
            } catch (error) {
                core.logDebug('SRF AFTER-SUBMIT', error.message)
            }
        }

        function sendSrfRequestorEmail(rec, oldStatusText, newStatusText) {
            try {
                let srfData = recu.lookUp(rec.type, rec.id, [twcSrf.Fields.SRF_SUBMITTED_BY, twcSrf.Fields.NAME])

                let submitter = srfData[twcSrf.Fields.SRF_SUBMITTED_BY]
                let submitterId = submitter && (submitter.value || submitter)

                if (!submitterId) return

                let profileData = recu.lookUp('customrecord_twc_prof', submitterId, ['custrecord_twc_prof_email', 'name'])

                let recipient = profileData.custrecord_twc_prof_email
                let recipientName = profileData.name
                log.debug('recipient..', recipient)

                if (!recipient) return

                let recordRef = srfData[twcSrf.Fields.NAME]

                email.send({
                    author: twcConfig.NO_REPLY,
                    recipients: recipient,
                    subject: 'SRF ' + newStatusText,
                    body: 'Dear ' + recipientName + ',<br><br>The status of SRF record - ' + recordRef +
                        ' has changed from ' + (oldStatusText || 'Blank') +
                        ' to ' + newStatusText + '.'
                })
            } catch (error) {
                core.logDebug('SRF REQUESTOR EMAIL', error.message)
            }
        }

        function sendSignatoryEmail(rec, oldStatusText, newStatusText) {
            try {
                let srfData = recu.lookUp(rec.type, rec.id, [twcSrf.Fields.CUSTOMER, twcSrf.Fields.NAME])

                let company = srfData[twcSrf.Fields.CUSTOMER]
                let companyId = company && (company.value || company)

                log.debug('srfData', srfData)
                if (!companyId) return

                let rows = coreSQL.run(`SELECT custrecord_twc_prof_email AS email,
                                name AS name
                                FROM customrecord_twc_prof 
                                WHERE custrecord_twc_prof_company = ${companyId}
                                AND BUILTIN.DF(custrecord_twc_prof_co_desig_cont) like '%Signatory%'
                                AND custrecord_twc_prof_email IS NOT NULL`)
                log.debug('rows', rows)

                let recipients = []

                rows.forEach(function (row) {
                    if (row.email && recipients.indexOf(row.email) === -1) {
                        recipients.push(row.email)
                    }
                })
                log.debug('recipients', recipients)


                if (!recipients.length) return

                let recordRef = srfData[twcSrf.Fields.NAME]
                log.debug('recordRef', recordRef)

                email.send({
                    author: twcConfig.NO_REPLY,
                    recipients: recipients,
                    subject: 'SRF ' + newStatusText,
                    body: 'The status of SRF record - ' + recordRef +
                        ' has changed from ' + (oldStatusText || 'Blank') +
                        ' to ' + newStatusText + '.'
                })
            } catch (error) {
                core.logDebug('SRF SIGNATORY EMAIL', error.message)
            }
        }

        return {
            beforeLoad: beforeLoad,
            afterSubmit:afterSubmit

        }
    });
