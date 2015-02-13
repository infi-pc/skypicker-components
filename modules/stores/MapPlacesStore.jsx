var EventEmitter = require('events').EventEmitter;
var MapPlacesIndex = require('./MapPlacesIndex.jsx');
var MapPlace = require('./../containers/MapPlace.jsx');
var SearchFormStore  = require('./../stores/SearchFormStore.jsx');
var OptionsStore  = require('./../stores/OptionsStore.jsx');

var PlacesAPI = require('./../APIs/PlacesAPI.jsx');
var FlightsAPI = require('./../APIs/FlightsAPI.jsx');
var Place = require('./../containers/Place.jsx');


class MapPlacesStore {
  constructor() {
    this.mapPlacesIndex = new MapPlacesIndex();
    this.events = new EventEmitter();

    SearchFormStore.events.on("change", (changeType) => {
      if (changeType == "select") {
        this.loadPrices();
        this.events.emit("change");
      }
    });
    this.loadPlaces();
  }

  compareOrigins(a, b) {
    if (a.origin && b.origin) {
      if (a.origin.mode == "place" && b.origin.mode == "place")  {
        return a.origin.value.id == b.origin.value.id;
      } else {
        return a.origin == b.origin;
      }
    } else {
      /* both null => true, else => false */
      return !a.origin && !b.origin;
    }
  }
  compareImportantSearchFormData(a, b) {
    if (a && b) {
      return this.compareOrigins(a,b) && a.dateFrom == b.dateFrom && a.dateTo == b.dateTo
    } else {
      /* both null => true, else => false */
      return !a && !b;
    }

  }
  loadPlaces() {
    var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});
    placesAPI.findPlaces({typeID: Place.TYPE_CITY}).then((places) => {
      var mapPlaces = places.map((place) => {
        return new MapPlace({place: place});
      });
      this.mapPlacesIndex.insertPlaces(mapPlaces);

      this.checkSelected();
      this.events.emit("change");
    })
  }

  loadPrices() {
    if (this.compareImportantSearchFormData(this.lastSearchFormData, SearchFormStore.data)) {
      return;
    }
    this.lastSearchFormData = SearchFormStore.data;
    var thisSearchFormData = SearchFormStore.data;

    this.loading = true;
    this.mapPlacesIndex.cleanPrices();
    //TODO also other origin types
    if (SearchFormStore.data.origin.mode == "place") {
      var origin = SearchFormStore.data.origin;
      var flightsAPI = new FlightsAPI({lang: OptionsStore.data.language});
      flightsAPI.findFlights({
        origin: origin.value.id,
        destination: "anywhere",
        outboundDate: SearchFormStore.data.dateFrom,
        inboundDate: SearchFormStore.data.dateTo
      }).then((flights) => {
        if (!this.compareImportantSearchFormData(thisSearchFormData, SearchFormStore.data)) {
          return;
        }
        this.loading = false;
        flights.forEach((flight) => {
          var mapPlace = this.mapPlacesIndex.getById(flight.mapIdto);
          if (mapPlace) {
            this.mapPlacesIndex.editPlace(mapPlace.edit({"price":flight.price}));
          }
        });
        this.events.emit("change");
      }).catch((err) => {
        //TODO nicer error handling
        console.error(err);
      });
    }
  }

  getByBounds(bounds) {
    return this.mapPlacesIndex.getByBounds(bounds).map((mapPlace) => {
      if (SearchFormStore.data.origin.mode == "place" && mapPlace.place.id == SearchFormStore.data.origin.value.id) {
        return mapPlace.set("flag","origin");
      } else if (SearchFormStore.data.destination.mode == "place" && mapPlace.place.id == SearchFormStore.data.destination.value.id) {
        return mapPlace.set("flag","destination");
      } else {
        return mapPlace;
      }
    });
  }
}
module.exports = new MapPlacesStore();
