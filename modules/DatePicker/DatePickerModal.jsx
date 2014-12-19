/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');
var DatePicker = require('./DatePicker.jsx');
var moment = require('moment');

/**
 * show modal datepicker (only one important function for DatePicker)
 * it hides itself and take care that it is only one on page
 * @param{Object} options
 * @param{HTMLElement} options.element - plain html element to bind, it takes boundaries of that object
 * @param{SearchDate} options.value - value
 * @param{Object} options.modesEnabled - example and default value is below
 * @param{string} options.locale - (cs,en,...)
 * ------- TODO @param{bool} options.hideOnElementClick - (default: false)
 * @param{function(SearchDate)} options.onChange - callback on every change
 */

/* responsibility: make simple plain js api */
class DatePickerModal {
  constructor(options) {
    this.options = options;

    if (!options.defaultValue) {
      options.defaultValue = new SearchDate();
    }
    if (!options.onHide) {
      options.onHide = function() {};
    }
    if (!options.appendToElement) {
      options.appendToElement = document.body;
    }
    this.value = options.defaultValue;

    if (options.locale) {
      moment.locale(options.locale);
    }
    this._loadModes();
    this._mergeSizes();
    this._createComponent();
  }

  _mergeSizes() {
    /* default sizes */
    var sizes = {
      single: {width: 454, height: 200},
      interval: {width: 907, height: 200, widthCompact: 454},
      month: {width: 550, height: 200},
      timeToStay: {width: 550, height: 200},
      anytime: {width: 550, height: 200},
      noReturn: {width: 550, height: 200}
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
        return React.createElement(DatePicker, {
          ref: "datePicker",
          weekOffset: 1,
          value: self.value,
          minValue: self.options.minValue,
          onChange: self.options.onChange,
          //leftOffset: position.left,
          //maxWidth: pageWidth,
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
    if (!this.value) {
      this.value = new SearchDate();
    }
    this.component.setProps({
      value: this.value
    });
  }
}

module.exports = DatePickerModal;

