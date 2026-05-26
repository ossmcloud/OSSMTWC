/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/render', 'N/file', '../ui/modules/oTWC_siteRequestUtils.js'],
    (render, file, twcSiteRequestUtils) => {

    const onRequest = (context) => {

        try {

            const recId = context.request.parameters.recid;
            // Fetch data
            const requestJSON = twcSiteRequestUtils.getSrfInfo(recId);
            log.debug("RESULT", requestJSON);
            log.debug("SITE Name", requestJSON.siteDetails[0].custrecord_twc_site_old_id)
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