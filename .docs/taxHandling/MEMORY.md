# Tax Handling: project memory

What was done, why, and what is still open. Written 2026-11-13.

## Files in this folder

| File | What |
|---|---|
| `MEMORY.md` | This file |
| `handleTax_UAT.md` | UAT test script for users |
| `handleTax_LIVE_DEPLOYMENT.md` | Step by step production deployment, with rollback |
| `tl_ossm_*.js`, `oTWC_vendorBill_taxValidation_cs.js` | **Archived** old scripts, replaced by `oTWC_taxHandling_cs.js`. Kept for reference only; don't deploy. |

The live code is `FileCabinet/SuiteScripts/OSSMTWC/oTWC_taxHandling_cs.js`.

## The problem

Five overlapping client scripts on Vendor Bill (and other transactions), from two authors, with real bugs:

| Old script | Did | Main bugs |
|---|---|---|
| `oTWC_populate_tax_cs.js` | Tax code → rate + amount on Tax Details | Never deployed; its first version never worked |
| `tl_ossm_tax_details_override_automation.js` | Copy of the above + save check | `async` handler hid errors, SQL built by string interpolation, could write a 0% rate, overwrote manual rates, not gated on override |
| `oTWC_vendorBill_taxValidation_cs.js` | Save check: lines vs tax details | Written in this session, never deployed |
| `tl_ossm_bill_amount_to_qty_cs.js` (script `customscript_ossm_twcm_si_qty`) | PO over-billing cap | Tracked lines by position (broke when lines were added or removed), wrong baseline on saved bills, capped manual lines, amount drifted by a few cents |
| `tl_ossm_populate_transaction_line_fields.js` | Project column → Customer:Project / Name | A 100 ms `setTimeout` raced the line commit, so a line could save with a blank customer |

## The solution: `oTWC_taxHandling_cs.js`

One client script. Its features are chosen by record type through the `FEATURES` map (`currentRecord.type`):

| Feature | Record types |
|---|---|
| `project`: Project → Customer:Project (item/expense) / Name (journal), set synchronously | All, including any type not listed |
| `tax`: Tax Details autofill + Tax Basis correction | Vendor Bill, Vendor Credit |
| `taxCheck`: save blocked if lines net ≠ total Tax Basis, or Basis × Rate ≠ Tax Amount (1 cent tolerance) | Vendor Bill, Vendor Credit, PO, Vendor Return, Invoice, Credit Memo, Sales Order, Sales Return |
| `poCap`: PO over-billing cap | Vendor Bill, Vendor Credit |

Everything tax-related runs **only when Tax Details Override is ticked**. Without it, SuiteTax recalculates on submit and would discard the changes.

## Key decisions and why (don't re-litigate)

- **Tax Basis = the net `amount` of the transaction line, matched by `taxdetailsreference`.** The Tax Details line's own `netamount` is wrong or stale, so it is not used.
- **Tax Basis is pushed in before every Tax Amount calculation:** on tax code, basis or rate changes.
- **`tax.fixAllBasis` runs:**
  - on new documents (create/copy) only, once, on the first `postSourcing` of `taxregoverride`. The user chose this trigger; in `pageInit` the tax details aren't ready yet.
  - when the Tax Details tab (`taxestxt`) is clicked, via a delegated document click listener (tagged `@@REVIEW` because it relies on NetSuite's page structure);
  - in `saveRecord`, before the check.
- **Never from `sublistChanged` / `postSourcing` on line edits.** NetSuite recalculates the tax details asynchronously, so the values are still stale at that point. This was tried and reverted.
- **`fixAllBasis` first removes orphan Tax Details lines,** whose reference is no longer on any item or expense line. It never removes lines with a blank reference, and removes nothing if no bill line exposes a reference.
- **The tax check blocks the save** (it doesn't just warn). It uses `dialog.alert` and lists every problem.
- **The PO cap was rewritten:**
  - the remaining quantity per PO line is loaded with SuiteQL in `pageInit` (with units-of-measure conversion), and the bill's own saved quantity is added back in edit mode;
  - it only acts on lines with `orderdoc` + `orderline`;
  - the typed amount is kept, the rate is locked to the PO rate, and an over-limit line is corrected to what remains with a message (not blocked).
- **Client script only for now.** A User Event (`beforeSubmit`) for CSV, integration or scripted entry is a possible later phase.

## Status

- [x] Script written, mock harness 64/64 (scratchpad only, not in the repo)
- [x] Sandbox: deployed on 9 record types, old scripts undeployed. Validated by the user:
  - the rate comes back as a decimal (0.135);
  - the record type ids are right;
  - the Vendor Credit PO cap is as intended;
  - the old scripts are retired.
- [x] UAT script + live deployment doc written
- [ ] UAT executed and signed off
- [ ] Production deployment
- [ ] `oTWC_populate_tax_cs.js` (tracked in git) still in `FileCabinet/SuiteScripts/OSSMTWC/`; remove it after go-live
- [ ] `@@TODO`: filter the tax rate lookup by effective date (today a tax code with several active rate rows uses the newest one)

## Gotchas

- `currentRecord.type` ids: `vendorreturnauthorization` = Vendor Return, `returnauthorization` = Sales Return.
- The Tax Details tab element id is `taxestxt`, confirmed on the bill form. Check it on other forms if the tab fix doesn't fire.
- A record type not in `FEATURES` silently gets the project copy only.
