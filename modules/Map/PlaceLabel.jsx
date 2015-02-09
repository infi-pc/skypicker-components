var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');
var SearchPlace = require('./../../modules/containers/SearchPlace.jsx');


var PlaceLabel = React.createClass({
  componentDidMount: function () {
    google.maps.event.addDomListener(this.refs.label.getDOMNode(), 'contextmenu', this.onRightClick);
  },

  componentWillUnmount: function () {
    google.maps.event.clearListeners(this.refs.label.getDOMNode(), 'contextmenu');
    //google.maps.event.removeDomListener(this.refs.label.getDOMNode(), 'contextmenu', this.onRightClick);
  },

  onRightClick: function (e) {
    SearchFormStore.setField("origin", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}));
  },
  onClick: function (e) {
    SearchFormStore.setField("destination", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}));
  },
  render: function () {
    var mapPlace = this.props.label.mapPlace;
    var style = this.props.style;
    var fullLabel, image, price;
    if (mapPlace.price) {
      var priceStyle = {
        color: "hsla("+parseInt( (1-this.props.label.relativePrice) *115)+", 100%, 50%, 1)",
        textShadow: "0px 1px 1px #000, 1px 0px 1px #000, 1px 1px 1px #000, 1px 0px 1px #000"
      };
      price = <span style={priceStyle}>{mapPlace.price}EUR</span>
    }
    if (this.props.label.showFullLabel) {
      fullLabel = (
        <div>
          <span className="city-label-title">{mapPlace.place.shortName}</span><br/>
          {price}
        </div>
      );
      image = <img src="/images/markers/city.png" />
    } else {
      image = <img src="/images/markers/citySmall.png" />
    }
    if (mapPlace.flag == "origin") {
      image = <img src="/images/markers/cityWithPrice.png" />
    }
    if (mapPlace.flag == "destination") {
      image = <img src="/images/markers/cityWithPrice.png" />
    }
    return (
      <div ref="label" style={style} className="city-label" onClick={this.onClick}>
        {image}
        {fullLabel}
      </div>
    )
  }

});


module.exports = PlaceLabel;
