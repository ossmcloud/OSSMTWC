/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_srf.js', './oTWC_srfItem.js', './oTWC_srfItemUI.js', './oTWC_fileUI.js', './oTWC_configUIFields.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_srfReview.js'],
    (runtime, core, coreSQL, twcUtils, twcSrf, twcSrfItem, twcSrfItemUI, twcFileUI, configUIFields, twcUI, twcSrfReview) => {

        function getSrfTableFields() {
            // @@IMPORTANT: make sure some fields are there as they are needed by the ui:
            //      id, name
            //      lat/lng
            //      site address
            var siteFields = [
                { field: twcSrf.Fields.NAME },
                { field: twcSrf.Fields.SITE },
                { field: twcSrf.Fields.OPERATOR_SITE_ID },
                { field: twcSrf.Fields.SRF_STATUS },
                { field: twcSrf.Fields.CUSTOMER },
                { field: twcSrf.Fields.SRF_SUBMITTED_BY },
                { field: twcSrf.Fields.SRF_REQUESTED_DATE },

            ];
            return siteFields;
        }

        function getFeedbackReviewRecords(fieldGroup, srf, userInfo) {
            if (!srf.id) { return; }
            var srfReview = twcSrfReview.select({ where: { [twcSrfReview.Fields.SRF]: srf.id }, orderBy: { [twcSrfReview.Fields.CREATED]: 'DESC' }, noAlias: true });
            //if (srfReview.length > 0 && srfReview[0][twcSrfReview.Fields.TL_REVIEW_RESULT] == twcUtils.SrfReviewStatus.FeedbackIssued) {
            if (srfReview.length > 0) {
                var title = ''; var bkgdColor = '';
                if (srfReview[0][twcSrfReview.Fields.TL_REVIEW_RESULT] == twcUtils.SrfReviewStatus.Approved) {
                    title = 'Towercom Approval Info';
                    bkgdColor = 'rgba(0,255,0, 0.15)';
                } else if (srfReview[0][twcSrfReview.Fields.TL_REVIEW_RESULT] == twcUtils.SrfReviewStatus.FeedbackIssued) {
                    title = 'Towercom Feedback Info';
                    bkgdColor = 'rgba(255,0,0, 0.15)';
                } else {
                    return;
                }

                
                var srfReviewInfo = { id: 'site-req-review', title: title, fields: [] };
                var reviewInfoHtml = `
                    <div style="display: flex; padding-bottom: 5px;">
                        <div>
                            <label>Review Date</label>
                            <span style="margin-bottom: 29px; display: block;'">${srfReview[0][twcSrfReview.Fields.TL_REVIEW_COMPLETE]}</span>
                            <label>Review Comments</label>
                            ${srfReview[0][twcSrfReview.Fields.TL_REVIEW_COMMENTS]}
                        </div>
                `

                
                if (userInfo.isEmployee || userInfo.companyProfile?.id == srf[twcSrf.Fields.CUSTOMER]) {
                    reviewInfoHtml += `
                        <div style="margin-left: 11px; border-left: 1px dotted silver; padding-left: 11px;">
                            <label>Accounts Check Passed</label>
                            ${twcUI.render({ type: twcUI.CTRL_TYPE.TOGGLE, value: srfReview[0][twcSrfReview.Fields.CUSTOMER_ACCOUNTS_CHECK_PASSED], readOnly: true })}
                            <label>Accounts Fee Breakdown</label>
                            ${srfReview[0][twcSrfReview.Fields.FEE_CHANGE_BREAKDOWN] || ''}
                        </div>
                        <div style="margin-left: 11px; text-align: right; border-left: 1px dotted silver; padding-left: 11px;">
                            <label>New License Fee</label>
                            <span style="margin-bottom: 20px; display: block; text-align: right;">${srfReview[0][twcSrfReview.Fields.NEW_LICENCE_FEE] || ''}</span>
                            <div style="display: flex;">
                                <div style="text-align: right; margin-right: 7px;">
                                    <label>Fee Uplift</label>
                                    ${srfReview[0][twcSrfReview.Fields.FEE_UPLIFT] || '0'}
                                </div>
                                <div style="text-align: right;">
                                    <label>Fee Reduction</label>
                                    ${srfReview[0][twcSrfReview.Fields.FEE_REDUCTION] || '0'}
                                </div>
                            </div>
                        </div>
                    `;
                }

                reviewInfoHtml += '</div>';

                srfReviewInfo.fields.push({
                    id: 'srf-req-review-info', type: twcUI.CTRL_TYPE.PANEL,
                    title: ``,
                    content: reviewInfoHtml,
                    styles: { 'width': '100%' },
                    contentStyles: { 'background-color': bkgdColor }
                })
                fieldGroup.controls.push(srfReviewInfo);
            }

        }

        function getSrfItems(dataSource, userInfo, readOnly) {
            //throw new Error('ro: '+readOnly)
            var items = twcSrfItem.select(
                {
                    //fields: fields,
                    where: { [twcSrfItem.Fields.SRF]: dataSource.id || 0, },
                    useNames: true
                }
            );

            if (!readOnly) {
                var tempItems = [];
                core.array.each(items, item => {
                    var parentId = item[twcSrfItem.Fields.TMI_ID_SRF];
                    if (parentId) {
                        item.child = true;
                        var parent = items.find(i => { return i.id == parentId; })
                        if (!parent.relatedItems) { parent.relatedItems = []; }
                        parent.relatedItems.push(item);
                    } else {
                        tempItems.push(item);
                    }
                })
                items = tempItems;
            }


            return items;
        }

        function getSRFInfoPanels(dataSource, userInfo, readOnly) {
            var fieldGroup = { id: 'site-request', title: (dataSource.id) ? `Space Request [${dataSource.name}]` : 'Create New Space Request', collapsed: false, controls: [] };

            getFeedbackReviewRecords(fieldGroup, dataSource, userInfo);

            var basicInfo = { id: 'site-request-struct', title: 'Customer Information', fields: [] };
            fieldGroup.controls.push(basicInfo);

            

            var customers = null;
            // if (userInfo.isVendor) {
                customers = twcUtils.getCustomers(userInfo, { srf: true });
            // }
            basicInfo.fields.push({ id: twcSrf.Fields.CUSTOMER, label: 'Customer', disabled: userInfo.isCustomer, dataSource: customers, allowAll: false })
            basicInfo.fields.push({ id: twcSrf.Fields.OPERATOR_SITE_ID, label: 'Operator Site ID', mandatory: true })
            if (userInfo.isEmployee) { basicInfo.fields.push({ id: twcSrf.Fields.SRF_TYPE, label: 'SRF Type', dataSource: twcUtils.getSrfTypes(), allowAll: false }) }

            var items = getSrfItems(dataSource, userInfo, readOnly);

            // dataSource[`items_${twcSrf.StepType.TME}`] = items.filter(i => { return i[twcSrfItem.Fields.STEP_TYPE] == twcSrf.StepType.TME; })
            // dataSource[`items_${twcSrf.StepType.ATME}`] = items.filter(i => { return i[twcSrfItem.Fields.STEP_TYPE] == twcSrf.StepType.ATME; })
            // dataSource[`items_${twcSrf.StepType.GIE}`] = items.filter(i => { return i[twcSrfItem.Fields.STEP_TYPE] == twcSrf.StepType.GIE; })
            // dataSource[`items_${twcSrf.StepType.FEEDER}`] = items.filter(i => { return i[twcSrfItem.Fields.STEP_TYPE] == twcSrf.StepType.FEEDER; })

            fieldGroup.controls.push({ id: 'site-request-step-1', title: 'Step 1 of 6 (TME)', fields: [twcSrfItemUI.getStepTableUIControl(userInfo, dataSource, twcSrf.StepType.TME, items)] });
            fieldGroup.controls.push({ id: 'site-request-step-2', title: 'Step 2 of 6 (ATME)', fields: [twcSrfItemUI.getStepTableUIControl(userInfo, dataSource, twcSrf.StepType.ATME, items)] });
            fieldGroup.controls.push({ id: 'site-request-step-4', title: 'Step 3 of 6 (Feeders)', fields: [twcSrfItemUI.getStepTableUIControl(userInfo, dataSource, twcSrf.StepType.FEEDER, items)] });
            fieldGroup.controls.push({ id: 'site-request-step-3', title: 'Step 4 of 6 (GIE)', fields: [twcSrfItemUI.getStepTableUIControl(userInfo, dataSource, twcSrf.StepType.GIE, items)] });
            fieldGroup.controls.push({ id: 'site-request-step-5', title: 'Step 5 of 6 (Attachments)', fields: [twcSrfItemUI.getFileTableUIControl(userInfo, dataSource)] });


            var step5 = {
                id: 'site-request-step-6', title: 'Step 6 of 6: (Power Supply)', fields: [
                    { id: twcSrf.Fields.POWER_SUPPLY_REQUESTED_FROM_TL, label: 'Power Requested from TC', labelNoWrap: true, lineBreak: true },
                    { id: twcSrf.Fields.ALTERNATE_POWER_SUPPLIER, label: 'Alternate Supplier', lineBreak: true },
                    { id: twcSrf.Fields.POWER_NOTES, label: 'Notes / Comments', width: '75%', rows: 3, lineBreak: true },
                    { id: twcSrf.Fields.APPLICATION_FOR_OWN_SUPPLY_MADE_TO_ESB, label: 'Application for own supply made to ESB', labelNoWrap: true, lineBreak: true },
                    { id: twcSrf.Fields.APPLICATION_DATE, label: 'Application Date' },
                    { id: twcSrf.Fields.APPLICATION_REFERENCE, label: 'Application Reference' },
                ]
            }

            fieldGroup.controls.push(step5);

            if (!readOnly) {
                fieldGroup.controls.push({
                    id: 'site-request-step-7', fields: [
                        { type: twcUI.CTRL_TYPE.BUTTON, id: 'save-button', value: 'Save SRF' }
                    ]
                });
            }

            configUIFields.formatPanelFields(dataSource, fieldGroup);

            return fieldGroup;
        }



        function getSRFUIPanels(dataSource, userInfo, readOnly) {
            if (!dataSource) { dataSource = {}; }
            dataSource.Type = twcSrf.Type;

            var fieldGroups = [];
            fieldGroups.push(getSRFInfoPanels(dataSource, userInfo, readOnly));
            return fieldGroups;
        }

        function getSrfChildRecord(srf, childRecord, userInfo) {
            var fieldGroup = [];
            if (childRecord.type == twcSrfItemUI.RecordType) {
                fieldGroup = twcSrfItemUI.getUIFields(srf, childRecord, userInfo);
                configUIFields.formatPanelFields(childRecord, fieldGroup);
            } else if (childRecord.type == twcFileUI.RecordType) {
                fieldGroup = twcFileUI.getUIFields(childRecord, userInfo, { srf: true });
            } else {
                throw new Error(`No Child Record Found in payload (type: ${childRecord.type})`)
            }

            return fieldGroup;
        }




        return {
            getSrfTableFields: getSrfTableFields,
            getSRFInfoPanels: getSRFUIPanels,
            getSrfChildRecord: getSrfChildRecord

        }
    });

