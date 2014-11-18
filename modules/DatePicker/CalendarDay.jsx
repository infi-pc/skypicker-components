/** @jsx React.DOM */

//Using global, TODO make it somehow importable from another bundle
var React = window.React;
//var React = require('react');

var CalendarDay = React.createClass({

  onOver: function () {
    this.props.onOver(this.props.date)
  },
  onSelect: function () {
    this.props.onSelect(this.props.date)
  },

  getDefaultProps: function() {
    return {
      date: null,
      otherMonth: ''
    };
  },

  render: function() {

    var classes = this.props.otherMonth;
    if (!classes) {
      classes = "";
    }
    if (this.props.disabled) {
      classes += " disabled";
      return (
        <div className={ classes }>
          <span className='day-number'>{this.props.date.date()}</span>
        </div>
      )
    }

    if (this.props.over) {
      classes += " over"
    }
    if (this.props.selected) {
      classes += " selected"
    }
    return ( //onMouseLeave={ this.props.onLeave }
      <div className={ classes } onMouseEnter={ this.onOver }  onClick={ this.onSelect }>
        <span className='day-number'>{this.props.date.date()}</span>
      </div>
    );
  }
});

module.exports = CalendarDay;
