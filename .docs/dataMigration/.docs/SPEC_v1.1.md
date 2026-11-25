# Radix → Nexus Data Migration — Spec v1.1

> Supersedes `SPEC_v1.md`. Changes from v1.1 are marked **(v1.1)**.
> v1.1 adds your answers of 2026-11-16 (Q1, Q3, Q5, Q6, Q8, Q10–Q13, Q16, Q17, retired licence statuses), the regenerated equipment persistent object (Radix fields now in it), and the sample `Equipment SAMPLE DATA 2026-10-19.csv`.
> **Current focus: Framework + Equipment.** SRF and SAF sections are kept for reference and will be revised before they are built.

---

## 1. Goal and scope

Migrate the operational data from **Radix** (legacy system) into the TWC NetSuite custom records (**Nexus**) through a set of custom imports that run on the server, can be restarted, and are safe to re-run.

| # | Import type | Target records | Phase |
|---|---|---|---|
| 0 | **Framework** (Suitelet + scheduled engine + run state/log) | – | 1 — **now** |
| 1 | **Equipment** | `customrecord_twc_equip` | 1 — **now** |
| 2 | **SRF** | `customrecord_twc_srf`, `_srf_itm`, `_srf_rev`, `_sds`, `_sds_item`, `_eq_action` | 1 — after Equipment is tested |
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

**Still to create** (before SRF / SAF are built): srf, srf_itm, srf_rev, sds, sds_item, eq_action, saf, saf_action, saf_crew, saf_log, saf_tm_blk.
Child records with no Radix key of their own (SRF Review, Time Block, Crew) get a **synthetic key** in their Radix Id: Review = `{srfRadixId}-{iteration}`, Time Block = `{safRadixId}-{yyyymmdd}-{block}`, Crew = `{safRadixId}-{profileRadixId}`.

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
| Null values | `''`, `-`, `NULL` (case-insensitive) → empty. Values are trimmed. |
| Booleans | `1/0`, `Yes/No`, `Y/N`, `TRUE/FALSE`, `T/F`. |
| Dates (v1.1, Q8) | `dd/mm/yyyy`, with any time part **ignored**. The date is used **as is**, with no timezone conversion. |
| Numbers | Strip thousands separators; an empty value stays empty (not 0). A non-numeric value → `ERROR`. |
| Linked records and list values (v1.1, Q3) | Looked up **by name** in Nexus (exact match, case-insensitive, trimmed; inactive records included). **No match → ERROR. More than one match → ERROR.** No silent blanks, no "first match". |
| Errors | One bad row never stops the run. The row is logged `ERROR` with the column, the value and the reason, and nothing is created for it. All errors of a row are reported together. |
| Record names (v1.1, Q10) | Keep the Radix refs as `name` (e.g. `EQAC-910002`, `SFAC-910001`). **Exception — Equipment:** `name` is the NetSuite auto-generated number (§6.1). |
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
| Custom-record lists | `TME`, `Dish`, `Installed`, `Mast`, `BAU`, `Fibre Cable`, `DC 0-50v`, `No`, `Yes` | each list record (§6.1) | `name` |

---

## 6. Import types

### 6.1 Equipment (v1.1: ready to build)

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

### 6.2 SRF — to be revised before build

**Files:** `srf.csv` (*SAMPLE SRF*, required), `srf_review.csv` (*SAMPLE SRF Review*), `sds.csv` (*SAMPLE SDS*), `equip_actions.csv` (*Equip Actions*, from the SAF workbook), and **missing from the samples**: `srf_items.csv`, `sds_items.csv` (Q2). *SRF Files* / *SDS Files* are phase 2.

**Steps (in order):**
1. **SRF** → `customrecord_twc_srf`. Columns map 1:1 by label. `SRF Status` is looked up by name (*Feedback issued* → Feedback Issued, …). `name` = Radix SRF ref (Q10).
2. **SRF Items** → `customrecord_twc_srf_itm` (file to be provided, Q2).
3. **SRF Review** → `customrecord_twc_srf_rev`, parent = `SRF` (Radix SRF id). The unnamed column 7 (header `0`) = TL Review Complete, so the export header needs fixing. Reviews whose SRF is not in Nexus → ERROR (the sample has 258 reviews for 37 SRFs).
4. **SDS** → `customrecord_twc_sds`, parent = `SRF (RADIX SRF ID)`. The SDS PDF is left empty (phase 2).
5. **SDS Items** → `customrecord_twc_sds_item` (Q2).
6. **Equipment Actions** → `customrecord_twc_eq_action`, `name` = `EQAC-…`. `EA SAF` is set later by the SAF import. `Related EA` is set in a second pass. `EA Type` `n/a` / empty → ERROR.

"Depends on SRF status" (Q2): the proposal is to import a child if the extract contains it, and to use the status only as a consistency warning.

Migrated **open** SRFs have no SRF workflow records (Q14).

### 6.3 SAF — to be revised before build

**Files:** `saf.csv`, `saf_actions.csv`, `saf_crew.csv`, `saf_time_blocks.csv`, and `saf_log.csv` (missing from the sample, Q2). *SAF Files* is phase 2.

**Steps:** SAF → Time Blocks → Crew → SAF Actions (`SAF-ACTION EA` → EA by Radix Id `EQAC-…`) → back-link `EA_SAF` on the migrated EAs → SAF Log.

### 6.4 Trouble Tickets — later
Not specified. A TT creates and maintains a **support case** (`oTWC_trouble_tkt_ue.js`).

### 6.5 Side effects (SRF / SAF)
| Script | Risk | Mitigation |
|---|---|---|
| `oTWC_srf_ue.js` / `oTWC_saf_ue.js` afterSubmit | emails on status **change** (not on create) | create with the final status in one save; never update the status |
| `svc/oTWC_saf_sts_update_svc.js` | moves migrated *Approved* SAFs whose last block has passed to *Awaiting Photos* **and emails the contractor** | Q15 |
| `svc/oTWC_srf_sts_update_svc.js` | moves migrated *Licence Executed* SRFs to *Completed* | Q15 |
| `oTWC_forceView_ue.js` | blocks create in the **UI** only | not affected |

---

## 7. Notes / risks (v1.1)

1. **Retired licence statuses.** These are mapped at import (§6.1), so migrated equipment never carries an Issue 299 retired value. The one-off clean-up in `oTWC_controls_cs.js` does not need to be re-run after the migration.
2. **Names are case-insensitive.** `eir` and `eir Mobile` are different companies and resolve correctly. Only exact (trimmed, case-insensitive) duplicates in Nexus raise an ambiguity error.
3. **Parents outside the file.** Equipment whose parent TME is neither in the file nor already migrated → ERROR in step 2. The equipment itself stays created (without a parent), and the log says so. Fix: import the missing TMEs and re-run step 2 with the "Resume" action.

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
  oTWC_dm_srf.js             handler (later)
  oTWC_dm_saf.js             handler (later)
  .docs/SPEC_v1.1.md         this file
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

### Still open (needed for SRF / SAF, not for Equipment)
| # | Question |
|---|---|
| Q2 | Missing extracts: SRF Items, SDS Items, SAF Log; and the real "depends on SRF status" rule. |
| Q4 | Reviewer / Executed-By / Completion Reviewer / TL Drawing Assigned To: which NS record type do they point to? If profile, they are looked up by Radix id (Q17). |
| Q7 | Mapping of the Radix Agreement Template ids → NS templates; are the Agreement Condition refs the NS names? |
| Q9 | Extra null tokens (`0` in Operator Site ID)? |
| Q14 | How to handle open SRFs with no workflow records. |
| Q15 | Batch jobs acting on migrated SAF/SRF: skip migrated records? |
