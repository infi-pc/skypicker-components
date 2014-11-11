/*
  constructor:
  date: moment object
 */

var DayData = function (date) {
  this.date = date;
  this.flights = null; //null when not loaded, [] when loaded but no flights
  this.price = -1;
};

DayData.prototype.addFlight = function (flight) {
  if (this.flights == null) {
    this.flights = [];
  }
  this.flights.push(flight);
  if (this.price == -1 || flight.price < this.price) {
    this.price = flight.price;
  }
};

/*
 returns: notLoaded, loaded, noFlight
 */
DayData.prototype.state = function () {
  if (this.flights == null) {
    return "notLoaded";
  } else if (this.flights.length == 0) {
    return "noFlight";
  } else  if (this.flights.length > 0) {
    return "loaded";
  } else {
    return "???"
  }
};


module.exports = DayData;
