var SearchForm = require('./../SearchForm/SearchForm.jsx');

class SpSearchForm {
  constructor(options) {
    var root = React.createFactory(SearchForm);
    this.modalComponent = React.render(root(), options.element);

    //Just to have it working by default
    this.modalComponent.setProps({
      onChange: (value) => {
        this.setData(value);
      }
    });
  }
  onChange(func) {
    this.modalComponent.setProps({
      onChange: (value) => {
        func(value);
        this.setData(value);
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
