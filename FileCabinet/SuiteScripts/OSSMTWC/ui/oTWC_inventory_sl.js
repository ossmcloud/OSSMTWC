/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet

 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_inventoryUtils.js', '../O/controls/oTWC_ui_fieldPanel.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcInventoryUtils, twcUIPanel) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Inventory', script: 'SuiteScripts/OSSMTWC/ui/oTWC_inventory_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            pageData.data.inventoryInfo = twcInventoryUtils.getInventoryData();
            html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
            // html = html.replace('{SITE_LOCATOR_PANEL}', twcInventoryUtils.renderInventoryPanel(pageData.userInfo, pageData.permission.featureId));

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_inventory');

            var readOnly = context.request.parameters.edit != 'T';
            // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
            if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }

            // html = html.replace('{INVENTORY_DETAILS}', 'hello, dude...')
            html = html.replace('{INVENTORY_DETAILS}', twcInventoryUtils.renderInventoryPanel(pageData.userInfo, pageData.permission.featureId));


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
