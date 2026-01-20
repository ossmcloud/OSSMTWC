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


                    // @@TODO: load all features
                    return {
                        permissions: [],
                        lvl: PERMISSION_LEVEL.FULL,
                        own: false,
                    };
                }

                roleId = coreSQL.scalar({
                    query: `select custrecord_twc_role as r from role where id = ?`,
                    params: [core.env.role]
                })
            }


            var permissions = coreSQL.run({
                query: `
                    select  f.id, custrecord_twc_role_perm_lvl as lvl, custrecord_twc_role_perm_own as own, f.name as text, f.custrecord_twc_role_feat_script as value
                    from    customrecord_twc_role_perm  p
                    join    customrecord_twc_role_feat  f on f.id = p.custrecord_twc_role_perm_feat
                    where   p.custrecord_twc_role_perm_role = ?
                    order by f.custrecord_twc_role_feat_sort
                `,
                params: [
                    roleId,
                    
                ]
            })

            var currentPermission = permissions.find(p => { return p.value == context.request.parameters.script })

            var permission = {
                permissions: permissions,
                id: currentPermission?.value || 0,
                lvl: currentPermission?.lvl || 0,
                own: currentPermission?.own || false,
                feature: currentPermission?.text || 'no feature' 
            }

            return permission;

        }

        return {

            LEVEL: PERMISSION_LEVEL,

            get: get,
           


        }
    });
