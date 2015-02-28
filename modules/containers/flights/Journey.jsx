var Immutable = require('immutable');
var Trip = require('./Trip.jsx');

var Def = Immutable.Record({
  id: null,
  source: null,
  trips: Immutable.Map({
    outbound: new Trip(),
    inbound: new Trip()
  }),
  prices: {}
});

class Journey extends Def {

}

module.exports = Journey;
