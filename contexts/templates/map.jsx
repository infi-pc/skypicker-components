var React = require('react');

var Map = React.createClass({
  render: function() {
    return (
      <div>
        <div id="map-canvas"></div>
        <div id="output"></div>
      </div>
    );
  }
});
module.exports = Map;
