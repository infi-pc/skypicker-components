/** @jsx React.DOM */

var React = require('react');
var tr = require('./tr.js');

/* react component wrapper of tr function */

var Tran = React.createClass({
  render: function() {
    var original = this.props.children;
    var key = this.props.tKey;
    var values = this.props.values;
    return (
      <span>
				{ tr(original,key,values) }
      </span>
    );
  }
});

module.exports = Tran;
