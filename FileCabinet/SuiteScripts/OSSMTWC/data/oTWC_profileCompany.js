/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_profileCPersistent.js'],
    (core, coreSQL, twcProfileC) => {

        // @@NOTE: links a profile to additional companies (other than its home company custrecord_twc_prof_company)
        //         a profile can operate on its home company and on any company linked here
        // @@IMPORTANT: this module is used by oTWC_config.js and oTWC_utils.js, do not add references to other twc modules (circular references)

        class OSSMTWC_ProfileCompany extends twcProfileC.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }

        // @@NOTE: sub-query returning the ids of the profiles linked (via this table) to the given company
        // @@IMPORTANT: the sub-query must NOT contain the WHERE keyword: RecordBase.select (O/data/oTWC_baseRecord.js) replaces 'where' with 'and' in string where clauses
        //              so the filters are in the join condition instead
        function getCompanyProfilesSql(companyId) {
            return `select pc_.${twcProfileC.Fields.PROFILE} from ${twcProfileC.Type} pc_ join customrecord_twc_company pcc_ on pcc_.id = pc_.${twcProfileC.Fields.COMPANY} and pcc_.id = ${parseInt(companyId) || 0} and pc_.isinactive = 'F'`;
        }

        // @@NOTE: condition matching profiles whose home company is the given company or that are linked to it
        //         alias is the alias of the profile table (customrecord_twc_prof) in the calling query (optional)
        function getProfileCompanyWhere(companyId, alias) {
            var a = alias ? `${alias}.` : '';
            return `(${a}custrecord_twc_prof_company = ${parseInt(companyId) || 0} or ${a}id in (${getCompanyProfilesSql(companyId)}))`;
        }

        return {
            Type: twcProfileC.Type,
            Fields: twcProfileC.Fields,
            FieldsInfo: twcProfileC.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_ProfileCompany(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_ProfileCompany();
                return rec.select(options);
            },

            getCompanyProfilesSql: getCompanyProfilesSql,
            getProfileCompanyWhere: getProfileCompanyWhere
        }
    });
