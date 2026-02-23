/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', './modules/oTWC_siteLocatorUtils.js', '../O/controls/oTWC_ui_ctrl.js', '../data/oTWC_utils.js', '../data/oTWC_site.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcSiteLocatorUtils, twcUI, twcUtils, twcSite) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site Locator', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteLocator_cs.js' });   
        suiteLet.get = (context, s) => {
            
            var pageData = twcBaseView.initPageData(context);

            pageData.data.sitesInfo = twcSiteLocatorUtils.getSites();

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
            html = html.replace('{SITE_LOCATOR_PANEL}', twcSiteLocatorUtils.renderSiteLocatorPanel());

            s.form.fieldHtml(html);
        };




        return {
            onRequest: uis.onRequest
        }
    });
