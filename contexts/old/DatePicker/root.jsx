/** @jsx React.DOM */

//Using global, TODO make it somehow importable from another bundle
var React = window.React;
//var React = require('react');

var DatePicker = require('./../../modules/DatePicker/DatePicker.jsx');
var SearchDate = require('./../../modules/containers/SearchDate.js');

var modesEnabled = {
  "single": true,
  "interval": true,
  "month": true,
  "timeToStay": true,
  "anytime": true,
  "noReturn": true
};

RootDatePicker = React.createClass({
  getInitialState: function() {
    var value;
    value = new SearchDate();
    return {
      value: value
    };
  },
  onChange: function(newValue) {
    return this.setState({
      value: newValue
    });
  },
  render: function() {
    return (
      <div  className="wa-date-picker-modal" >
        <DatePicker
          ref="datePicker"
          weekOffset={1}
          value={this.state.value}
          onChange={this.onChange}
          leftOffset={0}
          maxWidth={500}
          modesEnabled={modesEnabled}
          hide={this.hide}
        ></DatePicker>
      </div>
    );
  }
});


React.renderComponent(
  RootDatePicker({weekOffset: 0}),
  document.getElementById('xxx')
);


