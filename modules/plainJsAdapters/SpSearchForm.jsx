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
  setValue(newValue) {
    this.modalComponent.setProps({
      value: newValue
    });
  }
}

module.exports = SpSearchForm;
