var Immutable = require('./immutable.jsx');

class MapPlace  extends Immutable {

  constructor(plain) {
    this.place = plain.place;
    this.flag = plain.flag || ""; //origin, destination, stopover
    this.price = plain.price || null;
    this.relativePrice = plain.relativePrice || null;

    this.class = MapPlace;
    Object.freeze(this);
  }
}

module.exports = MapPlace;
