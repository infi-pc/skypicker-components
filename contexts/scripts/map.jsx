window.react = require('react');
window.MapOverlay = require('./../../modules/Map/MapOverlay.jsx');


window.MapLabel = require('./../../modules/containers/MapLabel.jsx');

var Options = require('./../../modules/containers/Options.jsx');

window.Place = require('./../../modules/containers/Place.jsx');
window.SearchPlace = require('./../../modules/containers/SearchPlace.jsx');


var SearchFormStore = window.SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');
var MapPlacesStore = require('./../../modules/stores/MapPlacesStore.jsx');
var OptionsStore = require('./../../modules/stores/OptionsStore.jsx');




function initialize() {
  var styles = [
    {
      "featureType": "road",
      "stylers": [
        { "color": "#e1ddd4" },
        { "visibility": "off" }
      ]
    },{
      "featureType": "poi",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "landscape.natural",
      "stylers": [
        { "visibility": "simplified" },
        { "color": "#f1efe8" }
      ]
    },{
      "featureType": "administrative.locality",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [
        { "visibility": "on" },
        { "color": "#dbdadb" }
      ]
    },{
      "featureType": "administrative",
      "elementType": "labels.text.stroke",
      "stylers": [
        { "color": "#ffffff" },
        { "visibility": "off" }
      ]
    },{
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        { "color": "#dbdadb" }
      ]
    },{
      "featureType": "water"  }
  ];
  var mapOptions = {
    center: {
      lat: 50,
      lng: 15
    },
    zoom: 5,
    styles: styles,
    panControl: false,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    overviewMapControl: false
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  var overlay = new MapOverlay(map);

}
google.maps.event.addDomListener(window, 'load', initialize);

OptionsStore.setValue(new Options({
  language: "cs".toLowerCase(),
  currency: "czk"
}));
MapPlacesStore.loadPlaces();


//SearchFormStore.events.on("change", function () {
//  document.getElementById('output').innerHTML = JSON.stringify(SearchFormStore.data);
//});


//var element = document.getElementById("map");
//
