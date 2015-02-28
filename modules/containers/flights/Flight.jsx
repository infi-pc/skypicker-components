var Immutable = require('immutable');

var Def = Immutable.Record({
  id: null,
  number: null,
  departure: null,
  arrival: null,
  airline: null
});

class Flight extends Def {
  duration() {
    //return moment(this.get('arrival').when.utc.diff(this.departure.when.utc)).utc();
  }
}

module.exports = Flight;
