/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', './modules/oTWC_siteLocatorUtils.js', '../O/controls/oTWC_ui_ctrl.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcSiteLocatorUtils, twcUI) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site Locator', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteLocator_cs.js' });   
        suiteLet.get = (context, s) => {
            
            var pageData = twcBaseView.initPageData({ });
            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocator');
            
            
            s.form.fieldHtml(html);
        };




        return {
            onRequest: uis.onRequest
        }
    });
