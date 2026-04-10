/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet

 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_troubleTicketUtils.js', '../O/controls/oTWC_ui_fieldPanel.js', '../ui/modules/oTWC_siteInfoUtils.js', '../data/oTWC_troubleTickets.js', '../O/controls/oTWC_ui_ctrl.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcTroubleTicketUtils, twcUIPanel, twcSiteInfoUtils, twcTkt, twcUI) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Trouble Ticket', script: 'SuiteScripts/OSSMTWC/ui/oTWC_troubleTicket_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            var html = ''
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                pageData.trblTktInfo = twcTroubleTicketUtils.getTrblTktInfo(pageData);
                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(pageData.trblTktInfo.siteId || context.request.parameters.siteId);

                var tktStatus = pageData.trblTktInfo[twcTkt.Fields.STATUS];
                log.audit('pageData.siteInfo', pageData.siteInfo)
                pageData.recordStatus = `<div class="twc-div-span-table">${twcTkt.getTktStatusHtml(tktStatus)}</div>`;
                if (context.request.parameters.recId) {
                    var tktCode = pageData.trblTktInfo.name;
                    s.form.f.title += ` - ${tktCode}`;
                    pageData.recordStatus = `
                        <div class="twc-div-span-table">
                            <span class="twc-record-status" style="border: 1px solid var(--grid-color); padding: 0px 34px; font-size: 20px; vertical-align: middle; background-color: var(--accent-bkgd-color); color: var(--accent-fore-color)">
                                ${tktCode}
                            </span>
                            <span style="width: 5px;"></span>
                           ${pageData.recordStatus}
                        </div>
                    `
                }




                var actions = '';

                // @@NOTE: an existing ticket that has not been resolved can be cancelled by anybody
                if (pageData.trblTktInfo.id && tktStatus != twcTkt.Status.Resolved) {
                    actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Cancel Ticket', id: 'cancel-ticket-button' });
                }

                if (pageData.trblTktInfo.id) {
                    if (pageData.userInfo.isEmployee) {
                        if (tktStatus != twcTkt.Status.Resolved) {
                            actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Upload Resolution Photos', id: 'upload-resolution-photo' });
                            actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Resolve', id: 'resolve-button' });
                        }
                    } else {
                        if (tktStatus != twcTkt.Status.New) { pageData.forceViewOnly = true; }
                    }
                } else {
                    // @@NOTE: we show a submit button at the end
                    pageData.forceViewOnly = true;
                }

                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_troubleTicket');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)

                var readOnly = context.request.parameters.edit != 'T';
                // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
                if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }
                var fieldGroups = twcTroubleTicketUtils.getTKTInfoPanels(pageData.trblTktInfo, pageData.userInfo);
                html = html.replaceAll('{TROUBLE_TICKET_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));

                // @@NOTE: in edit mode we only want to see the 'edit/cancel' buttons
                // if (pageData.editMode) { actions = ''; }
                if (pageData.editMode) {
                    actions = '';
                    actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Upload Resolution Photos', id: 'upload-resolution-photo' });

                }

                if (actions) { html = html.replaceAll('<div id="custom-actions"></div>', `<div id="custom-actions">${actions}</div>`); }


            } else {
                pageData.data.ticketInfo = twcTroubleTicketUtils.getTroubleTickets(null, pageData.userInfo);
                log.debug("ticketInfo", pageData.data.ticketInfo)
                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteLocatorPanel');
                html = html.replace('{SITE_LOCATOR_PANEL}', twcTroubleTicketUtils.renderTroubleTicketsPanel(pageData.userInfo, pageData.permission.featureId));
            }




            s.form.fieldHtml(html);
        };

        suiteLet.post = (context, s) => {
            var userInfo = twcConfig.userInfo(context);
            if (context.request.parameters.action == 'save') {
                var payload = JSON.parse(context.request.body);
                // @@TODO: TROUBLE_TICKET: implement save
                log.debug("payload", payload)
                twcTroubleTicketUtils.saveTktInfo(payload);
                return { status: 'success' };
            }
            else if (context.request.parameters.action == 'resolve-tkt-status') {
                var recId = JSON.parse(context.request.body);
                log.debug("recId", recId)
                return twcTroubleTicketUtils.resolveTicket(recId);

            }
            else if (context.request.parameters.action == 'cancel-tkt-status') {
                var recId = JSON.parse(context.request.body);
                log.debug("recId", recId)
                return twcTroubleTicketUtils.cancelTicket(recId);

            }
            else if (context.request.parameters.action == 'upload-tkt-photo') {
                log.debug("Image det", JSON.parse(context.request.body))
                twcTroubleTicketUtils.saveTktImage(JSON.parse(context.request.body));
                return { status: 'success' };

            }
            //  else if (context.request.parameters.action == 'save-new-tkt') {
            //     var userInfo = twcConfig.userInfo(context);
            //     var payload = JSON.parse(context.request.body);
            //     log.debug("PAYLOAD",payload)
            //     return twcTroubleTicketUtils.saveNewTkt(payload, userInfo);

            // }
            else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
