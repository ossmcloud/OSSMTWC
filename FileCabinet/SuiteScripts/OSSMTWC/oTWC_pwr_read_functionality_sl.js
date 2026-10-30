/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/query', 'N/record'],
    (search, query, record) => {

        var SOURCE_FIELD_ID = 'custrecord_twc_pwr_rdg_pwr_mtr';

        function onRequest(context) {
            if (context.request.method === 'POST') {
                try {
                    var requestData = JSON.parse(context.request.body || '{}');

                    if (requestData.action !== 'updateStatus') {
                        context.response.write(JSON.stringify([]));
                        return;
                    }

                    var ids = requestData.ids || [];
                    var status = requestData.status;
                    var updatedIds = [];
                    var errors = [];
                    var currentMeter = requestData.meter

                    if (currentMeter) {
                        var result = query.runSuiteQL({
                            query: "SELECT id FROM customrecord_twc_pwr_rdg WHERE custrecord_twc_pwr_rdg_pwr_mtr = ? AND custrecord_twc_pwr_rdg_reading_status = 2",
                            params: [currentMeter]
                        }).asMappedResults();

                        result.forEach(function (row) {
                            record.submitFields({
                                type: 'customrecord_twc_pwr_rdg',
                                id: row.id,
                                values: {
                                    custrecord_twc_pwr_rdg_reading_status: 5
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        });
                    }

                    ids.forEach(function (id) {
                        try {
                            var recId = parseInt(id);

                            if (!recId || String(recId) !== String(id)) {
                                throw new Error('Invalid record ID: ' + id);
                            }

                            record.submitFields({
                                type: 'customrecord_twc_pwr_rdg',
                                id: recId,
                                values: {
                                    custrecord_twc_pwr_rdg_reading_status: status
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });

                            updatedIds.push(recId);

                        } catch (err) {
                            errors.push({ id: id, message: err.message });
                        }
                    });


                    context.response.setHeader({
                        name: 'Content-Type',
                        value: 'application/json'
                    });

                    context.response.write(JSON.stringify({
                        success: errors.length === 0,
                        message: errors.length
                            ? updatedIds.length + ' updated; ' + errors.length + ' failed.'
                            :'Reading status updated successfully.',
                        errors: errors
                    }));

                    return;

                } catch (err) {
                    context.response.setHeader({
                        name: 'Content-Type',
                        value: 'application/json'
                    });

                    context.response.write(JSON.stringify({
                        success: false,
                        message: err.message || 'Unable to update statuses.'
                    }));

                    return;
                }
            }

            if (context.request.method !== 'GET') {
                context.response.write(JSON.stringify([]));
                return;
            }

            const meter = context.request.parameters.meter;
            const recId = context.request.parameters.recId

            let results = [];

            if (meter) {

                var whereClause = ''
                if (recId) {
                    whereClause = 'AND id != ' + recId
                }

                const sql = `
                    SELECT
                        id AS internalid,
                        created as created,
                        custrecord_twc_pwr_rdg_id AS readingid,
                        BUILTIN.DF(custrecord_twc_pwr_rdg_pwr_mtr) AS meter,
                         custrecord_twc_pwr_rdg_date as reading_date,
                        custrecord_twc_pwr_rdg_day as day_reading,
                        custrecord_twc_pwr_rdg_night as night_reading,
                        custrecord_twc_pwr_rdg_peak_meter_wrap as peak_mtr_wrap,
                        custrecord_twc_pwr_rdg_kwh_usage as kwh_usage,
                        BUILTIN.DF(custrecord_twc_pwr_rdg_reading_status) as status
                    FROM
                        customrecord_twc_pwr_rdg
                    WHERE
                     custrecord_twc_pwr_rdg_pwr_mtr = ${meter}
                     ${whereClause} 
                     ORDER BY
                       created
                `;

                query.runSuiteQL({
                    query: sql
                }).asMappedResults().forEach(function (result) {
                    results.push({
                        internalid: result.internalid,
                        readingid: result.readingid,
                        meter: result.meter,
                        reading_date: result.reading_date,
                        day_reading: result.day_reading,
                        night_reading: result.night_reading,
                        peak_mtr_wrap: result.peak_mtr_wrap,
                        kwh_usage: result.kwh_usage,
                        status: result.status
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