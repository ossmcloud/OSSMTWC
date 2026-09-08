/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 *
 */
define(['N/url'], (url) => {

    var SOURCE_FIELD_ID = 'custrecord_twc_pwr_rdg_pwr_mtr';

    function pageInit(context) {
    console.log('Mode:', context.mode);
    }

    async function fieldChanged(context) {

        if (context.fieldId !== SOURCE_FIELD_ID) return;

        const rec = context.currentRecord;

        const meterId = rec.getValue({ fieldId: SOURCE_FIELD_ID });

        if (!meterId) {
            renderTable([]);
            return;
        }

        const suiteletUrl = url.resolveScript({
            scriptId: 'customscript_otwc_pwr_reading_fun_sl',
            deploymentId: 'customdeploy_otwc_pwr_reading_fun_sl',
            params: { meter: meterId }
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

        var html = '';

        // Inline <style> so this works regardless of what CSS the Inline HTML
        // field allows through. Scoped under .pwr-rdg-sublist to avoid
        // bleeding into the rest of the page.
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

       // html += '<div style="overflow-x:auto;">';
        html += '<div style="width: 340%; margin:0; padding:0; overflow-x:auto;">';
        html += '<table class="pwr-rdg-sublist">';
        html += '<thead><tr>';
        html += '<th>Internal ID</th><th>Reading ID</th><th>Meter</th><th>Created</th>';
        html += '</tr></thead><tbody>';

        if (isError) {
            html += '<tr><td colspan="4" class="pwr-rdg-error">Error loading power readings</td></tr>';
        } else if (!data.length) {
            html += '<tr><td colspan="4" class="pwr-rdg-empty">No Records Found</td></tr>';
        } else {
            data.forEach(function (row) {
                html += '<tr>';
                html += '<td>' + escapeHtml(row.internalid) + '</td>';
                html += '<td>' + escapeHtml(row.readingid) + '</td>';
                html += '<td>' + escapeHtml(row.meter) + '</td>';
                html += '<td>' + escapeHtml(row.created) + '</td>';
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

    return {
        pageInit:pageInit,
        fieldChanged: fieldChanged
    };
});