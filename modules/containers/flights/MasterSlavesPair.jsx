var Immutable = require('immutable');
var List = Immutable.List;

var Def = Immutable.Record({
  master: null, //Trip
  journey: null, //Journey (if it is return, it is null, because there are multiple journeys in slaves)
  slaves: List(), //List of Map({trip: Trip, journey: Journey (common journey)})
  oneWay: true
});

class MasterSlavesPair extends Def {

  hasJourney(journeyToFind) {
    var hasJourney = false;
    if (journeyToFind == this.get("journey")) {
      hasJourney = true;
    }
    this.get("slaves").forEach((slave) => {
      if (slave.get("journey") == journeyToFind) {
        hasJourney = true;
      }
    });
    return hasJourney;
  }
}

module.exports = MasterSlavesPair;
