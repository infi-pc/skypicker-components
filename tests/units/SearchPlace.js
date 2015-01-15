/* NOT USED */

var SearchPlace = require("../../modules/containers/SearchPlace.jsx");
var Place = require("../../modules/containers/Place.jsx");
var moment = require("moment");

describe("searchPlace", function() {
  describe("to appState", function() {
    it("anywhere", function () {
      var searchPlace = SearchPlace.fromAppState({
        id: "anywhere"
      });
      expect(searchPlace.mode).toBe("anywhere");
      expect(searchPlace.getText()).toBe("Anywhere");
    });
    it("country", function () {
      var searchPlace = SearchPlace.fromAppState({
        id: "CZ",
        name: "Czech Republic",
        type: "country"
      });
      expect(searchPlace.mode).toBe("place");
      expect(searchPlace.getText()).toBe("Czech Republic");
      expect(searchPlace.getValue().getId()).toBe("CZ");
      expect(searchPlace.getValue().getType()).toBe("country");
    });
  });
  describe("from appState", function() {
    it("anywhere", function () {

      var searchPlace = new SearchPlace({mode: "anywhere"});
      var appState = searchPlace.toAppState();

      expect(appState.id).toBe("anywhere");
      expect(appState.name).toBe("Anywhere");
    });
    it("country", function () {

      var searchPlace = new SearchPlace({mode: "place", value: new Place({id: "CZ", value: "Czech Republic", type: Place.TYPE_COUNTRY}) });
      var appState = searchPlace.toAppState();

      expect(appState.id).toBe("CZ");
      expect(appState.name).toBe("Czech Republic");
      expect(appState.type).toBe("country");
    });
  });








});
