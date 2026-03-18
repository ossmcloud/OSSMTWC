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
            var hidden = controlGroup.hide ? ' style="display: none"' : '';
            var title = '';
            if (controlGroup.title !== undefined) {
                title = `
                    <div class="twc-control-panel-title twc-div-table">
                        <div style="width: 24px">
                            <span class="twc-control-panel-expand">${twcIcons.get('arrowDown', 20)}</span>
                        </div>
                        <div>
                            ${controlGroup.title || ''}
                        </div>
                    </div>
                `
            }

            var content = `
                <div class="twc-control-panel" ${id} ${hidden}>
                    ${title}
                    <div class="twc-control-panel-fields ${title ? 'twc-control-panel-fields-border' : ''}" ${collapsed}>
            `;

            if (controlGroup.renderAsTable) {
                content += '<div class="twc-control-panel-fields-table">';
            }
            core.array.each(controlGroup.controls, ctrl => {
                if (controlGroup.renderAsTable) { content += '<div>'; }
                if (ctrl.controls) {
                    content += renderCollection(ctrl, readOnly);
                } else {
                    if (readOnly != undefined && ctrl.readOnly == undefined) { ctrl.readOnly = readOnly; }
                    content += ui.render(ctrl);
                    if (ctrl.lineBreak) { content += '<br />'; }
                }
                if (controlGroup.renderAsTable) { content += '</div>'; }
            })
            if (controlGroup.renderAsTable) {
                content += '</div>';
            }

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