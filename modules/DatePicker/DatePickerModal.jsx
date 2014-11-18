/** @jsx React.DOM */

var DatePicker = require("./DatePicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');

/**
 * show modal datepicker
 * it hides itself and take care that it is only one on page
 * @param{string} element - plain html element to bind, it takes boundaries of that object
 * @param{SearchDate} value
 * @param{SearchDate} modesEnabled (example and default value is below)
 * @param{function(SearchDate)} onChange
 */

exports.show = function (options, onChange) {
  var element = options.element;
  var value = options.value;
  var modesEnabled = options.modes;

  var rect = element.getBoundingClientRect();

  var jqElement = $("#wa-date-picker-container");

  if (!jqElement.length) {
    $("body").append('<div id="wa-date-picker-container"></div>');
    jqElement = $("#wa-date-picker-container");
  }


  if (!modesEnabled) {
    modesEnabled = {
      "single": true,
      "interval": false,
      "month": true,
      "timeToStay": false,
      "anytime": true,
      "noReturn": true
    };
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
            modesEnabled={modesEnabled}
            hide={this.hide}
          ></DatePicker>
        </div>
      );
    }
  });

  React.renderComponent(RootDatePicker(), htmlElement);
};



