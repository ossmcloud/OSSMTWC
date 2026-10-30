/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 *
 */
define(['N/url', 'N/currentRecord'], (url, currentRec) => {

    var SOURCE_FIELD_ID = 'custrecord_twc_pwr_rdg_pwr_mtr';

    function pageInit(context) {
        try {
            console.log('Mode:', context.mode);

            document.addEventListener('click', function (event) {
                if (event.target && event.target.classList.contains('pwr-reading-select')) {
                    document.querySelectorAll('.pwr-reading-select').forEach(function (checkbox) {
                        if (checkbox !== event.target) {
                            checkbox.checked = false;
                        }
                    });
                }
            });
        }
        catch (err) {
            console.log("error@pageInit", err)
        }

    }

    async function fieldChanged(context) {

        if (context.fieldId !== SOURCE_FIELD_ID) return;

        const rec = context.currentRecord;

        const meterId = rec.getValue({ fieldId: SOURCE_FIELD_ID });

        if (!meterId) {
            renderTable([]);
            return;
        }

        console.log("context.currentRecord.id", context.currentRecord.id)
        const suiteletUrl = url.resolveScript({
            scriptId: 'customscript_otwc_pwr_reading_fun_sl',
            deploymentId: 'customdeploy_otwc_pwr_reading_fun_sl',
            params: { meter: meterId, recId: context.currentRecord.id }
        });

        try {
            const response = await fetch(suiteletUrl);

            if (!response.ok) {
                console.error('Suitelet request failed: ' + response.status);
                renderTable([], true);
                return;
            }

            const data = await response.json();

            renderTable(data);

        } catch (e) {
            console.error(e);
            renderTable([], true);
        }
    }

    function renderTable(data, isError) {



        var target = document.getElementById('powerReadingDiv');
        if (!target) {
            console.error('powerReadingDiv not found on page - add the Inline HTML field to the form.');
            return;
        }
        target.innerHTML = '';

        var html = '';

        html += '<style>';
        html += '.pwr-rdg-sublist { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; border: 1px solid #c3c3c3; border-collapse: collapse; width: 100%; }';
        html += '.pwr-rdg-sublist thead th { background: #eef2f5; border-bottom: 1px solid #c3c3c3; border-right: 1px solid #dcdcdc; color: #4a4a4a; font-weight: bold; text-align: left; padding: 5px 8px; white-space: nowrap; }';
        html += '.pwr-rdg-sublist thead th:last-child { border-right: none; }';
        html += '.pwr-rdg-sublist tbody td { padding: 4px 8px; border-bottom: 1px solid #e5e5e5; border-right: 1px solid #f0f0f0; }';
        html += '.pwr-rdg-sublist tbody td:last-child { border-right: none; }';
        html += '.pwr-rdg-sublist tbody tr:nth-child(even) { background: #f8f9fb; }';
        html += '.pwr-rdg-sublist tbody tr:hover { background: #eaf3fb; }';
        html += '.pwr-rdg-sublist tbody tr:last-child td { border-bottom: none; }';
        html += '.pwr-rdg-sublist .pwr-rdg-empty { text-align: center; color: #888; padding: 8px; }';
        html += '.pwr-rdg-sublist .pwr-rdg-error { text-align: center; color: #c0392b; padding: 8px; }';
        html += '</style>';

        // html += '<div style="width: 340%; margin:0; padding:0; overflow-x:auto;">';
        // html += '<table class="pwr-rdg-sublist">';
        // html += '<thead><tr>';
        // html += '<th>Internal ID</th><th>Reading ID</th><th>Meter</th><th>Reading Date</th><th>Created</th>';
        // html += '</tr></thead><tbody>'
        // ;
        html += '<div style="width:100%; margin:0; padding:0; overflow-x:auto;">';
        html += '<table class="pwr-rdg-sublist" style="width:100%; table-layout:fixed;">';
        html += '<thead><tr>';
        html += '<th style="width:9%; white-space:normal; word-wrap:break-word;">Select to update latest</th>';
        html += '<th style="width:8%;">Internal ID</th>';
        html += '<th style="width:9%;">Reading ID</th>';
        html += '<th style="width:13%;">Meter</th>';
        html += '<th style="width:13%;">Reading Status</th>';
        html += '<th style="width:12%;">Reading Date</th>';
        html += '<th style="width:12%;">Day Reading</th>';
        html += '<th style="width:12%;">Night Reading</th>';
        html += '<th style="width:13%;">Peak Meter Wrap</th>';
        html += '<th style="width:15%;">kWh Usage - Reading</th>';
        html += '</tr></thead>';
        html += '<tbody>';
        if (isError) {
            html += '<tr><td colspan="4" class="pwr-rdg-error">Error loading power readings</td></tr>';
        } else if (!data.length) {
            html += '<tr><td colspan="4" class="pwr-rdg-empty">No Records Found</td></tr>';
        } else {
            data.forEach(function (row) {
                html += '<tr>';
                html += '<td><input type="checkbox" class="pwr-reading-select" value="' + escapeHtml(row.internalid) + '"></td>';
                html += '<td>' + escapeHtml(row.internalid) + '</td>';
                html += '<td>' + escapeHtml(row.readingid) + '</td>';
                html += '<td>' + escapeHtml(row.meter) + '</td>';
                html += '<td>' + escapeHtml(row.status) + '</td>';
                html += '<td>' + escapeHtml(row.reading_date) + '</td>';
                html += '<td>' + escapeHtml(row.day_reading) + '</td>';
                html += '<td>' + escapeHtml(row.night_reading) + '</td>';
                html += '<td>' + escapeHtml(row.peak_mtr_wrap) + '</td>';
                html += '<td>' + escapeHtml(row.kwh_usage) + '</td>';
                html += '</tr>';
            });
        }

        html += '</tbody></table>';
        html += '</div>';
        target.innerHTML = html;
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    async function updateSelectedReadingStatus(meter) {
        var selectedIds = [];

        document.querySelectorAll('.pwr-reading-select:checked').forEach(function (checkbox) {
            selectedIds.push(checkbox.value);
        });
        console.log('selectedIds', selectedIds)
        if (!selectedIds.length) {
            alert('Please select at least one reading.');
            return;
        }

        if (!confirm('Are you sure to update the reading status to Latest ?')) return

        try {
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_otwc_pwr_reading_fun_sl',
                deploymentId: 'customdeploy_otwc_pwr_reading_fun_sl'
            });
            console.log('meter', meter)
            var response = await fetch(suiteletUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateStatus',
                    ids: selectedIds,
                    status: 2,
                    meter: meter
                })
            });

            var result = await response.json();
            console.log('result', result)

            if (!response.ok || !result.success) {
                alert(result.message || 'Failed to update reading statuses.');
                return;
            }

            alert(result.message);
            window.location.reload();

        } catch (e) {
            console.error(e);
            alert('Error updating reading statuses.');
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        updateSelectedReadingStatus: updateSelectedReadingStatus
    };
});