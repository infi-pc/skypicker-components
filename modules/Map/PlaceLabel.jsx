var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');
var SearchPlace = require('./../../modules/containers/SearchPlace.jsx');


var PlaceLabel = React.createClass({
  componentDidMount: function () {
    google.maps.event.addDomListener(this.refs.label.getDOMNode(), 'mouseover', this.onMouseOver);
    google.maps.event.addDomListener(this.refs.label.getDOMNode(), 'mouseout', this.onMouseOut);
    google.maps.event.addDomListener(this.refs.label.getDOMNode(), 'contextmenu', this.onRightClick);
    google.maps.event.addDomListener(this.refs.label.getDOMNode(), 'click', this.onClick);
  },

  componentWillUnmount: function () {
    google.maps.event.clearListeners(this.refs.label.getDOMNode(), 'mouseover');
    google.maps.event.clearListeners(this.refs.label.getDOMNode(), 'mouseout');
    google.maps.event.clearListeners(this.refs.label.getDOMNode(), 'contextmenu');
    google.maps.event.clearListeners(this.refs.label.getDOMNode(), 'click');
    //google.maps.event.removeDomListener(this.refs.label.getDOMNode(), 'contextmenu', this.onRightClick);
  },
  onMouseOver: function () {

  },
  onMouseOut: function () {

  },
  onRightClick: function (e) {
    console.log("right click on label");
    e.stopPropagation();
    e.preventDefault();
    SearchFormStore.setField("origin", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}));
  },
  onClick: function (e) {
    e.stopPropagation();
    SearchFormStore.setField("destination", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}));
  },
  render: function () {
    var mapPlace = this.props.label.mapPlace;
    var style = this.props.style;
    var fullLabel, image, price;
    var labelText = mapPlace.place.shortName;
    var className = "city-label";
    var flagText = "";
    if (mapPlace.price) {
      var priceStyle = {
        //color: "hsla("+parseInt( (1-this.props.label.relativePrice) *115)+", 100%, 40%, 1)"
      };
      price = <span className="city-label-price" style={priceStyle}>{mapPlace.price}EUR</span>
    }

    if (mapPlace.flag == "origin") {
      flagText = <span className="flag-text">From: </span>;
      className += " flag-"+mapPlace.flag;
    }
    if (mapPlace.flag == "destination") {
      flagText = <span className="flag-text">To: </span>;
      className += " flag-"+mapPlace.flag;
    }

    if (this.props.label.showFullLabel) {
      fullLabel = (
        <div>
          <span className="city-label-title">{flagText} {labelText}</span><br/>
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
      <div ref="label" style={style} className={className}>
        {image}
        {fullLabel}
      </div>
    )
  }

});


module.exports = PlaceLabel;
