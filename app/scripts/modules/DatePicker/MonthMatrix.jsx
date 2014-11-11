/** @jsx React.DOM */

//Using global, TODO make it somehow importable from another bundle
var React = window.React;
//var React = require('react');

var moment = require('moment');

var MonthMatrix = React.createClass({

  setMonth: function (month) {
    var that = this;
    return function () {
      that.props.onSet(month);
    }
  },
  render: function() {
    var self = this;
    var months = [];
    var iMonth = moment();
    for (var i = 0; i < 9; i++) {
      months.push( moment(iMonth) );
      iMonth.add(1, "months");
    }
    var monthsElements = months.map(function (month) {
      return (
        <div className="month-option" onClick={self.setMonth(month)}>
          <span className="month-name">
            { month.format("MMMM") }
          </span>
          <br />
          <span className="month-year">
            { month.format("YYYY") }
          </span>
        </div>
      );
    });

    return ( //onMouseLeave={ this.props.onLeave }
      <div className="month-matrix">
        <div className="content-headline">Select month</div>
        <div className="months">
          {monthsElements}
        </div>
      </div>
    );
  }
});

module.exports = MonthMatrix;
