/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', 'N/ui/serverWidget', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'N/file', './data/oTWC_file.js'],
    (runtime, core, oui, recu, ui, coreSql, file, twcFiles) => {

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);

                if (context.newRecord.id) {
                    attachTwcFiles(form, context.newRecord)
                }

            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }


        function attachTwcFiles(form, rec) {
            try {
                let fileList = form.f.addSublist({
                    id: 'custpage_twc_files',
                    type: ui.SublistType.LIST,
                    label: 'Twc Files',
                    tab: 'media'
                });

                let line = 0;
                let columnsCreated = false;

                let getLabel = key =>
                    key.replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());

                let getFieldType = key => {
                    if (key === 'file') return ui.FieldType.URL;
                    if (key === 'file_description') return ui.FieldType.TEXTAREA;
                    return ui.FieldType.TEXT;
                };

                coreSql.each(`
                SELECT
                    ${twcFiles.Fields.NAME},
                    BUILTIN.DF(${twcFiles.Fields.R_TYPE}) AS file_type,
                    BUILTIN.DF(${twcFiles.Fields.STATUS}) AS status,
                    ${twcFiles.Fields.DESCRIPTION} AS file_description,
                    BUILTIN.DF(${twcFiles.Fields.UPLOADED_BY}) AS uploaded_by,
                    BUILTIN.DF(${twcFiles.Fields.CREATED}) AS created_date,
                    BUILTIN.DF(${twcFiles.Fields.OWNER}) AS owner,
                    BUILTIN.DF(${twcFiles.Fields.MODIFIED}) AS last_modified_date,
                    BUILTIN.DF(${twcFiles.Fields.MODIFIED_BY}) AS last_modified_by,
                    ${twcFiles.Fields.FILE} AS file
                    FROM ${twcFiles.Type}
                    WHERE ${twcFiles.Fields.RECORD_TYPE} = '${rec.type}'
                    AND ${twcFiles.Fields.RECORD_ID} = ${rec.id}
                    AND isinactive = 'F'
              `, row => {
                    if (!columnsCreated) {
                        Object.keys(row).forEach(key => {
                            let field = fileList.addField({
                                id: `custpage_${key.toLowerCase()}`,
                                type: getFieldType(key),
                                label: getLabel(key)
                            });

                            if (key === 'file') {
                                field.linkText = 'View File';
                            }
                        });
                        columnsCreated = true;
                    }

                    Object.entries(row).forEach(([key, value]) => {

                        if (core.utils.isEmpty(value)) return;
                        try {
                            if (key === 'file') {
                                value = file.load({ id: value }).url;
                            }
                            fileList.setSublistValue({
                                id: `custpage_${key.toLowerCase()}`,
                                line,
                                value: String(value)
                            });

                        } catch (error) {
                            core.logDebug(`Error setting ${key}`, error);
                        }
                    });

                    line++;
                });
            } catch (error) {
                core.logDebug('ERROR in Attaching files', error.message)
            }
        }

        return {
            beforeLoad: beforeLoad,

        }
    });
