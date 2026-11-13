# Tax Handling client script: UAT test script

**Script:** `SuiteScripts/OSSMTWC/oTWC_taxHandling_cs.js` (Client Script)
**Environment:** Sandbox
**Tester:** ______________________  **Date:** ____________  **Build / file date:** ____________

---

## 1. What is being tested

One client script now replaces five older scripts. It does four jobs, switched on per record type:

| Feature | What it does | Record types |
|---|---|---|
| **Project copy** | Choosing a project in the line column **Project** (`custcol_ossm_twcm_project`) copies it into the native **Customer:Project** column (item / expense lines) or **Name** column (journal lines). Clearing the project clears it. | All record types the script is deployed on |
| **Tax handling** | With **Tax Details Override** ticked:<br>• picking a tax code on a Tax Details line fills **Tax Rate** and **Tax Amount**;<br>• changing **Tax Basis** or **Tax Rate** recalculates **Tax Amount**;<br>• **Tax Basis** is always set to the net amount of the transaction line it belongs to;<br>• Tax Details lines whose transaction line was deleted are removed. | Vendor Bill, Vendor Credit |
| **Tax check** | With **Tax Details Override** ticked, **Save is blocked** when:<br>• the total net of the lines doesn't match the total Tax Basis, **or**<br>• Tax Basis × Tax Rate doesn't match the Tax Amount on any Tax Details line (1 cent tolerance). | Vendor Bill, Vendor Credit, Purchase Order, Vendor Return, Invoice, Credit Memo, Sales Order, Sales Return |
| **PO cap** | On item lines that came from a PO:<br>• you type the invoiced **Amount** and **Quantity** is worked out at the PO rate;<br>• **Rate** is always the PO rate;<br>• a line can never bill more than is left on the PO line: if it would, Quantity and Amount are corrected to what remains and a message is shown. | Vendor Bill, Vendor Credit |

**When the Tax Basis is corrected** (Vendor Bill and Vendor Credit, override ticked):
- **New documents only:** once, automatically, as soon as NetSuite has generated the tax details.
- **Any document:** when the **Tax Details** tab is clicked.
- **Any document:** on **Save**, just before the tax check.

---

## 2. Before you start

### 2.1 Test data

Fill in the internal ids / names you will use.

| Ref | Data | Value used |
|---|---|---|
| D1 | Vendor (SuiteTax nexus Ireland) | |
| D2 | Customer | |
| D3 | Project (for the Project column) | |
| D4 | Tax code 23% | |
| D5 | Tax code 13.5% | |
| D6 | Tax code 0% | |
| D7 | Item A, no units of measure | |
| D8 | Item B, **with** units of measure (e.g. bought in boxes of 10), if used in the account | |
| D9 | **PO-1**: approved, 2 lines:<br>• Line 1: Item A, Qty 1, Rate 1,000.00 (lump sum)<br>• Line 2: Item A, Qty 10, Rate 50.00 | |
| D10 | **PO-2**: approved, 1 line: Item B (UOM), Qty 2 boxes, Rate 100.00 per box | |
| D11 | Expense account | |

### 2.2 Tester tips

- **Tax Details Override** is the checkbox on the **Tax Details** subtab. Many tests need it **ticked**; this is stated in each test.
- Keep the browser console open (F12 → Console). Any script problem is logged as `oTWC_taxHandling_cs (...)`. Note any such line in the Notes column, even if the test passes.
- **Pass** = the actual result matches the expected result exactly. Otherwise record **Fail** with a screenshot.

---

## 3. Tests

Result column: **P** = pass, **F** = fail, **N/A** = not applicable.

### A. Project copy (all record types)

| ID | Record | Steps | Expected | Result | Notes |
|---|---|---|---|---|---|
| A1 | Vendor Bill (item line) | New bill for D1 → add an item line → set **Project** = D3. | **Customer:Project** on the line shows D3 immediately, without having to leave the field. | | |
| A2 | Vendor Bill (item line) | Continue A1 → click **Add** / **OK** straight after picking the project. | The committed line keeps Customer:Project = D3. It must not be blank. | | |
| A3 | Vendor Bill (expense line) | Add an expense line (D11) → set **Project** = D3 → commit. | Customer:Project = D3 on the expense line. | | |
| A4 | Vendor Bill | Edit the line from A1 → clear **Project**. | Customer:Project is cleared too. | | |
| A5 | Journal Entry | New journal → on a line set **Project** = D3. | The **Name** column = D3. | | |
| A6 | Purchase Order | New PO → item line → **Project** = D3. | Customer:Project = D3. | | |
| A7 | Invoice | New invoice for D2 → item line → **Project** = D3. | Customer:Project = D3. | | |
| A8 | Sales Order | Same as A7 on a sales order. | Customer:Project = D3. | | |
| A9 | Vendor Credit, Credit Memo, Vendor Return, Sales Return | Repeat A1 on each. | Customer:Project = D3 on each. | | |

### B. Tax handling while editing: Vendor Bill (repeat B1-B6 on Vendor Credit as B1c-B6c)

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| B1 | New bill for D1 → item line Item A, Amount 100.00 → commit → **Tax Details** subtab → tick **Tax Details Override** → on the tax line for that item, set Tax Code = D4 (23%). | **Tax Rate** = 23%, **Tax Basis** = 100.00 (the item line's net), **Tax Amount** = 23.00. | | |
| B2 | Continue B1 → change the Tax Code to D5 (13.5%). | Tax Rate = 13.5%, Tax Basis = 100.00, Tax Amount = 13.50. | | |
| B3 | Continue → change **Tax Rate** by hand to 10%. | Tax Amount = 10.00. Tax Basis stays 100.00. | | |
| B4 | Continue → type **Tax Basis** = 80.00. | Tax Basis goes back to 100.00 (the line net) and Tax Amount is recalculated at the current rate. | | |
| B5 | Untick **Tax Details Override** → change a tax line's Tax Code. | The script changes nothing: no rate or amount filled in by the script. | | |
| B6 | Tick override → pick a tax code that has **no rate** set up (if one exists). | Rate and amount are left as they were, not set to 0. No error shown. | | |

### C. Tax Basis correction: Vendor Bill (repeat on Vendor Credit as C1c-C8c)

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| C1 | **New** bill from **PO-1** (PO → **Bill**). Wait for the page to load fully. Open **Tax Details** with override ticked. | Every Tax Details line has Tax Basis = the net of its bill line, and Tax Amount = Basis × Rate. Corrected automatically on open. | | |
| C2 | Continue C1 → **Expenses and Items** tab → change line 1 Amount to 600.00 → commit → click the **Tax Details** tab. | The Tax Details line for line 1 shows Tax Basis = 600.00, with Tax Amount recalculated. | | |
| C3 | Continue → change line 2 Amount → commit → **don't** open the Tax Details tab → **Save**. | The save goes through. Reopen the bill: line 2's Tax Basis = its net, Tax Amount correct. | | |
| C4 | **Edit** an existing saved bill whose Tax Basis is wrong (if available). | **Not** corrected on open, by design. Corrected when the **Tax Details** tab is clicked, or on Save. | | |
| C5 | Bill with 3 lines, override ticked, all tax lines correct → **delete** item line 2 → click the **Tax Details** tab. | The Tax Details line(s) for the deleted line are **removed**. The others stay. | | |
| C6 | As C5, but delete a line and **Save** without opening Tax Details. | Saves. Reopen: no Tax Details line left for the deleted line. | | |
| C7 | A bill line carrying **two tax types** (if the account uses more than one tax type on a line). | Both Tax Details lines keep Tax Basis = the line net. Neither is removed. | | |
| C8 | Override **unticked** → edit lines → open Tax Details → Save. | The script corrects or removes nothing. SuiteTax calculates the tax as normal on save. | | |

### D. Tax check on save (all tax-check record types)

For each record type, override must be ticked unless stated. **Blocked** means a pop-up titled **"Tax Details validation failed"** appears, lists every problem, and the record is **not** saved.

| ID | Record | Steps | Expected | Result | Notes |
|---|---|---|---|---|---|
| D1 | Vendor Bill | Correct tax details → Save. | Saves. | | |
| D2 | Vendor Bill | On a tax line, type **Tax Amount** = 25.00 where Basis 100 × 23% = 23.00 → Save. | Blocked. The message shows the line, reference and tax code: "100.00 x 23% = 23.00, but Tax Amount is 25.00". | | |
| D3 | Vendor Bill | Tax Amount off by 0.01 (e.g. 23.01) → Save. | Saves (within tolerance). | | |
| D4 | Purchase Order | Override ticked → item line 100.00 → set the tax line Tax Basis to 80.00 and Tax Amount to 18.40 → Save. | Blocked. The message shows the lines' total net 100.00 vs Tax Basis total 80.00, plus the line with the difference. On the PO the basis is **not** corrected automatically, by design. | | |
| D5 | Purchase Order | Correct tax details → Save. | Saves. | | |
| D6 | Vendor Return | Repeat D4 and D5. | Same as D4 and D5. | | |
| D7 | Invoice | Repeat D2, D4 and D5. | Same as D2, D4 and D5. | | |
| D8 | Credit Memo | Repeat D2, D4 and D5. | Same as D2, D4 and D5. | | |
| D9 | Sales Order | Repeat D2, D4 and D5. | Same as D2, D4 and D5. | | |
| D10 | Sales Return | Repeat D2, D4 and D5. | Same as D2, D4 and D5. | | |
| D11 | Vendor Credit | Repeat D1 and D2. | Same as D1 and D2. | | |
| D12 | Any of the above | Override **unticked** → wrong-looking tax details → Save. | Saves. SuiteTax recalculates on submit. | | |
| D13 | Journal Entry | Normal journal → Save. | Saves. No tax check. | | |
| D14 | Vendor Bill | Add a **Subtotal** item and/or an **Item Group** → correct tax details → Save. | Saves. Subtotal and group lines aren't counted twice. | | |
| D15 | Vendor Bill | Add a **Discount** item (negative line) with its tax line correct → Save. | Saves. | | |

### E. PO cap: Vendor Bill (bill from PO-1 unless stated)

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| E1 | New bill from PO-1 → line 1 (Qty 1, Rate 1,000) → type **Amount** = 400.00 → commit. | Quantity = 0.4, Rate = 1,000.00, Amount = **400.00 exactly as typed**. No message. | | |
| E2 | Save the E1 bill. Create a **second** bill from PO-1 → line 1 → type Amount = 700.00. | Corrected: Quantity = 0.6, Amount = 600.00, Rate = 1,000.00. A message says the PO must be amended to bill more. | | |
| E3 | On the second bill, line 1 → type **Quantity** = 0.9 instead. | Corrected to Quantity 0.6, Amount 600.00, with the same message. | | |
| E4 | Line 2 (Qty 10, Rate 50) → change **Rate** to 60 → commit. | Rate goes back to 50.00 and Amount = Quantity × 50. | | |
| E5 | Type an over-limit Amount → click **Add** / **OK** immediately without leaving the field. | Still corrected to what remains, with one message (not two). | | |
| E6 | Copy line 2 onto the same bill so two bill lines point to the **same** PO line. Set 6 units on the first and type 6 on the second. | The second line is capped at 4 (10 − 6). | | |
| E7 | **Edit** the saved bill from E1 → line 1 → type Amount = 400.00 (same as saved). | Not capped. Its own saved 0.4 counts as available. | | |
| E8 | On a bill from PO-1, add a **manual** item line (not from the PO) → type any Amount / Quantity / Rate. | The script doesn't touch the line. | | |
| E9 | New bill from **PO-2** (UOM item) → type Amount = 150.00. | Quantity = 1.5 (boxes), Rate = 100.00 per box. An Amount over 200.00 is capped at 2 boxes / 200.00. | | |
| E10 | **Vendor Credit** created from a Vendor Return or PO, if used. | **Business decision:** the PO cap is also active on Vendor Credit. Confirm this is wanted. If credits must not be capped, raise it so the cap is switched off for Vendor Credit. | | |

### F. General / regression

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| F1 | Run any failing save from section D. | Only **one** pop-up appears, never two different alerts (would mean an old script is still deployed). | | |
| F2 | Open a bill with 50+ lines and override ticked → click the Tax Details tab → Save. | No noticeable slowdown, at most a second or two. No browser "page unresponsive" warning. | | |
| F3 | Review the browser console across all tests. | No `oTWC_taxHandling_cs (...)` errors logged. | | |
| F4 | Open each record type in **View** mode. | No errors. Nothing changes. | | |
| F5 | Repeat a sample of tests (A1, B1, C2, D2, E2) with a **non-admin AP user**. | Same results. If a rate isn't filled in for this user, the role may lack permission to read the SuiteTax rate record. | | |

---

## 4. Sign-off

| Area | Tests | Passed | Failed | Open issues |
|---|---|---|---|---|
| A. Project copy | 9 | | | |
| B. Tax handling (Bill + Credit) | 12 | | | |
| C. Tax Basis correction (Bill + Credit) | 16 | | | |
| D. Tax check on save | 15 | | | |
| E. PO cap | 10 | | | |
| F. General | 5 | | | |

**Business decision recorded for E10 (PO cap on Vendor Credit):** ☐ keep ☐ remove

UAT accepted: ☐ Yes ☐ No (see open issues)

| Name | Role | Signature | Date |
|---|---|---|---|
| | Business owner | | |
| | Finance / AP lead | | |
| | OSSM consultant | | |
