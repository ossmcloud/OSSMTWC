/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Transaction client script (SuiteTax account). Consolidates and replaces:
 *  - oTWC_populate_tax_cs.js, tl_ossm_tax_details_override_automation.js  (tax details autofill)
 *  - oTWC_vendorBill_taxValidation_cs.js                                   (tax details validation on save)
 *  - tl_ossm_bill_amount_to_qty_cs.js                                      (PO over-billing cap)
 *  - tl_ossm_populate_transaction_line_fields.js                           (line project -> customer / name)
 *
 * Features (enabled per record type via FEATURES, record type = currentRecord.type):
 *  1. project : when custcol_ossm_twcm_project changes on a line, copy it into the native
 *               Customer:Project (item / expense) or Name (journal 'line') column.
 *  2. tax     : with "Tax Details Override" ticked:
 *                 - Tax Code changed  -> Tax Rate + Tax Amount filled from the SuiteTax rate record;
 *                 - Tax Basis / Rate changed -> Tax Amount recalculated (no lookup);
 *                   (before any Tax Amount calculation the net amount of the bill line it refers to
 *                    - linked by taxdetailsreference - is pushed into Tax Basis)
 *                 - after a bill line is edited NetSuite recalculates the tax details with a wrong
 *                   Tax Basis: every tax details line is fixed (Tax Basis = bill line net, Tax Amount
 *                   recalculated) when the Tax Details tab is opened and again before the save check;
 *                   (the Tax Basis fix runs before the taxCheck save validation)
 *  3. taxCheck: with "Tax Details Override" ticked, on save, block when the lines net does not match the
 *               Tax Basis total, or when Tax Basis x Tax Rate does not match the Tax Amount on any tax
 *               details line.
 *  4. poCap   : on bill item lines sourced from a PO, the user types the invoiced Amount and the
 *               Quantity is solved at the PO rate (Rate is always locked to the PO rate). A line can
 *               never bill more than is left on the PO line: if it would, Quantity and Amount are
 *               corrected back to exactly what remains and the user is told to amend the PO first.
 *
 * Deploy on: Vendor Bill, Vendor Credit, Purchase Order, Vendor Return, Invoice, Credit Memo, Sales Order,
 * Sales Return, Journal (keep FEATURES in step with the deployments).
 * Entry points to tick on the script record: pageInit, postSourcing, fieldChanged, validateLine, saveRecord.
 * Dependencies: SuiteTax enabled (customrecord_ste_taxrate). No bundle dependencies.
 */
define(['N/query', 'N/ui/dialog'], (query, dialog) => {

    // ------------------------------------------------------------------------------------------
    // CONFIG
    // ------------------------------------------------------------------------------------------

    // @@NOTE: record types not listed here get DEFAULT_FEATURES (project copy only), so deploying
    //         the script on another record type is enough to get the project copy there.
    //         project  : line project -> native customer / name
    //         tax      : tax details autofill + Tax Basis fix (open / tax tab / save)
    //         taxCheck : save validation of tax details vs lines (blocks the save)
    //         poCap    : PO over-billing cap on item lines
    const BILL_FEATURES = { project: true, tax: true, taxCheck: true, poCap: true };
    const ORDER_FEATURES = { project: true, taxCheck: true };
    const FEATURES = {
        vendorbill: BILL_FEATURES,
        vendorcredit: BILL_FEATURES,                    // same as vendor bill
        purchaseorder: ORDER_FEATURES,
        vendorreturnauthorization: ORDER_FEATURES,      // vendor return: same as purchase order
        invoice: ORDER_FEATURES,
        creditmemo: ORDER_FEATURES,                     // same as invoice
        salesorder: ORDER_FEATURES,
        returnauthorization: ORDER_FEATURES,            // sales return: same as sales order
        journalentry: { project: true }
    };
    const DEFAULT_FEATURES = { project: true };

    const FLD = {
        PROJECT: 'custcol_ossm_twcm_project',
        OVERRIDE: 'taxdetailsoverride'
    };

    // sublist -> native field holding the customer / project on that sublist
    const PROJECT_TARGET = { item: 'customer', expense: 'customer', line: 'entity' };

    // tax validation: transaction sublists carrying the net amount, and item types to skip
    // (totals / headers that would count other lines twice)
    const LINE_SUBLISTS = ['item', 'expense'];
    const SKIP_ITEM_TYPES = ['Subtotal', 'Subtot', 'EndGroup', 'Group', 'Description'];
    const TOLERANCE_CENTS = 1;
    // element id of the tax details subtab link on the bill form (clicking it runs tax.fixAllBasis)
    const TAX_TAB_ID = 'taxestxt';

    // PO cap: match to the items' quantity precision
    const QTY_DECIMALS = 5;
    const QTY_TOLERANCE = 0.0001;

    // ------------------------------------------------------------------------------------------
    // STATE (per page load)
    // ------------------------------------------------------------------------------------------

    const state = {
        features: {},
        rateCache: {},          // tax code id -> decimal rate (0.23) or null
        po: {},                 // 'orderdoc:orderline' -> { rate, remaining }  (remaining excludes THIS bill)
        poLoaded: {},           // orderdoc -> true once queried
        savedOnBill: {},        // 'orderdoc:orderline' -> qty this bill had when saved (edit mode only)
        notified: {},           // 'orderdoc:orderline' -> last capped amount notified
        fixingBasis: false,     // re-entrancy guard for tax.fixAllBasis
        rec: null,              // currentRecord, kept for the tax tab click handler
        tabHooked: false,
        pendingOpenFix: false   // new doc: run tax.fixAllBasis once, on NetSuite's first taxregoverride sourcing
    };

    // ------------------------------------------------------------------------------------------
    // UTILITIES
    // ------------------------------------------------------------------------------------------

    const toNum = (v) => {
        const n = parseFloat(String(v === null || v === undefined ? '' : v).replace(/[%,\s]/g, ''));
        return isNaN(n) ? 0 : n;
    };
    const isBlank = (v) => v === null || v === undefined || v === '';
    const roundTo = (n, decimals) => {
        const f = Math.pow(10, decimals);
        return Math.round((n + Number.EPSILON) * f) / f;
    };
    const round2 = (n) => roundTo(n, 2);
    const cents = (n) => Math.round((n + Number.EPSILON) * 100);
    const fmt = (n) => round2(n).toFixed(2);
    const isTrue = (v) => v === true || v === 'T';
    const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const isOverride = (rec) => isTrue(rec.getValue({ fieldId: FLD.OVERRIDE }));

    const logError = (where, e) => {
        console.error(`oTWC_taxHandling_cs (${where}): ${e && e.message ? e.message : e}`);
    };

    // ------------------------------------------------------------------------------------------
    // 1. PROJECT COPY
    // ------------------------------------------------------------------------------------------

    const project = {
        copy: (rec, sublistId) => {
            const targetField = PROJECT_TARGET[sublistId];
            if (!targetField) { return; }
            try {
                const selectedProject = rec.getCurrentSublistValue({ sublistId, fieldId: FLD.PROJECT });
                if (!selectedProject) {
                    // project cleared -> clear the native field as well
                    rec.setCurrentSublistValue({ sublistId, fieldId: targetField, value: '', ignoreFieldChange: false });
                    return;
                }
                // @@NOTE: clear silently first so the set below always registers as a change and
                //         triggers NetSuite's normal sourcing for the line. forceSyncSourcing replaces the
                //         old 100 ms setTimeout, which raced the line commit (line saved with no customer).
                rec.setCurrentSublistValue({ sublistId, fieldId: targetField, value: '', ignoreFieldChange: true });
                rec.setCurrentSublistValue({ sublistId, fieldId: targetField, value: selectedProject, ignoreFieldChange: false, forceSyncSourcing: true });
            } catch (e) {
                logError(`project copy ${sublistId}.${targetField}`, e);
            }
        }
    };

    // ------------------------------------------------------------------------------------------
    // 2a. TAX DETAILS AUTOFILL
    // ------------------------------------------------------------------------------------------

    const tax = {
        // decimal rate (e.g. 0.135 for 13.5%) or null
        // @@NOTE: assumes SuiteQL returns the percent field custrecord_ste_taxrate_rate as a decimal
        //         fraction (0.135), as the previous scripts did - verify once in the sandbox.
        // @@TODO: a tax code with several active rate rows (rate change) takes the newest row (highest id);
        //         filter on the rate record's effective dates vs trandate once the field ids are confirmed.
        getRate: (taxCode) => {
            if (Object.prototype.hasOwnProperty.call(state.rateCache, taxCode)) { return state.rateCache[taxCode]; }
            let rate = null;
            try {
                const rows = query.runSuiteQL({
                    query: `SELECT ra.custrecord_ste_taxrate_rate AS rate
                            FROM customrecord_ste_taxrate ra
                            JOIN salestaxitem tx ON tx.id = ra.custrecord_ste_taxrate_taxcode
                            WHERE tx.id = ?
                              AND NVL(ra.isinactive, 'F') = 'F'
                            ORDER BY ra.id DESC`,
                    params: [taxCode]
                }).asMappedResults();
                if (rows.length && !isBlank(rows[0].rate)) { rate = Number(rows[0].rate); }
                if (rate !== null && isNaN(rate)) { rate = null; }
            } catch (e) {
                logError('tax rate lookup', e);
                return null;    // don't cache failures
            }
            state.rateCache[taxCode] = rate;
            return rate;
        },

        // net amount of the bill lines (item + expense) keyed by tax details reference
        // @@NOTE: taxdetailsreference is the SuiteTax link between a bill line and its tax details lines
        //         (unique per bill line). A reference found on more than one bill line is ambiguous and is
        //         left out (its tax details lines are not touched).
        lineNetByRef: (rec) => {
            const nets = {};
            const dupes = {};
            taxCheck.getLines(rec).forEach((l) => {
                if (!l.ref) { return; }
                if (Object.prototype.hasOwnProperty.call(nets, l.ref)) { dupes[l.ref] = true; }
                nets[l.ref] = l.net;
            });
            Object.keys(dupes).forEach((ref) => { delete nets[ref]; });
            return nets;
        },

        // every tax details reference currently on the bill lines (item + expense, all line types)
        billRefs: (rec) => {
            const refs = {};
            LINE_SUBLISTS.forEach((sublistId) => {
                const count = rec.getLineCount({ sublistId }) || 0;
                for (let line = 0; line < count; line++) {
                    const ref = rec.getSublistValue({ sublistId, fieldId: 'taxdetailsreference', line });
                    if (ref) { refs[ref] = true; }
                }
            });
            return refs;
        },

        // remove tax details lines whose bill line is no longer on the transaction (e.g. line deleted).
        // Returns the number of lines removed.
        // @@NOTE: lines with a blank reference are kept (nothing to match). If NO bill line exposes a
        //         reference (field not available on the form) nothing is removed - otherwise every tax
        //         details line would be wiped. Walks backwards so removing doesn't shift unvisited lines.
        removeOrphans: (rec) => {
            const sublistId = 'taxdetails';
            const refs = tax.billRefs(rec);
            if (!Object.keys(refs).length) { return 0; }
            let removed = 0;
            const count = rec.getLineCount({ sublistId }) || 0;
            for (let line = count - 1; line >= 0; line--) {
                const ref = rec.getSublistValue({ sublistId, fieldId: 'taxdetailsreference', line });
                if (!ref || refs[ref]) { continue; }
                rec.removeLine({ sublistId, line, ignoreRecalc: true });
                removed++;
            }
            return removed;
        },

        // push the net amount of the BILL LINE the current tax details line refers to (taxdetailsreference)
        // into Tax Basis (before any Tax Amount calculation) and return the basis to use.
        // nets: optional lineNetByRef() result (avoids re-reading the bill lines in a loop).
        // @@NOTE: the tax details line's own 'netamount' is NOT used - it can be stale / wrong. If the bill
        //         line is not found, the Tax Basis already on the line is used.
        pushNetToBasis: (rec, nets) => {
            const map = nets || tax.lineNetByRef(rec);
            const ref = rec.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxdetailsreference' });
            if (ref && Object.prototype.hasOwnProperty.call(map, ref)) {
                rec.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxbasis', value: round2(map[ref]), ignoreFieldChange: true });
            }
            return toNum(rec.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxbasis' }));
        },

        // UTILS: remove tax details lines whose bill line is gone, then walk every tax details line and
        // keep Tax Basis = net amount of its bill line (+ Tax Amount recalculated).
        // @@NOTE: when bill lines are edited NetSuite recalculates the tax details with a wrong Tax Basis,
        //         asynchronously (not finished yet in sublistChanged / postSourcing). So this runs only when
        //         the tax tab is opened (tabHook) and before the save validation. Only lines that are actually
        //         wrong are selected / committed. Re-entrancy guarded.
        fixAllBasis: (rec) => {
            if (state.fixingBasis || !isOverride(rec)) { return; }
            state.fixingBasis = true;
            try {
                const sublistId = 'taxdetails';
                tax.removeOrphans(rec);
                const nets = tax.lineNetByRef(rec);
                const count = rec.getLineCount({ sublistId }) || 0;
                for (let line = 0; line < count; line++) {
                    const ref = rec.getSublistValue({ sublistId, fieldId: 'taxdetailsreference', line });
                    if (!ref || !Object.prototype.hasOwnProperty.call(nets, ref)) { continue; }
                    const basis = toNum(rec.getSublistValue({ sublistId, fieldId: 'taxbasis', line }));
                    if (cents(basis) === cents(nets[ref])) { continue; }
                    rec.selectLine({ sublistId, line });
                    tax.recalcAmount(rec, nets);
                    rec.commitLine({ sublistId });
                }
            } catch (e) {
                logError('fix tax basis', e);
            } finally {
                state.fixingBasis = false;
            }
        },

        // Tax Code changed -> Tax Rate + Tax Amount
        applyRateFromCode: (rec) => {
            if (!isOverride(rec)) { return; }
            try {
                const taxCode = rec.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode' });
                if (!taxCode) { return; }
                const rate = tax.getRate(taxCode);
                if (rate === null) { return; }   // never overwrite with 0 when the rate is unknown
                const basis = tax.pushNetToBasis(rec);
                rec.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxrate', value: rate * 100, ignoreFieldChange: true });
                rec.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxamount', value: round2(basis * rate), ignoreFieldChange: true });
            } catch (e) {
                logError('apply tax rate', e);
            }
        },

        // Tax Basis / Tax Rate changed -> Tax Amount, from the line's current rate (keeps a manual rate)
        recalcAmount: (rec, nets) => {
            if (!isOverride(rec)) { return; }
            try {
                const basis = tax.pushNetToBasis(rec, nets);
                const ratePct = toNum(rec.getCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxrate' }));
                rec.setCurrentSublistValue({ sublistId: 'taxdetails', fieldId: 'taxamount', value: round2(basis * ratePct / 100), ignoreFieldChange: true });
            } catch (e) {
                logError('recalc tax amount', e);
            }
        }
    };

    // ------------------------------------------------------------------------------------------
    // 2b. TAX DETAILS VALIDATION (save)
    // ------------------------------------------------------------------------------------------

    const taxCheck = {
        // returns a list of error messages (empty = ok)
        run: (rec) => {
            // @@NOTE: without the override the SuiteTax engine recalculates the tax details on submit
            //         (and the client-side sublist may be empty / stale), so there is nothing to validate.
            if (!isOverride(rec)) { return []; }

            const errors = [];
            const lines = taxCheck.getLines(rec);
            const details = taxCheck.getTaxDetails(rec);

            // 1. lines net vs tax basis
            // @@NOTE: tax basis is counted once per tax details reference (per reference: summed within
            //         each tax type, then the largest tax type taken), so a line carrying more than one
            //         tax type is not counted twice, while a basis split across codes still adds up.
            const basisByRef = {};
            details.forEach((td) => {
                const ref = td.ref || `#${td.line}`;
                basisByRef[ref] = basisByRef[ref] || {};
                const type = td.taxType || '-';
                basisByRef[ref][type] = (basisByRef[ref][type] || 0) + td.basis;
            });
            const refBasis = {};
            Object.keys(basisByRef).forEach((ref) => {
                const perType = Object.keys(basisByRef[ref]).map(t => basisByRef[ref][t]);
                refBasis[ref] = perType.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0);
            });

            const linesNet = lines.reduce((tot, l) => tot + l.net, 0);
            const taxNet = Object.keys(refBasis).reduce((tot, ref) => tot + refBasis[ref], 0);

            if (Math.abs(cents(linesNet) - cents(taxNet)) > TOLERANCE_CENTS) {
                errors.push(`Total net of the lines (${fmt(linesNet)}) does not match the total Tax Basis of the Tax Details (${fmt(taxNet)}). Difference: ${fmt(linesNet - taxNet)}.`);

                // detail: which lines are out, when the lines carry their tax details reference
                lines.forEach((l) => {
                    if (!l.ref) { return; }
                    const basis = refBasis[l.ref] || 0;
                    if (Math.abs(cents(l.net) - cents(basis)) > TOLERANCE_CENTS) {
                        errors.push(`${l.label} (${l.ref}): net ${fmt(l.net)} but Tax Basis ${fmt(basis)}.`);
                    }
                });
            }

            // 2. tax basis x rate vs tax amount, per tax details line
            details.forEach((td) => {
                const expected = cents(td.basis * td.rate / 100);
                if (Math.abs(expected - cents(td.amount)) > TOLERANCE_CENTS) {
                    const name = [td.ref, td.taxCode].filter(Boolean).join(' / ');
                    errors.push(`Tax Details line ${td.line + 1}${name ? ` (${name})` : ''}: ${fmt(td.basis)} x ${td.rate}% = ${fmt(expected / 100)}, but Tax Amount is ${fmt(td.amount)}.`);
                }
            });

            return errors;
        },

        getLines: (rec) => {
            const lines = [];
            LINE_SUBLISTS.forEach((sublistId) => {
                const count = rec.getLineCount({ sublistId }) || 0;
                for (let line = 0; line < count; line++) {
                    if (sublistId === 'item') {
                        const itemType = rec.getSublistValue({ sublistId, fieldId: 'itemtype', line });
                        if (SKIP_ITEM_TYPES.indexOf(itemType) >= 0) { continue; }
                    }
                    lines.push({
                        label: `${sublistId === 'item' ? 'Item' : 'Expense'} line ${line + 1}`,
                        ref: rec.getSublistValue({ sublistId, fieldId: 'taxdetailsreference', line }) || '',
                        net: toNum(rec.getSublistValue({ sublistId, fieldId: 'amount', line }))
                    });
                }
            });
            return lines;
        },

        getTaxDetails: (rec) => {
            const sublistId = 'taxdetails';
            const count = rec.getLineCount({ sublistId }) || 0;
            const details = [];
            for (let line = 0; line < count; line++) {
                details.push({
                    line,
                    ref: rec.getSublistValue({ sublistId, fieldId: 'taxdetailsreference', line }) || '',
                    taxType: rec.getSublistValue({ sublistId, fieldId: 'taxtype', line }) || '',
                    taxCode: rec.getSublistText({ sublistId, fieldId: 'taxcode', line }) || '',
                    basis: toNum(rec.getSublistValue({ sublistId, fieldId: 'taxbasis', line })),
                    // percent field: 23 for 23% (may come back as "23%" / "23.0%")
                    rate: toNum(rec.getSublistValue({ sublistId, fieldId: 'taxrate', line })),
                    amount: toNum(rec.getSublistValue({ sublistId, fieldId: 'taxamount', line }))
                });
            }
            return details;
        }
    };

    // ------------------------------------------------------------------------------------------
    // 3. PO OVER-BILLING CAP (vendor bill item lines sourced from a PO)
    // ------------------------------------------------------------------------------------------

    const poCap = {
        keyOf: (orderdoc, orderline) => (orderdoc && !isBlank(orderline) ? `${orderdoc}:${orderline}` : null),

        currentKey: (rec) => poCap.keyOf(
            rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'orderdoc' }),
            rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'orderline' })
        ),

        // pageInit: one query for every PO referenced by the bill
        init: (rec, mode) => {
            const count = rec.getLineCount({ sublistId: 'item' }) || 0;
            const docs = {};
            const savedOnThisBill = {};
            for (let line = 0; line < count; line++) {
                const orderdoc = rec.getSublistValue({ sublistId: 'item', fieldId: 'orderdoc', line });
                const key = poCap.keyOf(orderdoc, rec.getSublistValue({ sublistId: 'item', fieldId: 'orderline', line }));
                if (!key) { continue; }
                docs[orderdoc] = true;
                savedOnThisBill[key] = (savedOnThisBill[key] || 0) + toNum(rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line }));
            }
            // @@NOTE: the PO's quantity billed already includes what THIS bill had when it was saved.
            //         Kept in state and added back in load(), so 'remaining' always means "left for this
            //         bill" - also when the PO is only loaded later (lazy load after a failed pageInit query).
            state.savedOnBill = mode === 'edit' ? savedOnThisBill : {};
            poCap.load(Object.keys(docs));
        },

        // load PO line rate / remaining quantity for the given PO ids (skips those already loaded)
        // @@NOTE: the bill line 'orderline' is matched against the PO's transactionline.id (= the PO
        //         sublist 'line' value). Quantities are taken as absolute values to be sign-agnostic.
        // @@NOTE: transactionline quantities are in BASE units, bill lines in transaction units: divide by
        //         the line's unit conversion rate. If the units join fails, retry without it (conv = 1).
        load: (orderdocs) => {
            const ids = orderdocs.filter(id => id && !state.poLoaded[id]);
            if (!ids.length) { return; }
            const run = (withUnits) => query.runSuiteQL({
                query: `SELECT tl.transaction AS po, tl.id AS line, tl.quantity AS qty, tl.quantitybilled AS billed,
                               tl.rate AS rate, tl.foreignamount AS amount, ${withUnits ? 'NVL(u.conversionrate, 1)' : '1'} AS conv
                        FROM transactionline tl
                        ${withUnits ? 'LEFT JOIN unitstypeuom u ON u.internalid = tl.units' : ''}
                        WHERE tl.transaction IN (${ids.map(() => '?').join(',')})
                          AND tl.mainline = 'F'`,
                params: ids
            }).asMappedResults();
            try {
                let rows;
                try {
                    rows = run(true);
                } catch (e) {
                    logError('PO lines lookup (units)', e);
                    rows = run(false);
                }
                rows.forEach((r) => {
                    const conv = toNum(r.conv) || 1;
                    const qty = Math.abs(toNum(r.qty)) / conv;
                    // no conversion: the PO rate as entered; with units: value per transaction unit
                    let rate = conv === 1 ? Math.abs(toNum(r.rate)) : 0;
                    if (!rate && qty) { rate = Math.abs(toNum(r.amount)) / qty; }
                    if (!rate) { return; }
                    const key = poCap.keyOf(r.po, r.line);
                    state.po[key] = {
                        rate,
                        remaining: roundTo(qty - Math.abs(toNum(r.billed)) / conv + (state.savedOnBill[key] || 0), QTY_DECIMALS)
                    };
                });
                ids.forEach((id) => { state.poLoaded[id] = true; });
            } catch (e) {
                logError('PO lines lookup', e);
            }
        },

        // PO line info for the current line (lazy-loads a PO added after pageInit) or null
        current: (rec) => {
            const key = poCap.currentKey(rec);
            if (!key) { return null; }
            if (!state.po[key]) {
                poCap.load([rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'orderdoc' })]);
            }
            return state.po[key] ? { key, rate: state.po[key].rate, remaining: poCap.remainingFor(rec, key) } : null;
        },

        // what this line can still bill: PO remaining minus other lines of this bill on the same PO line
        remainingFor: (rec, key) => {
            const current = rec.getCurrentSublistIndex({ sublistId: 'item' });
            const count = rec.getLineCount({ sublistId: 'item' }) || 0;
            let used = 0;
            for (let line = 0; line < count; line++) {
                if (line === current) { continue; }
                const k = poCap.keyOf(
                    rec.getSublistValue({ sublistId: 'item', fieldId: 'orderdoc', line }),
                    rec.getSublistValue({ sublistId: 'item', fieldId: 'orderline', line })
                );
                if (k === key) { used += toNum(rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line })); }
            }
            return Math.max(0, roundTo(state.po[key].remaining - used, QTY_DECIMALS));
        },

        setLine: (rec, qty, rate, amount) => {
            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qty, ignoreFieldChange: true });
            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rate, ignoreFieldChange: true });
            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: amount, ignoreFieldChange: true });
        },

        // over what's left on the PO line, in quantity OR in value (the quantity tolerance alone would let
        // a high-rate line bill up to rate x tolerance over the PO value)
        isOver: (po, qty, amount) => qty > po.remaining + QTY_TOLERANCE
            || (amount !== undefined && cents(amount) > cents(po.remaining * po.rate) + TOLERANCE_CENTS),

        // fieldChanged on item.amount / item.quantity
        onEdit: (rec, fieldId) => {
            try {
                const po = poCap.current(rec);
                if (!po) { return; }   // not a PO line - leave it alone

                if (fieldId === 'amount') {
                    const typedAmount = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'amount' });
                    if (isBlank(typedAmount)) { return; }
                    const amount = toNum(typedAmount);
                    const qty = roundTo(amount / po.rate, QTY_DECIMALS);
                    if (poCap.isOver(po, qty, amount)) {
                        poCap.cap(rec, po);
                    } else {
                        // keep the amount exactly as typed (it must match the vendor invoice)
                        poCap.setLine(rec, qty, po.rate, amount);
                    }
                } else {
                    const typedQty = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' });
                    if (isBlank(typedQty)) { return; }
                    const qty = roundTo(toNum(typedQty), QTY_DECIMALS);
                    if (qty > po.remaining + QTY_TOLERANCE) {
                        poCap.cap(rec, po);
                    } else {
                        poCap.setLine(rec, qty, po.rate, round2(qty * po.rate));
                    }
                }
            } catch (e) {
                logError('PO cap', e);
            }
        },

        // validateLine on item: final safety net before the line is committed (never blocks)
        onCommit: (rec) => {
            try {
                const po = poCap.current(rec);
                if (!po) { return; }
                const qty = roundTo(toNum(rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' })), QTY_DECIMALS);
                const amount = toNum(rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'amount' }));
                if (poCap.isOver(po, qty, amount)) {
                    poCap.cap(rec, po);
                    return;
                }
                // rate changed directly -> back to the PO rate (amount follows); otherwise leave the typed amount
                const rate = toNum(rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'rate' }));
                if (Math.abs(rate - po.rate) > 0.000001) {
                    poCap.setLine(rec, qty, po.rate, round2(qty * po.rate));
                }
            } catch (e) {
                logError('PO cap (commit)', e);
            }
        },

        cap: (rec, po) => {
            const amount = round2(po.remaining * po.rate);
            poCap.setLine(rec, po.remaining, po.rate, amount);

            // dedupe: don't pop the same note again when the already-corrected line is re-validated
            if (state.notified[po.key] !== undefined && Math.abs(state.notified[po.key] - amount) < 0.005) { return; }
            state.notified[po.key] = amount;

            alert(
                'This line would bill higher than what is left on the PO at the ' +
                'agreed rate. Quantity and Amount have both been corrected back to ' +
                'exactly what remains (' + fmt(amount) + ' at ' + po.rate + '/unit, ' +
                po.remaining + ' units) - this line cannot bill beyond the PO as it ' +
                'currently stands.\n\n' +
                'If more than this genuinely needs to be invoiced, the Purchase ' +
                'Order must be amended first - add quantity/value to this line, ' +
                'or add a new PO line - before the additional amount can be billed.'
            );
        }
    };

    // ------------------------------------------------------------------------------------------
    // ENTRY POINTS
    // ------------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------------
    // TAX TAB HOOK: fix the Tax Basis when the user opens the tax details tab
    // ------------------------------------------------------------------------------------------

    // @@NOTE: by the time the user clicks the tab NetSuite has normally finished recalculating the tax
    //         details (it hasn't yet in sublistChanged / postSourcing). If it is still recalculating, the
    //         save pass corrects it anyway. Delegated listener on document (capture), so it survives
    //         NetSuite re-rendering the tab bar and fires even if NetSuite stops the click propagating.
    // @@REVIEW: relies on NetSuite's DOM (tab element id TAX_TAB_ID) - not a supported API.
    const tabHook = {
        attach: () => {
            if (state.tabHooked || typeof document === 'undefined' || !document.addEventListener) { return; }
            try {
                document.addEventListener('click', tabHook.onClick, true);
                state.tabHooked = true;
            } catch (e) {
                logError('tax tab hook', e);
            }
        },

        onClick: (event) => {
            try {
                const target = event && event.target;
                const tab = target && target.closest ? target.closest(`#${TAX_TAB_ID}`) : null;
                if (!tab || !state.rec) { return; }
                tax.fixAllBasis(state.rec);
            } catch (e) {
                logError('tax tab click', e);
            }
        }
    };

    const pageInit = (context) => {
        const rec = context.currentRecord;
        state.features = FEATURES[rec.type] || DEFAULT_FEATURES;
        state.rateCache = {};
        state.po = {};
        state.poLoaded = {};
        state.savedOnBill = {};
        state.notified = {};
        state.rec = rec;

        // new docs only: the tax details generated with the form can carry a wrong Tax Basis, but they are
        // not ready yet here - fixed on the first taxregoverride sourcing instead (see postSourcing)
        state.pendingOpenFix = !!state.features.tax && (context.mode === 'create' || context.mode === 'copy');

        if (state.features.tax) {
            tabHook.attach();
        }

        if (state.features.poCap) {
            try {
                poCap.init(rec, context.mode);
            } catch (e) {
                logError('PO cap init', e);
            }
        }
    };

    // @@NOTE: the tax code is handled in both fieldChanged and postSourcing: postSourcing re-applies the
    //         rate after any native sourcing triggered by the tax code (it only fires if the field sources
    //         something). The write is idempotent and the rate is cached, so running twice is harmless.
    const postSourcing = (context) => {
        if (state.features.tax && context.sublistId === 'taxdetails' && context.fieldId === 'taxcode') {
            tax.applyRateFromCode(context.currentRecord);
        }
        // @@NOTE: on a new doc NetSuite sources taxregoverride once it has generated the tax details: that's
        //         the first point where they can be fixed (in pageInit they are not ready yet). Once only.
        if (state.pendingOpenFix && context.fieldId === 'taxregoverride') {
            state.pendingOpenFix = false;
            tax.fixAllBasis(context.currentRecord);
        }
    };

    const fieldChanged = (context) => {
        const rec = context.currentRecord;
        const sublistId = context.sublistId;
        const fieldId = context.fieldId;

        if (state.features.project && fieldId === FLD.PROJECT && PROJECT_TARGET[sublistId]) {
            project.copy(rec, sublistId);
            return;
        }

        if (state.features.tax && sublistId === 'taxdetails') {
            if (fieldId === 'taxcode') {
                tax.applyRateFromCode(rec);
            } else if (fieldId === 'taxbasis' || fieldId === 'taxrate') {
                tax.recalcAmount(rec);
            }
            return;
        }

        if (state.features.poCap && sublistId === 'item' && (fieldId === 'amount' || fieldId === 'quantity')) {
            poCap.onEdit(rec, fieldId);
        }
    };

    const validateLine = (context) => {
        if (state.features.poCap && context.sublistId === 'item') {
            poCap.onCommit(context.currentRecord);
        }
        return true;
    };

    // @@NOTE: the Tax Basis auto-fix (FEATURES.tax) and the tax details validation (FEATURES.taxCheck) are
    //         separate features: e.g. orders / invoices are validated but not auto-fixed.
    const saveRecord = (context) => {
        if (state.features.tax) {
            // last pass: Tax Basis = bill line net on every tax details line before validating
            tax.fixAllBasis(context.currentRecord);
        }
        if (!state.features.taxCheck) { return true; }

        let errors;
        try {
            errors = taxCheck.run(context.currentRecord);
        } catch (e) {
            logError('tax validation', e);
            errors = [`The tax details could not be validated (${e && e.message ? e.message : e}).`];
        }
        if (!errors.length) { return true; }

        dialog.alert({
            title: 'Tax Details validation failed',
            message: `The transaction cannot be saved:<br><br>${errors.map(e => `&bull; ${escHtml(e)}`).join('<br>')}`
        });
        return false;
    };

    return {
        pageInit,
        postSourcing,
        fieldChanged,
        validateLine,
        saveRecord
    };
});
