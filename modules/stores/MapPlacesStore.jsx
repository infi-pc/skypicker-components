var EventEmitter = require('events').EventEmitter;
var MapPlace = require('./../containers/MapPlace.jsx');
var SearchFormStore  = require('./../stores/SearchFormStore.jsx');
var Quadtree = require('./../tools/quadtree.js');
var PlacesAPI = require('./../APIs/PlacesAPI.jsx');
var Place = require('./../containers/Place.jsx');



function isCollide(a, b) {
  return !(
  ((a.y + a.h) < (b.y)) ||
  (a.y > (b.y + b.h)) ||
  ((a.x + a.w) < b.x) ||
  (a.x > (b.x + b.w))
  );
}

function boundsToSelector(latLngBounds) {
  var bounds = latLngBounds;
  //if map has 180lng view scope than show only the bigger part of shown planet
  if (bounds.eLng - bounds.wLng < 0) {
    // what is more far from zero, it is smaller
    if (Math.abs(bounds.eLng) > Math.abs(bounds.wLng)) {
      bounds.eLng = 180;
    } else {
      bounds.wLng = -180;
    }
  }

  return {
    x: bounds.wLng + 180,
    y: bounds.sLat + 90,
    w: bounds.eLng - bounds.wLng,
    h: bounds.nLat - bounds.sLat
  };
}


class MapPlacesStore {
  constructor() {
    this.events = new EventEmitter();
    this.mapPlacesIndex = {};

    this.pointsTree = Quadtree.init({
      x: 0,
      y: 0,
      w: 360,
      h: 180,
      maxDepth : 12
    });
    this.labelsBoundsTree = Quadtree.init({
      x: 0,
      y: 0,
      w: 5000, //max screen size
      h: 5000, //max screen size
      maxDepth : 20
    });

    this.loadPlaces();
  }

  loadPlaces() {
    var placesAPI = new PlacesAPI({lang: "en"});
    placesAPI.findPlaces({typeID: Place.TYPE_CITY}).then((places) => {
      places.forEach((place) => {
        var mapPlace = new MapPlace({place: place});
        this.mapPlacesIndex[place.id] = mapPlace;
        this.pointsTree.insert(
          {
            x: place.lng + 180,
            y: place.lat + 90,
            w: 0.00001,
            h: 0.00001,
            mapPlace: mapPlace
          }
        );
      });
      this.events.trigger("placesChanged");

    })

  }
  // mutates places
  mapPlacesToLabels (mapPlaces, fromLatLngToDivPixel) {
    this.labelsBoundsTree.clear();
    if (!mapPlaces || mapPlaces.length <= 0) return [];
    mapPlaces.sort((a,b) => {
      return a.place.sp_score < b.place.sp_score;
    });
    //mapPlaces = mapPlaces.slice(0,300);
    var labels = [];
    mapPlaces.forEach((mapPlace) => {
      var latLng = new google.maps.LatLng(mapPlace.place.lat, mapPlace.place.lng);
      var position = fromLatLngToDivPixel(latLng);

      var item = {
        x: position.x,
        y: position.y,
        w: 60,
        h: 30
      };

      var collisions = 0;
      this.labelsBoundsTree.retrieve(item, function(checkingItem) {
        if (isCollide(item, checkingItem)) {
          collisions += 1;
        }
      });

      var showFullLabel = false;
      if (collisions == 0) {
        showFullLabel = true;
        item.mapPlace = mapPlace;
        this.labelsBoundsTree.insert(item);
      }

      var label = {
        mapPlace: mapPlace,
        position: position,
        showFullLabel: showFullLabel
      };
      labels.push(label);
    });
    return labels;
  }
  getMapPlacesInBounds(latLngBounds, fromLatLngToDivPixelFunc) {
    var treeSelector = boundsToSelector(latLngBounds);
    var mapPlaces = [];
    this.pointsTree.retrieve(treeSelector, function(item) {
      mapPlaces.push(item.mapPlace);
    });
    return this.mapPlacesToLabels(mapPlaces, fromLatLngToDivPixelFunc);
  }

}
module.exports = new MapPlacesStore();
