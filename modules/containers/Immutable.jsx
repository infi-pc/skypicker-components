
class Immutable {

  /**
   * return new object with added changes, if no change return same object
   * @param newValues
   * @returns new object as in class
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
      return new this.class(newPlain);
    } else {
      return this;
    }

  };
  /**
   * return edited object
   * @param key
   * @param value
   * @returns {SearchDate}
   */
  set(key, value) {
    var newPlain = {};
    newPlain[key] = value;
    return this.edit(newPlain)
  }
}

module.exports = Immutable;
