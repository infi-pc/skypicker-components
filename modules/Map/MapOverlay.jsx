var MapPlaces = require('./MapPlaces.jsx');

var MapOverlay = function (map) {
  this.map = map;
  this.setMap(map);
};


MapOverlay.prototype = new google.maps.OverlayView();

MapOverlay.prototype.onAdd = function () {
  var div = document.createElement('div');
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);

  var root = React.createFactory(MapPlaces);
  this.placesComponent = React.render(root(), div);


  google.maps.event.addListener(this.map, 'idle', ()=> {
    console.log("idle");
    var overlayProjection = this.getProjection();
    //var pxCoords = overlayProjection.fromLatLngToDivPixel(this.coordinates);
    var bounds = this.map.getBounds();
    this.placesComponent.setProps({
      overlayProjection: overlayProjection,
      bounds: bounds
    });
  });
};

MapOverlay.prototype.draw = function () {
  console.log("draw");


};

MapOverlay.prototype.onRemove = function () {
  console.log("remove");
};

module.exports = MapOverlay;
