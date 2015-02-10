var MapPlacesStore = require('./MapPlacesStore.jsx');
var EventEmitter = require('events').EventEmitter;
var Quadtree = require('./../tools/quadtree.js');

function isCollide(a, b) {
  return !(
  ((a.y + a.h) < (b.y)) ||
  (a.y > (b.y + b.h)) ||
  ((a.x + a.w) < b.x) ||
  (a.x > (b.x + b.w))
  );
}

class MapLabelsStore {
  constructor() {
    this.events = new EventEmitter();

    this.labelsBoundsTree = Quadtree.init({
      x: 0,
      y: 0,
      w: 5000, //big enough screen size
      h: 5000,
      maxDepth : 20
    });

    this.labels = [];

    MapPlacesStore.events.on("change", () => {
      this.refreshLabels();
    })
  }
  /**
   * min max price for shown places (labels)
   * @param labels
   * @return {{}}
   */
  findPriceStatsForLabels(labels) {
    var res = {};
    labels.forEach((label) => {
      var price = label.mapPlace.price;
      if (!res.maxPrice || res.maxPrice < price) res.maxPrice = price;
      if (!res.minPrice || res.minPrice > price) res.minPrice = price;
    });
    return res;
  }
  /* !mutates labels */
  calculateRelativePricesForLabels(labels) {
    var priceStats = this.findPriceStatsForLabels(labels);
    labels.forEach((label) => {
      label.relativePrice = (label.mapPlace.price - priceStats.minPrice) / (priceStats.maxPrice - priceStats.minPrice);
    });
  }
  // mutates places!!!!
  mapPlacesToLabels (mapPlaces, fromLatLngToDivPixel) {
    this.labelsBoundsTree.clear();
    if (!mapPlaces || mapPlaces.length <= 0) return [];
    mapPlaces.sort((a,b) => {
      if (a.flag && !b.flag) {
        return -1;
      }
      if (!a.flag && b.flag) {
        return 1;
      }

      if (a.price && !b.price) {
        return -1;
      }
      if (!a.price && b.price) {
        return 1;
      }
      if (a.price && b.price) {
        return (a.place.sp_score < b.place.sp_score)? 1 : -1;
      }

      return (a.place.sp_score < b.place.sp_score)? 1 : -1;
    });
    //mapPlaces = mapPlaces.slice(0,300);
    var labels = [];


    mapPlaces.forEach((mapPlace) => {
      var latLng = new google.maps.LatLng(mapPlace.place.lat, mapPlace.place.lng);
      var position = fromLatLngToDivPixel(latLng);

      var item = {
        x: position.x,
        y: position.y,
        w: 70,
        h: 40
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

  refreshLabels() {
    if (this.latLngBounds && this.fromLatLngToDivPixelFunc) {
      var mapPlaces = MapPlacesStore.getByBounds(this.latLngBounds);
      var labels = this.mapPlacesToLabels(mapPlaces, this.fromLatLngToDivPixelFunc);
      this.calculateRelativePricesForLabels(labels);
      this.labels = labels;
      this.events.emit("change");
    }
  }

  setMapData(latLngBounds, fromLatLngToDivPixelFunc) {
    this.latLngBounds = latLngBounds;
    this.fromLatLngToDivPixelFunc = fromLatLngToDivPixelFunc;
    this.refreshLabels();
  }
}
module.exports = new MapLabelsStore();
