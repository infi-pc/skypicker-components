var PlacesAPI  = require("./PlacesAPI.jsx");
var Q  = require('q');

var GlobalPromisesStore = {};

/**
 * Cached PlacesAPI, it should have always same interface as PlacesAPI
 */
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

  findPlaces(searchParams) {
    var key = "p_";
    if (searchParams.term) {
      key += "term:"+searchParams.term
    }
    if (searchParams.bounds) {
      key += "bounds:"+this.boundsToString(searchParams.bounds)
    }
    if (searchParams.typeID) {
      key += "type:"+searchParams.typeID
    }
    return this.callCached(this.placesAPI.findPlaces.bind(this.placesAPI), searchParams, key);
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
