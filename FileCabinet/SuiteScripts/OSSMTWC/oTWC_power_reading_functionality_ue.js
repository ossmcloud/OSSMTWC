
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'N/query', 'N/ui/serverWidget', 'N/record', 'N/format'],
    (runtime, core, recu, query, serverWidget, record, format) => {

        const SOURCE_FIELD_ID = 'custrecord_twc_pwr_rdg_pwr_mtr';
        const HTML_FIELD_ID = 'custpage_power_reading_html';
        const POWER_READING_TAB_ID = 'custom417';


        function beforeLoad(context) {
            try {
                log.debug("Before", context.form.getTabs())
                const htmlField = context.form.addField({
                    id: HTML_FIELD_ID,
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Power Readings',
                    container: POWER_READING_TAB_ID
                });

                htmlField.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                htmlField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                });

                renderPowerReadings(context, htmlField);
            }
            catch (err) {
                log.error("error@beforeLoad", err)
            }
        }

        function afterSubmit(context) {
            try {
                var readingStatus = context.newRecord.getValue('custrecord_twc_pwr_rdg_reading_status')
                var pwrMeter = context.newRecord.getValue('custrecord_twc_pwr_rdg_pwr_mtr')

                if (readingStatus == '2' && pwrMeter) {//Latest
                    var latestRecId = checkForPreviousLatest(pwrMeter, context.newRecord.id)
                    if (latestRecId) {
                        recu.submit(context.newRecord.type, latestRecId, 'custrecord_twc_pwr_rdg_reading_status', 5);
                    }
                }

                USAGE_CALC.usageCalculations(context.newRecord)

                if (context.type === context.UserEventType.CREATE) {
                    updateMeterRecord(context.newRecord)
                }

            }
            catch (err) {
                core.logDebug('BEFORE-LOAD', err.message);
            }
        }

        function checkForPreviousLatest(pwrMeter, currentRecId) {
            var sql = `SELECT id as recId
                        FROM customrecord_twc_pwr_rdg 
                        WHERE custrecord_twc_pwr_rdg_pwr_mtr =${pwrMeter} and 
                        custrecord_twc_pwr_rdg_reading_status = 2 and id != ${currentRecId} and
                        isinactive = 'F'  order by id desc`

            var results = query.runSuiteQL({
                query: sql
            }).asMappedResults();

            var latestRecordId = results.length ? results[0].recid : '';
            log.debug("latestRecordId", latestRecordId)
            return latestRecordId
        }

        function renderPowerReadings(context, htmlField) {
            log.debug("htmlField", htmlField)

            if (!htmlField) {
                return;
            }

            const meterId = context.newRecord.getValue({
                fieldId: SOURCE_FIELD_ID
            });
            log.debug("meterId", meterId)

            if (!meterId) {
                htmlField.defaultValue = `
        <div id="powerReadingDiv">
            ${renderTable([])}
        </div>
    `;
                return;
            }

            try {

                const results = getPowerReadings(meterId, context.newRecord.id);
                log.debug("results", results)
                htmlField.defaultValue = `
    <div id="powerReadingDiv" style="width:100%; margin:10px 0 0 0; padding:0;">
        ${renderTable(results)}
    </div>
`;

            } catch (e) {

                log.error({
                    title: 'Error Loading Power Readings',
                    details: e
                });

                htmlField.defaultValue = renderTable([], true);
            }
        }

        function getPowerReadings(meterId, recId) {

            var whereClause = ''
            if (recId) {
                whereClause = `AND id != ${recId}`
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
                custrecord_twc_pwr_rdg_pwr_mtr = ? 
                ${whereClause}
            ORDER BY
                created DESC
        `;

            return query.runSuiteQL({
                query: sql,
                params: [meterId]
            }).asMappedResults();
        }

        function renderTable(data, isError) {

            data = Array.isArray(data) ? data : [];

            let html = '';

            html += '<style>';
            html += '.pwr-rdg-sublist {';
            html += 'font-family: Arial, Helvetica, sans-serif;';
            html += 'font-size: 11px;';
            html += 'color: #333;';
            html += 'border: 1px solid #c3c3c3;';
            html += 'border-collapse: collapse;';
            html += 'width: 100%;';
            html += '}';

            html += '.pwr-rdg-sublist thead th {';
            html += 'background: #eef2f5;';
            html += 'border-bottom: 1px solid #c3c3c3;';
            html += 'border-right: 1px solid #dcdcdc;';
            html += 'color: #4a4a4a;';
            html += 'font-weight: bold;';
            html += 'text-align: left;';
            html += 'padding: 5px 8px;';
            html += 'white-space: nowrap;';
            html += '}';

            html += '.pwr-rdg-sublist thead th:last-child {';
            html += 'border-right: none;';
            html += '}';

            html += '.pwr-rdg-sublist tbody td {';
            html += 'padding: 4px 8px;';
            html += 'border-bottom: 1px solid #e5e5e5;';
            html += 'border-right: 1px solid #f0f0f0;';
            html += '}';

            html += '.pwr-rdg-sublist tbody td:last-child {';
            html += 'border-right: none;';
            html += '}';

            html += '.pwr-rdg-sublist tbody tr:nth-child(even) {';
            html += 'background: #f8f9fb;';
            html += '}';

            html += '.pwr-rdg-sublist tbody tr:hover {';
            html += 'background: #eaf3fb;';
            html += '}';

            html += '.pwr-rdg-sublist tbody tr:last-child td {';
            html += 'border-bottom: none;';
            html += '}';

            html += '.pwr-rdg-empty, .pwr-rdg-error {';
            html += 'text-align: center;';
            html += 'padding: 8px;';
            html += '}';

            html += '.pwr-rdg-empty {';
            html += 'color: #888;';
            html += '}';

            html += '.pwr-rdg-error {';
            html += 'color: #c0392b;';
            html += '}';

            html += '</style>';

            // html += '<div style="overflow-x:auto;">';
            html += '<div style="width: 340%; margin:0; padding:0; overflow-x:auto;">';
            html += '<table class="pwr-rdg-sublist">';
            html += '<thead><tr>';
            html += '<th>Internal ID</th>';
            html += '<th>Reading ID</th>';
            html += '<th>Meter</th>';
            html += '<th>Reading Date</th>';
            html += '<th>Created</th>';
            html += '</tr></thead>';
            html += '<tbody>';

            if (isError) {

                html += '<tr>';
                html += '<td colspan="4" class="pwr-rdg-error">';
                html += 'Error loading power readings';
                html += '</td>';
                html += '</tr>';

            } else if (!data.length) {

                html += '<tr>';
                html += '<td colspan="4" class="pwr-rdg-empty">';
                html += 'No Records Found';
                html += '</td>';
                html += '</tr>';

            } else {

                data.forEach(function (row) {

                    html += '<tr>';
                    html += '<td>' + escapeHtml(row.internalid) + '</td>';
                    html += '<td>' + escapeHtml(row.readingid) + '</td>';
                    html += '<td>' + escapeHtml(row.meter) + '</td>';
                    html += '<td>' + escapeHtml(row.reading_date) + '</td>';
                    html += '<td>' + escapeHtml(row.created) + '</td>';
                    html += '</tr>';

                });
            }

            html += '</tbody>';
            html += '</table>';
            html += '</div>';

            return html;
        }

        function escapeHtml(value) {

            if (value === null || value === undefined) {
                return '';
            }

            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        const USAGE_CALC = {

            getFields: function () {
                return {
                    POWER_METER: 'custrecord_twc_pwr_rdg_pwr_mtr',
                    READING_DATE: 'custrecord_twc_pwr_rdg_date',
                    DAY_READING: 'custrecord_twc_pwr_rdg_day',
                    DAY_WRAP: 'custrecord_twc_pwr_rdg_day_meter_wrap',
                    NIGHT_READING: 'custrecord_twc_pwr_rdg_night',
                    NIGHT_WRAP: 'custrecord_twc_pwr_rdg_night_meter_wrap',
                    PEAK_READING: 'custrecord_twc_pwr_rdg_peak',
                    PEAK_WRAP: 'custrecord_twc_pwr_rdg_peak_meter_wrap',
                    ACTUAL_LOAD: 'custrecord_twc_pwr_rdg_actual_rdg_amps',
                    METER_MULTIPLIER: 'custrecord_twc_pwr_rdg_meter_multiplier',
                    DAYS_SINCE_LAST: 'custrecord_twc_pwr_rdg_day_since_last_rd',
                    DAY_USAGE: 'custrecord_twc_pwr_rdg_day_unit_usage',
                    NIGHT_USAGE: 'custrecord_twc_pwr_rdg_night_unit_usage',
                    PEAK_USAGE: 'custrecord_twc_pwr_rdg_peak_unit_usage',
                    KWH_READING: 'custrecord_twc_pwr_rdg_kwh_usage',
                    KWH_AMP_CHECK: 'custrecord_twc_pwr_rdg_amp_check_usage',
                    SUPPLIER_INFORMED : 'custrecord_twc_pwr_rdg_supp_inf'
                };
            },

            usageCalculations: function (powerReadRec) {
                try {
                    var fields = this.getFields();
                    var pwrRec = record.load({
                        type: powerReadRec.type,
                        id: powerReadRec.id,
                        isDynamic: false,
                    })
                    var pwrMeter = powerReadRec.getValue({ fieldId: fields.POWER_METER });
                    if (!pwrMeter) return;

                    var previousReading = this.getPreviousReading(pwrMeter, powerReadRec, fields);
                    log.debug("previousReading..", previousReading)
                    if (!previousReading) return;


                    var daysSinceLastReading = this.daysSinceLastReading(powerReadRec, previousReading.previous_reading_date, fields)
                    var dayUnitsUsage = this.dayUnitsUsage(powerReadRec, previousReading, fields)
                    var nightUnitsUsage = this.nightUnitsUsage(powerReadRec, previousReading, fields)
                    var peakUnitsUsage = this.peakUnitsUsage(powerReadRec, previousReading, fields)
                    var kWhUsageReading = this.kWhUsageReading(powerReadRec, daysSinceLastReading, dayUnitsUsage, nightUnitsUsage, peakUnitsUsage, fields)
                    var kWhUsageAmpCheck = this.kWhUsageAmpCheck(powerReadRec, fields)



                    log.debug("daysSinceLastReading", daysSinceLastReading)
                    log.debug("dayUnitsUsage", dayUnitsUsage)
                    log.debug("nightUnitsUsage", nightUnitsUsage)
                    log.debug("peakUnitsUsage", peakUnitsUsage)
                    log.debug("kWhUsageReading", kWhUsageReading)
                    log.debug("kWhUsageAmpCheck", kWhUsageAmpCheck)

                    if (daysSinceLastReading) pwrRec.setValue({ "fieldId": fields.DAYS_SINCE_LAST, value: parseInt(daysSinceLastReading) })
                    if (dayUnitsUsage) pwrRec.setValue({ "fieldId": fields.DAY_USAGE, value: parseInt(dayUnitsUsage) })
                    if (nightUnitsUsage) pwrRec.setValue({ "fieldId": fields.NIGHT_USAGE, value: parseInt(nightUnitsUsage) })
                    if (peakUnitsUsage) pwrRec.setValue({ "fieldId": fields.PEAK_USAGE, value: parseInt(peakUnitsUsage) })
                    if (kWhUsageReading) pwrRec.setValue({ "fieldId": fields.KWH_READING, value: parseInt(kWhUsageReading) })
                    if (kWhUsageAmpCheck) pwrRec.setValue({ "fieldId": fields.KWH_AMP_CHECK, value: parseInt(kWhUsageAmpCheck) })

                    var savedId = pwrRec.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: false
                    });
                    
                } catch (err) {
                    log.error("error@usageCalculations", err);
                }
            },

            getPreviousReading: function (pwrMeter, powerReadRec, fields) {
                var sql = `SELECT id AS recId,
                            ${fields.READING_DATE} AS previous_reading_date,
                            ${fields.DAY_READING} AS day_reading,
                            ${fields.DAY_WRAP} AS day_meter_wrap,
                            ${fields.NIGHT_READING} AS night_reading,
                            ${fields.NIGHT_WRAP} AS night_meter_wrap,
                            ${fields.PEAK_READING} AS peak_reading,
                            ${fields.PEAK_WRAP} AS peak_meter_wrap,
                            ${fields.ACTUAL_LOAD} AS actual_load_reading
                            FROM customrecord_twc_pwr_rdg
                            WHERE ${fields.POWER_METER} = ${pwrMeter}
                            AND id != ${powerReadRec.id}
                            AND isinactive = 'F'
                            ORDER BY id DESC`;

                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                return results.length ? results[0] : null;
            },

            daysSinceLastReading: function (powerReadRec, prevRecReadingDate, fields) {

                try {

                    var readingDate = powerReadRec.getText({
                        fieldId: fields.READING_DATE
                    });

                    log.debug("readingDate", readingDate);
                    log.debug("prevRecReadingDate", prevRecReadingDate);

                    if (!readingDate || !prevRecReadingDate) {
                        return null;
                    }

                    var currentDate = format.parse({
                        value: readingDate,
                        type: format.Type.DATE
                    });

                    var previousDate = format.parse({
                        value: prevRecReadingDate,
                        type: format.Type.DATE
                    });

                    var diff = currentDate.getTime() - previousDate.getTime();

                    var days = Math.round(diff / (24 * 60 * 60 * 1000));

                    log.debug("currentDate", currentDate);
                    log.debug("previousDate", previousDate);
                    log.debug("daysSinceLastReading", days);

                    return days;

                } catch (err) {

                    log.error("error@daysSinceLastReading", err);
                    return null;
                }
            },
            dayUnitsUsage: function (powerReadRec, previousReading, fields) {
                try {
                    var current = powerReadRec.getValue({ fieldId: fields.DAY_READING });
                    var meterWrap = powerReadRec.getValue({ fieldId: fields.DAY_WRAP });

                    var previous = previousReading.day_reading;
                    log.debug("current", current)
                    log.debug("previous", previous)

                    if (current === '' || current === null || previous === '' || previous === null) return null;
                    return Number(current) - Number(previous) + Number(meterWrap || 0);
                } catch (err) {
                    log.error("error@dayUnitsUsage", err);
                    return null;
                }
            },

            nightUnitsUsage: function (powerReadRec, previousReading, fields) {
                try {
                    var current = powerReadRec.getValue({ fieldId: fields.NIGHT_READING });
                    var previous = previousReading.night_reading;
                    var nightWrap = powerReadRec.getValue({ fieldId: fields.NIGHT_WRAP });

                    if (current === '' || current === null || previous === '' || previous === null) return null;
                    return Number(current) - Number(previous) + Number(nightWrap || 0);
                } catch (err) {
                    log.error("error@nightUnitsUsage", err);
                    return null;
                }
            },

            peakUnitsUsage: function (powerReadRec, previousReading, fields) {
                try {
                    var current = powerReadRec.getValue({ fieldId: fields.PEAK_READING });
                    var previous = previousReading.peak_reading;
                    var peakWrap = powerReadRec.getValue({ fieldId: fields.PEAK_WRAP });

                    if (current === '' || current === null || previous === '' || previous === null) return null;
                    return Number(current) - Number(previous) + Number(peakWrap || 0);
                } catch (err) {
                    log.error("error@peakUnitsUsage", err);
                    return null;
                }
            },

            kWhUsageReading: function (powerReadRec, daysSinceLastReading, dayUnitsUsage, nightUnitsUsage, peakUnitsUsage, fields) {
                try {
                    var multiplier = powerReadRec.getText({ fieldId: fields.METER_MULTIPLIER });
                    if (daysSinceLastReading === null || dayUnitsUsage === null || nightUnitsUsage === null || peakUnitsUsage === null || !multiplier || !daysSinceLastReading) return null;
                    return ((Number(dayUnitsUsage) + Number(nightUnitsUsage) + Number(peakUnitsUsage)) * Number(multiplier)) / (Number(daysSinceLastReading) * 24);
                } catch (err) {
                    log.error("error@kWhUsageReading", err);
                    return null;
                }
            },

            kWhUsageAmpCheck: function (powerReadRec, fields) {
                try {
                    var actualLoadReading = powerReadRec.getValue({ fieldId: fields.ACTUAL_LOAD });
                    if (actualLoadReading === '' || actualLoadReading === null) return null;
                    return Number(actualLoadReading) * 230 / 1000;
                } catch (err) {
                    log.error("error@kWhUsageAmpCheck", err);
                    return null;
                }
            }
        }

        function updateMeterRecord(powerReadRec) {
            try {
                var fields = USAGE_CALC.getFields();

                var powerMeterFieldMapping = {
                    custrecord_twc_pwr_mtr_last_read_date: fields.READING_DATE,
                    custrecord_twc_pwr_mtr_last_day_read: fields.DAY_READING,
                    custrecord_twc_pwr_mtr_last_night_read: fields.NIGHT_READING,
                    custrecord_twc_pwr_mtr_last_peak_read: fields.PEAK_READING,
                    custrecord_twc_pwr_mtr_last_usage: fields.KWH_READING,
                    custrecord_twc_pwr_mtr_last_usage_amp: fields.KWH_AMP_CHECK,
                    custrecord_twc_pwr_mtr_supplier_informed: fields.SUPPLIER_INFORMED
                };

                var powerMeterRec = record.load({
                    type: 'customrecordcustomrecord_twc_pwr_mtr',
                    id: powerReadRec.getValue({ fieldId: fields.POWER_METER }),
                    isDynamic: false
                });

                Object.keys(powerMeterFieldMapping).forEach(function (powerMeterField) {
                    powerMeterRec.setValue({
                        fieldId: powerMeterField,
                        value: powerReadRec.getValue({
                            fieldId: powerMeterFieldMapping[powerMeterField]
                        })
                    });
                });

                powerMeterRec.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
            }
            catch (err) {
                log.error("error@updateMeterRecord", err)
            }
        }


        return {
            beforeLoad: beforeLoad,
            afterSubmit: afterSubmit
        };

    });