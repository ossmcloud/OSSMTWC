/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['N/redirect', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../O/controls/oTWC_ui_ctrl.js', '../O/controls/oTWC_ui_fieldPanel.js'],
    function (redirect, core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcUI, twcUIPanel) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteInfo_cs.js' });
        suiteLet.get = (context, s) => {

            if (!context.request.parameters.recId) {
                redirect.toSuitelet({ scriptId: 'customscript_otwc_siteLocator_sl', deploymentId: 'customdeploy_otwc_sitelocator_sl'});
                return false;
            }

            var pageData = twcBaseView.initPageData(context);
            pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(context.request.parameters.recId);

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteInfo');
            html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)


            var readOnly = context.request.parameters.edit != 'T';
            // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
            if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }

            var fieldGroups = twcSiteInfoUtils.getSiteInfoPanels(pageData.siteInfo.site);
            html = html.replaceAll('{SITE_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));


            s.form.fieldHtml(html);
        };


        suiteLet.post = (context, s) => {

            if (context.request.parameters.action == 'save') {
                var payload = JSON.parse(context.request.body);
                twcSiteInfoUtils.saveSiteInfo(payload);
            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };

        return {
            onRequest: uis.onRequest
        }
    });
