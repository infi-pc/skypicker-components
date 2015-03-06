window.GroupedResults = require('./../../modules/modules/GroupedResults/GroupedResults.jsx');
window.SearchForm = require('./../../modules/modules/SearchForm/SearchForm.jsx');

window.translationStrategy = require('./../../modules/translationStrategies/spTr.js');
window.tr = require('./../../modules/tr.js');

var APIManager = require("./../../modules/APIManager.jsx");

tr.setStrategy(translationStrategy);

(function() {
  var SearchForm = require('./../../modules/modules/SearchForm/SearchForm.jsx');
  var element = document.getElementById("search-form");

  var root = React.createFactory(SearchForm);
  var component = React.render(root(), element);
  component.setProps();
})();


(function() {
  var SearchForm = require('./../../modules/modules/SearchForm/SearchForm.jsx');
  var element = document.getElementById("results");

  var root = React.createFactory(GroupedResults);
  var component = React.render(root(), element);
  component.setProps();
})();


