/**
 *@NApiVersion 2.1
 *@NScriptType Portlet
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView_ue.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', './modules/oTWC_dashBoardsUtils.js'],
    function (core, cored, coreSql, uis, twcBaseViewUE, twcBaseView, twcConfig, twcDashBoardsUtils) {

        var PAGE_VERSION = 'v0.01';

        function render(params) {
            params.portlet.clientScriptModulePath = 'SuiteScripts/OSSMTWC/ui/oTWC_dashBoards_cs.js'
            params.portlet.title = 'Dashboard';

            // @@NOTE: we need to pass the id of the suitelet here so the permission module can get the right permission 
            var pageData = twcBaseView.initPageData('otwc_dashboards_sl');
            pageData.portlet = true;
            // @@NOTE: initView removes userInfo from pageData outside the sandbox (not sent to the client), keep a reference
            var userInfo = pageData.userInfo;

            var html = twcBaseViewUE.initView(PAGE_VERSION, pageData, core.me() ? 'oTWC_dashBoards_temp' : 'oTWC_dashBoards_temp');
            html = html.replaceAll('{DASHBOARD_STYLE}', "margin-top: 45px; display: grid; justify-content: center;");
            html = html.replaceAll('{DASHBOARDS}', twcDashBoardsUtils.buildDashboardsHtml(userInfo))

            var newField = params.portlet.addField({ id: 'htmlfield', type: 'INLINEHTML', label: 'html' });
            newField.defaultValue = html;

            params.portlet.title = 'Dashboard';
        }




        return {
            render: render

        }

    })
