/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");
var PlacePicker = require("./components/PlacePicker.jsx");
var SearchPlace = require("./../containers/SearchPlace.js");
var deepmerge = require('deepmerge');

var defaultOptions = {
  initialValue: new SearchPlace(),
  onHide: function() {},
  appendToElement: document.body,
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

class PlacePickerModal {
  constructor(options) {
    this.options = deepmerge(defaultOptions,options);
    this.value = this.options.initialValue;

    this._createComponent();
  }
  _onChange(value, changeType) {
    if (this.options.modes[value.mode] && this.options.modes[value.mode].closeAfter == changeType) {
      this.hide();
    }
    this.options.onChange(value, changeType);
  }
  _createComponent() {
    var self = this;

    var div = document.createElement('div');
    div.setAttribute('class', 'datepicker-modal-container-element');
    this.options.appendToElement.appendChild(div);
    this.htmlElement = div;

    var root = React.createFactory(ModalPicker);

    this.component = React.render(root(), this.htmlElement);
    this.component.setProps({
      inputElement: this.options.element,
      onHide: this.options.onHide,

      getContent: function(onSizeChange) {
        return React.createElement(PlacePicker, {
          ref: "datePicker",
          onChange: self._onChange.bind(self),
          sizes: self.options.sizes,
          modes: self.options.modes,
          onSizeChange: onSizeChange,
          value: self.value
        })
      }
    });

  }
  show() {
    this.component.setState({
      shown: true
    });
  }
  hide() {
    this.component.hide();
  }
  setValue(newValue) {
    this.value = newValue;
    this.component.setProps({
      value: this.value
    });
  }
}

module.exports = PlacePickerModal;

