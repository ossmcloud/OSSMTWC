/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView_ue.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', './modules/oTWC_sdsFilesUtils.js'],
    function (core, uis, twcBaseViewUE, twcBaseView, twcConfig, twcSdsFilesUtils) {

        var PAGE_VERSION = 'v0.01';

        // @@NOTE: SDS Files locator page: map + list of the SDS (with a PDF), the 'View' link opens the PDF in a dialog (via oTWC_microSvc_sl: view-file)
        //         feature: 'SDS Files' on 'OSSMTWC - Role Feature List' (script: customscript_otwc_sdsfiles_sl)
        var suiteLet = uis.new({ title: 'TL SDS Files', script: 'SuiteScripts/OSSMTWC/ui/oTWC_sdsFiles_cs.js' });
        suiteLet.get = (context, s) => {

            var pageData = twcBaseView.initPageData(context);

            pageData.sdsInfo = twcSdsFilesUtils.getSdsFiles(null, pageData.userInfo);

            var html = twcBaseViewUE.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
            html = html.replace('{SITE_LOCATOR_PANEL}', twcSdsFilesUtils.renderSdsFilesPanel(pageData.userInfo));

            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
        };

        return {
            onRequest: uis.onRequest
        }
    });
