var Immutable = require('immutable');
var Trip = require('./Trip.jsx');

var Def = Immutable.Record({
  id: null,
  source: null,
  trips: Immutable.Map({
    outbound: new Trip(),
    inbound: new Trip()
  }),
  prices: Immutable.Map({})
});

class Journey extends Def {
  getPrice() {
    return this.getIn(["prices", "default"]);
  }
}

module.exports = Journey;
