/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_srf.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js'],
    (runtime, core, coreSQL, twcUtils, twcSrf, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields) => {


        function getSRFInfoPanels_new(dataSource, userInfo) {
            var fieldGroup = { id: 'site-request', title: 'Create New Space Request', collapsed: false, controls: [] };

            var basicInfo = { id: 'site-request-struct', title: 'Customer Information', fields: [] };
            fieldGroup.controls.push(basicInfo);

            var customers = null;
            if (userInfo.isVendor) {
                
                customers = coreSQL.run(`
                    select  c.id as value, c.companyname as text
                    from    customer c
                    join    entity e on e.id = c.id and BUILTIN.DF(e.type) = 'Customer'
                    join    customrecord_twc_vendcust_link link on link.custrecord_twc_vendcust_link_cust = c.id
                    where   c.isinactive = 'F'
                    and     link.custrecord_twc_vendcust_link_vend = ${userInfo.id}
                    order by c.companyname
                `)
            }

            basicInfo.fields.push({ id: twcSrf.Fields.CUSTOMER, label: 'Customer', disabled: userInfo.isCustomer, dataSource: customers })
            basicInfo.fields.push({ id: twcSrf.Fields.OPERATOR_SITE_ID, label: 'Operator Site ID' })

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }


        function getSRFInfoPanels(dataSource, userInfo) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcSrf.Type;

            var fieldGroups = [];
            if (dataSource.id) {
                // @@TODO : this is an existing SRP
            } else {
                fieldGroups.push(getSRFInfoPanels_new(dataSource, userInfo));
            }
            return fieldGroups;
        }

        return {
            getSRFInfoPanels: getSRFInfoPanels
            
        }
    });

