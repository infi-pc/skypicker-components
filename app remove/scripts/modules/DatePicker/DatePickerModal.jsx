/** @jsx React.DOM */

var DatePicker = require("./DatePicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');


/*
 element: element to binf
 defaultValue: instance of SearchDate
 direction: string ("outbound" | "inbound")
 onChange: function(SearchDate)
 */
exports.show = function (element, defaultValue, direction, onChange) {
  var rect = element[0].getBoundingClientRect();

  var jqElement = $("#wa-date-picker-container");

  if (!jqElement.length) {
    $("body").append('<div id="wa-date-picker-container"></div>');
    jqElement = $("#wa-date-picker-container");
    //$('html').click(function() {
    //  $("#wa-date-picker-container").html("");
    //});
    //jqElement.click(function(event){
    //  event.stopPropagation();
    //});
  }

  var modesEnabled = {};
  if (direction == "inbound") {
    modesEnabled = {
      "single": true,
      "interval": false,
      "month": true,
      "timeToStay": false,
      "anytime": true,
      "noReturn": true
    };
  } else if (direction == "outbound") {
    modesEnabled = {
      "single": true,
      "interval": false,
      "month": true,
      "timeToStay": false,
      "anytime": true,
      "noReturn": false
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
      if ($(element).has(e.target).length) return;
      this.hide();
    },
    //!! i am not sure about that all the binding, so be careful
    //clickInside: function (e) {
    //  //
    //  e.stopPropagation();
    //  e.nativeEvent.stopImmediatePropagation();
    //},
    componentDidMount: function() {
      document.addEventListener("click", this.clickOutside, false);
    },
    componentWillUnmount: function() {
      document.removeEventListener("click", this.clickOutside, false);
    },

    getInitialState: function() {
      if (!defaultValue) {
        defaultValue = new SearchDate();
      }
      return {
        value: defaultValue,
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
        return (<div></div>);
      }
      var styles = {
        top: position.top
      };
      return ( //onClick={this.clickInside}
        <div  className="wa-date-picker-modal" style={styles} >
          <DatePicker
            ref="datePicker"
            weekOffset={1}
            value={this.state.value}
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



