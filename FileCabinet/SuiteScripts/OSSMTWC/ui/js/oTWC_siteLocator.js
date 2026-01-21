/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', '../../O/oTWC_userPref.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_site.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, userPref, dialog, twcSite) => {

        var _infoWindow = null;
        async function initMap() {
            var data = window.twc.page.data.sites || [];
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            const { PinElement } = await google.maps.importLibrary("marker");


            let mapOptions = { mapId: "TWC_MAP", zoom: 14, center: { lat: parseFloat(53.34213715161038), lng: parseFloat(-6.264517099266761) } }

            if (data.length > 0) {
                mapOptions.center = { lat: parseFloat(data[0].site_lat), lng: parseFloat(data[0].site_lng) };
            }

            let map = new Map(document.getElementById("app-map"), mapOptions);

            var markers = [];
            for (var dx = 0; dx < data.length; dx++) {
                if (!data[dx].site_lat || !data[dx].site_lng) { continue; }
                if (isNaN(data[dx].site_lat) || isNaN(data[dx].site_lng)) { continue; }

                var color = data[dx].site_color || 'blue';
                const parser = new DOMParser();
                const pinSvg = parser.parseFromString(omtIcons.get('locationFill', 24, color), "image/svg+xml",).documentElement;

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                    <div style="color: black;">
                        ${data[dx].site_name || ('lat: ' + data[dx].site_lat.toString().substring(0, 7))}
                        <br />
                        ${data[dx].site_addr_1 || ('lng: ' + data[dx].site_lng.toString().substring(0, 7))}
                    </div>`,
                    ariaLabel: data[dx].site_full_name,
                });

                const marker = new AdvancedMarkerElement({
                    map: map,
                    position: { lat: parseFloat(data[dx].site_lat), lng: parseFloat(data[dx].site_lng) },
                    id: data[dx].id,
                    title: data[dx].act_name,
                    //content: pin.element,
                    content: pinSvg,
                    gmpClickable: true
                });

                const d = data[dx];
                d.map = {
                    dataIdx: dx,
                    marker: marker,
                    infoWindow: infoWindow
                }

                marker.addListener("click", ({ domEvent, latLng }) => {
                    if (_infoWindow) { _infoWindow.close(); }
                    infoWindow.setHeaderContent(jQuery(`<div style="color: black; font-weight: bold;">${marker.title}</div>`)[0])
                    infoWindow.open(marker.map, marker);
                    _infoWindow = infoWindow;
                    window.omt.page.selectSite(d.map.dataIdx);

                    console.log(marker.title, d);
                });

                markers.push(marker);
            }

            if (data.length > 1) {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < data.length; i++) {
                    try {
                        if (!data[i].site_lat || !data[i].site_lng) { continue; }
                        if (isNaN(data[i].site_lat) || isNaN(data[i].site_lng)) { continue; }
                        const location = new window.google.maps.LatLng(
                            data[i].site_lat,
                            data[i].site_lng
                        );
                        bounds.extend(location);
                    } catch (error) {
                        console.log(error)
                    }
                }
                map.fitBounds(bounds);
            }

        }



        class TWCSiteLocatorPage extends twcPageBase.TWCPageBase {
            #map = null;
            constructor() {
                super({ scriptId: 'otwc_siteLocator_sl' });
            }

            initPage() {
                this.updateGoogleMap();
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
                            window.open(core.url.record(twcSite.type));
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
                console.log(this.ui.getValues())
                this.updateGoogleMap();
            }

            updateGoogleMap() {

                if (!this.#map) {
                    window.twc.initMap = initMap;
                    this.#map = jQuery('<div id="twc-google-map"></div>')
                    jQuery('#twc-google-map-container').html(this.#map);
                    this.#map.html(`
                        <div id="app-map" style="border: 1px solid var(--grid-color); width: 100%; height: ${jQuery('#twc-google-map-container').height()}px"></div>
                        <script async defer src="https://maps.googleapis.com/maps/api/js?key=${twcConfig.cfg().GOOGLE_API_KEY}&callback=window.twc.initMap"></script>
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

