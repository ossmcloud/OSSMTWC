/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/redirect', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', './data/oTWC_infrastructure.js'],
    (runtime, serverWidget, redirect, coreSQL, core, oui, twcInfra) => {

        const isUserInterface = () =>
            runtime.executionContext === runtime.ContextType.USER_INTERFACE;

        const isCreate = (type) => type === 'create';

        function getInfrastructureFormMap() {

            const infraToForm = {};
            const formToInfra = {};
            const validForms = new Set();
            const rows = coreSQL.run(`
                SELECT id, custrecord_twc_infra_type_form FROM customrecord_twc_infra_type
                WHERE isinactive = 'F' AND custrecord_twc_infra_type_form IS NOT NULL
            `);

            rows.forEach(({ id, custrecord_twc_infra_type_form }) => {
                const infraId = Number(id);
                const formId = Number(custrecord_twc_infra_type_form);
                infraToForm[infraId] = formId;
                formToInfra[formId] = infraId;
                validForms.add(formId);
            });
            return { infraToForm, formToInfra, validForms };
        }

        function hideAllInfrastructureFields(form) {
            const fieldsToHide = new Set(['name', 'isinactive', ...Object.values(twcInfra.Fields)]);
            for (const fieldId of fieldsToHide) {
                form.f.getField({ id: fieldId })?.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
            }
        }

        function handleCustomForm(rec, customFormId, formMap) {

            const infraType = formMap.formToInfra[Number(customFormId)]
            if(!infraType) return;
            rec.setValue({ fieldId: twcInfra.Fields.INFRASTRUCTURE_TYPE, value: infraType });
        }

        function enforceCorrectForm(context, rec, formMap) {
            const request = context.request;
            if (!request) return;
            const infraType = Number(rec.getValue({ fieldId: twcInfra.Fields.INFRASTRUCTURE_TYPE }));
            if (!infraType) return;
            const expectedFormId = formMap.infraToForm[infraType];
            if (!expectedFormId) return;

            const currentCf = Number(request.parameters.cf);
            if (currentCf === expectedFormId) return;

            const params = request.parameters;
            let query = '';
            for (const key in params) {
                if (key === 'cf') continue; // overwrite cf
                query += (query ? '&' : '') + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }
            // Add correct cf
            query += (query ? '&' : '') + 'cf=' + expectedFormId;
            const baseUrl = request.url.split('?')[0];
            const redirectUrl = baseUrl + '?' + query;
            redirect.redirect({ url: redirectUrl });
        }

        function beforeLoad(context) {
            try {
                if (!isUserInterface()) return;
                const { type, newRecord: rec, form: nsForm, request } = context;
                const form = oui.get(nsForm);
                const formMap = getInfrastructureFormMap();
                const customFormId = Number(rec.getValue({ fieldId: 'customform' }));
                // Make Infrastructure Type Field Inline
                const fieldObj = form.f.getField({ id: twcInfra.Fields.INFRASTRUCTURE_TYPE });
                fieldObj?.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                // CREATE
                if (type === 'create') {
                    const isValidForm = formMap.validForms.has(customFormId);
                    core.logDebug('UE', `create | formValid=${isValidForm}`);
                    if (!isValidForm) {
                        hideAllInfrastructureFields(form);
                        return;
                    }
                    handleCustomForm(rec, customFormId ,formMap);
                    return;
                }
                // EDIT / VIEW
                if (type === 'edit' || type === 'view') {
                    core.logDebug('UE', `${type} mode`);
                    enforceCorrectForm(context, rec, formMap);
                }
            } catch (e) {
                core.logDebug('UE ERROR', e.message);
            }
        }

        return { beforeLoad };
    });
