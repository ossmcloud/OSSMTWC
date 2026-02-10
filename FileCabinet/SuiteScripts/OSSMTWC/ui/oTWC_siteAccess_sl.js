/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../ui/modules/oTWC_siteLocatorUtils.js', '../ui/modules/oTWC_siteAccessUtils.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcSiteLocatorUtils, twcSiteAccessUtils) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site Access', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteAccess_cs.js' });
        suiteLet.get = (context, s) => {

            var pageData = twcBaseView.initPageData(context);

            var html = '';
            if (context.request.parameters.recId) {
                pageData.siteAccessInfo = twcSiteAccessUtils.getSiteAccessInfo(context.request.parameters.recId);
                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(pageData.siteAccessInfo.site);

                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteAccess');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                
            } else {
                // @@TODO: this should actually be the site access info
                pageData.data.sitesInfo = twcSiteLocatorUtils.getSites();


                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteAccessLocator');
                // @@TODO: 
                html = html.replace('{SITE_LOCATOR_PANEL}', twcSiteLocatorUtils.renderSiteLocatorPanel(pageData.permission.featureId));

            }

           



            s.form.fieldHtml(html);
        };




        return {
            onRequest: uis.onRequest
        }
    });
