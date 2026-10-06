/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Populate Tax Rate and Tax Amount on the Tax Details subtab when Tax Details Override is used.
 * When the Tax Code changes on a tax details line, the rate is sourced from the SuiteTax
 * tax rate record (customrecord_ste_taxrate) and Tax Amount = Tax Basis x Tax Rate.
 *
 * Deploy on: transactions using Tax Details Override (e.g. Vendor Bill).
 * Dependencies: SuiteTax enabled (customrecord_ste_taxrate). No bundle dependencies.
 */
define(['N/query'], (query) => {

    const fieldChanged = (context) => {
        if (context.sublistId !== 'taxdetails' || context.fieldId !== 'taxcode') {
            return;
        }

        const currentRecord = context.currentRecord;
        const taxCode = currentRecord.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode' });
        if (!taxCode) {
            return;
        }

        const taxRate = fetchTaxRate(taxCode);
        if (!taxRate || taxRate.rate === null || taxRate.rate === undefined || taxRate.rate === '') {
            return;
        }

        const taxBasis = Number(currentRecord.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxbasis' })) || 0;
        const rateDecimal = Number(taxRate.rate);            // SuiteQL returns percent as decimal, e.g. 0.135
        const ratePercent = rateDecimal * 100;               // percent field expects 13.5 for 13.5%
        const newTaxAmt = Math.round((taxBasis * rateDecimal + Number.EPSILON) * 100) / 100;

        currentRecord.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxrate', value: ratePercent });
        currentRecord.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxamount', value: newTaxAmt });
    };

    const fetchTaxRate = (taxCodeId) => {
        try {
            const results = query.runSuiteQL({
                query: `SELECT ra.custrecord_ste_taxrate_rate AS rate, tx.id AS id, tx.fullname AS name
                        FROM customrecord_ste_taxrate ra
                        JOIN salestaxitem tx ON tx.id = ra.custrecord_ste_taxrate_taxcode
                        WHERE tx.id = ?`,
                params: [taxCodeId]
            }).asMappedResults();
            return results.length ? results[0] : null;
        } catch (e) {
            console.error('populate_tax_cs: failed to fetch tax rate', e);
            return null;
        }
    };

    return {
        fieldChanged
    };
});