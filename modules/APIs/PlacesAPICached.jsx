var PlacesAPI  = require("./PlacesAPI.jsx");
var Q  = require('q');

var GlobalPlacesStore = {};

class PlacesAPICached {
  constructor(settings) {
    this.placesAPI = new PlacesAPI(settings);
  }
  callCached(func, params, key) {
    if (GlobalPlacesStore[key]) {
      //WARNING: callback needs to be called after other code because it should behave in same way as with api
      var deferred = Q.defer();
      setTimeout(function(){
        deferred.resolve(GlobalPlacesStore[key]);
      }, 0);
      return deferred.promise;
    } else {
      return func(params).then((results) => {
        GlobalPlacesStore[key] = results;
        return results
      })
    }
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
  //TODO remove duplicity when add 3rd method
  //findNearby(bounds, callback) {
  //  if (GlobalPlacesStore[this.boundsToString(bounds)]) {
  //    //WARNING: callback needs to be called after other code because it should behave in same way as with api
  //    setTimeout(function(){
  //      callback(null, GlobalPlacesStore[this.boundsToString(bounds)]);
  //    }, 0);
  //  } else {
  //    this.placesAPI.findByName(bounds, function (err, places) {
  //      if (!err) {
  //        GlobalPlacesStore[this.boundsToString(bounds)] = places;
  //      }
  //      callback(err, places);
  //    })
  //  }
  //}
}

module.exports = PlacesAPICached;
