var PlacesAPI  = require("./PlacesAPI.jsx");


GlobalPlacesStore = {};

class PlacesAPICached {
  constructor(settings) {
    this.placesAPI = new PlacesAPI(settings);
  }
  findByName(term, callback) {
    if (GlobalPlacesStore[term]) {
      setTimeout(function(){
        callback(null, GlobalPlacesStore[term]);
      }, 0);
    } else {
      this.placesAPI.findByName(term, function (err, places) {
        if (!err) {
          GlobalPlacesStore[term] = places;
        }
        callback(err, places);
      })
    }
  }
}

module.exports = PlacesAPICached;
