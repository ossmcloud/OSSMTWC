/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_company.js', '../../data/oTWC_companyUI.js'],
    (core, coreSQL, twcCompany, twcCompanyUI) => {



        return {
            getCompanyInfoPanels: twcCompanyUI.getCompanyInfoPanels,
            getCompanyProfilesPanel: twcCompanyUI.getCompanyProfilesPanel,


            getProfileInfo(pageData) {

                if (!pageData.userInfo.companyProfile) { throw new Error('There is no company profile associated to your profile, contact TWC Administrator to get this rsesolved') }

                return twcCompany.select({ noAlias: true, where: { id: pageData.userInfo.companyProfile?.id || 0 } })[0];

            }
        }
    });
