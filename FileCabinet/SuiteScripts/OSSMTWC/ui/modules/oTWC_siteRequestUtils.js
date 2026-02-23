/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_srf.js', '../../data/oTWC_srfItem.js', '../../data/oTWC_srfUI.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/controls/oTWC_ui_ctrl.js'],
    (core, coreSQL, recu, twcSrf, twcSrfItem, twcSrfUI, twcConfig, twcIcons, twcUI) => {

        function saveSiteSrf(userInfo, payload) {
            // @@NOTE: @@REVIEW: this routine could be generalised to be used with different record types, not only twcSite

            // @@TODO: run validations on srf and srfItems records

            // @@TODO: error handling????
            var submitInfo = {};
            submitInfo[twcSrf.Type] = { id: payload.id, fields: [], values: [] };
            for (var k in payload) {
                if (k == 'id') { continue; }
                // @@NOTE: fields with '___' means they are linked record fields, we first update the site info, then the linked records
                var fieldPath = k.split('___');
                if (fieldPath.length == 1) {
                    submitInfo[twcSrf.Type].fields.push(k);
                    submitInfo[twcSrf.Type].values.push(payload[k])
                }
            }

            if (payload.id) {
                recu.submit(twcSrf.Type, payload.id, submitInfo[twcSrf.Type].fields, submitInfo[twcSrf.Type].values);
            } else {
                var newSrf = twcSrf.get();
                newSrf.sRFStatus = twcSrf.Status.Draft;
                newSrf.sRFRequestedDate = (new Date()).addHours(12);    // @@NOTE: to account for the GMT difference of US servers
                newSrf.sRFSubmittedBy = userInfo.profile || null;

                core.array.each(submitInfo[twcSrf.Type].fields, (field, idx) => {
                    if (!newSrf.hasField(field)) { return; }
                    newSrf.set(field, submitInfo[twcSrf.Type].values[idx]);
                })

                payload.id = newSrf.save();
            }

            //
            deleteSitesSrfItem(payload);

            //
            saveSiteSrfItem(payload, twcSrfItem.StepType.TME);
            saveSiteSrfItem(payload, twcSrfItem.StepType.ATME);
            saveSiteSrfItem(payload, twcSrfItem.StepType.GIE);

            return payload.id;

        }
        function saveSiteSrfItem(payload, stepType) {
            var items = payload[`items_${stepType}`] || [];

            core.array.each(items, item => {
                if (!item.dirty) { return; }
                var srfItem = twcSrfItem.get(item.id);
                srfItem.sRF = payload.id;
                srfItem.stepType = stepType;

                for (var k in item) {
                    if (k == 'name') { continue; }
                    // @@IMPORTANT: field itemType is dependent on the stepType field
                    //              when stepTypeField is set the itemType is reset since we set the step type above make sure we skip it from here
                    if (k == 'custrecord_twc_srf_itm_stype') { continue; }
                    if (!srfItem.hasField(k)) { continue; }
                    srfItem.set(k, item[k])
                }

                srfItem.save();
            })
        }
        function deleteSitesSrfItem(payload) {
            core.array.each(payload.items_deleted, item => {
                recu.del(twcSrfItem.Type, item.id);
            })
        }

        return {

            getSRFInfoPanels: twcSrfUI.getSRFInfoPanels,
            getSrfChildRecord: (options) => {
                var srf = twcSrf.get(options.srf.id);
                srf.copyFromObject(options.srf);

                var childRecord = twcSrfItem.get(options.item.id);
                childRecord.copyFromObject(options.item);
                return twcSrfUI.getSrfChildRecord(srf, childRecord);
            },

            getSiteRequestInfo: (pageData) => {

                var srf = {};

                if (pageData.recId) {
                    srf = coreSQL.first(`select * from ${twcSrf.Type} where id = ${pageData.recId}`);
                    srf.siteId = srf[twcSrf.Fields.SITE];

                    // for (var k in twcSrfItem.StepType) {
                    //     srf[`items_${twcSrfItem.StepType[k]}`] = coreSQL.run(`
                    //         select  *
                    //         from    ${twcSrfItem.Type}
                    //         where   ${twcSrfItem.Fields.SRF} = ${srf.id}
                    //         and     ${twcSrfItem.Fields.STEP_TYPE} = ${twcSrfItem.StepType[k]}
                    //         order by created
                    //     `)
                    // }

                } else {
                    // this is a new SRF, if the logged in user is a customer then set the customer field
                    if (pageData.userInfo.isCustomer) { srf[twcSrf.Fields.CUSTOMER] = pageData.userInfo.id; }
                    srf[twcSrf.Fields.SITE] = pageData.siteId;


                }
                return srf;
            },

            saveSiteSrf: saveSiteSrf
        }

    });