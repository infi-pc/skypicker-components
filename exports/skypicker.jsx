var translationStrategy = require('./../modules/translationStrategies/waTr.js');
var tr = require('./../modules/tr.js');
tr.setStrategy(translationStrategy);
var React = require("react");

window.Place = require('./../modules/containers/Place.jsx');
window.SearchDate = require('./../modules/containers/SearchDate.jsx');
window.SearchPlace = require('./../modules/containers/SearchPlace.jsx');
window.SearchFormStore = require('./../modules/containers/SearchFormData.jsx');
window.SearchForm = require('./../modules/plainJsAdapters/SearchFormAdapter.jsx');

