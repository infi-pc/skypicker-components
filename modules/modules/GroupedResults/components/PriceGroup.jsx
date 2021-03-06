var TripInfo = require("./TripInfo.jsx");
var Immutable = require("immutable");
var MasterSlavePair = require("./../../../containers/flights/MasterSlavesPair.jsx");
var Map = Immutable.Map;
var Price = require("./../../../components/Price.jsx");
var Translate = require("./../../../components/Translate.jsx");

var LinkButton = require("./LinkButton.jsx");

/*
 Master - Slave logic
 Because i wanted to somehow connect multiple journeys into common groups with same price i made this logic
 I make pairs for with directions outbound and inbound. I make pairs where outbound is master and inbound is slave and also opposite pairs.
 Slaves are all trips which ale possible to connect with master trip.
 In each slave is reference to Journey which is common with master.
 If there is not common Journey to both selected trips, it is not possible get price. To prevent this, there is two options:
 1) Split to more groups (this should be now implemented)
 2) Do not show price and let user to check it in booking
 3) Disable bad combinations



  pair = MasterSlavePair
  selected = Map({
    outbound: MasterSlavePair
    inbound: MasterSlavePair
  })
  merged = {
    inbounds: [MasterSlavePair,...]
    outbounds: [MasterSlavePair,...]
  }
 */

var oppositeDirection = (direction) => direction == "outbound" ? "inbound" : "outbound";


module.exports = React.createClass({
  displayName: "PriceGroup",

  getInitialState: function () {
    var merged = this.mergeTrips(this.props.priceGroup.journeys);
    var selected = this.firstSelected(Map(), merged);
    if (!selected.get("outbound").get("oneWay") && !this.isInCounterpart(selected.get("inbound"), selected.get("outbound"))) {
      selected = this.firstFromPairSelected(selected,merged,"outbound");
    }

    return {
      merged: merged,
      selected: selected
    }
  },

  selectFunc: function (pair, direction) {
    return () => {
      var selected = this.state.selected.set(direction, pair);
      if (!pair.get("oneWay") && !this.isInCounterpart(pair, selected.get(oppositeDirection(direction)))) {
        selected = this.firstFromPairSelected(selected, this.state.merged, direction);
      }
      this.setState({
        selected: selected
      })
    }
  },

  firstFromPairSelected(selected, merged, changedDirection) {
    var changingDirection = changedDirection == "outbound" ? "inbound" : "outbound";
    var pair = selected.get(changedDirection);
    if (pair.get("oneWay")) {
      return selected;
    } else {
      var newSelected = selected;
      merged[changingDirection+"s"].forEach((checkingPair) => {
        if (checkingPair.master.getId() ==  pair.slaves.first().get("trip").getId()) {
          newSelected = newSelected.set(changingDirection,checkingPair);
        }
      });
      return newSelected
    }
  },

  firstSelected: function (selected, merged) {
    var preselected = this.props.preselected;
    if (preselected) {
      merged.outbounds.forEach((pair) => {
        if (pair.hasJourney(preselected)) {
          selected = selected.set("outbound", pair);
        }
      });
      merged.inbounds.forEach((pair) => {
        if (pair.hasJourney(preselected)) {
          selected = selected.set("inbound", pair);
        }
      });
      return selected
    } else {
      return selected
        .set("outbound",merged.outbounds[0])
        .set("inbound",merged.inbounds[0])
    }
  },

  mergeTrips: function () {
    return {
      outbounds: this.sortPairsByDate(this.mergeTripsToPairs(this.props.priceGroup.journeys, "outbound")),
      inbounds: this.sortPairsByDate(this.mergeTripsToPairs(this.props.priceGroup.journeys, "inbound"))
    }
  },

  sortPairsByDate: function (pairs) {
    return pairs.sort((a, b) => {
      if (a.master.getDeparture().get("when").get("local") > b.master.getDeparture().get("when").get("local")) {
        return 1;
      } else {
        return -1;
      }
    })
  },

  mergeTripsToPairs: function (journeys, masterDirection) {
    var slaveDirection = masterDirection == "outbound" ? "inbound" : "outbound";
    var pairs = {};
    journeys.forEach((journey) => {
      if (journey.isReturn()) {
        //Returns
        var id = journey.get("trips").get(masterDirection).getId();
        if (!pairs[id]) {
          pairs[id] = new MasterSlavePair({
            master: journey.get("trips").get(masterDirection),
            oneWay: false
          });
        }
        pairs[id] = pairs[id].updateIn(["slaves"], (slaves) => {
          return slaves.push(Map({
            trip: journey.trips.get(slaveDirection),
            journey: journey
          }))
        });
      } else {
        //One ways
        if (journey.get("trips").get(masterDirection)) {
          var id = journey.get("trips").get(masterDirection).getId();
          pairs[id] = new MasterSlavePair({
            master: journey.get("trips").get(masterDirection),
            journey: journey ,
            oneWay: true
          });
        }
      }

    });
    return Object.keys(pairs).map((key) => pairs[key]);
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.priceGroup != this.props.priceGroup) {
      var merged = this.mergeTrips(newProps.priceGroup.journeys);
      this.setState({
        merged: merged,
        selected: this.firstSelected(this.state.selected, merged)
      });
    }
  },

  findSharedJourney(outbound, inbound) {
    if (outbound.get("oneWay")) {
      return outbound.get("journey");
    }
    var sharedJourney = null;
    outbound.get("slaves").forEach((outboundsSlaveInbound) => {
      inbound.get("slaves").forEach((inboundsSlaveOutbound) => {
        if (outboundsSlaveInbound.get("journey") == inboundsSlaveOutbound.get("journey")) {
          sharedJourney = outboundsSlaveInbound.get("journey");
        }
      })
    });
    return sharedJourney;
  },

  isInCounterpart(thisPair,oppositePair) {
    var thisId = thisPair.get("master").getId();
    var isThere = false;
    oppositePair.get("slaves").forEach((slave) => {
      if (thisId == slave.get("trip").getId()) {
        isThere = true;
      }
    });
    return isThere;
  },

  //isInCounterpart(thisMaster,thisDirection) {
  //  var thisId = thisMaster.getId();
  //  var thatDirection = thisDirection == "outbound" ? "inbound" : "outbound";
  //  var isThere = false;
  //  this.state.selected.get(thatDirection).slaves.forEach((slave) => {
  //    if (thisId == slave.get("trip").getId()) {
  //      isThere = true;
  //    }
  //  });
  //  return isThere;
  //},
  renderLeg: function (direction) {

    return (
      <div className="legs-content">
        {this.state.merged[direction+"s"].map((pair) => {
          var id = pair.get("master").getId();
          var selected = false;
          if (this.state.selected.get(direction)) {
            selected = id == this.state.selected.get(direction).master.getId();
          }
          if (pair.get("oneWay")) {
            return (
              <TripInfo
                selected={selected}
                key={"oneway-"+id}
                onSelect={this.selectFunc(pair,direction)}
                trip={pair.get("master")}
              >
              </TripInfo>
            )
          } else {
            var oppositePair = this.state.selected.get(oppositeDirection(direction));
            return (
              <TripInfo
                selected={selected}
                hidden={!this.isInCounterpart(pair, oppositePair)}
                key={direction+"-"+id}
                onSelect={this.selectFunc(pair,direction)}
                trip={pair.get("master")}
              >
              </TripInfo>
            )
          }
        })}
      </div>
    )
  },
  renderInbounds: function () {
    return (
      <div className="inbound-legs">
        <div className="legs-header">
          <Translate tKey="result.return"></Translate>
        </div>
        <div className="legs-body">
          {this.renderLeg("inbound")}
        </div>
      </div>
    )
  },
  renderOutbounds: function (isReturn) {
    var headerText = "";
    if (isReturn) {
      headerText = <Translate tKey="result.departure"></Translate>
    }
    return (
      <div className="outbound-legs">
        <div className="legs-header">
          {headerText}
        </div>
        <div className="legs-body">
          {this.renderLeg("outbound")}
        </div>
      </div>
    )
  },
  render: function () {
    var price = this.props.priceGroup.price;
    var isReturn = this.props.priceGroup.isReturn;
    var sharedJourney = this.findSharedJourney(this.state.selected.get("outbound"), this.state.selected.get("inbound"));
    return (
      <div className={"price-group" + (this.props.preselected?" preselected":"")}>
        <div className="price-group--header"><Price>{price}</Price></div>
        {this.renderOutbounds(isReturn)}
        {isReturn?this.renderInbounds():""}
        <div className="price-group--footer">
          <LinkButton
            sharedJourney={sharedJourney}
            groupPrice={price}
            selected={this.state.selected}
            affilId={this.props.affilId}
          >
          </LinkButton>
        </div>
      </div>
    )
  }
});
