var Immutable = require('immutable');

var Def = Immutable.Record({
  flights: Immutable.List([])
});

class Trip extends Def {
  getId() {
    return this.flights.reduce((res, flight) => {
      return res.concat([flight.id]);
    }, []).join("|");
  }

  getStops() {
    return this.flights.count() - 1;
  }

  getDeparture() {
    return this.flights.first().get("departure");
  }

  getArrival() {
    return this.flights.last().arrival;
  }

  getDuration() {
    return moment.duration(this.getArrival().when.utc.diff(this.getDeparture().when.utc));
  }
}

module.exports = Trip;
