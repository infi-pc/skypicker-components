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
