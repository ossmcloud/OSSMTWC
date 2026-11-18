/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_site.js'],
    (core, coreSQL, recu, twcSite) => {

        // @@NOTE: FSA Site (OSSMFSA app, customrecord_fsa_site) maintained from the OSSMTWC Site (customrecord_twc_site)
        //          the link is custrecord_fsa_site_entity_id = OSSMTWC Site internal id, custrecord_fsa_site_customer is left empty
        //          run by svc/oTWC_fsaSiteSync_svc.js (nightly) and oTWC_site_ue.js (on each site change)
        const FSA_SITE = {
            Type: 'customrecord_fsa_site',
            Fields: {
                NAME: 'name',
                INACTIVE: 'isinactive',
                SITE_ID: 'custrecord_fsa_site_id',
                SITE_NAME: 'custrecord_fsa_site_name',
                ALIAS: 'custrecord_fsa_site_alias',
                SITE_STATUS: 'custrecord_fsa_site_status',
                SITE_TYPE: 'custrecord_fsa_site_type',
                ADDRESS: 'custrecord_fsa_site_address',
                ADDRESS_EIRCODE: 'custrecord_fsa_site_address_zip',
                ADDRESS_COUNTY: 'custrecord_fsa_site_address_county',
                SITE_LATITUDE: 'custrecord_fsa_site_latitude',
                SITE_LONGITUDE: 'custrecord_fsa_site_longitude',
                ACCESS_LATITUDE: 'custrecord_fsa_site_latitude_access',
                ACCESS_LONGITUDE: 'custrecord_fsa_site_longitude_access',
                DIRECTIONS: 'custrecord_fsa_site_directions',
                ACCESS_INSTRUCTIONS: 'custrecord_fsa_site_instructions',
                ENTITY_ID: 'custrecord_fsa_site_entity_id',
            }
        }

        // @@NOTE: site status: OSSMTWC status 1 -> FSA status 1, any other (or none) -> FSA status 2
        //          site type: same internal ids on both lists (customrecord_twc_site_type entries created in customrecord_fsa_site_type)
        // @@HARDCODED @@GO-LIVE :: OSSMTWC / FSA site status internal ids
        const TWC_STATUS_ACTIVE = 1;
        const FSA_STATUS = { ACTIVE: 1, OTHER: 2 };

        // @@NOTE: the OSSMTWC site has no region: the FSA Site region is not maintained (it can be set on the FSA Site)

        const UNITS_RESERVE = 100;

        // ---------------------------------------------------------------------------------------------
        function str(v) { return `${v ?? ''}`.trim(); }
        function num(v) { var n = parseFloat(v); return isNaN(n) ? null : n; }
        function int(v) { return parseInt(v) || null; }

        // the FSA Site values of an OSSMTWC site row
        function fsaValues(t) {
            var f = FSA_SITE.Fields;
            var v = {};
            v[f.NAME] = `${str(t.site_id)} : ${str(t.site_name)}`;
            v[f.INACTIVE] = t.isinactive == 'T';
            v[f.SITE_ID] = str(t.site_id);
            v[f.SITE_NAME] = str(t.site_name);
            v[f.ALIAS] = str(t.alias);
            v[f.SITE_STATUS] = int(t.status) == TWC_STATUS_ACTIVE ? FSA_STATUS.ACTIVE : FSA_STATUS.OTHER;
            v[f.SITE_TYPE] = int(t.site_type);
            v[f.ADDRESS] = str(t.address);
            v[f.ADDRESS_EIRCODE] = str(t.zip);
            v[f.ADDRESS_COUNTY] = int(t.county);      // same list on both records (-195)
            v[f.SITE_LATITUDE] = num(t.lat);
            v[f.SITE_LONGITUDE] = num(t.lng);
            v[f.ACCESS_LATITUDE] = num(t.acc_lat);
            v[f.ACCESS_LONGITUDE] = num(t.acc_lng);
            v[f.DIRECTIONS] = str(t.directions);
            v[f.ACCESS_INSTRUCTIONS] = str(t.instructions);
            v[f.ENTITY_ID] = int(t.id);
            return v;
        }

        // the current FSA Site values (f_ columns) in the same format, to save only what changed
        function currentValues(t) {
            var f = FSA_SITE.Fields;
            var v = {};
            v[f.NAME] = str(t.f_name);
            v[f.INACTIVE] = t.f_isinactive == 'T';
            v[f.SITE_ID] = str(t.f_site_id);
            v[f.SITE_NAME] = str(t.f_site_name);
            v[f.ALIAS] = str(t.f_alias);
            v[f.SITE_STATUS] = int(t.f_status);
            v[f.SITE_TYPE] = int(t.f_type);
            v[f.ADDRESS] = str(t.f_address);
            v[f.ADDRESS_EIRCODE] = str(t.f_zip);
            v[f.ADDRESS_COUNTY] = int(t.f_county);
            v[f.SITE_LATITUDE] = num(t.f_lat);
            v[f.SITE_LONGITUDE] = num(t.f_lng);
            v[f.ACCESS_LATITUDE] = num(t.f_acc_lat);
            v[f.ACCESS_LONGITUDE] = num(t.f_acc_lng);
            v[f.DIRECTIONS] = str(t.f_directions);
            v[f.ACCESS_INSTRUCTIONS] = str(t.f_instructions);
            v[f.ENTITY_ID] = int(t.f_entity_id);
            return v;
        }

        // ---------------------------------------------------------------------------------------------
        // @@NOTE: options.all: every site, otherwise only the sites with no FSA Site or changed after it (lastmodified)
        //          options.ids: only these OSSMTWC sites (user event), options.fromId: resume cursor (scheduled script restart)
        function selectSites(options) {
            var where = ['t.id > ?']; var params = [parseInt(options.fromId) || 0];
            if (!options.all) { where.push('(f.id is null or t.lastmodified > f.lastmodified)'); }
            if (options.ids) {
                var ids = options.ids.map(id => parseInt(id)).filter(id => id > 0);
                if (ids.length == 0) { return []; }
                where.push(`t.id in (${ids.join(',')})`);
            }
            return coreSQL.runPaged({
                query: `
                    select  t.id, t.isinactive,
                            t.${twcSite.Fields.SITE_ID} as site_id, t.${twcSite.Fields.SITE_NAME} as site_name, t.${twcSite.Fields.ALIAS} as alias,
                            t.${twcSite.Fields.SITE_STATUS} as status, t.${twcSite.Fields.SITE_TYPE} as site_type,
                            t.${twcSite.Fields.ADDRESS} as address, t.${twcSite.Fields.ADDRESS_EIRCODE} as zip, t.${twcSite.Fields.ADDRESS_COUNTY} as county,
                            t.${twcSite.Fields.SITE_LATITUDE} as lat, t.${twcSite.Fields.SITE_LONGITUDE} as lng,
                            t.${twcSite.Fields.ACCESS_LATITUDE} as acc_lat, t.${twcSite.Fields.ACCESS_LONGITUDE} as acc_lng,
                            t.${twcSite.Fields.DIRECTIONS} as directions, t.${twcSite.Fields.ACCESS_INSTRUCTIONS} as instructions,
                            f.id as f_id, f.name as f_name, f.isinactive as f_isinactive,
                            f.custrecord_fsa_site_id as f_site_id, f.custrecord_fsa_site_name as f_site_name, f.custrecord_fsa_site_alias as f_alias,
                            f.custrecord_fsa_site_status as f_status, f.custrecord_fsa_site_type as f_type,
                            f.custrecord_fsa_site_address as f_address, f.custrecord_fsa_site_address_zip as f_zip, f.custrecord_fsa_site_address_county as f_county,
                            f.custrecord_fsa_site_latitude as f_lat, f.custrecord_fsa_site_longitude as f_lng,
                            f.custrecord_fsa_site_latitude_access as f_acc_lat, f.custrecord_fsa_site_longitude_access as f_acc_lng,
                            f.custrecord_fsa_site_directions as f_directions, f.custrecord_fsa_site_instructions as f_instructions,
                            f.custrecord_fsa_site_entity_id as f_entity_id
                    from    ${twcSite.Type} t
                    left join ${FSA_SITE.Type} f on f.custrecord_fsa_site_entity_id = t.id
                    where   ${where.join(' and ')}
                    order by t.id, f.id
                `,
                params: params
            });
        }

        // creates / updates the FSA Site of one OSSMTWC site row, returns 'created', 'updated' or null (nothing to do)
        function syncSite(t) {
            // @@NOTE: an inactive OSSMTWC site with no FSA Site is not created; Site ID and Site Name are mandatory on the FSA Site
            if (!t.f_id && t.isinactive == 'T') { return null; }
            if (!str(t.site_id) || !str(t.site_name)) {
                core.logError('FSA-SITE-SYNC', `OSSMTWC site ${t.id}: no Site ID or Site Name, FSA Site not ${t.f_id ? 'updated' : 'created'}`);
                return null;
            }

            var values = fsaValues(t);
            if (!t.f_id) {
                var rec = recu.new(FSA_SITE.Type);
                for (var fld in values) {
                    if (values[fld] !== null && values[fld] !== '') { rec.set(fld, values[fld]); }
                }
                rec.save();
                return 'created';
            }

            var current = currentValues(t);
            var fields = []; var vals = [];
            for (var fld in values) {
                if (values[fld] !== current[fld]) { fields.push(fld); vals.push(values[fld] ?? ''); }
            }
            if (fields.length == 0) { return null; }
            recu.submit(FSA_SITE.Type, t.f_id, fields, vals);
            return 'updated';
        }

        // @@NOTE: returns { lastId } when it stopped because of governance (the scheduled script restarts from there), null when done
        function syncSites(options) {
            options = options || {};
            var res = { created: 0, updated: 0, errors: 0, restart: null };
            var done = {}; var lastId = parseInt(options.fromId) || 0;

            var sites = selectSites(options);
            for (var i = 0; i < sites.length; i++) {
                var t = sites[i];
                // @@NOTE: more FSA Sites linked to the same OSSMTWC site: only the first one (lowest id) is maintained
                if (done[t.id]) { continue; }
                done[t.id] = true;

                if (core.env.units() < UNITS_RESERVE) { res.restart = { lastId: lastId }; break; }

                try {
                    var r = syncSite(t);
                    if (r) { res[r]++; }
                } catch (error) {
                    res.errors++;
                    core.logError('FSA-SITE-SYNC', `OSSMTWC site ${t.id}: ${error.message}`);
                }
                lastId = parseInt(t.id);
            }
            return res;
        }

        // @@NOTE: OSSMTWC site deleted: its FSA Site is inactivated (jobs may still point to it)
        function inactivateSite(twcSiteId) {
            coreSQL.each({
                query: `select id from ${FSA_SITE.Type} where custrecord_fsa_site_entity_id = ? and isinactive = 'F'`,
                params: [parseInt(twcSiteId) || 0]
            }, f => {
                recu.submit(FSA_SITE.Type, f.id, FSA_SITE.Fields.INACTIVE, true);
            });
        }

        return {
            FSASite: FSA_SITE,
            syncSites: syncSites,
            inactivateSite: inactivateSite,
        }
    });
