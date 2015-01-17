var SearchForm = require('./../SearchForm/SearchForm.jsx');

class SearchFormAdapter {
  constructor(options) {
    var root = React.createFactory(SearchForm);
    this.modalComponent = React.render(root(), options.element);
  }
}

module.exports = SearchFormAdapter;
