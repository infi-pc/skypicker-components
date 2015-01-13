/* NOT USED */

var DateTools = require("../../modules/containers/SearchPlace.jsx");
var moment = require("moment");

describe("searchPlace", function() {
  describe("construct from plain", function() {
    it("czech", function () {

      var modes = [
        "text",
        "radius",
        "anywhere"
      ];



      function generatePlain() {

      }
      moment.locale("cs");

      expect(DateTools.firstDayOfWeek()).toBe(1);
    });
  });
});
