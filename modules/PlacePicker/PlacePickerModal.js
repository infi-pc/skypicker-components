/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");
var PlacePicker = require("./components/PlacePicker.jsx");

/**
 */

/* responsibility: make simple plain js api */
class PlacePickerModal {
  constructor(options) {
    this.options = options;
    if (!options.appendToElement) {
      options.appendToElement = document.body;
    }
    this._mergeSizes();
    this._loadModes();
    this._createComponent();
  }
  _mergeSizes() {
    /* default sizes */
    var sizes = {
      all: {width: 454, height: 200},
      nearby: {width: 454, height: 200},
      cheapest: {width: 454, height: 200},
      citiesAndAirports: {width: 454, height: 200},
      countries: {width: 454, height: 200},
      anywhere: {width: 454, height: 200},
      radius: {width: 454, height: 200}
    };
    if (!this.options.sizes) {
      this.options.sizes = {};
    }
    for (var mode in sizes) {
      if (!this.options.sizes[mode]) {
        this.options.sizes[mode] = sizes[mode];
      }
    }
  }
  _loadModes() {
    var defaultModes = {
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
    };
    var modes = {};
    for (var mode in this.options.modes) {
      if (this.options.modes[mode]) {
        if (typeof this.options.modes[mode] == 'object') {
          modes[mode] = this.options.modes[mode]
        } else {
          modes[mode] = defaultModes[mode]
        }
      }
    }
    this.options.modes = modes;
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
          onChange: self.options.onChange,
          sizes: self.options.sizes,
          modes: self.options.modes,
          onSizeChange: onSizeChange
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

