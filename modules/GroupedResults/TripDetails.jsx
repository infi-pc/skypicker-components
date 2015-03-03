var DateFormat = require('./DateFormat.jsx');

module.exports = React.createClass({
  displayName: "TripDetails",
  renderFlights: function () {
    var trip = this.props.trip;
    return trip.flights.map((flight) => {
      return (
        <div>
          <div className="field radio"></div>
          <div className="field departure-date"><DateFormat dateInPlace={flight.getDeparture().get("when")}></DateFormat></div>
          <div className="field departure">{flight.getDeparture().getIn(["where", "code"])}</div>
          <div className="field duration">{Math.floor(flight.getDuration().asHours())}h {trip.getDuration().minutes()}min</div>
          <div className="field arrival-date"><DateFormat dateInPlace={flight.getArrival().get("when")}></DateFormat></div>
          <div className="field arrival">{flight.getArrival().getIn(["where", "code"])}</div>
          <div className="field stops"></div>
          <div className="field details"></div>
        </div>
      )
    }).toJS();
  },
  render: function () {
    return (
      <div className="trip-details">
        {this.renderFlights()}
      </div>
    )
  }
});
