var SkypickerAPI = require("./../SkypickerAPI");
var SearchDate = require("./../../containers/SearchDate.jsx");
var DayData = require("./DayData.js");

var skypickerAPI = new SkypickerAPI({lang: "en"});

var sortableDayFormat = "YYYYMMDD";


/*
  Model for price graph and eventually price calendar
  !not finished
 */
var TimelineStore = function (from, to) {
  this.from = from;
  this.to = to;
  this.days = {};
};

TimelineStore.prototype.preload = function (dateFrom, dateTo, callback) {
  var self = this;
  var request = {
    from: this.from,
    to: this.to,
    date: new SearchDate({
      from: dateFrom,
      to: dateTo
    }),
    oneForDay: true
  };
  skypickerAPI.call(request, function (err, data) {
    if (!err) {
      for (var i = 0; i < data.length; ++i) {
        var flight = data[i];
        var date = moment.unix(flight.dTime * 1); //TODO check if it's not necessary use moment.utc
        //var dayData = new DayData(date);
        var dayData = self.getDay(date);
        dayData.addFlight(flight);
      }
    } else {
      log("TimelineStore - error", "error", err);
    }
    callback();
  });
};

TimelineStore.prototype.getDay = function (date) {
  var index = date.format(sortableDayFormat);
  if (!this.days[index]) {
    this.days[index] = new DayData(date);
  }
  return this.days[index];
};

module.exports = TimelineStore;


