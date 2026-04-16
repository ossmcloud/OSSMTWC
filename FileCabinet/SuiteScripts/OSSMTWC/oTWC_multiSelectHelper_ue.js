/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    (runtime, core, coreSql, oui, recu) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }
                if (context.type == 'edit' || context.type == 'create') {

                    var form = oui.get(context.form);
                    try {
                        form.pageInitView('OSSMTWC', 'oTWC_multiSelectHelper');
                    } catch (error) {
                        // ignore
                    }
                    form.f.clientScriptModulePath = './oTWC_multiSelectHelper_cs.js';
                    replaceMultiSelects(form, context.newRecord)
                }
            } catch (error) {
                core.logError('BEFORE-LOAD', error.message);
            }
        }

        function replaceMultiSelects(form, record) {
            form.fieldAdd('custpage_ossmsdk_ms_1', 'html', 'INLINEHTML', `
                <style>
                    div.ossm-ms-field {
                        margin-top: 3px;
                        margin-bottom: 11px;
                        padding: 3px;
                        border: 1px solid rgba(230,230,230,1);
                        width: fit-content;
                        max-width: 500px;
                    }
                    span.ossm-ms-value {
                        padding: 3px 7px;
                        border: 1px solid var(--uif-refreshed-color-primary-default);
                        border-radius: 7px;
                        margin: 0px;
                        margin-right: 3px;
                        display: inline-block;
                    }
                    span.ossm-ms-value>span {
                        margin-left: 7px;
                        cursor: pointer;
                        color: red;
                        font-weight: bold;
                    }
                    span.ossm-ms-value-add {
                        padding: 3px 7px;
                        border: 1px solid var(--uif-refreshed-color-primary-default);
                        border-radius: 7px;
                        margin: 0px;
                        margin-right: 3px;
                        display: inline-block;
                        cursor: pointer;
                        color: green;
                        font-weight: bold;
                    }
                    div.ossm-ms-dlg-content {
                        display: table;
                        table-layout: auto;
                        width: 100%;
                    }
                    div.ossm-ms-dlg-content>div {
                        display: table-cell;
                        vertical-align: top;
                    }
                    div.ossm-ms-dlg-content>div>div:first-child {
                        background-color: var(--uif-refreshed-color-primary-default);
                        color: white;
                        padding: 7px;
                        height: 40px;
                        vertical-align: middle;
                        position: sticky;
                        top: 0px;
                    }
                    dialog.ossm-ms-dlg {
                        padding: 0px;
                        border: none;
                        min-width: 70%;
                        min-height: 35vh;
                        outline: 1px solid var(--uif-refreshed-color-primary-default);
                        box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
                        color: black;
                        background-color: white;
                        border-radius: 7px;
                        overflow: hidden;
                    }
                    #ossm-ms-dlg-content {
                        position: absolute;
                        top: 0px;
                        bottom: 47px;
                        width: 100%;
                        overflow: auto;
                        margin: 0px;
                        border: none;
                    }
                    div.ossm-ms-dlg-footer {
                        position: absolute;
                        bottom: 0px;
                        width: 100%;
                        padding: 7px;
                        background-color: var(--uif-refreshed-color-primary-default);
                        color: white;
                        text-align: right;
                        border-bottom-left-radius: 7px;
                        border-bottom-right-radius: 7px;
                    }
                    div.ossm-ms-dlg-footer>input {
                        padding: 7px;
                        cursor: pointer;
                    }
                    div.ossm-ms-dlg-footer>input:hover {
                        background-color: white;
                        color: black
                        
                    }

                    div.ossm-ms-data,
                    div.ossm-ms-data-selected {
                        padding: 7px;
                    }
                    div.ossm-ms-data>span {
                        margin-right: 7px;
                        cursor: pointer;
                        color: green;
                        font-weight: bold;
                    }
                    div.ossm-ms-data-selected>span {
                        margin-right: 7px;
                        cursor: pointer;
                        color: red;
                        font-weight: bold;
                    }
                </style>
            `)


            var fields = getFieldsConfigs(record.type);
            core.array.each(fields, fieldConfig => {
                try {
                    replaceMultiSelect(form, record, fieldConfig);
                } catch (error) {
                    core.logError('replaceMultiSelects', JSON.stringify(fieldConfig));
                    core.logError('replaceMultiSelects', error.message);
                }
            })

        }

        function replaceMultiSelect(form, record, fieldConfig) {

            var custFieldId = fieldConfig.name; //.replace('custrecord_', 'custpage_');
            if (custFieldId.startsWith('custrecord_')) {
                custFieldId = custFieldId.replace('custrecord_', 'custpage_');
            } else {
                custFieldId = `custpage_${custFieldId.substring(custFieldId.indexOf('_'))}`;
            }


            var fieldLabel = form.fieldGet(fieldConfig.name).f.label;
            var fieldValue = record.getValue(fieldConfig.name);

            var dataSource = [];
            if (fieldConfig.sql) {

                var sql = fieldConfig.sql;
                var placeHolders = []; var phStart = sql.indexOf('${');
                while (phStart > 0) {
                    var phEnd = sql.indexOf('}', phStart);
                    placeHolders.push(sql.substring(phStart + 2, phEnd));
                    phStart = sql.indexOf('${', phEnd);
                }
                // core.logDebug('SQL-PLACEHOLDERS', JSON.stringify(placeHolders))
                core.array.each(placeHolders, ph => {
                    sql = sql.replace('${' + ph + '}', record.getValue(ph));
                });

                dataSource = coreSql.runPaged(sql);
            } else {
                dataSource = coreSql.runPaged(`select id, name from ${fieldConfig.source} where isinactive = 'F' order by name`);
            }

            var selectedValues = '<span class="ossm-ms-value-add">+</span>';
            core.array.each(fieldValue, v => {
                var data = dataSource.find(d => { return d.id == v; })
                if (data) {
                    selectedValues += `
                        <span data-id="${v}" class="ossm-ms-value">
                            ${data.name}
                            <span>x</span>
                        </span>
                    `
                }
            })

            var f = null;
            if (fieldConfig.type == 'select') {

                f = form.fieldSelect(custFieldId, fieldLabel);
                if (fieldConfig.allowEmpty) {
                    f.addSelectOption({ value: ' ', text: '&nbsp;' }, fieldValue)
                }
                core.array.each(dataSource, ds => {
                    f.addSelectOption({ value: ds.id, text: ds.name }, fieldValue)
                })


            } else {

                var html = `
                    <div id="${custFieldId}_ms_fix" class="ossm-ms-field-container">
                        <span id="${custFieldId}_fs_lbl_uir_label" class="smallgraytextnolink uir-label " data-nsps-type="field_label">
                            <span id="${custFieldId}_fs_lbl" class="uir-label-span labelSpanEdit smallgraytextnolink" style="" data-nsps-type="label">
                                ${fieldLabel}
                            </span>
                        </span>
                        <div class="ossm-ms-field">
                            ${selectedValues}
                        </div>
                        <data id="${custFieldId}_ms_data" style="display: none;">
                            ${JSON.stringify({ field: fieldConfig.name, dataSource: dataSource })}
                        </data>
                    <div>
                `

                f = form.fieldAdd(custFieldId, 'html', 'INLINEHTML', html)
            }

            if (!f) { return; }

            form.fieldHide(fieldConfig.name);

            form.f.insertField({
                field: f.f,
                isBefore: true,
                nextfield: fieldConfig.name
            });



        }

        function getFieldsConfigs(recordType) {


            var configs = runtime.getCurrentScript().getParameter({ name: 'custscript_otwc_multiselecthelper_ue_p1' });
            if (!configs) { return []; }

            configs = JSON.parse(configs);
            if (!Array.isArray(configs)) {
                configs = [configs];
            }
            return configs;
        }


        function afterSubmit(context) {
            try {

                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }
                if (context.type == 'edit' || context.type == 'create') {

                    var fields = getFieldsConfigs(context.newRecord.type);
                    var submitFields = []; var submitValues = [];
                    core.array.each(fields, fieldConfig => {
                        try {
                            if (fieldConfig.type == 'select' && fieldConfig.name.startsWith('custrecord_')) {
                                var custFieldId = fieldConfig.name.replace('custrecord_', 'custpage_');

                                submitFields.push(fieldConfig.name);
                                submitValues.push(context.newRecord.getValue(custFieldId))

                                core.logDebug('TEMP', context.newRecord.getValue(custFieldId));
                            }
                        } catch (error) {
                            core.logError('updateDropDownField', JSON.stringify(fieldConfig));
                            core.logError('updateDropDownField', error.message);
                        }
                    })

                    if (submitFields.length > 0) {
                        recu.submit(context.newRecord.type, context.newRecord.id, submitFields, submitValues);
                    }

                }

            } catch (error) {
                core.logError('AFTER-SUBMIT', error.message);
            }
        }



        return {
            beforeLoad: beforeLoad,
            afterSubmit: afterSubmit,
        }
    });


