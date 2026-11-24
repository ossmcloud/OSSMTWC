# Data Migration

## Overview
We need to migrate data from the old system to the new NetSuite system.
I need a series of custom imports to achieve this goal.

The old system was called Radix, the new system (in NetSuite) is sometime referred to as Nexus

Each import may require more than one file to use for the import.
Each entity will have a field name something like "Radix Entry Number" in both the import files and NetSuite tables, if you cannot find it stop and ask.


## Data Import Workflow
Each import should follow the same workflow:
1. Suitelet to select:
   - Import Type
   - Import File 
   - Additional Files (if required)

2. On Suitelet submit:
   - A folder in SuiteScripts > OSSMTWC - Radix is saved (Folder Name: {Import Type}_{YYYY.MM.DD}_{HH:MM})
   - All import files are saved inside the folder
   - A JSON file (same name as folder with .json extension added) is created with the import status details (it is very likely we need a re-start-able server task to perform the import
   - Start server task passing newly created subfolder id

3. Server Task:
   - the server task needs to keep rack of units and restart accordingly saving the current state to the json file
   - each imported record must be flagged as 'Radix Migrated' (there should be a field in every relevant table in NetSuite)
   - each imported record must also store the Radix record id (db key) and Radix Record No (string reference)
   - the process will maintain a log file (csv) with a line for every imported record and relevant info of created records or eventual error details
   - the process must check for duplicates and skip the record to avoid generating duplicates

 
## Import Types
The file import types are:
1. Equipment
  - 1 target table:
    - customrecord_twc_equip

2. SRF
  - 6 target tables:
    - customrecord_twc_srf => Always
    - customrecord_twc_srf_itm => Always
    - customrecord_twc_srf_rev => Dependds on SRF Status
    - customrecord_twc_sds => Dependds on SRF Status
    - customrecord_twc_sds_item => Dependds on SRF Status
    - customrecord_twc_eq_action => Dependds on SRF Status

3. SAF
  - 5 target tables:
    - customrecord_twc_saf
    - customrecord_twc_saf_action
    - customrecord_twc_saf_crew
    - customrecord_twc_saf_log
    - customrecord_twc_saf_tm_blk

4. Trouble Tickets (later)

## Coding Rules
All source import files must be saved within NetSuite folder "SuiteScripts > OSSMTWC - Radix"
All source code files must be inside folder: C:\e_drive\OSSM Developments\OSSMTWC\FileCabinet\SuiteScripts\OSSMTWC\data_migration
All related documentation must be inside folder: C:\e_drive\OSSM Developments\OSSMTWC\FileCabinet\SuiteScripts\OSSMTWC\data_migration\.docs


## Development Plan
A core 'data migration' framework is implemented first 
Each import type is implemented independently and only after the previous import type has been implemented and tested.
The sequence is:
1. Equipment
2. SRF
3. SAF
4. Trouble Tickets (later)


## Additional Info
There is also an external program (C:\e_drive\OSSM Developments\OSSMTWC\FileUtils) used to transfer physical files from a local directory to NetSuite.
That program uses suitelet FileCabinet\SuiteScripts\OSSMTWC\oTWC_importRadixFile_sl.js
We will eventually need to import actual documents related to SRF, SAF, SDS and Trouble Tickets but that is phase 2 and will be spec-ed separately.

 