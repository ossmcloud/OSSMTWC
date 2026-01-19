/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js'],
    (core, b64, icons) => {
        const CTRL_TYPE = {
            TABLE: 'table',
            PROP_TABLE: 'propTable',
            DATE: 'date',
            FILE: 'file',
            TEXT: 'text',
            TEXTAREA: 'textarea',
            NUMBER: 'number',
            CHECKBOX: 'checkbox',
            TOGGLE: 'toggle',
            DROPDOWN: 'dropDown',
            SELECT: 'select',
            BUTTON: 'button',
            CHART: 'chart'
        }

        return {
            CTRL_TYPE: CTRL_TYPE,

            render: (html, options) => {
                if (!options) { options = {}; }
                var htmlData = '';
                if (options.data) {
                    htmlData = `
                        <data>
                            ${b64.encode(JSON.stringify(options.data))}
                        </data>
                    `
                }
                if (options.client) {
                    return `
                        ${html}
                        ${htmlData}
                    `
                }

                var styles = '';
                if (options.type == CTRL_TYPE.TABLE) {
                    styles = ` style="display: block; overflow: auto;"`;
                } else if (options.type == CTRL_TYPE.CHART) {
                    styles = ` style="display: block; width: 100%; height: 100%;"`;
                }
                return `
                    <ossm data-type="${options.type || 'control'}"${styles}>
                        ${html}
                        ${htmlData}
                    </ossm>
                `;
            },

            data: (element) => {
                var d = element.find('data');
                if (d.length == 0) { return null; }
                d = d.html().trim();
                if (!d) { return null; }
                return JSON.parse(b64.decode(d));
            }
        }

    });

