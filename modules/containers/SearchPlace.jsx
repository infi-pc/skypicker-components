/* it has similar modes as PlacePicker, but they are not exactly same */
/* modes: text, place, anywhere, radius, ... */

SearchPlace = function (input, isDefault) {
  if (typeof input == 'undefined') {
    this.mode = "text";
    this.value = "";
  } else if (typeof input == 'string') {
    this.mode = "text";
    this.value = input;
  } else {
    this.mode = "place";
    this.value = input;
  }
  this.isDefault = isDefault; /* this is set only when you want to use text as predefined value */
};

SearchPlace.prototype.getText = function () {
  if (this.mode == "text") {
    return this.value;
  } else if (this.mode == "place") {
    return this.value.getName();
  }
};

SearchPlace.prototype.getPlace = function () {
  if (this.mode == "place") {
    return this.value;
  } else {
    return null;
  }
};

module.exports = SearchPlace;
