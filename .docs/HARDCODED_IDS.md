# OSSMTWC - @@HARDCODED constants

Generated 2026-11-24 from the code (`FileCabinet/SuiteScripts/OSSMTWC`), every `@@HARDCODED` tag (52 tags in 13 files).
Line numbers are those of the constant at the time of writing. Values are NetSuite internal ids unless stated otherwise.
All of them must be checked against the target account at go-live (`@@GO-LIVE`).

## 1. Custom record / list internal ids

| Constant | File:line | Table | Hard-coded values |
|---|---|---|---|
| `PUBLIC_FLAG` | `data/oTWC_utils.js:10` | `customrecord_twc_site_public` (OSSMTWC - Site Public) **and** `customrecord_twc_infra_publ` (OSSMTWC - Infra Public) - same ids used on both | Yes = 1, TL = 2 |
| `EQ_LIB_STATUS` | `data/oTWC_utils.js:17` | `customrecord_twc_eq_lib_sts` (OSSMTWC - Equip-Lib Library Entry Status) | Inactive = 1, Draft = 2, Active = 3 |
| `EQ_LIB_USE` | `data/oTWC_utils.js:24` | `customrecord_twc_equip_use_lib` (OSSMTWC - Equipment Use Library) | Draft = 1, Yes = 2, No = 3 |
| `EQ_ACTION_STATUS` | `data/oTWC_utils.js:31` | `customrecord_twc_eq_action_sts` (OSSMTWC - Equip-Action Status) | Pending = 1, Complete = 2, Cancelled = 3, Released = 4, AlreadyInstalled = 5, NeverInstalled = 6, AlreadyRemoved = 7 |
| `EQ_ACTION_TYPE` | `data/oTWC_utils.js:42` | `customrecord_twc_eq_action_type` (OSSMTWC - Equip-Action Type) | Licence = 1, Unlicence = 2, SwapLicence = 5, SwapUnlicence = 6 |
| `EQ_INSTALL_STATUS` | `data/oTWC_utils.js:51` | `customrecord_twc_equip_install_status` (OSSMTWC - Equipment Install Status) | Draft = 1, NotInstalled = 2, Installed = 3, Removed = 4, Cancelled = 5 |
| `EQ_LICENSE_STATUS` | `data/oTWC_utils.js:68` | `customrecord_twc_equip_licence_status` (OSSMTWC - Equipment Licence Status) | Draft = 1, ReqtoLicence = 2, ProptoLicence = 3, Licenced = 6, ReqtoUnlicence = 7, ProptoUnlicence = 8, Unlicenced = 11, Cancelled = 12, LicenceRetained = 13, LicenceSwapped = 14 (retired, commented out - Issue 299: 4, 5, 9, 10) |
| `CUSTOMER_FLAG` | `data/oTWC_utils.js:97`, `data/oTWC_config.js:30` (duplicate) | `customrecord_twc_cus_flag` (OSSMTWC - Customer Flag) | Customer = 1, No = 2 |
| `CONTRACTOR_FLAG` | `data/oTWC_utils.js:103`, `data/oTWC_config.js:36` (duplicate) | `customrecord_twc_con_flag` (OSSMTWC - Contractor Flag) | Contractor = 1, SubContractor = 2, No = 3 |
| `COMPANY_ACCREDITATION_STATUS` | `data/oTWC_utils.js:110`, `data/oTWC_config.js:44` (duplicate, `@@IMPORTANT`) | `customrecord_twc_co_accred_status` (OSSMTWC - Company Accreditation Status) | Inactive = 1, Accredited = 2, CertsExpired = 3, Pending = 4, ToBeRenewed = 6, No = 7 (Approved = 5 commented out) |
| `PROFILE_ACCREDITATION_STATUS` | `data/oTWC_utils.js:167` | `customrecord_twc_prof_accred_status` (OSSMTWC - Profile Accreditation Status) | Pending = 1, Accredited = 2, SPExpired = 3, NoSiteAccess = 4, Inactive = 6 |
| `NO_ACTIVE_EXPIRED` | `data/oTWC_utils.js:185` | `customrecord_twc_no_active_options` (OSSMTWC - No/Active Options) - profile cert statuses, company insurance statuses | No = 1, Active = 2, Expired = 3, Pending = 4 |
| `FILE_STATUS` | `data/oTWC_utils.js:214` | `customrecord_twc_file_status` (OSSMTWC - File Status) | Pending = 1, Rejected = 2, Approved = 3, Superseded = 4, NA = 5, Received = 6 |
| `SAF_ACTION_STATUS` | `data/oTWC_utils.js:328` | `customrecord_twc_saf_action_status` (OSSMTWC - SAF Action Status) | Pending = 1, Complete = 2, Detached = 3, AwaitingPhotos = 4 |
| `EA_ACTION_STATUS` | `data/oTWC_utils.js:335` | not determinable - exported as `twcUtils.EaActionStatus` but not used anywhere (probably `customrecord_twc_eq_action_sts`, already covered by `EQ_ACTION_STATUS`) | Pending = 1, Complete = 2 |
| `INFRA_TYPE` | `data/oTWC_utils.js:341` | `customrecord_twc_infra_type` (OSSMTWC - Infra Type) | Accommodation = 1, Structure = 2, Fibre = 3, Generator = 4 |
| `INFRA_STATUS` | `data/oTWC_utils.js:349` | `customrecord_twc_infra_sts` (OSSMTWC - Infra Status) | Active = 1, UTS = 2, Option = 3, ToBeRetired = 4, Retired = 5, NotLive = 6, Planned = 7 |
| `SRF_ITEM_STEP_TYPE` | `data/oTWC_utils.js:360` | `customrecord_twc_eq_class` (OSSMTWC - Equipment Class) - SRF item field `custrecord_twc_srf_itm_stype` | TME = 1, ATME = 2, GIE = 3, FEEDER = 4 |
| `EQ_CLASS_ENUM` | `data/oTWC_equipmentUI.js:8` | `customrecord_twc_eq_class` (OSSMTWC - Equipment Class) - duplicate of `SRF_ITEM_STEP_TYPE` (`@@TODO` merge) | TME = 1, ATME = 2, GIE = 3, FEEDER = 4 |
| `SRF_ITEM_REQUEST_TYPE` | `data/oTWC_utils.js:367` | `customrecord_twc_srf_itm_req_type` (OSSMTWC - SRF Item Request Type) | INSTALL = 1, REMOVE = 2, SWAP = 3 |
| `SRF_LICENCE_MECHANISM` | `data/oTWC_utils.js:373` | `customrecord_twc_lic_mech` (OSSMTWC - Licence Mechanism) | Online = 1, Traditional = 2 |
| `SRF_STATUS` | `data/oTWC_utils.js:378` | `customrecord_twc_srf_status` (OSSMTWC - SRF Status) | Submitted = 1, UnderReview = 2, FeedbackIssued = 3, Resubmitted = 4, SRFApproved = 5, LicenceRequested = 6, LicenceIssued = 8, LicenceExecuted = 9, SRFCancelled = 10, Draft = 11, LicenceSigned = 12, Completed = 13 (11 is also the default in `getSrfStatusName/Style/Html`) |
| `EQ_PACKAGE` | `data/oTWC_utils.js:452` | `customrecord_twc_package` (OSSMTWC - Package) - equipment field `custrecord_twc_equip_package` | Yes = 1, No = 2 |
| `SDS_STATUS` | `data/oTWC_utils.js:458` | `customrecord_twc_sds_status` (OSSMTWC - SDS Status) | Draft = 1, Current = 2, Superseded = 3, Cancelled = 4 |
| `SRF_REVIEW_STATUS` | `data/oTWC_utils.js:467` | `customrecord_twc_tl_review_result` (OSSMTWC - TL Review Result) - SRF review field `custrecord_twc_srf_rev_tl_rev_res` | Approved = 1, FeedbackIssued = 2 |
| `SRF_DEFAULT_FILE_TYPE` | `data/oTWC_utils.js:473` | `id`: `customrecord_twc_file_type` (OSSMTWC - File Type); `status`: `customrecord_twc_file_status` (OSSMTWC - File Status) | id = 12 (SRF Attachment), status = 5 (N/A) |
| `SAF_STATUS` | `data/oTWC_utils.js:480` | `customrecord_twc_saf_status` (OSSMTWC - SAF Status) | Pending = 1, Approved = 2, Rejected = 3, PartiallyComplete = 4, Complete = 5, Cancelled = 6, AwaitingPhotos = 7, PhotosReceived = 8, FeedbackIssued = 9 |
| `SAF_TIME_BLOCK` | `data/oTWC_utils.js:541` | `customrecord_twc_tm_blk_opt` (OSSMTWC - SAF Time Block Options) | A_8_TO_10 = 1, B_10_TO_12 = 2, C_12_TO_15 = 3, D_15_TO_18 = 4 |
| `TKT_STATUS` | `data/oTWC_utils.js:566` | `customrecord_twc_trbl_tkt_status` (OSSMTWC - Trouble Ticket Status) | New = 1, Assessed = 2, Resolved = 3, Cancelled = 4, InProgress = 5 |
| `TKT_PRIORITY` | `data/oTWC_utils.js:610` | `customrecord_twc_trbl_tkt_priority` (OSSMTWC - Trouble Ticket Priority) | None = 0 (no record), Urgent = 1, High = 2, Medium = 3, Low = 4, Monitored = 5, UTS = 6, Corrective_Action = 7 |
| `TWC_COMPANY` | `data/oTWC_utils.js:1656` | `customrecord_twc_company` (OSSMTWC - Company) - Towercom's own company record | 57 |
| `SITE_TYPE` | `data/oTWC_site.js:10` | `customrecord_twc_site_type` (OSSMTWC - Site Type) | NO_STRUCTURE = 4, STRUCTURE_ON_ROOFTOP = 5 |
| `WORKFLOW_STATUS` | `modules/oTWC_srfWorkflowEngine.js:16` | `customrecord_twc_srf_wkf_status` (OSSMTWC - SRF Workflow Status) | NEW = 1, IN_PROGRESS = 2, COMPLETED = 3, CANCELLED = 4, NOT_REQUIRED = 5 |
| `TWC_STATUS_ACTIVE` | `modules/oTWC_fsaSiteSyncEngine.js:37` | `customrecord_twc_site_sts` (OSSMTWC - Site Status) | Active = 1 |
| `FSA_STATUS` | `modules/oTWC_fsaSiteSyncEngine.js:38` | FSA bundle - FSA Site status (`custrecord_fsa_site_status` on `customrecord_fsa_site`) | ACTIVE = 1, OTHER = 2 |
| `TWC_SITE_FILE_TYPES` | `oTWC_importRadixFile_sl.js:115` | `customrecord_twc_file_type` (OSSMTWC - File Type) - `twcType` per Radix site folder | Access Drawings = 15, Agreements = 20, CAD Drawings = 21, Elevations = 22, License Map = 14, Panoramics = 23, Site Safety = 24 |
| SAF type literal (SQL) | `svc/oTWC_saf_sts_update_svc.js:44` (tag at :54) | `customrecord_twc_saf_type` (OSSMTWC - SAF Type) - `R_TYPE = 4` in the Awaiting Photos query | 4 (the only SAF type requesting completion photos) |
| `AGREEMENT_TEMPLATE_MAP` | `data_migration/oTWC_dm_config.js:60` | `customrecord_twc_agreement` (OSSMTWC - SDS Agreement) - Radix agreement id -> Nexus agreement id | empty (to be filled per account) |
| `FSA_FORM_SUPPORT_CASE` | `oTWC_fsaJob_ue.js:30` | FSA bundle - `customrecord_fsa_form` (FSA form "Support Case") | 33 |
| `STAGE_SPACE` / `STAGE_FACILITIES` | `oTWC_controls_cs.js:165` (test/debug file) | `customrecord_twc_srf_wks` (OSSMTWC - SRF Workflow Stage) | Space = 3, Facilities = 4 |

## 2. Native NetSuite record internal ids

| Constant | File:line | Table | Hard-coded value |
|---|---|---|---|
| `TOWERCOM_ENTITY` | `data/oTWC_config.js:18` | Entity - Towercom's own entity (support case `company`, message author, `custrecordtwc_entity` of the Towercom company) | 822 |
| `TKT_CASE_PROFILE` | `data/oTWC_config.js:19` | Support case profile (case field `profile`) | 1 |
| `TKT_CASE_STATUS` | `data/oTWC_config.js:20` | Support case status (case field `status`) | 1 |
| `NO_REPLY` | `data/oTWC_config.js:21` | Employee - "no reply" email author | 827 |
| `SAF_AWAIT_PHOTOS_MAIL_TEMPLATE` | `data/oTWC_config.js:22` | Email template (SAF Awaiting Photos email) | 2 |
| `TKT_CASE_CATEGORY` | `oTWC_fsaJob_ue.js:52` | Support case type (case field `category`) - used when the FSA form type is empty | 4 |

## 3. Script, deployment, parameter and folder ids

| Constant | File:line | Object | Hard-coded value |
|---|---|---|---|
| `SVC_SCRIPT_ID` | `data_migration/oTWC_dm_config.js:10` | Script record | `customscript_twc_dm_import_svc` |
| `SVC_DEPLOYMENT_ID` | `data_migration/oTWC_dm_config.js:12` | Script deployment | `customdeploy_twc_dm_import_svc` |
| `SVC_PARAM_FOLDER` | `data_migration/oTWC_dm_config.js:14` | Script parameter | `custscript_twc_dm_folder` |
| `ROOT_FOLDER_PARENT` / `ROOT_FOLDER_NAME` | `data_migration/oTWC_dm_config.js:17` | File Cabinet folder (SuiteScripts > OSSMTWC - Radix, looked up by name) | -15 / `OSSMTWC - Radix` |
| `SCRIPT_ID` | `svc/oTWC_fsaSiteSync_svc.js:12` | Script record | `customscript_otwc_fsasitesync_svc` |
| `DEPLOY_ID` | `svc/oTWC_fsaSiteSync_svc.js:13` | Script deployment | `customdeploy_otwc_fsasitesync_svc` |
| `PARAM_P1` | `svc/oTWC_fsaSiteSync_svc.js:14` | Script parameter | `custscript_otwc_fsasitesync_svc_p1` |
| `deploymentId` (inline) | `ui/views/oTWC_baseView.js:150` | Script deployment (any portal Suitelet opened from the page menu) | 1 (assumes one deployment per script) |

## Notes

- Duplicates to keep in step: `CUSTOMER_FLAG`, `CONTRACTOR_FLAG` and `COMPANY_ACCREDITATION_STATUS` exist in both `oTWC_utils.js` and `oTWC_config.js`; `EQ_CLASS_ENUM` (`oTWC_equipmentUI.js`) duplicates `SRF_ITEM_STEP_TYPE`.
- Not tagged but hard-coded the same way: `RADIX_FILE_TYPES` in `oTWC_importRadixFile_sl.js:87` (`twcType` = `customrecord_twc_file_type` ids 1, 2, 5, 6, 7, 9, 11, 12).
- `SAF_PHOTO_REQ_DELAY_DEFAULT` (`data/oTWC_config.js:25`) is tagged `@@GO-LIVE` only: it is a number of days (1), not an internal id.
