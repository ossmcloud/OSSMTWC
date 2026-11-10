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

        const FEATURE_ID = {
            SITE_ACCESS: 'site_access',
            SPACE_REQUEST: 'space_request',
            TROUBLE_TICKET: 'trouble_ticket',

        }

        function loadPermissions(roleId) {
            // @@NOTE: Administrator (role 3) gets FULL on every feature: we must NOT join the role permissions table
            //         or each feature is returned once per role that has a permission row for it (duplicate menu items)
            var isAdmin = roleId == 3;
            var sql = {
                query: `
                    select  f.id, ${isAdmin ? PERMISSION_LEVEL.FULL : 'p.custrecord_twc_role_perm_lvl'} as lvl, ${isAdmin ? 'null' : 'p.custrecord_twc_role_perm_own'} as own, f.name as text,
                            f.custrecord_twc_role_feat_script as value, f.custrecord_twc_role_feat_nomenu as no_menu, f.custrecord_twc_role_feat_id as feature_id,
                            f.custrecord_twc_role_feat_configs as configs,
                    from   customrecord_twc_role_feat  f
                    ${isAdmin ? '' : 'join customrecord_twc_role_perm p on f.id = p.custrecord_twc_role_perm_feat and p.custrecord_twc_role_perm_role = ?'}
                    order by f.custrecord_twc_role_feat_sort
                `,
            }

            //throw new Error(roleId)

            if (roleId != 3) { sql.params = [roleId] }



            var permissions = coreSQL.run(sql);
            core.array.each(permissions, p => {
                // @@NOTE: feature configs (custrecord_twc_role_feat_configs, long text) is an optional json string, e.g.: { "restrict": "customer" }
                //         an invalid json is ignored (no configs), see applyRestrictions
                var configs = null;
                if (p.configs) {
                    try { configs = JSON.parse(p.configs); } catch (error) { core.logError('loadPermissions', `invalid configs json on feature ${p.id}: ${p.configs}`); }
                }
                p.configs = configs || {};
            });

            return {
                permissions: permissions,
                menuItems: getMenuItems(permissions)
            }
        }

        function getMenuItems(permissions) {
            var menuItems = [{ value: '', text: '-- menu items --' }];
            core.array.each(permissions, p => {
                if (p.no_menu == 'T') { return; }
                menuItems.push(p);
            })
            return menuItems;
        }

        // @@IMPORTANT: feature restrictions (configs.restrict on 'OSSMTWC - Role Feature List'), applied on top of the role permissions
        //              must be called once the user's company is known (oTWC_config.js: getUserInfo)
        //              a restricted feature is removed from the permissions / menu items (navigation drop down)
        //              and if it is the current feature the permission level is set to NONE (permission error page)
        //                  restrict: "customer"  => only profiles linked to a company with custrecord_twc_cus_flag = Customer (employees included: they are never a customer)
        function applyRestrictions(permission, userInfo) {
            if (!permission?.permissions) { return permission; }

            const isRestricted = (p) => {
                if (p.configs?.restrict == 'customer') { return !(userInfo.companyProfile?.isCustomer); }
                return false;
            }

            var restricted = permission.permissions.filter(p => { return isRestricted(p); });
            if (restricted.length == 0) { return permission; }

            permission.permissions = permission.permissions.filter(p => { return !isRestricted(p); });
            permission.menuItems = getMenuItems(permission.permissions);

            if (restricted.find(p => { return p.value == permission.id; })) {
                permission.lvl = PERMISSION_LEVEL.NONE;
                permission.own = false;
            }
            return permission;
        }

        function get(context) {

            var roleId = core.env.role();

            if (roleId != 3) {
                roleId = coreSQL.scalar({
                    query: `select custrecord_twc_role as r from role where id = ?`,
                    params: [roleId]
                })
            }

            // @@NOTE: if the field on role is not set we'll get null, set to zero tp avoid query below to fail 
            if (!roleId) { roleId = 0; }


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
            FEATURE: FEATURE_ID,

            get: get,
            applyRestrictions: applyRestrictions,



        }
    });
