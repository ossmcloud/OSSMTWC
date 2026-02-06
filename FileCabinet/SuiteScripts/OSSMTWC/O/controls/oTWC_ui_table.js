/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js', '../../data/oTWC_icons.js'],
    (core, b64, icons, ctrlBase, twcIcons) => {
        const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // @@TODO: user core.utils.toFloat
        function toFloat(val) {
            if (val === undefined || val === null) { return 0; }
            if (val.constructor.name == 'Number') { return val; }
            val = parseFloat(val);
            if (isNaN(val)) { return 0; }
            return val;
        }

        class HtmlColResizeEngine {
            table = null;
            resizeColumn = null;
            resizeColumnObj = null;
            constructor(table) {
                this.table = table;
            }

            get resizing() {
                return this.resizeColumn != null;
            }

            handleResize = () => {
                this.table.ui.find('.o-col-title-resize').on('mousedown', e => {
                    if (e.buttons == 1) {
                        this.resizeColumn = jQuery(e.currentTarget).closest('div[data-id]');
                        this.resizeColumnObj = core.array.find(this.table.columns, 'id', this.resizeColumn.data('id'));
                        jQuery(e.currentTarget).css('background-color', 'var(--accent-fore-color)');

                        //this.resizeColumnObj = window.ws.configs.columns[this.resizeColumn.index()];
                        this.resizeColumnXStart = e.clientX;
                        this.resizeColumnWStart = this.resizeColumn.width();

                    }
                })

                this.table.ui.parent().on('mousemove', e => {
                    if (this.resizeColumn) {
                        if (e.buttons == 1) {
                            e.stopPropagation();
                            e.preventDefault();
                            this.resizeColumnW = this.resizeColumnWStart + (e.clientX - this.resizeColumnXStart + 15);
                            if (this.resizeColumnW < 50) { this.resizeColumnW = 50; }
                            if (this.resizeColumnW > 750) { this.resizeColumnW = 750; }
                            this.resizeColumn.css('min-width', this.resizeColumnW + 'px')
                            this.resizeColumn.css('max-width', this.resizeColumnW + 'px')
                            this.resizeColumnObj.resizedWidth = this.resizeColumnW;
                        } else {
                            //this.saveColWidth();
                            // @@NOTE: after column resize (i.e.: the mouse button is released) we want to wait a slight bit before resetting the resizeColumn property
                            //         this is because the 'click' event of the main worksheet will fore after the mouse button is released but we do not want to consider it
                            //         so the method handling the 'click' event will check for ws.colResize.resizeColumn property, if set it will exit
                            this.resizeColumn.find('.o-col-title-resize').css('background-color', 'transparent');
                            window.setTimeout(() => {
                                this.resizeColumn = null;
                                this.resizeColumnObj = null;
                            }, 500);
                        }
                    }
                })

            }


        }


        class HtmlTableColumnFilter {
            #column = null;
            #colHeader = null;
            #ui = null;
            #filters = null;
            constructor(col) {
                this.#column = col;
            }
            get filters() { return this.#filters; }
            get column() { return this.#column; }

            getHeader() { return this.#column.table.ui.find(`div.o-row-header>div[data-id="${this.#column.id}"]`); }

            open() {
                this.#colHeader = this.getHeader();
                if (this.#ui) {
                    this.close();
                } else {
                    this.#column.table.closeAllFilters();

                    var isDate = this.#colHeader.data('type') == 'date';
                    var values = []; var valueGrouped = {};
                    core.array.each(this.#column.table.data, (d, i) => {

                        if (!this.#column.table.applyFilter(this.#column.table.rows[i + 1], this)) { return; }

                        var v = d[this.#column.id];
                        if (v && v.value !== undefined) { v = v.value; }
                        if (v === null || v === '') { v = '(empty)'; }
                        if (isDate && v) {
                            v = new Date(v);
                            if (!valueGrouped[v.getFullYear()]) { valueGrouped[v.getFullYear()] = {}; }
                            if (!valueGrouped[v.getFullYear()][v.getMonth()]) { valueGrouped[v.getFullYear()][v.getMonth()] = {}; }
                            if (!valueGrouped[v.getFullYear()][v.getMonth()][v.getDate()]) { valueGrouped[v.getFullYear()][v.getMonth()][v.getDate()] = d[this.#column.id]; }
                        }

                        var valueFilter = values.find(vv => { return vv.value == v; })
                        if (!valueFilter) {
                            valueFilter = { value: v, count: 0 };
                            values.push(valueFilter);
                        }
                        valueFilter.count++;
                    })

                    var list = '';
                    if (isDate) {
                        for (var y in valueGrouped) {
                            var checked = this.#filters ? '' : 'checked';
                            list += `
                                <div>
                                    <span class="o-table-filter-list-expand">+</span> <input class="twc" type="checkbox" style="min-width: 25px; width: 25px;" ${checked}>${y}`;

                            for (var m in valueGrouped[y]) {
                                list += `
                                    <div style="padding-left: 14px">
                                        <span class="o-table-filter-list-expand">+</span> <input class="twc" type="checkbox" style="min-width: 25px; width: 25px;" ${checked}>${MONTHS[m]}`;

                                for (var d in valueGrouped[y][m]) {
                                    var itemChecked = this.#filters ? this.#filters.indexOf(valueGrouped[y][m][d]) >= 0 : true;

                                    list += `
                                        <div style="padding-left: 28px; display: none;">
                                            <input class="twc" type="checkbox" style="min-width: 25px; width: 25px;" data-value="${btoa(valueGrouped[y][m][d])}" ${itemChecked ? 'checked' : ''}>${d}
                                        </div>`;
                                }

                                list += '</div>';
                            }

                            list += '</div>';
                        }

                        list = jQuery(list);
                        list.find('.o-table-filter-list-expand').click(e => {
                            jQuery(e.currentTarget).siblings('div').slideToggle()
                        })
                        list.find('input').click(e => {
                            var checked = jQuery(e.currentTarget).is(':checked');
                            jQuery(e.currentTarget).siblings('div').each((idx, ele) => {
                                jQuery(ele).find('input').prop('checked', checked);
                            });
                        })


                    } else {
                        core.array.sort(values, 'value')
                        core.array.each(values, v => {
                            var checked = 'checked';
                            if (this.#filters && this.#filters.indexOf(v.value.toString()) < 0) { checked = ''; }
                            var vDisplay = v.value;
                            if (v.value == '(empty)') { vDisplay = `<span style="color: silver; font-style: italic;">${v.value}</span>` }
                            list += `
                                <div class="o-table-col-filter-list-item">
                                    <input class="twc" type="checkbox" style="min-width: 25px; width: 25px;" data-value="${btoa(v.value)}" ${checked}>${vDisplay} <span style="color: silver;">(${v.count})</span>
                                </div>
                            `;
                        });
                    }

                    var clearFilter = '';
                    if (this.#filters) { clearFilter = '<span class="o-table-col-filter-link" data-action="clear">clear filter</span>' }

                    var searchBox = '<input id="o-table-col-filter-search" class="twc" type="text" placeholder="search value to filter" />';
                    if (isDate) { searchBox = ''; }

                    this.#ui = jQuery(`
                        <div class="o-table-col-filter">
                            <div>
                                ${searchBox}
                            </div>
                            <div>
                                <span class="o-table-col-filter-link" data-action="select">select all</span>
                                <span class="o-table-col-filter-link" data-action="un-select">unselect all</span>
                                ${clearFilter}
                            </div>
                            <div id="o-table-col-filter-list" style="max-height: 200px; overflow: auto;">
                                
                            </div>
                            <div>
                                <button data-action="ok" class="twc">Confirm</button>
                                <button data-action="close" class="twc">Cancel</button>
                                
                            </div>
                        </div>
                    `);
                    this.#ui.find('#o-table-col-filter-list').append(list);

                    this.#ui.find('#o-table-col-filter-search').on('input', e => {
                        var v = jQuery(e.currentTarget).val().toLowerCase();
                        if (!v) {
                            this.#ui.find('.o-table-col-filter-list-item').css('display', 'block');
                        } else {
                            this.#ui.find('.o-table-col-filter-list-item').each((idx, ele) => {
                                var checkBox = jQuery(ele).find('input');
                                var thisValue = atob(checkBox.data('value')).toLowerCase();
                                if (thisValue.indexOf(v) >= 0) {
                                    jQuery(ele).css('display', 'block');
                                    checkBox.prop('checked', 'checked');
                                } else {
                                    jQuery(ele).css('display', 'none');
                                    checkBox.prop('checked', '');
                                }
                            })
                        }
                    })

                    this.#ui.find('button').click(e => {
                        e.preventDefault();
                        if (jQuery(e.currentTarget).data('action') == 'ok') {
                            this.#filters = [];
                            this.#ui.find('input[type="checkbox"').each((idx, ele) => {
                                if (jQuery(ele).is(':checked')) {
                                    if (jQuery(ele).data('value')) { this.#filters.push(atob(jQuery(ele).data('value'))); }
                                }
                            })
                            this.#column.table.applyFilters(this);
                        } else {
                            this.close();
                        }
                    })

                    this.#ui.find('.o-table-col-filter-link').click(e => {
                        e.preventDefault();
                        if (jQuery(e.currentTarget).data('action') == 'clear') {
                            this.#filters = null;
                            this.#column.table.applyFilters(this);
                        } else {
                            var check = jQuery(e.currentTarget).data('action') == 'select';
                            this.#ui.find('input[type="checkbox"').prop('checked', check);
                        }
                    });

                    this.#ui.css('top', this.#colHeader.offset().top + this.#colHeader.height() + 10)
                    this.#ui.css('left', this.#colHeader.offset().left);

                    this.#column.table.ui.append(this.#ui);
                }
            }

            close() {
                if (!this.#ui) { return; }
                this.#ui.remove();
                this.#ui = null;
            }

            clear() {
                if (this.#filters) {
                    if (this.#colHeader) { this.#colHeader.removeClass('o-table-column-filtered'); }
                }
                this.#filters = null;
            }

            set(value) {
                this.clear();
                if (value && value.length > 0) {
                    if (Array.isArray(value)) {
                        this.#filters = value;
                    } else {
                        this.#filters = [];
                        this.#filters.push(value);
                    }
                }
                this.#column.table.applyFilters(this);
            }
        }


        class HtmlTableColumn {
            #table = null;
            #total = null;
            #sortDirection = null;
            #filters = null;
            #sortIdx = null;
            options = null;     // @@IMPORTANT: the options must not be private as we need to serialize it if the control is rendered on the server side
            constructor(table, options) {
                if (core.utils.isEmpty(table)) { throw new err.ONullArgument('table'); }
                if (core.utils.isEmpty(options)) { throw new err.ONullArgument('options'); }
                if (table.constructor.name != 'HtmlTable') { throw new err.OInvalidArgumentType('table', 'HtmlTable'); }
                this.#table = table;
                this.options = options;
                if (this.options.sortIdx !== undefined) {
                    this.#sortIdx = this.options.sortIdx;
                }
                this.#filters = new HtmlTableColumnFilter(this);
            }

            get id() { return this.options.id; }
            get table() { return this.#table; }
            get options() { return this.options; }
            get unbound() { return this.options.unbound; }

            get sortIdx() {
                return this.#sortIdx;
            } set sortIdx(val) {
                this.#sortIdx = val;
            }

            get noFilter() {
                return this.options.noFilter;
            } set noFilter(val) {
                this.options.noFilter = val;
            }

            get noResize() {
                return this.options.noResize;
            } set noResize(val) {
                this.options.noResize = val;
            }

            get noSort() {
                return this.options.noSort;
            } set noSort(val) {
                this.options.noSort = val;
            }



            get total() {
                return this.#total;
            } set total(val) {
                this.#total = val;
            }

            get type() {
                return this.options.type || 'text';
            } set type(val) {
                this.options.type = val;
            }

            get title() {
                return this.options.title;
            } set title(val) {
                this.options.title = val;
            }

            get addCount() {
                return this.options.addCount || false;
            } set addCount(val) {
                this.options.addCount = val;
            }

            get addTotal() {
                return this.options.addTotal || false;
            } set addTotal(val) {
                this.options.addTotal = val;
            }

            get addAverage() {
                return this.options.addAverage || false;
            } set addAverage(val) {
                this.options.addAverage = val;
            }

            get styles() {
                return this.options.styles;
            } set styles(val) {
                this.options.styles = val;
            }

            get sticky() {
                return this.options.sticky;
            } set sticky(val) {
                this.options.sticky = val;
            }

            get link() {
                return this.options.link;
            } set link(val) {
                this.options.link = val;
            }

            get sortDirection() {
                return this.#sortDirection;
            } set sortDirection(val) {
                this.#sortDirection = val;
            }

            showFilter() {
                this.#filters.open();
            }
            closeFilter() {
                this.#filters.close();
            }
            resetFilter() {
                this.#filters.clear();
            }
            // applyFilter() {
            //     this.#filters.apply(true);
            // }

            setFilter(value) {
                this.#filters.set(value);
            }

            baseStyles(type) {
                var styles = '';
                if (this.type == 'number' || this.type == 'int' || this.type == 'float') {
                    styles += 'text-align: right;';
                } else if (this.type == 'bool') {
                    styles += 'text-align: center;';
                } else if (this.type == 'date') {
                    styles += 'text-align: center;';
                }

                if (this.styles) {
                    for (var s in this.styles) {
                        styles += `${s}: ${this.styles[s]};`;
                    }
                }

                if (this.sticky) {
                    styles += `position: sticky; left: ${this.sticky.left || '0px'}; z-index: ${(this.sticky.zIndex || 999) + (type == 'header' ? 1 : 0)}`
                }

                if (type == 'header' && this.resizedWidth) {
                    styles += `min-width: ${this.resizedWidth}px; max-width: ${this.resizedWidth}px;`
                }

                return styles;
            }

            renderCell(value, data) {
                var formattedValue = value;
                if (value && value.value !== undefined) {
                    formattedValue = value.value;
                }

                if (formattedValue == null) {
                    formattedValue = '<span style="color: silver; font-style: italic;">null</span>'
                } else {
                    if (this.type == 'float') {
                        formattedValue = toFloat(value).formatMoney();
                    } else if (this.type == 'bool' || formattedValue === 'T' || formattedValue === 'F') {
                        if (formattedValue === 'T') {
                            formattedValue = '&#9989;'
                        } else if (formattedValue === 'F') {
                            formattedValue = '';
                        }
                    } else if (this.type == 'date') {
                        formattedValue = new Date(value);
                        formattedValue = `${formattedValue.getDate()}/${formattedValue.getMonth() + 1}/${formattedValue.getFullYear()}`;
                    }

                }

                if (this.options.link) {
                    var url = '';
                    if (this.options.link.url.indexOf('${value}') > 0) {
                        url = this.options.link.url.replace('${value}', value);
                    } else {
                        url = this.options.link.url.replace('${' + this.options.link.valueField + '}', data[this.options.link.valueField]);
                    }
                    formattedValue = `<a class="o-table-link" href="${url}" target="${this.options.link.target || '_blank'}">${formattedValue}</a>`;
                }

                return `<div style="${this.baseStyles('cell')}">${formattedValue}</div>`;
            }

            render() {
                var filterIcon = '';
                if (!this.options.noFilter && !this.options.unbound) {
                    filterIcon = `<span class="o-table-column-filter">${icons.get('filter', 16)}</span>`;
                }
                var sortIcon = '';
                if (this.sortDirection == 'desc') { sortIcon = '&#x25BC; ' }
                if (this.sortDirection == 'asc') { sortIcon = '&#x25B2; ' }

                var filteredClass = '';
                if (this.#filters?.filters) { filteredClass = 'o-table-column-filtered'; }


                var resizeDiv = ''; var colTitleWidth = '';
                if (!this.noResize && !this.table.noResize && !this.noSort) {
                    resizeDiv = '<div class="o-col-title-resize"></div>';
                    colTitleWidth = 'width: calc(100% - 7px);';
                }

                var title = this.options.title;
                if (title.indexOf('<') >= 0) { title = ''; }

                return `
                    <div data-id="${this.options.id || ''}" data-type="${this.options.type || ''}" class="${filteredClass}" style="${this.baseStyles('header')}">
                        <div style="display: inline-block; ${colTitleWidth} overflow: hidden; text-overflow: ellipsis;" title="${title}">
                            ${filterIcon}
                            ${sortIcon}
                            <span style="${this.noSort ? '' : 'cursor: pointer;'}">${this.options.title}</span>
                            
                        </div>
                        ${resizeDiv}
                    </div>`;
            }

            renderFooter() {
                var footerValue = '';
                if (this.options.addCount) {
                    if (this.#table.dataCount == this.#table.rowCount) {
                        footerValue = this.#table.dataCount;
                    } else {
                        footerValue = `${this.#table.rowCount} (of ${this.#table.dataCount})`;
                    }
                    footerValue += ' <span style="font-weight: normal; color: silver; font-style: italic;">(count)</span>'

                } else if (this.options.addTotal) {
                    footerValue = this.#total;
                } else if (this.options.addAverage) {
                    footerValue = this.#total / this.#table.rowCount;
                }

                return `<div data-id="${this.options.id || ''}" data-type="${this.options.type || ''}" style="${this.baseStyles('footer')}">${footerValue}</div>`;
            }


        }

        class HtmlTableRow {
            #table = null;
            #options = null;
            #data = null;
            #dataIdx = null;
            constructor(table, options, data, idx) {
                if (core.utils.isEmpty(table)) { throw new err.ONullArgument('table'); }
                if (core.utils.isEmpty(options)) { throw new err.ONullArgument('options'); }
                if (table.constructor.name != 'HtmlTable') { throw new err.OInvalidArgumentType('table', 'HtmlTable'); }
                this.#table = table;
                this.#options = options;
                this.#data = data;
                this.#dataIdx = idx;
            }

            get table() { return this.#table; }
            get options() { return this.#options; }
            get data() { return this.#data; }

            ui() {
                return this.#table.ui.find(`div.o-row[data-idx="${this.#dataIdx}"]`);
            }

            render() {

                var html = `<div class="o-row" data-idx="${this.#dataIdx}">`;
                core.array.each(this.table.columns, c => {
                    var v = '';
                    if (c.unbound) {
                        if (c.options.initValue) { v = c.options.initValue(this.data); }
                        // if (this.data[c.options.id] === undefined) {
                        //     this.data[c.options.id] = c.options.unboundValue || '';
                        //     if (c.options.initValue) { this.data[c.options.id] = c.options.initValue(this.data); }
                        // }
                    } else {
                        //if (this.data[c.options.id] && this.data[c.options.id].value) { this.data[c.options.id] = this.data[c.options.id].value; }
                        v = this.data[c.options.id];
                    }
                    html += c.renderCell(v, this.data);
                })
                html += '</div>'
                return html;
            }

            toCsv(forCopy) {
                var csv = '';
                var sep = forCopy ? '\t' : ',';

                if (!this.footer) {
                    core.array.each(this.table.columns, c => {
                        if (c.unbound) { return; }
                        if (csv) { csv += sep; }
                        if (this.header) {
                            csv += `"${c.title}"`;
                        } else {
                            csv += `"${this.data[c.id]}"`;
                        }
                    })
                }
                return csv;
            }
        }

        class HtmlTableHeader extends HtmlTableRow {
            constructor(table, options, data) {
                super(table, options || {}, data);
            }

            get header() { return true; }

            render() {
                var html = '<div class="o-row-header">';
                core.array.each(this.table.columns, c => {
                    html += c.render();
                })
                html += '</div>'
                return html;
            }


        }

        class HtmlTableFooter extends HtmlTableRow {
            #hide = true;
            constructor(table, options, data) {
                super(table, options || {}, data);
                this.#hide = !options.showFooter;
            }

            get footer() { return true; }
            get hide() { return this.#hide; }

            render() {
                // @@TODO: we still have no implementation for this
                //         also, we still have no css for o - row - footer
                var html = `<div class="o-row-footer">`;
                core.array.each(this.table.columns, c => {
                    html += c.renderFooter();
                })
                html += '</div>'
                return html;
            }
        }

        class HtmlTable {
            #j = null;
            #options = null;
            #rows = null;
            #rowInit = null;
            #rowCount = 0;
            #data = null;
            #tableId = null;
            #columns = null;
            #columnInit = null;
            #unboundCols = [];
            #lastSelectedRow = null;
            #events = {};
            #colResize = null;
            #filters = [];
            #toolBar = null;
            constructor(options, data) {
                if (core.utils.isEmpty(options)) { throw new err.ONullArgument('options'); }

                if (options.jquery) {
                    // @@NOTE: this means we are running on client side and 'options' is actually the jQuery element of this table control
                    this.#j = options;
                    // get options / data from serialized data element within the control
                    var pageData = ctrlBase.data(options.parent());
                    options = pageData.options;
                    data = pageData.data;
                }

                this.#options = options;
                this.#data = data;
                this.#tableId = options.id || options.tableId || 'o_table';

                this.#columnInit = options.onColumnInit;

                if (options.unboundCols) { this.#unboundCols = options.unboundCols; }

                this.#colResize = new HtmlColResizeEngine(this);

                this.init();
                this.initEvents();  // @@NOTE: this will only work if this.#j is not empty
            }

            get type() { return ctrlBase.CTRL_TYPE.TABLE; }

            get ui() {
                return this.#j;
            } set ui(html) {
                this.#j = html;
                this.initEvents();
            }
            get columns() {
                core.array.sort(this.#columns, 'sortIdx');
                return this.#columns;
            }
            get rows() { return this.#rows; }
            get rowCount() { return this.#rowCount; }
            get dataCount() { return this.#data.length; }
            get data() { return this.#data; }

            get noResize() {
                return this.#options.noResize;
            }

            get unboundCols() {
                return this.#unboundCols;
            } set unboundCols(val) {
                this.#unboundCols = val;
            }

            get onColumnInit() {
                return this.#columnInit;
            } set onColumnInit(val) {
                if (!core.utils.isEmpty(val) && !core.utils.isFunc(val)) { throw new err.OInvalidArgumentType('val', 'function'); }
                this.#columnInit = val;
            }

            get onRowInit() {
                return this.#rowInit;
            } set onRowInit(val) {
                if (!core.utils.isEmpty(val) && !core.utils.isFunc(val)) { throw new err.OInvalidArgumentType('val', 'function'); }
                this.#rowInit = val;
            }

            closeAllFilters() {
                core.array.each(this.#columns, c => {
                    c.closeFilter();
                })
            }
            resetAllFilters(excludeCol) {
                core.array.each(this.#columns, c => {
                    if (c != excludeCol) {
                        c.resetFilter();
                    }
                });

            }
            setFilter(columnName, value) {
                core.array.each(this.#columns, c => {
                    if (c.id == columnName) {
                        c.setFilter(value);
                    }
                });
            }

            applyFilters(colFilter) {
                this.closeAllFilters();

                if (colFilter) {
                    var found = false;
                    for (var fx = 0; fx < this.#filters.length; fx++) {
                        if (this.#filters[fx].column.id == colFilter.column.id) {
                            if (!colFilter.filters) { this.#filters.splice(fx, 1); }
                            found = this.#trigger;
                            break;
                        }
                    }
                    if (!found) { this.#filters.push(colFilter); }
                }

                core.array.each(this.rows, r => {
                    if (r.header || r.footer) { return; }
                    r.filtered = !this.applyFilter(r);
                    r.hide = r.filtered;
                });
                this.render();
            }
            applyFilter(r, filter) {
                var display = true;
                core.array.each(this.#filters, f => {
                    if (filter && filter.column.id == f.column.id) { return false; }
                    display = this.applyTheFilter(r, f);
                    if (display == false) { return false; }
                });
                return display;
            }
            applyTheFilter(r, f) {
                var display = false;
                if (!f.filters) {
                    display = true;
                } else {
                    var rValue = r.data[f.column.id];
                    if (rValue === null || rValue === '') { rValue = '(empty)'; }
                    if (f.filters.indexOf(rValue.toString()) >= 0) {
                        display = true;
                    } else {
                        display = false;
                    }
                }
                return display;
            }


            init(options) {
                if (!options) { options = {}; }


                // @@NOTE: the init routine is called more than once but we only want to initialize the columns once
                if (this.#columns == null || options.resetCols) {
                    this.#columns = [];
                    core.array.each(this.#unboundCols, c => {
                        c.unbound = true;
                        c.id = `unbound_${c.id}`;
                        this.#columns.push(new HtmlTableColumn(this, c));
                    });

                    if (this.#options.columns && !options.resetCols) {
                        // if we have a column collection then we use it
                        core.array.each(this.#options.columns, c => {
                            var col = new HtmlTableColumn(this, c.options || c);
                            if (this.onColumnInit) { if (this.onColumnInit(this, col) === false) { return; } }
                            this.#columns.push(col);
                            if (col.sortIdx == null) { col.sortIdx = this.#columns.length * 10; }
                        })
                    } else if (this.#data && this.#data.length > 0) {
                        // if we do not have a column collection then we use the 1st data row
                        this.#options.columns = [];
                        for (var k in this.#data[0]) {
                            if (k.startsWith('unbound_')) { continue; }
                            var col = new HtmlTableColumn(this, { id: k, title: k.replaceAll('_', ' ') });
                            if (this.onColumnInit) { if (this.onColumnInit(this, col) === false) { continue; } }
                            this.#columns.push(col);
                            if (!col.unbound) { this.#options.columns.push(col.options); }
                            if (col.sortIdx == null) { col.sortIdx = this.#columns.length * 10; }
                        }
                    }
                }

                // @@NOTE: the init routine is called more than once but we only want to initialize the rows once
                if (this.#rows == null || options.resetRows) {
                    this.#rows = [];
                    this.#rows.push(new HtmlTableHeader(this));
                    if (this.#data) {
                        core.array.each(this.#columns, c => { c.total = 0; });
                        core.array.each(this.#data, (d, idx) => {
                            var row = new HtmlTableRow(this, {}, d, idx);
                            if (this.onRowInit) { if (this.onRowInit(this, row) === false) { return; } }
                            this.#rows.push(row);
                            core.array.each(this.#columns, c => {
                                c.total += toFloat(d[c.options.id]);
                            });
                        });
                    }
                    this.#rows.push(new HtmlTableFooter(this, { showFooter: this.#options.showFooter }));
                }
            }

            initEvents() {
                if (!this.#j) { return; }

                this.#colResize.handleResize();

                if (this.#options.fitScreen) {
                    // @@REVIEW: i don't like the -50, also we should handle some actual size if needed
                    this.#j.height(window.innerHeight - this.#j.parent().offset().top - 55);
                } else if (this.#options.fitContainer) {
                    this.#j.height(this.#j.parent().innerHeight());
                }

                if (this.#options.showToolbar) {
                    this.#toolBar = this.#j.parent().find(`#${this.#options.id}_toolBar`);
                    this.#toolBar.find('span').click(e => {
                        var action = jQuery(e.currentTarget).data('action');

                        if (this.onToolbarClick) {
                            if (this.onToolbarClick(action, this) === false) { return; }
                        }

                        if (action == 'copy') {
                            this.export(true);
                            var icon = jQuery(e.currentTarget).html()
                            jQuery(e.currentTarget).html('👍')
                            window.setTimeout(() => { jQuery(e.currentTarget).html(icon) }, 1000)
                        } else if (action == 'export') {
                            this.export();
                        }
                    })
                }


                if (!this.#options.noSort) {
                    this.#j.find('.o-row-header').click(e => {
                        if (this.#colResize.resizing) { return; }
                        if (jQuery(e.target).closest('.o-table-column-filter').length > 0) { return; }
                        this.sort({ id: jQuery(e.target).closest('div[data-id]').data('id') });
                    })
                }
                this.#j.find('.o-table-column-filter').click(e => {
                    if (this.#colResize.resizing) { return; }
                    var col = core.array.find(this.columns, 'id', jQuery(e.currentTarget).closest('div[data-id]').data('id'));
                    col.showFilter();
                })


                this.#j.find('.o-row').click(e => {
                    if (e.target.tagName != 'A') {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    var row = jQuery(e.currentTarget);
                    if (e.ctrlKey && row.hasClass('o-row-selected')) {
                        row.removeClass('o-row-selected');
                        this.#triggerRowSelected();
                        return;
                    }
                    if (!e.ctrlKey && !e.shiftKey) {
                        this.#j.find('.o-row-selected').removeClass('o-row-selected');
                    }

                    if (e.shiftKey && this.#lastSelectedRow) {
                        var r = this.#lastSelectedRow;
                        // @@NOTE: if current clicked row.top > lastSelectedRow.top then we select down, otherwise we select up
                        var method = (row.position().top > r.position().top) ? 'next' : 'prev';
                        while (r[0] != row[0]) {
                            r = r[method]();
                            if (r.length == 0) { break; }
                            r.addClass('o-row-selected');
                        }
                    } else {
                        row.addClass('o-row-selected');
                    }
                    this.#lastSelectedRow = row;

                    this.#triggerRowSelected(row);
                })

                this.#j.find('.o-row').dblclick(e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.#trigger('dblclick', this.getSelectedRows())
                })

                this.#j.scroll(e => { this.closeAllFilters(); })

                if (this.onInitEvents) { this.onInitEvents(this); }

            }


            selectRow(idx, raiseEvent) {
                this.#j.find('.o-row-selected').removeClass('o-row-selected');
                var row = this.#j.find(`.o-row[data-idx="${idx}"`);
                row.addClass('o-row-selected');
                this.#lastSelectedRow = row;
                if (raiseEvent) {
                    this.#triggerRowSelected(row);
                }

                row[0].scrollIntoView();

            }


            getSelectedRows() {
                var selectedRows = this.#j.find('.o-row-selected');
                var selectedRowsData = [];
                selectedRows.each((i, r) => {
                    selectedRowsData.push(this.#data[jQuery(r).data('idx')])
                });
                return {
                    rows: selectedRows,
                    rowsData: selectedRowsData
                }
            }

            sort(options) {
                if (!options) { return; }
                if (!options.id) { return; }
                var col = core.array.find(this.columns, 'id', options.id);
                if (!col) { return; }
                if (col.noSort) { return; }

                // @@REVIEW: is there a better way to do this? maybe we could have a sorted col collection and implement concatenated sorting
                core.array.each(this.columns, c => { if (c.id != col.id) { c.sortDirection = null; } })

                // @@NOTE: we want to cycle ascending / descending / original sorting (null)
                if (col.sortDirection == null) {
                    col.sortDirection = 'asc';
                } else if (col.sortDirection == 'asc') {
                    col.sortDirection = 'desc';
                } else {
                    col.sortDirection = null;
                }

                if (col.sortDirection == null) {
                    // @@TODO: if we have a filter set this would remove it, we should remember the last filter and re-apply it

                    // @@NOTE: if we have col.sortDirection we mean original sorting which means we need to reload the table rows from the data set (which preserve the original sorting)
                    this.init({ resetRows: true });
                    // @@NOTE: if we have filters we must re-apply then now
                    if (this.#filters.length > 0) { this.applyFilters(); }
                } else {
                    // @@NOTE: we want to only sort the this.#rows collection for two reasons:
                    //              a. performance: this way we won't have to reload the data rows every time (only when resetting to original sorting)
                    //              b. we want to preserve the original sorting an cycle back to it
                    var fieldName = col.id || options.id; var dataType = options.type || col.type; var descending = col.sortDirection == 'desc';
                    this.#rows.sort((a, b) => {
                        if (!a.data || !b.data) { return; }
                        var fieldValueA = a.data[fieldName];
                        var fieldValueB = b.data[fieldName];
                        if (dataType) {
                            if (dataType.lower() == 'text') {
                                fieldValueA = (fieldValueA || '').toString().toLowerCase();
                                fieldValueB = (fieldValueB || '').toString().toLowerCase();
                            } else if (dataType.lower() == 'number') {
                                fieldValueA = parseFloat(fieldValueA || '0');
                                fieldValueB = parseFloat(fieldValueB || '0');
                            } else if (dataType.lower() == 'date') {
                                fieldValueA = new Date(fieldValueA);
                                fieldValueB = new Date(fieldValueB);
                            }
                        }
                        if (fieldValueA < fieldValueB) { return (descending) ? 1 : -1; }
                        if (fieldValueA > fieldValueB) { return (descending) ? -1 : 1; }
                        return 0;
                    });
                }

                //
                this.render();
                //if (this.currentFilter) { this.currentFilter.apply(true); }

            }

            filter(options) {
                // @@TODO: filter this.#rows collection
                if (!options) { options = {}; }
                var src = (options.src == null || options.src == undefined || options.src == '') ? null : options.src.toString();
                for (var rx = 0; rx < this.#rows.length; rx++) {
                    var r = this.#rows[rx];
                    if (r.header || r.footer) { continue; }
                    if (src == null) {
                        r.hide = false;
                    } else {
                        var text = '';
                        for (var k in r.data) {
                            var t = (r.data[k] || '').toString();
                            if (options.col && options.col == k) {
                                text = t;
                                break;
                            } else {
                                text += t;
                            }
                        }
                        r.hide = text.lower().indexOf(src.lower()) < 0;
                    }
                }
                //
                this.render();
            }

            render(data, resetCols) {
                // @@NOTE: the render function may be called more than once
                //         for example when filtering or sorting so we do not want to init every time
                //         unless some data is passed here
                if (data !== undefined && data !== null) {
                    // if we get data here then init
                    this.#data = data;
                    this.init({ resetRows: true, resetCols: resetCols });
                }



                // @@REVIEW: the 'render' function is called from both server/client
                //              when called from the client re-rendering the data as well may be time consuming, we could only re-render the table itself
                //              however, if we call render(data) from client then the data changes and should be re-rendered in the data tag.
                //              for now we leave this as is and always re-render the whole lot
                var toolBar = '';
                if (this.#options.showToolbar) {
                    var label = this.#options.label ? `<div><label>${this.#options.label}</label></div>` : '';
                    var toolBarNew = this.#options.readOnly ? '' : `<span title="add new" data-action="add-new">${twcIcons.get('addNew', 16)}</span>`;
                    toolBar = `
                        <div id="${this.#options.id}_toolBar" class="o-table-toolbar">
                            ${toolBarNew}
                            <span title="copy into clipboard..." data-action="copy">
                                ${twcIcons.get('copy', 16)}
                            </span>
                            <span title="export to csv..." data-action="export">
                                ${twcIcons.get('export', 16)}
                            </span>
                        </div>
                    `;
                    toolBar = `<div class="twc-div-table">${label}${toolBar}</div>`;
                }
                var html = `${toolBar}<div class="o-table twc_ctrl" data-type="table" id="${this.#tableId}">`;
                this.#rowCount = 0;

                if (this.#data.length == 0) {
                    html += '<div style="padding: 7px">no table data</div>';
                } else {
                    core.array.each(this.#rows, r => {
                        if (r.hide) { return; }
                        html += r.render();
                        if (r.header || r.footer) { return; }
                        this.#rowCount++;
                    })
                }
                html += '</div>';

                html = ctrlBase.render(html, {
                    client: this.#j != null,
                    type: ctrlBase.CTRL_TYPE.TABLE,
                    data: {
                        options: this.#options,
                        data: this.#data
                    }
                });

                if (!this.#j) { return html; }

                // @@NOTE: this means we are running on the client which means we need to reset the html, also we need to init the events every time
                this.#j.html(html);
                this.initEvents();
            }




            on(eventName, callBack) {
                if (callBack) {
                    // we are registering event 
                    if (!this.#events[eventName]) { this.#events[eventName] = []; }
                    this.#events[eventName].push(callBack);
                } else {
                    return this.#trigger(eventName, null);
                }
            }
            #trigger(eventName, eventArgs) {
                if (this.#events[eventName]) {
                    core.array.each(this.#events[eventName], cb => {
                        try {
                            var e = {
                                target: this,
                                id: this.#options.id,
                                e: eventArgs
                            }
                            cb(e);
                            return e;
                        } catch (error) {
                            //console.log(error);
                        }
                    })
                }
            }
            #triggerRowSelected(row) {
                var selectedRows = this.#j.find('.o-row-selected');
                var selectedRowsData = [];
                selectedRows.each((i, r) => {
                    selectedRowsData.push(this.#data[jQuery(r).data('idx')])
                })

                this.#trigger('rowSelection', {
                    selectedRow: row,
                    selectedRowData: (row) ? this.#data[row.data('idx')] : null,
                    selectedRows: selectedRows,
                    selectedRowsData: selectedRowsData,
                })
            }



            export(forCopy, fileName) {
                var csv = '';
                core.array.each(this.rows, r => {
                    csv += r.toCsv(forCopy);
                    csv += '\n';
                });
                if (forCopy) {
                    navigator.clipboard.writeText(csv);
                } else {
                    this.saveFile(`${fileName || this.#options.label || this.#tableId || 'table'}.csv`, csv);
                }
                return csv;
            }
            saveFile = (fileName, fileContent) => {
                if (!fileName) { fileName = 'query.suiteql'; }
                //if (!fileContent) { fileContent = jQuery('#ossm_sql_query').val(); }
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
                element.setAttribute('download', fileName);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }


        }


        class TableControl {
            #table = null;
            #container = null;
            #overlay = null;
            #onColumnInit = null;
            #options = null;
            constructor(container, onColumnInit, options) {
                this.#container = container;
                this.#onColumnInit = onColumnInit;
                this.#options = options || { id: 'table_data' };
                if (this.#options.fitScreen === undefined && !this.#options.fitContainer) { this.#options.fitScreen = true; }
                if (this.#options.showFooter === undefined) { this.#options.showFooter = true; }

                this.#overlay = jQuery(`
                    <div style="background-color: rgba(0,0,0,0.5); position: absolute; z-index: 10000; display: none;">
                        <br />
                        <div style="width: 100%; text-align: center;">
                            <span class="twc-wait-cursor">
                                ${twcIcons.ICONS.waitWheel}
                            </span>
                        </div>
                        <br />
                    </div>
                `);

                this.#overlay.insertBefore(this.#container);
            }

            get table() { return this.#table; }

            init(data) {
                this.#table = new HtmlTable({
                    id: this.#options.id,
                    fitScreen: this.#options.fitScreen,
                    fitContainer: this.#options.fitContainer,
                    showFooter: this.#options.showFooter,
                    unboundCols: this.#options.unboundCols,
                    onColumnInit: this.#onColumnInit,
                }, data);

                this.#table.onInitEvents = () => {
                    if (this.onInitEvents) {
                        this.onInitEvents(this);
                    }
                }

                var t = jQuery(this.#table.render());
                this.#container.html(t);
                this.#table.ui = t;

            }

            refresh(data, resetCols) {
                if (this.#table == null) {
                    this.init(data);
                    this.#table.on('rowSelection', e => { this.rowSelection(e); })

                } else {
                    this.#table.render(data, resetCols);
                }
                this.#overlay.css('display', 'none');

            }

            async refreshAsync(data, resetCols) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    try {
                        _this.refresh(data, resetCols);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                })
            }

            wait() {
                var offset = this.#container.offset();
                if (this.#container.closest('dialog').length > 0) {
                    offset = this.#container.position();
                }
                this.#overlay.css('left', offset.left + 'px');
                this.#overlay.css('width', this.#container.width() + 'px');
                this.#overlay.height(this.#container.height() - 7);

                this.#overlay.css('display', 'block');
            }

        }

        function render(options, dataSource) {
            var ctrl = new HtmlTable(options, options.dataSource || dataSource);
            return ctrl.render();
        }

        return {
            Table: HtmlTable,
            TableControl: TableControl,

            render: render,
            ui: (element) => {
                return new HtmlTable(element);
            }
        }
    });

