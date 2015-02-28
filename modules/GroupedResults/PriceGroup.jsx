var TripInfo = require("./TripInfo.jsx");

module.exports = React.createClass({
  displayName: "PriceGroup",

  getInitialState: function () {
    return {
      selectedOutboundId: null
    }
  },
  // splitJourneysToLegs: function (journey) {
  //   var outbound = {singleFlights: []};
  //   var inbound = {singleFlights: []};
  //   flight.route.forEach((route) => {
  //     if (route.return) {
  //       inbound.singleFlights.push(route);
  //     } else {
  //       outbound.singleFlights.push(route);
  //     }
  //   });

  //   outbound.id = outbound.singleFlights.reduce((res, flight) => {
  //     return res.concat([flight.id]);
  //   }, []).join("|");

  //   inbound.id = inbound.singleFlights.reduce((res, flight) => {
  //     return res.concat([flight.id]);
  //   }, []).join("|");

  //   return {
  //     outbound: outbound,
  //     inbound: inbound,
  //     flight: flight
  //   }+
  // },

  mergeTripsToOutbounds: function (journeys) {
    var master = {};
    journeys.forEach((journey) => {
      var id = journey.get("trips").get("outbound").getId()
      if (!master[id]) {
        master[id] = {outbound: journey.get("trips").get("outbound"), inbounds: []};
      }
      master[id].inbounds.push({
        trip: journey.trips.get("inbound"),
        journey: journey
      });
    });
    return Object.keys(master).map((key) => master[key]);
  },

  render: function () {
    var price = this.props.price;
    var journeys = this.props.journeys;

    var mergedOutbounds = this.mergeTripsToOutbounds(journeys);

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
            {mergedOutbounds.map((pair) => {
              return <TripInfo trip={pair.outbound}></TripInfo>
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
