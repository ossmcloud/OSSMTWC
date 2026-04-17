/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_safCrewPersistent.js', './oTWC_utils.js', './oTWC_profile.js'],
    (core, coreSQL, twcSafCrew, twcUtils, twcProfile) => {



        class OSSMTWC_SAFCrew extends twcSafCrew.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafCrew.Type,
            Fields: twcSafCrew.Fields,
            FieldsInfo: twcSafCrew.FieldsInfo,


            get: function (id) {
                var rec = new OSSMTWC_SAFCrew(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAFCrew();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSafCrew.Type);
            },

            getSafCrew: (options) => {
                return coreSQL.run(`
                    select  ${twcSafCrew.Fields.MEMBER}, BUILTIN.DF(${twcSafCrew.Fields.MEMBER}) as ${twcSafCrew.Fields.MEMBER}_name, ${twcSafCrew.Fields.ATTEND_AS}, 
                            BUILTIN.DF(p.${twcProfile.Fields.COMPANY}) as contractor_name, p.${twcProfile.Fields.COMPANY} as contractor
                    from    ${twcSafCrew.Type} c
                    join    ${twcProfile.Type} p on p.id = c.${twcSafCrew.Fields.MEMBER}
                    where   ${twcSafCrew.Fields.SAF} = ${options.id}
                `)
            }

        }
    });
