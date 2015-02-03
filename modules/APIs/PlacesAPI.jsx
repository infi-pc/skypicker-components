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
  /**
   *
   * @param settings.lang - language in which we get places namas
   */
  constructor(settings) {
    this.settings = settings;
  }

  /**
   * find places according to given attributes
   * @param placeSearch.term - string to search
   * @param placeSearch.typeID -- type id
   * @param placeSearch.bounds
   * @return promise
   */
  findPlaces(placeSearch) {
    var params = {};
    placeSearch = placeSearch || {};
    if (placeSearch.term) {
      params.term = placeSearch.term;
    }
    if (placeSearch.bounds) {
      params = deepmerge(params, placeSearch.bounds)
    }
    if (placeSearch.typeID) {
      params.type = placeSearch.typeID;
    }
    return this._callAPI(params);
  }


  _convertResults(results) {
    return results.map(function (result) {
      return new Place(result);
    });
  }

  _callAPI(params) {
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
          deferred.resolve(this._convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      });
    return deferred.promise;
  }

  /**
   * @param id - place id
   * @returns {*}
   */
  registerImportance(id) {
    var deferred = Q.defer();
    superagent
      .post(url + "/" + id)
      .end( (res) => {
        if (!res.error) {
          deferred.resolve(this._convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      });
    return deferred.promise;
  }

  /**
   * find by id and register importance
   * @param id
   * @returns {*}
   */
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


  /**
   * @deprecated use findPlaces
   */
  findByName(term) {
    return this._callAPI({term: term});
  }
  /**
   * @deprecated use findPlaces
   */
  findNearby(bounds) {
    return this._callAPI(bounds);
  }

}

module.exports = PlacesAPI;
