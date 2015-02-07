var Immutable = require('./immutable.jsx');

class MapPlace  extends Immutable {

  constructor(plain) {
    this.place = plain.place;
    this.flag = plain.flag || ""; //origin, destination, stopover
    this.price = plain.price || null;
    this.relativePrice = plain.relativePrice || null;
    Object.freeze(this);
  }

  //TODO move this method to parent object Immutable
  /**
   * return new object with added changes, if no change return same object
   * @param newValues
   * @returns {SearchDate}
   */
  edit(newValues){
    if (!newValues) {
      return this;
    }
    var leastOneEdit = false;
    var newPlain = {};
    //Add from this
    Object.keys(this).forEach((key) => {
      newPlain[key] = this[key];
    });
    //Add from new
    Object.keys(newValues).forEach((key) => {
      if (newPlain[key] !== newValues[key]) {
        newPlain[key] = newValues[key];
        leastOneEdit = true;
      }
    });
    if (leastOneEdit) {
      return new MapPlace(newPlain);
    } else {
      return this;
    }

  };
}

module.exports = MapPlace;
