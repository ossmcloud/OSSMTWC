# Radix → Nexus Data Migration — Spec v1.2

> Supersedes `SPEC_v1.1.md`. Changes from v1.1 are marked **(v1.2)**.
> v1.2 adds your answers of 2026-11-23 (Q2, Q4, Q7, Q9, Q14, Q15), the Radix fields on the six SRF records (persistent objects regenerated), and the SRF samples: `SRF_Sample.csv`, `SRF_Item_Sample.csv`, `SRF_Review_Sample.csv`, `SDS_Sample.csv`, `SRF_EqActions.csv`.
> **Status:** Framework + Equipment built and signed off (2026-11-23). **Current focus: SRF (§6.2), for review before build.** SDS Items are waiting for their extract. SAF is kept for reference.

---

## 1. Goal and scope

Migrate the operational data from **Radix** (legacy system) into the TWC NetSuite custom records (**Nexus**) through a set of custom imports that run on the server, can be restarted, and are safe to re-run.

| # | Import type | Target records | Phase |
|---|---|---|---|
| 0 | **Framework** (Suitelet + scheduled engine + run state/log) | – | 1 — **done** |
| 1 | **Equipment** | `customrecord_twc_equip` | 1 — **done** (signed off 2026-11-23) |
| 2 | **SRF** | `customrecord_twc_srf`, `_srf_itm`, `_srf_rev`, `_sds`, `_sds_item`, `_eq_action` | 1 — **now** (v1.2) |
| 3 | **SAF** | `customrecord_twc_saf`, `_saf_action`, `_saf_crew`, `_saf_log`, `_saf_tm_blk` (+ back-link on `_eq_action`) | 1 — after SRF is tested |
| 4 | Trouble Tickets | TBD | later |
| – | Documents (SRF / SAF / SDS / TT files) | File Cabinet + file records | phase 2, specified separately (`oTWC_importRadixFile_sl.js` / `FileUtils`) |

**Out of scope:** Companies, Profiles, Sites and Infrastructure. They are assumed **already in Nexus** and are used only as lookup targets.

Build and run order: Framework → Equipment → SRF → SAF → TT. The run order matters because SRF rows reference equipment and SAF rows reference SRF equipment actions.

---

## 2. Prerequisites in NetSuite

### 2.1 Migration fields on every target record (v1.1)

You create these fields and regenerate the persistent objects. Each target record gets:

| Field | Type | Purpose |
|---|---|---|
| Radix Id | **Free text** | Radix DB key / record no.; the **duplicate key** (text because some Radix ids are alphanumeric, e.g. feeders `FEED0001`) |
| Radix Migrated | Checkbox | set to T on every imported record |
| Radix Import Run | Free text | run name (§3.2), used for audit and roll-back |

**Equipment — done** (already in `oTWC_equipmentPersistent.js`):

| Field | Id | Persistent key |
|---|---|---|
| Radix Id | `custrecord_twc_equip_radix_tbl_row` (changed to text) | `RADIX_EQUIPMENT_TABLE_ROW` |
| Radix Migrated | `custrecord_twc_equip_radix_migr` | `RADIX_MIGRATED` |
| Radix Import Run | `custrecord_twc_equip_radix_run` | `RADIX_IMPORT_RUN` |

**SRF records — done (v1.2)**. All six use the persistent keys `RADIX_ID` / `RADIX_MIGRATED` / `RADIX_IMPORT_RUN`:

| Record | Radix Id | Radix Migrated | Radix Import Run |
|---|---|---|---|
| `customrecord_twc_srf` | `custrecord_twc_srf_radix_id` | `custrecord_twc_srf_radix_migrated` | `custrecord_twc_srf_radix_import_run` |
| `customrecord_twc_srf_itm` | `custrecord_twc_srf_itm_radix_id` | `custrecord_twc_srf_itm_radix_migrated` | `custrecord_twc_srf_itm_radix_import_run` |
| `customrecord_twc_srf_rev` | `custrecord_twc_srf_rev_radix_id` | `custrecord_twc_srf_rev_radix_migrated` | `custrecord_twc_srf_rev_radix_import_run` |
| `customrecord_twc_sds` | `custrecord_twc_sds_radix_id` | `custrecord_twc_sds_radix_migrated` | `custrecord_twc_sds_radix_import_run` |
| `customrecord_twc_sds_item` | `custrecord_twc_sds_item_radix_id` | `custrecord_twc_sds_item_radix_migrated` | `custrecord_twc_sds_item_radix_import_run` |
| `customrecord_twc_eq_action` | `custrecord_twc_eq_action_radix_id` | `custrecord_twc_eq_action_radix_migrated` | `custrecord_twc_eq_action_radix_import_ru` (truncated id) |

**Still to create** (before SAF is built): saf, saf_action, saf_crew, saf_log, saf_tm_blk.
Child records with no Radix key of their own get a **synthetic key** in their Radix Id: SRF Item = `{srfRadixId}-{equipmentRadixId}` **(v1.2)**, Review = `{srfRadixId}-{iteration}`, Time Block = `{safRadixId}-{yyyymmdd}-{block}`, Crew = `{safRadixId}-{profileRadixId}`.

### 2.2 Other NetSuite setup
- Folder **SuiteScripts > OSSMTWC - Radix** (root of all runs). Its internal id is hard-coded `@@HARDCODED @@GO-LIVE`.
- Suitelet + Scheduled Script records and deployments (you create them; I don't deploy objects). The Scheduled Script has one script parameter, `custscript_twc_dm_folder` (run folder id). The resume cursor lives in the run JSON (§3.3), not in a parameter.
- Administrator role only (no "TWC Customer Center"). No Role Feature List entry is needed.

---

## 3. Framework

### 3.1 Source file format (v1.1: agreed)
**You provide one UTF-8 CSV per sheet**: comma separated, double-quote text qualifier, a header row with the column names as in the samples, and dates as `dd/mm/yyyy`. A leading BOM is tolerated. Each import type declares the files it needs. On submit, the header row of each file is checked, and a missing required column rejects the run before anything is created. Unknown extra columns are ignored.

### 3.2 Suitelet `data_migration/oTWC_dm_import_sl.js`
Built with `N/ui/serverWidget` rather than `O/suitlet`, because it needs native file upload fields.
- **GET**: form with *Import Type* (select), the file slots for that type (main + additional; required/optional per type), a *Validate only (dry run)* checkbox, and a sub-list of the last runs (name, type, status, created/skipped/error counts, link to log), read from the run JSON files.
- **POST** (dispatches on `action`; unknown actions throw):
  - `start`:
    1. Refuse if a run is already *queued/running* (one import at a time).
    2. Validate the CSV headers.
    3. Create the folder `OSSMTWC - Radix/{ImportType}_{YYYY.MM.DD}_{HH.MM}`. This is the **run name**.
    4. Save the uploaded files into it under fixed names (e.g. `equipment.csv`).
    5. Create `{runName}.json` (§3.3).
    6. Submit the scheduled task.
  - `resume`: re-submits the task for a `failed` run.
  - `delete`: roll-back (§3.8).

### 3.3 Run state file `{runName}.json`
```json
{
  "runName": "Equipment_2026.11.17_10.30",
  "importType": "EQUIPMENT", "mode": "import|dryrun|delete",
  "status": "queued|running|completed|failed",
  "createdBy": 123, "created": "...", "started": "...", "finished": "...",
  "files": { "equipment": 456 },
  "logFileIds": [789],
  "step": "create",             // current step of the type's pipeline (§3.4)
  "cursor": 1250,               // next data row (0-based, header excluded) of the step's file
  "totals": { "read": 0, "created": 0, "updated": 0, "skipped": 0, "errors": 0 },
  "stepTotals": { "create": {...}, "parents": {...} },
  "restarts": 3, "lastError": null
}
```
The state is saved at every restart point and at every step change. The log (§3.5) is the per-row truth. On a restart, any rows after the last saved cursor are processed again. That is safe because the duplicate check (§3.6) skips rows that were already created.

### 3.4 Engine — Scheduled Script `data_migration/oTWC_dm_import_svc.js`
- Follows the `svc/oTWC_certStatus_svc.js` pattern: in the row loop, check `core.env.units()`. Below **~200**, stop, save state and re-queue the same script with `N/task`, passing `{ folderId }`.
- Each import type is a **handler module** `data_migration/oTWC_dm_<type>.js` that exposes an ordered list of **steps**. Each step has a source file, `prepare(ctx)` (load lookup maps), `validate(row, ctx)` and `process(row, ctx)`. The engine handles CSV reading, the cursor, units, the log and the state. Handlers only map and save.
- CSV parsing is shared (`oTWC_dm_csv.js`) and handles quoted fields with embedded commas and new lines. The run file is parsed once per execution, and rows before the cursor are skipped.
- Lookups (§5) are loaded **once per execution** with SuiteQL into in-memory maps. No per-row lookups or record loads.
- **(v1.2)** A step whose file was not uploaded is skipped. A step can read the other files of the run (`ctx.loadFile`) and can have a `finish` hook (e.g. the SRF values file). A roll-back entry can clear fields on records of another run (`clearOnly` + `where`), e.g. the equipment *Associated Equip Action* set by the SRF import.
- Records are created with `N/record` and `ignoreMandatoryFields: true`. Status fields are set directly to their final value in the single create.
- Unhandled exception → state `failed` with `lastError`. The run can be resumed from the Suitelet.

### 3.5 Log file `{runName}_log.csv`
One line per source row per step:
`timestamp, step, rowNo, radixId, result (CREATED|UPDATED|SKIPPED_DUPLICATE|VALID|ERROR), nsRecordType, nsId, message`
Lines are appended with `file.appendLine`. A new part (`_log_002.csv`, …) is started at about 9 MB to stay under the 10 MB file limit.

### 3.6 Duplicate check (v1.1: agreed, Q12)
Before creating, the target record is looked up by **Radix Id** (map pre-loaded per step). If found → `SKIPPED_DUPLICATE`, with the existing NS id logged. Existing records are **never updated** by a re-run. The only planned updates are the second-pass links that belong to the same migration: the Equipment parent TME (§6.1, step 2) and later the EA → SAF link (§6.3).

### 3.7 Dry run
Same pipeline without saving. Every row is validated (all lookups resolved, values converted) and logged as `VALID` or `ERROR`. Use it to clean the extracts before the real run.

### 3.8 Roll-back (sandbox tool)
"Delete records" (available on completed import runs) starts a **new run** (`{Type}-delete_…`) in delete mode, with `targetRun` = the run to roll back. It removes every record whose *Radix Import Run* = target run, children first, and clears self/cross references (e.g. parent TME) before deleting. It runs in the same scheduled script, with the same restart logic. Dry runs are named `{Type}-dryrun_…`.

---

## 4. Common data rules

| Topic | Rule |
|---|---|
| Null values | `''`, `-`, `NULL` (case-insensitive) → empty. Values are trimmed. **(v1.2, Q9)** Some text columns also treat `0` as empty. They are listed per import type (e.g. SRF *Operator Site ID*). `0` is never empty for numbers or booleans. |
| Warnings (v1.2) | A row that is created but needs attention (value mapped, link left empty, status inconsistent) is logged `CREATED` (or `VALID` in a dry run) with a message starting `WARNING:`. |
| Booleans | `1/0`, `Yes/No`, `Y/N`, `TRUE/FALSE`, `T/F`. |
| Dates (v1.1, Q8) | `dd/mm/yyyy`, with any time part **ignored**. The date is used **as is**, with no timezone conversion. |
| Numbers | Strip thousands separators; an empty value stays empty (not 0). A non-numeric value → `ERROR`. |
| Linked records and list values (v1.1, Q3) | Looked up **by name** in Nexus (exact match, case-insensitive, trimmed; inactive records included). **No match → ERROR. More than one match → ERROR.** No silent blanks, no "first match". |
| Errors | One bad row never stops the run. The row is logged `ERROR` with the column, the value and the reason, and nothing is created for it. All errors of a row are reported together. |
| Record names (v1.1, Q10) | Keep the Radix refs as `name` (e.g. `EQAC-910002`, `SFAC-910001`). **Exception — Equipment:** `name` is the NetSuite auto-generated number (§6.1). **(v1.2)** Records whose Radix ref is only a number (SRF, SDS) or that have no ref (SRF Item, Review) follow the Nexus naming. See §6.2 and Q18. |
| Migration fields | Every created record gets Radix Id, Radix Migrated = T and Radix Import Run = run name. |

---

## 5. Lookups (shared)

All lookups are by name (§4). They are pre-loaded per execution as `name → [ids]` maps, so ambiguity can be detected.

**Radix Name (v1.1):** some lookup tables have a *Radix Name* field. When it is not empty, the lookup matches on it instead of the record name. The tables are configured in `RADIX_NAME_FIELDS` (`oTWC_dm_config.js`):

| Table | Radix Name field |
|---|---|
| `customrecord_twc_srf_itm_typ_opt` (Feeder / Opt Type) | `custrecord_twc_srf_itm_typ_opt_radixname` |

| Source value | Example | Target record | Match on |
|---|---|---|---|
| Site | `TKY1017 : Derryquin` | `customrecord_twc_site` | text before ` : ` against the **site code** (`custrecord_twc_site_id`), as `oTWC_importRadixFile_sl.js` does. The site code is the unique "name" of a site; the part after ` : ` is not checked |
| Infrastructure | `TKY1017-T01` | `customrecord_twc_infra` | `name`; must also belong to the row's site, otherwise → ERROR |
| Company (Customer / Contractor) | `eir`, `eir Mobile` | `customrecord_twc_company` | `name` |
| Profile | Radix profile id, e.g. `4187` | `customrecord_twc_prof` | **Radix id** (`custrecord_twc_prof_radix_entry_num`), an agreed exception to "by name" (Q17). None or more than one → ERROR |
| Equipment (parent TME) | `1855` | `customrecord_twc_equip` | **Radix Id** (`custrecord_twc_equip_radix_tbl_row`). This is the only non-name lookup for equipment, because equipment names are NS numbers |
| SRF (v1.2) | `7078` | `customrecord_twc_srf` | **Radix Id** (`custrecord_twc_srf_radix_id`): this run's SRFs plus SRFs migrated earlier |
| SRF Item (v1.2) | SRF `7078` + equipment `1855` | `customrecord_twc_srf_itm` | **Radix Id** `{srf}-{equipment}` |
| Custom-record lists | `TME`, `Dish`, `Installed`, `Mast`, `BAU`, `Fibre Cable`, `DC 0-50v`, `No`, `Yes` | each list record (§6.1) | `name` |

---

## 6. Import types

### 6.1 Equipment (v1.1: built, signed off 2026-11-23)

**File:** `equipment.csv`. The sample is `.docs/sample_files/Equipment SAMPLE DATA 2026-10-19.csv` (449 rows: 76 TME, 99 ATME, 268 FEEDER, 6 GIE).

**Steps**
1. **create** — one equipment record per row (duplicates skipped, §3.6). `PARENT_TME_ID` is left empty.
2. **parents** — a second pass over the same file. For every row with a `Parent TME ID`, the parent is looked up by Radix Id among **all** Nexus equipment (rows of this file and equipment migrated earlier). It is then set on the row's equipment with `submitFields`. This step is needed because a parent may appear later in the file, or in an earlier run: in the sample, 17 ATME rows point to TMEs that are not in the file (`24623`, `24624`, `25872`, …), so those TMEs must already be in Nexus, or the row → ERROR.
   - TME rows (`Parent TME ID = Equipment ID`) point to **themselves**, same as the other TMEs in Nexus.
   - GIE rows have no parent.
   - Rows skipped as duplicates in step 1 are skipped here too, so a re-run never re-links existing equipment.
   - Step 2 runs in import mode only. The dry run checks parent resolution in step 1 against the file and Nexus.

**Field mapping**

| CSV column | Field (`twcEquipment.Fields.*`) | Type / lookup | Notes |
|---|---|---|---|
| Equipment ID | `RADIX_EQUIPMENT_TABLE_ROW` | text | **Radix Id**, duplicate key; required. Numeric for TME/ATME/GIE, alphanumeric for FEEDER (`FEED0001`) |
| – | `NAME` | – | **not set**: NetSuite auto-numbering generates the Nexus Equipment Id (Q5) |
| – | `EQUIPMENT_ID` (`custrecord_twc_equip_id`) | – | **obsolete, not set** (Q5) |
| Parent TME ID | `PARENT_TME_ID` | equipment by Radix Id | step 2 |
| Customer | `CUSTOMER` | company by name | required |
| Site | `SITE` | site by code | required |
| Infrastructure | `INFRASTRUCTURE` | `customrecord_twc_infra` by name | must belong to the site |
| Equipment Class | `EQUIPMENT_CLASS` | `customrecord_twc_eq_class` by name | required (`TME`/`ATME`/`GIE`/`FEEDER`) |
| Equipment Type | `EQUIPMENT_TYPE` | `customrecord_twc_eq_type` by name | |
| Equipment Install Status | `EQUIPMENT_INSTALL_STATUS` | `customrecord_twc_equip_install_status` by name | |
| Equipment Licence Status | `EQUIPMENT_LICENCE_STATUS` | `customrecord_twc_equip_licence_status` by name | **status from the file** (Q11), with no Package/Licence Retained logic, **except the Issue 299 retired values, which are mapped** (see the table below) |
| Location Notes | TME / ATME → `MODIFIED_ANTENNA_LOCATION`; GIE → `GIE_LOCATION` | antenna: `customrecord_twc_srf_itm_loc_type` by name (`Mast`, `Monopole`, `Gantry`, `Rooftop`); GIE: free text | (Q6) FEEDER: always empty in the sample; if filled → antenna location |
| Description | `DESCRIPTION` | text | |
| Make / Model | `MAKE` / `MODEL` | text | |
| Length (mm) / Width (mm) / Height/Depth (mm) | `LENGTH_MM` / `WIDTH_MM` / `HEIGHTDEPTH_MM` | integer | |
| Weight (kg) | `WEIGHT_KG` | float | |
| Height on Tower (m) | `HEIGHT_ON_TOWER_M` | float | |
| Azimuth | `AZIMUTH` | decimal (field changed from integer, 2026-11-17) | |
| B-End | `B_END` | text | |
| Customer Ref | `CUSTOMER_REF` | text | |
| Inventory Flag | `INVENTORY_FLAG` | `customrecord_twc_srf_itm_inv_flag` by name | |
| Voltage Type | `VOLTAGE_TYPE` | `customrecord_twc_equip_voltage_type` by name | |
| Opt Type | `FEEDER_TYPE` | `customrecord_twc_srf_itm_typ_opt` by name | |
| Use Library | `USE_LIBRARY` | `customrecord_twc_equip_use_lib` by name | |
| Equipment Library Entry | `EQUIPMENT_LIBRARY_ENTRY` | `customrecord_twc_eq_lib` by name | |
| Active/Passive | `ACTIVEPASSIVE` | `customrecord_twc_active_passive` by name | |
| Wind Loading (N/m2) Front / Side / Rear / Max | `WIND_LOADING_NM2_FRONT` / `_SIDE` / `_REAR` / `_MAX` | integer | |
| Wind Regime | `WIND_REGIME` | `customlist_twc_equip_wind_regime` by name | |
| Customer Note | `CUSTOMER_NOTE` | text | |
| To Be Billed | `TO_BE_BILLED` | checkbox | |
| Licenced Date | `LICENCE_COMMENCEMENT_DATE` | date | |
| Installed Date / Removed Date | `INSTALLED_DATE` / `REMOVED_DATE` | date | |
| Package | `PACKAGE` | `customrecord_twc_package` by name | |
| – | `RADIX_MIGRATED` = T, `RADIX_IMPORT_RUN` = run name | | |
| ID | – | | Nexus internal id; empty in the sample. **If filled → row ERROR** ("already linked to Nexus record x"), to be safe |
| srf_approved, licence_requested, sds_srf_pack_produced, sds_srf_pack_reviewed, sds_pack_issued, sds_pack_signed, sds_pack_executed, licence_issued, licence_signed_by_cust, licence_executed, LICENCE ISSUED, LICENCE SIGNED, LICENCE EXECUTED, works_permitted, does parent have an EA, does parent have an SA | – | | **ignored** (Q13) |

Not set by the import: `TL_NOTE`, `BILL_FROM`, `BILL_TO`, `ASSOCIATED_EQUIP_ACTIONS` (the SRF import sets the EA links).

**Retired licence statuses (Issue 299)** are mapped to the status the equipment keeps until the licence is executed. The text is matched before the by-name lookup:

| File value | Imported as |
|---|---|
| Prop to Licence - Licence Requested / Issued / Signed | Prop to Licence (`EqLicenseStatus.ProptoLicence`, 3) |
| Prop to Unlicence - Licence Requested / Issued / Signed | Prop to Unlicence (`EqLicenseStatus.ProptoUnlicence`, 8) |

The log line of each mapped row records the original value (e.g. `licence status 'Prop to Unlicence - Licence Issued' mapped to 'Prop to Unlicence'`). In the sample, 105 rows are mapped.

**Required columns** (the run is rejected if one is missing from the header): Equipment ID, Parent TME ID, Customer, Site, Equipment Class, Infrastructure, Equipment Install Status, Equipment Licence Status. All the other mapped columns are optional in the header.

**Scripts on equipment:** `oTWC_equipment_ue.js` only has a `beforeLoad` limited to the UI, so there are no side effects on create.

**Equipment acceptance** (see also §8):
- The dry run on the sample shows `VALID` / `ERROR` per row. Expect errors for the 17 ATMEs whose parent TMEs are missing, unless those TMEs are already in the sandbox.
- After the real run, the inventory page for a sample site shows the migrated equipment with the right class, type, statuses and parent TME.

### 6.2 SRF (v1.2: built 2026-11-23, to be tested in the sandbox)

**Files** (one CSV per Radix sheet, §3.1). Only `srf.csv` is required. A step whose file is not uploaded is skipped, so children can be loaded in a later run against SRFs migrated earlier.

| Slot | Sample | Rows | Required columns |
|---|---|---|---|
| `srf.csv` | `SRF_Sample.csv` | 37 | Radix SRF ID, Site, Customer, SRF Status |
| `srf_items.csv` | `SRF_Item_Sample.csv` | 452 | SRF, Equipment ID, Request Type, Step Type |
| `srf_reviews.csv` | `SRF_Review_Sample.csv` | 257 | SRF, Review Iteration |
| `sds.csv` | `SDS_Sample.csv` | 19 | RADIX SDS ID, SRF (RADIX SRF ID), Status |
| `sds_items.csv` | **extract not available yet** | – | to be specified when the extract arrives |
| `equip_actions.csv` | `SRF_EqActions.csv` | 455 | ID, EA Equipment (RADIX Equip ID), EA SRF, EA Type, EA Status |

*SRF Files* and *SDS Files* (drawings, PDFs) are phase 2.

**Steps (in order)**

| # | Step | File | What it does | Modes |
|---|---|---|---|---|
| 1 | `srf` | srf | create the SRFs | import, dry run |
| 2 | `items` | srf_items | create the SRF items | import, dry run |
| 3 | `itemParents` | srf_items | link ATME / FEEDER items to the TME item of the same SRF (`TMI_ID_SRF`), Q21 | import |
| 4 | `reviews` | srf_reviews | create the SRF reviews | import, dry run |
| 5 | `sds` | sds | create the SDSs | import, dry run |
| 6 | `sdsItems` | sds_items | create the SDS items (**later**, when the extract arrives) | import, dry run |
| 7 | `actions` | equip_actions | create the equipment actions | import, dry run |
| 8 | `actionLinks` | equip_actions | `Related EA` and the equipment → EA link (Q19) | import |

Each child step resolves its SRF by Radix Id among **all** migrated SRFs, so a child whose SRF is neither in this run nor migrated earlier → ERROR. Steps 3 and 8 only touch records created by this run (same rule as the Equipment `parents` step).

**Status consistency (Q2: agreed).** Every child row in the extract is imported, whatever the SRF status. The status is only used for warnings:
- An SRF that is not *SRF Cancelled* and has no items in `srf_items.csv` → `WARNING: no SRF items`. In the sample: 7607 (*Licence Issued*) and 7428 (*Licence Executed*).
- An SRF at *Licence Requested* or later with no SDS in `sds.csv` → `WARNING: no SDS`.
- An EA whose type does not match its item's request type (Install → Licence, Remove → Unlicence, Swap → Swap Unlicence / Swap Licence) → WARNING.

**Open SRFs (Q14: agreed).** No SRF workflow records are created. A separate script will create the workflows of the open SRFs later. In the sample, 8 SRFs are open (*Submitted* 3, *Under Review* 4, *Feedback issued* 1). @@REVIEW: check in the sandbox that the portal opens a migrated open SRF without a workflow, read-only, without throwing.

**Names (Q18: agreed).** Following the Nexus naming conventions:
- **SRF:** NetSuite auto-numbering (the name is not set), as for Equipment. The Radix SRF ID stays in Radix Id.
- **SDS:** the SRF name with `SRF` replaced by `SDS` (`oTWC_sdsEngine.js`).
- **Review:** `R{srfName}_{iteration}` (`oTWC_srfWorkflowEngine.js`).
- **SRF item:** the equipment's Nexus name, as the portal does.
- **EA:** the Radix ref (`EQAC-910002`, Q10).

#### 6.2.1 SRF → `customrecord_twc_srf` (`twcSrf.Fields.*`)

| CSV column | Field | Type / lookup | Notes |
|---|---|---|---|
| ID | – | | Nexus internal id. **If filled → ERROR**, same as Equipment |
| Radix SRF ID | `RADIX_ID` | text | duplicate key; required |
| – | `NAME` | | Q18 |
| SRF Type | `SRF_TYPE` | `customrecord_twc_srf_type` by name | always `-` (empty) in the sample |
| Revenue Impacting | `REVENUE_IMPACTING` | `customrecord_twc_srf_revenue_impact` by name | always `-` in the sample |
| Operator Site ID | `OPERATOR_SITE_ID` | text, **`0` = empty** (Q9) | `0` in 16 rows |
| Site | `SITE` | site by code (§5) | required |
| Customer | `CUSTOMER` | company by name | required |
| – | `STRUCTURE` | infrastructure | not in the SRF extract. Taken from the SRF's items when they all have the same *Structure* (Q22: agreed). Otherwise left empty with a WARNING. In the sample, 2 SRFs have items on two structures (`-T01` and `-A01`) |
| SRF Submitted By (RADIX Profile ID) | `SRF_SUBMITTED_BY` | profile by Radix id (Q4, Q17) | header spans two lines (matched with the line break) |
| Application Date | `APPLICATION_DATE` | date | |
| Application Reference | `APPLICATION_REFERENCE` | text | |
| Power Supply Requested from TL | `POWER_SUPPLY_REQUESTED_FROM_TL` | checkbox | |
| Alternate Power Supplier | `ALTERNATE_POWER_SUPPLIER` | text | |
| Application for own supply made to ESB | `APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB` | checkbox | |
| Power Notes | `POWER_NOTES` | text | |
| SRF Status | `SRF_STATUS` | `customrecord_twc_srf_status` by name | required. Set in the create, so the `oTWC_srf_ue.js` emails do not fire (§6.5) |
| SRF Requested Date | `SRF_REQUESTED_DATE` | date | |
| Initial Review Comments | `INITIAL_REVIEW_COMMENTS` | text | |
| Customer Planned Install Date | `CUSTOMER_PLANNED_INSTALL_DATE` | date | |
| Feedback Loop Iterations | `FEEDBACK_LOOP_ITERATIONS` | integer | |
| SRF Approval Date | `SRF_APPROVAL_DATE` | date | |
| Works Permitted Date | `WORKS_PERMITTED_DATE` | date | |
| To be Billed | `TO_BE_BILLED` | checkbox | |
| Bill From | `BILL_FROM` | date | |
| SRF Conditions | `SRF_CONDITIONS` | text | |
| TL Drawing Requested | `TL_DRAWING_REQUESTED` | checkbox | |
| TL Drawing Assigned To | `TL_DRAWING_ASSIGNED_TO` | profile by Radix id (Q4) | |
| TL Drawing Uploaded | `TL_DRAWING_UPLOADED` | date | |
| Licence Mechanism | `LICENCE_MECHANISM` | `customrecord_twc_lic_mech` by name | Radix says `On-Line`. If the Nexus name is `Online`, give it a Radix Name (§5) |
| Licence Requested | `LICENCE_REQUESTED` | date | |
| Licence Pack Produced / Reviewed / Issued | `LICENCE_PACK_PRODUCED` / `_REVIEWED` / `_ISSUED` | date | |
| Licence Pack Reviewer | `LICENCE_PACK_REVIEWER` | profile by Radix id (Q4) | |
| Licence Pack Signed | `LICENCE_PACK_SIGNED` | date/time field | set to the date at 00:00 (Q8) |
| Licence Pack Signed By | `LICENCE_PACK_SIGNED_BY` | profile by Radix id (Q4) | |
| Licence Pack Executed | `LICENCE_PACK_EXECUTED` | date/time field | date at 00:00 |
| Licence Pack Executed By | `LICENCE_PACK_EXECUTED_BY` | employee (Q20) | the Nexus field points to an **employee**. When the Radix value is filled, it is set to the first employee (lowest id) with `custentity_twc_can_execute_pack` = T, and the log records the Radix profile id. No such employee → left empty with a WARNING |
| SRF Notes | `TL_NOTES` (`custrecord_twc_srf_notes`) | text | Q23: agreed |

Not set: `RELATED_EQUIPMENT_ACTIONS`, `SRF_DRAWINGS` (phase 2), `HOLD_ACTION`, `SDS_FORM_DATA`, `SUBMISSION_NOTES`, `LICENSE_REQUESTED_BY` (no column).

#### 6.2.2 SRF Items → `customrecord_twc_srf_itm` (`twcSrfItem.Fields.*`)

| CSV column | Field | Type / lookup | Notes |
|---|---|---|---|
| SRF | `SRF` | SRF by Radix Id | required |
| Equipment ID | `EQUIPMENT_ID` | equipment by Radix Id | required. Radix Id = `{SRF}-{Equipment ID}`, the duplicate key |
| – | `NAME` | | the equipment's Nexus name (Q18) |
| Request Type | `REQUEST_TYPE` | `customrecord_twc_srf_itm_req_type` by name | required (`Install`, `Remove`; `Swap` not in the sample) |
| Step Type | `STEP_TYPE` | `customrecord_twc_eq_class` by name | required |
| Item Type | `ITEM_TYPE` | `customrecord_twc_eq_type` by name, of the step's class | as for Equipment |
| Equipment Library Entry | `EQUIPMENT_LIBRARY` | `customrecord_twc_eq_lib` by name | |
| Parent TME ID | `TME_ID` | equipment by Radix Id | a TME points to itself, as the portal copies the equipment's parent. Not found → ERROR: 14 rows in the sample point to TMEs that are not in the Equipment sample |
| TME ID / TMI ID (SRF) | – | | empty in the sample. `TMI_ID_SRF` is set by step 3 |
| Structure | `STRUCTURE` | infrastructure by name | must belong to the SRF's site |
| Description / Make / Model | `DESCRIPTION` / `MAKE` / `MODEL` | text | |
| Length (mm) / Width (mm) / Height/Depth (mm) | `LENGTH_MM` / `WIDTH_MM` / `DEPTH_MM` | integer | |
| Height on Tower (m) / Weight (kg) / Azimuth | `HEIGHT_ON_TOWER` / `WEIGHT_KG` / `AZIMUTH` | decimal | |
| Voltage Type | `VOLTAGE_TYPE` | `customrecord_twc_equip_voltage_type` by name | |
| B-End / Customer Ref | `B_END` / `CUSTOMER_REF` | text | |
| Inventory Flag | `INVENTORY_FLAG` | `customrecord_twc_srf_itm_inv_flag` by name | |
| Feeder Type | `FEEDER_TYPE` | `customrecord_twc_srf_itm_typ_opt` by name (Radix Name) | |
| GIE Location | `GIE_LOCATION` | text | |
| Modified Antenna Location | `MODIFIED_ANTENNA_LOCATION` | `customrecord_twc_srf_itm_loc_type` by name | |

Not set: `FEEDER_COUNT`, `FEEDERS_DESCRIPTION`, `FILENAME`, the power / ESB fields, `NOTES__COMMENTS` (no columns).

**Step 3 `itemParents` (Q21: agreed).** For an ATME / FEEDER item whose parent TME is also an item of the **same SRF**, set `TMI_ID_SRF` to that item. In the sample this applies to 353 of the 367 child items. The others keep only `TME_ID`.

#### 6.2.3 SRF Reviews → `customrecord_twc_srf_rev` (`twcSrfReview.Fields.*`)

| CSV column | Field | Type / lookup | Notes |
|---|---|---|---|
| SRF | `SRF` | SRF by Radix Id | required |
| Review Iteration | `REVIEW_ITERATION` | integer | required. Radix Id = `{SRF}-{iteration}` |
| – | `NAME` | | `R{srfName}_{iteration}` (Q18) |
| Submission Date / TL Review Complete | `SUBMISSION_DATE` / `TL_REVIEW_COMPLETE` | date | |
| Customer Submission Comments / TL Review Comments | `CUSTOMER_SUBMISSION_COMMENTS` / `TL_REVIEW_COMMENTS` | text | |
| TL Review Result | `TL_REVIEW_RESULT` | `customrecord_twc_tl_review_result` by name | `Approved`, `Feedback Issued` |
| Structural Analysis Required / Space Check Passed / TL Services Requested / Facilities Check Passed / Full Planning Required / Estates Check Passed / Pricing Required / Customer Accounts Check Passed | the matching checkbox fields | checkbox | |
| SA / Services / FP Requested & Complete, Planned & Actual (12 columns) | the matching date fields | date | all empty in the sample |
| Space / Facilities / Estates / Customer Accounts Check Comments | the matching comment fields | text | |
| Fee Reduction / Fee Uplift / New Licence Fee | `FEE_REDUCTION` / `FEE_UPLIFT` / `NEW_LICENCE_FEE` | currency | |
| Fee Change Breakdown | `FEE_CHANGE_BREAKDOWN` | text, **`0` = empty** (Q9) | `0` in 150 rows |

Not set: `SUBMITTED_BY` (no column). In the sample, 215 of the 257 reviews belong to SRFs that are not in the SRF sample, so they will be ERROR until those SRFs are migrated.

#### 6.2.4 SDS → `customrecord_twc_sds` (`twcSds.Fields.*`)

| CSV column | Field | Type / lookup | Notes |
|---|---|---|---|
| Name | – | | empty in the sample; ignored (Q18) |
| RADIX SDS ID | `RADIX_ID` | text | duplicate key; required |
| SRF (RADIX SRF ID) | `SRF` | SRF by Radix Id | required |
| Site | `SITE` | site by code | WARNING if it is not the SRF's site |
| Customer | `CUSTOMER` | company by name | |
| Status | `STATUS` | `customrecord_twc_sds_status` by name | required. The Radix spelling `Superceded` is mapped to `Superseded` |
| Commencment Date | `COMMENCMENT_DATE` | date | |
| Drawing Reference | `DRAWING_REFERENCE` | text, **`0` = empty** (Q9) | |
| Include License Map / Fibre Rights | `INCLUDE_LICENSE_MAP` / `FIBRE_RIGHTS` | checkbox | |
| Additional SRF Coniditons / Power Supply Comments | `ADDITIONAL_SRF_CONIDITONS` / `POWER_SUPPLY_COMMENTS` | text | |
| Fibre Duct Route Reference / Fibre Other Provider / Fibre Notes | `FIBRE_DUCT_ROUTE_REFERENCE` / `FIBRE_OTHER_PROVIDER` / `FIBRE_NOTES` | text | |
| Fibre Provider | `FIBRE_PROVIDER` | `customrecord_twc_infra_fibre_svc_provide` by name | `-` = empty |
| Previous License Fee / Fee Reduction / Fee Uplift / New License Fee | `PREVIOUS_LICENSE_FEE` / `FEE_REDUCTION` / `FEE_UPLIFT` / `NEW_LICENSE_FEE` | decimal | `25,307.00`: thousands separator stripped |
| Fee Charge Break Down | `FEE_CHARGE_BREAK_DOWN` | text | the field is a short text (300 chars). A longer value is cut with a WARNING |
| Agreement Template | `AGREEMENT_TEMPLATE` | **map** (Q7) | Radix ids (`2`, `7`, `26`, …) → Nexus agreement, through `AGREEMENT_TEMPLATE_MAP` in `oTWC_dm_config.js`, empty to start. Not mapped → left empty with a WARNING |
| Agreement Conditions | `AGREEMENT_CONDITIONS` | `customrecord_twc_agreement_cond` by name, `\|` separated | each ref (`SDS-COND00031`) by name. Not found → left out with a WARNING (Q7) |
| Agreement Conditions Data | `AGREEMENT_CONDITIONS_DATA` | – | **not imported for now** (WARNING when filled). Its keys (`5-field_1`) are Radix condition ids and cannot be used until the template / condition mapping is known (Q7) |

Not set: `DRAWING`, `PDF` (phase 2). The SDS PDF is not generated.

**Q7 value list.** Each SRF run (dry run included) also writes `{runName}_values.csv` to the run folder: every distinct Agreement Template and Agreement Condition value with its row count and whether it matched. Use this file to build the mapping.

#### 6.2.5 SDS Items → `customrecord_twc_sds_item` (later)
Waiting for the extract. The step and its mapping will be added when the extract arrives (record fields are in `oTWC_sdsItemPersistent.js`).

#### 6.2.6 Equipment Actions → `customrecord_twc_eq_action` (`twcEquipAction.Fields.*`)

| CSV column | Field | Type / lookup | Notes |
|---|---|---|---|
| Internal ID | – | | **If filled → ERROR** |
| ID | `NAME` and `RADIX_ID` | text | `EQAC-910002`, duplicate key; required |
| EA Equipment (RADIX Equip ID) | `EA_EQUIPMENT` | equipment by Radix Id | required. 3 rows in the sample point to equipment that is not in the Equipment sample |
| EA SRF | `EA_SRF` | SRF by Radix Id | required |
| EA SRF Item | `EA_SRF_ITEM` | SRF item `{EA SRF}-{EA Equipment}` | the column is empty in the sample, so the item is always found from the SRF + equipment. Not found → left empty with a WARNING |
| EA SAF (RADIX SAF ID) | – | | **not set here**: the SAF import back-links `EA_SAF` (§6.3) |
| EA Type | `EA_TYPE` | `customrecord_twc_eq_action_type` by name | required; `n/a` → ERROR (2 rows in the sample: `EQAC-910030`, `EQAC-910031`) |
| Related EA | `RELATED_EA` | EA by Radix Id | step 8. Empty in the sample |
| EA Status | `EA_STATUS` | `customrecord_twc_eq_action_sts` by name | required (`Pending`, `Complete`, `Never Installed`) |

**Step 8 `actionLinks` (Q19: agreed).**
- `RELATED_EA`, when filled.
- Set the equipment's `ASSOCIATED_EQUIP_ACTIONS` (a single select) to its **Licence / Swap Licence** EA, as `oTWC_srfWorkflowEngine.js` does when it creates the equipment of an install. Only on migrated equipment where the field is empty.

EAs need no consistency check against the equipment statuses: the statuses come from the Equipment import (Q11).

### 6.3 SAF — to be revised before build

**Files:** `saf.csv`, `saf_actions.csv`, `saf_crew.csv`, `saf_time_blocks.csv`, and `saf_log.csv` (missing from the sample, Q2). *SAF Files* is phase 2.

**Steps:** SAF → Time Blocks → Crew → SAF Actions (`SAF-ACTION EA` → EA by Radix Id `EQAC-…`) → back-link `EA_SAF` on the migrated EAs → SAF Log.

### 6.4 Trouble Tickets — later
Not specified. A TT creates and maintains a **support case** (`oTWC_trouble_tkt_ue.js`).

### 6.5 Side effects (SRF / SAF)
| Script | Risk | Mitigation |
|---|---|---|
| `oTWC_srf_ue.js` / `oTWC_saf_ue.js` afterSubmit | emails on status **change** (not on create: `oTWC_srf_ue.js` returns when there is no old record) | create with the final status in one save; never update the status |
| `svc/oTWC_saf_sts_update_svc.js` | moves migrated *Approved* SAFs whose last block has passed to *Awaiting Photos* **and emails the contractor** | **(v1.2, Q15)** the query skips records with *Radix Migrated* = T. Changed with the SAF import, once the SAF Radix fields exist |
| `svc/oTWC_srf_sts_update_svc.js` | moves migrated *Licence Executed* SRFs to *Completed* | **(v1.2, Q15)** the query skips SRFs with `custrecord_twc_srf_radix_migrated` = T. Changed with the SRF import |
| other SRF records (items, reviews, SDS, SDS items, EAs) | no user event scripts | – |
| `oTWC_forceView_ue.js` | blocks create in the **UI** only | not affected |

---

## 7. Notes / risks (v1.2)

1. **Retired licence statuses.** These are mapped at import (§6.1), so migrated equipment never carries an Issue 299 retired value. The one-off clean-up in `oTWC_controls_cs.js` does not need to be re-run after the migration.
2. **Names are case-insensitive.** `eir` and `eir Mobile` are different companies and resolve correctly. Only exact (trimmed, case-insensitive) duplicates in Nexus raise an ambiguity error.
3. **Parents outside the file.** Equipment whose parent TME is neither in the file nor already migrated → ERROR in step 2. The equipment itself stays created (without a parent), and the log says so. Fix: import the missing TMEs and re-run step 2 with the "Resume" action.
4. **(v1.2) Samples are partial extracts.** The SRF samples do not fully cover each other, so a dry run on them alone gives expected errors:
   - 215 of the 257 reviews have no SRF;
   - 14 SRF items have a parent TME that is not in the Equipment sample;
   - 3 EAs have equipment that is not in the Equipment sample;
   - 2 EAs have type `n/a`.
   The full extracts should be consistent. Run order for the real migration: Equipment (all) → SRF (all files in one run).
5. **(v1.2) Migrated open SRFs** have no workflow until the separate workflow script runs (Q14). Until then, Towercom staff cannot move them on in the portal.
6. **(v1.2) Agreement data** (template, conditions data) stays incomplete on migrated SDSs until the Q7 mapping is done. The SDS PDF is not generated by the migration.

---

## 8. Files and code layout

```
data_migration/
  oTWC_dm_import_sl.js       Suitelet (upload, run list, resume, delete run)
  oTWC_dm_import_svc.js      Scheduled script (entry point, requeue)
  oTWC_dm_engine.js          state / log / units / steps runner
  oTWC_dm_csv.js             CSV parser + value converters (dates, bools, nulls, numbers)
  oTWC_dm_lookups.js         by-name lookup maps (§5)
  oTWC_dm_equipment.js       handler (§6.1)
  oTWC_dm_srf.js             handler (§6.2) (v1.2)
  oTWC_dm_saf.js             handler (later)
  .docs/SPEC_v1.2.md         this file
```
The code follows the repo conventions: AMD/`@NApiVersion 2.1`, `SuiteBundles/Bundle 548734/...` paths, **no `N/search`** (SuiteQL / `RecordBase.select` only), and `@@HARDCODED @@GO-LIVE` on every internal id (root folder, script/deployment ids). Nothing can be run locally. Each step is pushed with nsLink and tested in the sandbox, dry run first.

**Acceptance per import type**
1. The dry run on the sample files marks every row `VALID`, or `ERROR` with a clear reason.
2. Real run: the record counts match the log. A re-run of the same files gives 100 % `SKIPPED_DUPLICATE`.
3. A forced restart (low units threshold in the sandbox) gives the same results as an uninterrupted run.
4. A spot check of 5 records per table against Radix, including the portal views.
5. A roll-back of the run removes everything it created.

---

## 9. Questions

### Answered (v1.1)
| # | Answer |
|---|---|
| Q1 | You create the Radix fields; equipment is done (§2.1). Radix Id is **text**. |
| Q3 | Look up companies **and all linked entities by name**. None or more than one → error. |
| Q5 | `custrecord_twc_equip_id` is obsolete. The Nexus Equipment Id = the NetSuite auto-generated `name`. |
| Q6 | The Location Note goes to the antenna location; for GIE it goes to the GIE location note. |
| Q8 | Use the date as is, without the time part. |
| Q10 | Keep the Radix refs as record names (except Equipment, Q5). |
| Q11 | Use the status from the file, but map the Issue 299 retired values to a non-retired one (§6.1). |
| Q12 | Duplicates are skipped, never updated (for now). |
| Q13 | Equipment milestone columns are ignored. |
| Q17 | Profiles are looked up by their Radix id (`custrecord_twc_prof_radix_entry_num`). |
| Q16 | All proposed framework decisions accepted (CSV per sheet, `HH.MM` folder names, one run at a time, dry run, roll-back, `ignoreMandatoryFields`). |

### Answered (v1.2, 2026-11-23)
| # | Answer |
|---|---|
| Q2 | SRF Items extract provided. **SDS Items: not available yet** (reminder pending). SAF Log: with the SAF import. Rule: import every child in the extract and use the SRF status only for warnings (§6.2). |
| Q4 | Reviewer / Signed-By / Assigned-To fields are **profiles**, looked up by Radix id (Q17). See Q20 for *Executed By*. |
| Q7 | Unknown for now. The dry runs build the list of values (`{runName}_values.csv`, §6.2.4) and the mapping is filled in from it. |
| Q9 | Yes: `0` is empty in the listed text columns (§4, §6.2). |
| Q14 | No workflow records are created. A separate script will create them for the open SRFs later. |
| Q15 | Yes: the batch jobs skip migrated records (§6.5). |

### Answered (v1.2, 2026-11-23, second set)
| # | Answer |
|---|---|
| Q18 | The SRF record uses auto-numbering: the SRF name is not set. SDS / Review / item names follow (§6.2). |
| Q19 | Yes: the equipment *Associated Equip Action* is set to its migrated Licence EA when empty. |
| Q20 | Look up the employee with `custentity_twc_can_execute_pack` = T, ordered by id, and use the first one. |
| Q21 | Yes: ATME / FEEDER items are linked to the TME item of the same SRF. |
| Q22 | OK: the SRF structure is taken from its items. |
| Q23 | Radix *SRF Notes* → TL Notes (`custrecord_twc_srf_notes`). |

### Still open (v1.2)
| # | Question |
|---|---|
| Q24 | The SDS Items extract (§6.2.5): when it arrives. |
