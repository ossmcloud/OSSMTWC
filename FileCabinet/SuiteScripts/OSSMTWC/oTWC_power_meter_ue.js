/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_config.js', './data/oTWC_powerUser.js', './data/oTWC_site.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'N/record', './data/oTWC_powerSupply.js', './data/oTWC_powerMeter.js'],
    (core, oui, recu, twcConfig, twcPowerUser, twcSite, coreSql, record, twcPowerSupply, twcPowerMeter) => {

        function beforeLoad(context) {
            try {
                let rec = context.newRecord
                if (context.type == 'create') {
                    populateSite(rec)
                }

            }
            catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }

        function populateSite(rec) {
            try {
                let powerSupply = rec.getValue({ fieldId: twcPowerMeter.Fields.POWER_SUPPLY })
                log.debug("powerSupply..", powerSupply)
                let siteId = powerSupply ? recu.lookUp(twcPowerSupply.Type, powerSupply, [twcPowerSupply.Fields.SITE])?.[twcPowerSupply.Fields.SITE]?.value : null
                log.debug('siteId..', siteId)
                siteId ? rec.setValue({ fieldId: twcPowerMeter.Fields.SITE, value: siteId }) : null
            }
            catch (error) {
                core.logDebug('populateSite', error.message);
            }

        }
        return {
            beforeLoad: beforeLoad


        }
    });
