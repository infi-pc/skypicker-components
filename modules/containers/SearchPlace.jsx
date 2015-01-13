
var deepmerge = require("deepmerge");
var Place = require('./Place.jsx');

var defaultValues = {
  mode: "text", /* modes: text, place, anywhere, radius, ... */
  value: "",
  isDefault: false /* this is set only when you want to use text as predefined value */
};

function makePlain(input) {
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
  return plain
}

function validateModes(data) {
  if (data.mode == "text") {
    if (typeof data.value != "string") {
      throw new Error("wrong type");
    }
  }
  if (data.mode == "place") {
    if ( !(data.value instanceof Place) ) {
      throw new Error("wrong type");
    }
  }
}


class SearchPlace {
  constructor(input, isDefault) {
    var plain = makePlain(input);
    this._data = deepmerge(defaultValues, plain);

    this._data.isDefault = isDefault || this._data.isDefault;
    validateModes(this._data);
  }

  getMode() {
    return this._data.mode;
  }

  getValue() {
    return this._data.value;
  }

  /* shown text */
  getText() {
    var mode = this.getMode();
    if (mode == "text") {
      return this.getValue();
    } else if (mode == "anywhere") {
      return "Anywhere";
    } else if (mode == "place") {
      return this.getValue().getName();
    }
  }

  /* name of place */
  getName() {
    var mode = this.getMode();
    if (mode == "text") {
      return null;
    } else if (mode == "anywhere") {
      return "anywhere";
    } else if (mode == "place") {
      return this.getValue().getName();
    }
  }


  getId() {
    var mode = this.getMode();
    if (mode == "text") {
      return null;
    } else if (mode == "anywhere") {
      return "anywhere";
    } else if (mode == "place") {
      return this.getValue().getId();
    }
  }

  getPlace() {
    if (this.getMode() == "place") {
      return this.getValue();
    } else {
      return null;
    }
  }

}


module.exports = SearchPlace;
