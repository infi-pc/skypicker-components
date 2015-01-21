

function round(num) {
  return Math.round(num * 100) / 100;
}

class Radius {
  constructor(plain) {
    plain = plain || {};
    this.radius =  plain.radius || 250;
    this.lat =  plain.lat || 50;
    this.lng =  plain.lng || 16;
    Object.freeze(this);
  }
  getText() {
    return "" + round(this.lat) + ", " + round(this.lng) + " (" + this.radius + "km)";
  }
  getUrlString() {
    return "" + round(this.lat) + "-" + round(this.lng) + "-" + this.radius + "km";
  }
}

module.exports = Radius;
