/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
/**
 * OSSM080 Email Picker Module for Towercom: chooses the recipients of each invoice when a Customer Invoice Run is populated
 * (set its path in the OSSM080 Config "Email Picker Module" field: /SuiteScripts/OSSMTWC/modules/oTWC_customerInvoiceRunEmailPicker.js)
 *
 * getRecepients(options)
 *   options: { tran: invoice internal id, tranId: invoice number, cust: customer internal id, sub: subsidiary internal id }
 *   returns: an array of unique email addresses
 *
 * the recipients come from the Class to Email table (customrecord_otwc_class_to_email), rows of the invoice customer:
 *   - rows with no class always apply
 *   - rows with a class apply when at least one item line of the invoice has that class
 * each row Email(s) can hold a ';' or ',' separated list; throws if no email address is found
 */
define(['N/query'],
    function (query) {
        var SQL = `
            SELECT DISTINCT cte.custrecord_otwc_class_to_email_addresses AS emails
            FROM transaction t
            INNER JOIN customrecord_otwc_class_to_email cte
                ON cte.custrecord_otwc_class_to_email_cust = t.entity
                AND cte.isinactive = 'F'
            LEFT JOIN transactionline tl
                ON tl.transaction = t.id
                AND tl.mainline = 'F'
            JOIN item i on i.id = tl.item
                AND i.class = cte.custrecord_otwc_class_to_email_class
            WHERE t.id = ?
                AND (cte.custrecord_otwc_class_to_email_class IS NULL OR tl.id IS NOT NULL)`;

        function getRecepients(options) {
            var rows = query.runSuiteQL({ query: SQL, params: [parseInt(options.tran)] }).asMappedResults();

            // split every row list and keep each address once (case insensitive)
            var emails = [];
            var seen = {};
            rows.forEach(function (row) {
                (row.emails || '').split(/[;,]/).forEach(function (email) {
                    email = email.trim();
                    if (email && !seen[email.toLowerCase()]) {
                        seen[email.toLowerCase()] = true;
                        emails.push(email);
                    }
                });
            });

            if (emails.length == 0) {
                throw new Error('No email address found in the Class to Email table for customer ' + options.cust + ' (invoice ' + options.tranId + ')');
            }
            return emails;
        }

        return {
            getRecepients: getRecepients
        }
    });
