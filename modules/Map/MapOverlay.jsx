var LabelsLayer = require('./LabelsLayer.jsx');
var PointsLayer = require('./PointsLayer.jsx');
var MouseClickLayer = require('./MouseClickLayer.jsx');
var MapLabelsStore = require('./../stores/MapLabelsStore.jsx');

var MapOverlay = function (map) {
  this.map = map;
  this.setMap(map);
};

function flatBounds(bounds) {
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();
  return {
    wLng: sw.lng(),
    eLng: ne.lng(),
    sLat: sw.lat(),
    nLat: ne.lat()
  }
}

function addPointsLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayLayer.appendChild(div);
  return React.render(React.createFactory(PointsLayer)(), div);
}

function addLabelsLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayLayer.appendChild(div);
  return React.render(React.createFactory(LabelsLayer)(), div);
}

function addMouseClickLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayMouseTarget.appendChild(div);
  return React.render(React.createFactory(MouseClickLayer)(), div);
}



MapOverlay.prototype = new google.maps.OverlayView();

MapOverlay.prototype.onAdd = function () {
  var panes = this.getPanes();
  addPointsLayer(panes, this.map);
  addLabelsLayer(panes, this.map);
  addMouseClickLayer(panes, this.map);


  google.maps.event.addListener(this.map, 'idle', ()=> {
    console.log("idle");
    var overlayProjection = this.getProjection();
    var bounds = flatBounds(this.map.getBounds());
    MapLabelsStore.setMapData(bounds, overlayProjection.fromLatLngToDivPixel.bind(overlayProjection));
  });
};

MapOverlay.prototype.draw = function () {
  console.log("draw");


};

MapOverlay.prototype.onRemove = function () {
  console.log("remove");
};

module.exports = MapOverlay;
