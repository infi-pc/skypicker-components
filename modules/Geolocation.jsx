var LatLon = require('./tools/latlon.js');

var options = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0
};

class Geolocation {

  initBrowser() {
    //TODO finish
    //navigator.geolocation.getCurrentPosition(function (pos) {
    //  var crd = pos.coords;
    //  console.log('Your current position is:');
    //  console.log('Latitude : ' + crd.latitude);
    //  console.log('Longitude: ' + crd.longitude);
    //  console.log('More or less ' + crd.accuracy + ' meters.');
    //
    //}, function () {
    //  console.warn('ERROR(' + err.code + '): ' + err.message);
    //}, options)
  }
  getFromMap() {

  }
  getFromBrowser() {

  }
  getFromCode() {

  }
  pointToBounds(lat, lon) {
    var distance = 300;
    var ll = LatLon(lat,lon);
    return {
      lat_lo: ll.destinationPoint(180, distance).lat,
      lng_lo: ll.destinationPoint(-90, distance).lon,
      lat_hi: ll.destinationPoint(0, distance).lat,
      lng_hi: ll.destinationPoint(90, distance).lon
    }
  }
  getCurrentBounds() {
    return this.pointToBounds(50,15);
  }
}

module.exports = new Geolocation();
