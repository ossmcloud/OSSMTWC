/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, icons, ctrlBase) => {

        class HtmlPropTable {
            #j = null;
            #options = null;
            #data = null;
            #tableId = null;
            constructor(options, data) {
                if (options.jquery) {
                    // @@NOTE: this means we are running on client side and 'options' is actually the jQuery element of this table control
                    this.#j = options;
                    // get options / data from serialized data element within the control
                    var pageData = ctrlBase.data(options);
                    options = pageData.options;
                    data = pageData.data;
                }

                this.#options = options || {};
                this.#options.type = ctrlBase.CTRL_TYPE.PROP_TABLE;
                this.#data = data;
                this.#tableId = options.id || options.tableId || 'o_prop_table';

            }

            render() {
                var html = '<div>';
                if (this.#options.title) {
                    html += `<h3 style="margin-top: 0px;">${this.#options.title}</h3>`;
                }

                html += `
                    <table class="twc-prop-table" id="${this.#tableId}">
                        <tbody>
                            <tr>
                `;

                var colCount = (this.#options.colCount || 1);
                for (var cx = 0; cx < colCount; cx++) {
                    html += `<td style="width: ${100 / colCount}%"><div class="twc-div-table-r twc-div-table-lbl-val">`;

                    for (var dx = 0; dx < this.#data[cx].length; dx++){
                        var colData = this.#data[cx][dx];
                        html += `
                            <div>
                                <div>
                                    ${colData.label}:
                                </div>
                                <div>
                                    ${colData.value || ''}
                                </div>
                            </div>
                        `;
                    }

                    html += '</div></td>';
                }

                html += `
                            </tr>
                        </tbody>
                    </table>
                `;
               
                return html;
            }
        }


        return {
            PropTable: HtmlPropTable,

            render: (options, dataSource) => {
                var ctrl = new HtmlPropTable(options, dataSource);
                return ctrl.render();
            },
            ui: (element) => {
                return new HtmlPropTable(element);
            }
        }
    });

