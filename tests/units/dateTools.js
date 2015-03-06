var DateTools = require("../../modules/tools/DateTools.js");
var moment = require("moment");

describe("dateTools", function() {
  describe("first day of week", function() {
    it("czech", function () {
      moment.locale("cs");
      expect(DateTools.firstDayOfWeek()).toBe(1);
    });
    it("en", function () {
      moment.locale("en");
      expect(DateTools.firstDayOfWeek()).toBe(0);
    });
    it("en-GB", function () {
      moment.locale("en-GB");
      expect(DateTools.firstDayOfWeek()).toBe(1);
    });
    it("fa", function () {
      moment.locale("fa");
      expect(DateTools.firstDayOfWeek()).toBe(6);
    });


  });
});
