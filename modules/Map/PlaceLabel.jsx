var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');
var SearchPlace = require('./../../modules/containers/SearchPlace.jsx');


var PlaceLabel = React.createClass({

  getDefaultProps: function () {
    return {
      showFullLabel: false
    }
  },
  getInitialState: function () {
    return {
      active: false
    }
  },


  componentDidMount: function () {
    google.maps.event.addDomListener(this.refs.label.getDOMNode(), 'contextmenu', this.onRightClick);
  },

  componentWillUnmount: function () {
    google.maps.event.clearListeners(this.refs.label.getDOMNode(), 'contextmenu');
    //google.maps.event.removeDomListener(this.refs.label.getDOMNode(), 'contextmenu', this.onRightClick);
  },



  onRightClick: function (e) {
    SearchFormStore.setField("origin", new SearchPlace({mode: "place", value: this.props.mapPlace.place}));
  },
  onClick: function (e) {
    SearchFormStore.setField("destination", new SearchPlace({mode: "place", value: this.props.mapPlace.place}));
  },
  render: function () {
    var mapPlace = this.props.mapPlace;

    var fullLabel, image;
    if (this.props.showFullLabel) {
      fullLabel = (
        <div>
          <span className="city-label-title">{mapPlace.place.shortName}</span><br/>
          <span>199 US$</span>
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
      <div ref="label" style={this.props.style} className="city-label" onClick={this.onClick}>
        {image}
        {fullLabel}
      </div>
    )
  }

});


module.exports = PlaceLabel;
