//
var DateFormat = React.createClass({

  render: function () {
    var local = this.props.dateInPlace.get("local");
    var utc = this.props.dateInPlace.get("utc");
    var title = "In UTC time: " + utc.format("LLL");
    return (
      <span title={title}><b>{local.format("MMM D")}</b> {local.format("ddd")} <b>{local.format("LT")}</b></span>
    )
  }
});


module.exports = React.createClass({
  displayName: "TripInfo",
  select: function () {
    this.props.onSelect(this.props.trip);
  },
  render: function () {
    var className = "trip-info";
    var trip = this.props.trip;
    var stops;
    if (trip.getStops() >= 1) {
      stops = trip.getStops() + " stops";
    } else {
      stops = "Direct flight";
    }
    if (this.props.selected) {
      className += " selected";
    }
    return (
      <tr className={className} onClick={this.select}>
        <td><div className="fake-radio"></div></td>
        <td>{trip.getId()} ---- </td>
        <td><DateFormat dateInPlace={trip.getDeparture().get("when")}></DateFormat></td>
        <td>{trip.getDeparture().getIn(["where", "code"])}</td>
        <td>{Math.floor(trip.getDuration().asHours())}h {trip.getDuration().minutes()}min</td>
        <td><DateFormat dateInPlace={trip.getArrival().get("when")}></DateFormat></td>
        <td>{trip.getArrival().getIn(["where", "code"])}</td>
        <td>{stops}</td>
        <td>Details</td>
      </tr>
    )
  }
});
