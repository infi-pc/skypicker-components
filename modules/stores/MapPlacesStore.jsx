var EventEmitter = require('events').EventEmitter;
var MapPlacesIndex = require('./MapPlacesIndex.jsx');
var MapPlace = require('./../containers/MapPlace.jsx');
var SearchFormStore  = require('./../stores/SearchFormStore.jsx');
var Quadtree = require('./../tools/quadtree.js');
var PlacesAPI = require('./../APIs/PlacesAPI.jsx');
var FlightsAPI = require('./../APIs/FlightsAPI.jsx');
var Place = require('./../containers/Place.jsx');



function isCollide(a, b) {
  return !(
  ((a.y + a.h) < (b.y)) ||
  (a.y > (b.y + b.h)) ||
  ((a.x + a.w) < b.x) ||
  (a.x > (b.x + b.w))
  );
}




class MapPlacesStore {
  constructor() {
    this.mapPlacesIndex = new MapPlacesIndex();
    this.events = new EventEmitter();

    this.selectedOriginId = null; //it is here so i can fastly deselect the last place
    this.selectedDestinationId = null;


    this.labelsBoundsTree = Quadtree.init({
      x: 0,
      y: 0,
      w: 5000, //big enough screen size
      h: 5000,
      maxDepth : 20
    });
    SearchFormStore.events.on("change", () => {
      this.loadPrices();
      this.checkSelected();
      this.events.emit("placesChanged");
    });
    this.loadPlaces();
  }

  loadPlaces() {
    var placesAPI = new PlacesAPI({lang: "en"});
    placesAPI.findPlaces({typeID: Place.TYPE_CITY}).then((places) => {
      var mapPlaces = places.map((place) => {
        return new MapPlace({place: place});
      });
      this.mapPlacesIndex.insertPlaces(mapPlaces);

      this.checkSelected();
      this.events.emit("placesChanged");
    })
  }

  findPriceStats(flights) {
    var res = {};
    flights.forEach((flight) => {
      if (!res.maxPrice || res.maxPrice < flight.price) res.maxPrice = flight.price;
      if (!res.minPrice || res.minPrice > flight.price) res.minPrice = flight.price;
    });
    return res;
  }
  loadPrices() {
    //TODO clean could be ommited on some cases (new data)
    this.mapPlacesIndex.cleanPrices();
    //TODO also other origin types
    if (SearchFormStore.data.origin.mode == "place") {
      var origin = SearchFormStore.data.origin;
      var flightsAPI = new FlightsAPI({lang: "en"});
      flightsAPI.findFlights({
        origin: origin.value.id,
        destination: "anywhere",
        outboundDate: SearchFormStore.data.dateFrom,
        inboundDate: SearchFormStore.data.dateTo
      }).then((flights) => {
        var priceStats = this.findPriceStats(flights);

        flights.forEach((flight) => {
          var mapPlace = this.mapPlacesIndex.getById(flight.mapIdto);
          if (mapPlace) {
            var relativePrice = flight.price / priceStats.maxPrice; //TODO nicer function
            this.mapPlacesIndex.editPlace(mapPlace.edit({"price":flight.price, "relativePrice": relativePrice}));
          }
        });
        this.events.emit("placesChanged");
      }).catch((err) => {
        //TODO nicer error handling
        console.error(err);
      });
    }
  }

  checkSelected() {
    if (SearchFormStore.data.origin.mode == "place" && this.selectedOriginId != SearchFormStore.data.origin.value.id) {
      this.deselectPlace(this.selectedOriginId);
      this.selectPlace(SearchFormStore.data.origin.value.id, "origin");
      this.selectedOriginId = SearchFormStore.data.origin.value.id;
    }
    if (SearchFormStore.data.destination.mode == "place" && this.selectedDestinationId != SearchFormStore.data.destination.value.id) {
      this.deselectPlace(this.selectedDestinationId);
      this.selectPlace(SearchFormStore.data.destination.value.id, "destination");
      this.selectedDestinationId = SearchFormStore.data.destination.value.id;
    }
  }

  selectPlace(id, direction) {
    var mapPlace = this.mapPlacesIndex.getById(id);
    if (mapPlace) {
      this.mapPlacesIndex.editPlace(mapPlace.set("flag",direction));
    } else {
      //TODO what put here?
    }

  }
  deselectPlace(id) {
    if (id) {
      var mapPlace = this.mapPlacesIndex.getById(id);
      if (mapPlace) {
        this.mapPlacesIndex.editPlace(mapPlace.set("flag", ""));
      } else {
        //TODO what put here?
      }
    }
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
      label.relativePrice = label.mapPlace.price / priceStats.maxPrice;
    });
  }
  // mutates places
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
  getMapPlacesInBounds(latLngBounds, fromLatLngToDivPixelFunc) {
    var mapPlaces = this.mapPlacesIndex.getByBounds(latLngBounds);
    var labels = this.mapPlacesToLabels(mapPlaces, fromLatLngToDivPixelFunc);
    this.calculateRelativePricesForLabels(labels);
    return labels;
  }

}
module.exports = new MapPlacesStore();
