/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */

// @@TODO: @@REVIEW: do I want this on framework ???
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js', './oTWC_ui_ctrl.js'],
    (core, b64, twcIcons, ctrlBase, ui) => {

        function renderCollection(controlGroup, readOnly) {
            var id = controlGroup.id ? ` id="${controlGroup.id}"` : '';
            var collapsed = controlGroup.collapsed ? ' style="display: none"' : '';
            var content = `
                <div class="twc-control-panel" ${id}>
                    <div class="twc-control-panel-title twc-div-table">
                        <div style="width: 24px">
                            <span class="twc-control-panel-expand">${twcIcons.get('arrowDown', 20)}</span>
                        </div>
                        <div>
                            ${controlGroup.title || ''}
                        </div>
                    </div>
                    <div class="twc-control-panel-fields" ${collapsed}>
            `;

            core.array.each(controlGroup.controls, ctrl => {
                if (ctrl.controls) {
                    content += renderCollection(ctrl, readOnly);
                } else {
                    if (readOnly != undefined && ctrl.readOnly == undefined) { ctrl.readOnly = readOnly; }
                    content += ui.render(ctrl);
                    if (ctrl.lineBreak) { content += '<br />'; }
                }
            })

            content += '</div>';    // twc-control-panel-fields
            content += '</div>';    // twc-control-panel


            return content;
        }


        return {

            render: function (fieldGroup, readOnly) {
                var content = '';
                if (Array.isArray(fieldGroup)) {
                    core.array.each(fieldGroup, fg => {
                        content += renderCollection(fg, readOnly);
                    })
                } else {
                    content = renderCollection(fieldGroup, readOnly);
                }
                return content;
            },

            ui: function (fieldGroup, readOnly) {
                var html = jQuery(this.render(fieldGroup, readOnly));
                return ui.init({}, html);
            }

        }


    })