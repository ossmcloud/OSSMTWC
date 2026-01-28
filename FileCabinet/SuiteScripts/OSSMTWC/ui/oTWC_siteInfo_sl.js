/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../O/controls/oTWC_ui_ctrl.js', '../O/controls/oTWC_ui_fieldPanel.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcUI, twcUIPanel) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteInfo_cs.js' });
        suiteLet.get = (context, s) => {

            var pageData = twcBaseView.initPageData(context);
            pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(context.request.parameters.site);

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteInfo');
            html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)


            var readOnly = context.request.parameters.edit != 'T';
            // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
            if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }

            var fieldGroup = twcSiteInfoUtils.getPanelFields_summary(pageData.siteInfo.site);
            html = html.replaceAll('{SITE_DETAILS}', twcUIPanel.render(fieldGroup, readOnly));


            s.form.fieldHtml(html);
        };




        return {
            onRequest: uis.onRequest
        }
    });
