# Radix → Nexus Data Migration — Spec v1

> Supersedes `SPEC_Draft.md`. Built from the draft, the sample files in `.docs/sample_files/` (export 2026-10-19), and the current code (generated persistent objects, `oTWC_utils.js` enums, the User Event scripts and the batch jobs).
> Items marked **[DECISION]** are my proposals, and you can overrule any of them. Items marked **[OPEN]** must be answered before the related import type is built. They are all listed in §9.

---

## 1. Goal and scope

Migrate the operational data from **Radix** (legacy system) into the TWC NetSuite custom records (**Nexus**) through a set of custom imports that run on the server, can be restarted, and are safe to re-run.

| # | Import type | Target records | Phase |
|---|---|---|---|
| 0 | **Framework** (Suitelet + scheduled engine + run state/log) | – | 1 |
| 1 | **Equipment** | `customrecord_twc_equip` | 1 |
| 2 | **SRF** | `customrecord_twc_srf`, `_srf_itm`, `_srf_rev`, `_sds`, `_sds_item`, `_eq_action` | 1 |
| 3 | **SAF** | `customrecord_twc_saf`, `_saf_action`, `_saf_crew`, `_saf_log`, `_saf_tm_blk` (+ back-link on `_eq_action`) | 1 |
| 4 | Trouble Tickets | TBD | later |
| – | Documents (SRF / SAF / SDS / TT files) | File Cabinet + file records | phase 2, specified separately (`oTWC_importRadixFile_sl.js` / `FileUtils`) |

**Out of scope:** Companies, Profiles, Sites and Infrastructure. They are assumed **already migrated** and are used only as lookup targets. Companies and Profiles already carry `custrecord_twc_co_radix_entry_num` / `custrecord_twc_prof_radix_entry_num`.

Build order (unchanged from the draft): Framework → Equipment → SRF → SAF → TT. Each type is built only after the previous one has been tested. The data dependencies require the **run** order to be the same: SRF rows reference equipment, and SAF rows reference SRF equipment actions.

---

## 2. Prerequisites in NetSuite (to be done by you, before coding each type)

### 2.1 Migration fields on every target record — **[AGREED: you create the missing fields; ids still to confirm, Q1]**

The draft requires every imported record to carry a *Radix Migrated* flag, the *Radix DB key* and the *Radix Record No*. In the current generated persistent objects, **only Equipment** has a Radix field (`custrecord_twc_equip_radix_tbl_row`, integer). None of the target records has a *Radix Migrated* flag.

Proposed standard fields for each target record. The ids follow the record's existing prefix:

| Field | Type | Example id (SRF) | Purpose |
|---|---|---|---|
| Radix Migrated | Checkbox | `custrecord_twc_srf_radix_migr` | flag; also used to bypass scripts (§6.6) |
| Radix Id | Integer | `custrecord_twc_srf_radix_id` | Radix DB key; **duplicate key** |
| Radix Ref | Free text | `custrecord_twc_srf_radix_ref` | Radix record no. / string ref (e.g. `EQAC-910002`) |
| Radix Import Run | Free text | `custrecord_twc_srf_radix_run` | run name (§3.2), used for audit and roll-back |

Needed on: equip (reuse `radix_tbl_row` as Radix Id, add the other 3), srf, srf_itm, srf_rev, sds, sds_item, eq_action, saf, saf_action, saf_crew, saf_log, saf_tm_blk.
After the fields are created, the persistent objects must be **regenerated** (they cannot be hand-edited).

> Child records with no Radix key of their own (SRF Review, Time Block, Crew) get a **synthetic key** in *Radix Ref*. For example, Review = `{srfRadixId}-{iteration}`, Time Block = `{safRadixId}-{yyyymmdd}-{block}`, Crew = `{safRadixId}-{profileRadixId}`. The duplicate check uses that key.

### 2.2 Other NetSuite setup
- Folder **SuiteScripts > OSSMTWC - Radix** (root of all runs). Its internal id is hard-coded `@@HARDCODED @@GO-LIVE`.
- Suitelet + Scheduled Script records and deployments (I won't deploy objects; you create them). The Scheduled Script has script parameters `custscript_twc_dm_folder` (run folder id) and `custscript_twc_dm_state` (JSON resume cursor).
- Administrator role only (no "TWC Customer Center"). No Role Feature List entry is needed.

---

## 3. Framework

### 3.1 Source file format — **[AGREED] CSV, one file per sheet (you provide them)**
The samples are `.xlsx` workbooks, which SuiteScript cannot read on the server, so **you provide each sheet as its own UTF-8 CSV** (comma, quoted, header row = the column names as in the samples). The import type says which files it needs. Each file slot on the Suitelet is labelled with the sheet name it expects. Header names are validated on submit, and a missing required column rejects the run before anything is created.

### 3.2 Suitelet `data_migration/oTWC_dm_import_sl.js`
- **GET**: form with *Import Type* (select), the file slots for that type (main + additional; required/optional per type), a *Validate only (dry run)* checkbox **[DECISION]**, and a sub-list of the last runs (name, type, status, created/skipped/error counts, link to log), read from the run JSON files.
- **POST**:
  1. Refuse if a run is already *queued/running* (one import at a time, **[DECISION]**: the imports depend on each other and share one deployment).
  2. Validate the CSV headers.
  3. Create the folder `OSSMTWC - Radix/{ImportType}_{YYYY.MM.DD}_{HH.MM}`. **[DECISION]**: `HH.MM` instead of `HH:MM`, because `:` is not safe in folder/file names once downloaded.
  4. Save the uploaded files into it under fixed names (`equipment.csv`, `srf.csv`, `srf_review.csv`, …).
  5. Create `{folderName}.json` (the run state, §3.3).
  6. Submit the scheduled task with the folder id and show a confirmation with a link back to the run list.

### 3.3 Run state file `{folderName}.json`
```json
{
  "importType": "SRF", "status": "queued|running|completed|failed|cancelled",
  "dryRun": false, "createdBy": 123, "created": "...", "started": "...", "finished": "...",
  "files": { "srf": 456, "srf_review": 457 },
  "logFileId": 789,
  "step": "srf_rev",            // current step of the type's pipeline (§3.4)
  "cursor": 1250,               // next row index (0-based, excluding header) inside the step's file
  "totals": { "read": 0, "created": 0, "skipped": 0, "errors": 0 },
  "stepTotals": { "srf": {...}, "srf_rev": {...} },
  "restarts": 3, "lastError": null
}
```
The state is saved **at every restart point and at every step change**, not after every row, to save units. The log (§3.5) is the per-row truth. On a restart, the rows after the last saved cursor are re-processed. That is safe because the duplicate check (§3.6) skips the rows that were already created.

### 3.4 Engine — Scheduled Script `data_migration/oTWC_dm_import_svc.js`
- Follows the `svc/oTWC_certStatus_svc.js` pattern: in the row loop, check `core.env.units()`. Below **~200** (a full SRF row creates several records), stop, save state and re-queue the same script with `N/task`, passing `{ folderId }`.
- Each import type is a **handler module** `data_migration/oTWC_dm_<type>.js` that exposes an ordered list of **steps** (one per target table / file). Each step has `validate(row, ctx)` and `import(row, ctx)`. The engine handles CSV reading, the cursor, units, the log and the state. Handlers only map and create.
- CSV parsing is shared (`oTWC_dm_csv.js`). Files are read with `file.lines.iterator()` and the cursor skips rows already done. For very large files **[DECISION]**, the engine caches the parsed rows in a JSON file only if it has to.
- Lookups (§5) are loaded **once per execution** with SuiteQL into in-memory maps (site code → id, company radix id → id, …). No per-row record loads.
- Records are created with `N/record` and `ignoreMandatoryFields: true` **[DECISION]**, because Radix data will not always satisfy the Nexus form rules. Status fields are set directly to their final value.
- Unhandled exception → state `failed` with `lastError`. The run can be resumed from the Suitelet ("Resume" action).

### 3.5 Log file `{folderName}_log.csv`
One line per source row per step:
`timestamp, step, rowNo, radixId, radixRef, result (CREATED|SKIPPED_DUPLICATE|SKIPPED_PARENT_MISSING|ERROR|VALID), nsRecordType, nsId, message`
Lines are appended with `file.appendLine`. A new log part is started at about 9 MB (`_log_002.csv`, …) to stay under the 10 MB file limit.

### 3.6 Duplicate check
Before creating, look up the target record by **Radix Id** (or the synthetic Radix Ref, §2.1), using a map pre-loaded per step. If found → `SKIPPED_DUPLICATE` and the existing NS id goes to the log. Children are still processed against the existing parent. Records are **never updated** (the draft says skip). **[OPEN Q12]**: confirm we never need an "update" mode.

### 3.7 Dry run
Same pipeline, but `import()` is not called. Every row is validated (lookups resolved, values mapped) and logged as `VALID` or `ERROR`. This is the main tool for cleaning the Radix extracts before the real run.

### 3.8 Roll-back (support tool) **[DECISION]**
A separate Suitelet action "Delete run" deletes every record whose *Radix Import Run* = run name, children first. It runs in the same scheduled script in delete mode. It is intended for sandbox iterations.

---

## 4. Common data rules

| Topic | Rule |
|---|---|
| Null values | `''`, `-`, `NULL`, `n/a` (case-insensitive) → empty. **[OPEN Q9]**: `0` in Operator Site ID is treated as empty. |
| Booleans | `1/0`, `Yes/No`, `Y/N`, `TRUE/FALSE`. |
| Dates | Accept `dd/mm/yyyy [hh:mm[:ss]]` and ISO. **[OPEN Q8]**: many date-only values come out as `yyyy-mm-dd 23:00` (e.g. SAF *Works End Date* `2024-10-14 23:00` for a SAF on 14/10/2024; time-block dates the same). This looks like a UTC/IST shift in the export. Proposal: strip the time on date-only fields and use the date as is, but this must be confirmed against Radix. |
| Numbers | Strip thousands separators; an empty value stays empty (not 0). |
| List fields | Mapped by **text → internal id**, through the `oTWC_utils.js` enums where they exist, otherwise through a SuiteQL lookup on the list. Unknown text → row `ERROR` (never silently blank). Mapping tables are kept in the handler, with `@@HARDCODED @@GO-LIVE` where needed. |
| Errors | One bad row never stops the run. A missing **parent** (e.g. a review whose SRF is not in Nexus) → `SKIPPED_PARENT_MISSING`. |
| Name/auto-numbering | **[OPEN Q10]**: keep the Radix reference as `name` (e.g. `EQAC-910002`, `SFAC-910001`), or let the NetSuite auto-numbering generate it? |

---

## 5. Lookups (shared)

| Source value | Example | Resolves to | How |
|---|---|---|---|
| Site | `TKY1017 : Derryquin` | `customrecord_twc_site` | text before ` : ` = `custrecord_twc_site_site_id` (site code) |
| Infrastructure | `TKY1017-T01` | infrastructure record | by name **[OPEN Q6]**: confirm the field |
| Customer / Contractor | `eir`, `eir Mobile`, `Enet Communications` | company | **[OPEN Q3]**: by name is fragile (`eir` ≠ `eir Mobile`). Ask Radix for the **Company Radix ID** columns; fall back to an exact-name match |
| Profile | `4187` (SRF Submitted By), PICW, SAF Author, Crew Member | `customrecord_twc_prof` | `custrecord_twc_prof_radix_entry_num` |
| Profile → employee/vendor? | `Completion Reviewer`, `Licence Pack Reviewer` (`856`), `Executed By` (`3506`) | ? | **[OPEN Q4]**: are these Radix profile ids pointing to Towercom staff? Which NS field type (profile vs employee)? |
| Equipment | Radix Equip ID `1855` | `customrecord_twc_equip` | `custrecord_twc_equip_radix_tbl_row` |
| SRF / SAF / SDS / EA | Radix ids | migrated records | their Radix Id field (§2.1) |
| Equipment Library | `Equipment Library Entry` | `customrecord_twc_eq_lib` | by name (always empty in the sample, `Use Library = No`) |
| SDS Agreement Template | `26`, `7`, `2` … | template record | **[OPEN Q7]**: these are Radix template ids, so we need a mapping table |
| SDS Agreement Conditions | `SDS-COND00031\|SDS-COND00032` | condition records | split on `\|`, match on name (to be confirmed) |

---

## 6. Import types

### 6.1 Equipment (1 file)

**Files:** `equipment.csv` (sheet *SAMPLE EQUIP*).
**Steps:** (a) create all equipment; (b) **second pass** set `PARENT_TME_ID`. In Radix, the parent references a Radix equipment id, which may be created later in the same file. For a TME, `Parent TME ID = Equipment ID` (self).

| CSV column | Field | Notes |
|---|---|---|
| Equipment ID | `RADIX_EQUIPMENT_TABLE_ROW` (Radix Id) **and** `EQUIPMENT_ID`? | **[OPEN Q5]**: does Nexus keep the Radix number as the visible Equipment ID? |
| Parent TME ID | `PARENT_TME_ID` | pass (b), lookup by Radix id |
| Site / Infrastructure / Customer | `SITE` / `INFRASTRUCTURE` / `CUSTOMER` | §5 |
| Equipment Class / Type | `EQUIPMENT_CLASS` / `EQUIPMENT_TYPE` | list; class TME/ATME/GIE/FEEDER → `EQ_CLASS_ENUM` |
| Equipment Install Status | `EQUIPMENT_INSTALL_STATUS` | `EQ_INSTALL_STATUS` |
| Equipment Licence Status | `EQUIPMENT_LICENCE_STATUS` | **retired values (Issue 299) map**: `Prop to Licence - Licence Requested/Issued/Signed` → *Prop to Licence* (3); `Prop to Unlicence - …` → *Prop to Unlicence* (8). If **Package = Yes** and a removal has completed → *Licence Retained* (13)? **[OPEN Q11]** |
| Description, Make, Model, Length/Width/Height-Depth (mm), Weight (kg), Height on Tower (m), Azimuth, B-End, Customer Ref, Inventory Flag, Voltage Type, Use Library, Equipment Library Entry, Active/Passive, Wind Loading ×4, Wind Regime, Customer Note, To Be Billed, Package | same-named fields | 1:1 (`Location Notes` → `MODIFIED_ANTENNA_LOCATION` or `GIE_LOCATION` by class **[OPEN Q6]**) |
| Opt Type | `FEEDER_TYPE` | list |
| Licenced Date | `LICENCE_COMMENCEMENT_DATE` | |
| Installed Date / Removed Date | `INSTALLED_DATE` / `REMOVED_DATE` | |
| `ID` | – | Nexus internal id, empty in the sample. If filled → skip as already existing |
| srf_approved … works_permitted, LICENCE ISSUED/SIGNED/EXECUTED, does parent have an EA/SA | – | **ignored** (Radix milestone/analysis columns). **[OPEN Q13]**: confirm |

### 6.2 SRF (up to 7 files)

**Files:** `srf.csv` (*SAMPLE SRF*, required), `srf_review.csv` (*SAMPLE SRF Review*), `sds.csv` (*SAMPLE SDS*), `equip_actions.csv` (*Equip Actions*, from the SAF workbook; see below), and **missing from the samples** → **[OPEN Q2]**: `srf_items.csv`, `sds_items.csv`. *SRF Files* / *SDS Files* are phase 2 (documents).

**Steps (in order):**
1. **SRF** → `customrecord_twc_srf`. Columns map 1:1 by label to the SRF fields (Revenue Impacting → `REVENUE_IMPACTING`, `SRF Submitted By (RADIX Profile ID)` → `SRF_SUBMITTED_BY` via profile, `SRF Notes` → `TL_NOTES`, …). `SRF Status` → `SRF_STATUS` (text map: *Feedback issued* → FeedbackIssued, …). `ID` = Nexus id, ignored or skipped as above.
2. **SRF Items** → `customrecord_twc_srf_itm` (file to be provided, Q2).
3. **SRF Review** → `customrecord_twc_srf_rev`, parent = `SRF` (Radix SRF id). The unnamed column 7 (`0` in the header, dates in the data) = **TL Review Complete** (`TL_REVIEW_COMPLETE`) **[OPEN]**: fix the header in the export. The sample has 258 reviews for 37 SRFs, so orphans are logged `SKIPPED_PARENT_MISSING`.
4. **SDS** → `customrecord_twc_sds`, parent = `SRF (RADIX SRF ID)`. `SDS PDF` stays empty (phase 2).
5. **SDS Items** → `customrecord_twc_sds_item` (file to be provided, Q2, or derived from equipment actions: Q2).
6. **Equipment Actions** → `customrecord_twc_eq_action`. `EA Equipment` → equipment (Radix id), `EA SRF` → SRF, `EA SRF Item` → SRF item, `EA Type` / `EA Status` via `EQ_ACTION_TYPE` / `EQ_ACTION_STATUS` (`n/a` / empty → **ERROR**, 2 rows in the sample). `EA SAF` is **left empty here** and set by the SAF import (6.3 step 5), because SAFs do not exist yet. `Related EA` → second pass.

**"Depends on SRF status"** **[OPEN Q2]**: the draft says rev / sds / sds_item / eq_action depend on the SRF status. My proposal is that a child is imported **if the extract contains it**, and that the status table below is only a **consistency check** (warning in the log). Please confirm or give the real rule:

| SRF Status | Reviews | SDS + items | EAs |
|---|---|---|---|
| Submitted | – | – | yes |
| Under Review / Feedback issued / Resubmitted | yes | – | yes |
| SRF Approved | yes | optional (draft) | yes |
| Licence Requested / Issued / Signed / Executed / Completed | yes | yes | yes |
| SRF Cancelled | if any | if any | yes (cancelled) |

**SRF workflow** **[OPEN Q14]**: migrated SRFs get **no** `customrecord_twc_srf_wf` / workflow stage records. How should the portal / workflow engine treat an SRF in, for example, *Under Review* with no workflow? Options: (a) migrate only closed SRFs; (b) create the workflow at the matching stage; (c) migrated open SRFs are finished in Radix.

### 6.3 SAF (5 files)

**Files** (from *SAF and Actions SAMPLE DATA*): `saf.csv` (*SAMPLE SAFs*), `saf_actions.csv`, `saf_crew.csv`, `saf_time_blocks.csv`, **[OPEN Q2]**: `saf_log.csv` (no sheet in the sample). *SAF Files* is phase 2.

**Steps:**
1. **SAF** → `customrecord_twc_saf`. Radix Id = `RADIX SAF ID`. `SAF ID` = Nexus SAF number, empty in the sample (Q10). Customer / Primary Contractor → company (Q3). `PICW (RADIX Profile ID)`, `SAF Author` → profile. `Completion Reviewer` → Q4. `Start/End Time Block` are text (`14/10/2024 08:00`), so their field type needs to be confirmed. `Type`, `Status`, `Photo Assessment Category` → lists (`SAF_STATUS` enum).
2. **Time Blocks** → `customrecord_twc_saf_tm_blk` (`SAF (RADIX ID`, `Block Date`, `Block`). Date rule Q8.
3. **Crew** → `customrecord_twc_saf_crew` (member via profile Radix id; `Attend As` list).
4. **SAF Actions** → `customrecord_twc_saf_action`. Radix Ref = `ID` (`SFAC-…`). `SAF-ACTION EA` (`EQAC-…`) → equipment action by **Radix Ref**, so the SRF import must have run.
5. **Back-link EAs**: for every *Equip Actions* row with `EA SAF (RADIX SAF ID)`, set `EA_SAF` on the already-migrated EA. This is the only **update** in the whole migration (it needs `equip_actions.csv` again, or a lookup from the SAF Actions file).
6. **SAF Log** → `customrecord_twc_saf_log` (Q2).

### 6.4 Trouble Tickets — later
Not specified. Note: a TT creates and maintains a **support case** (`oTWC_trouble_tkt_ue.js`), so it will need its own rules.

### 6.5 Side effects to neutralise
| Script | Risk | Mitigation |
|---|---|---|
| `oTWC_srf_ue.js` / `oTWC_saf_ue.js` afterSubmit | emails on status **change** (not on create) | create each record with its final status in one save; never update the status |
| `svc/oTWC_saf_sts_update_svc.js` | moves migrated *Approved* SAFs whose last time block has passed to *Awaiting Photos* **and emails the contractor** | **[OPEN Q15]**: have the job skip `Radix Migrated = T`? Or import such SAFs as Complete? |
| `svc/oTWC_srf_sts_update_svc.js` | moves migrated *Licence Executed* SRFs to *Completed* | probably desired, confirm (Q15) |
| `oTWC_forceView_ue.js` | blocks create in the **UI** only | not affected (scheduled script context) |
| other UEs on target records | unknown side effects in non-UI context | to check per record type during the build; bypass when `Radix Migrated = T` if needed |

---

## 7. Files and code layout

```
data_migration/
  oTWC_dm_import_sl.js       Suitelet (upload, run list, resume, delete run)
  oTWC_dm_import_svc.js      Scheduled script (engine, requeue)
  oTWC_dm_engine.js          state/log/units/steps runner
  oTWC_dm_csv.js             CSV parser + value converters (dates, bools, nulls)
  oTWC_dm_lookups.js         shared lookup maps (§5)
  oTWC_dm_equipment.js       handler
  oTWC_dm_srf.js             handler
  oTWC_dm_saf.js             handler
  .docs/SPEC_v1.md           this file
```
The code follows the repo conventions: AMD/`@NApiVersion 2.1`, `SuiteBundles/Bundle 548734/...` paths, **no `N/search`** (SuiteQL / `RecordBase.select` only), and `@@HARDCODED @@GO-LIVE` on every internal id. Nothing can be tested locally. Each step is pushed with nsLink and tested in the sandbox with a dry run first.

## 8. Acceptance per import type
1. Dry run on the sample files: every row is `VALID`, or `ERROR` with a clear reason.
2. Real run: the record counts match the log. A re-run of the same files gives 100 % `SKIPPED_DUPLICATE` and creates nothing.
3. A forced restart (low units threshold in the sandbox) gives the same results as an uninterrupted run.
4. A spot check of 5 records per table against Radix, including the portal views (Inventory, SRF, SAF pages).
5. Roll-back of the run removes everything it created.

---

## 9. Open questions

| # | Question | Blocks |
|---|---|---|
| Q1 | ~~Create the Radix fields~~ (you will). Still open: send me the final field ids (or confirm the proposed ones), confirm Equipment's `radix_tbl_row` is the Radix Id, and regenerate the persistent files. | all |
| Q2 | Missing extracts: **SRF Items, SDS Items, SAF Log**. Will Radix provide them, or are SDS items derived from EAs? And what is the real "depends on SRF status" rule (§6.2)? | SRF, SAF |
| Q3 | Can the extracts include **Company Radix IDs** instead of names (Customer, Primary Contractor)? `eir` vs `eir Mobile` is ambiguous. | all |
| Q4 | Reviewer / Executed-By / Completion Reviewer / TL Drawing Assigned To: Radix profile ids of staff? Which NS record do they map to? | SRF, SAF |
| Q5 | Equipment `Equipment ID`: keep the Radix number as the visible `EQUIPMENT_ID`? | Equipment |
| Q6 | Infrastructure lookup field, and *Location Notes* → antenna location vs GIE location? | Equipment |
| Q7 | Mapping of the Radix **Agreement Template** ids → NS templates; are the Agreement Condition refs (`SDS-COND000xx`) the NS record names? | SRF |
| Q8 | The `23:00` timestamp on date-only values: is it a timezone shift (use the date as is) or the next day? | all |
| Q9 | Extra null tokens (`0` in Operator Site ID)? | SRF |
| Q10 | Record names / numbers (`name`, SAF ID, SRF number): keep the Radix refs or use NS auto-numbering? | all |
| Q11 | Equipment licence status for **Package = Yes** removals → *Licence Retained*? | Equipment |
| Q12 | Duplicates are always skipped, never updated. Confirmed? | all |
| Q13 | Equipment milestone columns (`srf_approved` … `works_permitted`, `does parent have an EA/SA`) are ignored. Confirmed? | Equipment |
| Q14 | How to handle **open** SRFs with no workflow records (§6.2)? | SRF |
| Q15 | Batch jobs acting on migrated SAF/SRF (emails to contractors): skip migrated records? | SRF, SAF |
| Q16 | Proposed decisions to confirm (CSV per sheet already agreed): `HH.MM` folder names, one run at a time, dry run, roll-back, `ignoreMandatoryFields`. | framework |
