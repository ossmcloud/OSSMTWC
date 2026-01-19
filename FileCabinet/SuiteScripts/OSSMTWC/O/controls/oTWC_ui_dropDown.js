/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js'],
    (core, b64, icons) => {

        class DropDown {
            #dataSource = null;
            #options = null;
            #ui = null;
            #dropDown = null;
            #input = null;
            #events = {};
            #blurTimeOut = false;
            constructor(options, dataSource) {
                if (options.jquery) {
                    this.#ui = options;
                    var id = this.#ui.data('id');
                    this.#dataSource = JSON.parse(this.#ui.find(`#${id}_data`).html() || '[]');
                    this.#options = JSON.parse(this.#ui.find(`#${id}_options`).html() || '{}');
                    if (!this.#options.id) { this.#options.id = id; }

                    this.initEvents();

                } else {
                    this.#options = options || {};
                    this.#dataSource = dataSource || options?.dataSource || null;
                }
                if (!this.#dataSource) { this.#dataSource = []; }

            }

            get id() { return this.#options.id; }
            get type() { { return this.#options?.type; } }

            get allowAll() { return this.#options.allowAll !== false; }
            get allowNone() { return this.#options.allowNone; }
            get multiSelect() { return this.#options.multiSelect; }
            get mandatory() { return this.#options.mandatory; }

            // @@TODO: we need to implement the disabled attr on arrow
            get disabled() {
                return this.#input.attr("disabled") !== undefined;
            } set disabled(val) {
                if (val) {
                    this.#input.attr('disabled', 'disabled');
                } else {
                    this.#input.removeAttr('disabled');
                }
            }

            get value() {
                return this.#ui.attr('data-value');
            } set value(val) {
                var v = this.#dataSource.find(vv => { return vv.value == val; })
                if (v) {
                    this.#ui.attr('data-value', v.value);
                    this.#input.val(v.text);
                } else {
                    this.#ui.attr('data-value', '');
                    this.#input.val('');
                }
            }

            get valueObj() {
                var val = this.#ui.attr('data-value');
                return core.array.find(this.#dataSource, 'value', val);
                return {
                    value: this.#ui.attr('data-value'),
                    text: this.#input.val()
                }
            }

            setDataSource(dataSource) {
                this.closeDropDown();
                this.#dataSource = dataSource;
                if (!this.#dataSource) { this.#dataSource = []; }

                this.#ui.find('data').html(JSON.stringify(dataSource));
            }

            render(container) {
                // @@TODO: we need to implement the disabled attr 
                var label = '';
                if (this.#options.label) {
                    var mandatory = (this.#options.mandatory) ? ' *' : '';
                    label = `<label class="inline">${this.#options.label}${mandatory}</label>`;
                }

                var selectedValue = ''; var selectedValueText = '';
                if (this.#options.value !== undefined) {
                    if (this.multiSelect) {
                        selectedValue = this.#options.value;
                        selectedValueText = this.setMultiTextValue(selectedValue);
                    } else {
                        this.#options.value = this.#dataSource.find(ds => { return ds.value == this.#options.value });
                        selectedValue = this.#options.value?.value || '';
                        selectedValueText = this.#options.value?.text || '';
                    }
                }

                var defaultWidth = '250px';
                if (this.#options.style?.width || this.#options.width) { defaultWidth = this.#options.style?.width || this.#options.width; }

                var html = `
                    <div class="oTWC_ctrl" data-id="${this.#options.id}" data-type="dropDown" data-value="${selectedValue}" style="width: ${defaultWidth};">
                        ${label}
                        <div class="oTWC_ctrl_table" style="border: 1px solid var(--grid-color); border-radius: 7px;">
                            <div>
                                <input id="${this.#options.id}" type="text" class="oTWC oTWC-filter" autocomplete="off" placeholder="${this.#options.hint || ''}" value="${selectedValueText}" />
                            </div>
                            <div style="vertical-align: bottom; width: 28px;">
                                <span id="${this.#options.id}_arrow" style="cursor: pointer; display: inline-block; padding-left: 2px; margin-right: -4px;">${icons.ICONS.arrowDown}</span>
                            </div>
                        </div>
                        <div id="${this.#options.id}_dropDown" class="oTWC_ctrl_dropDown">

                        </div>
                        <data id="${this.#options.id}_data">
                            ${JSON.stringify(this.#dataSource)}
                        </data>   
                        <data id="${this.#options.id}_options">
                            ${JSON.stringify(this.#options)}
                        </data>   
                    </div>
                `;

                if (container) {
                    html = jQuery(html);
                    this.#ui = html;
                    this.initEvents();

                }

                return html;
            }

            initEvents() {
                this.#input = this.#ui.find(`#${this.#options.id}`);
                this.#dropDown = this.#ui.find(`#${this.#options.id}_dropDown`);

                this.#ui.find(`#${this.#options.id}_arrow`).click(e => {
                    if (this.disabled) { return; }
                    if (this.#dropDown.css('display') == 'none') {
                        this.showDropDownList().css('display', 'block');
                    } else {
                        this.#dropDown.css('display', 'none')
                    }

                    window.clearTimeout(this.#blurTimeOut);
                });

                this.#dropDown.css('min-width', this.#ui.width() + 'px');
                this.#input.on('input', e => {
                    this.showDropDownList(jQuery(e.currentTarget).val()).css('display', 'block');
                    if (this.multiSelect) { jQuery(e.currentTarget).val(''); }

                })

                this.#dropDown.click(e => {
                    var item = jQuery(e.target);
                    if (this.disabled) { return; }

                    if (this.multiSelect) {
                        if (item.hasClass('oTWC_dropdown_item')) {
                            item = item.find('input');
                            item.prop('checked', item.is(':checked') ? '' : 'checked');
                        }


                        var items = [];
                        this.#dropDown.find('input[type="checkbox"]:checked').each((i, c) => {
                            items.push(jQuery(c).attr('data-value'));
                        })
                        this.setMultiTextValue(items.join(','));
                        
                    } else {

                        this.#ui.attr('data-value', item.attr('data-value'));
                        if (item.attr('data-value')) {
                            this.#input.val(item.text());
                        } else {
                            this.#input.val('');
                        }
                        this.on('change');
                        this.closeDropDown();
                    }

                })

                if (!this.multiSelect) {
                    this.#input.on('blur', e => {
                        this.#blurTimeOut = window.setTimeout(() => {
                            this.closeDropDown()
                        }, 150);
                    })
                }
            }

            showDropDownList(src) {
                var content = '';

                jQuery('.oTWC_ctrl_dropDown').css('display', 'none');

                if (this.multiSelect) {
                    content += `
                        <div class="oTWC_dropdown_search">
                            <input class="oTWC" id="oTWC_dropdown_search" type="text" placeholder="type to search" value="${src || ''}"/>
                        </div>
                    `
                }

                if (!src) {
                    if (this.multiSelect) {
                        content += '<div id="oTWC_drop_down_all">show all</div>'
                    } else {
                        if (this.allowAll) { content += `<div data-value="">${'- all -'}</div>`; }
                        if (this.allowNone) { content += `<div data-value="@@NONE@@">${'- none -'}</div>`; }
                    }
                }


                core.array.each(this.#dataSource, item => {

                    if (this.multiSelect) {

                        var value = this.value?.toString().split(',').filter(i => i);
                        var checked = value?.indexOf(item.value?.toString()) >= 0 ? 'checked' : '';
                        content += `<div class="oTWC_dropdown_item"><input data-value="${item.value}" type="checkbox" ${checked}/>${item.text}</div>`
                    } else {
                        if (src && item.text.toLowerCase().indexOf(src.toLowerCase()) < 0) { return; }
                        content += `<div class="oTWC_dropdown_item" data-value="${item.value}">${item.text}</div>`
                    }
                })
                if (!content) {
                    content = '<div>no item to show</div>';
                }

                if (this.multiSelect) {
                    content += `
                        <div class="oTWC_dropdown_actions">
                            <input id="oTWC_dropdown_checked" type="button" class="oTWC-button"value="checked"/>

                            <input id="oTWC_dropdown_confirm" type="button" class="oTWC-button"  style="float: right; background-color: var(--accent-fore-color) !important" value="confirm"/>
                            <input id="oTWC_dropdown_cancel" type="button" class="oTWC-button"  style="float: right" value="cancel"/>
                            
                        </div>
                    `
                }

                this.#dropDown.html(content);

                if (this.multiSelect) {
                    this.#dropDown.find('#oTWC_dropdown_confirm').click(e => {
                        e.stopPropagation();

                        var items = [];
                        this.#dropDown.find('input[type="checkbox"]:checked').each((i, c) => {
                            items.push(jQuery(c).attr('data-value'));
                        })
                        this.#ui.attr('data-value', items.join(','));
                        this.setMultiTextValue();
                        this.on('change');
                        this.closeDropDown();
                    })
                    this.#dropDown.find('#oTWC_dropdown_cancel').click(e => {
                        e.stopPropagation();

                        this.setMultiTextValue();
                        this.closeDropDown();
                    })
                    this.#dropDown.find('#oTWC_drop_down_all').click(e => {
                        e.stopPropagation();
                        this.#ui.attr('data-value', '');
                        this.setMultiTextValue();
                        this.on('change');
                        this.closeDropDown();
                    });

                    var showCheckedButton = this.#dropDown.find('#oTWC_dropdown_checked');
                    showCheckedButton.click(e => {
                        e.stopPropagation();

                        var showChecked = showCheckedButton.data('checked');
                        if (showChecked == undefined) { showChecked = true; }
                        showCheckedButton.data('checked', !showChecked);
                        if (showChecked) {
                            showCheckedButton.val('show all')
                            this.#dropDown.find('.oTWC_dropdown_item').each((i, item) => {
                                var dropDownItem = jQuery(item);
                                dropDownItem.css('display', (dropDownItem.find('input').is(':checked')) ? 'block' : 'none');
                            });
                        } else {
                            showCheckedButton.val('checked')
                            this.#dropDown.find('.oTWC_dropdown_item').css('display', 'block');
                        }

                    })
                    this.#dropDown.find('#oTWC_dropdown_search').on('input', e => {
                        var src = jQuery(e.currentTarget).val().toLowerCase();
                        this.#dropDown.find('.oTWC_dropdown_item').css('display', 'block');
                        if (src) {
                            this.#dropDown.find('.oTWC_dropdown_item').each((i, item) => {
                                var dropDownItem = jQuery(item);
                                if (dropDownItem.text().toLowerCase().indexOf(src) >= 0) {
                                    dropDownItem.css('display', 'block')
                                } else {
                                    dropDownItem.css('display', 'none')
                                }
                            })
                        }
                    })
                    window.setTimeout(() => {
                        var srcInput = this.#dropDown.find('#oTWC_dropdown_search');
                        var strLength = srcInput.val().length * 2;
                        srcInput.focus();
                        srcInput[0].setSelectionRange(strLength, strLength);



                    }, 250)

                } else {
                    this.#input.focus();
                }



                return this.#dropDown;
            }
            closeDropDown() {
                this.#dropDown.css('display', 'none');
            }

            setMultiTextValue(selectedValue) {
                if (this.multiSelect) {
                    var selectedValueText = '';
                    var items = (selectedValue || this.#ui?.attr('data-value') || '').split(',').filter(i => i);
                    if (items.length > 0) {
                        if (items.length == 1) {
                            selectedValueText = this.#dataSource.find(ds => { return ds.value == items[0] })?.text || '';
                        } else {
                            selectedValueText = `${items.length} item(s) selected`;
                        }
                    }
                    if (this.#input) { this.#input.val(selectedValueText); }
                    return selectedValueText;
                }
            }


            on(eventName, callBack) {
                if (callBack) {
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
                                    value: this.#ui.attr('data-value')
                                })
                            } catch (error) {
                                console.log(error);
                            }
                        })
                    }
                }
            }

        }

        return {
            DropDown: DropDown,
            render: (options, dataSource) => {
                var ctrl = new DropDown(options, dataSource);
                return ctrl.render();
            },
            ui: (element) => {
                return new DropDown(element);
            }
        }
    });

