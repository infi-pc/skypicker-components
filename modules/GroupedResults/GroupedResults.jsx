var React = require('react');
var SearchFormStore = require('../stores/SearchFormStore.jsx');
var flightsAPI = require('../APIs/flightsAPI.jsx');
var OptionsStore  = require('./../stores/OptionsStore.jsx');
var PriceGroup = require('./PriceGroup.jsx');

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
      var index = ""+journey.getPrice();
      if (!priceGroupsIndex[index]) {
        priceGroupsIndex[index] = [];
      }
      priceGroupsIndex[index].push(journey);
    });
    return Object.keys(priceGroupsIndex).map((key) => {
      return {
        price: priceGroupsIndex[key][0].getPrice(),
        journeys: priceGroupsIndex[key]
      }
    }).sort((a, b) => {
      return a.price > b.price ? 1 : -1
    });
  },
  loadFlights: function () {
    flightsAPI.findFlights({
      origin: SearchFormStore.data.origin,
      destination: SearchFormStore.data.destination,
      outboundDate: SearchFormStore.data.dateFrom,
      inboundDate: SearchFormStore.data.dateTo,
      passengers: SearchFormStore.data.passengers
    }).then((journeys) => {
      this.setState({
        priceGroups: this.groupJourneys(journeys)
      });
    }).catch((err) => {
      //TODO nicer error handling
      console.error(err, err.stack);
    });
  },
  componentDidMount: function() {
    SearchFormStore.events.on("search", (type) => {
      this.loadFlights();
    })
  },
  render: function() {
    return (
      <div>
      {this.state.priceGroups.map((priceGroup) => {
        return (<PriceGroup key={"_"+priceGroup.price} price={priceGroup.price} journeys={priceGroup.journeys}></PriceGroup>)
      })}
      </div>
    );
  }
});

