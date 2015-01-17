
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
    this.error = plain.error || "";
    this.loading = plain.loading || false;
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

  //static fromAppState(appStateSearch) {
  //  var searchPlace;
  //
  //  var placeTypeId = {};
  //  placeTypeId["airport"] = Place.TYPE_AIRPORT;
  //  placeTypeId["country"] = Place.TYPE_COUNTRY;
  //  placeTypeId["city"] = Place.TYPE_CITY;
  //
  //
  //  //id: "SK"
  //  //lastId: "SK"
  //  //lastType: "country"
  //  //lat: null
  //  //lng: null
  //  //name: "Slovakia"
  //  //radius: null
  //  //type: "country"
  //  if (appStateSearch.id && !appStateSearch.name) {
  //    if (appStateSearch.id == "anywhere") {
  //      searchPlace = new SearchPlace({mode: "anywhere", isDefault: true});
  //    } else {
  //      searchPlace = new SearchPlace({mode: "id", value: appStateSearch.id, isDefault: true});
  //    }
  //  } else if (appStateSearch.id && appStateSearch.name) {
  //    var place = new Place({
  //      id: appStateSearch.id,
  //      value: appStateSearch.name,
  //      type: placeTypeId[appStateSearch.type]
  //    });
  //    searchPlace = new SearchPlace({mode: "place", value: place});
  //  } else {
  //    //TODO radius and anywhere
  //  }
  //
  //
  //  /*dev*/
  //  //if (!window.appStateSearches) {
  //  //  window.appStateSearches = [];
  //  //}
  //  //var log = {"type": "fromAppState", "from": appStateSearch, "to": searchPlace};
  //  //window.appStateSearches.push(log);
  //  //console.debug(log);
  //  /*---*/
  //
  //  return searchPlace;
  //
  //  //Place ["zoomLevelThreshold", "numberOfAirports", "sp_score", "value", "rank", "parentId", "lat", "lng", "type", "id"]
  //}
  //
  //toAppState() {
  //  var searchPlace = this;
  //  var newState;
  //  if (searchPlace.mode == "place") {
  //    newState = {
  //      id: searchPlace.getId(),
  //      name: searchPlace.getName(),
  //      type: searchPlace.getPlace().getType()
  //    }
  //  } else if (searchPlace.mode == "anywhere") {
  //    newState = {
  //      id: "anywhere",
  //      name: "Anywhere",
  //      type: "anywhere" //TODO do i need it?
  //    }
  //  } else if (searchPlace.mode == "id") {
  //    newState = {
  //      id: searchPlace.getId(),
  //      name: searchPlace.getId(),
  //      type: "HUUUU id" //TODO ???
  //    }
  //  } else if (searchPlace.mode == "radius") {
  //
  //  } else if (searchPlace.mode == "text") {
  //    newState = {
  //      id: searchPlace.getValue(),
  //      name: searchPlace.getValue(),
  //      type: "HUUUU text" //TODO ???
  //    }
  //  } else {
  //    debugger; //TODO
  //  }
  //
  //  /*dev*/
  //  //if (!window.appStateSearches) {
  //  //  window.appStateSearches = [];
  //  //}
  //  //var log = {"type": "toAppState", "from": searchPlace, "to": newState};
  //  //window.appStateSearches.push(log);
  //  //console.log(log);
  //  /*---*/
  //
  //  return newState;
  //}
}


module.exports = SearchPlace;
