/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', './modules/oTWC_siteLocatorUtils.js', '../O/controls/oTWC_ui_ctrl.js', '../data/oTWC_utils.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcSiteLocatorUtils, twcUI, twcUtils) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site Locator', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteLocator_cs.js' });   
        suiteLet.get = (context, s) => {
            
            var pageData = twcBaseView.initPageData(context);
            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocator');

            
            html = html.replace('{FILTER_NAME}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Name', width: '100%', id: 'twc-filter-name', noEmpty: true, dataSource: twcUtils.getSiteNames() }));
            html = html.replace('{FILTER_SITE_TYPE}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Site Type', width: '50%', multiSelect: true, id: 'twc-filter-site-type', noEmpty: true, dataSource: twcUtils.getSiteTypes() }));
            html = html.replace('{FILTER_COUNTIES}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'County', width: '50%', multiSelect: true, id: 'twc-filter-county', noEmpty: true, dataSource: twcUtils.getCounties() }));
            html = html.replace('{FILTER_REGION}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Region', width: '50%', multiSelect: true, id: 'twc-filter-region', noEmpty: true, dataSource: twcUtils.getRegions() }));
            html = html.replace('{FILTER_PORTFOLIO}', twcUI.render({ type: twcUI.CTRL_TYPE.DROPDOWN, label: 'Portfolio', width: '50%', multiSelect: true, id: 'twc-filter-portfolio', noEmpty: true, dataSource: twcUtils.getPortfolios() }));

            html = html.replace('{FILTER_LAT}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Latitude', id: 'twc-filter-latitude', width: '250px' }));
            html = html.replace('{FILTER_LNG}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Longitude', id: 'twc-filter-longitude', width: '250px' }));
            html = html.replace('{FILTER_RADIUS}', twcUI.render({ type: twcUI.CTRL_TYPE.NUMBER, label: 'Radius (Km)', id: 'twc-filter-radius', width: '75px', min: 5, max: 300 }));

            html = html.replace('{ACTION_NEW_SITE}', twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'New Site', id: 'twc-action-new-site' }));

            s.form.fieldHtml(html);
        };




        return {
            onRequest: uis.onRequest
        }
    });
