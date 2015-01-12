
var DatePickerModal = require('./../../modules/DatePicker/DatePickerModal.jsx');
var SearchDate = require('./../../modules/containers/SearchDate.jsx');
/**
 * show modal datepicker (only one important function for DatePicker)
 * it hides itself and take care that it is only one on page
 *
 * WARNING - doc can be not actual
 *
 * @param{Object} options
 * @param{HTMLElement} options.element - plain html element to bind, it takes boundaries of that object
 * @param{SearchDate} options.value - value
 * @param{Object} options.modesEnabled - example and default value is below
 * @param{string} options.locale - (cs,en,...)
 * ------- TODO @param{bool} options.hideOnElementClick - (default: false)
 * @param{function(SearchDate)} options.onChange - callback on every change
 */

/* responsibility: make simple plain js api */
class SpDatePicker {
  constructor(options) {
    var div = document.createElement('div');
    div.setAttribute('class', 'datepicker-modal-container-element');
    var appendToElement = options.appendToElement ? options.appendToElement : document.body;
    appendToElement.appendChild(div);
    this.htmlElement = div;
    options.onHide = () => {
      this.hide();
    };
    var root = React.createFactory(DatePickerModal);
    this.modalComponent = React.render(root(), this.htmlElement);
    this.modalComponent.setProps({
      options: options,
      value: new SearchDate(),
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

module.exports = SpDatePicker;
