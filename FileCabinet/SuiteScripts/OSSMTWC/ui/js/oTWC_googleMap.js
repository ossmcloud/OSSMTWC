/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../data/oTWC_site.js'],
    (core, coreSql, b64, twcConfig, twcIcons, twcSite) => {
        const _radToKmUnit = 0.0089983083180362; // @@NOTE: in coordinates (lat/lng) this roughly equals 1km

        class GoogleMap {
            #map = null;
            #mapContainer = null;
            #infoWindow = null;
            constructor(mapContainer, data) {
                this.#mapContainer = mapContainer;
                if (data !== undefined) {
                    this.initMap(data);
                }
            }

            initMap(data) {
                var mapHeight = this.#mapContainer.height();
                if (!mapHeight) { mapHeight = this.#mapContainer.parent().height(); }
                this.#map = jQuery(`<div id="twc-google-map"></div>`)
                this.#mapContainer.html(this.#map);
                this.#map.html(`
                    <div id="app-map" style="border: 1px solid var(--grid-color); width: 100%; height: ${mapHeight}px; text-align: center;">
                        <span class="twc-wait-cursor" style="margin-top: ${(mapHeight - 64) / 2}px;">
                            ${twcIcons.ICONS.waitWheel}
                        </span>
                    </div>
                `);
                this.refreshMap(core.utils.toArray(data) || []);
            }

            getDataCoordinates(dataObject) {
                dataObject.address = 'no address';
                if (dataObject.custrecord_twc_site_address) {
                    dataObject.address = `
                        ${dataObject.custrecord_twc_site_address}
                        <br />
                        <i>${dataObject.custrecord_twc_site_address_county_text || ''}</i>
                    `
                }
                dataObject.latitude = dataObject[twcSite.Fields.LATITUDE];
                dataObject.longitude = dataObject[twcSite.Fields.LONGITUDE];
                if (!dataObject.latitude || !dataObject.longitude) { return false; }
                if (isNaN(dataObject.latitude) || isNaN(dataObject.longitude)) { return false; }
                dataObject.coord = { lat: parseFloat(dataObject.latitude), lng: parseFloat(dataObject.longitude) }
                return true;
            }

            async refreshMap(data, searchByCoordInfo) {
                const { Map } = await google.maps.importLibrary("maps");
                const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

                let mapOptions = { mapId: "TWC_MAP", zoom: 10, center: { lat: parseFloat(53.34213715161038), lng: parseFloat(-6.264517099266761) } }

                if (searchByCoordInfo) {
                    if (data.length == 0) { mapOptions.center = searchByCoordInfo.center; }
                } else {
                    if (data.length == 1) {
                        if (this.getDataCoordinates(data[0])) { mapOptions.center = data[0].coord; }
                    }
                }

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
                var safLink = core.url.script('otwc_siteaccess_sl');
                var srfLink = core.url.script('otwc_spacerequest_sl');
                // @@TODO: this suitelet is not there yet
                //var actionLink = core.url.script('otwc_siteaction_sl');        
                var actionLink = siteLink;

                for (var dx = 0; dx < data.length; dx++) {
                    if (!this.getDataCoordinates(data[dx])) { continue; }

                    var color = data[dx].site_level_color || 'blue';
                    const pinSvg = parser.parseFromString(twcIcons.get('locationFill', 24, color), "image/svg+xml",).documentElement;

                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div style="color: black;">
                                ${data[dx].address}
                                <br /><br />
                                <a class="twc" href="${siteLink}&recId=${data[dx].id}" target="_blank">[Info]</a>
                                <a class="twc" href="${actionLink}&recId=${data[dx].id}" target="_blank">[Action]</a>
                                <a class="twc" href="${safLink}&recId=${data[dx].id}" target="_blank">[S.A.F.]</a>
                                <a class="twc" href="${srfLink}&recId=${data[dx].id}" target="_blank">[S.R.F.]</a>
                            </div>
                        `,
                        ariaLabel: data[dx].name,
                    });

                    const marker = new AdvancedMarkerElement({
                        map: map,
                        position: data[dx].coord,
                        id: data[dx].id,
                        title: data[dx].name,
                        content: pinSvg,
                        gmpClickable: true
                    });

                    marker.addListener("click", ({ domEvent, latLng }) => {
                        if (this.#infoWindow) { this.#infoWindow.close(); }
                        infoWindow.setHeaderContent(jQuery(`<div style="color: black; font-weight: bold;">${marker.title}</div>`)[0])
                        infoWindow.open(marker.map, marker);
                        this.#infoWindow = infoWindow;
                    });

                    markers.push(marker);
                }

                if (data.length > 1 || searchByCoordInfo) {
                    var bounds = new google.maps.LatLngBounds();
                    if (searchByCoordInfo) {
                        bounds.extend(new window.google.maps.LatLng(searchByCoordInfo.center.lat - (searchByCoordInfo.radius * _radToKmUnit), searchByCoordInfo.center.lng - (searchByCoordInfo.radius * _radToKmUnit)));
                        bounds.extend(new window.google.maps.LatLng(searchByCoordInfo.center.lat + (searchByCoordInfo.radius * _radToKmUnit), searchByCoordInfo.center.lng + (searchByCoordInfo.radius * _radToKmUnit)));
                    }

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


                map.addListener("dblclick", (e) => {
                    if (this.initMapCallBack) { this.initMapCallBack(e); }
                });
            }

        }


        return {
            RadToKmUnit: _radToKmUnit,
            get: (mapContainer, data) => {
                return new Promise(function (resolve, reject) {
                    try {
                        resolve(new GoogleMap(mapContainer, data));
                    } catch (error) {
                        reject(error);
                    }
                })

            }
        }
    });
