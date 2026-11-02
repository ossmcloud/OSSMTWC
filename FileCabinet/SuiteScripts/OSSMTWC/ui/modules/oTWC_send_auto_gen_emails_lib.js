
/**
 * @NApiVersion 2.1
 */
define(['N/email', 'N/render', 'N/log', '/.bundle/548734/O/core.sql.js', '/SuiteScripts/OSSMTWC/data/oTWC_config.js'],
    (email, render, log, coreSQL, twcConfig) => {

        let CONFIG = {
            AUTHOR_ID: twcConfig.NO_REPLY,
            TEMPLATES: { INSURANCE: 3, CERTIFICATION: 3 }
        }

        let INSURANCE_SQL = `
        SELECT c.id AS record_id, 
        p.custrecord_twc_prof_email AS recipient_email,
        p.name as recipient_name,
            CASE WHEN BUILTIN.DF(c.custrecord_twc_co_el_available_typ) = 'Yes' AND TRUNC(c.custrecord_twc_co_el_expiry) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN c.custrecord_twc_co_el_expiry END AS el_expiry,
            CASE WHEN BUILTIN.DF(c.custrecord_twc_co_pl_available_typ) = 'Yes' AND TRUNC(c.custrecord_twc_co_pl_expiry) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN c.custrecord_twc_co_pl_expiry END AS pl_expiry,
            CASE WHEN BUILTIN.DF(c.custrecord_twc_co_pi_available_typ) = 'Yes' AND TRUNC(c.custrecord_twc_co_pi_expiry) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN c.custrecord_twc_co_pi_expiry END AS pi_expiry
        FROM customrecord_twc_company c
        JOIN customrecord_twc_prof p ON p.custrecord_twc_prof_company = c.id
        WHERE BUILTIN.DF(p.custrecord_twc_prof_co_desig_cont) LIKE '%Insurance%'
          AND (
            (BUILTIN.DF(c.custrecord_twc_co_el_available_typ) = 'Yes' AND TRUNC(c.custrecord_twc_co_el_expiry) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (BUILTIN.DF(c.custrecord_twc_co_pl_available_typ) = 'Yes' AND TRUNC(c.custrecord_twc_co_pl_expiry) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (BUILTIN.DF(c.custrecord_twc_co_pi_available_typ) = 'Yes' AND TRUNC(c.custrecord_twc_co_pi_expiry) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
          )
    `

        let CERTIFICATION_SQL = `
        SELECT p.id AS record_id, d.custrecord_twc_prof_email AS recipient_email,
        d.name as recipient_name,
            CASE WHEN p.custrecord_twc_prof_safe_pass_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_safe_pass_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN p.custrecord_twc_prof_safe_pass_cert_exp END AS safe_pass_expiry,
            CASE WHEN p.custrecord_twc_prof_climber_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_climber_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN p.custrecord_twc_prof_climber_cert_exp END AS climb_expiry,
            CASE WHEN p.custrecord_twc_prof_rescue_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_rescue_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN p.custrecord_twc_prof_rescue_cert_exp END AS rescue_expiry,
            CASE WHEN p.custrecord_twc_prof_rooftop_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_rooftop_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN p.custrecord_twc_prof_rooftop_cert_exp END AS rooftop_expiry,
            CASE WHEN p.custrecord_twc_prof_rf_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_rf_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN p.custrecord_twc_prof_rf_cert_exp END AS rf_expiry,
            CASE WHEN p.custrecord_twc_prof_elec_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_elec_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN p.custrecord_twc_prof_elec_cert_exp END AS electrician_expiry,
            CASE WHEN p.custrecord_twc_prof_drone_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_drone_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30) THEN p.custrecord_twc_prof_drone_cert_exp END AS drone_expiry
        FROM customrecord_twc_prof p
        JOIN customrecord_twc_prof d ON d.id = p.id OR (d.custrecord_twc_prof_company = p.custrecord_twc_prof_company AND BUILTIN.DF(d.custrecord_twc_prof_co_desig_cont) LIKE '%Accreditation%')
        WHERE d.custrecord_twc_prof_email IS NOT NULL
          AND (
            (p.custrecord_twc_prof_safe_pass_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_safe_pass_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (p.custrecord_twc_prof_climber_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_climber_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (p.custrecord_twc_prof_rescue_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_rescue_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (p.custrecord_twc_prof_rooftop_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_rooftop_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (p.custrecord_twc_prof_rf_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_rf_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (p.custrecord_twc_prof_elec_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_elec_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
            OR (p.custrecord_twc_prof_drone_cert_sts IN (2,3) AND TRUNC(p.custrecord_twc_prof_drone_cert_exp) IN (TRUNC(SYSDATE), TRUNC(SYSDATE)+30))
          )
    `

        let EXPIRY_FIELDS = {
            INSURANCE: ['el_expiry', 'pl_expiry', 'pi_expiry'],
            CERTIFICATION: ['safe_pass_expiry', 'climb_expiry', 'rescue_expiry', 'rooftop_expiry', 'rf_expiry', 'electrician_expiry', 'drone_expiry']
        }

        let sendEmail = (recordType, recordId, recipient, templateId, errors, recipientName, expiryTable) => {
            log.debug("recipient email send", recipient)
            if (!recipient || !String(recipient).trim()) return
            try {
                let merged = render.mergeEmail({ templateId: templateId, customRecord: { type: recordType, id: Number(recordId) } })
                let body = merged.body
                    .replace(/\{\{RECEIVER\}\}/g, recipientName || '')
                    .replace(/\{\{EMAIL_MESSAGE\}\}/g,
                        'The following are the details of the upcoming expiry:<br/>' + expiryTable)

                email.send({ author: CONFIG.AUTHOR_ID, recipients: String(recipient).trim(), subject: merged.subject, body: body })
                log.debug("Email sent", String(recipient).trim())
            } catch (e) {
                errors.push({ recordId: recordId, recipient: recipient, message: e.message })
            }
        }

        let processExpiry = (kind, sql, recordType, templateId) => {
            let results = { recordsFound: 0, sent: 0, failed: 0, errors: [] }
            log.debug("results")
            let rows
            try {
                rows = coreSQL.run(sql)
                log.debug("rows..", rows)

            } catch (e) {
                results.errors.push({ stage: 'SQL', message: e.message })
                results.failed++
                return results
            }

            rows.forEach(row => {
                log.debug("row..", row)
                results.recordsFound++
                let labels = {
                    el_expiry: 'EL Expiry',
                    pl_expiry: 'PL Expiry',
                    pi_expiry: 'PI Expiry',
                    safe_pass_expiry: 'Safe Pass Expiry',
                    climb_expiry: 'Climb Expiry',
                    rescue_expiry: 'Rescue Expiry',
                    rooftop_expiry: 'Rooftop Expiry',
                    rf_expiry: 'RF Expiry',
                    electrician_expiry: 'Electrician Expiry',
                    drone_expiry: 'Drone Expiry'
                }

                let tableRows = ''

                EXPIRY_FIELDS[kind].forEach(field => {
                    if (!row[field]) return

                    let parts = row[field].split('/')
                    let expiry = new Date(parts[2], parts[1] - 1, parts[0])
                    let today = new Date()
                    today.setHours(0, 0, 0, 0)

                    let days = Math.round((expiry - today) / 86400000)

                    if (days === 0 || days === 30) {
                        tableRows += '<tr><td>' + labels[field] + '</td><td>' + row[field] +
                            '</td><td>' + (days === 0 ? 'Expires today' : 'Expires in 30 days') +
                            '</td></tr>'
                    }
                })

                if (!tableRows) return

                let expiryTable = '<table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse; border:1px solid black; width:100%;">' +
                    '<tr><th style="border:1px solid black; padding:10px; text-align:left;">Expiry Type</th>' +
                    '<th style="border:1px solid black; padding:10px; text-align:left;">Expiry Date</th>' +
                    '<th style="border:1px solid black; padding:10px; text-align:left;">Status</th></tr>' +
                    tableRows.replace(/<td>/g, '<td style="border:1px solid black; padding:10px;">') +
                    '</table>'

                sendEmail(recordType, row.record_id, row.recipient_email, templateId, results.errors, row.recipient_name, expiryTable)
            })
            return results
        }

        let sendInsuranceExpiry = () => processExpiry('INSURANCE', INSURANCE_SQL, 'customrecord_twc_company', CONFIG.TEMPLATES.INSURANCE)
        let sendCertificationExpiry = () => processExpiry('CERTIFICATION', CERTIFICATION_SQL, 'customrecord_twc_prof', CONFIG.TEMPLATES.CERTIFICATION)

        return { sendInsuranceExpiry, sendCertificationExpiry }
    })
