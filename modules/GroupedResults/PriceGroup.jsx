var LegInfo = require("./LegInfo.jsx");

module.exports = React.createClass({
  className: "PriceGroup",

  getInitialState: function () {
    return {
      selectedOutboundId: null
    }
  },
  splitFlightToLegs: function (flight) {
    var outbound = {singleFlights: []};
    var inbound = {singleFlights: []};
    flight.route.forEach((route) => {
      if (route.return) {
        inbound.singleFlights.push(route);
      } else {
        outbound.singleFlights.push(route);
      }
    });

    outbound.id = outbound.singleFlights.reduce((res, flight) => {
      //debugger;
      return res.concat([flight.id]);
    }, []).join("|");

    inbound.id = inbound.singleFlights.reduce((res, flight) => {
      //debugger;
      return res.concat([flight.id]);
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
    return Object.keys(outboundLegsPrimary).map((key) => outboundLegsPrimary[key]);
  },

  render: function () {
    var price = this.props.price;
    var flights = this.props.flights;

    var legPairs = flights.map((flight) => {
     return this.splitFlightToLegs(flight);
    });
    var mergedOutbounds = this.mergeLegsToOutbounds(legPairs);

    var inboundLegs = "";
    if (this.state.selectedOutboundId) {

    } else {
      inboundLegs = <span>select outbound flight first</span>
    }

    return (
      <div className="price-group">
        <div className="price-group--header">{price}</div>
        <div className="outbound-legs">
          <div className="legs-header">
            Outbound
          </div>
          <div className="legs-body">
            {mergedOutbounds.map((mergedOutbound) => {
              return <LegInfo leg={mergedOutbound.leg}></LegInfo>
            })}
          </div>
        </div>
        <div className="inbound-legs">
          <div className="legs-header">
            Inbound
          </div>
          <div className="legs-body">
            {inboundLegs}
          </div>
        </div>
      </div>
    )
  }
});
