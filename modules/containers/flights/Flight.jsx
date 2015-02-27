var Immutable = require('./../immutable.jsx');

class Flight extends Immutable {
  constructor(plain) {
    this.class = Flight;
    Object.freeze(this);
  }
}

module.exports = Flight;
