# Tax Handling client script: production deployment

**Script file:** `oTWC_taxHandling_cs.js` → File Cabinet `SuiteScripts/OSSMTWC/`
**Type:** Client Script (SuiteScript 2.1). No bundle dependency, no hard-coded internal ids.
**Replaces:** 5 older client scripts (see step 5).

Do steps 4 to 6 in **one window**, ideally outside AP / AR working hours. Old and new scripts must never run together: users would get duplicate alerts and fields written twice.

---

## 0. Go / no-go

- [ ] UAT (`.docs/handleTax_UAT.md`) signed off, with no open blocking issues.
- [ ] Decision recorded on **PO cap on Vendor Credit** (UAT test E10):
  - **Keep:** no change.
  - **Remove:** change `vendorcredit: BILL_FEATURES` in `FEATURES` to `vendorcredit: { project: true, tax: true, taxCheck: true }`, re-test UAT E10, and use that file.
- [ ] The exact file to deploy is the one tested in sandbox, committed in git. Note the commit hash: ____________
- [ ] Deployment window agreed and users told: ____________

---

## 1. Production prerequisites (check, don't change)

| # | Check | How | OK |
|---|---|---|---|
| 1.1 | **SuiteTax** is enabled and the SuiteTax rate custom record exists. | Customization → Lists, Records & Fields → Record Types → `customrecord_ste_taxrate` exists. | ☐ |
| 1.2 | The rate comes back as a **decimal** (0.23, not 23). | Run in a SuiteQL tool: `SELECT custrecord_ste_taxrate_rate FROM customrecord_ste_taxrate WHERE ROWNUM <= 5` → values like `0.23` / `0.135`. **If they're 23 / 13.5, stop: the script would write 100× rates.** | ☐ |
| 1.3 | The **Project** line field `custcol_ossm_twcm_project` exists and is applied to Purchase, Sale and Journal lines (same as sandbox). | Customization → Transaction Line Fields. | ☐ |
| 1.4 | The transaction forms used in production show the same fields as sandbox: Tax Details subtab with **Tax Details Override**, Tax Details Reference, and the Customer:Project / Name columns. | Open one of each record type in production. | ☐ |
| 1.5 | The **Tax Details** tab element id is `taxestxt` on the production Vendor Bill / Vendor Credit forms. | Open a bill → F12 → inspect the Tax Details tab → id = `taxestxt`. If it's different, update `TAX_TAB_ID` in the script **before** uploading. | ☐ |
| 1.6 | AP and AR roles can run SuiteQL on `customrecord_ste_taxrate` and on transactions. | Same permissions as the sandbox roles used for UAT F5. | ☐ |

---

## 2. Record what's currently deployed (rollback reference)

Customization → Scripting → Script Deployments, filter by record type. List every **client script** deployment on the 9 record types below:

Vendor Bill, Vendor Credit, Purchase Order, Vendor Return Authorization, Invoice, Credit Memo, Sales Order, Return Authorization, Journal Entry.

| Script (name / id) | File | Record type | Deployment id | Status before |
|---|---|---|---|---|
| | | | | |

The scripts below **must** appear in this list (they are the ones being replaced). Note their exact ids:
- PO cap: script `customscript_ossm_twcm_si_qty` (file `ossm_bill_amount_to_qty_cs.js` / `tl_ossm_bill_amount_to_qty_cs.js`)
- Tax override automation: file `tl_ossm_tax_details_override_automation.js`
- Project copy: file `tl_ossm_populate_transaction_line_fields.js`
- If they were ever deployed: `oTWC_populate_tax_cs.js`, `oTWC_vendorBill_taxValidation_cs.js`

Also check **Customization → Forms → Transaction Forms → [form] → Custom Code** for form-level client scripts pointing at any of these files.

---

## 3. Upload the file

1. Documents → Files → File Cabinet → `SuiteScripts/OSSMTWC/`.
2. Upload `oTWC_taxHandling_cs.js` (or push it with nsLink to the **production** account; check the target account first).
3. Open the uploaded file and check the first lines show `@NApiVersion 2.1` and `@NScriptType ClientScript`.

---

## 4. Create the script record and deployments

### 4.1 Script record

Customization → Scripting → Scripts → New → select `oTWC_taxHandling_cs.js`.

| Field | Value |
|---|---|
| Name | OSSMTWC - Tax Handling CS |
| ID | `_otwc_taxhandling_cs` → `customscript_otwc_taxhandling_cs` (same as sandbox) |
| Page Init Function | `pageInit` |
| Post Sourcing Function | `postSourcing` |
| Field Changed Function | `fieldChanged` |
| Validate Line Function | `validateLine` |
| Save Record Function | `saveRecord` |
| All other functions | blank (in particular **not** `sublistChanged`) |

### 4.2 Deployments (one per record type)

For each row: **Applies To** = the record type, **Status = Released**, **Log Level = Error**, **Audience** = All Roles (or the same roles as sandbox), **Execution Context** = User Interface.

| # | Applies To (record) | Deployment ID (suggested) | Features the script enables |
|---|---|---|---|
| 1 | Vendor Bill | `customdeploy_otwc_taxhandling_vb` | project, tax, taxCheck, PO cap |
| 2 | Vendor Credit | `customdeploy_otwc_taxhandling_vc` | project, tax, taxCheck, PO cap (see step 0) |
| 3 | Purchase Order | `customdeploy_otwc_taxhandling_po` | project, taxCheck |
| 4 | Vendor Return Authorization | `customdeploy_otwc_taxhandling_vra` | project, taxCheck |
| 5 | Invoice | `customdeploy_otwc_taxhandling_inv` | project, taxCheck |
| 6 | Credit Memo | `customdeploy_otwc_taxhandling_cm` | project, taxCheck |
| 7 | Sales Order | `customdeploy_otwc_taxhandling_so` | project, taxCheck |
| 8 | Return Authorization (Sales Return) | `customdeploy_otwc_taxhandling_ra` | project, taxCheck |
| 9 | Journal Entry | `customdeploy_otwc_taxhandling_je` | project |

The script works out its features from the record type, so the deployments need no parameters.

---

## 5. Retire the old scripts (same window as step 4)

For every deployment listed in step 2 that belongs to a replaced script:

1. Open the deployment → **Status = Not Scheduled**, or untick **Deployed**. Don't delete it yet (see rollback).
2. Remove any form-level Custom Code references to the old files (noted in step 2).

| Old script | Record types | Undeployed |
|---|---|---|
| PO cap `customscript_ossm_twcm_si_qty` | Vendor Bill | ☐ |
| Tax override automation | Vendor Bill (+ any others found) | ☐ |
| Project copy | Vendor Bill, PO, Invoice, SO, Journal (+ any others found) | ☐ |
| `oTWC_populate_tax_cs.js` / `oTWC_vendorBill_taxValidation_cs.js` | if deployed | ☐ |

---

## 6. Smoke test in production (about 15 minutes, admin or AP lead)

Use real but low-risk data. **Don't save** anything you don't want to keep: test up to the point of saving and then **Cancel**, unless the step says otherwise.

| # | Test | Expected | OK |
|---|---|---|---|
| 6.1 | Vendor Bill → item line → set **Project**. | Customer:Project filled immediately. | ☐ |
| 6.2 | Vendor Bill from an open PO → open the Tax Details tab with override ticked. | Tax Basis = line net on every Tax Details line, Tax Amount = Basis × Rate. | ☐ |
| 6.3 | Same bill → set a tax line's Tax Amount wrong → Save. | Blocked by **"Tax Details validation failed"**. Then Cancel. | ☐ |
| 6.4 | Same bill → type an Amount over what's left on the PO line. | Corrected to what remains, with the PO-cap message. Then Cancel. | ☐ |
| 6.5 | Invoice → item line with Project → override ticked, wrong Tax Amount → Save. | Blocked. Then Cancel. | ☐ |
| 6.6 | Journal Entry → line with Project. | Name filled. Cancel. | ☐ |
| 6.7 | Browser console (F12) during 6.1-6.6. | No `oTWC_taxHandling_cs (...)` errors. Only **one** alert per failed save. | ☐ |

If any test fails, see **Rollback**.

---

## 7. Post-deployment

- [ ] Tell AP / AR users it's live. Key points:
  - Tax Basis is corrected automatically on bills and credits.
  - Saving is blocked when the tax details don't match the lines (with Tax Details Override on).
  - Bills can't exceed what's left on the PO line.
- [ ] Monitor for 1 week: user reports, plus Script Deployments → Execution Log (Log Level = Error) for the new script.
- [ ] After 2 weeks with no issues:
  - delete the old script deployments and script records;
  - archive the old files in the File Cabinet (move them to an `_archive` folder rather than deleting them);
  - remove the five old files from the git repo and commit.
- [ ] Open item to schedule (`@@TODO` in the script): filter the tax rate lookup by effective date once the rate record's date fields are confirmed. Today, a tax code with more than one active rate row uses the newest row.

---

## Rollback

The change is configuration only, so rollback takes about 5 minutes:

1. Set the 9 `oTWC_taxHandling_cs` deployments to **Not Scheduled** (or untick **Deployed**).
2. Set the old deployments recorded in step 2 back to their previous status (**Released**).
3. Restore any form-level Custom Code references removed in step 5.
4. Re-run smoke test 6.1 to confirm the old behaviour is back.
5. Record what failed, with screenshots and console output, for analysis in sandbox.

Data saved while the new script was live doesn't need correcting. The script only changes values the user can see on screen before saving.
