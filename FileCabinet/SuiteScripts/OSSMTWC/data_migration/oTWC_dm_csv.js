/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix data migration: CSV parser and value converters (SPEC_v1.1 §3.1, §4)
//         converters throw a RowError, the engine logs it against the row
define([],
    () => {

        class RowError extends Error {
            constructor(message) {
                super(message);
                this.name = 'RowError';
            }
        }

        // @@NOTE: RFC 4180 parser: comma separated, double quote text qualifier ("" = escaped quote), CRLF / LF,
        //         new lines allowed inside quoted values; a leading BOM is stripped.
        //         a quote only opens a quoted value at the start of a field, anywhere else it is a literal (e.g. 12" dish)
        //         maxRecords (optional) stops after n records (header only parse)
        function tokenize(text, maxRecords) {
            text = text || '';
            if (text.charCodeAt(0) == 0xFEFF) { text = text.substring(1); }

            var records = [];
            var record = [];
            var value = '';
            var inQuotes = false;
            var fieldStart = true;
            for (var i = 0; i < text.length; i++) {
                var c = text[i];
                if (inQuotes) {
                    if (c == '"') {
                        if (text[i + 1] == '"') { value += '"'; i++; } else { inQuotes = false; }
                    } else {
                        value += c;
                    }
                } else if (c == '"' && fieldStart) {
                    inQuotes = true;
                    fieldStart = false;
                } else if (c == ',') {
                    record.push(value); value = '';
                    fieldStart = true;
                } else if (c == '\r') {
                    // @@NOTE: ignored, the \n closes the record
                } else if (c == '\n') {
                    record.push(value); value = '';
                    records.push(record); record = [];
                    fieldStart = true;
                    if (maxRecords && records.length >= maxRecords) { return records; }
                } else {
                    value += c;
                    fieldStart = false;
                }
            }
            if (value !== '' || record.length > 0) { record.push(value); records.push(record); }
            return records;
        }

        function parse(text) {
            var records = tokenize(text);

            // @@NOTE: drop fully empty lines (e.g. trailing new lines)
            records = records.filter(r => { return r.some(v => { return v.trim() !== ''; }); });
            if (records.length == 0) { return { headers: [], rows: [] }; }

            var headers = records[0].map(h => { return h.trim(); });
            var rows = [];
            for (var r = 1; r < records.length; r++) {
                var row = {};
                for (var h = 0; h < headers.length; h++) {
                    if (!headers[h] || row.hasOwnProperty(headers[h])) { continue; }
                    row[headers[h]] = records[r][h] === undefined ? '' : records[r][h];
                }
                rows.push(row);
            }
            return { headers: headers, rows: rows };
        }

        // @@NOTE: header only parse (suitelet validation), avoids parsing the whole file twice
        function parseHeaders(text) {
            var records = tokenize(text, 1);
            return records.length > 0 ? records[0].map(h => { return h.trim(); }) : [];
        }

        function missingColumns(headers, required) {
            return (required || []).filter(c => { return headers.indexOf(c) < 0; });
        }

        function toCsvLine(values) {
            return values.map(v => {
                if (v === null || v === undefined) { return ''; }
                v = String(v);
                return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
            }).join(',');
        }

        // ---------------------------------------------------------------------------------------------
        // value converters: empty values return null, invalid values throw RowError
        // ---------------------------------------------------------------------------------------------
        const NULL_TOKENS = ['', '-', 'null'];

        function text(value) {
            if (value === null || value === undefined) { return null; }
            value = String(value).trim();
            return NULL_TOKENS.indexOf(value.toLowerCase()) >= 0 ? null : value;
        }

        function number(value, column) {
            value = text(value);
            if (value === null) { return null; }
            var n = Number(value.replace(/,/g, ''));
            if (isNaN(n)) { throw new RowError(`${column}: '${value}' is not a number`); }
            return n;
        }

        function integer(value, column) {
            var n = number(value, column);
            if (n !== null && !Number.isInteger(n)) { throw new RowError(`${column}: '${value}' is not a whole number`); }
            return n;
        }

        function bool(value, column) {
            value = text(value);
            if (value === null) { return null; }
            var v = value.toLowerCase();
            if (['1', 'yes', 'y', 'true', 't'].indexOf(v) >= 0) { return true; }
            if (['0', 'no', 'n', 'false', 'f'].indexOf(v) >= 0) { return false; }
            throw new RowError(`${column}: '${value}' is not a yes/no value`);
        }

        // @@NOTE: dd/mm/yyyy (or yyyy-mm-dd), any time part is ignored and the date is used as is (SPEC Q8)
        function date(value, column) {
            value = text(value);
            if (value === null) { return null; }
            var d = value.split(/[ T]/)[0];
            var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(d);
            var y, mo, dd;
            if (m) { dd = Number(m[1]); mo = Number(m[2]); y = Number(m[3]); }
            else {
                m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(d);
                if (!m) { throw new RowError(`${column}: '${value}' is not a valid date (dd/mm/yyyy)`); }
                y = Number(m[1]); mo = Number(m[2]); dd = Number(m[3]);
            }
            var res = new Date(y, mo - 1, dd);
            if (res.getFullYear() != y || res.getMonth() != mo - 1 || res.getDate() != dd) {
                throw new RowError(`${column}: '${value}' is not a valid date (dd/mm/yyyy)`);
            }
            return res;
        }

        // @@NOTE: lookup key: trimmed, lower case, inner spaces collapsed (SPEC §4: exact, case-insensitive match)
        function key(value) {
            if (value === null || value === undefined) { return ''; }
            return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
        }

        // @@NOTE: runs a converter / lookup collecting its RowError, so all the errors of a row are reported together
        //         var get = collector(); v = get(() => ...); if (get.errors.length > 0) { throw new RowError(get.errors.join('; ')); }
        //         @@REVIEW: oTWC_dm_equipment.js has its own copy (signed off, left untouched)
        function collector() {
            var errors = [];
            var get = (fn) => {
                try { return fn(); } catch (error) {
                    if (error instanceof RowError) { errors.push(error.message); return null; }
                    throw error;
                }
            };
            get.errors = errors;
            return get;
        }

        function required(value, column) {
            if (value === null || value === undefined) { throw new RowError(`${column}: missing value`); }
            return value;
        }

        return {
            RowError: RowError,
            collector: collector,
            required: required,
            parse: parse,
            parseHeaders: parseHeaders,
            missingColumns: missingColumns,
            toCsvLine: toCsvLine,
            text: text,
            number: number,
            integer: integer,
            bool: bool,
            date: date,
            key: key
        }
    });
