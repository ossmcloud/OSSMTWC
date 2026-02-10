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


        const TEST_ROLE = 0;

        function loadPermissions(roleId) {
            var sql = {
                query: `
                    select  f.id, ${roleId == 3 ? PERMISSION_LEVEL.FULL : 'custrecord_twc_role_perm_lvl'} as lvl, custrecord_twc_role_perm_own as own, f.name as text, 
                            f.custrecord_twc_role_feat_script as value, f.custrecord_twc_role_feat_nomenu as no_menu, f.custrecord_twc_role_feat_id as feature_id,
                    from    customrecord_twc_role_feat  f
                    left join    customrecord_twc_role_perm p on f.id = p.custrecord_twc_role_perm_feat
                    ${roleId == 3 ? '' : 'where   p.custrecord_twc_role_perm_role = ?'}
                    order by f.custrecord_twc_role_feat_sort
                `,
            }

            //throw new Error(roleId)

            if (roleId != 3) { sql.params = [roleId] }



            var permissions = coreSQL.run(sql);
            var menuItems = [{value: '', text: '-- menu items --'}];
            core.array.each(permissions, p => {
                if (p.no_menu == 'T') { return; }
                menuItems.push(p);
            })

            return {
                permissions: permissions,
                menuItems: menuItems
            }
        }

        function get(context) {

            var roleId = core.env.role();
            if (TEST_ROLE) {
                roleId = TEST_ROLE;
            } else {
                if (roleId != 3) {
                    roleId = coreSQL.scalar({
                        query: `select custrecord_twc_role as r from role where id = ?`,
                        params: [roleId]
                    })
                }

                // @@NOTE: if the field on role is not set we'll get null, set to zero tp avoid query below to fail 
                if (!roleId) { roleId = 0; }

            }

            var p = loadPermissions(roleId);
            var currentPermission = p.permissions.find(p => { return p.value == context.request.parameters.script })
            var permission = {
                menuItems: p.menuItems,
                permissions: p.permissions,
                id: currentPermission?.value || 0,
                lvl: currentPermission?.lvl || 0,
                own: currentPermission?.own || false,
                feature: currentPermission?.text || 'no feature',
                featureId: currentPermission?.feature_id || ''
            }

            return permission;

        }

        return {

            LEVEL: PERMISSION_LEVEL,

            get: get,



        }
    });
