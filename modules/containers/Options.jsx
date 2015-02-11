var Radius = require("./Radius.jsx");

class Options {
  constructor(plain) {
    plain = plain || {};
    this.language = plain.language || "en";
    this.currency = plain.currency || "EUR";
    this.defaultRadius = plain.defaultRadius || new Radius(); //TODO radius??
    this.defaultMapCenter = plain.defaultMapCenter || null; //TODO map center
    Object.freeze(this);
  }
  set(key, value) {
    var newPlain = {
      language: this.language,
      defaultRadius: this.defaultRadius,
      defaultMapCenter: this.defaultMapCenter
    };
    newPlain[key] = value;
    return new Options(newPlain);
  }
}

module.exports = Options;
