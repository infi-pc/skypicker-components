class Place {

  constructor(plain) {
    this.original = plain;
  }
  getName() {
    return this.original.value;
  }
  getId() {
    return this.original.id;
  }
  getType() {
    var type = this.original.type;
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
  getTypeId() {
    return this.original.type
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
