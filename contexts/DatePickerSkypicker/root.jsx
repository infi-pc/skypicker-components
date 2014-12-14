var modulesDir = "./../../modules/";

translationStrategy = require('./../../modules/translationStrategies/spTr.js');

var tr = require('./../../modules/tr.js');
tr.setStrategy(translationStrategy);

window.DatePickerModal = require('./../../modules/DatePicker/DatePickerModal.jsx');
window.SearchDate = require('./../../modules/containers/SearchDate.js');
window.DatePairValidator = require('./../../modules/DatePicker/DatePairValidator.js');
