# CLAUDE.md

Guidance for Claude Code when working in this repository. For the full background (domain, layout, workflows), read `ONBOARDING.md` — this file only adds the rules and pitfalls that matter when changing code.

## What this is

OSSMTWC is a **NetSuite SuiteScript 2.1 customization** for TWC (tower/site infrastructure, equipment, contractor accreditation, and the SRF / SAF / SDS paper-form-replacement workflows). It is built on OSSM's in-house framework, **Bundle 548734**, which is installed in the NetSuite account and is **not in this repo**.

- All code lives under `FileCabinet/SuiteScripts/OSSMTWC/`. Everything else at the root is IDE scaffolding or docs.
- Custom records, script deployments, roles, saved searches and NetSuite workflows live **only in the NetSuite account**. Only `Objects/customscript_oTWC_controls_sl.xml` is tracked — ignore `Objects/`.
- **Do not read or rely on anything in `.docs/`** (specs, schemas, TODO files, HOWTO, data). It is out of date and messy — the code is the source of truth. `ONBOARDING.md` points to `.docs/` in places; ignore those pointers. Only open a `.docs/` file if the user explicitly asks you to.

## Domain: main entities

- **Companies** (`data/oTWC_company.js`) — the organisations Towercom deals with. Each maps to an entity in NetSuite. A company can be a **customer**, a **contractor** or a **subcontractor**, in combinations: customer only, customer + contractor, contractor only, or contractor + subcontractor. In NetSuite terms, customers are **customer** records and contractors / subcontractors are **vendor** records; Towercom staff are **employees**. The current user's type is resolved in `data/oTWC_config.js` (`userInfo.isEmployee` / `isVendor`, `userInfo.recordType`).
- **Profiles** (`data/oTWC_profile.js`) — the companies' employees (people).
- **Sites** (`data/oTWC_site.js`) — the physical sites where Towercom has infrastructure onto which telecommunication equipment is installed.
- **Equipment** (`data/oTWC_equipment.js`) — equipment installed on sites. Four classes (`EQ_CLASS_ENUM` in `data/oTWC_equipmentUI.js`):
  - **TME** (1) — Tower Mounted Equipment
  - **ATME** (2) — Additional Tower Mounted Equipment, linked to an existing TME
  - **GIE** (3) — Ground & Indoor Equipment
  - **FEEDER** (4) — cables connecting TME/ATME to GIE

## Domain: main functionalities

- **Site Locator** (`ui/oTWC_siteLocator_*`, site record page `ui/oTWC_siteInfo_*`) — sites are where infrastructure exists and where equipment is maintained (installed, removed, swapped).
- **SRF** — Space Request / Site Request (`ui/oTWC_spaceRequest_*`, `data/oTWC_srf*.js`) — how customers request space on an infrastructure to install / remove / swap equipment.
- **SRF Workflow** (`modules/oTWC_srfWorkflowEngine*.js`, `data/oTWC_srfWorkflow*.js`) — the process Towercom staff follow to review, approve and sign off new space requests.
- **SDS** — Site Data Sheet (`modules/oTWC_sds*.js`, `data/oTWC_sds*.js`) — the final output of the SRF workflow: essentially the licence agreement. For most purposes the generated **PDF** is what matters.
- **SAF** — Site Access / Access Request (`ui/oTWC_siteAccess_*`, `data/oTWC_saf*.js`) — how customers or contractors request access to a site to perform surveys, install / remove / swap equipment and other tasks. **A site cannot be accessed without an approved SAF.**
- **Trouble Tickets** (`ui/oTWC_troubleTicket_*`, `data/oTWC_troubleTickets*.js`) — open and track issues related to sites / equipment. Each ticket creates and maintains a NetSuite **support case** record (`oTWC_trouble_tkt_ue.js`, `oTWC_support_case_ue.js`).
- **Inventory** (`ui/oTWC_inventory_*`) — the equipment list. **View only**: equipment cannot be edited here. Exception: when opened for a site (`siteId`), **employees** see an **"Add Equipment"** button (`add-equipment-button`, rendered in `ui/oTWC_inventory_sl.js`, handled by `addEquipment()` in `ui/js/oTWC_inventory.js`) that opens the native NetSuite equipment record in a new tab, pre-filled with the site. Non-employees never get the button and the page is forced view-only (`pageData.forceViewOnly`).

Other features:

- **Accreditation** — contractor companies and their people must hold valid certifications / insurance. `modules/oTWC_certStatusEngine.js` rolls per-person cert expiry dates up into an overall status (and per-company insurance certs into a company status); run by `svc/oTWC_certStatus_svc.js`. `oTWC_co_prof_accred_sts_date_ue.js` keeps accreditation status in step when company / profile records change.
- **Company Profile** (`ui/oTWC_companyProfile_*`) — portal page showing a company's details.
- **Dashboards** (`ui/oTWC_dashBoards_*`, plus a NetSuite portlet `oTWC_dashBoards_pl.js`).
- **Nexus Record** (`ui/oTWC_nexusRecord_*`, `data/oTWC_nexusRecordConfig.js`) — a generic, configuration-driven record / list viewer (list layout stored on the config record). Partly implemented (`@@TODO`s for record/list rendering by type).
- **SRF / SDS print** (`ui/oTWC_print_srf_sds_sl.js`) — print-only Suitelet producing the SRF / SDS output; no client script.
- **Infrastructure, power supply and inspections** — handled on the native NetSuite forms by the root-level scripts (`oTWC_infrastructure_*`, `oTWC_inspection_Infrastructure_ue.js`, `oTWC_power_*`, `oTWC_pwr_read_functionality_*`). `svc/oTWC_infra_sts_update_svc.js` flags infrastructure whose next fall-arrest cert date has passed.
- **Radix import** (`oTWC_importRadixFile_sl.js`) — utility Suitelet importing files from the legacy Radix system and attaching them to the matching record via its Radix reference.
- **Other batch jobs** — `svc/oTWC_srf_sts_update_svc.js` moves SRFs from Licence Executed to Completed; `svc/oTWC_saf_sts_update_svc.js` moves SAFs to Awaiting Photos after their last time block (+ delay) and emails the contractor; `svc/oTWC_utils_svc.js` processes imported file records.

### Locator pages and navigation

Every main functionality has a **locator** page: a map of the sites plus a list of the relevant entity (Site, SAF, SRF, Trouble Ticket, Equipment). SRF Workflow and SDS have no locator of their own — they are opened from within an SRF. The map/list part is shared — `ui/js/oTWC_siteLocatorPanel.js` + `ui/js/oTWC_googleMap.js` — so changes there affect all locator pages.

- Clicking an **item in the list** opens the record page in **view** mode: `core.url.script('<suitelet>', { recId: <id> })`.
- Clicking a **link on the map** (site pop-up links in `oTWC_googleMap.js`) opens the relevant page in **new** mode: `{ siteId: <site id>, edit: 'T' }` with no `recId`.
  - **Exception — Equipment:** equipment cannot be created or edited from these pages, only viewed. The map's `[Eq.]` link passes `siteId` without `edit=T` and opens the site's equipment in view mode. Don't add new/edit paths for equipment. (The only exception is internal: employees get an "Add Equipment" button on the inventory page when a `siteId` is given, which opens the native NetSuite equipment record — `ui/oTWC_inventory_sl.js`. Everyone else gets `forceViewOnly`.)
- On record pages, `edit=T` requests edit mode, but a view-only permission level always forces read-only.

## Two user interfaces

The same records are touched from two places — changing one does **not** change the other:

1. **The portal** — the Suitelet pages under `ui/` (customers and contractors via the "TWC Customer Center" role, plus staff). This is where data is created and edited.
2. **Native NetSuite record forms** — used by internal staff. Behaviour there comes from the ~40 User Event / Client scripts at the `OSSMTWC/` root (`oTWC_<record>_ue.js` / `_cs.js`: company, profile, site, SAF, SRF, SRF workflow, equipment, equipment library, files, infrastructure, power supply / readings, trouble ticket, support case, …).

`oTWC_forceView_ue.js` deliberately blocks manual **create** and **edit** of the records it is deployed on in the native UI (create throws; edit redirects to view), so those records can only be changed through the portal or scripts. It has a developer-only override. Do not "fix" a native form that refuses edits without checking whether this script is the cause.

## No build, no tests, no CLI

- There is **no** package.json, build step, linter, test runner or SuiteCloud CLI (`manifest.xml` / `deploy.xml` / `.project` are Eclipse NetSuite IDE scaffolding).
- Code is deployed by pushing individual files to the NetSuite File Cabinet with the VS Code **nsLink** extension (or the Eclipse plugin), then tested by hand in the sandbox.
- So you **cannot run or verify** changes locally. Check syntax carefully, say plainly that the change is untested in NetSuite, and tell the user which files need pushing.
- Never read, print, create or commit `.vscode/settings*.json` — they hold NetSuite TBA credentials. Ignore `.temp/` (local diff/preview output, gitignored).

## Code conventions

- Every script starts with a JSDoc header: `@NApiVersion 2.1` plus `@NScriptType` for entry-point scripts (`@NModuleScope public` for library modules). AMD `define([...], (a, b) => { ... })` modules — no ES `import`.
- File suffix = script type: `_ue` User Event, `_cs` Client Script, `_sl` Suitelet, `_svc` Scheduled Script, `_pl` Portlet. No suffix = library module.
- All files are prefixed `oTWC_`; business-object classes are named `OSSMTWC_<Name>`; module aliases are `twc<Name>` (e.g. `twcSite`, `twcConfig`).
- Framework modules are referenced as `'SuiteBundles/Bundle 548734/O/...'` (the dominant form; a few older files use `'/.bundle/548734/O/...'`). Use the `SuiteBundles/...` form in new code. Common ones: `core.js` (`core.logDebug` / `core.logError`), `core.sql.js`, `core.date.js`, `data/rec.utils.js`, `ui/nsSuitelet.js`. You can't read these files — if you need to know how one behaves, infer it from existing call sites in this repo or ask.
- The UI controls in `O/controls/` load **`core.j.js`** instead of `core.js` (they run in the browser as well as on the server) — keep using `core.j.js` there.
- Queries go through `RecordBase.select({ fields, where, orderBy, ... })` on business objects (or `core.sql.js` / SuiteQL). **Never use `N/search`.** Two legacy files still do (`O/oTWC_nsFileUtils.js`, `oTWC_pwr_read_functionality_sl.js`) — don't copy them.
- Match the surrounding style: 4-space indent, existing comment density, existing naming.

### Comment tags (team tracking — use them, don't strip them)

| Tag | Meaning |
|---|---|
| `@@TODO` | work still to do |
| `@@NOTE` | explains something non-obvious |
| `@@IMPORTANT` | change with extreme caution — other code depends on this |
| `@@REVIEW` | works but should be optimized or moved into the framework/SDK |
| `@@CODE-REVIEW` | to review with Giuseppe / Carlos |
| `@@HARDCODED` | hard-coded value (usually a NetSuite internal id) — every one must be tagged |
| `@@GO-LIVE` | must be checked/updated when deploying to production (usually paired with `@@HARDCODED`) |

Any new hard-coded internal id, script id or deployment id **must** get `// @@HARDCODED @@GO-LIVE :: ...`. Read `@@IMPORTANT` comments before editing nearby code.

## Architecture rules

### Data layer (`data/`)
`Suitelet/svc → data/oTWC_<name>.js (business object, hand-written) → data/persistent/oTWC_<name>Persistent.js (GENERATED) → O/data/oTWC_baseRecord.js (RecordBase) → Bundle 548734`

- **Never hand-edit `data/persistent/*Persistent.js`.** They are generated by the VS Code "NSUtils - Build Object (v2)" tool from NetSuite record XML and get overwritten. If a field is missing, tell the user to regenerate; put logic in the business object instead.
- A new business object extends `xPersistent.PersistentRecord`, re-exports `Type` / `Fields`, and exposes `get(id)` / `select(options)` / `getFields()` — copy `data/oTWC_site.js`.
- `data/*UI.js`, `oTWC_utils.js`, `oTWC_config.js`, `oTWC_configUIFields.js`, `oTWC_permissions.js`, `oTWC_rolePermission.js`, `oTWC_icons.js` are helpers with no persistent counterpart. `oTWC_siteLevel.js` and `oTWC_siteRow.js` are business objects with **no** persistent file — exceptions; ask before assuming standard behaviour.
- Shared enums and internal-id maps (`PERMISSION_FEATURE`, `PERMISSION_LEVEL`, …) live in `data/oTWC_config.js` — reuse them rather than adding literals.

### Feature pages (`ui/`)
Each page is five pieces — copy `ui/oTWC_siteInfo_*` when adding one:
1. `ui/oTWC_<f>_sl.js` — Suitelet via `uis.new({...})`; `get()` calls `twcBaseView.initPageData(context)` then `twcBaseViewUE.initView(...)`; `post()` dispatches on `context.request.parameters.action` and throws on unknown actions.
2. `ui/oTWC_<f>_cs.js` — thin client bootstrapper.
3. `ui/js/oTWC_<f>.js` — page controller extending `TWCPageBase` (`ui/js/oTWC_pageBase.js`).
4. `ui/views/oTWC_<f>.html` — `{TOKEN}` placeholder template filled with `replaceAll` (no templating engine).
5. `ui/modules/oTWC_<f>Utils.js` — server-side query / render / save logic.

- Permission checks use `pageData.userInfo.permission` against `twcConfig.PERMISSION_FEATURE` / `PERMISSION_LEVEL` (defined in `data/oTWC_permissions.js`). Levels: **0 NONE, 1 VIEW** (view only — must force read-only), **2 EDIT** (create / edit), **3 FULL** (create / edit / delete and other actions). Role 3 (Administrator) always gets FULL — hard-coded in `loadPermissions()`.
- UI widgets are rendered through `O/controls/oTWC_ui_ctrl.js` (`twcUI.render({ type: twcUI.CTRL_TYPE.X, ... })`) — use existing controls rather than hand-writing HTML widgets.
- Shared AJAX endpoints (file upload/preview, site search) go through `oTWC_microSvc_sl.js` — extend it rather than duplicating per page.
- A new feature also needs manual NetSuite steps the user must do: deploy the Suitelet (allow the "TWC Customer Center" role if customer-facing) and add a row to the **"OSSMTWC - Role Feature List"** custom record. Remind them.

### Engines and batch jobs
- `modules/` holds the program-workflow engines (SRF workflow state machine, SDS generation/render, cert-status roll-up). These are **not** NetSuite Workflows. The SRF workflow is data-driven (`form_data` JSON per stage, branching via `next_stage_pick`) — don't hard-code per-stage logic.
- `svc/*_svc.js` are Scheduled Scripts (logic usually in `modules/` or a helper). They must self-throttle: inside the processing loop check **`core.env.units()`** (note the `()` — it's a function) and when it drops below ~50 stop and return a restart marker / resume cursor (e.g. `{ lastId }`); `execute()` then requeues the same script with `N/task`, passing the cursor in a JSON script parameter. Follow `svc/oTWC_certStatus_svc.js` + `modules/oTWC_certStatusEngine.js` for any new job. (`svc/oTWC_infra_sts_update_svc.js` does not requeue — fine for small volumes only.)
- Always mind NetSuite governance units in loops (record loads/saves are expensive); prefer one SQL select over per-row `N/record` loads.

## Ignore

`.docs/` (outdated — see above), `data_nx/`, `FileCabinet/Templates/`, `Objects/`, `AccountConfiguration/`, `FileUtils/`, `.temp/`.

Ignore the following files as they only contain test/debug code:
- FileCabinet\SuiteScripts\OSSMTWC\oTWC_controls_sl.js
- FileCabinet\SuiteScripts\OSSMTWC\oTWC_controls_cs.js
- FileCabinet\SuiteScripts\OSSMTWC\oTWC_otop_test.js (TOTP generator, only loaded by the two files above)

Do **not** ignore this, even though it looks like a leftover:
- `XML/oTwc_print_SDS.xml` — the template `modules/oTWC_sdsRender.js` uses to build the SDS PDF.

## Known issues (don't "discover" these again)

- `data/persistent/oTWC_rowPersistent.js` ~L74-96: generated accessors reference `_recordFields.R.O.W._TYPE` etc. (bad find/replace) and will throw at runtime. It's generated — fix by regenerating, not hand-editing (unless the user says otherwise).
- Re-labelling a field in NetSuite breaks the generated object on rebuild.
- `RecordBase.select`: `noAlias` and `useNames` do the same thing; `useNames` is to be removed.

## Git

- Single `master` branch, direct commits, no PRs. Only commit when asked.
- Commit messages are terse; history is not documentation — the in-code `@@` tags are the reliable tracking.
