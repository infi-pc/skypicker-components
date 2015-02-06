
class MapPlace {

  constructor(plain) {
    this.place = plain.place;
    this.flag = plain.flag || ""; //origin, destination, stopover
    this.price = plain.price || null;
    Object.freeze(this);
  }


}

module.exports = MapPlace;
