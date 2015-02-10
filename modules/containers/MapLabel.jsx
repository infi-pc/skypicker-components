var Immutable = require('./immutable.jsx');

class MapLabel extends Immutable {
  constructor(plain) {
    this.mapPlace = plain.mapPlace;
    this.position = plain.position;
    this.showFullLabel = plain.showFullLabel;
    this.hover = plain.hover;

    this.class = MapLabel;
    Object.freeze(this);
  }
}
module.exports = MapLabel;
