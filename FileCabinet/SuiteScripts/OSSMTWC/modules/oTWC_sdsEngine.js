/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_utils.js', '../data/oTWC_srf.js', '../data/oTWC_sds.js'],
    function (core, coreSql, recu, twcUtils, twcSrf, twcSds) {



        function getSds(srf) {
            var sdsId = coreSql.first(`select id from ${twcSds.Type} where ${twcSds.Fields.SRF} = ${srf.id}`)?.id;
            var sds = twcSds.get(sdsId);
            if (!sdsId) {
                sds.sRF = srf.id;
                sds.status = twcUtils.SdsStatus.Draft;
                sds.save();
            }
            return sds;
        }

        function getFormData(srf) {
            return twcSds.select({ where: { [twcSds.Fields.SRF]: srf.id }, useNames: true, returnFirst: true });
        }


        return {
            getSds: getSds,
            getFormData: getFormData
        }

    });
