var Immutable = require('immutable');

var Def = Immutable.Record({
  id: null,
  number: null,
  departure: null,
  arrival: null,
  airline: null
});

class Flight extends Def {

  getId() {
    return this.get("id");
  }

  getStops() {
    return 0;
  }

  getDeparture() {
    return this.get("departure");
  }

  getArrival() {
    return this.get("arrival");
  }

  getDuration() {
    return moment.duration(this.getArrival().get("when").get("utc").diff(this.getDeparture().get("when").get("utc")));
  }

  countFlights() {
    return 1;
  }
}

module.exports = Flight;
