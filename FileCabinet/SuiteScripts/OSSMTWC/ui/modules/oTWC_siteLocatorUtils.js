/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_utils.js', '../../data/oTWC_site.js', '../../data/oTWC_configUIFields.js'],
    (core, coreSQL, twcUtils, twcSite, twcConfigUIFields) => {

        function getSites(options) {
            var sqlFields = 's.id, s.id as cust_id, s.name';

            var siteFields = twcUtils.getFields(twcSite.Type);
            var userFields = twcConfigUIFields.getSiteTableFields();

            core.array.each(userFields, uf => {
                var nsField = siteFields.find(nsf => { return nsf.field_id == uf.field });
                var sqlField = uf.field;
                if (nsField.field_type == 'List/Record') {
                    uf.listRecord = true;
                    sqlField = `${sqlField} as ${sqlField}, BUILTIN.DF(${sqlField}) as ${sqlField}_text`;
                }

                sqlFields += `, s.${sqlField}`;

                if (!uf.label) { uf.label = nsField.field_label; }

            })

            
            // @@TODO: if we decide to have filters / sort  columns on the 'options' parameter we'll built it here
            var whereClause = 'where 1 = 1 ';
            var orderBy = `order by s.${twcSite.Fields.NAME}`;

            var sites = coreSQL.run(`
                select  ${sqlFields}, st.custrecord_twc_site_types_color as site_type_color
                from    ${twcSite.Type} s
                left join    customrecord_twc_site_type st on st.id = s.${twcSite.Fields.SITE_TYPE}
                ${whereClause} 
                ${orderBy}
            `)


            return {
                siteFields: siteFields,
                userFields: userFields,
                sites: sites
            }
        }


        return {

            getSites: getSites

        }
    });
