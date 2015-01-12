window.translationStrategy = require('./../../modules/translationStrategies/waTr.js');
window.tr = require('./../../modules/tr.js');
tr.setStrategy(translationStrategy);

var React = require("react");

var SearchForm = require('./../../modules/SearchForm/SearchForm.jsx');


var element = document.getElementById("search-form");

var root = React.createFactory(SearchForm);
var modalComponent = React.render(root(), element);

modalComponent.setProps({
  onChange: function (value) {
    modalComponent.setProps({
      data: value
    });
  }
});

//this.modalComponent.setProps({
//  options: options,
//});
