/** @jsx React.DOM */

var DatePicker = require("./DatePicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');
var isIE = require('./../tools/isIE.js');
var moment = require('moment');


var DatePickerModalComponent = React.createClass({
  getInitialState: function() {
    return {
      shown: false
    };
  },
  hide: function () {
    this.props.onHide();
    this.setState({
      shown: false
    });
  },
  show: function () {
    this.setState({
      shown: true
    });
  },

  clickOutside: function (e) {
    if (this.refs.datePicker) {
      if ($(this.refs.datePicker.getDOMNode()).has(e.target).length) return;
    }
    //if (options.hideOnElementClick) {
    if ($(this.props.inputElement).is(e.target)) return;
    if ($(this.props.inputElement).has(e.target).length) return;
    //}
    this.hide();
  },

  onChange: function (value, changeType) {
    if (this.props.modes[value.mode] && this.props.modes[value.mode].closeAfter == changeType) {
      this.hide();
    }
    this.props.onChange(value, changeType);
  },

  componentDidMount: function() {
    document.addEventListener("click", this.clickOutside, false);
  },
  componentWillUnmount: function() {
    document.removeEventListener("click", this.clickOutside, false);
  },
  render: function() {
    if (!this.state.shown) {
      return (
        <div></div>
      );
    }

    var rect = this.props.inputElement.getBoundingClientRect();
    var position = {
      top: rect.bottom + window.pageYOffset,
      left: rect.left
    };
    var pageWidth = $(window).width();
    var styles = {
      top: position.top + "px"
    };
    if (isIE(8,'lte')) {
      styles = {};
    }
    return (
      <div  className="wa-date-picker-modal" style={styles} >
        <DatePicker
          ref="datePicker"
          weekOffset={1}
          value={this.props.value}
          minValue={this.props.minValue}
          onChange={this.onChange}
          leftOffset={position.left}
          maxWidth={pageWidth}
          modes={this.props.modes}
          hide={this.hide} //TODO reamove
        ></DatePicker>
      </div>
    );
  }
});

module.exports = DatePickerModalComponent;


