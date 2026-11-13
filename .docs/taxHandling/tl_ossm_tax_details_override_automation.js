/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['SuiteBundles/Bundle 548734/O/core.sql.js'], (coreSQL) => {

    /**
     * fieldChanged — fires when Tax Code changes on a tax details line.
     * Populates Tax Rate and Tax Amount immediately for instant feedback.
     */
    const fieldChanged = async (context) => {
        if (context.sublistId !== 'taxdetails' || (context.fieldId !== 'taxcode' && context.fieldId !== 'taxbasis')) return;
      

        const currentRecord = context.currentRecord;
        const taxCode = currentRecord.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode' });
        if (!taxCode) return;

        const taxRate = fetchTaxRate(taxCode);
        if (!taxRate || Object.keys(taxRate).length === 0) return;

        const taxbasis = Number(currentRecord.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxbasis' })) || 0;
        const rateDecimal = Number(taxRate.rate);
        const ratePercent = rateDecimal * 100;
        const newTaxAmt = Math.round((taxbasis * rateDecimal + Number.EPSILON) * 100) / 100;

        currentRecord.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxrate', value: ratePercent });
        currentRecord.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxamount', value: newTaxAmt });
    };

    /**
     * saveRecord — warns if any tax detail line has a Tax Amount that doesn't match
     * Tax Basis × Tax Rate. The user can choose to save anyway or go back and fix it.
     */
    const saveRecord = (context) => {
        const currentRecord = context.currentRecord;
        const lineCount = currentRecord.getLineCount({ sublistId: 'taxdetails' });
        const warnings = [];

        for (let i = 0; i < lineCount; i++) {
            const taxCode = currentRecord.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode', line: i });
            if (!taxCode) continue;

            const taxBasis = Number(currentRecord.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxbasis', line: i })) || 0;
            const taxAmount = Number(currentRecord.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxamount', line: i })) || 0;

            // Rate may come back as "23.0%" (string) or 23 (number) — handle both
            const rateRaw = currentRecord.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxrate', line: i });
            const taxRatePercent = parseFloat(String(rateRaw || '').replace('%', '')) || 0;

            // Only validate lines that have both a basis and a rate (i.e. a non-zero amount is expected)
            if (taxBasis === 0 || taxRatePercent === 0) continue;

            const expectedAmount = Math.round((taxBasis * taxRatePercent / 100 + Number.EPSILON) * 100) / 100;

            if (Math.abs(taxAmount - expectedAmount) > 0.01) {
                const ref = currentRecord.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxdetailsreference', line: i }) || `Line ${i + 1}`;
                warnings.push(`  • ${ref}: Tax Amount is ${taxAmount} but expected ${expectedAmount} (${taxBasis} × ${taxRatePercent}%)`);
            }
        }

        if (warnings.length > 0) {
            window.alert(
                'Save blocked: Tax Amount is incorrect on the following tax detail lines.\n' +
                'Please correct them before saving.\n\n' +
                warnings.join('\n')
            );
            return false;
        }

        return true;
    };

    function fetchTaxRate(id) {
        let sql = `select ra.custrecord_ste_taxrate_rate as rate, tx.id as id, tx.fullname as name
                    from customrecord_ste_taxrate ra
                    join salestaxitem tx on tx.id = ra.custrecord_ste_taxrate_taxcode
                    where tx.id = ${id}`
        return coreSQL.first(sql)
    }

    return { fieldChanged, saveRecord }
});