var TripInfo = require("./TripInfo.jsx");
var Immutable = require("immutable");
var Map = Immutable.Map;

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
  //selectInboundFunc: function (pair) {
  //  return () => {
  //    console.log(pair);
  //    this.setState({
  //      selectedInbound: pair
  //    })
  //  }
  //},

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
    if (!newProps.journeys) {
      debugger;
      console.error("WTF?");
    }
    if (newProps.journeys != this.props.journeys) {
      var merged = this.mergeTrips(newProps.journeys);
      this.setState({
        merged: merged,
        selected: this.firstSelected(this.state.selected, merged)
      });
    }
  },

  render: function () {
    var price = this.props.price;
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
                  return <TripInfo selected={selected} key={"out-"+id} onSelect={this.selectFunc(pair,"outbound")} trip={pair.master}></TripInfo>
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
                  return <TripInfo selected={selected} key={"in-"+id} onSelect={this.selectFunc(pair,"inbound")} trip={pair.master}></TripInfo>
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          {this.state.selected.get("outbound")} {this.state.selected.get("inbound")}
        </div>
      </div>
    )
  }
});
