/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (core, coreSQL) => {

        function getSiteNames() {
            return coreSQL.run(`select id as value, name as text from customrecord_twc_site where isinactive = 'F' order by name`)
        }

        function getSiteTypes() {
            return coreSQL.run(`select id as value, name as text from customrecord_twc_site_types where isinactive = 'F' order by name`)
        }

        function getCounties() {
            // @@TODO: county (on site table) should not be a free text field, uncomment below once fixed
            //return coreSQL.run(`select id as value, fullname as text from state where country = 'IE' order by fullname`)
            return coreSQL.run(`select distinct custrecord_twc_site_country as value, custrecord_twc_site_country as text from customrecord_twc_site order by custrecord_twc_site_country`)
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
