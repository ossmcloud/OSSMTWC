/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_site.js', './oTWC_lock.js', './oTWC_infrastructure.js', './oTWC_siteLevel.js', '../O/controls/oTWC_ui_ctrl.js', './oTWC_configUIFields.js', './oTWC_planning.js', './oTWC_siteRow.js','./oTWC_powerSupply.js','./oTWC_land.js','./oTWC_saf.js'],
    (runtime, core, coreSQL, twcUtils, twcSite, twcLock, twcInfra, twcSiteLevel, twcUI, configUIFields, twcPlan, twcRow,twcPowerSupply, twcLand, twcSaf) => {

        function getSafTableFields() {
            // @@TODO: this list of fields to display can be set by user
            // @@IMPORTANT: we should make sure some fields are there as they are needed by the ui:
            //      id, name
            //      lat/lng
            //      site address
            var safFields = [
                { field: twcSaf.Fields.SAF_ID },
               // { field: twcSaf.Fields.SUBMITTED },//Field not present
                { field: twcSaf.Fields.SITE },
                // { field: twcSaf.Fields.NAME },//Field not present
                { field: twcSaf.Fields.CUSTOMER },
               // { field: twcSaf.Fields.REQUESTER },//Field not present
                { field: twcSaf.Fields.START_TIME_BLOCK },
                { field: twcSaf.Fields.END_TIME_BLOCK },
                { field: twcSaf.Fields.MAST_ACCESS },
                { field: twcSaf.Fields.CRANE__CHERRYPICKER },
                { field: twcSaf.Fields.ASSOCIATED_SRFS },
              //  { field: twcSaf.Fields.DESCRIPTION },//Field not present
               { field: twcSaf.Fields.PRIMARY_CONTRACTOR },
                { field: twcSaf.Fields.PICW },
                { field: twcSaf.Fields.STATUS },
            ];
            return safFields;
        }

        return {
            getSafTableFields: getSafTableFields
        }
    });

