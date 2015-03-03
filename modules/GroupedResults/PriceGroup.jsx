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


 Pair format:
  master: Trip
  journey: Journey (if it is return, it is null)
  slaves: [
    {
      trip: Trip
      journey: Journey (common journey)
    }
    ...
  ]
  oneWay: boolean
 */




module.exports = React.createClass({
  displayName: "PriceGroup",

  getInitialState: function () {
    var merged = this.mergeTrips(this.props.priceGroup.journeys);
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
          pairs[id] = {
            master: journey.get("trips").get(masterDirection),
            journey: null /*multiple journeys in slaves*/,
            slaves: [],
            oneWay: false
          };
        }
        pairs[id].slaves.push({
          trip: journey.trips.get(slaveDirection),
          journey: journey
        });
      } else {
        //One ways
        if (journey.get("trips").get(masterDirection)) {
          var id = journey.get("trips").get(masterDirection).getId();
          pairs[id] = {
            master: journey.get("trips").get(masterDirection),
            journey: journey ,
            oneWay: true
          };
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

  isInCounterpart(thisMaster,thisDirection) {
    var thisId = thisMaster.getId();
    var thatDirection = thisDirection == "outbound" ? "inbound" : "outbound";
    var isThere = false;
    this.state.selected.get(thatDirection).slaves.forEach((slave) => {
      if (thisId == slave.trip.getId()) {
        isThere = true;
      }
    });
    return isThere;
  },
  renderLeg: function (direction) {

    return (
      <div className="legs-content">
        {this.state.merged[direction+"s"].map((pair) => {
          var id = pair.master.getId();
          var selected = false;
          if (this.state.selected.get(direction)) {
            selected = id == this.state.selected.get(direction).master.getId();
          }
          if (pair.oneWay) {
            return <TripInfo selected={selected} key={"oneway-"+id} onSelect={this.selectFunc(pair,direction)} trip={pair.master}></TripInfo>
          } else {
            return <TripInfo selected={selected} hidden={!this.isInCounterpart(pair.master, direction)} key={direction+"-"+id} onSelect={this.selectFunc(pair,direction)} trip={pair.master}></TripInfo>
          }
        })}
      </div>
    )
  },
  renderInbounds: function () {
    return (
      <div className="inbound-legs">
        <div className="legs-header">
          Inbound
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
          Outbound
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
        <div className="price-group--header">{price}</div>
        {this.renderOutbounds()}
        {isReturn?this.renderInbounds():""}
        <div>
          <LinkButton sharedJourney={sharedJourney} groupPrice={price} selected={this.state.selected}></LinkButton>
        </div>
      </div>
    )
  }
});
