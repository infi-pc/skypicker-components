var Immutable = require('./../immutable.jsx');

class Trip extends Immutable {
  constructor(plain) {
    this.class = Trip;
    Object.freeze(this);
  }
}

module.exports = Trip;
