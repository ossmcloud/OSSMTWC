/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_site.js', './ui/modules/oTWC_siteInfoUtils.js', './data/oTWC_config.js', './data/oTWC_configUIFields.js', './data/oTWC_rolePermission.js'],
    function (core, coreSQL, dialog, recu, twcSite, siteInfoUtils, twcConfig, configUIFields, rolePermission) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())

        }




        return {
            pageInit: pageInit,
            testFunction() {
                try {
                    //throw new Error('no test')

                    var s = coreSQL.first(`
                        select *
                        from   customrecord_twc_site s
                        left join  customrecord_twc_row r on r.id = s.custrecord_twc_site_curr_row
                        where  s.id = 2
                    `)

                    console.log(configUIFields.getSiteInfoPanels_Assets(s));

                    //console.log(rolePermission.get(1))

                    // console.log(rolePermission.select({
                    //     fields: [rolePermission.Fields.ROLE, rolePermission.Fields.PERMISSION_LEVEL],
                    //     where: { [rolePermission.Fields.PERMISSION_LEVEL]: 1 }
                    // }))

                    // console.log(rolePermission.select({
                    //     fields: { [rolePermission.Fields.ROLE]: 'role_test', [rolePermission.Fields.PERMISSION_LEVEL]: 'test_2' },
                    //     where: [{ field: rolePermission.Fields.PERMISSION_LEVEL, op: '>', values: 1 }]
                    // }))

                } catch (error) {
                    console.log(error)
                    dialog.error(error)
                }

            }
        }
    });


