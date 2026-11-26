/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet

 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView_ue.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_inventoryUtils.js', '../O/controls/oTWC_ui_fieldPanel.js', '../ui/modules/oTWC_siteInfoUtils.js', '../data/oTWC_equipment.js', '../O/controls/oTWC_ui_ctrl.js'],
    function (core, cored, coreSql, uis, twcBaseViewUE, twcBaseView, twcConfig, twcInventoryUtils, twcUIPanel, twcSiteInfoUtils, twcInventory, twcUI) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'Site Equipment', script: 'SuiteScripts/OSSMTWC/ui/oTWC_inventory_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            var html = ''
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                pageData.inventoryInfo = twcInventoryUtils.getInventoryInfo(pageData);
                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(pageData.inventoryInfo.siteId || context.request.parameters.siteId, pageData.userInfo);

                var html = twcBaseViewUE.initView(PAGE_VERSION, pageData, 'oTWC_siteInfo');
                if (context.request.parameters.recId) {
                    // var srfCode = pageData.inventoryInfo.name;
                    // s.form.f.title += ` - ${srfCode}`;
                    // pageData.recordStatus = `
                    //     <div class="twc-div-span-table">
                    //         <span class="twc-record-status" style="border: 1px solid var(--grid-color); padding: 0px 34px; font-size: 20px; vertical-align: middle; background-color: var(--accent-bkgd-color); color: var(--accent-fore-color)">
                    //             ${srfCode}
                    //         </span>
                    //         <span style="width: 5px;"></span>
                    //         ${pageData.recordStatus}
                    //     </div>
                    // `
                }

                let actions = '';

                // @@NOTE: 'Customer' drop down (Issue 323), TL users only, same as the Site Info page equipment filter (data/oTWC_siteUI.js: getSiteInfoPanels)
                //         filtered on screen, no reload (ui/js/oTWC_inventory.js, shared with Site Info: ui/js/oTWC_pageBase.js applyEquipmentFilters)
                if (pageData.userInfo.isEmployee && pageData.siteInfo?.site?.id) {
                    actions += `<div style="white-space: nowrap; margin-top: -11px;">${twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, id: 'site-equipment-customer', label: 'Customer', width: '250px', value: '', noAutoSelect: true, dataSource: twcInventoryUtils.getSiteEquipmentCustomers(pageData.siteInfo.site.id) })}</div>`;
                }

                // @@NOTE: hide the equipment neither licenced nor installed (oTWC_utils.js: isEquipmentInactive), ON by default, reload with hideInactive=F to show them (ui/js/oTWC_inventory.js)
                var hideInactive = context.request.parameters.hideInactive != 'F';
                actions += `<div style="white-space: nowrap; width: 80px; margin-top: -11px;">${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'hide-inactive-equipment-toggle', label: 'Hide Inactive', labelNoWrap: true, value: hideInactive, small: true })}</div>`;

                // @@NOTE: grouped view (default) shows TME / GIE with the related ATME / Feeders as child rows, ungrouped shows one table per equipment class
                var grouped = context.request.parameters.grouped != 'F';
                actions += `<div style="white-space: nowrap; width: 36px; margin-top: -11px;">${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, id: 'group-equipment-toggle', label: 'Group', labelNoWrap: true, value: grouped, small: true })}</div>`;
                
                // @@NOTES: User can add Inventory by clicking on Add Equipment Button.
                if (context.request.parameters.siteId && pageData.userInfo.isEmployee) {
                    actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Add Equipment', id: 'add-equipment-button' });
                } else {
                    pageData.forceViewOnly = true;
                }


                html = twcBaseViewUE.initView(PAGE_VERSION, pageData, 'oTWC_inventory');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
                if (pageData.userInfo.permission.lvl == twcConfig.PERMISSION_LEVEL.VIEW) {
                    readOnly = true;
                }

                var fieldGroups = twcInventoryUtils.getInvInfoPanels(pageData.siteInfo.site, pageData.userInfo, grouped, hideInactive);
                html = html.replaceAll('{SITE_REQUEST_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));
                if (actions) {
                    // @@NOTE: flex so the group toggle and the add button sit side by side
                    html = html.replaceAll('<div id="custom-actions"></div>', `<div id="custom-actions"><div style="display: flex; align-items: center; gap: 7px;">${actions}</div></div>`);
                }

            } else {
                // @@NOTE: contractors (agent pass users) cannot use the Site Equipment locator, they only see equipment per site (siteId)
                //         the menu item is hidden by configs { "restrict": "customer-menu" } on 'OSSMTWC - Role Feature List' (oTWC_permissions.js: applyRestrictions)
                //         permission NONE => initView renders the permission error page
                if (!pageData.userInfo.isEmployee && !pageData.userInfo.companyProfile?.isCustomer) {
                    pageData.userInfo.permission.lvl = twcConfig.PERMISSION_LEVEL.NONE;
                    html = twcBaseViewUE.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                    s.form.fieldHtml(html);
                    return;
                }
                pageData.data.inventoryInfo = twcInventoryUtils.getInventoryData(null, pageData.userInfo);
                html = twcBaseViewUE.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcInventoryUtils.renderInventoryPanel(pageData.userInfo, pageData.permission.featureId));
            }

            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'save') {
                // @@NOTE: INVENTORY page does not have an individual recor edit page
                return { status: 'success' };
            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
