/**
 *@NApiVersion 2.1
 *@NScriptType Portlet
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js'],
    function (core, cored, coreSql, uis, twcBaseView) {

        var PAGE_VERSION = 'v0.01';

        function render(params) {
            params.portlet.clientScriptModulePath = 'SuiteScripts/OSSMTWC/ui/oTWC_dashBoards_cs.js'
            params.portlet.title = 'TWC Dashboard';

            // @@NOTE: we need to pass the id of the suitelet here so the permission module can get the right permission 
            var pageData = twcBaseView.initPageData('otwc_dashboards_sl');
            pageData.portlet = true;

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_dashBoards');

            var newField = params.portlet.addField({ id: 'htmlfield', type: 'INLINEHTML', label: 'html' });
            newField.defaultValue = html;

            params.portlet.title = 'TWC Dashboard';
        }




        return {
            render: render

        }

    })
