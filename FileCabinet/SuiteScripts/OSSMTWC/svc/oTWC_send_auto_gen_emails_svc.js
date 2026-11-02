/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['../ui/modules/oTWC_send_auto_gen_emails_lib'],
    (emailLib) => {
        function execute(context) {
            try {
                [
                    { name: 'Insurance', run: emailLib.sendInsuranceExpiry },
                    { name: 'Certification', run: emailLib.sendCertificationExpiry }
                ].forEach(function (s) {
                    try {
                        var result = s.run()
                        log.audit(s.name + ' expiry notifications', result)

                        if (result.errors && result.errors.length) {
                            log.error(s.name + ' email errors', result.errors)
                        }
                    } catch (e) {
                        log.error(s.name + ' expiry processing failed', e)
                    }
                })
            } catch (e) {
                log.error('Expiry notification scheduled script failed', e)
            }
        }

        return {
            execute: execute
        }
    })