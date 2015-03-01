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

  mergeTripsToMaster: function (journeys, masterDirection) {
    var slaveDirection = masterDirection == "outbound" ? "inbound" : "outbound";
    var master = {};
    journeys.forEach((journey) => {
      var id = journey.get("trips").get(masterDirection).getId()
      if (!master[id]) {
        master[id] = {master: journey.get("trips").get(masterDirection), slaves: []};
      }
      master[id].slaves.push({
        trip: journey.trips.get(slaveDirection),
        journey: journey
      });
    });
    return Object.keys(master).map((key) => master[key]);
  },

  render: function () {
    var price = this.props.price;
    var journeys = this.props.journeys;

    var mergedOutbounds = this.mergeTripsToMaster(journeys, "outbound");
    var mergedInbounds = this.mergeTripsToMaster(journeys, "inbound");

    return (
      <div className="price-group">
        <div className="price-group--header">{price}</div>
        <div className="outbound-legs">
          <div className="legs-header">
            Outbound
          </div>
          <div className="legs-body">
            <table>
              <tbody>
                {mergedOutbounds.map((pair) => {
                  return <TripInfo key={pair.master.getId()} trip={pair.master}></TripInfo>
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="inbound-legs">
          <div className="legs-header">
            Inbound
          </div>
          <div className="legs-body">
            <table>
              <tbody>
                {mergedInbounds.map((pair) => {
                  return <TripInfo key={pair.master.getId()} trip={pair.master}></TripInfo>
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
});
