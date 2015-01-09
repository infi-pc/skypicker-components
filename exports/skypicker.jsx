translationStrategy = require('./../modules/translationStrategies/waTr.js');
tr = require('./../modules/tr.js');
tr.setStrategy(translationStrategy);
var React = require("react");

window.SearchDate = require('./../modules/containers/SearchDate.js');
window.SearchPlace = require('./../modules/containers/SearchPlace.js');
window.SearchForm = require('./../modules/SearchForm/SearchForm.jsx');

window.initSearchForm = function(element) {
  var root = React.createFactory(SearchForm);
  this.modalComponent = React.render(root(), element);

};
