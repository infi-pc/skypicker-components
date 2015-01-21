var translationStrategy = require('./../modules/translationStrategies/spTr.js');
var tr = require('./../modules/tr.js');
tr.setStrategy(translationStrategy);
var React = require("react");

window.Wgts = {}; //That's namespace if there will be some name collision

window.Place = Wgts.Place = require('./../modules/containers/Place.jsx');
window.Radius = Wgts.Radius = require('./../modules/containers/Radius.jsx');
window.SearchDate = Wgts.SearchDate = require('./../modules/containers/SearchDate.jsx');
window.SearchPlace = Wgts.SearchPlace = require('./../modules/containers/SearchPlace.jsx');
window.SearchFormData = Wgts.SearchFormData = require('./../modules/containers/SearchFormData.jsx');
window.SearchFormStore = Wgts.SearchFormStore = require('./../modules/stores/SearchFormStore.jsx');
window.SearchForm = Wgts.SearchForm = require('./../modules/plainJsAdapters/SearchFormAdapter.jsx');

