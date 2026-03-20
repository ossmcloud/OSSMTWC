/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js', '../ui/modules/oTWC_siteLocatorUtils.js', '../ui/modules/oTWC_siteAccessUtils.js', '../O/controls/oTWC_ui_fieldPanel.js', '../data/oTWC_utils.js', '../data/oTWC_config.js', '../data/oTWC_saf.js', '../data/oTWC_safTimeBlock.js', '../O/controls/oTWC_ui_ctrl.js'],
    function (file, core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils, twcSiteLocatorUtils, twcSiteAccessUtils, twcUIPanel, twcUtils, twcConfig, twcSaf, twcSafTimeBlock, twcUI) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site Access', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteAccess_cs.js' });
        suiteLet.get = (context, s) => {

            var pageData = twcBaseView.initPageData(context);

            var html = '';
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                if (context.request.parameters.err == 'T') { s.form.bannerError('SUBMIT ERRORS', 'some errors occurred during save, please look at the logs for more info', 5000) }

                pageData.siteAccessInfo = twcSiteAccessUtils.getSiteAccessInfo(pageData, context.request.parameters.reUse == 'T');

                var safStatus = pageData.siteAccessInfo[twcSaf.Fields.STATUS];
                var safIsInThePast = context.request.parameters.recId ? pageData.siteAccessInfo[twcSaf.Fields.START_TIME_BLOCK].split(' ')[0] < twcUtils.today() : false;
                var safRequiresSrf = twcUtils.getSafType(pageData.siteAccessInfo[twcSaf.Fields.R_TYPE])?.requires_srf == 'T';

                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(pageData.siteAccessInfo.siteId || context.request.parameters.siteId);
                pageData.timeBlocks = twcUtils.getSafTimeBlocks();
                pageData.siteTimeBlocks = twcSiteAccessUtils.getAllSafTimeBlocks(pageData.siteAccessInfo, pageData.userInfo);
                pageData.recordStatus = `<div class="twc-div-span-table">${twcSaf.getSafStatusHtml(safStatus)}</div>`;
                if (context.request.parameters.recId) {
                    var safCode = pageData.siteAccessInfo.name;
                    if (context.request.parameters.reUse == 'T') { safCode = 'REUSE: ' + safCode; }
                    s.form.f.title += ` - ${safCode}`;
                    pageData.recordStatus = `
                        <div class="twc-div-span-table">
                            <span class="twc-record-status" style="border: 1px solid var(--grid-color); padding: 0px 34px; font-size: 20px; vertical-align: middle; background-color: var(--accent-bkgd-color); color: var(--accent-fore-color)">
                                ${safCode}
                            </span>
                            <span style="width: 5px;"></span>
                            ${pageData.recordStatus}
                        </div>
                    `
                }
                // @@NOTE: if we have no recId is because we have a new SAF, we have a submit button at the bottom of the page for it, we use the forceViewOnly to hide the Save/Cancel buttons
                var canEdit = pageData.userInfo.isEmployee ? (safStatus != twcSaf.Status.Cancelled) : (safStatus == twcSaf.Status.Pending || safStatus == twcSaf.Status.Rejected || safStatus == twcSaf.Status.Approved);
                if (canEdit && safIsInThePast) { canEdit = false; }

                // @@NOTE: we set pageData.forceViewOnly = true because we do not want the baseView save/cancel buttons
                pageData.forceViewOnly = canEdit ? context.request.parameters.recId === undefined : true;
                if (pageData.editMode) { pageData.forceViewOnly = true; }

                //
                var canChangeStatus = (pageData.userInfo.isEmployee) ? safStatus != twcSaf.Status.Complete : (safStatus == twcSaf.Status.Pending || safStatus == twcSaf.Status.Rejected);
                if (core.me()) { canChangeStatus = true; }
                if (canChangeStatus) {
                    pageData.allowedStatues = [];
                    if (!safIsInThePast) { pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Pending, true)); }
                    if (pageData.userInfo.isEmployee) {
                        pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Approved, true));
                        pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Rejected, true));
                        if (safRequiresSrf) {
                            pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.AwaitingPhotos, true));
                            pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.PhotosReceived, true));
                        }
                        pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.PartiallyComplete, true));
                        pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Complete, true));
                    }
                    pageData.allowedStatues.push(twcUtils.getSafStatusName(twcUtils.SafStatus.Cancelled, true));
                }

                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteAccess');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                var fieldGroups = twcSiteAccessUtils.getSAFInfoPanels(pageData.siteAccessInfo, pageData.userInfo, { siteTimeBlocks: pageData.siteTimeBlocks, editMode: pageData.editMode });
                html = html.replaceAll('{SITE_ACCESS_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));

                if (context.request.parameters.recId === undefined) {
                    html = html.replaceAll('{CONDITION_OF_ACCESS}', `<b>Select SAF Setup & Access Requirements to begin</b>`);
                    html = html.replaceAll('{TIME_BLOCKS}', '');

                } else {
                    var timeBlocks = twcUI.render({ type: twcUI.CTRL_TYPE.TABLE, dataSource: twcSiteAccessUtils.getSafTimeBlocks(context.request.parameters.recId) })
                    html = html.replaceAll('{CONDITION_OF_ACCESS}', `${pageData.siteAccessInfo[twcSaf.Fields.CONDITIONS_OF_ACCESS] || ''}`);
                    html = html.replaceAll('{TIME_BLOCKS}', `<div class="twc-control-panel-title" style="padding: 6px;">Time Blocks</div>${timeBlocks}`);

                    var actions = '';
                    if (pageData.editMode) {
                        actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Cancel', id: 'cancel-button' })
                    } else {
                        if (safRequiresSrf && (safStatus == twcSaf.Status.Approved || safStatus == twcSaf.Status.AwaitingPhotos || safStatus == twcSaf.Status.PhotosReceived)) {
                            if (pageData.userInfo.isEmployee && safStatus == twcSaf.Status.PhotosReceived) {
                                if (pageData.siteAccessInfo[twcSaf.Fields.COMPLETION_REVIEWER] == pageData.userInfo.profile) {
                                    actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Completion Reviewed', id: 'review-completion-button' });
                                } else {
                                    actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Assign Reviewer', id: 'assign-reviewer-button' });
                                }
                            } else {
                                actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Upload Completion Photos', id: 'upload-photos-button' });
                            }

                        }
                        if (canChangeStatus) { actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Change Status / Comment', id: 'change-status-button' }); }
                        actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Re Use', id: 're-use-button' });
                    }

                    if (actions) { html = html.replaceAll('<div id="custom-actions"></div>', `<div id="custom-actions">${actions}</div>`); }
                }

            } else {
                pageData.data.safInfo = twcSiteLocatorUtils.getSiteSaf(null, pageData.userInfo);
                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcSiteAccessUtils.renderSiteAccessPanel(pageData.userInfo, pageData.permission.featureId));
            }

            s.form.fieldHtml(html);
        };



        suiteLet.post = (context, s) => {

            if (context.request.parameters.action == 'get-access-requirements') {
                //throw new Error(context.request.body)
                var payload = JSON.parse(context.request.body);
                return twcSiteAccessUtils.getAccessRequirements(payload);

            } else if (context.request.parameters.action == 'get-vendor-picw') {
                var payload = JSON.parse(context.request.body);
                return {
                    data: twcUtils.getProfiles({
                        company: payload.vendor,
                        filters: {
                            'custrecord_twc_prof_picw_acceptable': 'T',
                            'custrecord_twc_prof_safe_pass_expiry': { op: '>', value: 'CURRENT_DATE' }
                        }
                    })
                };

            } else if (context.request.parameters.action == 'get-vendor-docs') {
                var payload = JSON.parse(context.request.body);
                return { data: twcSiteAccessUtils.getVendorDocs(payload) };

            } else if (context.request.parameters.action == 'get-vendor-persons') {
                var payload = JSON.parse(context.request.body);
                return { data: twcUtils.getProfiles({ company: payload.vendor, canAttend: true }) };

            } else if (context.request.parameters.action == 'saf-crew-record') {
                var userInfo = twcConfig.userInfo(context);
                var payload = JSON.parse(context.request.body);
                var fields = twcSiteAccessUtils.getSafCrewRecord(payload, userInfo);
                return fields;

            } else if (context.request.parameters.action == 'saf-action-record') {
                var userInfo = twcConfig.userInfo(context);
                var payload = JSON.parse(context.request.body);
                var fields = twcSiteAccessUtils.getSafActionRecord(payload, userInfo);
                return fields;

            } else if (context.request.parameters.action == 'get-srf-actions') {
                var payload = JSON.parse(context.request.body);
                return { data: twcUtils.getSrfActions(payload) };

            } else if (context.request.parameters.action == 'save-new-saf') {
                var userInfo = twcConfig.userInfo(context);
                var payload = JSON.parse(context.request.body);
                return twcSiteAccessUtils.saveNewSaf(payload, userInfo);

            } else if (context.request.parameters.action == 'edit-saf-status') {
                var payload = JSON.parse(context.request.body);
                return twcSiteAccessUtils.editSafStatus(payload);

            } else if (context.request.parameters.action == 'upload-saf-photo') {
                twcSiteAccessUtils.saveSafImage(JSON.parse(context.request.body));
                return { status: 'success' };

            } else if (context.request.parameters.action == 'saf-get-reviewers') {
                var payload = JSON.parse(context.request.body);
                return { data: twcUtils.getSafReviewers(payload) };

            } else if (context.request.parameters.action == 'saf-set-reviewer') {
                var payload = JSON.parse(context.request.body);
                twcSiteAccessUtils.setSafReviewer(payload);
                return { status: 'success' };

            } else if (context.request.parameters.action == 'saf-set-reviewed') {
                var payload = JSON.parse(context.request.body);
                twcSiteAccessUtils.setSafReviewed(payload);
                return { status: 'success' };

            } else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        }


        return {
            onRequest: uis.onRequest
        }
    });
