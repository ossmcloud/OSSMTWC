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
            DATETIME: 'datetime-local',
            FILE: 'file',
            TEXT: 'text',
            TEXTAREA: 'textarea',
            NUMBER: 'number',
            CHECKBOX: 'checkbox',
            TOGGLE: 'toggle',
            DROPDOWN: 'dropDown',
            SELECT: 'select',
            BUTTON: 'button',
            CHART: 'chart',
            CALENDAR: 'calendar',
            PANEL: 'panel'
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
                    styles = `display: block; overflow: auto; `;
                    
                } else if (options.type == CTRL_TYPE.CHART) {
                    styles = `display: block; width: 100%; height: 100%;`;
                }

                if (options.hide) { styles += 'display: none;' }

                var opStyles = options.data?.options?.styles || options.styles;
                if (opStyles) {
                    for (var s in opStyles) {
                        styles += `${s}: ${opStyles[s]}; `;
                    }
                }
                
                return `
                    <ossm data-type="${options.type || 'control'}" style="${styles}">
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

