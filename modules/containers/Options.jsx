var Radius = require("./Radius.jsx");

class Options {
  constructor(plain) {
    plain = plain || {};
    this.language = plain.language || "en";
    this.defaultRadius = plain.defaultRadius || new Radius();
    Object.freeze(this);
  }
  set(key, value) {
    var newPlain = {
      language: this.language,
      defaultRadius: this.defaultRadius
    };
    newPlain[key] = value;
    return new Options(newPlain);
  }
}

module.exports = Options;
