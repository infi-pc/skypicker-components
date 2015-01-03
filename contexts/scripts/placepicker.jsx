window.translationStrategy = require('./../../modules/translationStrategies/waTr.js');
window.tr = require('./../../modules/tr.js');
window.PlacePickerModal = require('./../../modules/PlacePicker/PlacePickerModal.jsx');
window.SearchPlace = require('./../../modules/containers/SearchPlace.js');

window.PlacesAPI = require('./../../modules/APIs/PlacesAPI.jsx');

console.log("start");

tr.setStrategy(translationStrategy);

var element = document.getElementById("place-picker");

var placePicker = new PlacePickerModal({
  element: element,
  onChange: function(newDate) {
    placePicker.setValue(newDate)
  }
});
$(element).focus(function() {
  placePicker.show();
});
$(element).on('input', function() {
  placePicker.setValue(new SearchPlace($(element).val()));
});
