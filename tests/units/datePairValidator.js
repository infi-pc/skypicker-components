var SearchDate = require("../../modules/containers/SearchDate.js");
var validator = require("../../modules/DatePicker/DatePairValidator.js");


describe("validating", function() {
  describe("when outbound is single, inbound should cause", function() {
    var error, outbound, inbound;
    it("no error", function () {
      outbound = new SearchDate({mode: "single", from: moment().add(1, "days")});
      inbound = new SearchDate({mode: "single", from: moment().add(9, "days")});
      expect(validator.validate(outbound, inbound)).toBe(null);
    });
    it("error on crossed dates", function () {
      outbound = new SearchDate({mode: "single", from: moment().add(5, "days")});
      inbound = new SearchDate({mode: "single", from: moment().add(1, "days")});
      expect(validator.validate(outbound, inbound)).toBe("crossedDates");
    });
    it("ok when no return", function () {
      outbound = new SearchDate({mode: "single", from: moment().add(5, "days")});
      inbound = new SearchDate({mode: "noReturn"});
      expect(validator.validate(outbound, inbound)).toBe(null);
    });
    it("error because should be selected", function () {
      outbound = new SearchDate({mode: "single", from: moment().add(5, "days")});
      inbound = null;
      expect(validator.validate(outbound, inbound)).toBe("inboundNotSelected");
    });

  });
});
