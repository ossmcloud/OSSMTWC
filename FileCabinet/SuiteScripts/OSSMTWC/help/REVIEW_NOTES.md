# Nexus user help: review notes (internal, not part of the help)

The help in this folder was written from the code (November 2026), not from testing in NetSuite.
Open `index.html` in a browser. All pages share `help.css` and `nav.js` (side menu).

## Left out of the help on purpose (unfinished in code)

- **Dashboards**: shows "UNDER CONSTRUCTION" to everyone except the developer; several tiles have no query.
- **Nexus Record** page: record view and save are `@@TODO`; company filter SQL for non-employees looks broken (missing brackets).
- **Trouble Ticket "Resolve" / "Cancel Ticket"** buttons: commented out.
- Site page sections **Projects**, **Design**, **Schematics**, **Foundation**: empty. Air Conditioning shows only Infra Id.
- Site page sub-table add/edit/delete icons in edit mode: placeholder alerts ("edit stuff dude").

## To confirm before publishing

- Menu item names (come from the "OSSMTWC - Role Feature List" records) — help uses Site Locator, Site Equipment, Space Request, Site Access, Trouble Tickets, SDS Files, Company Profile.
- SRF workflow stage names (live in NetSuite stage records) — help describes them generically.
- SAF "Photo Req. Delay" default (1 day SB / 7 days LIVE) — help says "a few days' grace".
- Infrastructure fall-arrest status names for internal values 2 and 3; power reading status for value 5.
- Status-change emails for SRF and SAF are **only sent when `SB` is true** (disabled on LIVE, `@@GO-LIVE`); SDS signatory emails are commented out. The help does **not** promise these emails. The SAF "Awaiting Photos" email and the 30-day / on-the-day expiry reminders are documented.

## Possible bugs found while reading the code

- Site Locator **New Site** button is shown to every user (no permission check); help mentions it for staff only.
- Inventory **Add Equipment** may not pre-fill the site (`inv.siteId` read from an empty object in `getInventoryInfo`).
- Trouble Ticket list **Case Id** link (native NetSuite record) may be shown to portal users.
- Site panel Structure / Accommodation links open native records portal users can't access.
- Trouble Ticket → support case sync may not fire on portal saves if they count as inline edits.
- SAF: "SP Expired" set whenever Safe Pass status *changes*, not only on expiry (`certStatusEngine`).
- SAF: insurance error to other users always says "Customer" even when the contractor fails.
- SAF: "All crew" certificate checks exclude the PICW.
- SAF: "Upload Completion Photos" doesn't check permission level (view-only user gets an error after upload).
- SAF: Awaiting Photos job only processes SAF type id 4 (hard-coded), not the "requires SRF" flag.
- SAF: locator "SAF ID" filter noted in code as not working.
- SAF: Complete marks equipment Installed/Removed with the Works End Date = approval date, not the actual works date.
- SRF: "Execute SDS" detection uses `indexOf('pack executed') > 0` — fails if the stage name starts with it.
- SRF: fee visibility uses numeric `status >= SRFApproved` but status ids aren't ordered (Draft = 11).
- SRF: Completed SRFs are not forced read-only for FULL employees.
- SRF cancel at SRF Approved: comment says TL only, code allows customers (help follows the code).
- Radix import Suitelet: `twcThemesUE` not loaded, direct GET probably errors.
- UI typos: "Work pemritted date", "Radius (km)s", "ths file type", "Adiacent ground Owner", "Crane/Cherryicker", "tp accept this insurance"; Site page trouble ticket headings in raw upper case (ASSIGNED_TO).
