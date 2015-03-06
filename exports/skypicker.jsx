var translationStrategy = require('./../modules/translationStrategies/spTr.js');
var tr = require('./../modules/tr.js');
tr.setStrategy(translationStrategy);
var React = require("react");

//just include it to setup
var APIManager = require("./../modules/APIManager.jsx");


window.Wgts = {}; //That's namespace if there will be some name collision

window.Place = Wgts.Place = require('./../modules/containers/Place.jsx');
window.Radius = Wgts.Radius = require('./../modules/containers/Radius.jsx');
window.SearchDate = Wgts.SearchDate = require('./../modules/containers/SearchDate.jsx');
window.SearchPlace = Wgts.SearchPlace = require('./../modules/containers/SearchPlace.jsx');
window.SearchFormData = Wgts.SearchFormData = require('./../modules/containers/SearchFormData.jsx');
window.SearchFormStore = Wgts.SearchFormStore = require('./../modules/stores/SearchFormStore.jsx');
window.OptionsStore = Wgts.OptionsStore = require('./../modules/stores/OptionsStore.jsx');
window.Options = Wgts.Options = require('./../modules/containers/Options.jsx');
window.SearchFormAdapter = Wgts.SearchFormAdapter = require('./../modules/plainJsAdapters/SearchFormAdapter.jsx');
//MAP
window.MapOverlay = Wgts.MapOverlay = require('./../modules/modules/Map/MapOverlay.jsx');
window.MapLoader = Wgts.MapLoader = require('./../modules/modules/Map/components/MapLoader.jsx');
window.MapPlacesStore = Wgts.MapPlacesStore = require('./../modules/stores/MapPlacesStore.jsx');
//RESULTS
window.GroupedResults = Wgts.GroupedResults = require('./../modules/modules/GroupedResults/GroupedResults.jsx');
