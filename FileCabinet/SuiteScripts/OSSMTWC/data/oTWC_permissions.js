/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js'],
    (core, coreSQL) => {


        const PERMISSION_LEVEL = {
            NONE: 0,                    // no permission
            VIEW: 1,                    // view only
            EDIT: 2,                    // create / edit
            FULL: 3                     // create / edit / delete and other actions
        }


        const TEST_ROLE = 1;



      
        function get(context) {

            var roleId = null;
            if (TEST_ROLE) {
                roleId = TEST_ROLE;
            } else {
                // @@NOTE: Role 3 is Administrator
                if (core.env.role == 3) {
                    return {
                        lvl: PERMISSION_LEVEL.FULL,
                    };
                }

                roleId = coreSQL.scalar({
                    query: `select custrecord_twc_role as r from role where id = ?`,
                    params: [core.env.role]
                })
            }


            var p = coreSQL.first({
                query: `
                    select  custrecord_twc_role_perm_lvl as lvl, custrecord_twc_role_perm_own as own, f.name as feature
                    from    customrecord_twc_role_perm  p
                    join    customrecord_twc_role_feat  f on f.id = p.custrecord_twc_role_perm_feat
                    where   p.custrecord_twc_role_perm_role = ?
                    and     f.custrecord_twc_role_feat_script = ?
                `,
                params: [
                    roleId,
                    context.request.parameters.script
                ]
            })

            
            return p;

        }

        return {

            LEVEL: PERMISSION_LEVEL,

            get: get,
           


        }
    });
