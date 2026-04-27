/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet

 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_nexusRecordUtils.js', '../O/controls/oTWC_ui_fieldPanel.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcNexusRecordUtils, twcUIPanel) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Nexus Record', script: 'SuiteScripts/OSSMTWC/ui/oTWC_nexusRecord_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            
            var readOnly = context.request.parameters.edit != 'T';
            // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
            if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }

            var nxData = twcNexusRecordUtils.getNexusRecord(context.request.parameters, pageData.userInfo);

            pageData.data = nxData.data;
            pageData.nxRecord = {
                type: nxData.type,
                id: nxData.id
            };

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_nexusRecord');
            html = html.replace('{NEXUS_RECORD_DETAILS}', nxData.html);

            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'save') {
                var payload = JSON.parse(context.request.body);
                // @@TODO: NEXUS_RECORD: implement save
                return { status: 'success' };
            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
