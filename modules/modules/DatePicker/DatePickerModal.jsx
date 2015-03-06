/** @jsx React.DOM */

var ModalPicker = require("./../../components/ModalPicker.jsx");
var SearchDate = require('./../../containers/SearchDate.jsx');
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
    interval: {width: 924, height: 200, widthCompact: 454},
    month: {width: 550, height: 200},
    timeToStay: {width: 550, height: 200},
    anytime: {width: 169, height: 200},
    noReturn: {width: 169, height: 200}
  },
  modes: {
    "single": {
      closeAfter: "select", // select
      finishAfter: "select" // select
    },
    "interval": {},
    "month": {},
    "timeToStay": {},
    "anytime": {},
    "noReturn": {}
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
      contentSize: {width: 169, height: 200}
    };
  },
  onValueChange: function (value, changeType) {
    var options = this.getOptions();
    if (options.modes[value.mode] && options.modes[value.mode].closeAfter == changeType) {
      this.props.onHide();
    }
    this.props.onChange(value, changeType);
  },
  onSizeChange: function (sizes) {
    this.setState({
      contentSize: sizes
    });
  },
  render: function() {
    var options = this.getOptions();
    if (!this.props.shown) {return (<div></div>)}
    return (
      <ModalPicker contentSize={this.state.contentSize} inputElement={this.props.inputElement} onHide={this.props.onHide}>
        <DatePicker value={this.props.value} ref="placePicker" onChange={this.onValueChange} sizes={options.sizes} modes={options.modes} onSizeChange={this.onSizeChange} >
        </DatePicker>
      </ModalPicker>
    )
  }

});


module.exports = DatePickerModal;

