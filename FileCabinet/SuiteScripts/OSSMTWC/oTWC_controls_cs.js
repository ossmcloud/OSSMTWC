/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope public
 */
define(['/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/client/controls/dialog/html.dialog.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_utils.js', './data/oTWC_site.js', './ui/modules/oTWC_siteInfoUtils.js', './data/oTWC_config.js', './data/oTWC_configUIFields.js', './data/oTWC_rolePermission.js', './data/oTWC_configUIFields.js'],
    function (core, coreSQL, dialog, recu, twcUtils, twcSite, siteInfoUtils, twcConfig, configUIFields, rolePermission, twcConfigUIFields) {

        function pageInit(context) {
            console.log('debug -------------> ' + core.env.live())

        }

        function getSiteInfo(siteId) {
            if (!siteId) { throw new Error('No site id provided!'); }

            // @@TODO: find a more dynamic way to do this

            var siteFields = twcSite.getFields();
            var joins = '';
            core.array.each(siteFields, f => {
                if (f.field_type != 'List/Record') { return; }
                var tblAlias = f.field_foreign_table.replace('customrecord_', '');
                joins += `
                    left join ${f.field_foreign_table} as ${tblAlias} on ${tblAlias}.id = s.${f.field_id}
                `
            })

            var siteInfo = coreSQL.first({
                query: `
                    select  *
                    from    ${twcSite.Type} s
                    ${joins}
                    where   s.id = ?
                `,
                params: [siteId]
            })
            var mainFields = twcConfigUIFields.getSiteMainInfoFields();
            return {
                site: siteInfo,
                mainFields: mainFields,
            };
        }


        return {
            pageInit: pageInit,
            testFunction() {
                try {
                    //throw new Error('no test')

                    coreSQL.each('select id, custrecord_twc_site_longitude as lng, custrecord_twc_site_latitude as lat from customrecord_twc_site order by id', s => {
                        console.log(s)
                        recu.submit('customrecord_twc_site', s.id, ['custrecord_twc_site_latitude', 'custrecord_twc_site_longitude'], [s.lng, s.lat])
                    })

                    // console.log(twcUtils.getFields(twcSite.Type));


                    // var s = twcSite.get(2);
                    // console.log(s)

                    // var allCounties = coreSQL.run("select id, shortname from state where country = 'IE'");

                    // var sql = `
                    //     select  id, custrecord_twc_site_country as county
                    //     from    customrecord_twc_site
                    //     where   custrecord_twc_site_address_county is null
                    //     order by id
                    // `

                    // coreSQL.each(sql, site => {
                    //     try {
                    //         console.log(site)

                    //         var county = allCounties.find(c => { return c.shortname == site.county });
                    //         if (!county) { throw new Error('No county found for: ' + site.county); }

                    //         recu.submit('customrecord_twc_site', site.id, 'custrecord_twc_site_address_county', county.id)

                    //     } catch (error) {
                    //         console.log(site, error)
                    //     }
                    // })

                    // var s = coreSQL.first(`
                    //     select *
                    //     from   customrecord_twc_site s
                    //     left join  customrecord_twc_row r on r.id = s.custrecord_twc_site_curr_row
                    //     where  s.id = 2
                    // `)

                    //console.log(configUIFields.getSiteInfoPanels(getSiteInfo(2).site));

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


