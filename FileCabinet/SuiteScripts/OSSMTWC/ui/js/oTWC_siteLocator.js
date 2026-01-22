/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../O/oTWC_userPref.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_site.js', '../../O/controls/oTWC_ui_table.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, twcIcons, userPref, dialog, twcSite, uiTable) => {

        var _infoWindow = null;
        async function initMap() {
            var data = window.twc.page.data.sites || [];
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            
            let mapOptions = { mapId: "TWC_MAP", zoom: 14, center: { lat: parseFloat(53.34213715161038), lng: parseFloat(-6.264517099266761) } }
            let map = new Map(document.getElementById("app-map"), mapOptions);

            var markers = []; 
            for (var dx = 0; dx < data.length; dx++) {
                data[dx].latitude = data[dx][twcSite.Fields.LATITUDE];
                data[dx].longitude = data[dx][twcSite.Fields.LONGITUDE];
                if (!data[dx].latitude || !data[dx].longitude) { continue; }
                if (isNaN(data[dx].latitude) || isNaN(data[dx].longitude)) { continue; }

                var color = data[dx].site_type_color || 'blue';
                const parser = new DOMParser();
                const pinSvg = parser.parseFromString(twcIcons.get('locationFill', 24, color), "image/svg+xml",).documentElement;

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                    <div style="color: black;">
                        ${data[dx].name || ('lat: ' + data[dx].latitude.toString().substring(0, 7))}
                        <br />
                        ${data[dx].address || ('lng: ' + data[dx].longitude.toString().substring(0, 7))}
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
                    // @@TODO:  marker.id is the site internal id, use it to find the site
                    //window.omt.page.selectSite(marker.map.dataIdx);
                });

                markers.push(marker);
            }

            if (data.length > 0) {
                var bounds = new google.maps.LatLngBounds();
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
                map.fitBounds(bounds);
            }

        }


        class TWCSiteTable {
            #page = null;
            #table = null;
            constructor(page) {
                this.#page = page;

                var unboundCols = [];
                // unboundCols.push({
                //     id: 'checked', title: '<input type="checkbox" class="wkf-log-check-all" />', unbound: true,
                //     styles: { 'text-align': 'center' },
                //     noSort: true,
                //     initValue: (d) => {
                //         if (d.valid === 'NA') { return d.status; }
                //         if (!d.valid) { return omtIcons.get('exclamation', 20); }
                //         return `<input data-id="${d.id}" type="checkbox" class="wkf-log-checked" ${d.checked ? 'checked' : ''}/>`;
                //     }
                // })

                
                this.#table = new uiTable.TableControl(jQuery('#twc_sites_table'), this.colInit, {
                    id: 'omt_sites',
                    unboundCols: unboundCols,
                    // fitScreen: false,
                    // fitContainer: true
                });

                this.#table.onInitEvents = (tbl) => {

                }
            }

            get table() { return this.#table.table; }

            colInit(tbl, col) {
                if (col.id == 'id') { return false; }
                if (col.id == 'cust_id') { return false; }
                if (col.id == 'name') { return false; }
                if (col.id == 'site_type_color') { return false; }

                //col.noFilter = true;

                var uf = window.twc.page.data.data.sitesInfo.userFields.find(f => { return f.field == col.id.replace('_text', '') });
                if (uf) {
                    col.title = uf.label;
                    if (uf.listRecord && !col.id.endsWith('_text')) { return false; }
                }

                

                if (col.id == twcSite.Fields.SITE_NAME) { col.addCount = true; }
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
                        console.log(e);
                        this.updateResults();
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
                        } else {
                            throw new Error(`Invalid Action ${e.id}`)
                        }
                    } catch (error) {
                        dialog.error(error);
                    }
                })
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
                        
                        if (!match) { break ; }

                    }
                    
                    return match;
                });

                this.#sitesTable.refresh(window.twc.page.data.sites);
                this.updateGoogleMap();
            }

            updateGoogleMap() {

                if (!this.#map) {
                    window.twc.initMap = initMap;
                    this.#map = jQuery('<div id="twc-google-map"></div>')
                    jQuery('#twc-google-map-container').html(this.#map);
                    this.#map.html(`
                        <div id="app-map" style="border: 1px solid var(--grid-color); width: 100%; height: ${jQuery('#twc-google-map-container').height()}px"></div>
                        <script async defer src="https://maps.googleapis.com/maps/api/js?key=${twcConfig.cfg().GOOGLE_API_KEY}&callback=window.twc.initMap&loading=async"></script>
                    `);
                } else {
                    // @@TODO: update with results


                    initMap();
                }


                
            }




        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteLocatorPage())
            }


        }
    });

