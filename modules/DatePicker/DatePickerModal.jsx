/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');
var DatePicker = require('./components/DatePicker.jsx');
var moment = require('moment');
var deepmerge = require('deepmerge');


var defaultOptions = {
  initialValue: new SearchDate(),
  onHide: function() {},
  appendToElement: document.body,
  locale: "en",
  sizes: {
    single: {width: 454, height: 200},
    interval: {width: 907, height: 200, widthCompact: 454},
    month: {width: 550, height: 200},
    timeToStay: {width: 550, height: 200},
    anytime: {width: 550, height: 200},
    noReturn: {width: 550, height: 200}
  },
  modes: {
    "single": {
      closeAfter: "select", // select
      finishAfter: "select" // select
    },
    "interval": {
      closeAfter: "selectComplete", // select
      finishAfter: "selectComplete" // selectComplete | select
    },
    "month": {
      closeAfter: "select", // select
      finishAfter: "select" // select
    },
    "timeToStay": {
      closeAfter: "", //TODO on click "ok"
      finishAfter: "release" // release | select
    },
    "anytime": {
      closeAfter: "select", // select
      finishAfter: "select" // select
    },
    "noReturn": {
      closeAfter: "select", // select
      finishAfter: "select" // select
    }
  }
};

var DatePickerModal = React.createClass({
  getOptions: function() {
    return deepmerge(defaultOptions,this.props.options);
  },
  getDefaultProps: function () {
    return {
      options: {}
    }
  },
  getInitialState: function() {
    return {
      contentSize: {}
    };
  },
  onValueChange: function (value, changeType) {
    var options = this.getOptions();
    if (options.modes[value.mode] && options.modes[value.mode].closeAfter == changeType) {
      this.hide();
    }
    options.onChange(value, changeType);
  },
  onSizeChange: function (sizes) {
    this.setState({
      contentSize: sizes
    });
  },
  render: function() {
    var options = this.getOptions();
    return (
      <ModalPicker shown={this.props.shown} contentSize={this.state.contentSize} inputElement={options.element} onHide={options.onHide}>
        <DatePicker value={this.props.value} ref="placePicker" onChange={this.onValueChange} sizes={options.sizes} modes={options.modes} onSizeChange={this.onSizeChange} >
        </DatePicker>
      </ModalPicker>
    )
  }

});


module.exports = DatePickerModal;

