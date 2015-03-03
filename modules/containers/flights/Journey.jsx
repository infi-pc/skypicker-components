var Immutable = require('immutable');


var Def = Immutable.Record({
  id: null,
  source: null,
  trips: Immutable.Map(), //usually {outbound: new Trip(), inbound: new Trip()}
  prices: Immutable.Map({})
});

class Journey extends Def {
  getPrice() {
    return this.getIn(["prices", "default"]);
  }

  countFlights() {
    //TO
  }

  isReturn() {
    return !!this.get("trips").get("inbound");
  }
}

module.exports = Journey;
