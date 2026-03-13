/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../ui/modules/oTWC_siteLocatorUtils.js', '../ui/modules/oTWC_siteAccessUtils.js', '../O/controls/oTWC_ui_fieldPanel.js', '../data/oTWC_utils.js', '../data/oTWC_config.js', '../data/oTWC_saf.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcSiteLocatorUtils, twcSiteAccessUtils, twcUIPanel, twcUtils, twcConfig, twcSaf) {

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
                pageData.recordStatus = twcSaf.getSafStatusHtml(pageData.siteAccessInfo[twcSaf.Fields.STATUS]);
                // @@NOTE: if we have no recId is because we have a new SAF, we have a submit button at the bottom of the page for it, we use the forceViewOnly to hide the Save/Cancel buttons
                pageData.forceViewOnly = context.request.parameters.recId === undefined;

                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteAccess');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                var fieldGroups = twcSiteAccessUtils.getSAFInfoPanels(pageData.siteAccessInfo, pageData.userInfo, { siteTimeBlocks: pageData.siteTimeBlocks });
                html = html.replaceAll('{SITE_ACCESS_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));

                if (context.request.parameters.recId === undefined) {
                    html = html.replaceAll('{CONDITION_OF_ACCESS_PANEL}', `
                        <div style="width: 350px; padding-top: 6px; padding-left: 2px; ">
                            <div class="twc-control-panel-title" style="padding: 6px;">
                                Conditions of Access
                            </div>
                            <div id="saf-access-condition-info-2" style="border: 1px solid var(--grid-color); border-top: none; padding: 3px;">
                                <b>Select SAF Setup & Access Requirements to begin</b>
                            </div>
                        </div>
                    `);
                } else {
                    html = html.replaceAll('{CONDITION_OF_ACCESS_PANEL}', '');
                }

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

            } else if (context.request.parameters.action == 'save-new-saf') {
                var userInfo = twcConfig.userInfo(context);
                var payload = JSON.parse(context.request.body);
                return twcSiteAccessUtils.saveNewSaf(payload, userInfo);


            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        }


        return {
            onRequest: uis.onRequest
        }
    });
