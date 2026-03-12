/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../ui/modules/oTWC_siteLocatorUtils.js', '../ui/modules/oTWC_siteAccessUtils.js', '../O/controls/oTWC_ui_fieldPanel.js', '../data/oTWC_utils.js', '../data/oTWC_config.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcSiteLocatorUtils, twcSiteAccessUtils, twcUIPanel, twcUtils, twcConfig) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site Access', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteAccess_cs.js' });
        suiteLet.get = (context, s) => {

            var pageData = twcBaseView.initPageData(context);

            var html = '';
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                pageData.siteAccessInfo = twcSiteAccessUtils.getSiteAccessInfo(pageData);
                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(pageData.siteAccessInfo.siteId || context.request.parameters.siteId);
                pageData.timeBlocks = twcUtils.getSafTimeBlocks();
                pageData.siteTimeBlocks = twcSiteAccessUtils.getAllSafTimeBlocks(pageData.siteAccessInfo);

                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteAccess');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                var fieldGroups = twcSiteAccessUtils.getSAFInfoPanels(pageData.siteAccessInfo, pageData.userInfo, { siteTimeBlocks: pageData.siteTimeBlocks });
                html = html.replaceAll('{SITE_ACCESS_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));

            } else {
                pageData.data.safInfo = twcSiteLocatorUtils.getSiteSaf();
                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcSiteAccessUtils.renderSiteAccessPanel(pageData.permission.featureId));
            }

            s.form.fieldHtml(html);
        };



        suiteLet.post = (context, s) => {

            if (context.request.parameters.action == 'get-access-requirements') {
                var payload = JSON.parse(context.request.body);
                return twcSiteAccessUtils.getAccessRequirements(payload);

            } else if (context.request.parameters.action == 'get-vendor-picw') {
                var payload = JSON.parse(context.request.body);
                return {
                    data: twcUtils.getProfiles({
                        company: payload.vendor,
                        filters: {
                            'custrecord_twc_prof_picw_acceptable': 'T',
                            'custrecord_twc_prof_safe_pass_expiry': { op: '>', value: 'CURRENT_DATE' }
                        }
                    })
                };

            } else if (context.request.parameters.action == 'get-vendor-docs') {
                var payload = JSON.parse(context.request.body);
                return { data: twcSiteAccessUtils.getVendorDocs(payload) };

            } else if (context.request.parameters.action == 'get-vendor-persons') {
                var payload = JSON.parse(context.request.body);
                return { data: twcUtils.getProfiles({ company: payload.vendor, canAttend: true }) };

            } else if (context.request.parameters.action == 'saf-crew-record') {
                //throw new Error(context.request.body)
                var userInfo = twcConfig.userInfo(context);
                var payload = JSON.parse(context.request.body);
                var fields = twcSiteAccessUtils.getSafCrewRecord(payload, userInfo);
                return fields;

            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        }


        return {
            onRequest: uis.onRequest
        }
    });
