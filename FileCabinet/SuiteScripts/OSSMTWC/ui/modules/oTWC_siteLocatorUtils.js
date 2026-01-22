/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_site.js'],
    (core, coreSQL, twcSite) => {


        function getSiteFields() {
            return coreSQL.run(`
                select  cf.fieldvaluetype as field_type, LOWER(cf.scriptid) as field_id, cf.name as field_label
                from    customfield cf
                join    customrecordtype c on c.internalid = cf.recordtype
                where   c.scriptid = UPPER('${twcSite.Type}')
                order by id
            `);
        }


        function getUserSiteFields() {
            // @@TODO: this list of fields to display can be set by user
            // @@IMPORTANT: we should make sure some fields are there as they are needed by the ui:
            //      id, name
            //      lat/lng
            //      site address
            var siteFields = [
                { field: twcSite.Fields.SITE_ID },
                { field: twcSite.Fields.SITE_NAME },
                { field: twcSite.Fields.SITE_TYPE },
                { field: twcSite.Fields.HEIGHT_ASL_M },
                { field: twcSite.Fields.ADDRESS },
                { field: twcSite.Fields.COUNTY },
                { field: twcSite.Fields.PORTFOLIO },
                { field: twcSite.Fields.LATITUDE },
                { field: twcSite.Fields.LONGITUDE },
            ];
            return siteFields;
        }

        function sanitizeFieldAlias(label) {
            var invalidChars = ['(', ')'];
            core.array.each(invalidChars, c => {
                label = label.replaceAll(c, '');
            })
            return label.replaceAll(' ', '_');
        }

        function getSites(options) {
            var sqlFields = 's.id, s.id as cust_id, s.name';

            var siteFields = getSiteFields();
            var userFields = getUserSiteFields();

            core.array.each(userFields, uf => {
                var nsField = siteFields.find(nsf => { return nsf.field_id == uf.field });
                var sqlField = uf.field;
                if (nsField.field_type == 'List/Record') {
                    uf.listRecord = true;
                    sqlField = `${sqlField} as ${sqlField}, BUILTIN.DF(${sqlField}) as ${sqlField}_text`;
                }

                //sqlFields += `, s.${sqlField} as ${sanitizeFieldAlias(uf.label || nsField.field_label).toLowerCase()}`;
                sqlFields += `, s.${sqlField}`;

                if (!uf.label) { uf.label = nsField.field_label; }

            })

            // @@TODO: if we decide to have filters / sort  columns on the 'options' parameter we'll built it here
            var whereClause = 'where 1 = 1 ';
            var orderBy = `order by s.${twcSite.Fields.NAME}`;

            var sites = coreSQL.run(`
                select  ${sqlFields}, st.custrecord_twc_site_types_color as site_type_color
                from    ${twcSite.Type} s
                left join    customrecord_twc_site_types st on st.id = s.${twcSite.Fields.SITE_TYPE}
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
