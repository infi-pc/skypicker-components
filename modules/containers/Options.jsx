var Radius = require("./Radius.jsx");
var Immutable = require("./Immutable.jsx");

class Options extends Immutable {
  constructor(plain) {
    plain = plain || {};
    this.language = plain.language || "en";
    this.currency = plain.currency || "EUR";
    this.defaultRadius = plain.defaultRadius || new Radius(); //TODO radius??
    this.defaultMapCenter = plain.defaultMapCenter || null; //TODO map center

    this.class = Options;
    Object.freeze(this);
  }
}

module.exports = Options;
