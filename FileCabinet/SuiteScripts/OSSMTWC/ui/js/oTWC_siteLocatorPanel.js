/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_site.js', '../../O/controls/oTWC_ui_table.js', './oTWC_googleMap.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, twcIcons, dialog, twcSite, uiTable, googleMap) => {

        class TWCSiteLocatorPanel {
            #page = null;
            #map = null;
            #sitesTable = null;
            #sitesTableExpanded = false;
            #data = null;
            #dataFiltered = null;
            constructor(options) {
                this.#page = options.page;
                this.#sitesTable = options.table;
                this.#data = options.data;
            }

            get ui() { return this.#page.ui; }

            initPanel() {
                googleMap.get(jQuery('#twc-google-map-container'), this.#data).then(map => {
                    this.#map = map;
                    this.#map.initMapCallBack = e => {
                        this.updateResultsByCoord({
                            center: { lat: e.latLng.lat(), lng: e.latLng.lng() },
                            radius: parseFloat(this.ui.getControl('twc-coord-radius').value) * googleMap.RadToKmUnit,
                        });
                    }

                    this.updateResults();
                    this.initEvents();
                });
            }

            initEvents() {
                this.#page.ui.on('change', e => {
                    try {
                        if (e.id.startsWith('cust')) {
                            this.updateResults();
                        } else if (e.id.startsWith('twc-coord')) {
                            this.updateResultsByCoord();
                        }

                    } catch (error) {
                        dialog.error(error);
                    }
                })
                this.#page.ui.on('click', e => {
                    try {
                        if (e.id == 'twc-action-new-site') {
                            // @@TODO:
                            window.open(core.url.record(twcSite.Type));
                        } else if (e.id == 'twc-action-clear-filter') {
                            this.clearFilters();
                        } else {
                            throw new Error(`Invalid Action ${e.id}`)
                        }
                    } catch (error) {
                        dialog.error(error);
                    }
                })


                // @@TODO: @@REVIEW: we should hook this to this.#sitesTable object
                var table = jQuery('ossm[data-type="table"]');
                table.on('scroll', e => {
                    if (!this.#sitesTableExpanded) {
                        this.expandSiteTable();
                    } else {
                        if (table.scrollTop() == 0 && this.#sitesTableExpanded) {
                            this.expandSiteTable();
                        }
                    }
                })
            }

            clearFilters() {
                core.array.each(this.ui.controls, c => {
                    if (c.id.startsWith('twc-coord') || c.id.startsWith('cust')) {
                        c.value = (c.id == 'twc-coord-radius') ? 5 : null;
                    }
                })
                this.updateResults();
            }

            updateResults() {
                // @@TODO: filter sites on memory OR load filtered list
                var filters = this.ui.getValues();
                console.log(filters)
                this.#dataFiltered = this.#data.filter(s => {
                    var match = true;
                    for (var f in filters) {
                        if (!f.startsWith('cust')) { continue; }
                        if (!filters[f]) { continue; }
                        var values = filters[f].split(',').map(i => { return i?.toString() });
                        match = values.indexOf(s[f]?.toString()) >= 0;
                        if (!match) { break; }
                    }
                    return match;
                });

                this.#sitesTable.refresh(this.#dataFiltered);
                this.updateGoogleMap(null);
            }

            updateResultsByCoord(searchByCoordInfo) {
                var filters = this.ui.getValues();

                var radiusInKm = parseFloat(filters['twc-coord-radius']);
                var radius = radiusInKm * googleMap.RadToKmUnit;
                var srcLat = parseFloat(filters['twc-coord-latitude'])
                var srcLng = parseFloat(filters['twc-coord-longitude'])

                if (searchByCoordInfo) {
                    radiusInKm = searchByCoordInfo.radius / googleMap.RadToKmUnit;
                    radius = searchByCoordInfo.radius
                    srcLat = searchByCoordInfo.center.lat;
                    srcLng = searchByCoordInfo.center.lng;
                    this.ui.getControl('twc-coord-latitude').value = searchByCoordInfo.center.lat;
                    this.ui.getControl('twc-coord-longitude').value = searchByCoordInfo.center.lng;
                }

                if (isNaN(radius) || isNaN(srcLat) || isNaN(srcLng)) { return; }

                this.#dataFiltered = this.#data.filter(s => {
                    var lat = s[twcSite.Fields.LATITUDE];
                    var lng = s[twcSite.Fields.LONGITUDE];
                    if (!(lat >= (srcLat - radius) && lat <= (srcLat + radius))) { return false; }
                    if (!(lng >= (srcLng - radius) && lng <= (srcLng + radius))) { return false; }
                    return true;

                });

                this.#sitesTable.refresh(this.#dataFiltered);
                this.updateGoogleMap({
                    center: { lat: srcLat, lng: srcLng },
                    radius: radiusInKm,
                });
            }

            updateGoogleMap(searchByCoordInfo) {
                this.#map.refreshMap(this.#dataFiltered, searchByCoordInfo);
            }

            expandSiteTable() {
                var deltaHeight = 250;
                if (this.#sitesTableExpanded) { deltaHeight *= -1; }
                this.#sitesTableExpanded = !this.#sitesTableExpanded;
                var topRowHeight = jQuery('#twc-google-map-container').height();
                var tableHeight = jQuery('#omt_sites').closest('ossm').height();

                jQuery('#twc-google-map-container').animate({ height: topRowHeight - deltaHeight }, 350, 'swing');
                jQuery('#twc-google-map-filters').animate({ height: topRowHeight - deltaHeight }, 350, 'swing');
                jQuery('#omt_sites').closest('ossm').animate({ height: tableHeight + deltaHeight }, 350, 'swing');
            }

        }

        return {

            get: function (options) {
                var panel = new TWCSiteLocatorPanel(options);
                panel.initPanel();
                return panel;
            }


        }
    });

