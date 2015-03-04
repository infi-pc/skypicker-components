var Immutable = require('immutable');
var List = Immutable.List;

var Def = Immutable.Record({
  master: null, //Trip
  journey: null, //Journey (if it is return, it is null, because there are multiple journeys in slaves)
  slaves: List(), //List of Map({trip: Trip, journey: Journey (common journey)})
  oneWay: true
});

class MasterSlavesPair extends Def {

}

module.exports = MasterSlavesPair;
