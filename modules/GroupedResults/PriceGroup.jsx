var TripInfo = require("./TripInfo.jsx");
var Immutable = require("immutable");
var MasterSlavePair = require("./../containers/flights/MasterSlavesPair.jsx");
var Map = Immutable.Map;
var Price = require("./../components/Price.jsx");
var Translate = require("./../Translate.jsx");

var LinkButton = React.createClass({
  render: function () {
    var sharedJourney = this.props.sharedJourney;
    var baseUrl = "https://en.skypicker.com/booking"; //TODO change it
    if (sharedJourney) {
      var url = baseUrl + "?flightsId=" + sharedJourney.get("id") + "&price=" + sharedJourney.getPrice();
      return (
        <a href={url} className="btn"><Translate tKey="result.book_flight_for">Book flight for</Translate> <Price>{sharedJourney.getPrice()}</Price></a>
      );
    } else {
      var id = this.props.selected.get("outbound").master.getId() + "|" +  this.props.selected.get("inbound").master.getId()
      var url = baseUrl + "?flightsId=" + id;
      return (
        <a href={url} className="btn">Check price and book flight</a>
      );
    }
  }
});

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
    selected = this.firstFromPairSelected(selected,merged,"outbound");
    return {
      merged: merged,
      selected: selected
    }
  },

  selectFunc: function (pair, direction) {
    return () => {
      var selected = this.state.selected.set(direction, pair);
      if (!this.isInCounterpart(pair, selected.get(oppositeDirection(direction)))) {
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
    return (
      selected
        .set("outbound",merged.outbounds[0])
        .set("inbound",merged.inbounds[0])
    );
  },

  mergeTrips: function () {
    return {
      outbounds: this.mergeTripsToPairs(this.props.priceGroup.journeys, "outbound"),
      inbounds: this.mergeTripsToPairs(this.props.priceGroup.journeys, "inbound")
    }
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
    if (newProps.journeys != this.props.priceGroup.journeys) {
      var merged = this.mergeTrips(newProps.journeys);
      this.setState({
        merged: merged,
        selected: this.firstSelected(this.state.selected, merged)
      });
    }
  },

  findSharedJourney(outbound, inbound) {
    if (outbound.oneWay) {
      return outbound.journey;
    }
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

  isInCounterpart(thisPair,oppositePair) {
    var thisId = thisPair.get("master").getId();
    var isThere = false;
    oppositePair.slaves.forEach((slave) => {
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
                trip={pair.get("master")}>
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
                trip={pair.get("master")}>
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
  renderOutbounds: function () {
    return (
      <div className="outbound-legs">
        <div className="legs-header">
          <Translate tKey="result.departure"></Translate>
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
      <div className="price-group">
        <div className="price-group--header"><Price>{price}</Price></div>
        {this.renderOutbounds()}
        {isReturn?this.renderInbounds():""}
        <div className="price-group--footer">
          <LinkButton sharedJourney={sharedJourney} groupPrice={price} selected={this.state.selected}></LinkButton>
        </div>
      </div>
    )
  }
});
