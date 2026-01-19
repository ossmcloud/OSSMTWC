/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js', './oTWC_ui_dropDown.js', './oTWC_ui_input.js', './oTWC_ui_table.js', './oTWC_ui_propTable.js', './oTWC_ui_button.js', './oTWC_ui_toggle.js'],
    (core, b64, icons, ctrlBase, uiDropDown, uiInput, uiTable, uiPropTable, uiButton, uiToggle) => {

        class UI {
            #container = null;
            #options = null;
            #controls = [];
            #events = {};
            constructor(options, container) {
                this.#container = container || jQuery('body');
                this.#options = options;
            }

            get ui() { return this.#container; }
            get controls() { return this.#controls; }

            setAllDisabled() {
                core.array.each(this.#controls, c => {
                    c.disabled = true;
                })
            }

            getValues(asObj) {
                var errors = '';
                var obj = {};
                core.array.each(this.#controls, c => {
                    if (asObj && c.valueObj) {
                        obj[c.id] = c.valueObj;
                    } else {
                        obj[c.id] = c.value;
                    }

                    if (!obj[c.id] && c.mandatory) {
                        errors += `field: <b>${c.label || c.id}</b> cannot be empty<br />`;
                    }

                });
                if (errors) { throw new Error(errors);                }
                return obj;
            }

            getControl(id) {
                var obj = null;
                core.array.each(this.#controls, c => {
                    if (c.id == id) {
                        obj = c;
                        return false;
                    }
                });
                return obj;
            }

            // addControl(options) {

            // }

            init() {
                this.#container.find('.oTWC_ctrl').each((idx, ele) => {
                    this.initCtrl(jQuery(ele));
                })
            }

            initCtrl(ctrl) {
                if (ctrl.data('inited') == 'T') { return; }
                var jCtrl = ctrl;
                var ctrlType = ctrl.data('type');
                if (ctrlType == ctrlBase.CTRL_TYPE.DROPDOWN) {
                    ctrl = uiDropDown.ui(ctrl);

                    // } else if (ctrlType == ctrlBase.CTRL_TYPE.DATE || ctrlType == ctrlBase.CTRL_TYPE.FILE || ctrlType == ctrlBase.CTRL_TYPE.TEXT) {
                    //     ctrl = uiInput.ui(ctrl);

                } else if (ctrlType == ctrlBase.CTRL_TYPE.BUTTON) {
                    ctrl = uiButton.ui(ctrl);
                    ctrl.on('click', e => { this.#onInt(ctrl, e, 'click'); })
                } else if (ctrlType == ctrlBase.CTRL_TYPE.TOGGLE) {
                    ctrl = uiToggle.ui(ctrl);
                } else {
                    ctrl = uiInput.ui(ctrl);
                }

                this.#controls.push(ctrl);
                ctrl.on('change', e => {
                    this.#onInt(ctrl, e, 'change');
                })
                ctrl.on('input', e => {
                    this.#onInt(ctrl, e, 'input');
                })

                jCtrl.data('inited', 'T');
            }

            on(eventName, callBack) {
                // we are registering event 
                if (!this.#events[eventName]) { this.#events[eventName] = []; }
                this.#events[eventName].push(callBack);
            }
            #onInt(ctrl, evt, eventName) {
                if (this.#events[eventName]) {
                    core.array.each(this.#events[eventName], cb => {
                        try {
                            cb({
                                target: ctrl,
                                id: ctrl.id,
                                value: ctrl.value,
                                evt: evt
                            })
                        } catch (error) {
                            console.log(error);
                            throw error;
                        }
                    })
                }
            }

        }

        function render(options, dataSource) {
            // if (options.type == ctrlBase.CTRL_TYPE.TEXT || options.type == ctrlBase.CTRL_TYPE.DATE || options.type == ctrlBase.CTRL_TYPE.FILE) {
            //     return uiInput.render(options);
            // } else
            if (options.type == ctrlBase.CTRL_TYPE.DROPDOWN) {
                return `
                        <ossm data-type="${options.type}">
                            ${uiDropDown.render(options, dataSource)}
                        </ossm>
                    `;
                return uiDropDown.render(options, dataSource);
            } else if (options.type == ctrlBase.CTRL_TYPE.TABLE) {
                return uiTable.render(options, dataSource);
            } else if (options.type == ctrlBase.CTRL_TYPE.PROP_TABLE) {
                return uiPropTable.render(options, dataSource);
            } else if (options.type == ctrlBase.CTRL_TYPE.BUTTON) {
                return uiButton.render(options);
            } else if (options.type == ctrlBase.CTRL_TYPE.TOGGLE) {
                return uiToggle.render(options);
            } else {
                return uiInput.render(options);
            }
        }

        function renderCollection(controlGroup) {
            var id = controlGroup.id ? ` id="${controlGroup.id}"` : '';
            var content = jQuery(`<div class="${controlGroup.title == undefined ? '' : 'oTWC-control-group'}" ${id}></div>`);
            if (controlGroup.title) {
                content.append(`<div class="oTWC-control-group-title">${controlGroup.title}</div>`);
            }
            core.array.each(controlGroup.controls, ctrl => {
                if (ctrl.controls) {
                    content.append(renderCollection(ctrl));
                } else {
                    content.append(render(ctrl));
                }
            })


            return content;
        }


        return {
            CTRL_TYPE: ctrlBase.CTRL_TYPE,

            init: (options, container) => {
                if (!container) { container = jQuery('<div></div>'); }
                if (options.controls) { container.html(renderCollection(options)); }
                var ui = new UI(options, container);
                ui.init();
                return ui;
            },



            render: render

        }
    })