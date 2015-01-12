/* it has similar modes as PlacePicker, but they are not exactly same */
/* modes: text, place, anywhere, radius, ... */

SearchPlace = function (input, isDefault) {
  var plain = {};
  if (typeof input == 'undefined') {
    plain.mode = "text";
    plain.text = "";
  } else if (typeof input == 'string') {
    plain.mode = "text";
    plain.text = input;
  } else if (typeof input == "object") {
    plain = input;
  }
  this.mode = plain.mode || "text";
  this.text = plain.text || "";
  this.radius = +plain.radius || 250;
  this.lat = +plain.lat || 50;
  this.lng = +plain.lng || 16;
  this.place = plain.place || null;
  this.isDefault = isDefault; /* this is set only when you want to use text as predefined value */
};

SearchPlace.prototype.getText = function () {
  if (this.mode == "text") {
    return this.text;
  } else if (this.mode == "anywhere") {
    return "Anywhere";
  } else if (this.mode == "place") {
    return this.place.getName();
  }
};

SearchPlace.prototype.getId = function () {
  if (this.mode == "text") {
    return null;
  } else if (this.mode == "anywhere") {
    return "anywhere";
  } else if (this.mode == "place") {
    return this.place.getId();
  }
};

SearchPlace.prototype.getPlace = function () {
  if (this.mode == "place") {
    return this.place;
  } else {
    return null;
  }
};



module.exports = SearchPlace;
