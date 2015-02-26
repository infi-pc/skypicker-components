var LegInfo = require("./LegInfo.jsx");

module.exports = React.createClass({
  className: "GroupedResults",
  splitFlightToLegs: function (flight) {
    var outbound = {singleFlights: []};
    var inbound = {singleFlights: []};
    flight.route.forEach((route) => {
      if (route.return) {
        inbound.push(route);
      } else {
        outbound.push(route);
      }
    });

    outbound.id = outbound.singleFlights.reduce((res, flight) => {
      return res.push(flight.id);
    }, []).join("|");

    inbound.id = inbound.singleFlights.reduce((res, flight) => {
      return res.push(flight.id);
    }, []).join("|");

    return {
      outbound: outbound,
      inbound: inbound,
      flight: flight
    }
  },

  mergeLegsToOutbounds: function (legPairs) {
    var outboundLegsPrimary = {};
    legPairs.forEach((legPair)=> {
      if (!outboundLegsPrimary[legPair.outbound.id]) {
        outboundLegsPrimary[legPair.outbound.id] = {leg: legPair.outbound, inboundLegs: []};
      }
      outboundLegsPrimary[legPair.outbound.id].inboundLegs.push({
        leg: legPair.inbound,
        flight: legPairs.flight
      });
    });
    return outboundLegsPrimary;
  },

  render: function () {
    var price = this.props.price;
    var flights = this.props.flights;

    var legPairs = flights.map((flight) => {
     return this.splitFlightToLegs(flight);
    });
    var mergedOutbounds = this.mergeLegsToOutbounds(legPairs);

    return (
      <div>
        <div>{price}</div>
        <div className="outbound-legs">
          {mergedOutbounds.map((mergedOutbound) => {
            return <LegInfo leg={mergedOutbound.leg}></LegInfo>
          })}
        </div>
        <div className="inbound-legs">

        </div>
      </div>
    )
  }
});
