var PureRenderMixin = require('react').addons.PureRenderMixin;

var PlaceLabel = React.createClass({

  mixins: [PureRenderMixin],

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
