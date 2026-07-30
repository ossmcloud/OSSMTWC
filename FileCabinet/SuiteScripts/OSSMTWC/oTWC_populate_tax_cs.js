/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['SuiteBundles/Bundle 548734/O/core.sql.js', './O/oTWC_dialogEx.js', 'N/ui/dialog'], (coreSQL, dialog, dlg) => {
    const fieldChanged = async (context) => {
        if (context.fieldId == 'taxcode' && context.sublistId == 'taxdetails') {
            let taxCode = currentRecord.getCurrentSublistValue({ sublistId: context.sublistId, fieldId: context.fieldId })
            let taxbasis = currentRecord.getCurrentSublistValue({ sublistId: context.sublistId, fieldId: 'taxbasis' })
            let taxRate = fetchTaxRate(taxCode)

            if (!taxRate || Object.keys(taxRate).length === 0) {
                return;
            }
            let newTaxAmt = taxbasis * (taxRate.rate)
            currentRecord.setCurrentSublistValue({ sublistId: context.sublistId, fieldId: 'taxrate', value: taxRate?.rate });
            currentRecord.setCurrentSublistValue({ sublistId: context.sublistId, fieldId: 'taxamount', value: newTaxAmt });

        }
    }

    function fetchTaxRate(id) {
        let sql = `select ra.custrecord_ste_taxrate_rate as rate, tx.id as id, tx.fullname as name
                    from customrecord_ste_taxrate ra
                    join salestaxitem tx on tx.id = ra.custrecord_ste_taxrate_taxcode
                    where tx.id = ${id}`

        return coreSQL.first(sql)
    }

    return {
        fieldChanged
    }
});
