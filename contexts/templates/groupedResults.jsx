var React = require('react');

module.exports = React.createClass({
	className: "GroupedResultsTemplate",
  render: function() {
    return (
      <div>
        <div id="search-form"></div>
        <div id="results"></div>
      </div>
    );
  }
});

