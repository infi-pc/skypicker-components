
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
    this.mode = plain.mode || "text";
    this.value = plain.value || "";
    this.isDefault = plain.isDefault || isDefault;
    validateModes(this);

    Object.freeze(this);
  }

  getMode() {
    return this.mode;
  }

  getValue() {
    return this.value;
  }

  /* shown text */
  getText() {
    var mode = this.mode;
    if (mode == "text") {
      return this.getValue();
    } else if (mode == "anywhere") {
      return "Anywhere";
    } else if (mode == "place") {
      return this.value.getName();
    }
  }

  /* name of place */
  getName() {
    var mode = this.mode;
    if (mode == "text") {
      return null;
    } else if (mode == "anywhere") {
      return "anywhere";
    } else if (mode == "place") {
      return this.value.getName();
    }
  }


  getId() {
    var mode = this.mode;
    if (mode == "text") {
      return null;
    } else if (mode == "anywhere") {
      return "anywhere";
    } else if (mode == "place") {
      return this.value.getId();
    }
  }

  getPlace() {
    if (this.getMode() == "place") {
      return this.value;
    } else {
      return null;
    }
  }

}


module.exports = SearchPlace;
