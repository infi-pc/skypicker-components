var Immutable = require('immutable');

var Def = Immutable.Record({
  flights: Immutable.List([])
});

class Trip extends Def {
  getId() {
    return this.get("flights").reduce((res, flight) => {
      return res.concat([flight.id]);
    }, []).join("|");
  }

  getStops() {
    return this.get("flights").count() - 1;
  }

  getDeparture() {
    return this.get("flights").first().get("departure");
  }

  getArrival() {
    return this.get("flights").last().arrival;
  }

  getDuration() {
    return moment.duration(this.getArrival().get("when").get("utc").diff(this.getDeparture().get("when").get("utc")));
  }

  countFlights() {
    return this.get("flights").count();
  }
}

module.exports = Trip;
