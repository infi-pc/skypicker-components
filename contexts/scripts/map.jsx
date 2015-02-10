window.react = require('react');
window.MapOverlay = require('./../../modules/Map/MapOverlay.jsx');


window.MapLabel = require('./../../modules/containers/MapLabel.jsx');


var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');


function initialize() {
  var styles = [
    {
      "featureType": "road",
      "stylers": [
        { "visibility": "on" },
        { "color": "#e8e6dd" }
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
        { "color": "#9DC0EA" }
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
