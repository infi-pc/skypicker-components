/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");
var PlacePicker = require("./components/PlacePicker.jsx");
var SearchPlace = require("./../containers/SearchPlace.js");
var deepmerge = require('deepmerge');

var defaultOptions = {
  initialValue: new SearchPlace(),
  onHide: function() {},
  locale: "en",
  sizes: {
    all: {width: 454, height: 200},
    nearby: {width: 454, height: 200},
    cheapest: {width: 454, height: 200},
    citiesAndAirports: {width: 454, height: 200},
    countries: {width: 454, height: 200},
    anywhere: {width: 454, height: 200},
    radius: {width: 454, height: 200}
  },
  modes: {
    "all": {},
    "nearby": {},
    "cheapest": {},
    "citiesAndAirports": {},
    "countries": {},
    "anywhere": {},
    "radius": {}
  }
};

var PlacePickerModal = React.createClass({
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
  onValueChange: function () {
    if (this.props.options.modes[value.mode] && this.props.options.modes[value.mode].closeAfter == changeType) {
      this.hide();
    }
    this.props.options.onChange(value, changeType);
  },
  onSizeChange: function (sizes) {
    this.setState({
      contentSize: sizes
    });
  },
  //TODO move
  //setValue: function(newValue) {
  //  this.value = newValue;
  //  if (this.value) {
  //    this.component.setSearchText(this.value.getText());
  //  }
  //},
  render: function() {
    var options = deepmerge(defaultOptions,this.props.options);
    return (
      <ModalPicker shown={this.props.shown} contentSize={this.state.contentSize} inputElement={options.element} onHide={options.onHide}>
        <PlacePicker value={this.props.value} ref="placePicker" onChange={this.onValueChange} sizes={options.sizes} modes={options.modes} onSizeChange={this.onSizeChange} >
        </PlacePicker>
      </ModalPicker>
    )
  }

});


module.exports = PlacePickerModal;

