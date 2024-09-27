import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { fromLonLat } from 'ol/proj.js';
import { Icon, Style } from 'ol/style.js';
class Marker {
    constructor(brand) {
        this.brand = brand;
    }
    createMarker(coordinates, name, scale = 1) {
        return new Feature({
            geometry: new Point(fromLonLat(coordinates)),
            name,
            style: new Style({
                image: new Icon({
                    crossOrigin: 'anonymous',
                    src: '/images/' + this.brand + '/marker.png',
                    scale,
                }),
            }),
        });
    }

    fetchMarkersData() {
        return fetch('map.json')
        // return fetch('/api/' + this.brand)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    alert('Nieznana marka: '+ this.brand );
                    return [];
                }
            })
            .catch(error => {
                console.error('Error fetching markers:', error);
                return [];
            });
    }
}

export default Marker;

