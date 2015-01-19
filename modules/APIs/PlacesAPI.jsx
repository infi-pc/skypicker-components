var superagent  = require("superagent");
var Place  = require("../containers/Place.jsx");
var deepmerge = require('deepmerge');
var Q = require('q');

var url = "https://api.skypicker.com/places";

//TODO check if on error is called exactly when error in callback or not, then Add it to promise
var handleError = function (err) {
  console.error(err);
};

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
      .on('error', handleError)
      .end( (res) => {
        if (!res.error) {
          deferred.resolve(this.convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      });
    return deferred.promise;
  }

  registerImportance(id) {
    var deferred = Q.defer();
    superagent
      .post(url + "/" + id)
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
  findById(id) {
    var deferred = Q.defer();
    var params = {
      v: 2,
      locale: this.settings.lang,
      id: id
    };
    superagent
      .get(url + "/" + id)
      .query(params)
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .on('error', handleError)
      .end( (res) => {
        if (!res.error) {
          deferred.resolve(new Place(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      });

    //Call one more post
    this.registerImportance(id);
    return deferred.promise;
  }
}

module.exports = PlacesAPI;
