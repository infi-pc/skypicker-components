var React = require('react');
var translate = require('./../tools/translate.jsx');
var OptionsStore = require('./../stores/OptionsStore.jsx');
var PureRenderMixin = require('react').addons.PureRenderMixin;


var Price = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState() {
    return {
      currency: OptionsStore.data.currency
    }
  },

  setStateFromStore() {
    this.setState({
      currency: OptionsStore.data.currency
    });
  },

  componentDidMount: function () {
    OptionsStore.events.on("change", this.setStateFromStore);
  },
  componentWillUnmount: function () {
    OptionsStore.events.removeListener("change", this.setStateFromStore);
  },

  render: function() {
    var eurPrice = this.props.children;
    var currency = this.state.currency.toLowerCase();
    var priceInCurrency;
    if (window.Skypicker) {
      priceInCurrency = (eurPrice / window.Skypicker.config.currencies[currency].rate).toFixed(window.Skypicker.config.currencies[currency].round);
    } else {
      priceInCurrency = eurPrice;
    }
    return (
      <span>
        { translate("currency."+currency,{price: priceInCurrency}, priceInCurrency) }
      </span>
    );
  }
});

module.exports = Price;
