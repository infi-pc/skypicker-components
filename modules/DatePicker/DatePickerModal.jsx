/** @jsx React.DOM */

var DatePicker = require("./DatePicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');
var moment = require('moment');
/**
 * show modal datepicker (only one important function for DatePicker)
 * it hides itself and take care that it is only one on page
 * @param{Object} options
 * @param{HTMLElement} options.element - plain html element to bind, it takes boundaries of that object
 * @param{SearchDate} options.value - value
 * @param{Object} options.modesEnabled - example and default value is below
 * @param{string} options.locale - (cs,en,...)
 * @param{function(SearchDate)} onChange
 */

exports.show = function (options, onChange) {
  var element = options.element;
  var value = options.value;
  var modesEnabled = options.modes;

  var goToPast = false;

  var rect = element.getBoundingClientRect();

  var jqElement = $("#wa-date-picker-container");

  if (!jqElement.length) {
    $("body").append('<div id="wa-date-picker-container"></div>');
    jqElement = $("#wa-date-picker-container");
  }

  if (options.locale) {
    moment.locale(options.locale);
  }

  var defaultModes = {
    "single": {
      closeAfterSelect: true
    },
    "interval": {
      closeAfterSelect: true
    },
    "month": {
      closeAfterSelect: true
    },
    "timeToStay": {
      closeAfterSelect: true
    },
    "anytime": {
      closeAfterSelect: true
    },
    "noReturn": {
      closeAfterSelect: true
    }
  };

  var modes = {};
  for (mode in modesEnabled) {
    if (modesEnabled[mode]) {
      if (typeof modesEnabled[mode] == 'object') {
        modes[mode] = modesEnabled[mode]
      } else {
        modes[mode] = defaultModes[mode]
      }
    }
  }

  var position = {
    top: rect.bottom + window.pageYOffset,
    left: rect.left
  };

  var htmlElement = jqElement.get()[0];

  var pageWidth = $(window).width();

  var RootDatePicker = React.createClass({


    hide: function () {
      this.setState({
        shown: false
      });
    },
    clickOutside: function (e) {
      if (this.refs.datePicker) {
        if ($(this.refs.datePicker.getDOMNode()).has(e.target).length) return;
      }
      if ($(element).is(e.target)) return;
      if ($(element).has(e.target).length) return;
      this.hide();
    },
    componentDidMount: function() {
      document.addEventListener("click", this.clickOutside, false);
    },
    componentWillUnmount: function() {
      document.removeEventListener("click", this.clickOutside, false);
    },

    getInitialState: function() {
      if (!value) {
        value = new SearchDate();
      }
      return {
        value: value,
        shown: true
      };
    },
    onChange: function(newValue) {
      onChange(newValue);
      return this.setState({
        value: newValue
      });
    },
    render: function() {
      if (!this.state.shown) {
        return (
          <div></div>
        );
      }
      var styles = {
        top: position.top
      };
      return (
        <div  className="wa-date-picker-modal" style={styles} >
          <DatePicker
            ref="datePicker"
            weekOffset={1}
            value={this.state.value}
            minValue={options.minValue}
            onChange={this.onChange}
            leftOffset={position.left}
            maxWidth={pageWidth}
            modesEnabled={modes}
            hide={this.hide}
          ></DatePicker>
        </div>
      );
    }
  });

  React.renderComponent(RootDatePicker(), htmlElement);
};



