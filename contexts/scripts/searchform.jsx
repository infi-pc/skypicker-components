window.translationStrategy = require('./../../modules/tools/spTr.js');
window.tr = require('./../../modules/tools/tr.js');
tr.setStrategy(translationStrategy);

var React = require("react");

var SearchForm = require('./../../modules/modules/SearchForm/SearchForm.jsx');


var element = document.getElementById("search-form");

var root = React.createFactory(SearchForm);
var modalComponent = React.render(root(), element);

modalComponent.setProps();

//this.modalComponent.setProps({
//  options: options,
//});
