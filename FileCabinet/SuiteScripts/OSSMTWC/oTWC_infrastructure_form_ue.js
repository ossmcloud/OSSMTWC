/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/redirect', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', './data/oTWC_infrastructure.js'],
    (runtime, serverWidget, redirect, core, oui, twcInfra) => {

        const VALID_FORMS = new Set([260, 263, 264, 265]);

        const isUserInterface = () =>
            runtime.executionContext === runtime.ContextType.USER_INTERFACE;

        const isCreate = (type) => type === 'create';

        function hideAllInfrastructureFields(form) {
            const fieldsToHide = new Set(['name', 'isinactive', ...Object.values(twcInfra.Fields)]);
            for (const fieldId of fieldsToHide) {
                form.f.getField({ id: fieldId })?.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
            }
        }

        function handleCustomForm(rec, customFormId) {

            const infraTypeId = twcInfra.Fields.INFRASTRUCTURE_TYPE;
            const formToInfraMap = { 260: 3, 263: 1, 264: 2, 265: 4 };
            const infraValue = formToInfraMap[Number(customFormId)];
            if (!infraValue) return;
            rec.setValue({
                fieldId: infraTypeId,
                value: infraValue
            });
        }

        function enforceCorrectForm(context, rec) {
            const request = context.request;
            if (!request) return;
            const infraType = Number(rec.getValue({ fieldId: twcInfra.Fields.INFRASTRUCTURE_TYPE }));
            if (!infraType) return;
            // Map infra type → form
            const FORM_MAP = { 3: 260, 1: 263, 2: 264, 4: 265 };
            const expectedFormId = FORM_MAP[infraType];
            if (!expectedFormId) return;

            const currentCf = Number(request.parameters.cf);
            if (currentCf === expectedFormId) return;

            const params = request.parameters;
            let query = '';
            for (const key in params) {
                if (key === 'cf') continue; // overwrite cf
                query += (query ? '&' : '') +
                    encodeURIComponent(key) + '=' +
                    encodeURIComponent(params[key]);
            }
            // Add correct cf
            query += (query ? '&' : '') + 'cf=' + expectedFormId;
            const baseUrl = request.url.split('?')[0];
            const redirectUrl = baseUrl + '?' + query;
            redirect.redirect({
                url: redirectUrl
            });
        }

        function beforeLoad(context) {
            try {
                if (!isUserInterface()) return;
                const { type, newRecord: rec, form: nsForm, request } = context;
                const form = oui.get(nsForm);
                const customFormId = Number(rec.getValue({ fieldId: 'customform' }));
                // Make Infrastructure Type Field Inline
                const fieldObj = form.f.getField({ id: twcInfra.Fields.INFRASTRUCTURE_TYPE });
                fieldObj?.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                // CREATE
                if (type === 'create') {
                    const isValidForm = VALID_FORMS.has(customFormId);
                    core.logDebug('UE', `create | formValid=${isValidForm}`);
                    if (!isValidForm) {
                        hideAllInfrastructureFields(form);
                        return;
                    }
                    handleCustomForm(rec, customFormId);
                    return;
                }
                // EDIT / VIEW
                if (type === 'edit' || type === 'view') {
                    core.logDebug('UE', `${type} mode`);
                    enforceCorrectForm(context, rec);
                }
            } catch (e) {
                core.logDebug('UE ERROR', e.message);
            }
        }

        return { beforeLoad };
    });
