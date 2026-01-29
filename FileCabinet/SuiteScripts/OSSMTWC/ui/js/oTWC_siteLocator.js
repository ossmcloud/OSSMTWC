/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_site.js', '../../O/controls/oTWC_ui_table.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, twcIcons, dialog, twcSite, uiTable) => {

        const _radToKmUnit = 0.009009; // @@NOTE: in coordinates (lat/lng) this roughly equals 1km

        var _infoWindow = null;
        async function initMap(searchByCoordInfo) {
            var data = window.twc.page.data.sites || [];
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            let mapOptions = { mapId: "TWC_MAP", zoom: 14, center: { lat: parseFloat(53.34213715161038), lng: parseFloat(-6.264517099266761) } }

            if (searchByCoordInfo && data.length == 0) { mapOptions.center = searchByCoordInfo.center; }

            let map = new Map(document.getElementById("app-map"), mapOptions);

            var markers = []; const parser = new DOMParser();

            if (searchByCoordInfo) {
                const pinSvg = parser.parseFromString(twcIcons.get('center', 24, 'red'), "image/svg+xml",).documentElement;
                const marker = new AdvancedMarkerElement({
                    map: map,
                    position: { lat: parseFloat(searchByCoordInfo.center.lat), lng: parseFloat(searchByCoordInfo.center.lng) },
                    content: pinSvg,
                    anchorTop: '-45%'
                });
                markers.push(marker);

                const radiusCircle = new google.maps.Circle({
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    map,
                    center: searchByCoordInfo.center,
                    radius: searchByCoordInfo.radius * 1000,
                });

            }

            var siteLink = core.url.script('otwc_siteinfo_sl');

            for (var dx = 0; dx < data.length; dx++) {
                data[dx].latitude = data[dx][twcSite.Fields.LATITUDE];
                data[dx].longitude = data[dx][twcSite.Fields.LONGITUDE];
                if (!data[dx].latitude || !data[dx].longitude) { continue; }
                if (isNaN(data[dx].latitude) || isNaN(data[dx].longitude)) { continue; }

                var color = data[dx].site_type_color || 'blue';
                const pinSvg = parser.parseFromString(twcIcons.get('locationFill', 24, color), "image/svg+xml",).documentElement;

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                    <div style="color: black;">
                        ${data[dx].name || ('lat: ' + data[dx].latitude.toString().substring(0, 7))}
                        <br />
                        ${data[dx].address || ('lng: ' + data[dx].longitude.toString().substring(0, 7))}
                        <br /><br />
                        <a class="twc" href="${siteLink}&recId=${data[dx].id}" target="_blank">view site info</a>
                    </div>`,
                    ariaLabel: data[dx].name,
                });

                const marker = new AdvancedMarkerElement({
                    map: map,
                    position: { lat: parseFloat(data[dx].latitude), lng: parseFloat(data[dx].longitude) },
                    id: data[dx].id,
                    title: data[dx].name,
                    content: pinSvg,
                    gmpClickable: true
                });

                marker.addListener("click", ({ domEvent, latLng }) => {
                    if (_infoWindow) { _infoWindow.close(); }
                    infoWindow.setHeaderContent(jQuery(`<div style="color: black; font-weight: bold;">${marker.title}</div>`)[0])
                    infoWindow.open(marker.map, marker);
                    _infoWindow = infoWindow;
                });

                markers.push(marker);
            }

            var bounds = new google.maps.LatLngBounds();
            if (searchByCoordInfo) {
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(new window.google.maps.LatLng(searchByCoordInfo.center.lat - (searchByCoordInfo.radius * _radToKmUnit), searchByCoordInfo.center.lng - (searchByCoordInfo.radius * _radToKmUnit)));
                bounds.extend(new window.google.maps.LatLng(searchByCoordInfo.center.lat + (searchByCoordInfo.radius * _radToKmUnit), searchByCoordInfo.center.lng + (searchByCoordInfo.radius * _radToKmUnit)));
            }

            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    try {
                        if (!data[i].latitude || !data[i].longitude) { continue; }
                        if (isNaN(data[i].latitude) || isNaN(data[i].longitude)) { continue; }
                        const location = new window.google.maps.LatLng(
                            data[i].latitude,
                            data[i].longitude
                        );
                        bounds.extend(location);
                    } catch (error) {
                        console.log(error)
                    }
                }

            }

            if (data.length > 0 || searchByCoordInfo) { map.fitBounds(bounds); }

            map.addListener("dblclick", (e) => {
                if (window.twc.initMapCallBack) { window.twc.initMapCallBack(e); }
            });

        }


        class TWCSiteTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var safLink = core.url.script('otwc_siteaccess_sl');
                var unboundCols = [];
                unboundCols.push({
                    id: 'open_saf', title: 'SAF', unbound: true,
                    styles: { 'text-align': 'center' },
                    noSort: true,
                    sortIdx: 999,
                    initValue: (d) => {
                        return `<a href="${safLink}&recId=${d.id}">view</a>`;
                    }
                })
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,
                    // fitScreen: false,
                    // fitContainer: true
                });

                this.#table.onInitEvents = (tbl) => {
                    // @@TODO: this deows not work
                    // tbl.table.on('scroll', e => {
                    //     console.log('scrll', e)
                    // })
                }
            }

            get table() { return this.#table.table; }

            colInit(tbl, col) {
                if (col.id == 'id') { return false; }
                if (col.id == 'cust_id') { return false; }
                if (col.id == 'name') { return false; }
                if (col.id == 'site_type_color') { return false; }


                var uf = window.twc.page.data.data.sitesInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    col.title = uf.label;
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                }

                if (col.id == twcSite.Fields.SITE_NAME || col.id == twcSite.Fields.SITE_ID) {
                    col.addCount = col.id == twcSite.Fields.SITE_NAME;
                    col.link = {
                        url: core.url.script('otwc_siteinfo_sl') + '&recId=${id}',
                        valueField: 'id'
                    }
                }
                if (col.id == twcSite.Fields.LATITUDE || col.id == twcSite.Fields.LONGITUDE) { col.styles = { 'text-align': 'right' }; }
            }

            refresh(data) {
                var resetCols = (this.#table.table?.data.length == 0)
                this.#table.refresh(data, resetCols);
            }



        }


        class TWCSiteLocatorPage extends twcPageBase.TWCPageBase {
            #map = null;
            #sitesTable = null;
            #sitesTableExpanded = false;
            constructor() {
                super({ scriptId: 'otwc_siteLocator_sl' });
            }

            initPage() {
                try {
                    //jQuery('.twc-container-outer').css('overflow', 'auto')
                    this.#sitesTable = new TWCSiteTable(this);
                    this.updateResults();
                } catch (error) {
                    throw error
                } finally {
                    jQuery('.twc-overlay').remove();
                }
            }

            initEvents() {
                this.ui.on('change', e => {
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
                this.ui.on('click', e => {
                    try {
                        if (e.id == 'twc-action-new-site') {
                            // @@TODO:
                            //dialog.message('under development');
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
                window.twc.page.data.sites = window.twc.page.data.data.sitesInfo.sites.filter(s => {
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

                this.#sitesTable.refresh(window.twc.page.data.sites);
                this.updateGoogleMap(null);
            }

            updateResultsByCoord(searchByCoordInfo) {


                var filters = this.ui.getValues();

                var radiusInKm = parseFloat(filters['twc-coord-radius']);
                var radius = radiusInKm * _radToKmUnit;
                var srcLat = parseFloat(filters['twc-coord-latitude'])
                var srcLng = parseFloat(filters['twc-coord-longitude'])

                if (searchByCoordInfo) {
                    radiusInKm = searchByCoordInfo.radius / _radToKmUnit;
                    radius = searchByCoordInfo.radius
                    srcLat = searchByCoordInfo.center.lat;
                    srcLng = searchByCoordInfo.center.lng;
                    this.ui.getControl('twc-coord-latitude').value = searchByCoordInfo.center.lat;
                    this.ui.getControl('twc-coord-longitude').value = searchByCoordInfo.center.lng;
                }

                if (isNaN(radius) || isNaN(srcLat) || isNaN(srcLng)) { return; }

                window.twc.page.data.sites = window.twc.page.data.data.sitesInfo.sites.filter(s => {

                    var lat = s[twcSite.Fields.LATITUDE];
                    var lng = s[twcSite.Fields.LONGITUDE];

                    if (!(lat >= (srcLat - radius) && lat <= (srcLat + radius))) {
                        return false;
                    }

                    if (!(lng >= (srcLng - radius) && lng <= (srcLng + radius))) {
                        return false;
                    }

                    return true;

                });

                this.#sitesTable.refresh(window.twc.page.data.sites);
                this.updateGoogleMap({
                    center: { lat: srcLat, lng: srcLng },
                    radius: radiusInKm,
                });
            }

            updateGoogleMap(searchByCoordInfo) {

                if (!this.#map) {
                    window.twc.initMap = initMap;
                    window.twc.initMapCallBack = e => {
                        this.updateResultsByCoord({
                            center: { lat: e.latLng.lat(), lng: e.latLng.lng() },
                            radius: parseFloat(this.ui.getControl('twc-coord-radius').value) * _radToKmUnit,
                        });
                    }
                    this.#map = jQuery('<div id="twc-google-map"></div>')
                    jQuery('#twc-google-map-container').html(this.#map);
                    this.#map.html(`
                        <div id="app-map" style="border: 1px solid var(--grid-color); width: 100%; height: ${jQuery('#twc-google-map-container').parent().height()}px"></div>
                        <script async defer src="https://maps.googleapis.com/maps/api/js?key=${twcConfig.cfg().GOOGLE_API_KEY}&callback=window.twc.initMap&loading=async"></script>
                    `);
                } else {
                    initMap(searchByCoordInfo);
                }

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

            init: function () {
                twcPageBase.init(new TWCSiteLocatorPage())
            }


        }
    });

