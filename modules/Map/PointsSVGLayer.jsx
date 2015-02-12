var React = require('react');
var MapLabelsStore = require('../stores/MapLabelsStore.jsx');
var PointSVG = require('./PointSVG.jsx');


var PointsLayer = React.createClass({

  getInitialState: function () {
    return {
      labels: []
    }
  },

  componentDidMount: function () {
    MapLabelsStore.events.on("change", () => {
      this.setState({
        labels: MapLabelsStore.getLabels()
      });
    });
  },

  renderPoints: function () {
    var labels = this.state.labels;
    return labels.map((label) => {
      return (<PointSVG key={label.mapPlace.place.id} label={label} />)
    })
  },
  render: function () {
    return (
      <div className="points-svg-overlay map-overlay">
        {this.renderPoints()}
      </div>
    )
  }

});


module.exports = PointsLayer;
