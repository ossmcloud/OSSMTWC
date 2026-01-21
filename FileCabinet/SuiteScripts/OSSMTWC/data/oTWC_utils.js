/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (core, coreSQL) => {

        function getSiteNames() {
            // @@TODO:


            return [
                { value: 1, text: 'site 1 name' },
                { value: 2, text: 'site 2 name' },
                { value: 3, text: 'site 3 name' },
                { value: 4, text: 'site 4 name' },
                { value: 5, text: 'site 5 name' },
            ]
        }

        function getSiteTypes() {
            return coreSQL.run(`select id as value, name as text from customrecord_twc_site_types where isinactive = 'F' order by name`)
        }

        function getCounties() {
            return coreSQL.run(`select id as value, fullname as text from state where country = 'IE' order by fullname`)
        }

        function getRegions() {
            return coreSQL.run(`select id as value, name as text from customrecord_twc_region where isinactive = 'F' order by name`)
        }

        function getPortfolios() {
            return coreSQL.run(`select id as value, name as text from customrecord_twc_site_portfolio where isinactive = 'F' order by name`)
        }

        //

        return {
            getSiteNames: getSiteNames,
            getSiteTypes: getSiteTypes,
            getCounties: getCounties,
            getRegions: getRegions,
            getPortfolios: getPortfolios,
        }
    });
