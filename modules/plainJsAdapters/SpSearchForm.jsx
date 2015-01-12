var SearchForm = require('./../SearchForm/SearchForm.jsx');

class SpSearchForm {
  constructor(options) {
    var root = React.createFactory(SearchForm);
    this.modalComponent = React.render(root(), options.element);
  }
  onChange(func) {
    this.modalComponent.setProps({
      onChange: function (value) {
        func();
        this.setValue(value);
      }
    });
  }
  setData(newData) {
    this.modalComponent.setProps({
      data: newData
    });
  }
  //setValue(fieldType, newValue) {

  //}
}

module.exports = SpSearchForm;
