


var modulesDir = "./../../modules/";

translationStrategy = require('./../../modules/translationStrategies/waTr.js');

var tr = require('./../../modules/tr.js');
tr.setStrategy(translationStrategy);

window.DatePickerModal = require('./../../modules/DatePicker/DatePickerModal.jsx');
window.SearchDate = require('./../../modules/containers/SearchDate.js');

