/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/render', 'N/file', '../ui/modules/oTWC_siteRequestUtils.js', '../O/oTWC_dialogEx.js'],
    (render, file, twcSiteRequestUtils, dialog) => {

    const onRequest = (context) => {

        try {
            const recId = context.request.parameters.recId;
            const requestJSON = twcSiteRequestUtils.getSrfInfo(recId);
            if (requestJSON.srfDetails.length == 0) { throw new Error(`No SRF found using id: ${recId}`); }

            // throw new Error(JSON.stringify(requestJSON))

            const sdsData = JSON.parse(requestJSON.srfDetails[0].form_data || '{}');
            requestJSON.sdsData = sdsData;
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