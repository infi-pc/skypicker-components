window.react = require('react');
window.MapOverlay = require('./../../modules/Map/MapOverlay.jsx');
var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');


function initialize() {
  var styles = [
    {
      "featureType": "road",
      "stylers": [
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
        { "color": "#f3f3f3" }
      ]
    },{
      "featureType": "administrative.locality",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "administrative.country",
      "elementType": "labels",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "administrative.country",
      "elementType": "borders",
      "stylers": [
        { "color": "#cccccc" }
      ]
    },{
      "featureType": "water",
      "stylers": [
        { "color": "#B3D1FF" }
      ]
    }
  ];
  var mapOptions = {
    center: {
      lat: 50,
      lng: 15
    },
    zoom: 5,
    styles: styles
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  var overlay = new MapOverlay(map);

}
google.maps.event.addDomListener(window, 'load', initialize);



//SearchFormStore.events.on("change", function () {
//  document.getElementById('output').innerHTML = JSON.stringify(SearchFormStore.data);
//});


//var element = document.getElementById("map");
//
