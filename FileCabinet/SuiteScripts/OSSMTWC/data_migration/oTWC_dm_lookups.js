/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix data migration: by-name lookups (SPEC_v1.1 §4, §5)
//         maps are loaded once per execution with one paged SuiteQL query, no per-row lookups.
//         a value that matches no record or more than one record is a row error (never a silent blank / first match)
define(['N/query', './oTWC_dm_config.js', './oTWC_dm_csv.js'],
    (query, dmConfig, dmCsv) => {

        // @@REVIEW: uses N/query paging directly because the maps can exceed 5000 rows (all migrated equipment);
        //           move to core.sql.js if/when it supports paged reads
        function runAll(sql, params) {
            var res = [];
            var paged = query.runSuiteQLPaged({ query: sql, params: params || [], pageSize: 1000 });
            paged.pageRanges.forEach(range => {
                paged.fetch({ index: range.index }).data.asMappedResults().forEach(r => { res.push(r); });
            });
            return res;
        }

        class LookupMap {
            // @@NOTE: rows must have an 'id' and the key column (default 'name')
            constructor(label, rows, keyColumn) {
                this.label = label;
                this.map = {};
                keyColumn = keyColumn || 'name';
                rows.forEach(r => {
                    var k = dmCsv.key(r[keyColumn]);
                    if (!k) { return; }
                    if (!this.map[k]) { this.map[k] = []; }
                    this.map[k].push(r);
                });
            }

            find(value) {
                return this.map[dmCsv.key(value)] || [];
            }

            add(value, row) {
                var k = dmCsv.key(value);
                if (!this.map[k]) { this.map[k] = []; }
                this.map[k].push(row);
            }

            // @@NOTE: returns the single matching row or null when value is empty; throws a RowError for none / many
            //         filter (optional) narrows the matches, e.g. infrastructure of the row's site; filterInfo describes it in the error
            resolveRow(value, column, filter, filterInfo) {
                if (value === null || value === undefined || value === '') { return null; }
                var matches = this.find(value);
                if (filter) { matches = matches.filter(filter); }
                var where = filterInfo ? ` ${filterInfo}` : '';
                if (matches.length == 0) { throw new dmCsv.RowError(`${column}: no ${this.label} found for '${value}'${where}`); }
                if (matches.length > 1) { throw new dmCsv.RowError(`${column}: ${matches.length} ${this.label} records found for '${value}'${where} (ids: ${matches.map(m => { return m.id; }).join(', ')})`); }
                return matches[0];
            }

            resolve(value, column, filter, filterInfo) {
                var row = this.resolveRow(value, column, filter, filterInfo);
                return row ? row.id : null;
            }
        }

        // @@NOTE: generic by-name map of a custom record / custom list; inactive records are included on purpose (SPEC §4)
        //         columns: { alias: 'field_id' } extra columns to load (e.g. the parent site of an infrastructure)
        //         tables listed in dmConfig.RADIX_NAME_FIELDS are matched on their Radix Name when it is not empty, otherwise on the name
        //         (only when matching on the name, i.e. no keyColumn given)
        function byName(label, table, columns, keyColumn) {
            var cols = ['id', 'name'];
            var radixNameField = dmConfig.RADIX_NAME_FIELDS[table];
            if (radixNameField && !keyColumn) {
                cols.push(`nvl(${radixNameField}, name) as lookupname`);
                keyColumn = 'lookupname';
            }
            for (var alias in (columns || {})) { cols.push(`${columns[alias]} as ${alias}`); }
            var rows;
            try {
                rows = runAll(`select ${cols.join(', ')} from ${table}`);
            } catch (error) {
                throw new Error(`Lookup '${label}' failed (select ${cols.join(', ')} from ${table}): ${error.message}`);
            }
            return new LookupMap(label, rows, keyColumn);
        }

        return {
            runAll: runAll,
            LookupMap: LookupMap,
            byName: byName
        }
    });
