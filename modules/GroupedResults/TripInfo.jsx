var TripDetails = require('./TripDetails.jsx');
var DateFormat = require('./DateFormat.jsx');


module.exports = React.createClass({
  displayName: "TripInfo",
  getInitialState: function () {
    return {
      details: false
    }
  },
  select: function () {
    this.props.onSelect(this.props.trip);
  },
  toggleDetails: function () {
    this.setState({
      details: !this.state.details
    })
  },
  render: function () {
    var className = "trip-info";
    var trip = this.props.trip;
    var stops;
    if (trip.getStops() >= 1) {
      stops = trip.getStops() + " "+"stops";
    } else {
      stops = "Direct flight";
    }
    if (this.props.selected) {
      className += " selected";
    }
    if (this.props.hidden) {
      className += " hidden";
    }

    var circleClass;
    if (this.props.selected) {
      circleClass = "fa fa-dot-circle-o";
    } else {
      circleClass = "fa fa-circle-o";
    }

    var details = "";
    if (this.state.details) {
      details = <TripDetails trip={this.props.trip}></TripDetails>
    }
    return (
      <div className={className} onClick={this.select}>
        <div className="field radio"><i className={circleClass}></i></div>
        <div className="field departure-date"><DateFormat dateInPlace={trip.getDeparture().get("when")}></DateFormat></div>
        <div className="field departure">{trip.getDeparture().getIn(["where", "code"])}</div>
        <div className="field duration">{Math.floor(trip.getDuration().asHours())}h {trip.getDuration().minutes()}min</div>
        <div className="field arrival-date"><DateFormat dateInPlace={trip.getArrival().get("when")}></DateFormat></div>
        <div className="field arrival">{trip.getArrival().getIn(["where", "code"])}</div>
        <div className="field stops">{stops}</div>
        <div className="field details" onClick={this.toggleDetails}>Details</div>
        {details}
      </div>
    )
  }
});
