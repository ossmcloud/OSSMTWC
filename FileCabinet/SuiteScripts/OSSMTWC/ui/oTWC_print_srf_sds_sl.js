/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/render', 'N/file', '../ui/modules/oTWC_siteRequestUtils.js', '../modules/oTWC_sdsEngine.js'],
    (render, file, twcSiteRequestUtils, twcSdsEngine) => {

    const onRequest = (context) => {

        try {
            const recId = context.request.parameters.recId;
            const requestJSON = twcSiteRequestUtils.getSrfInfo(recId);
            if (requestJSON.srfDetails.length == 0) { throw new Error(`No SRF found using id: ${recId}`); }

            requestJSON.sdsData = twcSdsEngine.getFormData({ id: recId });

            const xmlFile = file.load({ id: 'SuiteScripts/OSSMTWC/XML/oTwc_print_SDS.xml' });
            const xmlString = xmlFile.getContents();
            const renderer = render.create();
            renderer.templateContent = xmlString;
            renderer.addCustomDataSource({ format: render.DataSource.OBJECT, alias: 'requestJSON', data: requestJSON });
            const pdfFile = renderer.renderAsPdf();
            pdfFile.name = 'SDS_Report.pdf';
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