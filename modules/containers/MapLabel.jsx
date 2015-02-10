var Immutable = require('./immutable.jsx');

class MapLabel extends Immutable {
  constructor(plain) {
    this.mapPlace = plain.mapPlace;
    this.position = plain.position;
    this.showFullLabel = plain.showFullLabel;
    this.relativePrice = plain.relativePrice;
    this.hover = plain.hover;

    this.class = MapLabel;
    Object.freeze(this);
  }

  edit(plain) {
    //prevent same position to make new object
    if (plain.position) {
      if (plain.position.x == this.position.x && plain.position.y == this.position.y) {
        plain.position = this.position;
      }
    }
    return super.edit(plain);
  }

  /* expects that there is no two labels with same place */
  getId() {
    return this.mapPlace.place.id;
  }
}



module.exports = MapLabel;
