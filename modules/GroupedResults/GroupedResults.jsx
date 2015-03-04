var React = require('react');
var SearchFormStore = require('../stores/SearchFormStore.jsx');
var flightsAPI = require('../APIs/flightsAPI.jsx');
var OptionsStore  = require('./../stores/OptionsStore.jsx');
var PriceGroup = require('./PriceGroup.jsx');


var priceGroupKey = (priceGroup) => priceGroup.price+"_"+priceGroup.isReturn;

module.exports = React.createClass({
  displayName: "GroupedResults",

  getInitialState: function () {
    return {
      priceGroups: []
    };
  },
  /* group journeys by price */
  groupJourneys: function (journeys) {
    var priceGroupsIndex = {};
    journeys.forEach((journey) => {
      var index = ""+journey.getPrice()+"_"+journey.isReturn();
      if (!priceGroupsIndex[index]) {
        priceGroupsIndex[index] = {
          price: journey.getPrice(),
          isReturn: journey.isReturn(),
          journeys: []
        };
      }
      priceGroupsIndex[index].journeys.push(journey);
    });
    return Object.keys(priceGroupsIndex).map((key) => {
      return priceGroupsIndex[key];
    }).sort((a, b) => {
      return a.price > b.price ? 1 : -1
    });
  },

  findPreselectedJourney: function (journeys, id) {
    var preselectedJourney = null;
    journeys.forEach((journey) => {
      if (journey.getId() == id) {
        preselectedJourney = journey;
      }
    });
    return preselectedJourney;
  },

  findPreselectedGroup: function (groups, journeyToFind) {
    var preselectedGroup = null;
    groups.forEach((group) => {
      group.journeys.forEach((journey) => {
        if (journeyToFind == journey) {
          preselectedGroup = group;
        }
      })
    });
    return preselectedGroup;
  },

  loadFlights: function () {
    this.setState({
      loading: true
    });
    var promise = flightsAPI.findFlights({
      origin: SearchFormStore.data.origin,
      destination: SearchFormStore.data.destination,
      outboundDate: SearchFormStore.data.dateFrom,
      inboundDate: SearchFormStore.data.dateTo,
      passengers: SearchFormStore.data.passengers
    });
    promise.then((journeys) => {
      if (promise != this.lastPromise) return;
      var preselectedJourney = this.findPreselectedJourney(journeys, this.props.preselectedId);
      var priceGroups = this.groupJourneys(journeys);
      var preselectedGroup = this.findPreselectedGroup(priceGroups, preselectedJourney);
      this.toScroll = true;
      this.setState({
        priceGroups: priceGroups,
        preselectedJourney: preselectedJourney,
        preselectedGroup: preselectedGroup
      });
    }).catch((err) => {
      //TODO nicer error handling
      console.error(err, err.stack);
    });
    this.lastPromise = promise;
  },

  componentDidUpdate: function() {
    if (typeof this.toScroll != "undefined") {
      if (this.state.preselectedJourney && this.state.preselectedGroup) {
        var thisNode = this.getDOMNode();
        var groupNode = this.refs[priceGroupKey(this.state.preselectedGroup)].getDOMNode();
        var rect = groupNode.getBoundingClientRect();
        thisNode.scrollTop = rect.top - 300 /* magic constant :) just move it a little bit higher */;
      }
      this.toScroll = undefined;
    }
  },

  componentDidMount: function() {
    SearchFormStore.events.on("search", (type) => {
      this.loadFlights();
    })
  },

  render: function() {
    return (
      <div className="grouped-results">
        <div ref="scroll">
          {this.state.priceGroups.map((priceGroup) => {
            //TODO pass state.preselectedJourney into group - also just for
            return (
              <PriceGroup
                preselected={(this.state.preselectedGroup === priceGroup)?this.state.preselectedJourney:null}
                ref={priceGroupKey(priceGroup)}
                key={priceGroupKey(priceGroup)}
                priceGroup={priceGroup}>
              </PriceGroup>
            )
          })}
        </div>
      </div>
    );
  }
});

