/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView_ue.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', './modules/oTWC_dashBoardsUtils.js'],
    function (core, cored, coreSql, uis, twcBaseViewUE, twcBaseView, twcConfig, twcDashBoardsUtils) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TL Dashboard', script: 'SuiteScripts/OSSMTWC/ui/oTWC_dashBoards_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);
            var html = twcBaseViewUE.initView(PAGE_VERSION, pageData, core.me() ? 'oTWC_dashBoards_temp' : 'oTWC_dashBoards');
            html = html.replaceAll('{DASHBOARD_STYLE}', "margin-top: 0px;");
            html = html.replaceAll('{DASHBOARDS}', twcDashBoardsUtils.buildDashboardsHtml(pageData.userInfo))
            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'get-dashboard') {
                var payload = JSON.parse(context.request.body);

                return { html: twcDashBoardsUtils.runDashboard(userInfo, payload.id) };

            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
