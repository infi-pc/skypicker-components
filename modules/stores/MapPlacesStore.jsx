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

    this.selectedOriginId = null; //it is here so i can fastly deselect the last place
    this.selectedDestinationId = null;

    this.setNewSearchFormData();

    SearchFormStore.events.on("change", (changeType) => {
      if (changeType != "select") {
        this.setNewSearchFormData(); //just set new data for next reference if something changed
        return; //is searches new prices only for "select" type of change
      }
      if (this.hasSearchFormDataChanged()) {
        this.setNewSearchFormData();
        this.loadPrices();
      }
      this.checkSelected();
      this.events.emit("change");
    });
    this.loadPlaces();
  }

  setNewSearchFormData() {
    this.origin = SearchFormStore.data.origin;
    this.outboundDate = SearchFormStore.data.dateFrom;
    this.inboundDate = SearchFormStore.data.dateTo;
  }
  hasSearchFormDataChanged() {
    return this.origin != SearchFormStore.data.origin || this.outboundDate != SearchFormStore.data.dateFrom || this.inboundDate != SearchFormStore.data.dateTo
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

  /* not used now */
  findPriceStats(flights) {
    var res = {};
    flights.forEach((flight) => {
      if (!res.maxPrice || res.maxPrice < flight.price) res.maxPrice = flight.price;
      if (!res.minPrice || res.minPrice > flight.price) res.minPrice = flight.price;
    });
    return res;
  }
  loadPrices() {
    this.mapPlacesIndex.cleanPrices();
    var searched = {}; // this is for preventing race condition
    searched.origin = SearchFormStore.data.origin;
    searched.outboundDate = SearchFormStore.data.dateFrom;
    searched.inboundDate = SearchFormStore.data.dateTo;

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
        //
        if (searched.origin.value.id != SearchFormStore.data.origin.value.id || searched.outboundDate != SearchFormStore.data.dateFrom || searched.inboundDate != SearchFormStore.data.dateTo) {
          return; //discard data
        }
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
  getByBounds(bounds) {
    return this.mapPlacesIndex.getByBounds(bounds);
  }
}
module.exports = new MapPlacesStore();
