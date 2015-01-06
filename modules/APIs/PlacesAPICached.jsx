var PlacesAPI  = require("./PlacesAPI.jsx");


var GlobalPlacesStore = {};

class PlacesAPICached {
  constructor(settings) {
    this.placesAPI = new PlacesAPI(settings);
  }
  findByName(term, callback) {
    if (GlobalPlacesStore[term]) {
      //WARNING: callback needs to be called after other code because it should behave in same way as with api
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
