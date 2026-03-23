/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_profile.js', '../data/oTWC_utils.js'],
    function (core, coreSql, recu, twcProfile, twcUtils) {
        var _today = null;
        function today() {
            if (!_today) { _today = twcUtils.today(); }
            return _today;
        }

        function getCertStatus(profile, certCode) {
            var exDate = profile[`custrecord_twc_prof_${certCode}_cert_exp`];
            if (!exDate) { return twcUtils.NoActiveExpired.No }
            if (exDate <= today()) {
                return twcUtils.NoActiveExpired.Expired;
            } else {
                if (profile[`custrecord_twc_prof_${certCode}_cert_sts`] == twcUtils.NoActiveExpired.Pending) {
                    return twcUtils.NoActiveExpired.Pending;
                } else {
                    return twcUtils.NoActiveExpired.Active;
                }
            }
        }

        function setCertStatus(profile, certCode) {
            var s = getCertStatus(profile, certCode);
            if (s != profile[`custrecord_twc_prof_${certCode}_cert_sts`]) {
                return {
                    field: `custrecord_twc_prof_${certCode}_cert_sts`,
                    value: s
                }
            }
        }

        function validateCertStatuses(options) {
            var restart = null;
            var profiles = twcProfile.select({ noAlias: true, where: [{ field: 'id', op: '>', values: options?.fromId || 0 }], orderBy: 'id' });
            core.array.each(profiles, p => {
                try {

                    var fields = []; var values = [];
                    for (var cert in twcUtils.Certs) {
                        var res = setCertStatus(p, twcUtils.Certs[cert].code);
                        if (res) {
                            fields.push(res.field);
                            values.push(res.value);
                        }
                    }

                    if (values.length > 0) {
                        core.logDebug('validateCertStatuses', `${p.id}: ${JSON.stringify(fields)} - ${JSON.stringify(values)}`);
                        
                        recu.submit(twcProfile.Type, p.id, fields, values);
                    }

                    if (core.env.units() < 50) {
                        restart = { lastId: p.id };
                        return false;
                    }

                } catch (error) {
                    core.logError('validateCertStatuses', `${p.id}: ${error.message}`);
                }
            })

            return restart;
        }

        return {
            validateCertStatuses: validateCertStatuses
        }
    });
