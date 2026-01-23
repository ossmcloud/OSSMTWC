/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.https.j.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js'],
    (core, https, dialog) => {

   
        class OUserPref {
            #userPref = null;
            #data = null;
            #scriptId = null;
            constructor(data, suiteletScriptId) {
                this.#userPref = data?.userPref;
                this.#data = data;
                this.#scriptId = suiteletScriptId;
            }

            open() {
                dialog.open({
                    title: 'user preferences',
                    content: this.render(),
                    resizable: false,
                    size: {
                        width: '200px',
                        height: '300px'
                    },
                    ok: (dlg => {
                        this.#userPref.theme = dlg.dialog.find('#user-theme').find(":selected").val();
                        this.#userPref.fontSize = dlg.dialog.find('#user-font-size').find(":selected").val();
                        this.#userPref.gridBorder = dlg.dialog.find('#user-grid-border').find(":selected").val();
                        console.log(this.#userPref)

                        var url = core.url.script(this.#scriptId, { userPref: 'T' });
                        https.promise.post({ url: url, body: this.#userPref }).then(r => {
                            dlg.dialog.remove();
                        });

                        dlg.dialog.find('#o-dialog_content').html(`
                            <span class="twc-wait-cursor">
                                ${this.#data.icons.waitWheel}
                            </span>
                        `)

                        return false;
                    })
                });

                var container = jQuery('.o-dialog');
                container.find('#user-theme').change(e => {
                    setTheme(jQuery('#user-theme').find(":selected").val());
                })
                container.find('#user-font-size').change(e => {
                    setFontSize(jQuery('#user-font-size').find(":selected").val());
                })
                container.find('#user-grid-border').change(e => {
                    setGridBorder(jQuery('#user-grid-border').find(":selected").val());
                })
            }

            render() {
                var themeOptions = '';
                core.array.each(this.#data.themes, t => {
                    themeOptions += `<option value="${t}" ${(t == (this.#userPref.theme || 'default')) ? 'selected' : ''}>${t}</option>`;
                });


                var fontSizes = `
                    <option value="10px" ${this.#userPref.fontSize == '10px' ? 'selected' : ''}>small</option>
                    <option value="14px" ${(!this.#userPref.fontSize || this.#userPref.fontSize == '14px') ? 'selected' : ''}>normal</option>
                    <option value="18px" ${this.#userPref.fontSize == '18px' ? 'selected' : ''}>medium</option>
                    <option value="22px" ${this.#userPref.fontSize == '22px' ? 'selected' : ''}>large</option>
                `

                var gridBorders = `
                    <option value="0px" ${this.#userPref.gridBorder == '0px' ? 'selected' : ''}>none</option>
                    <option value="1px" ${this.#userPref.gridBorder == '1px' ? 'selected' : ''}>normal</option>
                    <option value="3px" ${this.#userPref.gridBorder == '3px' ? 'selected' : ''}>thick</option>
                    <option value="5px" ${this.#userPref.gridBorder == '5px' ? 'selected' : ''}>thicker</option>
                `

                return `
                    <div id="twc-user-pref">
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <div style="padding: 7px 14px; display: inline-block;">
                                            <label>theme</label>
                                            <select class="twc" id="user-theme">
                                                ${themeOptions}
                                            </select>
                                            <br />
                                            <label>font size</label>
                                            <select class="twc" id="user-font-size">
                                                ${fontSizes}
                                            </select>
                                            <br />
                                            <label>grid borders</label>
                                            <select class="twc" id="user-grid-border">
                                                ${gridBorders}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`;
            }

        }
        return {

            get: (data, suiteletScriptId) => {
                return new OUserPref(data, suiteletScriptId);
            }

        }
    });
