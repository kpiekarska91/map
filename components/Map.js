import {Map as MapOSM, View} from 'ol';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import Overlay from 'ol/Overlay.js';
import Search from './Search';
import Marker from './Marker';
import MarkerCluster from './MarkerCluster';

/**
 * Represents a Map object.
 * @constructor
 * @param {string} brand - The brand of the map.
 */
export default class Map {
    /**
     * @param {string} brand - The brand name of the constructor.
     * @return {void}
     */
    constructor(brand) {
        this.brand = brand;
        this.marker = new Marker(brand);
        this.distanceRange = {min: 20, max: 50};
        this.popoverInstance = null;

        this.initializeMapAndMarkers()
            .then(markersData => {
                this.initializeMap(markersData);
            })
    }

    /**
     * Initializes the map and markers asynchronously.
     *
     * @returns {Promise} A promise that resolves with the markers data or rejects with an error.
     */
    async initializeMapAndMarkers() {
        try {
            return await this.marker.fetchMarkersData();
        } catch (error) {
            console.error('Error initializing map and markers:', error);
        }
    }

    /**
     * Initializes the map with markers and other necessary components.
     *
     * @param {MarkerData[]} markersData - Array of marker data objects.
     * @return {void}
     */
    initializeMap(markersData) {
        const features = this.generateFeatures(markersData);
        const tileLayer = this.generateTileLayer();
        const markerCluster = this.generateMarkerCluster(features);
        const mapView = this.generateMapView();

        this.map = this.generateMapOSM(tileLayer, markerCluster.layer, mapView);
        this.search = new Search(this.map);
        const popup = this.initializePopup();
        this.addEventListeners(popup);
    }

    /**
     * Generate features based on markers data.
     *
     * @param {Array<Object>} markersData - The data of markers containing information such as lng, lat, name, street, number, code and city.
     * @returns {Array<Object>} An array of features generated based on the markers data.
     */
    generateFeatures(markersData) {
        return markersData.map(marker => {
            const coordinates = [parseFloat(marker.lng), parseFloat(marker.lat)];
            const markup = `<strong>${marker.name}</strong><br>${marker.street} ${marker.number}<br>${marker.code} ${marker.city}`;
            return this.marker.createMarker(coordinates, markup);
        });
    }

    generateTileLayer() {
        return new TileLayer({source: new OSM()});
    }

    generateMarkerCluster(features) {
        return new MarkerCluster(features, this.brand, this.distanceRange.max, this.distanceRange.min);
    }

    generateMapView() {
        return new View({
            center: fromLonLat([19.346032, 52.230791]),
            zoom: 7,
            minZoom: 7,
            maxZoom: 219,
        });
    }

    /**
     * Generates an OSM map with the given tile layer, marker cluster layer, and map view.
     *
     * @param {TileLayer} tileLayer - The tile layer to be used for the map.
     * @param {MarkerClusterLayer} markerClusterLayer - The marker cluster layer to be used for the map.
     * @param {Object} mapView - The map view object specifying the initial view settings.
     * @return {MapOSM} - The generated OSM map object.
     */
    generateMapOSM(tileLayer, markerClusterLayer, mapView) {
        return new MapOSM({
            layers: [tileLayer, markerClusterLayer],
            target: 'map',
            view: mapView,
        });
    }

    /**
     * Initializes and adds a popup to the map.
     *
     * @returns {Overlay} The newly created popup.
     */
    initializePopup() {
        const element = document.getElementById('popup');
        const popup = new Overlay({
            element,
            positioning: 'bottom-center',
            stopEvent: false,
        });
        this.map.addOverlay(popup);
        return popup;
    }

    /**
     * Attaches event listeners to handle map interactions.
     *
     * @param {Popup} popup - The popup instance to interact with.
     */
    addEventListeners(popup) {
        this.map.on('movestart', () => this.disposePopover());
        this.map.on('click', evt => this.popupInteraction(evt, popup));
    }

    popupInteraction(evt, popup) {
        const feature = this.map.forEachFeatureAtPixel(evt.pixel, (f) => f);
        this.disposePopover();
        if (!feature) {
            popup.setPosition(undefined);
            return;
        }
        const size = feature.get('features').length;
        if (size > 1) return;
        popup.setPosition(evt.coordinate);
        this.initializePopoverElement(feature, popup.getElement());
    }

    /**
     * Initialize the popover element.
     * @param {Object} feature - The feature object.
     * @param {HTMLElement} element - The HTML element to bind the popover to.
     * @return {void}
     */
    initializePopoverElement(feature, element) {
        this.popoverInstance = new bootstrap.Popover(element, {
            placement: 'top',
            html: true,
            content: feature.get('features')[0].get('name'),
        });
        this.popoverInstance.show();
    }

    disposePopover() {
        if (this.popoverInstance) {
            this.popoverInstance.dispose();
            this.popoverInstance = null;
        }
    }


}
