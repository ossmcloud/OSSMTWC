/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, icons, ctrlBase) => {
        class PanelControl {
            #options = null;
            #ui = null;
            constructor(options) {
                if (options.jquery) {
                    this.#ui = options;
                    var id = this.#ui.data('id');
                    var o = this.#ui.find(`#${id}_options`).html();
                    o = o ? b64.decode(o) : '{}';
                    this.#options = JSON.parse(o);
                    if (!this.#options.id) { this.#options.id = this.#ui.data('id'); }
                    if (!this.#options.type) { this.#options.type = this.#ui.data('type'); }

                } else {
                    this.#options = options || {};
                }
            }

            get id() { return this.#options.id; }
            get ui() { return this.#ui; }
            get type() { { return this.#options?.type; } }

            render(container) {
                
                var styles = '';
                if (this.#options.styles) {
                    for (var s in this.#options.styles) {
                        styles += `${s}: ${this.#options.styles[s]}; `;
                    }
                }
                var contentStyles = '';
                if (this.#options.contentStyles) {
                    for (var s in this.#options.contentStyles) {
                        contentStyles += `${s}: ${this.#options.contentStyles[s]}; `;
                    }
                }

                var title = '';
                if (this.#options.title !== undefined) {
                    title = `<div class="twc_ctrl_panel_title" >${this.#options.title || ''}</div>`;
                }

                var content = ''; var noContentStyle = `style="${contentStyles}; padding: 3px 0px 0px 0px; border-bottom: 1px solid var(--grid-color);"`;
                if (this.#options.content !== undefined) {
                    noContentStyle = `style="${styles}"`;
                    
                    content = `
                        <div class="twc_ctrl_panel" style="${contentStyles}">
                            ${this.#options.content || ''}
                        </div>
                    `;
                }

              
                var html = `
                    <div class="twc_ctrl twc_ctrl_panel_outer" id="${this.#options.id}" ${noContentStyle} data-type="panel" data-id="${this.#options.id}">
                        ${title}
                        ${content}
                        <data id="${this.#options.id}_options">
                            ${b64.encode(JSON.stringify(this.#options))}
                        </data>   
                    </div>
                `

                html = ctrlBase.render(html, {
                    client: this.ui != null,
                    type: 'panel',
                    styles: this.#options.styles
                });

                if (container) {
                    html = jQuery(html);
                    this.#ui = html;
                }

                return html;
            }

            on(eventName, callBack) {

            }

        }

        return {
            PanelControl: PanelControl,
            render: (options) => {
                var ctrl = new PanelControl(options);
                return ctrl.render();
            },
            ui: (element) => {
                return new PanelControl(element);
            },

        }

    });

