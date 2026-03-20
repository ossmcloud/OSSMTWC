/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, cored, b64, icons, ctrlBase) => {

        Date.prototype.getDayEU = function () {
            var d = this.getDay();
            if (d == 0) { d = 7; }
            return d;
        }

        class CalendarControl {
            #options = null;
            #ui = null;
            #input = null;
            #events = {};
            constructor(options) {
                if (options.jquery) {
                    this.#ui = options;

                    var id = this.#ui.data('id');
                    var o = this.#ui.find(`#${id}_options`).html();
                    o = o ? b64.decode(o) : '{}';
                    this.#options = JSON.parse(o);
                    if (!this.#options.id) { this.#options.id = this.#ui.data('id'); }
                    if (!this.#options.type) { this.#options.type = this.#ui.data('type'); }
                    this.initEvents();

                } else {
                    this.#options = options || {};
                }
            }

            get id() { return this.#options.id; }
            get ui() { return this.#ui; }
            get type() { { return this.#options?.type; } }

            get value() {
                var d = this.#input.attr('data-value') || null;
                if (d) { d = new Date(d); }
                return d;
            } set value(v) {
                this.#input.attr('data-value', v);
                this.#ui.find('.o-calendar-current').removeClass('o-calendar-current');
                this.#ui.find(`div[data-day="${v}"]`).addClass('o-calendar-current');
                this.refresh();
            }

            get isPast() {
                return cored.utils.dropTime(this.value) < cored.utils.dropTime();
            }
            get isToday() {
                return cored.utils.dropTime(this.value) == cored.utils.dropTime();
            }
            get isFuture() {
                return cored.utils.dropTime(this.value) > cored.utils.dropTime();
            }

            get datesContent() {
                return this.#options.datesContent || null;
            } set datesContent(val) {
                this.#options.datesContent = val;
                this.refresh()
            }

            get specialDates() {
                return this.#options.specialDates || null;
            } set specialDates(val) {
                this.#options.specialDates = val;
                this.refresh()
            }

            getDateContent(date) {
                if (!this.#options.datesContent) { return ''; }
                var c = this.#options.datesContent[date.format()];
                if (c === undefined) { return ''; }
                if (Array.isArray(c)) {
                    var html = '';
                    core.array.each(c, content => {
                        //if (html) { html += '<br />'; }
                        html += `${content}`;
                    })
                    return html;
                } else {
                    return c;
                }
            }

            specialDate(date) {
                if (!this.#options.specialDates) { return null; }
                return this.#options.specialDates[date.format()];
            }

            refresh() {
                this.#ui.find(`#${this.#options.id}_container`).html(this.renderCalendar(this.value))
                this.initEvents();
            }

            render(container) {
                var disabled = (this.#options.disabled) ? ' disabled' : '';
                var label = '';
                if (this.#options.label !== undefined) {
                    label = `<label class="inline">${this.#options.label || ''}</label>`;
                }
                var html = `
                    <div class="twc_ctrl" data-type="calendar" data-id="${this.#options.id}">
                        ${label}
                        <div id="${this.#options.id}_container" style="margin-top: 3px;">
                            ${this.renderCalendar(this.#options.value)}
                        </div>
                        <data id="${this.#options.id}_options">
                            ${b64.encode(JSON.stringify(this.#options))}
                        </data>   
                    </div>  
                `

                html = ctrlBase.render(html, {
                    client: this.ui != null,
                    type: 'calendar',
                });

                if (container) {
                    html = jQuery(html);
                    this.#ui = html;
                    this.initEvents();
                }

                return html;
            }


            renderCalendar(date) {
                if (!date) { date = new Date(); }

                var calendarMonth = date.getMonth();
                var calendarMonthYear = parseInt(`${date.getFullYear()}${date.getMonth().pad()}`);

                var monthStart = new Date(date.getFullYear(), calendarMonth, 1);
                var calendarStart = monthStart.getDay() == 1 ? monthStart : cored.utils.getMonday(monthStart);

                var html = `
                    <div id="${this.#options.id}" class="o-calendar-outer" data-value="${date || ''}">
                        <div class="o-calendar-nav">
                            <div data-action="nav-prev-month">${icons.get('arrowLeftCircle', 16,)}</div>
                            <div>${cored.Months[calendarMonth]} ${monthStart.getFullYear()}</div>
                            <div data-action="nav-next-month">${icons.get('arrowRightCircle', 16)}</div>
                        </div>
                        <div class="o-calendar">
                            <div class="o-calendar-header">
                                <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                            </div>
                            <div class="o-calendar-row">
                `;

                var today = cored.utils.dropTime();   // (new Date());
                while (true) {

                    var dayClass = this.#options.dayClass || ''; var dayTitle = '';
                    if (calendarStart.getMonth() != calendarMonth) {
                        dayClass += ' o-calendar-gray';
                        if (calendarStart.getDayEU() >= 6) { dayClass += ' o-calendar-gray-we'; }
                    } else if (calendarStart.getDayEU() >= 6) {
                        dayClass += ' o-calendar-we';
                    }

                    var dayPastClass = '';
                    if (calendarStart < today) {
                        dayPastClass = ' o-calendar-past';
                    }


                    var specialDate = this.specialDate(calendarStart);
                    if (specialDate) {
                        dayClass = 'o-calendar-special';
                        if (specialDate.constructor.name == 'String') {
                            dayTitle = specialDate;
                        } else {
                            dayClass = specialDate.css || 'o-calendar-special';
                            dayTitle = specialDate.title || '';
                        }
                    }

                    var currentDateClass = '';
                    if (calendarStart.getDate() == date.getDate() && calendarStart.getMonth() == date.getMonth()) {
                        currentDateClass = ' o-calendar-current';
                    }

                    if (this.#options.minimal) {
                        html += `<div data-day="${calendarStart}" class="o-calendar-day ${dayClass} ${currentDateClass}${dayPastClass}" title="${dayTitle}">${calendarStart.getDate()}</div>`
                    } else {
                        html += `
                            <div data-day="${calendarStart}" class="o-calendar-day-c" title="${dayTitle}">
                                <div class="${dayClass}${dayPastClass}">${calendarStart.getDate()}</div>
                                <div class="o-calendar-day-content${currentDateClass}">   
                                    ${this.getDateContent(calendarStart)}
                                </div>
                            </div>
                        `
                    }
                    if (calendarStart.getDay() == 0) { html += '</div><div class="o-calendar-row">' }

                    if (parseInt(`${calendarStart.getFullYear()}${calendarStart.getMonth().pad()}`) > calendarMonthYear && calendarStart.getDay() == 0) { break; }

                    calendarStart = calendarStart.addDays(1);
                    // @@NOTE: when hour changes we get same day after adding one day
                    if (calendarStart.getHours() == 23) { calendarStart = calendarStart.addHours(1); }

                    // @@NOTE: if we have a month that finish on a sunday the above 'break' won't fire
                    if (calendarStart.getDate() == 1 && calendarStart.getDay() == 1) { break; }
                }
                html += '</div>';       // last row
                html += '</div>';       // o-calendar
                html += '</div>';       // o-calendar-outer
                return html;

            }



            initEvents() {

                this.#input = this.#ui.find(`#${this.#options.id}`);
                this.#ui.find('div[data-day]').on('click', e => {
                    this.#input.attr('data-value', jQuery(e.currentTarget).data('day'))
                    this.#ui.find('.o-calendar-current').removeClass('o-calendar-current');
                    if (this.#options.minimal) {
                        jQuery(e.currentTarget).addClass('o-calendar-current');
                    } else {
                        jQuery(e.currentTarget).find('.o-calendar-day-content').addClass('o-calendar-current');
                    }
                    this.on('click', e);
                    this.on('change', e);
                })

                this.#ui.find('div[data-action]').click(e => {
                    var action = jQuery(e.currentTarget).data('action');
                    if (action == 'nav-prev-month' || action == 'nav-next-month') {
                        var increment = action == 'nav-prev-month' ? -1 : 1;
                        this.#ui.find(`#${this.#options.id}_container`).html(this.renderCalendar(this.value.addMonths(increment)))
                        this.initEvents();
                        this.on('change', e);
                    } else {
                        console.log(action)
                    }
                })


            }

            on(eventName, callBack) {
                if (callBack && callBack.constructor.name == 'Function') {
                    // we are registering event 
                    if (!this.#events[eventName]) { this.#events[eventName] = []; }
                    this.#events[eventName].push(callBack);
                } else {
                    if (this.#events[eventName]) {
                        core.array.each(this.#events[eventName], cb => {
                            try {
                                cb({
                                    target: this,
                                    id: this.#options.id,
                                    value: this.value,
                                    evt: callBack,
                                })
                            } catch (error) {
                                throw error;
                            }
                        })
                    }
                }
            }


        }

        return {
            CalendarControl: CalendarControl,
            render: (options) => {
                var ctrl = new CalendarControl(options);
                return ctrl.render();
            },
            ui: (element) => {
                return new CalendarControl(element);
            },

        }

    });

