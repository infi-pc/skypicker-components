/* it has similar modes as PlacePicker, but they are not exactly same */
/* modes: text, place, anywhere, radius, ... */

SearchPlace = function (input) {
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
};

SearchPlace.prototype.getText = function () {
  if (this.mode == "text") {
    return this.value;
  } else if (this.mode == "place") {
    return this.value.getName();
  }

};

module.exports = SearchPlace;
