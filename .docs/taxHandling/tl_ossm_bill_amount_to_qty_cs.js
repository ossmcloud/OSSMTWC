/**
 * ossm_bill_amount_to_qty_cs.js
 *
 * Client Script — Vendor Bill (Supplier Invoice)
 *
 * WHAT THIS DOES
 * ---------------
 * On a Vendor Bill line sourced from a Purchase Order, the AP user enters
 * the invoiced Amount directly (Amount and Quantity are both inline-
 * editable on this form). This script then:
 *
 *   1. Solves Quantity = Amount / Rate, using the PO's original unit Rate
 *      captured before any edits — not whatever NetSuite would otherwise
 *      back-calculate — so the PO's remaining quantity/amount tracking
 *      stays accurate and the line only closes once genuinely fully
 *      billed.
 *   2. NEVER allows this line to bill beyond what is currently left on
 *      the PO — either in quantity or in dollar value — however the
 *      value got there. This is enforced three ways:
 *        a) Editing Amount directly is caught by fieldChanged('amount').
 *        b) Editing Quantity directly is caught by fieldChanged('quantity')
 *           — this closes a gap where typing a larger Quantity straight
 *           into that column bypassed the Amount-based check entirely,
 *           since NetSuite would just recalculate Amount = Quantity x Rate
 *           on its own without this script getting a say.
 *        c) validateLine is a final safety net that re-checks the line
 *           right before it's committed (e.g. clicking Add/OK), in case
 *           anything left Quantity or Amount in an inconsistent state
 *           without tripping (a) or (b).
 *      In all three cases, if the resulting Quantity would exceed what's
 *      left on the PO line, BOTH Quantity and Amount are corrected back
 *      to exactly what remains. The entry is not blocked outright — it's
 *      corrected in place — but the net effect is that no bill raised
 *      through this line can ever exceed the PO's current quantity or
 *      value.
 *   3. Rate is always reset back to the PO's original rate — NetSuite's
 *      default behaviour when Amount is edited directly is to keep
 *      Quantity fixed and silently recalculate Rate instead, which this
 *      undoes every time.
 *   4. Shows an on-screen note whenever a correction happens, explaining
 *      that the PO itself needs to be amended (extra quantity/value on
 *      this line, or a new PO line) before any further amount beyond
 *      this can be billed — this is a safety net, not a way to bill over
 *      the PO's current value.
 *
 * This reflects the agreed process: if a vendor's invoice would genuinely
 * exceed the PO's current quantity or value, the PO itself is amended
 * first (additional value/quantity on the line, or a new line) — the
 * script's job is to make sure nothing can be billed past the PO as it
 * currently stands, not to silently let the total invoiced run over it.
 *
 * This handles any number of partial invoices against a line, in any
 * order, with no need to know in advance how many there will be — each
 * bill simply caps against whatever NetSuite reports as remaining at the
 * time that bill is raised.
 *
 * DEPLOYMENT
 * ----------
 * 1. Upload this file to the File Cabinet (e.g. SuiteScripts/OSSM/),
 *    replacing the previous version of ossm_bill_amount_to_qty_cs.js.
 * 2. On the Script record (customscript_ossm_twcm_si_qty), tick the
 *    "Validate Line Function" checkbox in addition to the existing
 *    "Field Changed Function" and "Line Init Function" checkboxes —
 *    this version adds a validateLine entry point that must be enabled
 *    the same way the other two are, or it will never run.
 * 3. No other changes needed to the Script or Script Deployment records.
 * 4. Test in sandbox before releasing to production, specifically:
 *      - A normal partial bill against a PO line (type an Amount lower
 *        than Quantity x PO-rate, confirm Quantity drops and Rate stays
 *        at the PO's rate).
 *      - Several partial bills whose Quantities sum to exactly 1.
 *      - An Amount whose implied Quantity exceeds what's left — confirm
 *        BOTH Quantity and Amount are corrected back to exactly what
 *        remains on the PO, Rate still stays at the PO's rate, and the
 *        note explains that the PO must be amended for anything more.
 *      - The same overage test, but typing directly into the Quantity
 *        column instead of Amount — confirm it's caught the same way.
 *      - Typing an overage into either field, then immediately clicking
 *        Add/OK without moving off the field — confirm validateLine
 *        still catches and corrects it if the earlier check didn't fire.
 *      - Quantity/rate precision on the items used — adjust
 *        QUANTITY_DECIMALS below if rounding causes drift.
 *
 * NOTE: this script does not depend on the 'createdfrom' body field — on
 * this account's Supplier Invoice form that field isn't exposed to the
 * client-side record at all (getValue returns undefined even when the
 * bill genuinely came from a PO), which silently blocked an earlier
 * version of this script. The per-line Rate/Quantity snapshot captured in
 * lineInit is what gates the logic instead — a line with no PO-derived
 * rate simply won't have a snapshot, and the handlers no-op.
 *
 * NOTE: lineInit only takes its Rate/Quantity snapshot the FIRST time a
 * given line is opened for editing in the current page session, and
 * ignores later re-opens of that same line. Without this, re-editing the
 * same line a second time before saving (e.g. trying a different amount)
 * would snapshot whatever this script had already set on the previous
 * pass rather than the PO's true starting values, corrupting the
 * remaining-quantity baseline on every subsequent edit.
 *
 * NOTE: the overage note is deduped per line by the (now-corrected)
 * Amount left sitting in the field, so re-triggering validation on the
 * same, already-corrected line (e.g. on commit) doesn't pop the same
 * alert twice.
 *
 * This is a starting point to review and adapt to your account's forms,
 * roles and item setup before releasing to production.
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord'], function (currentRecord) {

    // Decimal places to round the calculated Quantity to.
    // Match this to the item's configured quantity/unit precision.
    var QUANTITY_DECIMALS = 5;

    // Tolerance (in quantity units) to absorb rounding noise before
    // treating a line as "at" its remaining quantity.
    var OVERAGE_TOLERANCE = 0.0001;

    // Per-line snapshots, keyed by sublist line index, captured in
    // lineInit before any user edits.
    var originalRates = {};       // the PO's real unit rate
    var baselineQuantities = {};  // quantity remaining to reach 1, at line open

    // Last (corrected) amount we actually showed the overage note for,
    // per line — so re-validating the same line (e.g. on commit) doesn't
    // pop the same note a second time.
    var lastNotifiedAmounts = {};

    function roundTo(value, decimals) {
        var factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    function notify(message) {
        // Swap for N/ui/dialog.alert for standard NetSuite modal styling
        // (that API is promise-based, so this would need to be adjusted
        // to fire-and-forget it rather than await it).
        // eslint-disable-next-line no-alert
        alert(message);
    }

    function notifyOverageIfNew(line, cappedAmount, cappedQuantity, trueRate) {
        var alreadyNotified =
            lastNotifiedAmounts[line] !== undefined &&
            Math.abs(lastNotifiedAmounts[line] - cappedAmount) < OVERAGE_TOLERANCE;

        if (alreadyNotified) {
            return;
        }
        lastNotifiedAmounts[line] = cappedAmount;

        notify(
            'This line would bill higher than what is left on the PO at the ' +
            'agreed rate. Quantity and Amount have both been corrected back to ' +
            'exactly what remains (' + cappedAmount + ' at ' + trueRate + '/unit, ' +
            cappedQuantity + ' units) — this line cannot bill beyond the PO as it ' +
            'currently stands.\n\n' +
            'If more than this genuinely needs to be invoiced, the Purchase ' +
            'Order must be amended first — add quantity/value to this line, ' +
            'or add a new PO line — before the additional amount can be billed.'
        );
    }

    // Caps quantity/amount to the remaining baseline if needed, writes the
    // corrected values back to the line, and notifies if a correction was
    // made. Returns true if a correction was applied.
    function enforceCap(rec, line, trueRate, baseline, rawQuantity) {
        var quantity = roundTo(rawQuantity, QUANTITY_DECIMALS);
        var wasCapped = false;

        if (quantity > baseline + OVERAGE_TOLERANCE) {
            quantity = baseline;
            wasCapped = true;
        }

        var amount = roundTo(quantity * trueRate, 2);

        rec.setCurrentSublistValue({
            sublistId: 'item', fieldId: 'quantity', value: quantity, ignoreFieldChange: true
        });
        rec.setCurrentSublistValue({
            sublistId: 'item', fieldId: 'rate', value: trueRate, ignoreFieldChange: true
        });
        rec.setCurrentSublistValue({
            sublistId: 'item', fieldId: 'amount', value: amount, ignoreFieldChange: true
        });

        if (wasCapped) {
            notifyOverageIfNew(line, amount, quantity, trueRate);
        }

        return wasCapped;
    }

    function lineInit(context) {
        if (context.sublistId !== 'item') {
            return;
        }
        var rec = context.currentRecord;
        var line = rec.getCurrentSublistIndex({ sublistId: 'item' });

        // Only snapshot the FIRST time this line is opened in this page
        // session. Re-opening the same line for a second edit (e.g. trying
        // a different amount before saving) must not re-capture Rate/
        // Quantity — by then they may already reflect this script's own
        // previous edit, not the PO's true starting point, which would
        // corrupt the baseline on every subsequent edit.
        if (originalRates[line] !== undefined && baselineQuantities[line] !== undefined) {
            return;
        }

        var rate = parseFloat(
            rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'rate' })
        );
        if (!isNaN(rate) && rate !== 0 && originalRates[line] === undefined) {
            originalRates[line] = rate;
        }

        var quantity = parseFloat(
            rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' })
        );
        if (!isNaN(quantity) && baselineQuantities[line] === undefined) {
            baselineQuantities[line] = quantity;
        }
    }

    function fieldChanged(context) {
        if (context.sublistId !== 'item') {
            return;
        }
        if (context.fieldId !== 'amount' && context.fieldId !== 'quantity') {
            return;
        }

        var rec = context.currentRecord;
        var line = context.line;

        var trueRate = originalRates[line];
        var baseline = baselineQuantities[line];
        if (!trueRate || baseline === undefined) {
            return; // no snapshot to work from — leave the line alone
        }

        if (context.fieldId === 'amount') {
            var amount = parseFloat(
                rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'amount' })
            );
            if (isNaN(amount)) {
                return;
            }
            enforceCap(rec, line, trueRate, baseline, amount / trueRate);
        } else {
            // fieldId === 'quantity' — typed directly into the Quantity
            // column. Without this branch, a direct Quantity edit would
            // bypass the check above entirely, since NetSuite recalculates
            // Amount = Quantity x Rate on its own without this script
            // getting a say.
            var typedQuantity = parseFloat(
                rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' })
            );
            if (isNaN(typedQuantity)) {
                return;
            }
            enforceCap(rec, line, trueRate, baseline, typedQuantity);
        }
    }

    function validateLine(context) {
        if (context.sublistId !== 'item') {
            return true;
        }
        var rec = context.currentRecord;
        var line = rec.getCurrentSublistIndex({ sublistId: 'item' });

        var trueRate = originalRates[line];
        var baseline = baselineQuantities[line];
        if (!trueRate || baseline === undefined) {
            return true; // no snapshot to work from — leave the line alone
        }

        // Final safety net: whatever combination of edits got the line
        // here, re-check Quantity right before it's committed and correct
        // it if it's still over baseline. This catches cases where a line
        // is committed (e.g. clicking Add/OK) without fieldChanged having
        // had a chance to run and correct it first.
        var quantity = parseFloat(
            rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' })
        );
        if (isNaN(quantity)) {
            return true;
        }

        enforceCap(rec, line, trueRate, baseline, quantity);

        return true; // never block the line outright — always correct instead
    }

    return {
        lineInit: lineInit,
        fieldChanged: fieldChanged,
        validateLine: validateLine
    };
});
