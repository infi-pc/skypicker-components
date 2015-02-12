var PureRenderMixin = require('react').addons.PureRenderMixin;
var MapPlacesStore = require('./../stores/MapPlacesStore.jsx');

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
      <div className={className}>
        Loading prices
      </div>
    )
  }
});
