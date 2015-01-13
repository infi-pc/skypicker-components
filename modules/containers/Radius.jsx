

class Radius {
  constructor(plain) {
    this.radius =  plain.radius || 250;
    this.lat =  plain.lat || 50;
    this.lng =  plain.lng || 16;
    Object.freeze(this);
  }
}

module.exports = Radius;
