/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 */
define([], () => {

    const beforeLoad = (context) => {

        try {
            log.debug("Context Type", context.type);
            if (context.type === context.UserEventType.VIEW) return;
            const form = context.form;
            form.clientScriptModulePath = './oTWC_power_reading_cs.js';
            form.addButton({ id: 'custpage_select_pwr_supply', label: 'Select Power Supply', functionName: 'openPowerSupplySelector' });

        } catch (e) {
            log.error('beforeLoad Error', e);
        }
    };

    return {
        beforeLoad
    };

});