var DateFormat = require('./DateFormat.jsx');
var Translate = require('./../../../components/Translate.jsx');

module.exports = React.createClass({
  displayName: "TripDetails",
  renderFlights: function () {
    var trip = this.props.trip;
    return trip.flights.map((flight) => {
      return (
        <div className="trip-details--flight">
          <div className="field departure">
            <DateFormat dateInPlace={flight.getDeparture().get("when")}></DateFormat>
            <br />
            <strong>{flight.getDeparture().getIn(["where", "name"])}</strong> ({flight.getDeparture().getIn(["where", "code"])})
          </div>

          <div className="field duration">{Math.floor(flight.getDuration().asHours())}h {trip.getDuration().minutes()}min</div>
          <div className="field arrival">
            <DateFormat dateInPlace={flight.getArrival().get("when")}></DateFormat>
            <br />
            <strong>{flight.getArrival().getIn(["where", "name"])}</strong> ({flight.getArrival().getIn(["where", "code"])})
          </div>

          <div className="field other-info">
            <Translate tKey="common.airline"></Translate>: {flight.getIn(["airline", "code"])}
          </div>
        </div>
      )
    }).toJS();

  //TODO add stop info
    /*
     <p class="booking--flight--stop--info">
     <i class="icon fa fa-clock-o"></i>
     <%== $.t('booking.global.stop', {
     city: '<strong>' + placeNames.attr(flight.attr('src')) + '</strong>',
     time: '<strong>' + flight.stopDuration + '</strong>'
     }) %>

     <% if (flight.stopOvernight) { %>
     <br>
     <i class="icon fa fa-moon-o"></i>
     <%== $.t('booking.global.stopOvernight') %>
     <% } %>

     </p>
     */
  },
  render: function () {
    return (
      <div className="trip-details">
        {this.renderFlights()}
      </div>
    )
  }
});
