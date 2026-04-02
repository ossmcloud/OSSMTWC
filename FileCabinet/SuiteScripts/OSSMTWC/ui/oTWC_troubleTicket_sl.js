/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet

 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../data/oTWC_config.js', '../ui/modules/oTWC_troubleTicketUtils.js', '../O/controls/oTWC_ui_fieldPanel.js','../ui/modules/oTWC_siteInfoUtils.js','../data/oTWC_troubleTickets.js', '../O/controls/oTWC_ui_ctrl.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcConfig, twcTroubleTicketUtils, twcUIPanel,twcSiteInfoUtils, twcTkt, twcUI) {
        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Trouble Ticket', script: 'SuiteScripts/OSSMTWC/ui/oTWC_troubleTicket_cs.js' });
        suiteLet.get = (context, s) => {
            var pageData = twcBaseView.initPageData(context);

            var html = ''
            if (context.request.parameters.siteId || context.request.parameters.recId) {
                pageData.trblTktInfo = twcTroubleTicketUtils.getTrblTktInfo(pageData);
                pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(pageData.trblTktInfo.siteId || context.request.parameters.siteId);
                var tktStatus = pageData.trblTktInfo[twcTkt.Fields.STATUS];
                log.audit('pageData.siteInfo',pageData.siteInfo)
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

                html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_troubleTicket');
                html = html.replaceAll('{SITE_MAIN_INFO_PANEL}', `${twcSiteInfoUtils.renderInfoPanel(pageData.siteInfo)}`)


                var fieldGroups = twcTroubleTicketUtils.getTKTInfoPanels(pageData.trblTktInfo, pageData.userInfo);
                html = html.replaceAll('{TROUBLE_TICKET_DETAILS}', twcUIPanel.render(fieldGroups, readOnly));

                var readOnly = context.request.parameters.edit != 'T';
                // @@NOTE: if permission lvl is 1 it means view only so even if parameter passed force to read only
                if (pageData.userInfo.permission.lvl == 1) { readOnly = true; }



                var actions = '';
                    if (pageData.editMode) {
                        actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Cancel', id: 'cancel-button' })
                    } else {
                        if (tktStatus != twcTkt.Status.Resolved) {
                            actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Resolve', id: 'resolve-button' });
                        }
                        if (tktStatus == twcTkt.Status.New) {
                            actions += twcUI.render({ type: twcUI.CTRL_TYPE.BUTTON, value: 'Delete', id: 'delete-button' });
                        }
                    }

                    if (actions) { html = html.replaceAll('<div id="custom-actions"></div>', `<div id="custom-actions">${actions}</div>`); }
                




            } else {
                pageData.data.ticketInfo = twcTroubleTicketUtils.getTroubleTickets(null, pageData.userInfo);
                log.debug("ticketInfo",pageData.data.ticketInfo)
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
                return { status: 'success' };
            } 
            else  if (context.request.parameters.action == 'resolve-tkt-status') {
                var recId = JSON.parse(context.request.body);
                log.debug("recId",recId)
                return twcTroubleTicketUtils.resolveTicket(recId);

            }
            else {
                throw new Error(`Invalid post action: ${context.request.parameters.action || 'NO ACTION'}`);
            }

        };


        return {
            onRequest: uis.onRequest
        }
    });
