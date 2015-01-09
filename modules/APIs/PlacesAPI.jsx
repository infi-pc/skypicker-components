var superagent  = require("superagent");
var Place  = require("../containers/Place.jsx");
var deepmerge = require('deepmerge');
var Q = require('q');

var url = "https://api.skypicker.com/places";

class PlacesAPI {
  constructor(settings) {
    this.settings = settings;
  }
  convertResults(results) {
    return results.map(function (result) {
      return new Place(result);
    });
  }
  callAPI(params) {
    var deferred = Q.defer();
    var defaultParams = {
      v: 2,
      locale: this.settings.lang
    };
    superagent
      .get(url)
      .query(deepmerge(params, defaultParams))
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .end( (res) => {
        if (!res.error) {
          deferred.resolve(this.convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      });
    return deferred.promise;
  }
  findByName(term) {
    return this.callAPI({term: term});
  }
  findNearby(bounds) {
    return this.callAPI(bounds);
  }
}

module.exports = PlacesAPI;
