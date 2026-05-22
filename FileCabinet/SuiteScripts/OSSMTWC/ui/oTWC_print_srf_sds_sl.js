/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/render', 'N/file', '../ui/modules/oTWC_siteRequestUtils.js'], 
    (render, file, twcSiteRequestUtils) => {

    const onRequest = (context) => {

        try {
            log.debug("Contextttt", JSON.stringify(context.request.parameters.recid));
            const recId = context.request.parameters.recid;
            // Call function to get the data from recId
            const result = twcSiteRequestUtils.getSrfInfo(recId);
            log.debug("RESULTTTT", result)
            // Load XML template from File Cabinet
            const xmlFile = file.load({ id: 'SuiteScripts/OSSMTWC/XML/oTwc_print_SDS.xml' });
            // Read XML contents
            const xmlString = xmlFile.getContents();
            // Convert XML to PDF
            const pdfFile = render.xmlToPdf({ xmlString: xmlString });
            // Optional PDF name
            pdfFile.name = 'SDS_Report.pdf';
            // Open PDF in browser
            context.response.writeFile({ file: pdfFile, isInline: true });

        } catch (e) {
            log.error({ title: 'PDF Generation Error', details: e });
            context.response.write(`<h3>PDF Generation Failed</h3> <pre>${e.message}</pre>`);
        }
    };

    return {
        onRequest
    };

});