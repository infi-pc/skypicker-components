var PureRenderMixin = require('react').addons.PureRenderMixin;
var MapPlacesStore = require('./../stores/MapPlacesStore.jsx');
var Translate = require('./../Translate.jsx');

module.exports = React.createClass({

  mixins: [PureRenderMixin],

  getInitialState: function () {
    return {
      loading: false
    }
  },

  componentDidMount: function () {
    MapPlacesStore.events.on("change", () => {
      this.setState({
        loading: MapPlacesStore.loading
      });
    });
  },

  render: function () {
    var className = "map-loader";
    if (this.state.loading) {
      className += " map-loader-loading";
    }
    return (
      <div className="map-loader-wrapper">
        <div className={className}>
          <span><Translate tKey="map.loading_map_prices">Loading map prices</Translate> <i className="spinner fa fa-spinner fa-spin"></i></span>
        </div>
      </div>
    )
  }
});
