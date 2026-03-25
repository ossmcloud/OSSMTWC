/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_companyProfileUtils.js', '../O/controls/oTWC_ui_fieldPanel.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcCompanyProfileUtils, twcUIPanel) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Company Profile', script: 'SuiteScripts/OSSMTWC/ui/oTWC_companyProfile_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            

            pageData.profileInfo = twcCompanyProfileUtils.getProfileInfo(pageData);
            pageData.recId = pageData.profileInfo.id;

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_companyProfile');

            var readOnly = context.request.parameters.edit != 'T';
            // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
            if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }

            var fieldGroups = twcCompanyProfileUtils.getCompanyInfoPanels(pageData);
            html = html.replaceAll('{COMPANY_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));

            // var profiles = twcCompanyProfileUtils.getCompanyProfilesPanel(pageData.profileInfo, pageData.userInfo);
            // html = html.replaceAll('{COMPANY_PROFILES}', twcUIPanel.render(profiles, readOnly));

            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'save') {
                var payload = JSON.parse(context.request.body);
                twcCompanyProfileUtils.saveCompanyProfile(payload);
                return { status: 'success' };
            } else if (context.request.parameters.action == 'child-record') {
                var payload = JSON.parse(context.request.body);
                var fields = twcCompanyProfileUtils.getCompanyChildRecord(payload, userInfo);
                return { ui: fields };
            } else if (context.request.parameters.action == 'save-child-record') {

                var payload = JSON.parse(context.request.body);
                return twcCompanyProfileUtils.saveCompanyChildRecord(payload, userInfo);

            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
