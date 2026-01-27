/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.date.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/ui/nsSuitelet.js', './views/oTWC_baseView.js', '../ui/modules/oTWC_siteInfoUtils.js'],
    function (core, cored, coreSql, uis, twcBaseView, twcSiteInfoUtils) {

        var PAGE_VERSION = 'v0.01';

        var suiteLet = uis.new({ title: 'TWC Site', script: 'SuiteScripts/OSSMTWC/ui/oTWC_siteInfo_cs.js' });
        suiteLet.get = (context, s) => {

            var pageData = twcBaseView.initPageData(context);
            pageData.siteInfo = twcSiteInfoUtils.getSiteInfo(context.request.parameters.site);

            var html = twcBaseView.initView(PAGE_VERSION, pageData, 'oTWC_siteInfo');

            html = html.replaceAll('{SITE_NAME}', `${pageData.siteInfo.site.name}`)


            var mainInfoHtml = `<div>`;
            core.array.each(pageData.siteInfo.mainFields, fieldGroup => {
                var fieldGroupHtml = `
                    <div>
                        <h2 class="twc">${fieldGroup.title}</h2>
                        <div class="twc-div-table-r twc-div-table-r-compact">
                `;

                core.array.each(fieldGroup.fields, field => {
                    fieldGroupHtml += `
                        <div>
                            <div style="width: 20%;">
                                <label>${field.label}</label>
                            </div>
                            <div>
                                ${pageData.siteInfo.site[field.id]}
                            </div>
                        </div>
                    `    
                })
                
                fieldGroupHtml += `</div></div>`;
                mainInfoHtml += fieldGroupHtml;
            });
            mainInfoHtml += `</div>`;
            html = html.replaceAll('{SITE_MAIN_INFO}', `${mainInfoHtml}`)


            s.form.fieldHtml(html);
        };




        return {
            onRequest: uis.onRequest
        }
    });
