/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, icons, ctrlBase) => {
        class ButtonControl {
            #options = null;
            #ui = null;
            #input = null;
            #events = {};
            constructor(options) {
                if (options.jquery) {
                    this.#ui = options;
                    this.#options = {
                        id: this.#ui.data('id'),
                        type: this.#ui.data('type')
                    }
                    this.initEvents();

                } else {
                    this.#options = options || {};
                }
            }

            get id() { return this.#options.id; }
            get ui() { return this.#ui; }
            get input() { { return this.#input; } }
            get type() { { return this.#options?.type; } }
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
                return this.#input.val();
            } set value(v) {
                this.#input.val(v);
            }

            render(container) {
                var disabled = (this.#options.disabled) ? ' disabled' : '';
                var label = '';
                if (this.#options.label !== undefined) {
                    label = `<label class="inline">${this.#options.label || ''}</label>`;
                }
                var html = `
                    <div class="oTWC_ctrl" data-type="button" data-id="${this.#options.id}">
                        ${label}
                        <div class="oTWC_ctrl_table" style="">
                            <input type="button" class="oTWC-button" id="${this.#options.id}" value="${this.#options.value}" ${disabled}/>
                        </div>
                    </div>
                `

                html = ctrlBase.render(html, {
                    client: this.ui != null,
                    type: 'button',
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
                this.#input.on('click', e => {
                    this.on('click', e);
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
            ButtonControl: ButtonControl,
            render: (options) => {
                var ctrl = new ButtonControl(options);
                return ctrl.render();
            },
            ui: (element) => {
                return new ButtonControl(element);
            },

        }

    });

