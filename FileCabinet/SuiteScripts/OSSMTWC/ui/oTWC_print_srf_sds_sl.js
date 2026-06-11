/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/render', 'N/file', '../ui/modules/oTWC_siteRequestUtils.js', '../O/oTWC_dialogEx.js'],
    (render, file, twcSiteRequestUtils, dialog) => {

    const onRequest = (context) => {

        try {

            const recId = context.request.parameters.recid;
            // Get popup values
            const sdsData = context.request.parameters || '{}';
            log.debug("Received Parameters", context.request.parameters);
            // Fetch data
            const requestJSON = twcSiteRequestUtils.getSrfInfo(recId);
            requestJSON.sdsData = sdsData;
            // Load XML template
            const xmlFile = file.load({ id: 'SuiteScripts/OSSMTWC/XML/oTwc_print_SDS.xml' });
            const xmlString = xmlFile.getContents();
            // Create renderer
            const renderer = render.create();
            // Set template content
            renderer.templateContent = xmlString;
            // Add custom data source
            renderer.addCustomDataSource({ format: render.DataSource.OBJECT, alias: 'requestJSON', data: requestJSON });
            // Render PDF
            const pdfFile = renderer.renderAsPdf();
            pdfFile.name = 'SDS_Report.pdf';
            // Response
            context.response.writeFile({ file: pdfFile, isInline: true });
        } catch (e) {

            log.error({ title: 'PDF Generation Error', details: e });
            context.response.write( `<h3>PDF Generation Failed</h3><pre>${e.message}</pre>` );
        }
    };

    return {
        onRequest
    };

});