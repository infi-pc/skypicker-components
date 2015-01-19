var EventEmitter = require('events').EventEmitter;
var SearchFormData = require('./../containers/SearchFormData.jsx');
var SearchPlace = require('./../containers/SearchPlace.jsx');
var Place = require('./../containers/Place.jsx');
var Q = require('q');
var PlacesAPI = require('./../APIs/PlacesAPICached.jsx');





var getFirstFromApi = function (text) {
  var placesAPI = new PlacesAPI({lang: "en"});//TODO put here options
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
  var placesAPI = new PlacesAPI({lang: "en"});//TODO put here options
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
    return {
      promise: Q.Promise((resolve) => {
        //TODO wait for next tick???
        setInterval(() => {
          resolve(searchPlace);
        }, 0);
      }),
      tempValue: searchPlace
    };
  } else if (searchPlace.mode == "place") {
    return {
      promise: findByIdFromApi(searchPlace.value.id),
      tempValue: new SearchPlace({mode: "place", value: searchPlace.value, loading: true})
    };
  } else if (searchPlace.mode == "text") {
    return {
      promise: getFirstFromApi(searchPlace.value),
      tempValue: new SearchPlace({mode: "text", value: searchPlace.value, loading: true})
    };
  }
};

class SearchFormStore {
  constructor() {
    this.events = new EventEmitter();
    this.data = new SearchFormData();
  }
  setValue(value) {
    var changed = false;
    if (this.data != value) {
      this.data = value;
      this.events.emit('change');
      changed = true;
    }
    return changed;
  }
  setField(fieldName, value) {
    return this.setValue(this.data.changeField(fieldName, value));
  }
  completeField(fieldName) {
    var {promise, tempValue} = fetchPlace(this.data[fieldName]);
    this.setField(fieldName, tempValue);
    return promise.then((finalValue) => {
      this.setField(fieldName, finalValue);
      return true; //TODO dont know what to return???
    });
  }
  search() {
    var {promise: originPromise, tempValue: origin} = fetchPlace(this.data.origin);
    var {promise: destinationPromise, tempValue: destination} = fetchPlace(this.data.destination);

    this.setValue(
      this.data.changeField("origin", origin).changeField("destination",destination)
    );
    var lastData = this.data;
    return Q.all([originPromise, destinationPromise]).then((results) => {
      var [origin, destination] = results;
      if (lastData != this.data) return; //some other search has outran me

      this.setValue(
        this.data.changeField("origin", origin).changeField("destination",destination)
      );
      if (this.data.origin.mode == "place" && this.data.destination.mode == "place") {
        this.events.emit('search');
      }
    });
  }
}
module.exports = new SearchFormStore();
