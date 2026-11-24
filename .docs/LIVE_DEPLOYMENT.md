1. Scheduled jobs start straight away, and some send email.
- Four scheduled scripts run daily from day one: cert status, FSA site sync, SRF status, and SAF status. The SAF status job moves SAFs to Awaiting Photos and emails the contractor.
- The SAF and SRF user events also send emails, from the NO_REPLY employee (827).
- If the account already holds migrated companies and profiles with real email addresses, customers and contractors will get emails from a system that isn't live yet.
- For the first deploy, set those deployments to Not Scheduled or Testing.

2. Hard-coded IDs may not match. None of the XMLs include list values; SDF only deploys the record types, not the records in them.
- The code relies on fixed IDs: about 40 status, flag and type lists, plus Towercom's own entity 822, company 57, email template 2, FSA form 33 and the file types.
- If production's values have different internal IDs, nothing errors: the code just writes the wrong statuses.
- The dry run did confirm that some sandbox values exist in production (for example the customer flag value), so the lists are at least partly set up.
- .docs/HARDCODED_IDS.md is the checklist to compare against production.

3. It overwrites what's already in production, with no rollback. The dry run showed production already has the roles and list values, so this project was set up there before.
- A deploy replaces the forms, fields, record permissions and deployment audiences with the sandbox versions, so anything configured directly in production is lost.
- SDF also never deletes anything. Every object it creates, including the unrelated project, issue and timesheet objects, then has to be removed by hand.

4. It uploads things that don't belong there. deploy.xml sends all of FileCabinet/, including:
- the data-migration specs and 18 sample-data spreadsheets and CSVs in data_migration/.docs/sample_files, which are probably real Radix customer and site data;
- data_nx/inspections.json;
- the test Suitelet and client script oTWC_controls_sl / _cs and the TOTP test file, with the Suitelet deployed as Released.

5. Security and noise.
- 38 deployments run as Administrator and log at DEBUG level.
- forceView_ue, which blocks editing records in the native forms, isn't Released in the XML, so production would get it in the same state as the sandbox.

6. Missing bundles break everything. The dry run doesn't check that Bundle 548734 (the OSSM framework) is installed in production. If it's missing, every script fails when it loads, and user events can block record saves.

Before a real deploy, I'd:
1. Narrow deploy.xml: leave out data_migration/.docs, data_nx, the controls/TOTP files, Templates, and the unrelated objects.
2. Set the scheduled deployments to Not Scheduled for the first deploy.
3. Check HARDCODED_IDS.md against production.
4. Confirm both bundles are installed in production.
5. Export production's current objects into a separate folder, so you have a copy to compare against and fall back to.