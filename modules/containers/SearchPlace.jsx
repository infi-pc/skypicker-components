
var deepmerge = require("deepmerge");
var Place = require('./Place.jsx');

var defaultValues = {
  mode: "text", /* modes: text, place, anywhere, radius, id,  ... */
  value: "",
  isDefault: false /* this is set only when you want to use text as predefined value */
};

function makePlain(input) {
  var plain = {};
  if (typeof input == 'undefined') {
    plain.mode = "text";
    plain.value = "";
  } else if (typeof input == 'string') {
    plain.mode = "text";
    plain.value = input;
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
      return this.value;
    } else if (mode == "anywhere") {
      return "Anywhere";
    } else if (mode == "place") {
      return this.value.getName();
    } else if (mode == "id") {
      return this.value;
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
    } else if (mode == "id") {
      return this.value;
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
    } else if (mode == "id") {
      return this.value;
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
