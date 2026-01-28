/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../data/oTWC_site.js'],
    (core, coreSql, b64, twcConfig, twcIcons, twcSite) => {

        class GoogleMap {
            #map = null;
            #mapContainer = null;
            constructor(mapContainer, data) {
                this.#mapContainer = mapContainer;
                if (data !== undefined) {
                    this.initMap(data);
                }
            }

            initMap(data) {
                this.#map = jQuery('<div id="twc-google-map"></div>')
                this.#mapContainer.html(this.#map);
                this.#map.html(`<div id="app-map" style="border: 1px solid var(--grid-color); width: 100%; height: ${this.#mapContainer.height()}px"></div>`);
                this.refreshMap(data || {});
            }

            async refreshMap(data) {
                const { Map } = await google.maps.importLibrary("maps");
                const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

                let mapOptions = { mapId: "TWC_MAP", zoom: 10, center: { lat: parseFloat(53.34213715161038), lng: parseFloat(-6.264517099266761) } }


                data.latitude = data[twcSite.Fields.LATITUDE];
                data.longitude = data[twcSite.Fields.LONGITUDE];
                if (isNaN(data.latitude) || isNaN(data.longitude)) { return; }
                mapOptions.center.lat = data.latitude;
                mapOptions.center.lng = data.longitude;

                let map = new Map(this.#map.find('#app-map')[0], mapOptions);

                var markers = []; const parser = new DOMParser();

                var color = data.site_type_color || 'blue';
                const pinSvg = parser.parseFromString(twcIcons.get('locationFill', 24, color), "image/svg+xml",).documentElement;

                const marker = new AdvancedMarkerElement({
                    map: map,
                    position: { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) },
                    id: data.id,
                    title: data.name,
                    content: pinSvg,
                    gmpClickable: true
                });
                markers.push(marker);
            }

        }


        return {
            get: (mapContainer, data) => {
                return new GoogleMap(mapContainer, data)
            }
        }
    });
