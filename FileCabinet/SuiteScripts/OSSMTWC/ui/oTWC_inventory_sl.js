/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet

 */
define(['N/redirect', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_inventoryUtils.js', '../O/controls/oTWC_ui_fieldPanel.js', '../ui/modules/oTWC_siteInfoUtils.js', '../data/oTWC_equipment.js'],
    function (redirect, core, cored, coreSql, uis, twcBaseView, twcConfig, twcInventoryUtils, twcUIPanel, twcSiteInfoUtils, twcInventory) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Inventory', script: 'SuiteScripts/OSSMTWC/ui/oTWC_inventory_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            var html = ''
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                log.debug("Context parameters", JSON.stringify(pageData.siteId));
                pageData.inventoryInfo = twcInventoryUtils.getInventoryInfo(pageData);
                // var pageData = twcBaseView.initPageData(context);
                pageData.siteInfo = twcInventoryUtils.getSiteInfo(pageData.inventoryInfo.siteId || context.request.parameters.siteId);

                var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteInfo');
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

                // @@NOTES: if the SRF is submitted we still let users with full access to edit it but only if we are a Towercom employee 
                if (context.request.parameters.recId) {
                    var canSubmit = pageData.inventoryInfo[twcInventory.Fields.EQUIPMENT_STATUS] == twcInventory.Status.Draft || pageData.inventoryInfo[twcInventory.Fields.EQUIPMENT_STATUS] == twcInventory.Status.FeedbackIssued;
                    pageData.forceViewOnly = !(canSubmit ? true : (pageData.userInfo.isEmployee && pageData.userInfo.permission.lvl == twcConfig.PERMISSION_LEVEL.FULL));
                } else {
                    pageData.forceViewOnly = true;
                }


                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_spaceRequest');
                log.debug('pageDataaaaa', JSON.stringify(pageData.inventoryInfo))
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
                if (pageData.userInfo.permission.lvl == twcConfig.PERMISSION_LEVEL.VIEW) {
                    // @@TODO: here we should really re-direct without the edit flag
                    readOnly = true;
                }

                var fieldGroups = twcInventoryUtils.getInvInfoPanels(pageData.inventoryInfo, pageData.userInfo);
                html = html.replaceAll('{SITE_REQUEST_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));
                if (canSubmit) {
                    html = html.replaceAll('<div id="custom-actions"></div>', `
                        <div id="custom-actions">
                            ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Submit', id: 'submit-button' })}
                        </div>
                    `);
                }

            } else {
                pageData.data.inventoryInfo = twcInventoryUtils.getInventoryData();
                log.debug("ticketInfo", pageData.data.ticketInfo)
                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcInventoryUtils.renderInventoryPanel(pageData.userInfo, pageData.permission.featureId));
            }

            // pageData.data.inventoryInfo = twcInventoryUtils.getInventoryData();
            // html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
            // // html = html.replace('{SITE_LOCATOR_PANEL}', twcInventoryUtils.renderInventoryPanel(pageData.userInfo, pageData.permission.featureId));

            // html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_inventory');

            // var readOnly = context.request.parameters.edit != 'T';
            // // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
            // if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }

            // // html = html.replace('{INVENTORY_DETAILS}', 'hello, dude...')
            // html = html.replace('{INVENTORY_DETAILS}', twcInventoryUtils.renderInventoryPanel(pageData.userInfo, pageData.permission.featureId));


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
