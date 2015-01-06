var PlacesAPI  = require("./PlacesAPI.jsx");


var GlobalPlacesStore = {};

class PlacesAPICached {
  constructor(settings) {
    this.placesAPI = new PlacesAPI(settings);
  }
  findByName(term, callback) {
    if (GlobalPlacesStore[term]) {
      //setTimeout(function(){
      //WARNING: callback is called immediately to better UX, but be careful, it should behave in same way as with api
        callback(null, GlobalPlacesStore[term]);
      //}, 0);
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
