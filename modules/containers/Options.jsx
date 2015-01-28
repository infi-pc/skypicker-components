var Radius = require("./Radius.jsx");

class Options {
  constructor(plain) {
    plain = plain || {};
    if (window.SKYPICKER_LNG) {
      this.language = window.SKYPICKER_LNG.toLowerCase();
    } else {
      this.language = plain.language || "en";
    }

    this.defaultRadius = plain.defaultRadius || new Radius(); //TODO radius??
    this.mapCenter = plain.mapCenter || ""; //TODO map center
    Object.freeze(this);
  }
  set(key, value) {
    var newPlain = {
      language: this.language,
      defaultRadius: this.defaultRadius,
      mapCenter: this.mapCenter
    };
    newPlain[key] = value;
    return new Options(newPlain);
  }
}

module.exports = Options;
