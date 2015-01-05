class Place {

  constructor(plain) {
    this.fillFromApiObject(plain)
  }
  fillFromApiObject(apiObj) {
    Object.keys(apiObj).forEach((key) => {
      this[key] = apiObj[key];
    });
  }
}

Place.TYPE_AIRPORT = 0;
Place.TYPE_COUNTRY = 1;
Place.TYPE_CITY = 2;

module.exports = Place;
