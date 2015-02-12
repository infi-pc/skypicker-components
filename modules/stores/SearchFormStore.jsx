var EventEmitter = require('events').EventEmitter;
var SearchFormData = require('./../containers/SearchFormData.jsx');
var SearchPlace = require('./../containers/SearchPlace.jsx');
var Place = require('./../containers/Place.jsx');
var Q = require('q');
var PlacesAPI = require('./../APIs/PlacesAPICached.jsx');
var OptionsStore = require('./OptionsStore.jsx');




var getFirstFromApi = function (text) {
  var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});//TODO put here options
  return placesAPI.findByName(text).then((places) => {
    if (places[0]) {
      return new SearchPlace({mode: "place", value: new Place(places[0])});
    } else {
      return new SearchPlace({mode: "text", value: text, error: "notFound"});
    }
  }).catch((err) => {
    console.error(err);
  })
};

var findByIdFromApi = function (id) {
  var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});//TODO put here options
  return placesAPI.findById(id).then((place) => {
    if (place) {
      return new SearchPlace({mode: "place", value: place});
    } else {
      //switch to text when id not found??
      return new SearchPlace({mode: "text", value: id, error: "notFound"});
    }
  }).catch((err) => {
    console.error(err);
  })
};


/* returns promise, promise resolves true if there is new value */
var fetchPlace = function(searchPlace) {
  if (searchPlace.mode == "place" && searchPlace.value.complete) {
    return false; /* don't need to async load */
  } else if (searchPlace.mode == "place") {
    return {
      promise: findByIdFromApi(searchPlace.value.id).then((newSearchPlace) => {
        return newSearchPlace.set("formMode", searchPlace.formMode)
      }),
      tempValue: searchPlace.set("loading", true)//new SearchPlace({mode: "place", value: searchPlace.value, loading: true})
    };
  } else if (searchPlace.mode == "text") {
    return {
      promise: getFirstFromApi(searchPlace.value).then((newSearchPlace) => {
        return newSearchPlace.set("formMode", searchPlace.formMode)
      }),
      tempValue: searchPlace.set("loading", true)//new SearchPlace({mode: "text", value: searchPlace.value, loading: true})
    };
  }
  return false;
};

class SearchFormStore {
  constructor() {
    this.events = new EventEmitter();
    this.data = new SearchFormData();
  }

  /**
   *
   * @param value
   * @param changeType - type of change - default is "select" which is also most common and for example triggers search on map
   * @return {boolean}
   */
  setValue(value, changeType) {
    var changed = false;
    if (this.data != value) {
      this.data = value;
      this.events.emit('change',changeType); // change is after all changes
      changed = true;
    }
    return changed;
  }
  setField(fieldName, value, changeType) {
    return this.setValue(this.data.changeField(fieldName, value), changeType);
  }

  completeField(fieldName) {
    var fetchInfo = fetchPlace(this.data[fieldName]);
    if (fetchInfo) {
      var {promise, tempValue} = fetchInfo;
      this.setField(fieldName, tempValue);
      return promise.then((finalValue) => {
        /* only if it's is still same value as before, nothing new */
        if (tempValue == this.data[fieldName]) {
          this.setField(fieldName, finalValue);
        }
        return true; //TODO dont know what to return???
      });
    }
    return null;
  }
  triggerSearch() {
    //TODO check if there is every data ok
    this.events.emit('search');
  }
  /* fetch direction and return data with temp value */
  fetchDirection(data, direction) {
    var fetchInfo = fetchPlace(data[direction]);
    if (fetchInfo) {
      return {
        promise: fetchInfo.promise.then((value) => {
          return {direction,value}
        }),
        newData: data.changeField(direction, fetchInfo.tempValue)
      };
    } else {
      return false;
    }
  }
  search() {
    var promises = [];
    var newTempData = this.data;
    var originLoadingInfo = this.fetchDirection(newTempData, "origin");
    if (originLoadingInfo) {
      promises.push(originLoadingInfo.promise);
      newTempData = originLoadingInfo.newData;
    }
    var destinationLoadingInfo = this.fetchDirection(newTempData, "destination");
    if (destinationLoadingInfo) {
      promises.push(destinationLoadingInfo.promise);
      newTempData = destinationLoadingInfo.newData;
    }
    /* if any of these needs loading save temporary objects */
    if (newTempData != this.data) {
      this.setValue(newTempData);
    }


    if (promises.length > 0) {
      var lastData = this.data;
      return Q.all(promises).then((results) => {
        if (lastData != this.data) return; //if some other search has outran me
        var newData = this.data;
        results.forEach((result) => {
          newData = newData.changeField(result.direction, result.value);
        });
        this.setValue(newData);
        this.triggerSearch();
      });
    } else {
      //TODO check if is not needed next tick
      this.triggerSearch();

      //TODO return some promise??
    }

  }
}
module.exports = new SearchFormStore();
