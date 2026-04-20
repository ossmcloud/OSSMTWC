/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_nexusRecordConfig.js', '../../data/oTWC_utils.js', '../../O/controls/oTWC_ui_ctrl.js', '../../O/controls/oTWC_ui_table.js'],
    (core, coreSQL, nxRecordConfig, twcUtils, twcUI, uiTable) => {

        return {

            getNexusRecord(options, userInfo) {
                var html = ''; var data = {};
                if (options.nxType) {
                    if (options.nxId) {
                        // @@TODO: render record of type nxType
                    } else {
                        // @@TODO: render list of type nxType

                        var listCfg = coreSQL.first(`select ${nxRecordConfig.Fields.LIST_CONFIG} as cfg from ${nxRecordConfig.Type} where ${nxRecordConfig.Fields.RECORD_SCRIPT_ID} = '${options.nxType}'`)?.cfg;
                        if (listCfg === undefined) { throw new Error(`Invalid nx type: ${options.nxType}`); }

                        if (listCfg) { listCfg = JSON.parse(listCfg); }
                        if (!listCfg) { listCfg = {} }

                        if (!listCfg.fields) {
                            listCfg.fields = [
                                { name: 'id', alias: 'id' },
                                { name: 'name', alias: 'name' }
                            ];
                        }
                        if (!listCfg.where) {
                            listCfg.where = [
                                { field: 'isinactive', values: "'F'" }
                            ]
                        }
                        if (!listCfg.orderBy) { listCfg.orderBy = 'name'; }

                        var fields = '';
                        core.array.each(listCfg.fields, f => {
                            fields += `${f.name} as ${f.alias}${f.lookUp ? '_id' : ''}, `;
                            if (f.lookUp) { fields += `BUILTIN.DF(${f.name}) as ${f.alias}, `; }
                        })

                        var where = '';
                        core.array.each(listCfg.where, w => {
                            where += `and ${w.field} = ${w.values} `;
                        });

                        if (!userInfo.isEmployee) {

                            if (!listCfg.companyFields || listCfg.companyFields.length == 0) { throw new Error(`Invalid configurations, please contact Towercom admin to solve the issue`); }

                            const buildCompanyFieldFilter = (fields, userInfo) => {
                                if (!fields || fields.length == 0) { return ''; }
                                var companyIds = [];
                                var customers = userInfo.isCustomer ? twcUtils.getCustomers(userInfo) : twcUtils.getVendors(userInfo);
                                core.array.each(customers, c => { companyIds.push(c.value); })

                                var where = ` and (`
                                core.array.each(fields, (cf, cfx) => {
                                    if (cfx > 0) { where += ` or `; }
                                    where += ` ${cf} in ${companyIds.join(',')} `;
                                })
                                where += `)`;
                                return where;
                            }

                            where += buildCompanyFieldFilter(listCfg.companyFields, userInfo);



                        }

                        const onColumnInit = (tbl, col) => {
                            if (col.id.endsWith('_id')) { return false; }
                            var cf = listCfg.fields.find(cf => { return cf.alias == col.id });
                            if (cf) {
                                col.addCount = cf.addCount;
                            }
                        }


                        data = coreSQL.run(`
                            select  ${fields} 
                            from    ${options.nxType} 
                            where   1 = 1
                            ${where}
                            order by ${listCfg.orderBy}
                        `);

                        html = uiTable.render({
                            id: 'twc_nexus_records',
                            fitScreen: true,
                            fitContainer: true,
                            showFooter: true,
                            onColumnInit: onColumnInit
                        }, data);

                    }
                } else {
                    // @@TODO: render list of records that can be viewed in nexus
                    data = nxRecordConfig.select({ orderBy: 'name' });

                    html = `<div class="twc-list">`;
                    core.array.each(data, r => {
                        html += `
                            <div data-record-type="${r.record_script_id}">
                                <div>
                                    ${r.name}
                                </div>
                                <div>
                                    ${r.description || 'View/Edit/Enter ' + r.name + ' records'}
                                </div>
                            </div>
                        `
                    })
                    html += `</div>`;

                    // html = uiTable.render({
                    //     id: 'twc_nexus_records',
                    //     fitContainer: true
                    // }, data);

                }

                return {
                    type: options.nxType,
                    id: options.nxId,
                    data: data,
                    html: html,

                }
            }

        }
    });
