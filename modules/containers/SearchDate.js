var moment = require("moment");

var urlDateFormat = "YYYY-MM-DD";

/*
class SearchDate
it has state for all modes, bude for
  constructor
  input = plain object or string or just another SearchDate object
 */
SearchDate = function (input) {
  var plain = {};
  if (typeof input == "string") {
    plain = this.parseUrlString(input);
  } else if (typeof input == "object") {
    plain = input;
  }
  this.mode = plain.mode || "single";
  this.from = plain.from || moment.utc();
  this.to = plain.to || moment.utc();
  this.minStayDays = typeof(plain.minStayDays) != 'undefined'? plain.minStayDays : 2;
  this.maxStayDays = typeof(plain.maxStayDays) != 'undefined'? plain.maxStayDays : 10;
  this.final = true;
};

/* sets mode with checking some internal validity */
/* but probably valitity should be handled by getters, because it is nice to have internal state for others modes than enabled */

//SearchDate.prototype.setMode = function(mode) {
//  var previousMode = this.mode;
//  if (mode == "single") {
//    this.to = this.from;
//  } else if (mode == "anytime") {
//    this.from = moment.utc().add(1, "days");
//    this.to = moment.utc().add(6, "months");
//  }
//  this.mode = mode;
//};



SearchDate.prototype.getMode = function() {
  return this.mode
};

SearchDate.prototype.getFrom = function() {
  if (this.mode == "timeToStay" || this.mode == "noReturn") {
    return null;
  } else if (this.mode == "anytime") {
    return moment.utc().add(1,"days");
  } else {
    return this.from
  }
};

SearchDate.prototype.getTo = function() {
  if (this.mode == "timeToStay" || this.mode == "noReturn") {
    return null;
  } else if (this.mode == "single") {
    return this.from
  } else if (this.mode == "anytime") {
    return moment.utc().add(6,"months");
  } else {
    if (this.to) {
      return this.to
    } else {
      //just for cases when the value is not filled (not complete interval)
      return this.from
    }
  }
};

SearchDate.prototype.getDate = function() {
  if (this.mode == "single") {
    return this.from
  } else {
    return null
  }
};

SearchDate.prototype.getMinStayDays = function() {
  if (this.mode == "timeToStay") {
    return this.minStayDays;
  } else {
    return null;
  }
};

SearchDate.prototype.getMaxStayDays = function() {
  if (this.mode == "timeToStay") {
    return this.maxStayDays;
  } else {
    return null;
  }
};

/* wa url */
SearchDate.prototype.toUrlString = function() {
  return this.mode + "_" + this.from.format(urlDateFormat) + "_" + this.to.format(urlDateFormat);
};

/*
  Just parse it, return plain minimal/incomplete version of SearchDate object
 */
SearchDate.prototype.parseUrlString = function(stringDate) {
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
};

SearchDate.prototype.mergeInto = function(newValues){
  for (var attrname in newValues) {
    if(newValues.hasOwnProperty(attrname)){
      this[attrname] = newValues[attrname];
    }
  }
}


module.exports = SearchDate;
