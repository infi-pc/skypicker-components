var React = require('react');
var PlaceLabel = require('./PlaceLabel.jsx');
var MapPlacesStore = require('../stores/MapPlacesStore.jsx');
var MapPlaces = React.createClass({

  getInitialState: function () {
    return {
      places: []
    }
  },

  componentDidMount: function () {
    //TODO connect to store???
    MapPlacesStore.events.on("placesChanged", () => {
      this.forceUpdate();
    });
  },

  flatBounds: function () {
    if (!this.props.bounds) return null;
    var bounds = this.props.bounds;
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    return {
      wLng: sw.lng(),
      eLng: ne.lng(),
      sLat: sw.lat(),
      nLat: ne.lat()
    }
  },

  renderPlaces: function () {
    if (!this.props.bounds) return "";
    var labels = MapPlacesStore.getMapPlacesInBounds(this.flatBounds(this.props.bounds), this.props.overlayProjection.fromLatLngToDivPixel.bind(this.props.overlayProjection));
    return labels.map((label) => {
      var labelStyle = {
        top: label.position.y,
        left: label.position.x
      };
      //TODO move all the shit inside, pass only label
      return (<PlaceLabel key={label.mapPlace.place.id} style={labelStyle} label={label} />)
    })
  },
  render: function () {
    return (
      <div className="places-overlay">
        {this.renderPlaces()}
      </div>
    )
  }

});


module.exports = MapPlaces;
