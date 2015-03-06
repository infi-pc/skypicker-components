/** @jsx React.DOM */

var React = require('react');
var Tran = require('./../../../components/Tran.jsx');

var SelectDaysInWeek = React.createClass({

  render: function() {
    return ( //onMouseLeave={ this.props.onLeave }
      <label>
        Tue
        <input type="checkbox" name="flyDays[]" value="2" checked="&quot;checked&quot;" />
        <span></span>
      </label>
    );
  }
});

module.exports = SelectDaysInWeek;
