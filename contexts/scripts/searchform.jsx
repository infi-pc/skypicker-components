
var React = require("react");

var SearchForm = require('./../../modules/SearchForm/SearchForm.jsx');


var element = document.getElementById("search-form");

var root = React.createFactory(SearchForm);
this.modalComponent = React.render(root(), element);

//this.modalComponent.setProps({
//  options: options,
//});
