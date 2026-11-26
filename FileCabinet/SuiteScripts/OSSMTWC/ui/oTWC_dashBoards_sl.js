/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView_ue.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', './modules/oTWC_dashBoardsUtils.js', '../data/oTWC_icons.js'],
    function (core, cored, coreSql, uis, twcBaseViewUE, twcBaseView, twcConfig, twcDashBoardsUtils, twcIcons) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'Dashboard', script: 'SuiteScripts/OSSMTWC/ui/oTWC_dashBoards_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);
            // @@NOTE: initView removes userInfo from pageData outside the sandbox (not sent to the client), keep a reference
            var userInfo = pageData.userInfo;

            // @@NOTE: KPI details (clicking a KPI tile): ?kpi=[KPI id], list of the records counted by the KPI (oTWC_dashBoardsUtils.js: renderKpiDetails)
            var kpiId = context.request.parameters.kpi;
            if (kpiId) {
                pageData.kpi = kpiId;
                var html = twcBaseViewUE.initView(PAGE_VERSION, pageData, 'oTWC_dashBoardDetails');
                var details = null;
                try {
                    details = twcDashBoardsUtils.renderKpiDetails(userInfo, kpiId);
                } catch (error) {
                    core.logError('DASHBOARD-KPI-DETAILS', `${kpiId} :: ${error.message}`);
                    details = { title: 'Dashboard', table: twcDashBoardsUtils.getErrorHtml(error) };
                }
                // @@NOTE: the back to dashboard icon is moved next to the page title by the client (oTWC_dashBoards.js: initKpiDetails)
                html = html.replaceAll('{BACK_URL}', core.url.script('otwc_dashboards_sl'));
                html = html.replaceAll('{BACK_ICON}', twcIcons.get('arrowLeftCircle', 24));
                html = html.replaceAll('{KPI_TABLE}', details.table);
                s.form.fieldHtml(html);
                s.form.f.title = details.title;
                return;
            }

            var html = twcBaseViewUE.initView(PAGE_VERSION, pageData, 'oTWC_dashBoards_temp');
            html = html.replaceAll('{DASHBOARD_STYLE}', "margin-top: 0px; display: grid; justify-content: center;");
            html = html.replaceAll('{DASHBOARDS}', twcDashBoardsUtils.buildDashboardsHtml(userInfo))
            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'get-dashboards') {
                // @@NOTE: all the KPIs the user can see in one request: { values: { [kpi id]: count or error html } }
                return { values: twcDashBoardsUtils.runDashboards(userInfo) };

            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
