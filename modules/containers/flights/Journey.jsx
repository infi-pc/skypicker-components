var Immutable = require('./../immutable.jsx');

class Journey extends Immutable {
  constructor(plain) {
    this.price = plain.price;


    this.class = Journey;
    Object.freeze(this);
  }
}

module.exports = Journey;
