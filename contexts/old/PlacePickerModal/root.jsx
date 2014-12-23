
translationStrategy = require('./../../modules/translationStrategies/waTr.js');

var tr = require('./../../modules/tr.js');
tr.setStrategy(translationStrategy);

window.PlacePickerModal = require('./../../modules/PlacePicker/PlacePickerModal.js');
