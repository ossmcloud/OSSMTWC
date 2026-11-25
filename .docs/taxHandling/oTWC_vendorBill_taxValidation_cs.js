/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Vendor Bill (SuiteTax) - tax details validation on save.
 * Blocks the save when:
 *  1. the total net of the transaction lines (Items + Expenses) does not match the total
 *     Tax Basis of the Tax Details subtab;
 *  2. on any Tax Details line, Tax Basis x Tax Rate does not match the Tax Amount.
 *
 * @@NOTE: by default the check only runs when "Tax Details Override" is ticked. Without the
 *         override the SuiteTax engine recalculates the tax details on submit (and the client-side
 *         Tax Details sublist may be empty or stale until "Preview Tax" is used), so there is
 *         nothing reliable to validate. Set ONLY_WHEN_OVERRIDE = false to always validate.
 * @@NOTE: check 1 sums every Tax Details line, so it assumes one tax detail per transaction line
 *         (e.g. VAT only). If several tax types apply to the same line the basis is counted
 *         once per tax type and the totals will not match.
 *
 * Deploy on: Vendor Bill. Dependencies: SuiteTax enabled. No bundle dependencies.
 */
define(['N/ui/dialog'], (dialog) => {

    const ONLY_WHEN_OVERRIDE = true;
    // allowed rounding difference (in transaction currency) for each check
    const TOLERANCE = 0.01;
    // transaction sublists that carry the net amount
    const LINE_SUBLISTS = ['item', 'expense'];
    // item types whose amount is a total of other lines (would be counted twice)
    const SKIP_ITEM_TYPES = ['Subtotal', 'Subtot', 'EndGroup', 'Description'];

    const saveRecord = (context) => {
        const rec = context.currentRecord;

        if (ONLY_WHEN_OVERRIDE && !isTrue(rec.getValue({ fieldId: 'taxdetailsoverride' }))) {
            return true;
        }

        const errors = [];

        // 1. total net of lines vs total tax basis
        const linesNet = getLinesNet(rec);
        const taxDetails = getTaxDetails(rec);
        const taxNet = taxDetails.reduce((tot, td) => tot + td.basis, 0);

        if (Math.abs(round2(linesNet) - round2(taxNet)) > TOLERANCE) {
            errors.push(`Total net of the lines (${fmt(linesNet)}) does not match the total Tax Basis of the Tax Details (${fmt(taxNet)}). Difference: ${fmt(linesNet - taxNet)}.`);
        }

        // 2. tax basis x rate vs tax amount, per tax detail line
        taxDetails.forEach((td) => {
            const expected = round2(td.basis * td.rate / 100);
            if (Math.abs(expected - round2(td.amount)) > TOLERANCE) {
                errors.push(`Tax Details line ${td.line + 1}${td.taxCode ? ` (${td.taxCode})` : ''}: ${fmt(td.basis)} x ${td.rate}% = ${fmt(expected)}, but Tax Amount is ${fmt(td.amount)}.`);
            }
        });

        if (errors.length === 0) { return true; }

        dialog.alert({
            title: 'Tax Details validation failed',
            message: `The bill cannot be saved:<br><br>${errors.map(e => `&bull; ${escHtml(e)}`).join('<br>')}`
        });
        return false;
    };

    const getLinesNet = (rec) => {
        let total = 0;
        LINE_SUBLISTS.forEach((sublistId) => {
            const count = rec.getLineCount({ sublistId }) || 0;
            for (let line = 0; line < count; line++) {
                if (sublistId === 'item') {
                    const itemType = rec.getSublistValue({ sublistId, fieldId: 'itemtype', line });
                    if (SKIP_ITEM_TYPES.indexOf(itemType) >= 0) { continue; }
                }
                total += toNum(rec.getSublistValue({ sublistId, fieldId: 'amount', line }));
            }
        });
        return total;
    };

    const getTaxDetails = (rec) => {
        const sublistId = 'taxdetails';
        const count = rec.getLineCount({ sublistId }) || 0;
        const details = [];
        for (let line = 0; line < count; line++) {
            details.push({
                line,
                taxCode: rec.getSublistText({ sublistId, fieldId: 'taxcode', line }),
                basis: toNum(rec.getSublistValue({ sublistId, fieldId: 'taxbasis', line })),
                // percent field: 23 for 23% (may come back as "23%" / "23.0%")
                rate: toNum(rec.getSublistValue({ sublistId, fieldId: 'taxrate', line })),
                amount: toNum(rec.getSublistValue({ sublistId, fieldId: 'taxamount', line }))
            });
        }
        return details;
    };

    const toNum = (v) => {
        const n = parseFloat(String(v === null || v === undefined ? '' : v).replace(/[%,\s]/g, ''));
        return isNaN(n) ? 0 : n;
    };

    const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

    const fmt = (n) => round2(n).toFixed(2);

    const isTrue = (v) => v === true || v === 'T';

    const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return {
        saveRecord
    };
});
