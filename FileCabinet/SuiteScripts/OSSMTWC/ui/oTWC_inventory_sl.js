/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet

 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_inventoryUtils.js', '../O/controls/oTWC_ui_fieldPanel.js', '../ui/modules/oTWC_siteInfoUtils.js', '../data/oTWC_equipment.js', '../O/controls/oTWC_ui_ctrl.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcInventoryUtils, twcUIPanel, twcSiteInfoUtils, twcInventory, twcUI) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Inventory', script: 'SuiteScripts/OSSMTWC/ui/oTWC_inventory_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            var html = ''
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                pageData.inventoryInfo = twcInventoryUtils.getInventoryInfo(pageData);
                pageData.siteInfo = twcInventoryUtils.getSiteInfo(pageData.inventoryInfo.siteId || context.request.parameters.siteId);

                var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteInfo');
                // @TODO : Work on the Status field for Inventory Record
                // pageData.recordStatus = `<div class="twc-div-span-table">${twcInventory.getTktStatusHtml(pageData.inventoryInfo[twcInventory.Fields.EQUIPMENT_STATUS])}</div>`;
                if (context.request.parameters.recId) {
                    var srfCode = pageData.inventoryInfo.name;
                    s.form.f.title += ` - ${srfCode}`;
                    pageData.recordStatus = `
                        <div class="twc-div-span-table">
                            <span class="twc-record-status" style="border: 1px solid var(--grid-color); padding: 0px 34px; font-size: 20px; vertical-align: middle; background-color: var(--accent-bkgd-color); color: var(--accent-fore-color)">
                                ${srfCode}
                            </span>
                            <span style="width: 5px;"></span>
                            ${pageData.recordStatus}
                        </div>
                    `
                }

                let actions = '';

                // @@NOTES: User can add Inventory by clicking on Add Equipment Button. 
                if (context.request.parameters.siteId && pageData.userInfo.isEmployee) {
                    actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Add Equipment', id: 'add-equipment-button' });
                } else {
                    pageData.forceViewOnly = true;
                }


                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_inventory');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
                if (pageData.userInfo.permission.lvl == twcConfig.PERMISSION_LEVEL.VIEW) {
                    // @@TODO: here we should really re-direct without the edit flag
                    readOnly = true;
                }

                var fieldGroups = twcInventoryUtils.getInvInfoPanels(pageData.siteInfo.site, pageData.userInfo);
                html = html.replaceAll('{SITE_REQUEST_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));
                if (actions) {
                    html = html.replaceAll('<div id="custom-actions"></div>', `<div id="custom-actions">${actions}</div>`);
                }

            } else {
                pageData.data.inventoryInfo = twcInventoryUtils.getInventoryData(null, pageData.userInfo);
                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcInventoryUtils.renderInventoryPanel(pageData.userInfo, pageData.permission.featureId));
            }

            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'save') {
                var payload = JSON.parse(context.request.body);
                // @@TODO: INVENTORY: implement save
                return { status: 'success' };
            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
