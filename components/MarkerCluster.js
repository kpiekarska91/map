import {Cluster, Vector as VectorSource} from 'ol/source.js';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';

/**
 * Represents a marker cluster.
 *
 * @class
 */
export default class MarkerCluster {
    /**
     * @param {Array<Object>} features - An array of features.
     * @param {string} brand - The brand name.
     * @param {number} [distanceInput=50] - The distance threshold for clustering.
     * @param {number} [minDistanceInput=20] - The minimum distance between clusters.
     */
    constructor(features, brand, distanceInput = 50, minDistanceInput = 20) {
        const vectorSource = new VectorSource({features});
        this.brand = brand;

        const clusterSource = new Cluster({
            distance: parseInt(distanceInput,10),
            minDistanceInput: parseInt(minDistanceInput,10),
            source: vectorSource,
        });

        this.layer = new VectorLayer({
            source: clusterSource,
            style: feature => this.clusterStyle(feature),
        });
    }

    /**
     * Generates a cluster style for a given feature.
     *
     * @param {Feature} feature - The feature to generate the cluster style for.
     * @return {Style} The generated cluster style.
     */
    clusterStyle(feature) {
        const size = feature.get('features').length;

        let iconSrc = '/images/' + this.brand + this.getIcon(size);

        return new Style({
            image: new Icon({
                crossOrigin: 'anonymous',
                src: iconSrc,
                scale: 1,
            }),
            text: new Text({
                text: size.toString(),
                fill: new Fill({color: '#fff'}),
            }),
        });
    }

    /**
     * Retrieves the icon path based on the given size.
     *
     * @param {number} size - The size value used to determine the icon path.
     * @return {string} - The path of the icon corresponding to the size value.
     */
    getIcon(size) {
        if (size < 2) return '/marker.png';
        if (size < 5) return '/cluster_small.png';
        if (size < 10) return '/cluster_medium.png';
        return '/cluster_big.png';
    }
}
