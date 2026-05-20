/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 */
define([], () => {

    const beforeLoad = (context) => {

        try {
            if (context.type !== context.UserEventType.EDIT) return;
            const form = context.form;
            form.clientScriptModulePath = './oTWC_power_supply_cs.js';
            form.addButton({ id: 'custpage_select_gen_backup', label: 'Select Generator Backup', functionName: 'openGeneratorBackupSelector' });

        } catch (e) {
            log.error('beforeLoad Error', e);
        }
    };

    return {
        beforeLoad
    };

});