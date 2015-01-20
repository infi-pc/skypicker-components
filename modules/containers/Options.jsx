var Radius = require("./Radius.jsx");

class Options {
  constructor(plain) {
    plain = plain || {};
    this.language = plain.language || "en";
    this.defaultRadius = plain.defaultRadius || new Radius();
    Object.freeze(this);
  }
}

module.exports = Options;
