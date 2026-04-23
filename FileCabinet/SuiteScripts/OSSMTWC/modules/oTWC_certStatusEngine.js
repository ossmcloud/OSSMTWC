/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js'],
    function (core, coreSql, recu, twcProfile, twcCompany, twcUtils) {
        var _today = null;
        function today() {
            if (!_today) {
                _today = twcUtils.today();
            }
            return _today;
        }
        // function dateToNumber(d) {
        //     if (!d) { return null; }
        //     return parseInt(d.replaceAll('-', ''));
        // }

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

                            if (twcUtils.Certs[cert].safePass) {
                                // @@NOTE: Accreditation Status should auto-change to SP Expired when Safe Pass certification date elapses.
                                //         Note that the overall profile accreditation is driven by the Safe Pass state only.
                                fields.push(twcProfile.ACCREDITATION_STATUS);
                                values.push(twcUtils.ProfileAccreditationStatus.SPExpired);

                            }
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





        function getCompanyStatus(company, insuranceCode) {
            var exDate = company[`custrecord_twc_co_${insuranceCode}_expiry`];
            if (!exDate) { return twcUtils.NoActiveExpired.No }
            if (exDate <= today()) {
                return twcUtils.NoActiveExpired.Expired;
            } else {
                if (company[`custrecord_twc_co_${insuranceCode}_status`] == twcUtils.NoActiveExpired.Pending) {
                    return twcUtils.NoActiveExpired.Pending;
                } else {
                    return twcUtils.NoActiveExpired.Active;
                }
            }
        }

        function setCompanyStatus(company, insuranceCode) {
            var s = getCompanyStatus(company, insuranceCode);
            // if (s != company[`custrecord_twc_co_${insuranceCode}_status`]) {
            //     return {
            //         field: `custrecord_twc_co_${insuranceCode}_status`,
            //         value: s
            //     }
            // }

            return {
                changed: s != company[`custrecord_twc_co_${insuranceCode}_status`],
                field: `custrecord_twc_co_${insuranceCode}_status`,
                value: s
            }
        }
        function validateCompanyAccreditation(options) {
            var restart = null;
            var companies = twcCompany.select({ noAlias: true, where: [{ field: 'id', op: '>', values: options?.fromId || 0 }], orderBy: 'id' });
            core.array.each(companies, c => {
                try {

                    var accrStatus = null;      //CompanyAccreditationStatus

                    var fields = []; var values = [];
                    for (var ins in twcUtils.Insurances) {
                        var res = setCompanyStatus(c, twcUtils.Insurances[ins].code);
                        if (res) {
                            // @@NOTE: PI insurance expiry should be ignored here.
                            if (twcUtils.Insurances[ins].code != 'pi') {
                                if (res.value == twcUtils.NoActiveExpired.Expired) {
                                    // @@NOTE: If the status of any insurance is Expired AND the Insurance Mandatory field for that insurance is Yes, then the overall Company Accreditation Status should be set to Certs Expired
                                    accrStatus = twcUtils.CompanyAccreditationStatus.CertsExpired;
                                }
                                if (res.changed) {
                                    fields.push(res.field);
                                    values.push(res.value);
                                }
                            }
                        }
                    }

                    // @@NOTE: If the Accredited Contractor Expiry date contains data and elapses, the Company Accreditation Status should switch to ACA to be Renewed
                    //         UNLESS the Accreditation Status is "Certs Expired" which takes precedence
                    if (c[twcCompany.Fields.ACCREDITED_CONTRACTOR_EXPIRY] && c[twcCompany.Fields.ACCREDITED_CONTRACTOR_EXPIRY] <= today() && accrStatus != twcUtils.CompanyAccreditationStatus.CertsExpired) {
                        accrStatus = twcUtils.CompanyAccreditationStatus.ToBeRenewed;
                    }

                    if (accrStatus && accrStatus != c[twcCompany.Fields.ACCREDITATION_STATUS]) {
                        fields.push(twcCompany.Fields.ACCREDITATION_STATUS);
                        values.push(accrStatus);
                    }

                    if (values.length > 0) {
                        core.logDebug('validateCompanyAccreditation', `${c.id}: ${JSON.stringify(fields)} - ${JSON.stringify(values)}`);
                        recu.submit(twcCompany.Type, c.id, fields, values);
                    }

                    if (core.env.units() < 50) {
                        restart = { lastId: c.id };
                        return false;
                    }

                } catch (error) {
                    core.logError('validateCertStatuses', `${c.id}: ${error.message}`);
                }
            })

            return restart;
        }


        return {
            validateCertStatuses: validateCertStatuses,
            validateCompanyAccreditation: validateCompanyAccreditation
        }
    });
