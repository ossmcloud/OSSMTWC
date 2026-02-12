/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../ui/modules/oTWC_siteLocatorUtils.js', '../ui/modules/oTWC_siteRequestUtils.js', '../O/controls/oTWC_ui_fieldPanel.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcSiteLocatorUtils, twcSiteRequestUtils, twcUIPanel) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Space Request', script: 'SuiteScripts/OSSMTWC/ui/oTWC_spaceRequest_cs.js' });
        suiteLet.get = (context, s) => {
            
            var pageData = twcBaseView.initPageData(context);

            var html = '';
            if (context.request.parameters.siteId) {
                pageData.siteRequestInfo = twcSiteRequestUtils.getSiteRequestInfo(pageData);
                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(context.request.parameters.siteId);

                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_spaceRequest');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
                if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }

                var fieldGroups = twcSiteRequestUtils.getSRFInfoPanels(pageData.siteRequestInfo, pageData.userInfo);

                html = html.replaceAll('{SITE_REQUEST_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));



            } else {
                // @@TODO: this should actually be the site access info
                pageData.data.sitesInfo = twcSiteLocatorUtils.getSites();


                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcSiteLocatorUtils.renderSiteLocatorPanel(pageData.permission.featureId));

                

            }

            s.form.fieldHtml(html);
        };

        return {
            onRequest: uis.onRequest
        }
    });
