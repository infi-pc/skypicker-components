/** @jsx React.DOM */

var DatePickerModalComponent = require("./DatePickerModalComponent.jsx");
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
 * ------- TODO @param{bool} options.hideOnElementClick - (default: false)
 * @param{function(SearchDate)} options.onChange - callback on every change
 */

/* responsibility: make simple plain js api */
class DatePickerModal {
  constructor(options) {
    this.options = options;

    if (this.options.defaultValue) {
      this.value = this.options.defaultValue;
    }
    //if (!this.value) {
    //  this.value = new SearchDate();
    //}
    if (options.locale) {
      moment.locale(options.locale);
    }
    this._loadModes();
    this._createComponent();
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
    //this.htmlElement = document.createElement('div');
    //$("body").append(this.htmlElement);

    //TODO make it in plain javascript way and without id
    this.jqElement = $("<div class=\"datepicker-modal-container-element\"></div>");
    $("body").append(this.jqElement);
    this.htmlElement = this.jqElement.get()[0];

    var root = React.createFactory(DatePickerModalComponent);

    this.component = React.render(root(), this.htmlElement);
    this.component.setProps({
      inputElement: this.options.element,
      value: this.value,
      minValue: this.options.minValue,
      onChange: this.options.onChange,
      modes: this.options.modes
    });

  }
  show() {
    this.component.setState({
      shown: true
    });
  }
  hide() {
    this.component.setState({
      shown: false
    });
  }
  setValue(newValue) {
    //this.value = newValue;
    //if (!this.value) {
    //  this.value = new SearchDate();
    //}
    this.component.setProps({
      value: newValue
    });
  }
}

module.exports = DatePickerModal;

