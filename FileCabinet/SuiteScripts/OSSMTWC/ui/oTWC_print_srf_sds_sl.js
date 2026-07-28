/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../modules/oTWC_sdsRender.js', '../data/oTWC_sds.js', '../data/oTWC_file.js'],
    (file, core, coreSql, sdsRender, twcSds, twcFile) => {

        const onRequest = (context) => {
            try {
                var pdfFile = null;
                if (context.request.parameters.fromFile == 'T') {
                    var pdf = coreSql.first(`
                            select  f.${twcFile.Fields.FILE} as file_id 
                            from    ${twcSds.Type} sds
                            join    ${twcFile.Type} f on f.id = ${twcSds.Fields.PDF}
                            where   ${twcSds.Fields.SRF} = ${context.request.parameters.recId}

                    `)?.file_id;
                    if (pdf) { pdfFile = file.load({ id: pdf }); }
                }
                if (!pdfFile) {
                    // @@NOTE: this should only happen when the file is generated, reviewed, signed and executed
                    pdfFile = sdsRender.renderSDS(context, context.request.parameters.recId);
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