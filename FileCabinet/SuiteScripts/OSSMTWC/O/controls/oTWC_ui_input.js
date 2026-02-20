/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, icons, ctrlBase) => {

        class InputControl {
            #options = null;
            #ui = null;
            #input = null;
            #events = {};
            #inputDelayHandle = null;
            constructor(options) {
                if (options.jquery) {
                    this.#ui = options;

                    var id = this.#ui.data('id');
                    this.#options = JSON.parse(this.#ui.find(`#${id}_options`).html() || '{}');
                    if (!this.#options.id) { this.#options.id = id; }
                    if (!this.#options.type) { this.#options.id = this.#ui.data('type'); }

                    this.initEvents();

                } else {
                    this.#options = options || {};
                }
            }

            get id() { return this.#options.id; }
            get type() { { return this.#options?.type; } }
            get label() { { return this.#options?.label; } }
            get input() { return this.#input; }
            get inputDelay() { return this.#options.inputDelay; }
            get mandatory() { return this.#options.mandatory; }

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
                if (this.#options.type == ctrlBase.CTRL_TYPE.CHECKBOX) {
                    return this.#input.is(':checked');
                }
                return this.#input.val();
            } set value(v) {
                if (this.#options.type == ctrlBase.CTRL_TYPE.CHECKBOX) {
                    this.#input.prop('checked', v ? 'checked' : '');
                } else {
                    this.#input.val(v);
                }
                this.#ui.attr('data-value', v);

            }

            setDataSource(dataSource) {
                if (this.#options.type != ctrlBase.CTRL_TYPE.SELECT) { return; }
                this.#options.dataSource = dataSource;
                
                this.#ui.find('data').html(JSON.stringify(this.#options));

                var htmlInput = '';
                if (!this.#options.noEmpty) {
                    htmlInput += `<option value="">${this.#options.hint || ''}</option>`;
                }
                core.array.each(this.#options.dataSource || [], item => {
                    htmlInput += `<option value="${item.value}" ${this.value == item.value ? 'selected' : ''}>${item.text}</value>`;
                })
                this.#input.html(htmlInput);

            }

            render(container) {
                var label = '';
                if (this.#options.label) {
                    var mandatory = (this.#options.mandatory) ? ' *' : '';
                    label = `<label class="inline">${this.#options.label}${mandatory}</label>`;
                }

                var arrowDown = ''; var defaultWidth = '150px'; var inputWidth = '100%';
                //var inputWidth = parseInt((this.#options.style?.width || defaultWidth).replace('px', '')) - 2;

                if (this.#options.style?.width || this.#options.width) {
                    defaultWidth = this.#options.style?.width || this.#options.width;
                }

                if (this.#options.type == ctrlBase.CTRL_TYPE.DATE) {
                    inputWidth = this.#options.style?.width || defaultWidth;
                    if (inputWidth.indexOf('%') < 0) { inputWidth = (parseInt(inputWidth.replace('px', '')) - 32) + 'px'; }
                    arrowDown = `
                        <div style="vertical-align: bottom; width: 28px; min-width: 28px">
                            <span id="${this.#options.id}_arrow" style="cursor: pointer; display: inline-block; padding-left: 2px; margin-right: -4px;">${icons.ICONS.arrowDown}</span>
                        </div>
                    `;
                }



                var accept = this.#options.accept ? ` accept="${this.#options.accept}"` : '';
                var disabled = this.#options.disabled ? 'disabled' : '';
                var readOnly = this.#options.readOnly ? 'readonly' : '';
                var checked = ''; var min = ''; var max = ''; var rows = '';
                if (this.#options.type == ctrlBase.CTRL_TYPE.CHECKBOX) {
                    checked = this.#options.value ? 'checked' : '';
                } else if (this.#options.type == ctrlBase.CTRL_TYPE.NUMERIC) {
                    min = this.#options.min ? ` min="${this.#options.min}` : '';
                    max = this.#options.min ? ` min="${this.#options.max}` : '';
                } else if (this.#options.type == ctrlBase.CTRL_TYPE.TEXTAREA) {
                    rows = this.#options.rows ? ` rows="${this.#options.rows}"` : '';
                }

                var htmlInput = '';
                if (this.#options.type == ctrlBase.CTRL_TYPE.TEXTAREA) {
                    htmlInput = `<textarea id="${this.#options.id}" type="${this.#options.type}" class="twc" style="width: ${inputWidth}" autocomplete="off" placeholder="${this.#options.hint || ''}" ${accept} ${disabled} ${readOnly} ${checked} ${rows}>${this.#options.value || ''}</textarea>`;
                } else if (this.#options.type == ctrlBase.CTRL_TYPE.SELECT) {
                    htmlInput = `<select id="${this.#options.id}" class="twc" style="width: ${inputWidth}" autocomplete="off" placeholder="${this.#options.hint || ''}" value="${this.#options.value || ''}" ${accept} ${disabled} ${readOnly} ${checked}/>`;
                    if (!this.#options.noEmpty) {
                        htmlInput += `<option value="">${this.#options.hint || ''}</option>`;
                    }
                    core.array.each(this.#options.dataSource || [], item => {
                        htmlInput += `<option value="${item.value}" ${this.#options.value == item.value ? 'selected' : ''}>${item.text}</value>`;
                    })
                    htmlInput += '</select>';
                } else {
                    var v = (this.#options.value == undefined || this.#options.value == null) ? '' : this.#options.value;
                    htmlInput = `<input id="${this.#options.id}" type="${this.#options.type}" class="twc" style="width: ${inputWidth}" autocomplete="off" placeholder="${this.#options.hint || ''}" value="${v}" ${accept} ${disabled} ${readOnly} ${checked}/>`;
                }


                var html = `
                    <div class="twc_ctrl" data-id="${this.#options.id}" data-type="${this.#options.type}" data-type="${this.#options.type}" data-value="${this.#options.value?.value || ''}" style="width: ${defaultWidth};">
                        ${label}
                        <div class="twc_ctrl_table" style="border: 1px solid var(--grid-color); border-radius: 7px;">
                            <div>
                                ${htmlInput}
                            </div>
                            ${arrowDown}
                        </div>
                        <data id="${this.#options.id}_options">
                            ${JSON.stringify(this.#options)}
                        </data>   
                    </div>
                `;

                html = ctrlBase.render(html, {
                    client: this.ui != null,
                    type: this.#options.type,
                });

                if (container) {
                    html = jQuery(html);
                    this.#ui = html;
                    this.initEvents();

                }

                return html;
            }

            initEvents() {
                this.#input = this.#ui.find(`#${this.#options.id}`);

                this.#ui.find(`#${this.#options.id}_arrow`).click(e => {
                    if (this.#options.type == ctrlBase.CTRL_TYPE.DATE) {
                        if (this.disabled) { return; }
                        this.#input[0].showPicker();
                    }
                });

                this.#input.on('input', e => {
                    if (this.inputDelay) {
                        window.clearTimeout(this.#inputDelayHandle);
                        this.#inputDelayHandle = window.setTimeout(() => {
                            this.on('input', e);
                        }, this.inputDelay);
                    } else {
                        this.on('input', e);
                    }
                })
                this.#input.on('change', e => {
                    this.on('change', e);
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
                                    value: this.#ui.data('value') || this.#input.val(),
                                    evt: callBack,
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
            InputControl: InputControl,
            render: (options) => {
                var ctrl = new InputControl(options);
                return ctrl.render();
            },
            ui: (element) => {
                return new InputControl(element);
            },

        }

    });

