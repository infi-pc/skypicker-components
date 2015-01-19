var PlacesAPI  = require("./PlacesAPI.jsx");
var Q  = require('q');

var GlobalPromisesStore = {};

class PlacesAPICached {
  constructor(settings) {
    this.placesAPI = new PlacesAPI(settings);
  }
  callCached(func, params, key) {
    if (!GlobalPromisesStore[key]) {
      GlobalPromisesStore[key] = func(params);
    }
    return GlobalPromisesStore[key];
  }

  boundsToString(bounds) {
    return bounds.lat_lo + "_" + bounds.lng_lo + "_" + bounds.lat_hi + "_" + bounds.lng_hi;
  }

  findByName(term) {
    return this.callCached(this.placesAPI.findByName.bind(this.placesAPI), term, term);
  }

  findNearby(bounds) {
    return this.callCached(this.placesAPI.findNearby.bind(this.placesAPI), bounds, this.boundsToString(bounds));
  }

  findById(id) {
    return this.callCached(this.placesAPI.findById.bind(this.placesAPI), id, "id:"+id);
  }
}

module.exports = PlacesAPICached;
