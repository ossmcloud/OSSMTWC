/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['SuiteBundles/Bundle 548734/O/core.sql.js', './O/oTWC_dialogEx.js', 'N/ui/dialog' , 'N/currentRecord'], (coreSQL, dialog, dlg, currentRecord) => {

    const pageInit = (context) => {

        const rec = context.currentRecord;

        rec.getField({
            fieldId: 'custrecord_twc_pwr_rdg_pwr_supply' // replace with your field
        }).isDisabled = true;

        const siteId = rec.getValue({
            fieldId: 'custrecord_twc_pwr_rdg_site'
        });

        const powerSupply = rec.getValue({
            fieldId: 'custrecord_twc_pwr_rdg_pwr_supply'
        });

        if (siteId && !powerSupply) {

            const options = getPowerSupplyOptions(siteId);

            if (!options.length) {

                dlg.alert({
                    title: 'No Power Supply Found',
                    message: 'No Power Supply records are associated with this Site.'
                });

            } else if (options.length === 1) {

                rec.setValue({
                    fieldId: 'custrecord_twc_pwr_rdg_pwr_supply',
                    value: options[0].id
                });

            } else {

                showPowerSupplyModal(rec, options);

            }
        }
    };


    const fieldChanged = async (context) => {

        try {

            if (context.fieldId !== 'custrecord_twc_pwr_rdg_site')
                return;

            const rec = context.currentRecord;

            const siteId = rec.getValue({
                fieldId: 'custrecord_twc_pwr_rdg_site'
            });

            if (!siteId) {

                rec.setValue({
                    fieldId: 'custrecord_twc_pwr_rdg_pwr_supply',
                    value: ''
                });

                return;
            }

            const options = getPowerSupplyOptions(siteId);

            if (!options.length) {

                rec.setValue({
                    fieldId: 'custrecord_twc_pwr_rdg_pwr_supply',
                    value: ''
                });

                await dlg.alert({
                    title: 'No Power Supply Found',
                    message: 'No Power Supply records are associated with this Site.'
                });

                return;
            }

            if (options.length === 1) {

                rec.setValue({
                    fieldId: 'custrecord_twc_pwr_rdg_pwr_supply',
                    value: options[0].id
                });

                return;
            }

            showPowerSupplyModal(rec, options);

        } catch (e) {

            console.error(e);

        }

    };

    const openPowerSupplySelector = async () => {

        try {

            const rec = currentRecord.get();

            const siteId = rec.getValue({
                fieldId: 'custrecord_twc_pwr_rdg_site'
            });

            if (!siteId) {

                return await dlg.alert({
                    title: 'Alert',
                    message: 'Please select a Site first.'
                });

            }

            const options = getPowerSupplyOptions(siteId);

            if (!options.length) {

                return await dlg.alert({
                    title: 'No Power Supply Found',
                    message: 'No Power Supply records are associated with this Site.'
                });

            }

            if (options.length === 1) {

                rec.setValue({
                    fieldId: 'custrecord_twc_pwr_rdg_pwr_supply',
                    value: options[0].id
                });

                return;
            }

            showPowerSupplyModal(rec, options);

        } catch (e) {

            console.error(e);

        }

    };

    const getPowerSupplyOptions = (siteId) => {

    const options = [];

    const res = coreSQL.run(
        `SELECT id, name FROM customrecord_twc_pwr_rdg WHERE custrecord_twc_pwr_rdg_site = ${siteId}`,
    )
    console.log('Power Supply Options:', res);

    return res;
};

    const showPowerSupplyModal = (rec, infraOptions) => {

        document.getElementById('twcGenBackupModalOverlay')?.remove();

        const currentValue = rec.getValue({ fieldId: 'custrecord_twc_pwr_rdg_pwr_supply' });

        const optionsHtml = infraOptions.map(o => `<option value="${o.id}">${o.name}</option>`).join('');

        const modalHtml = `
        <div id="twcGenBackupModalOverlay" style="position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);">
        <div style="width:450px;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.12);font-family:Arial;overflow:hidden;animation:twcFade .18s ease-out;">
        <div style="padding:18px 22px;border-bottom:1px solid #eef2f7;display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-size:18px;font-weight:600;color:#111827;">Power Supply</div><div style="font-size:13px;color:#6b7280;">Select a backup generator</div></div>
        <div id="twcCloseModal" style="cursor:pointer;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#6b7280;border-radius:50%;">×</div>
        </div>

        <div style="padding:24px;">
        <div style="margin-bottom:14px;color:#4b5563;font-size:14px;">Multiple generator backups are available for this site.</div>

        <select id="genBackupSelect" style="width:100%;padding:12px;border:1px solid #d1d5db;border-radius:8px;margin-bottom:22px;">
        <option value="">Select Power Supply</option>${optionsHtml}
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
            if (!val) return alert('Please select a Power Supply.');
            rec.setValue({ fieldId: 'custrecord_twc_pwr_rdg_pwr_supply', value: val });
            close();
        };

        setTimeout(() => dropdown.focus(), 100);
    };

//     const showPowerSupplyModal = (rec, infraOptions) => {

//     const currentValue = rec.getValue({
//         fieldId: 'custrecord_twc_pwr_rdg_pwr_supply'
//     });

//     const content = jQuery(`
//         <div style="padding:15px;">
//             <label style="display:block;margin-bottom:8px;">
//                 Select Power Supply
//             </label>

//             <select id="twcPowerSupply" class="twc" style="width:100%;">
//                 <option value="">Select Power Supply</option>
//                 ${infraOptions.map(o =>
//                     `<option value="${o.id}">${o.name}</option>`
//                 ).join('')}
//             </select>
//         </div>
//     `);

//     if (currentValue) {
//         content.find('#twcPowerSupply').val(currentValue);
//     }

//     dialog.open({

//         title: 'Power Supply',
//         content: content,
//         size: {
//             width: '450px',
//             height: '220px'
//         },
//         ok: function () {
//             const val = content.find('#twcPowerSupply').val();
//             if (!val) {
//                 dialog.message({ title: 'Validation', message: 'Please select a Power Supply.' });
//                 return false;
//             }
//             rec.setValue({
//                 fieldId: 'custrecord_twc_pwr_rdg_pwr_supply',
//                 value: val
//             });

//             return true;
//         }

//     });

// };

    return { fieldChanged, openPowerSupplySelector, pageInit };

});