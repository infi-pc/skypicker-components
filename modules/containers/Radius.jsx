
var deepmerge = require("deepmerge");

var defaultValues = {
  radius: 250,
  lat: 50,
  lng: 16
};

class Radius {
  constructor(plain) {
    this._data = deepmerge(defaultValues,plain);
    //validate
  }
  getRadius() {
    return this._data.radius
  }
  getLat() {
    return this._data.lat
  }
  getLng() {
    return this._data.lng
  }
}

module.exports = Radius;
