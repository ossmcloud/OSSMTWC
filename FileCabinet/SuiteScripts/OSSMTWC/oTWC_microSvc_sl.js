/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope public
 *@NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['O/suitlet', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_config.js'],
    function (uis, core, coreSQL, recu, twcConfig) {
        var suiteLet = uis.new({ title: 'TWC Micro Service' });
        suiteLet.get = (context, s) => {
            return { status: 'success' };
        }

        suiteLet.post = (context, s) => {
            if (context.request.parameters.userPref == 'T') {
                twcConfig.setUserPref(context, context.request.body);
                return { status: 'success' };
            } else {
                throw new Error('Invalid or unrecognised action');
            }
        }

        return {
            onRequest: uis.onRequest
        }
    });
