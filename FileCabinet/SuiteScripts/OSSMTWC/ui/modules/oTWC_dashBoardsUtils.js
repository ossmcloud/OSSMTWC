/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', '../../data/oTWC_icons.js'],
    (core, coreSQL, twcIcons) => {


        const _dashboards = [
            {
                id: 1,
                title: 'Draft SRFs',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 11',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 2,
                title: 'Initial Review Required',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 1',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 3,
                title: 'TL Check Required',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 2',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 4,
                title: 'Feedback to be Issued'
            },
            {
                id: 5,
                title: 'Feedback Issued await response',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 3',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 6,
                title: 'Drawing Required'
            },
            {
                id: 7,
                title: 'Customer to Accept SRF',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 5',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 8,
                title: 'Agreement to be issued',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 6',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 9,
                title: 'Agreement to Review',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 8',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 10,
                title: 'Agreement to be Executed',
                sql: {
                    tl: 'select count(*) as c from customrecord_twc_srf where custrecord_twc_srf_status = 12',
                    cust: '',
                    vend: '',
                }
            },
            {
                id: 11,
                title: 'Permit Works'
            },


        ]

        const _shortCuts = [
            { title: '' }
        ]


        function buildDashHtml(dashboard) {
            return `
                <div class="twc-dashboard" data-id="${dashboard.id}">
                    <div class="twc-dashboard-title">
                        ${dashboard.title}
                    </div>
                    <div class="twc-dashboard-content">
                        <span class="twc-wait-cursor">
                            ${twcIcons.get('waitWheel', 34)}
                        </span>
                    </div>
                </div>
            `
        }


        function buildDashboardsHtml(userInfo) {
            var html = '';
            core.array.each(_dashboards, dash => {
                html += buildDashHtml(dash);
            })
            return html;
        }

        function runDashboard(userInfo, id) {
            try {
                var dash = _dashboards.find(d => { return d.id == id; })
                if (!dash) { throw new Error(`No dashboard found [${id}]`) }

                var sql = '';
                if (userInfo.isEmployee) {
                    sql = dash.sql?.tl;
                } else if (userInfo.isBoth) {
                    sql = dash.sql?.both;
                } else if (userInfo.isVendor) {
                    sql = dash.sql?.vend;
                } else if (userInfo.isCust) {
                    sql = dash.sql?.cust;

                }

                if (!sql) { throw new Error(`No dashboard sql found [${id}]`) }

                return coreSQL.first(sql)?.c || 0;
            } catch (error) {
                return `
                    <div>
                        ${twcIcons.get('sadFace', 28, 'red')}
                    </div>
                    <div style="font-size: 0.5em; font-weight: normal;">
                        ${error.message}
                    </div>
                `;
            }

        }

        return {

            buildDashboardsHtml: buildDashboardsHtml,
            runDashboard: runDashboard

        }
    });
