var translationStrategy = require('./../modules/translationStrategies/waTr.js');
var tr = require('./../modules/tr.js');
tr.setStrategy(translationStrategy);
var React = require("react");

window.SearchDate = require('./../modules/containers/SearchDate.jsx');
window.SearchPlace = require('./../modules/containers/SearchPlace.jsx');
window.SearchFormData = require('./../modules/containers/SearchFormData.jsx');
window.SpSearchForm = require('./../modules/plainJsAdapters/SpSearchForm.jsx');

