
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/render', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../ui/modules/oTWC_siteLocatorUtils.js', '../ui/modules/oTWC_siteRequestUtils.js', '../O/controls/oTWC_ui_ctrl.js', '../O/controls/oTWC_ui_fieldPanel.js', '../data/oTWC_config.js', '../data/oTWC_srf.js', '../data/oTWC_equipmentLibCfg.js', '../data/oTWC_equipmentLib.js', '../data/oTWC_equipment.js', '../data/oTWC_icons.js', '../modules/oTWC_srfWorkflowEngine.js'],
    function (render, nsFile, core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcSiteLocatorUtils, twcSiteRequestUtils, twcUI, twcUIPanel, twcConfig, twcSrf, twcEqLibCfg, twcEqLib, twcEquipment, twcIcons, twcSrfWorkflowEngine) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TL Space Request', script: 'SuiteScripts/OSSMTWC/ui/oTWC_spaceRequest_cs.js' });
        suiteLet.get = (context, s) => {

            var pageData = twcBaseView.initPageData(context);

            var html = '';
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                pageData.siteRequestInfo = twcSiteRequestUtils.getSiteRequestInfo(pageData);
                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(pageData.siteRequestInfo.siteId || context.request.parameters.siteId);

                //
                pageData.recordStatus = `<div class="twc-div-span-table">${twcSrf.getSrfStatusHtml(pageData.siteRequestInfo[twcSrf.Fields.SRF_STATUS])}</div>`;
                if (context.request.parameters.recId) {
                    var srfCode = pageData.siteRequestInfo.name;
                    s.form.f.title += ` - ${srfCode}`;
                    pageData.recordStatus = `
                        <div style="display:flex; align-items:flex-start;">
                            <div class="twc-div-span-table">
                                <span class="twc-record-status" style="border: 1px solid var(--grid-color); padding: 0px 34px; font-size: 20px; vertical-align: middle; background-color: var(--accent-bkgd-color); color: var(--accent-fore-color)">
                                    ${srfCode}
                                </span>
                                <span style="width: 5px;"></span>
                                ${pageData.recordStatus}
                            </div>
                        </div>
                    `;
                }

                if (context.request.parameters.wkf == 'T') {
                    if (!pageData.userInfo.isEmployee) { throw new Error("You do not have permissions to see this page"); }
                    pageData.isWorkflowView = true;
                    pageData.assignToList = twcSiteRequestUtils.getAssignToEmployees();

                    html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_spaceRequest');
                    html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)
                    html = html.replaceAll('{SITE_REQUEST_DETAILS}', `<span class="twc-wait-cursor">${twcIcons.get('waitWheel', 64)}</span>`);

                } else {
                    pageData.libCfg = twcEqLibCfg.select();
                    pageData.eqLib = twcEqLib.select({ where: { [twcEqLib.Fields.LIBRARY_ENTRY_STATUS]: twcEqLib.EqLibStatus.Active }, noAlias: true });

                    // @@NOTES: if the SRF is submitted we still let users with full access to edit it but only if we are a Towercom employee 
                    if (context.request.parameters.recId) {
                        var canSubmit = pageData.siteRequestInfo[twcSrf.Fields.SRF_STATUS] == twcSrf.Status.Draft || pageData.siteRequestInfo[twcSrf.Fields.SRF_STATUS] == twcSrf.Status.FeedbackIssued;
                        pageData.forceViewOnly = !(canSubmit ? true : (pageData.userInfo.isEmployee && pageData.userInfo.permission.lvl == twcConfig.PERMISSION_LEVEL.FULL));
                        if (!pageData.forceViewOnly && pageData.siteRequestInfo[twcSrf.Fields.SRF_STATUS] == twcSrf.Status.SRFCancelled) {
                            pageData.forceViewOnly = true;
                        }
                    } else {
                        pageData.forceViewOnly = true;
                    }

                    html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_spaceRequest');
                    html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                    var readOnly = context.request.parameters.edit != 'T';
                    // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
                    if (pageData.userInfo.permission.lvl == twcConfig.PERMISSION_LEVEL.VIEW) {
                        // @@TODO: here we should really re-direct without the edit flag
                        readOnly = true;
                    }

                    var viewWorkFlowButton = ''; var openWorkFlowButton = '';
                    if (pageData.userInfo.isEmployee) {
                        if (pageData.siteRequestInfo[twcSrf.Fields.SRF_STATUS] != twcSrf.Status.Draft) {
                            viewWorkFlowButton = twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'View Workflow', id: 'view-workflow-button' });
                            openWorkFlowButton = twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Open Workflow', id: 'open-workflow-button' });
                        }
                    }

                    var printSDSButton = '';
                    if (pageData.siteRequestInfo[twcSrf.Fields.SRF_STATUS] == twcSrf.Status.LicenceRequested) {
                        printSDSButton = `
                            <div style="margin-left: 10px;">
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Print SDS', id: 'print-sds' })}
                            </div>
                        `;
                    }

                    var fieldGroups = twcSiteRequestUtils.getSRFInfoPanels(pageData.siteRequestInfo, pageData.userInfo);
                    html = html.replaceAll('{SITE_REQUEST_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));
                    if (canSubmit) {
                        html = html.replaceAll('<div id="custom-actions"></div>', `
                            <div id="custom-actions">
                                ${printSDSButton}
                                ${viewWorkFlowButton}
                                ${openWorkFlowButton}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: pageData.siteRequestInfo[twcSrf.Fields.SRF_STATUS] == twcSrf.Status.FeedbackIssued ? 'Re-Submit' : 'Submit', id: 'submit-button' })}
                                ${twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Cancel SRF', id: 'cancel-srf-button' })}
                            </div>
                        `);
                    } else if (viewWorkFlowButton) {
                        html = html.replaceAll('<div id="custom-actions"></div>', `
                            <div id="custom-actions">
                                ${printSDSButton}
                                ${viewWorkFlowButton}
                                ${openWorkFlowButton}
                            </div>
                        `);
                    }
                }

            } else {
                // @@TODO: this should actually be the site access info
                pageData.data.srfInfo = twcSiteLocatorUtils.getSiteSrf(null, pageData.userInfo);
                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcSiteRequestUtils.renderSiteLocatorPanel(pageData.permission.featureId));

            }

            s.form.fieldHtml(html);
        };


        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'child-record') {
                var payload = JSON.parse(context.request.body);
                var fields = twcSiteRequestUtils.getSrfChildRecord(payload, userInfo);
                return fields;

            } else if (context.request.parameters.action == 'save') {
                var payload = JSON.parse(context.request.body);
                return { id: twcSiteRequestUtils.saveSiteSrf(userInfo, payload) };

            } else if (context.request.parameters.action == 'submit') {
                var payload = JSON.parse(context.request.body);
                return { id: twcSiteRequestUtils.submitSiteSrf(userInfo, payload) };

            } else if (context.request.parameters.action == 'get-file') {
                var srfFle = twcSiteRequestUtils.getFile(JSON.parse(context.request.body).file);
                if (!srfFle) { throw new Error(`TL File record not found [${JSON.parse(context.request.body).file}]`); }
                var file = nsFile.load(srfFle.file_id);
                return { fileContent: file.getContents(), name: file.name, type: file.fileType }

            } else if (context.request.parameters.action == 'get-equipment') {
                return { data: twcSiteRequestUtils.getEquipment(JSON.parse(context.request.body)) }



            } else if (context.request.parameters.action == 'get-workflow') {
                return twcSrfWorkflowEngine.getWorkFlow(userInfo, JSON.parse(context.request.body))

            } else if (context.request.parameters.action == 'update-workflow') {
                return twcSrfWorkflowEngine.updateWorkflow(userInfo, JSON.parse(context.request.body))

            } else if (context.request.parameters.action == 'print-pdf') {

                // Load XML file
                const xmlFile = nsFile.load({
                    id: 'SuiteScripts/OSSMTWC/XML/oTwc_print_SDS.xml'
                });
                var xmlRenderer = render.create();
                xmlRenderer.templateContent = xmlFile.getContents();
                // Optional custom data source
                // xmlRenderer.addCustomDataSource({
                //     format: render.DataSource.OBJECT,
                //     alias: 'requestJSON',
                //     data: requestJSON
                // });

                var xmlContent = xmlRenderer.renderAsString();
                log.debug('XML CONTENT', xmlContent);
                var pdfFile = render.xmlToPdf({
                    xmlString: xmlContent
                });

                context.response.write(pdfFile);
                log.debug("Print SDS Clicked");
                return;
            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };

        return {
            onRequest: uis.onRequest
        }
    });
