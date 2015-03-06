/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');

var TimelineStore = require("./TimelineStore.js");


/*
  React version of price graph
  !not finished
 */
var PriceGraph = React.createClass({

  getInitialState: function() {
    return {
      startDate: moment.utc(),
      numOfdays: 32,
      loading: false
    };
  },

  getDefaultProps: function() {
    return {

    };
  },
  componentDidMount: function() {

  },

  render: function() {

    return ( //onMouseLeave={ this.props.onLeave }
      <div>

      </div>
    );
  }
});

module.exports = PriceGraph;
