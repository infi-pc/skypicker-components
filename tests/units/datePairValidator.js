var SearchDate = require("../../modules/containers/SearchDate.js");
var DatePairValidator = require("../../modules/DatePicker/DatePairValidator.js");


describe("validating", function() {
  var simpleModel = {
    outbound: null,
    inbound: null
  };
  var validator = new DatePairValidator();

  validator.registerInbound(function () {
    return simpleModel.inbound
  });
  validator.registerOutbound(function () {
    return simpleModel.outbound
  });
  describe("when outbound is single, inbound should cause", function() {
    var errors;
    simpleModel.outbound = new SearchDate({mode: "single", from: moment().add(2, "days")});
    simpleModel.inbound = null;
    it("no error", function () {
      errors = validator.validate("inbound", new SearchDate({mode: "single", from: moment().add(9, "days")}));
      expect(errors).toBe(null);
    });
    it("error on crossed dates", function () {
      errors = validator.validate("inbound", new SearchDate({mode: "single", from: moment().add(0, "days")}));
      expect(errors[0]).toBe("crossedDates");
    });
    it("ok when no return", function () {
      errors = validator.validate("inbound", new SearchDate({mode: "noReturn"}));
      expect(errors).toBe(null);
    });
    it("error because should be selected", function () {
      errors = validator.validate("inbound", null);
      expect(errors[0]).toBe("inboundNotSelected");
    });

  });
});
