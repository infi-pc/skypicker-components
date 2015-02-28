var Immutable = require('immutable');

var Def = Immutable.Record({
  flights: Immutable.List([])
});

class Trip extends Def {

}

module.exports = Trip;
