/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../modules/oTWC_sdsRender.js', '../data/oTWC_sds.js', '../data/oTWC_file.js', '../data/oTWC_site.js'],
    (file, core, coreSql, sdsRender, twcSds, twcFile, twcSite) => {

        const onRequest = (context) => {
            try {
                var pdfFile = null;
                if (context.request.parameters.fromFile == 'T') {
                    // @@NOTE: the SDS is identified by its SRF (recId) or directly by its id (sdsId, TL SDS Files page: oTWC_sdsFiles.js)
                    var whereClause = (context.request.parameters.sdsId)
                        ? `sds.id = ${parseInt(context.request.parameters.sdsId) || 0}`
                        : `sds.${twcSds.Fields.SRF} = ${parseInt(context.request.parameters.recId) || 0}`;
                    var pdf = coreSql.first(`
                            select  f.${twcFile.Fields.FILE} as file_id,
                                    site.${twcSite.Fields.SITE_NAME} as site_name,
                                    BUILTIN.DF(sds.${twcSds.Fields.CUSTOMER}) as customer_name,
                                    sds.name as sds_number,
                                    TO_CHAR(sds.created, 'DD-MM-YYYY') as created_date
                            from    ${twcSds.Type} sds
                            join    ${twcFile.Type} f on f.id = sds.${twcSds.Fields.PDF}
                            left join ${twcSite.Type} site on site.id = sds.${twcSds.Fields.SITE}
                            where   ${whereClause}
                    `);
                    if (pdf?.file_id) {
                        pdfFile = file.load({ id: pdf.file_id });
                        // @@NOTE: not saved, only sets the name sent to the browser (Content-Disposition), used by the PDF viewer when downloading
                        pdfFile.name = twcSds.getPdfFileName(pdf.site_name, pdf.customer_name, pdf.sds_number, pdf.created_date);
                    }
                }
                if (!pdfFile) {
                    // @@NOTE: this should only happen when the file is generated, reviewed, signed and executed
                    pdfFile = sdsRender.renderSDS(context, context.request.parameters.recId, context.request.parameters.forceSave == 'T');
                }
                context.response.writeFile({ file: pdfFile, isInline: true });
            } catch (e) {
                context.response.write(`<h3>PDF Generation Failed</h3><pre>${e.message}<hr />${e.stack}</pre>`);
            }
        };

        return {
            onRequest
        };

    });
