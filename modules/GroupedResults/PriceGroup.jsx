var TripInfo = require("./TripInfo.jsx");
var Immutable = require("immutable");
var Map = Immutable.Map;


var LinkButton = React.createClass({
  render: function () {
    var sharedJourney = this.props.sharedJourney;
    var baseUrl = "https://en.skypicker.com/booking"; //TODO change it
    if (sharedJourney) {
      var url = baseUrl + "?flightsId=" + sharedJourney.get("id") + "&price=" + sharedJourney.getPrice();
      return (
        <a href={url}>Book flight for {sharedJourney.getPrice()} {sharedJourney.get("id")}</a>
      );
    } else {
      var id = this.props.selected.get("outbound").master.getId() + "|" +  this.props.selected.get("inbound").master.getId()
      var url = baseUrl + "?flightsId=" + id  + "&price=" + this.props.groupPrice;
      console.log(url);
      return (
        <a href={url}>Check price and book flight</a>
      );
    }
  }
});



module.exports = React.createClass({
  displayName: "PriceGroup",

  getInitialState: function () {
    var merged = this.mergeTrips(this.props.journeys);
    return {
      merged: merged,
      selected: this.firstSelected(Map(), merged)
    }
  },

  selectFunc: function (pair, direction) {
    return () => {
      this.setState({
        selected: this.state.selected.set(direction,pair)
      })
    }
  },

  firstSelected: function (selected, merged) {
    return (
      selected
        .set("outbound",merged.outbounds[0])
        .set("inbound",merged.inbounds[0])
    );
  },

  mergeTrips: function (journeys) {
    return {
      outbounds: this.mergeTripsToMaster(this.props.journeys, "outbound"),
      inbounds: this.mergeTripsToMaster(this.props.journeys, "inbound")
    }
  },

  mergeTripsToMaster: function (journeys, masterDirection) {
    var slaveDirection = masterDirection == "outbound" ? "inbound" : "outbound";
    var master = {};
    journeys.forEach((journey) => {
      var id = journey.get("trips").get(masterDirection).getId()
      if (!master[id]) {
        master[id] = {master: journey.get("trips").get(masterDirection), slaves: []};
      }
      master[id].slaves.push({
        trip: journey.trips.get(slaveDirection),
        journey: journey
      });
    });
    return Object.keys(master).map((key) => master[key]);
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.journeys != this.props.journeys) {
      var merged = this.mergeTrips(newProps.journeys);
      this.setState({
        merged: merged,
        selected: this.firstSelected(this.state.selected, merged)
      });
    }
  },

  findSharedJourney(outbound, inbound) {
    var sharedJourney = null;
    outbound.slaves.forEach((outboundsSlaveInbound) => {
      inbound.slaves.forEach((inboundsSlaveOutbound) => {
        if (outboundsSlaveInbound.journey == inboundsSlaveOutbound.journey) {
          sharedJourney = outboundsSlaveInbound.journey;
        }
      })
    });
    return sharedJourney;
  },

  isInCounterpart(thisId,thisDirection) {
    var thatDirection = thisDirection == "outbound" ? "inbound" : "outbound";
    var isThere = false;
    this.state.selected.get(thatDirection).slaves.forEach((slave) => {
      if (thisId == slave.trip.getId()) {
        isThere = true;
      }
    });
    return isThere;
  },

  render: function () {
    var price = this.props.price;
    var sharedJourney = this.findSharedJourney(this.state.selected.get("outbound"), this.state.selected.get("inbound"));


    return (
      <div className="price-group">
        <div className="price-group--header">{price}</div>
        <div className="outbound-legs">
          <div className="legs-header">
            Outbound
          </div>
          <div className="legs-body">
            <table>
              <tbody>
                {this.state.merged.outbounds.map((pair) => {
                  var id = pair.master.getId();
                  var selected = false;
                  if (this.state.selected.get("outbound")) {
                    selected = id == this.state.selected.get("outbound").master.getId();
                  }
                  return <TripInfo selected={selected} hidden={!this.isInCounterpart(id, "outbound")} key={"out-"+id} onSelect={this.selectFunc(pair,"outbound")} trip={pair.master}></TripInfo>
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="inbound-legs">
          <div className="legs-header">
            Inbound
          </div>
          <div className="legs-body">
            <table>
              <tbody>
                {this.state.merged.inbounds.map((pair) => {
                  var id = pair.master.getId();
                  var selected = false;
                  if (this.state.selected.get("inbound")) {
                    selected = id == this.state.selected.get("inbound").master.getId();
                  }
                  return <TripInfo selected={selected} hidden={!this.isInCounterpart(id, "inbound")} key={"in-"+id} onSelect={this.selectFunc(pair,"inbound")} trip={pair.master}></TripInfo>
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <LinkButton sharedJourney={sharedJourney} groupPrice={price} selected={this.state.selected}></LinkButton>
        </div>
      </div>
    )
  }
});
