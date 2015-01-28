
var typeIdToString = function(type) {

};


class Place {

  static typeIdToString(type) {
    if (type == Place.TYPE_AIRPORT) {
      return "airport";
    } else if (type == Place.TYPE_COUNTRY) {
      return "country";
    } else if (type == Place.TYPE_CITY) {
      return "city";
    } else {
      return "unknown";
    }
  }
  constructor(plain) {
    Object.keys(plain).forEach((key) => {
      this[key] = plain[key];
    });
    if (typeof this.complete == "undefined") {
      this.complete = true;
    }
    this.typeString = Place.typeIdToString(this.type);
    Object.freeze(this);
  }
  getName() {
    return this.value;
  }
  getId() {
    return this.id;
  }
  getType() {
    return this.typeString;
  }
  getTypeId() {
    return this.type
  }
  //fillFromApiObject(apiObj) {
  //  Object.keys(apiObj).forEach((key) => {
  //    this[key] = apiObj[key];
  //  });
  //}
}

Place.TYPE_AIRPORT = 0;
Place.TYPE_COUNTRY = 1;
Place.TYPE_CITY = 2;

module.exports = Place;
