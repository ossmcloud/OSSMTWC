/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, icons, ctrlBase) => {

        class ToggleControl {
            #options = null;
            #ui = null;
            #toggle = null;
            #toggleOuter = null;
            #events = {};

            constructor(options) {
                if (options.jquery) {
                    this.#ui = options;

                    var id = this.#ui.data('id');
                    this.#options = JSON.parse(this.#ui.find(`#${id}_options`).html() || '{}');
                    if (!this.#options.id) { this.#options.id = id; }
                    if (!this.#options.type) { this.#options.id = this.#ui.data('type'); }
                    this.#options.value = this.#ui.attr('data-value') == 'true';

                    this.initEvents();

                } else {
                    this.#options = options || {};
                }
            }

            get id() { return this.#options.id; }
            get type() { { return this.#options?.type; } }
            get mandatory() { return this.#options.mandatory; }

            get disabled() {
                return this.#options.disabled;
            } set disabled(val) {
                this.#options.disabled = val;
            }

            get readOnly() {
                return this.#options.readOnly;
            } set disabled(val) {
                this.#options.readOnly = val;
            }

            get value() {
                return this.#options.value;
            } set value(v) {
                this.#options.value = v;
                this.toggle(this.#options.value);
            }


            render(container) {
                var label = '';
                if (this.#options.label) {
                    //var mandatory = (this.#options.mandatory) ? ' *' : '';
                    label = `<label class="inline">${this.#options.label}</label>`;
                }

                var defaultWidth = '60px';
                if (this.#options.style?.width || this.#options.width) { defaultWidth = this.#options.style?.width || this.#options.width; }

                var disabled = this.#options.disabled ? 'disabled' : '';
                var readOnly = this.#options.readOnly ? 'readonly' : '';

                var marginLeft = parseInt(defaultWidth.replace('px', '')) - 30;
                var checked = this.#options.value ? ` oTWC_toggle_inner_selected" style="margin-left: ${marginLeft}px;"` : '"';
                var checkedOuter = this.#options.value ? ' oTWC_toggle_outer_selected' : '';

                var html = `
                    <div class="oTWC_ctrl" data-id="${this.#options.id}" data-type="${this.#options.type}" data-type="${this.#options.type}" data-value="${this.#options.value || 'false'}" style="width: ${defaultWidth}; text-align: center;">
                        ${label}
                        <div class="oTWC_ctrl_table" style="border: 1px solid var(--grid-color); border-radius: 7px; margin-top: 3px">
                            <div class="oTWC_toggle_outer${checkedOuter}">
                                <div class="oTWC_toggle_inner${checked}>
                                </div>
                            </div>
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

                this.#toggle = this.#ui.find('.oTWC_toggle_inner');
                this.#toggleOuter = this.#ui.find('.oTWC_toggle_outer');
                this.#toggleOuter.click(e => {
                    if (this.#options.disabled || this.#options.readOnly) { return; }
                    this.#options.value = !this.#options.value;
                    this.toggle(this.#options.value);
                    this.#ui.attr('data-value', this.#options.value?.toString());
                    this.on('change', e);

                })

            }

            toggle(value) {
                if (value) {
                    this.#toggle.animate({ marginLeft: (this.#toggleOuter.width() - this.#toggle.outerWidth() - 3) + 'px' }, 150);
                    this.#toggle.addClass('oTWC_toggle_inner_selected')
                    this.#toggleOuter.addClass('oTWC_toggle_outer_selected')
                } else {
                    this.#toggle.animate({ marginLeft: '3px' }, 150);
                    this.#toggle.removeClass('oTWC_toggle_inner_selected')
                    this.#toggleOuter.removeClass('oTWC_toggle_outer_selected')
                }
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
                                    value: this.#ui.data('value') || this.#options.value,
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
            ToggleControl: ToggleControl,
            render: (options) => {
                var ctrl = new ToggleControl(options);
                return ctrl.render();
            },
            ui: (element) => {
                return new ToggleControl(element);
            },

        }

    });

