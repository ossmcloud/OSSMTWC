/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/file', 'N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../O/oTWC_themes.js', '../../data/oTWC_icons.js', '../../data/oTWC_config.js', '../../O/controls/oTWC_ui_ctrl.js', '../../data/oTWC_permissions.js'],
    (file, runtime, core, b64, twcThemes, twcIcons, twcConfig, twcUI, permissions) => {

        // @@NOTE: contextual help: portal Suitelet => help page (help/*.html, served by oTWC_help_sl.js), '#anchor' = section id in the help page
        //         locator: the map / list page (view 'oTWC_siteLocatorPanel'), new: new record (edit=T, no recId), record: any other view
        //         a missing key falls back to 'record', a Suitelet not in the map (dashboards, nexus record, portlets) opens the help home page
        // @@IMPORTANT: keep the anchors in step with the section ids in the help pages
        // @@HARDCODED @@GO-LIVE :: portal Suitelet script ids (same on SB and LIVE)
        const HELP_PAGE_MAP = {
            customscript_otwc_sitelocator_sl: { locator: 'site-locator.html#locator' },
            customscript_otwc_siteinfo_sl: { record: 'site-locator.html#site' },
            customscript_otwc_inventory_sl: { locator: 'equipment.html#locator', record: 'equipment.html#site' },
            customscript_otwc_spacerequest_sl: { locator: 'space-request.html#find', new: 'space-request.html#create', record: 'space-request.html#form' },
            customscript_otwc_siteaccess_sl: { locator: 'site-access.html#find', new: 'site-access.html#create', record: 'site-access.html#view' },
            customscript_otwc_troubleticket_sl: { locator: 'trouble-tickets.html#find', new: 'trouble-tickets.html#raise', record: 'trouble-tickets.html#after' },
            customscript_otwc_sdsfiles_sl: { locator: 'sds.html#sdsfiles' },
            customscript_otwc_companyprofile_sl: { record: 'company-profile.html' },
        };

        function getHelpPage(pageData, viewName) {
            var map = HELP_PAGE_MAP[String(runtime.getCurrentScript().id).toLowerCase()];
            if (!map) { return ''; }
            var mode = 'record';
            if (viewName == 'oTWC_siteLocatorPanel') {
                mode = 'locator';
            } else if (pageData.editMode && !pageData.recId) {
                mode = 'new';
            }
            return map[mode] || map.record || map.locator || '';
        }

        // @@NOTE: help icon in the page header: opens the Nexus user help (oTWC_help_sl.js) in a pop-up window (action 'help' in oTWC_baseView.js)
        function getHelpAction(pageData, viewName) {
            try {
                var helpUrl = core.url.script('otwc_help_sl');
                var helpPage = getHelpPage(pageData, viewName);
                if (helpPage) {
                    var parts = helpPage.split('#');
                    helpUrl += '&page=' + encodeURIComponent(parts[0]) + (parts[1] ? '#' + parts[1] : '');
                }
                return `<div id="twc-action-help" class="twc_action" data-action="help" data-url="${helpUrl}" title="open the Nexus help">{ICON_HELP}</div>`;
            } catch (error) {
                // @@NOTE: help Suitelet not deployed (or not available to the role): no icon, the page must still load
                core.logError('HELP-ACTION', error.message);
                return '';
            }
        }

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
            html = html.replace('{HELP_ACTION}', getHelpAction(pageData, viewName));
            html = html.replaceAll('{PAGE_CONTENT}', htmlPage);
            html = html.replaceAll(`{UNDER_CONSTRUCTION}`, twcIcons.UNDER_CONSTRUCTION);

            for (var k in twcIcons.ICONS) {
                html = html.replaceAll(`{ICON_${k.toUpperCase()}}`, twcIcons.ICONS[k]);
            }

            html = html.replaceAll('{NAVIGATION_DROP_DOWN}', twcUI.render({ type: twcUI.CTRL_TYPE.SELECT, id: 'twc-navigation-select', value: userInfo.permission.id, noEmpty: true, dataSource: userInfo.permission.menuItems }));

            if (pageData.portlet) {
                html = html.replace('{TWC_PAGE_STYLE}', `style="${twcConfig.PORTLET_STYLES_PROPS}; width: 100%;" `);
                html = html.replace('{TWC_PAGE_CLASS}', 'twc_page_loading');
            } else {
                html = html.replace('{TWC_PAGE_STYLE}', '');
                html = html.replace('{TWC_PAGE_CLASS}', '');
            }

            var buttons = '';
            if ((pageData.recId !== undefined || pageData.editMode) && userInfo.permission.lvl > twcConfig.PERMISSION_LEVEL.VIEW) {
                buttons += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: pageData.editMode ? 'Save' : 'Edit', id: pageData.editMode ? 'save-button' : 'edit-button' })
                if (pageData.editMode) {
                    buttons += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Close', id: 'cancel-button' })
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
