/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_srfItem.js', './oTWC_file.js', '../O/controls/oTWC_ui_ctrl.js','./oTWC_planning.js','./oTWC_siteRow.js','./oTWC_powerSupply.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSrfItem, twcFile, twcUI,twcPlan,twcRow,twcPowerSupply) => {

        // @@TODO: need to find a way to make this as handy as possible
        function getDataObject(recordType, callback) {
            if (recordType == twcLock.Type) { return twcLock; }
            if (recordType == twcInfra.Type) { return twcInfra; }
            if (recordType == twcSrfItem.Type) { return twcSrfItem; }
            if (recordType == twcFile.Type) { return twcFile; }
            if (recordType == twcPlan.Type) { return twcPlan; }
            if (recordType == twcRow.Type) { return twcRow; }
            if (recordType == twcPowerSupply.Type) { return twcPowerSupply; }

            throw new Error(`Unrecognised record type: ${recordType}`);
        }

        function getDataFieldInfo(field, fieldName) {
            var f = null;
            if (field.FieldsInfo) {
                for (var fi in field.FieldsInfo) {
                    if (field.FieldsInfo[fi].name == fieldName) {
                        f = field.FieldsInfo[fi];
                        break;
                    }
                }
            }
            return f;
        }

        var _fieldDefinitions = {};
        function getFieldDefinitions(tableName) {
            if (!_fieldDefinitions[tableName]) {
                _fieldDefinitions[tableName] = twcUtils.getFields(tableName);
            }
            return _fieldDefinitions[tableName];
        }

        function formatPanelFields(dataSource, panelFields) {
            if (!dataSource.Type) {
                if (dataSource.type) {
                    dataSource.Type = dataSource.type
                } else {
                    throw new Error('configUIFields :: dataSource.Type cannot be empty');
                }
            }

            if (panelFields.controls) {
                core.array.each(panelFields.controls, control => { formatPanelFields(dataSource, control); })
                return;
            }

            var siteFields = getFieldDefinitions(dataSource.Type);
            if (!panelFields.controls) { panelFields.controls = []; }
            core.array.each(panelFields.fields, field => {
                if (field.type == twcUI.CTRL_TYPE.BUTTON) {
                    panelFields.controls.push(field)
                    return;
                }

                // @@NOTE: this means the field is a sub list
                if (field.fields) {
                    var dataObj = getDataObject(field.recordType || field.id);

                    var columns = [];
                    for (var k in field.fields) {
                        var f = getDataFieldInfo(field, k);

                        var title = field.fields[k]; var link = undefined;
                        if (title.title) {
                            link = title.link || null;
                            title = title.title;
                            
                        }

                        if (f) {
                            columns.push({ id: f.name.toLowerCase(), title: title, link: link })
                            if (f.type == 'select') { columns.push({ id: f.name.toLowerCase() + '_name', title: title, link: link }); }
                        } else {
                            columns.push({ id: k.toLowerCase(), title: title, link: link })
                        }
                    }

                    var control = {
                        label: field.label,
                        type: twcUI.CTRL_TYPE.TABLE,
                        id: field.id,
                        columns: columns,
                        dataSource: dataObj.select({ fields: field.fields, where: field.where, useNames: true }),
                        dataSourceType: field.recordType,
                        showToolbar: true,
                        showEditDelete: true,
                        onColumnInit: (tbl, col) => {
                            // @@NOTE: if we have fxFields the framework would return the field_name (with id) and field_name_name (with BUILTIN.DF value)
                            //         we do not want to show the id
                            if (tbl.data.length > 0) {
                                if (tbl.data[0][`${col.id}_name`] !== undefined) { return false; }
                            }
                        }
                    }

                    panelFields.controls.push(control);
                    return;
                }

                var fieldId = field.id; var dataField = null; var dataFields = null;

                if (field.id.indexOf('.') < 0) {
                    dataFields = getFieldDefinitions(dataSource.Type);

                } else {
                    // @@NOTE: in this case we have the field path (i.e.: foreignKeyFieldOnSiteTable.foreignTableFieldWeWant )
                    // @@REVIEW: we may need to have more than one jump (i.e.: foreignKeyFieldOnSiteTable.foreignKeyFieldOnForeignTable.foreignForeignTableFieldWeWant) the chain may be arbitrary long
                    fieldId = field.id.split('.')[1];
                    var fkField = field.id.split('.')[0];
                    var fkTable = siteFields.find(sf => { return sf.field_id == fkField })?.field_foreign_table;
                    // @@TODO: what ????
                    if (!fkTable) { return; }
                    dataFields = getFieldDefinitions(fkTable);

                }

                dataField = dataFields.find(sf => { return sf.field_id == fieldId });
                // @@TODO: what ????
                if (!dataField) {
                    if (dataSource[fieldId] === undefined) { return; }
                    dataField = { field_type: 'text' };
                }

                // @@NOTE: if we have the name of a foreign table we would have retrieved it using BUILTIN.DF and just appended _name to the field id
                //         so the data-source would have the value as dataSource.[fkFieldName]_name
                if (fieldId == 'name' && field.id.indexOf('.') > 0) { fieldId = `${field.id.split('.')[0]}_name`; }

                var control = {
                    type: field.type || twcUI.nsTypeToCtrlType(dataField.field_type),
                    value: dataSource[fieldId],
                    id: field.id.replaceAll('.', '___') // @@IMPORTANT: the 3 underscore are needed to be compatible with jQuery and we use split('___') to get to the field path again, so do not change or if we do change the split('___') too
                };

                // @@TODO: @@REVIEW: if the dataSource is a loaded object it would have property names determined by the alias
                //                   but the field id could the the netsuite field id in which case we would not have got the vale with dataSource[fieldId]
                //                   so we get the value using the .get method (NOTE: if the .get method is not there this may be a different object)
                if (control.value === undefined && dataSource.get) { control.value = dataSource.get(fieldId); }

                for (var k in field) {
                    if (k == 'type' || k == 'id') { continue; }
                    control[k] = field[k];
                }

                if (dataField.field_type == 'List/Record' || dataField.field_type == 'Multiple Select') {
                    try {
                        if (!control.dataSource) {
                            if (dataField.ns_table && (dataField.ns_table.name == 'customer' || dataField.ns_table.name == 'vendor')) {
                                // @@NOTE
                                control.dataSource = coreSQL.run(`
                                    select  c.id as value, c.companyname as text
                                    from    customer c
                                    join    entity e on e.id = c.id and LOWER(BUILTIN.DF(e.type)) = '${dataField.ns_table.name}'
                                    where   c.isinactive = 'F'
                                    order by c.companyname
                                `)
                            } else {
                                var whereClause = "where isinactive = 'F'";
                                var nameField = "name"; var idField = 'id';
                                if (dataField.ns_table) {
                                    // @@NOTE: this is a standard NS table, some of them have no isinactive field and some other have no name field
                                    if (!dataField.ns_table.isInactive) { whereClause = ''; }
                                    nameField = dataField.ns_table.nameField;
                                    idField = dataField.ns_table.pk;
                                }
                                control.dataSource = coreSQL.run(`select ${idField} as value, ${nameField} as text from ${dataField.field_foreign_table} ${whereClause} order by ${nameField}`)
                            }
                        }
                        control.multiSelect = (dataField.field_type == 'Multiple Select');
                    } catch (error) {
                        core.logError('GET-DATA-SOURCE', error);
                        throw error;
                    }
                }

                panelFields.controls.push(control)

            })
        }


        return {
            formatPanelFields: formatPanelFields
        }
    });

