var Translate = require("./../../../components/Translate.jsx");
var Price = require("./../../../components/Price.jsx");

var LinkButton = React.createClass({
  render: function () {
    var sharedJourney = this.props.sharedJourney;
    var baseUrl = "https://en.skypicker.com/booking"; //TODO change it
    if (sharedJourney) {
      var url = baseUrl + "?flightsId=" + sharedJourney.get("id") + "&price=" + sharedJourney.getPrice();
      return (
        <a href={url} className="btn"><Translate tKey="result.book_flight_for">Book flight for</Translate> <Price>{sharedJourney.getPrice()}</Price></a>
      );
    } else {
      var id = this.props.selected.get("outbound").master.getId() + "|" +  this.props.selected.get("inbound").master.getId()
      var url = baseUrl + "?flightsId=" + id;
      return (
        <a href={url} className="btn">Check price and book flight</a>
      );
    }
  }
});

module.exports = LinkButton;
