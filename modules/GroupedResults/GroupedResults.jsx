var React = require('react');
var SearchFormStore = require('../stores/SearchFormStore.jsx');
var FlightsAPI = require('../APIs/FlightsAPI.jsx');
var OptionsStore  = require('./../stores/OptionsStore.jsx');
var PriceGroup = require('./PriceGroup.jsx');

module.exports = React.createClass({
  className: "GroupedResults",

  getInitialState: function () {
    return {
      priceGroups: []
    }
  },

  groupFlights: function (flights) {
    var priceGroupsIndex = {};
    flights.forEach((flight) => {
      var index = ""+flight.price;
      if (!priceGroupsIndex[index]) {
        priceGroupsIndex[index] = [];
      }
      priceGroupsIndex[index].push(flight);
    });
    return Object.keys(priceGroupsIndex).map((key) => {
      return {
        price: priceGroupsIndex[key][0].price,
        flights: priceGroupsIndex[key]
      }
    });
  },
  loadFlights: function () {
    var flightsAPI = new FlightsAPI({lang: OptionsStore.data.language});
    flightsAPI.findFlights({
      origin: SearchFormStore.data.origin,
      destination: SearchFormStore.data.destination,
      outboundDate: SearchFormStore.data.dateFrom,
      inboundDate: SearchFormStore.data.dateTo,
      passengers: SearchFormStore.data.passengers
    }).then((flights) => {
      console.log(flights);
      this.setState({
        priceGroups: this.groupFlights(flights)
      });
    }).catch((err) => {
      //TODO nicer error handling
      console.error(err);
    });
  },
  componentDidMount: function() {
    SearchFormStore.events.on("change", () => {
      this.loadFlights();
    })
  },
  render: function() {
    return (
      <div>
      {this.state.priceGroups.map((priceGroup) => {
        return (<PriceGroup price={priceGroup.price} flights={priceGroup.flights}></PriceGroup>)
      })}
      </div>
    );
  }
});

