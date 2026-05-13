/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/search', 'N/ui/dialog', 'N/currentRecord'], (search, dialog, currentRecord) => {

    const pageInit = (context) => {
        const rec = context.currentRecord;
        rec.getField({ fieldId: 'custrecord_twc_pwr_sply_gen_bakup' }).isDisabled = true;
    };


    const fieldChanged = async (context) => {
        try {
            const rec = context.currentRecord;

            if (context.fieldId !== 'custrecord_twc_pwr_sply_site') return;

            const siteId = rec.getValue({ fieldId: 'custrecord_twc_pwr_sply_site' });

            if (!siteId) {
                rec.setValue({ fieldId: 'custrecord_twc_pwr_sply_gen_bakup', value: '' });
                return;
            }

            const infraOptions = getGeneratorBackupOptions(siteId);

            if (!infraOptions.length) {
                rec.setValue({ fieldId: 'custrecord_twc_pwr_sply_gen_bakup', value: '' });
                await dialog.alert({ title: 'No Generator Backup Found', message: 'No Generator Backup records are associated with this Site.' });
                return;
            }

            if (infraOptions.length === 1) {
                rec.setValue({ fieldId: 'custrecord_twc_pwr_sply_gen_bakup', value: infraOptions[0].id });
                return;
            }

            showGeneratorBackupModal(rec, infraOptions);

        } catch (e) { console.error('fieldChanged Error', e); }
    };

    const openGeneratorBackupSelector = async () => {
        try {
            const rec = currentRecord.get();
            const siteId = rec.getValue({ fieldId: 'custrecord_twc_pwr_sply_site' });

            if (!siteId) return await dialog.alert({ title: 'Alert', message: 'Please select a Site first.' });

            const infraOptions = getGeneratorBackupOptions(siteId);

            if (!infraOptions.length) return await dialog.alert({ title: 'Alert', message: 'No Generator Backup records found.' });

            if (infraOptions.length === 1) return rec.setValue({ fieldId: 'custrecord_twc_pwr_sply_gen_bakup', value: infraOptions[0].id });

            showGeneratorBackupModal(rec, infraOptions);

        } catch (e) { console.error('openGeneratorBackupSelector Error', e); }
    };

    const getGeneratorBackupOptions = (siteId) => {
        let infraOptions = [];

        search.create({
            type: 'customrecord_twc_gen_svc',
            filters: [['custrecord_twc_gen_svc_site', 'anyof', siteId]],
            columns: ['custrecord_twc_gen_svc_generator']
        }).run().each(r => {

            const id = r.getValue({ name: 'custrecord_twc_gen_svc_generator' });
            const text = r.getText({ name: 'custrecord_twc_gen_svc_generator' });

            if (id && !infraOptions.find(x => x.id === id)) infraOptions.push({ id, text });

            return true;
        });

        return infraOptions;
    };

    const showGeneratorBackupModal = (rec, infraOptions) => {

        document.getElementById('twcGenBackupModalOverlay')?.remove();

        const currentValue = rec.getValue({ fieldId: 'custrecord_twc_pwr_sply_gen_bakup' });

        const optionsHtml = infraOptions.map(o => `<option value="${o.id}">${o.text}</option>`).join('');

        const modalHtml = `
        <div id="twcGenBackupModalOverlay" style="position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);">
        <div style="width:450px;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.12);font-family:Arial;overflow:hidden;animation:twcFade .18s ease-out;">
        <div style="padding:18px 22px;border-bottom:1px solid #eef2f7;display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-size:18px;font-weight:600;color:#111827;">Generator Backup</div><div style="font-size:13px;color:#6b7280;">Select a backup generator</div></div>
        <div id="twcCloseModal" style="cursor:pointer;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#6b7280;border-radius:50%;">×</div>
        </div>

        <div style="padding:24px;">
        <div style="margin-bottom:14px;color:#4b5563;font-size:14px;">Multiple generator backups are available for this site.</div>

        <select id="genBackupSelect" style="width:100%;padding:12px;border:1px solid #d1d5db;border-radius:8px;margin-bottom:22px;">
        <option value="">Select Generator Backup</option>${optionsHtml}
        </select>

        <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button id="twcCancelBtn" style="padding:10px 18px;border:1px solid #d1d5db;background:#fff;border-radius:8px;">Cancel</button>
        <button id="twcSelectBtn" style="padding:10px 20px;background:#111827;color:#fff;border-radius:8px;border:none;">Select</button>
        </div>
        </div></div></div>

        <style>@keyframes twcFade{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}</style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const overlay = document.getElementById('twcGenBackupModalOverlay');
        const dropdown = document.getElementById('genBackupSelect');

        if (currentValue) dropdown.value = currentValue;

        const close = () => overlay?.remove();

        document.getElementById('twcCloseModal').onclick = close;
        document.getElementById('twcCancelBtn').onclick = close;

        overlay.onclick = e => e.target.id === 'twcGenBackupModalOverlay' && close();

        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });

        document.getElementById('twcSelectBtn').onclick = () => {
            const val = dropdown.value;
            if (!val) return alert('Please select a Generator Backup.');
            rec.setValue({ fieldId: 'custrecord_twc_pwr_sply_gen_bakup', value: val });
            close();
        };

        setTimeout(() => dropdown.focus(), 100);
    };

    return { fieldChanged, openGeneratorBackupSelector, pageInit };

});