module.exports = React.createClass({
  displayName: "TripInfo",
  render: function () {
    var trip = this.props.trip;
    console.log(trip.getId());
    return (<div>{trip.getId()}</div>)
  }
});
