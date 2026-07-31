/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../O/oTWC_themes.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_permissions.js'],
    (file, core, b64, twcThemes, twcIcons, twcConfig, twcUI, permissions) => {

        function initView(pageVersion, pageData, viewName) {
            var css = file.load('SuiteScripts/OSSMTWC/ui/css/oTWC.css').getContents();
            css += file.load('SuiteScripts/OSSMTWC/O/css/html.styles.css').getContents();
            css = css.replace('/*THEME*/', twcThemes.css(pageData.userPref.theme));

            var html = file.load(`SuiteScripts/OSSMTWC/ui/views/oTWC_pageBase.html`).getContents();
            html = html.replace('/** STYLES **/', css);
            html = html.replace('/** THEME **/', twcThemes.js());


            var userInfo = pageData.userInfo;
            // @@NOTE: we generally do not want user info in the client side, only allow on SB
            if (!core.env.sb()) { delete pageData.userInfo; }

            html = html.replaceAll('{PAGE_DATA}', b64.encode(JSON.stringify(pageData)));
            html = html.replaceAll('{PAGE_VERSION}', pageVersion);

            var htmlPage = '';
            if (userInfo.permission.lvl == permissions.LEVEL.NONE || (userInfo.permission.lvl == permissions.LEVEL.VIEW && pageData.editMode)) {
                htmlPage = file.load(`SuiteScripts/OSSMTWC/ui/views/oTWC_permissionError.html`).getContents();
                if (userInfo.permission.lvl == permissions.LEVEL.VIEW) {
                    htmlPage = htmlPage.replaceAll('{MESSAGE}', `You do not have permission to edit this record (<i>${userInfo.permission.feature}</i>)`);
                } else {
                    htmlPage = htmlPage.replaceAll('{MESSAGE}', `You do not have permission to access this feature (<i>${userInfo.permission.feature}</i>)`);
                }
                html = html.replaceAll('{PERMISSION_ICON}', twcIcons.ICONS.exclamation);

            } else {
                htmlPage = file.load(`SuiteScripts/OSSMTWC/ui/views/${viewName}.html`).getContents();
                if (userInfo.permission.lvl == permissions.LEVEL.VIEW) {
                    html = html.replaceAll('{PERMISSION_ICON}', twcIcons.ICONS.readOnly);
                } else {
                    html = html.replaceAll('{PERMISSION_ICON}', '');
                }
            }
            html = html.replaceAll('{PAGE_CONTENT}', htmlPage);
            html = html.replaceAll(`{UNDER_CONSTRUCTION}`, twcIcons.UNDER_CONSTRUCTION);

            for (var k in twcIcons.ICONS) {
                html = html.replaceAll(`{ICON_${k.toUpperCase()}}`, twcIcons.ICONS[k]);
            }

            html = html.replaceAll('{NAVIGATION_DROP_DOWN}', twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, id: 'twc-navigation-select', value: userInfo.permission.id, noEmpty: true, dataSource: userInfo.permission.menuItems }));

            if (pageData.portlet) {
                html = html.replace('{TWC_PAGE_STYLE}', `style="height: ${PORTLET_STYLES_PROPS.Height}; width: 100%;" `);
                html = html.replace('{TWC_PAGE_CLASS}', 'twc_page_loading');
            } else {
                html = html.replace('{TWC_PAGE_STYLE}', '');
                html = html.replace('{TWC_PAGE_CLASS}', '');
            }

            var buttons = '';
            if ((pageData.recId !== undefined || pageData.editMode) && userInfo.permission.lvl > twcConfig.PERMISSION_LEVEL.VIEW) {
                buttons += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: pageData.editMode ? 'Save' : 'Edit', id: pageData.editMode ? 'save-button' : 'edit-button' })
                if (pageData.editMode) {
                    buttons += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Cancel', id: 'cancel-button' })
                }
            }

            //
            if (pageData.forceViewOnly) { buttons = ''; }

            html = html.replace('{SAVE_EDIT_BUTTONS}', buttons);

            html = html.replace('{RECORD_STATUS}', pageData.recordStatus || '');

            pageData.userInfo = userInfo;
            return html;
        }


        return {
            initView: initView,
        }
    });
