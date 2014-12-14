class DatePairValidator {
  constructor() {

  }
  registerInbound(func) {
    this.getInbound = func;
  }
  registerOutbound(func) {
    this.getOutbound = func;
  }

  /*
  validates potential new value according to previous values
   */
  validate(direction, value) {
    var outbound, inbound;
    if (direction == "inbound") {
      inbound = value;
      outbound = this.getOutbound();
    } else if (direction == "outbound") {
      inbound = this.getInbound();
      outbound = value;
    } else {
      inbound = this.getInbound();
      outbound = this.getOutbound();
    }

    if (!outbound) {
      return ["outboundNotSelected"]
    }
    if (!inbound) {
      return ["inboundNotSelected"]
    }

    if (inbound.mode == "single" && outbound.mode == "single") {
      if (inbound.getDate().format("YYYYMMDD") < outbound.getDate().format("YYYYMMDD")) {
        return ["crossedDates"]
      }
    }

    /* TODO Validate also interval searching */
    return null;
  }
}

module.exports = DatePairValidator;
