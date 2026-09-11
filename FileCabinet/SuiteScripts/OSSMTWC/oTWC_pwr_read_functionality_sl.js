/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search','N/query'], (search, query) => {

    var SOURCE_FIELD_ID = 'custrecord_twc_pwr_rdg_pwr_mtr';

    function onRequest(context) {

        if (context.request.method !== 'GET') {
            context.response.write(JSON.stringify([]));
            return;
        }

        const meter = context.request.parameters.meter;
        const recId =  context.request.parameters.recId

        let results = [];

        if (meter) {
            // search.create({
            //     type: 'customrecord_twc_pwr_rdg',
            //     // filters: [
            //     //     [SOURCE_FIELD_ID, 'anyof', meter]
            //     // ],
            //     columns: [
            //         'custrecord_twc_pwr_rdg_id',
            //         SOURCE_FIELD_ID,
            //         'created'
            //     ]
            // }).run().each(function (result) {

            //     results.push({
            //         internalid: result.id,
            //         readingid: result.getValue('custrecord_twc_pwr_rdg_id'),
            //         meter: result.getText(SOURCE_FIELD_ID),
            //         created: result.getValue('created')
            //     });

            //     return true;
            // });
                                    // BUILTIN.DF(${SOURCE_FIELD_ID}) AS meter,

            var whereClause = ''
            if (recId) {
                whereClause = 'AND id != '+ recId
            }

            const sql = `
                    SELECT
                        id AS internalid,
                        custrecord_twc_pwr_rdg_id AS readingid,
                        BUILTIN.DF(custrecord_twc_pwr_rdg_pwr_mtr) AS meter,
                        custrecord_twc_pwr_rdg_date as reading_date,
                        created
                    FROM
                        customrecord_twc_pwr_rdg
                    WHERE
                     custrecord_twc_pwr_rdg_pwr_mtr = ${meter}
                     ${whereClause} 
                `;

           // const results = [];

            query.runSuiteQL({
                query: sql
            }).asMappedResults().forEach(function (result) {
                results.push({
                    internalid: result.internalid,
                    readingid: result.readingid,
                    meter: result.meter,
                    reading_date: result.reading_date,
                    created: result.created
                });
            });
        }

        context.response.setHeader({
            name: 'Content-Type',
            value: 'application/json'
        });

        context.response.write(JSON.stringify(results));
    }

    return {
        onRequest: onRequest
    };
});