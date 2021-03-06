var Journey = require('./../../containers/flights/Journey.jsx');
var Flight = require('./../../containers/flights/Flight.jsx');
var Trip = require('./../../containers/flights/Trip.jsx');
var Immutable = require('immutable');

module.exports = function (obj) {
  var outboundTrip = [];
  var inboundTrip = [];

  var journey = new Journey({
    id: obj['id'],
    source: obj['source']
  });

  journey = journey.setIn(['prices', 'default'], obj['price']);


  obj.route.forEach(function(flightObj) {

    var flight = new Flight({
      id: flightObj['id'],
      number: flightObj['flight_no'],

      //TODO thing about use of Place and TimeInPlace objects
      departure: Immutable.fromJS({
        where: {
          id: flightObj['mapIdfrom'],
          code: flightObj['flyFrom'],
          name: flightObj['cityFrom'],
          lat: flightObj['latFrom'],
          lng: flightObj['lngFrom']
        },
        when: {
          local: moment.utc(flightObj['dTime'] * 1000),
          utc: moment.utc(flightObj['dTimeUTC'] * 1000)
        }
      }),
      arrival: Immutable.fromJS({
        where: {
          id: flightObj['mapIdto'],
          code: flightObj['flyTo'],
          name: flightObj['cityTo'],
          lat: flightObj['latTo'],
          lng: flightObj['lngTo']
        },
        when: {
          local: moment.utc(flightObj['aTime'] * 1000),
          utc: moment.utc(flightObj['aTimeUTC'] * 1000)
        }
      }),
      airline: Immutable.fromJS({
        code: flightObj['airline']
        //name: airlines[flightObj['airline']] && airlines[flightObj['airline']].name
      })
    });

    var direction = flightObj['return']?"inbound":"outbound";

    if (!journey.get('trips').get(direction)) {
      journey = journey.setIn(['trips',direction], new Trip())
    }
    journey = journey.updateIn(['trips', direction, 'flights'], flights => flights.push(flight));
  });



  return journey;
};
