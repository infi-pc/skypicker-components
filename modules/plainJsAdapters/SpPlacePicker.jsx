
var PlacePickerModal = require('./../../modules/PlacePicker/PlacePickerModal.jsx');


class SpPlacePicker {
  constructor(options) {

    var div = document.createElement('div');
    div.setAttribute('class', 'datepicker-modal-container-element');
    var appendToElement = options.appendToElement ? options.appendToElement : document.body;
    appendToElement.appendChild(div);
    this.htmlElement = div;
    options.onHide = () => {
      this.hide();
    };
    var root = React.createFactory(PlacePickerModal);
    this.modalComponent = React.render(root(), this.htmlElement);
    this.modalComponent.setProps({
      options: options,
      inputElement: options.element
    });
  }
  show() {
    this.modalComponent.setProps({
      shown: true
    });
  }
  hide() {
    this.modalComponent.setProps({
      shown: false
    });
  }
  setValue(newValue) {
    this.modalComponent.setProps({
      value: newValue
    });
  }
}

module.exports = SpPlacePicker;
