var React = require('react');
var PlaceLabel = require('./PlaceLabel.jsx');
var MapLabelsStore = require('../stores/MapLabelsStore.jsx');
var LabelsLayer = React.createClass({

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

  renderPlaces: function () {
    var labels = this.state.labels;
    return labels.map((label) => {
      return (<PlaceLabel key={label.mapPlace.place.id} label={label} />)
    })
  },
  render: function () {
    return (
      <div className="labels-overlay">
        {this.renderPlaces()}
      </div>
    )
  }

});


module.exports = LabelsLayer;
