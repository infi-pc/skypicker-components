var React = require('react');

var MouseClickTile = require('./MouseClickTile.jsx');
var MapLabelsStore = require('../stores/MapLabelsStore.jsx');
var MouseClickLayer = React.createClass({

  getInitialState: function () {
    return {
      labels: []
    }
  },

  componentDidMount: function () {
    MapLabelsStore.events.on("change", () => {
      this.setState({
        labels: MapLabelsStore.labels
      })
    });
  },

  renderPoints: function () {
    var labels = this.state.labels;
    return labels.map((label) => {

      return <MouseClickTile label={label} key={label.mapPlace.place.id + "label"}></MouseClickTile>
    })
  },
  render: function () {
    return (
      <div className="mouse-clicks-overlay">
        {this.renderPoints()}
      </div>
    )
  }
});

module.exports = MouseClickLayer;