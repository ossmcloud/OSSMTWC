/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    (core, coreSql, recu) => {

        const RECORD_STATE = {
            NEW: 'new',
            UNCHANGED: 'unchanged',
            DIRTY: 'dirty',
            DELETED: 'deleted'
        }

        const FIELD_TYPE = {
            TEXT: 'text',
            LONGTEXT: 'clobtext',
            TEXTAREA: 'textarea',
            SELECT: 'select',
            MULTISELECT: 'multiselect',
            DATE: 'date',
            DATE_TIME: 'datetimez',
            BOOL: 'checkbox',
            CURRENCY: 'currency',
            DECIMAL: 'float',
            INTEGER: 'int',
            PERCENT: 'percent',
            DOCUMENT: 'document',
        }

        const sanitizeString = (value) => {
            var invalidChars = [
                { c: ' ', r: '' },
                { c: '-', r: '_' },
                { c: '-', r: '_' },
                { c: ',', r: '_' },
                { c: '.', r: '_' },
                { c: ':', r: '_' },
                { c: ';', r: '_' },
                { c: '(', r: '' },
                { c: ')', r: '' },
                { c: '[', r: '' },
                { c: ']', r: '' },
                { c: '{', r: '' },
                { c: '}', r: '' },
                { c: '\'', r: '' },
                { c: '"', r: '' },
                { c: '%', r: '_pc' },
                { c: '&', r: '_and_' },
                { c: '+', r: '' },
                { c: '/', r: '' },
                { c: '\\', r: '' },
            ]
            var target = value;
            for (var xx = 0; xx < invalidChars.length; xx++) {
                target = target.replaceAll(invalidChars[xx].c, invalidChars[xx].r);
            }

            // cannot start with a number
            var numbers = {
                48: 'Zero',
                49: 'One',
                50: 'Two',
                51: 'Three',
                52: 'Four',
                53: 'Five',
                54: 'Six',
                55: 'Seven',
                56: 'Eight',
                57: 'Nine',
            }
            var firstChar = value.charCodeAt(0);
            if (firstChar >= 48 && firstChar <= 57) {
                target = `${numbers[firstChar]}${target.substring(1)}`;
            }

            return target;
        }

        function parseDate(value) {
            // @@NOTE: we assume: dd/MM/yyyy or yyyy-MM-dd
            var d = null;
            if (value.indexOf('-') >= 0) {
                var dateParts = value.split('-');
                d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            } else if (value.indexOf('/') >= 0) {
                var dateParts = value.split('/');
                d = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
            } else {
                throw new Error(`Invalid date format: ${value}`)
            }
            // @@NOTE: the +12 hours is to handle US servers
            // @@TODO: this won't really work if we have a date time
            return d.addHours(12);
        }

        class RecordBase {
            #id = null;
            #type = null;
            #fields = null;
            #static = false;
            #state = null;
            #r = null;
            constructor(type, fields, id, staticLoad) {
                this.#type = type;
                this.#fields = fields;
                this.#id = id;
                this.#static = staticLoad || false;
            }

            get id() { return this.#id }
            get type() { return this.#type; }
            get fields() { return this.#fields; }
            get static() { return this.#static; }
            get state() { return this.#state; }
            get r() {
                if (!this.#r) { this.load(this.id); }
                return this.#r
            }

            load(id) {
                if (!id) { id = this.#id; }
                this.#r = (id) ? recu.load(this.type, id, this.static) : recu.new(this.type, this.static);
                this.#state = (id) ? RECORD_STATE.UNCHANGED : RECORD_STATE.NEW;
            }

            get(fieldName) {
                return this.r.get(fieldName);
            }
            getText(fieldName) {
                return this.r.getText(fieldName);
            }

            set(fieldName, value) {
                try {
                    if (fieldName == 'id') { return; }
                    value = this.validateFieldValue(fieldName, value);
                    this.r.set(fieldName, value);
                    this.#state = RECORD_STATE.DIRTY;
                } catch (error) {
                    throw new Error(`${fieldName} [${value}]: ${error.message}`);
                }
            }
            setText(fieldName, value) {
                try {
                    value = this.validateFieldValue(fieldName, value);
                    this.r.setText(fieldName, value);
                    this.#state = RECORD_STATE.DIRTY;
                } catch (error) {
                    throw new Error(`${fieldName}: ${error.message}`);
                }
            }

            copyFromObject(obj) {
                for (var k in obj) {
                    if (k == 'id') { return; }
                    // @@NOTE: if we are copying from an object we could have fields that do not map to a persistent field, we just ignore these
                    if (!this.findField(k, true)) { continue; }
                    this.set(k, obj[k]);
                }
            }

            validateFieldValue(fieldName, value) {
                if (fieldName == 'id') { return; }
                if (fieldName == 'isinactive') { return; }
                if (fieldName == 'name') {
                    value = value.substring(0, 300);
                    return value;
                }

                var field = null;
                for (var f in this.#fields) {
                    if (this.#fields[f].name == fieldName) {
                        field = this.#fields[f];
                        break;
                    }
                }
                if (!field) { throw new Error(`You are trying to set a field that does not exists: ${fieldName}`); }
                if (field.type == FIELD_TYPE.TEXT) {
                    value = value?.substring(0, 300);
                } else if (field.type == FIELD_TYPE.TEXTAREA) {
                    value = value?.substring(0, 4000);
                } else if (field.type == FIELD_TYPE.DATE || field.type == FIELD_TYPE.DATE_TIME) {
                    if (value && value.constructor.name != 'Date') {
                        if (value.constructor.name != 'String') { throw new Error(`Invalid value type, expected Date or String got ${value.constructor.name} : value: [${value}]`); }
                        value = parseDate(value);

                    }
                } else if (field.type == FIELD_TYPE.BOOL) {
                    if (value === 'T' || value === 'F') {
                        value = (value === 'T');
                    }
                }
                // @@TODO: validate other types

                return value;
            }

            hasField(fieldName) {
                return this.findField(fieldName, true) != null;
            }
            findField(fieldName, doNotThrowError) {
                if (fieldName == 'name') { return { name: 'name', type: 'text' }; }
                if (fieldName == 'id') { return { name: 'id', type: 'int' }; }
                var field = this.#fields[fieldName.toUpperCase()];
                if (field) { return field; }
                for (var f in this.#fields) {
                    if (this.#fields[f].name == fieldName) {
                        field = this.#fields[f];
                        break;
                    }
                }
                if (!field) {
                    for (var f in this.#fields) {
                        if (this.#fields[f].alias == fieldName) {
                            field = this.#fields[f];
                            break;
                        }
                    }
                }
                if (!field) {
                    if (doNotThrowError) { return null; }
                    throw new Error(`You are trying to reference a field that does not exists: ${fieldName}`);
                }
                return field;
            }

            save(ignoreMandatory) {
                this.#id = this.r.save(ignoreMandatory);
                this.#state = RECORD_STATE.UNCHANGED;
                return this.#id;
            }

            del() {
                if (!this.id) { return; }
                recu.del(this.type, this.id);
                this.#state = RECORD_STATE.DELETED
            }


            /*
                options properties:
                    minimal:    bool                only selects id and name

                    fields:     string              an sql select statement (can be more than one fields, no starting comma)
                    fields:     Array<string>       a list of rec.Fields.FIELD_NAME to limit the select
                    fields:     Object              a list of objects: { FIELD_NAME: 'alias', FIELD_NAME: 'alias' ... }

                    where:      string              an sql where clause (can start with AND or WHERE)
                    where:      Array<Object>       a list of objects: { field: FIELD_NAME, [op|operator]: 'string', values: string | Array<string>}                            these are all concatenated with AND
                    where:  	Object              a list of fields with a straight equal to where clause { FIELD_NAME: 'equalToValue', FIELD_NAME: 'equalToValue' ... }       these are all concatenated with AND

                    orderBy:    string              an sql order by clause
                    orderBy:    Array<string>       a list of rec.Fields.FIELD_NAME to build the order by
                    orderBy:    Object              { FIELD_NAME: 'ASC', FIELD_NAME: 'DESC' }

            */

            select(options) {
                var sql = `select  id, \n`;

                var selectFormat = (field, alias) => {
                    var fieldAlias = alias || field.alias;
                    if (fieldAlias) { fieldAlias = sanitizeString(fieldAlias); }
                    var fieldAliasName = `as ${fieldAlias || field.name}_name`;

                    var sql = '';
                    if (field.type == FIELD_TYPE.DATE) {
                        sql += `        TO_CHAR(${field.name}, 'YYYY-MM-DD') as ${fieldAlias}, `
                    } else if (field.type == FIELD_TYPE.DATE_TIME) {
                        sql += `        TO_CHAR(${field.name}, 'YYYY-MM-DD HH24:Mi:ss') as ${fieldAlias}, `
                    } else {
                        sql += `        ${field.name} ${fieldAlias}, `
                        if (field.type == FIELD_TYPE.SELECT || field.type == FIELD_TYPE.MULTISELECT) { sql += `BUILTIN.DF(${field.name}) ${fieldAliasName}, ` }
                    }
                    sql += '\n'
                    return sql;
                }

                if (options?.minimal) {
                    sql += `name, \n`;
                } else {

                    if (options?.fields) {

                        if (typeof (options.fields) == 'string') {
                            sql += `\n${options.fields}`
                        } else if (typeof (options.fields) == 'object') {
                            if (Array.isArray(options.fields)) {
                                core.array.each(options.fields, f => {
                                    var field = this.findField(f.name || f);
                                    sql += selectFormat(field, f.alias);
                                })
                            } else {
                                for (var f in options.fields) {
                                    var field = this.findField(f);
                                    var alias = options.fields[f];
                                    if (options.useAlias) { alias = field.alias; }
                                    if (options.useNames) { alias = field.name; }
                                    sql += selectFormat(field, alias);

                                }
                            }
                        }


                    } else {
                        for (var f in this.fields) {
                            sql += selectFormat(this.fields[f], f.toLowerCase());
                        }
                        sql += `        TO_CHAR(created, 'YYYY-MM-DD HH24:Mi:ss') as created, TO_CHAR(lastmodified, 'YYYY-MM-DD HH24:Mi:ss') as modified`
                    }
                }

                var params = ['F'];
                sql += `\nfrom    ${this.type}\nwhere   isinactive = ? `;


                if (options?.where) {
                    if (typeof (options.where) == 'string') {
                        sql += `\n${options.where.replace('where', 'and')}`
                    } else if (typeof (options.where) == 'object') {
                        if (Array.isArray(options.where)) {
                            core.array.each(options.where, filter => {
                                var field = this.findField(filter.field);
                                sql += `\nand     ${field.name} ${filter.op || filter.operator || '='} ?`
                                params.push(filter.values);
                            })
                        } else {
                            for (var f in options.where) {
                                var field = this.findField(f);
                                sql += `\nand     ${field.name} = ?`
                                params.push(options.where[f]);
                            }
                        }
                    }
                }

                if (options?.orderBy) {
                    if (typeof (options.orderBy) == 'string') {
                        sql += `\norder by ${options?.orderBy}`
                    } else if (typeof (options.orderBy) == 'object') {
                        sql += `\norder by `
                        if (Array.isArray(options.orderBy)) {
                            core.array.each(options.orderBy, (orderBy, idx) => {
                                if (idx > 0) {
                                    sql += ', ';
                                }
                                sql += ` ${orderBy}`;
                            })
                        } else {
                            for (var f in options.orderBy) {
                                var field = this.findField(f);
                                sql += `${field.name} ${options.orderBy[f]}`
                            }
                        }
                    }

                } else {
                    sql += `\norder by name`
                }

                var sql = { query: sql, params: params }
                if (options?.getSql) { return sql; }

                return coreSql.run(sql);
            }

        }


        return {
            RECORD_STATE, RECORD_STATE,
            RecordBase: RecordBase
        }
    });
