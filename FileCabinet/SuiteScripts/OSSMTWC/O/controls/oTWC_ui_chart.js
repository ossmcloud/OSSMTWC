/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.j.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_icons.js', './oTWC_ui_ctrlBase.js'],
    (core, b64, icons, ctrlBase) => {
        const _chart_plugin = {
            id: 'customCanvasBackgroundColor',
            beforeDraw: function (chart, args, options) {
                const ctx = chart.ctx;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = options.color || '#99ffff';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        class ChartJs {
            #dataSource = null;
            #options = null;
            #ui = null;
            #canvas = null;
            #chart = null;
            constructor(options, dataSource) {
                if (options.jquery) {
                    this.#ui = options;
                    this.#options = {
                        id: this.#ui.data('id'),
                        type: 'chart'
                    }
                    this.#dataSource = JSON.parse(this.#ui.find('data').html() || '[]');
                    //this.initEvents();

                } else {
                    this.#options = options || {};
                    this.#options.type = 'chart';

                    this.#dataSource = dataSource || null;

                }
            }

            get id() { return this.#options.id; }
            get chart() { return this.#chart; }

            render(container) {
                var html = `
                    <canvas id="${this.#options.id}" class="oTWC-chart"></canvas>
                `;

                html = ctrlBase.render(html, {
                    client: this.ui != null,
                    type: this.#options.type,
                });

                if (container) {
                    html = jQuery(html);
                    this.#ui = html;
                    this.#canvas = this.#ui.find('canvas');
                    container.html(html);
                    this.drawChart();
                }

                return html;
            }

            chartOptions() {
                var o = {
                    type: this.#options.chartType || 'line',
                    data: { labels: this.#dataSource.labels, datasets: this.#dataSource.dataSets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            customCanvasBackgroundColor: {
                                color: window.getComputedStyle(document.body).getPropertyValue('--main-bkgd-color')
                            },
                            legend: {
                                align: 'start',
                                position: 'left',
                                labels: { font: { size: 13 }, color: window.getComputedStyle(document.body).getPropertyValue('--main-color') },
                                maxWidth: this.#options.legend?.maxWidth
                            },
                        },
                        scales: {
                            y: { display: this.#options.y?.display, stacked: this.#options.stacked, ticks: { color: window.getComputedStyle(document.body).getPropertyValue('--main-color'), font: { size: 12 } } },
                            x: { display: this.#options.x?.display, stacked: this.#options.stacked, ticks: { color: window.getComputedStyle(document.body).getPropertyValue('--main-color'), font: { size: 12 } } }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index',
                        }
                    },
                    plugins: [_chart_plugin],
                }

                return o;
            }

            drawChart() {
                this.#chart = new Chart(this.#canvas[0], this.chartOptions());

                if (!window.oTWC) { window.oTWC = {}; }
                if (!window.oTWC.charts) { window.oTWC.charts = []; };
                window.oTWC.charts.push(this.#chart);
            }

        }

        return {

            Chart: ChartJs,
            render: (options, dataSource, container) => {
                var ctrl = new ChartJs(options, dataSource);
                if (container) {
                    ctrl.render(container);
                    return ctrl;
                } else {
                    ctrl.render();
                }
            },
            ui: (element) => {
                return new ChartJs(element);
            }
        }
    })