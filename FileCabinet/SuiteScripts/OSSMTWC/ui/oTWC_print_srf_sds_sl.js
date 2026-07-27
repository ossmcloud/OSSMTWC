/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['../modules/oTWC_sdsRender.js'],
    (sdsRender) => {

        const onRequest = (context) => {
            try {
                context.response.writeFile({ file: sdsRender.renderSDS(context, context.request.parameters.recId ), isInline: true });
            } catch (e) {
                context.response.write(`<h3>PDF Generation Failed</h3><pre>${e.message}<hr />${e.stack}</pre>`);
            }
        };

        return {
            onRequest
        };

    });