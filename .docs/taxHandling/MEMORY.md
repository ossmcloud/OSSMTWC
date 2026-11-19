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
| `taxRecalc`: editing a Tax Details line: Tax Code → Rate + Tax Amount; Tax Basis / Rate → Tax Amount; a typed basis is kept | All except Journal (Vendor Bill, Vendor Credit, PO, Vendor Return, Invoice, Credit Memo, Sales Order, Sales Return) |
| `tax`: Tax Basis correction of all lines (new doc open, Tax Details tab click, save) | Vendor Bill, Vendor Credit |
| `taxCheck`: save blocked if lines net ≠ total Tax Basis, or a line's Tax Rate ≠ its Tax Code's rate (0.001 points tolerance), or Basis × Rate ≠ Tax Amount (1 cent tolerance) | Vendor Bill, Vendor Credit, PO, Vendor Return, Invoice, Credit Memo, Sales Order, Sales Return |
| `poCap`: PO over-billing cap | Vendor Bill, Vendor Credit |
| `poBilled`: a PO item line with a quantity billed can't be committed below the billed quantity, or below the billed value (qty billed × the line's rate on page load). Blocks the line (`validateLine` returns false). Added 2026-11-19. | Purchase Order |

Everything tax-related runs **only when Tax Details Override is ticked**. Without it, SuiteTax recalculates on submit and would discard the changes.

## Key decisions and why (don't re-litigate)

- **Tax Basis = the net `amount` of the transaction line, matched by `taxdetailsreference`.** The Tax Details line's own `netamount` is wrong or stale, so it is not used.
- **Tax Basis is pushed in before every Tax Amount calculation:** on tax code, basis or rate changes, **except on a line whose Tax Basis the user typed by hand** (2026-11-13, user request: "if the net value is changed manually leave it even if wrong"). A typed basis is remembered per `taxdetailsreference|taxtype` for the page load (`state.manualBasis`). The tax is recalculated from it, and `fixAllBasis` (tab click / save) skips it, so a wrong typed basis is reported by the save check. `@@REVIEW`: this assumes `fieldChanged` on `taxbasis` fires only for user edits.
- **`tax.fixAllBasis` runs:**
  - on new documents (create/copy) only, once, on the first `postSourcing` of `taxregoverride`. The user chose this trigger; in `pageInit` the tax details aren't ready yet.
  - when the Tax Details tab (`taxestxt`) is clicked, via a delegated document click listener (tagged `@@REVIEW` because it relies on NetSuite's page structure);
  - in `saveRecord`, before the check.
- **Never from `sublistChanged` / `postSourcing` on line edits.** NetSuite recalculates the tax details asynchronously, so the values are still stale at that point. This was tried and reverted.
- **`fixAllBasis` first removes orphan Tax Details lines,** whose reference is no longer on any item or expense line. It never removes lines with a blank reference, and removes nothing if no bill line exposes a reference.
- **The tax check blocks the save** (it doesn't just warn). It uses `dialog.alert` and lists every problem.
- **The tax code's rate is the one valid on the transaction date** (`trandate`, today if blank): Valid From ≤ date ≤ Valid Until, with a blank date meaning open-ended. If several rows are valid, the latest Valid From wins. If SuiteQL rejects the date field ids, the lookup falls back to the newest active row for the rest of the page, and the error is logged to the console.
- **Tax Rate must equal the Tax Code's rate** (added 2026-11-13, user request). A manually typed rate is still kept while editing (Tax Amount recalculates from it), but the save is then blocked. If the code's rate can't be read (lookup error or no active rate row) that line isn't rate-checked, so a lookup problem never blocks a save.
- **The PO cap was rewritten:**
  - the remaining quantity per PO line is loaded with SuiteQL in `pageInit` (with units-of-measure conversion), and the bill's own saved quantity is added back in edit mode;
  - it only acts on lines with `orderdoc` + `orderline`;
  - the typed amount is kept, the rate is locked to the PO rate, and an over-limit line is corrected to what remains with a message (not blocked).
- **Client script only for now.** A User Event (`beforeSubmit`) for CSV, integration or scripted entry is a possible later phase.

## Status

- [x] Script written, mock harness 94/94 (`run15.js`) (scratchpad only, not in the repo)
- [x] Sandbox: deployed on 9 record types, old scripts undeployed. Validated by the user:
  - the rate comes back as a decimal (0.135);
  - the record type ids are right;
  - the Vendor Credit PO cap is as intended;
  - the old scripts are retired.
- [x] UAT script + live deployment doc written
- [ ] UAT executed and signed off
- [ ] Production deployment
- [ ] `oTWC_populate_tax_cs.js` (tracked in git) still in `FileCabinet/SuiteScripts/OSSMTWC/`; remove it after go-live
- [x] Tax rate lookup filtered by effective date (2026-11-13)
- [ ] Confirm the rate record's validity date field ids (`RATE_FROM_FIELD` / `RATE_UNTIL_FIELD`, tagged `@@REVIEW @@GO-LIVE`) in sandbox and production (deployment step 1.7)

## Gotchas

- `currentRecord.type` ids: `vendorreturnauthorization` = Vendor Return, `returnauthorization` = Sales Return.
- The Tax Details tab element id is `taxestxt`, confirmed on the bill form. Check it on other forms if the tab fix doesn't fire.
- A record type not in `FEATURES` silently gets the project copy only.
