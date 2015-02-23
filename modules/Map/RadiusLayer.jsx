var SearchFormStore = require('../stores/SearchFormStore.jsx');
var SearchPlace = require('../containers/SearchPlace.jsx');
var Radius = require('../containers/Radius.jsx');

class RadiusLayer {
  constructor(map) {
    this.map = map;
    google.maps.event.addListener(map, 'click', (e) => {
      this.setRadius("destination", e.latLng.lat(), e.latLng.lng());
    });
    google.maps.event.addListener(map, 'rightclick', (e) => {
      this.setRadius("origin", e.latLng.lat(), e.latLng.lng());
    });
  }
  setRadius(direction, lat, lng) {
    SearchFormStore.setField(direction, new SearchPlace({
      mode: "radius",
      value: new Radius({
        radius: 250,
        lat: lat,
        lng: lng
      })
    }), "select");
    SearchFormStore.search();
  }
}

module.exports = RadiusLayer;
