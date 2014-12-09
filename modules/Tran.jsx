/** @jsx React.DOM */

var React = require('react');
var tr = require('./tr.js');

/* react component wrapper of tr function */

var Tran = React.createClass({
  render: function() {
    var original = this.props.children;
    var key = this.props.key;
    return (
      <span>
				{ tr(original,key) }
      </span>
    );
  }
});

module.exports = Tran;
