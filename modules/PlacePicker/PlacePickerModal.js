/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");


/**
 */

/* responsibility: make simple plain js api */
class PlacePickerModal {
  constructor(options) {
    this.options = options;

    this._createComponent();
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

