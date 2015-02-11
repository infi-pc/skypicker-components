var moment = require("moment");
var deepmerge = require("deepmerge");
var Immutable = require("./Immutable.jsx");

var urlDateFormat = "YYYY-MM-DD";
var tr = require('./../tr.js');

/*
class SearchDate
!!!! FOR VALID OUTPUT USE ALWAYS GETTER METHODS, NOT ATTRIBUTES
 */

class SearchDate extends Immutable{
  constructor(input) {
    var plain = {};
    if (typeof input == "string") {
      plain = this.parseUrlString(input);
    } else if (typeof input == "object") {
      plain = input;
    }
    this.mode = typeof(plain.mode) != 'undefined' ? plain.mode : "single";
    this.from = typeof(plain.from) != 'undefined' ? plain.from : moment.utc();
    this.to = typeof(plain.to) != 'undefined' ? plain.to : moment.utc();
    this.minStayDays = typeof(plain.minStayDays) != 'undefined' ? plain.minStayDays : 2;
    this.maxStayDays = typeof(plain.maxStayDays) != 'undefined' ? plain.maxStayDays : 10;
    this.final = typeof(plain.final) != 'undefined' ? plain.final : true;

    this.class = SearchDate;
    Object.freeze(this);
  }

  getMode() {
    return this.mode
  }

  getFrom() {
    if (this.mode == "timeToStay" || this.mode == "noReturn") {
      return null;
    } else if (this.mode == "anytime") {
      return moment.utc().add(1, "days");
    } else {
      return this.from
    }
  }

  getTo() {
    if (this.mode == "timeToStay" || this.mode == "noReturn") {
      return null;
    } else if (this.mode == "single") {
      return this.from
    } else if (this.mode == "anytime") {
      return moment.utc().add(6, "months");
    } else {
      if (this.to) {
        return this.to
      } else {
        //just for cases when the value is not filled (not complete interval)
        return this.from
      }
    }
  }

  getDate() {
    if (this.mode == "single") {
      return this.from
    } else {
      return null
    }
  }

  getMinStayDays() {
    if (this.mode == "timeToStay") {
      return this.minStayDays;
    } else {
      return null;
    }
  }

  getMaxStayDays() {
    if (this.mode == "timeToStay") {
      return this.maxStayDays;
    } else {
      return null;
    }
  }

  format() {
    if (this.mode == "single") {
      return this.from.format("l")
    } else if (this.mode == "timeToStay") {
      return this.minStayDays + " - " + this.maxStayDays + " days"
    } else if (this.mode == "interval" || this.mode == "month") {
      var toDateString;
      if (!this.to) {
        toDateString = "_"
      } else {
        toDateString = this.to.format("l")
      }
      return this.from.format("l") + " - " + toDateString
    } else if (this.mode == "anytime") {
      return tr("Anytime", "anytime");
    } else if (this.mode == "noReturn") {
      return tr("No return", "no_return_label");
    } else {
      return this.mode
    }
  }


  /* wa url */
  toUrlString() {
    return this.mode + "_" + this.from.format(urlDateFormat) + "_" + this.to.format(urlDateFormat);
  }

  /*
   Just parse it, return plain minimal/incomplete version of SearchDate object
   */
  parseUrlString(stringDate) {
    if (stringDate.indexOf("_") !== -1) {
      var split = stringDate.split("_");
      return {
        mode: split[0],
        from: moment.utc(split[1], urlDateFormat),
        to: moment.utc(split[2], urlDateFormat)
      };
    } else {
      return {
        mode: "single",
        from: moment.utc(stringDate, urlDateFormat),
        to: moment.utc(stringDate, urlDateFormat)
      };
    }
  }


  /* just helper function if i mode is not set */
  static guessModeFromPlain(plain) {
    if (plain.minStayDays && plain.maxStayDays) {
      return "timeToStay";
    } else if (!plain.from) {
      return "noReturn";
    } else if (plain.from == plain.to) {
      return "single";
    } else {
      return "interval";
    }
  }
}

module.exports = SearchDate;
