/** @jsx React.DOM */

//Using global, TODO make it somehow importable from another bundle
var React = window.React;
//var React = require('react');

var moment = require('moment');

var PriceCol = React.createClass({

  getInitialState: function() {
    return {
      showTooltip: false
    };
  },

  getDefaultProps: function() {
    return {
      price: null,
      onSelect: function () {},
      enabled: false,
      selected: false,
      minPrice: -1,
      maxPrice: -1,
      dayData: null
    };
  },

  onOver: function () {

  },
  onLeave: function () {

  },
  select: function () {
    this.props.onSelect()
  },
  render: function() {
    var tooltip = "";
    if (showTooltip) {
      tooltip = (
        <div class="hg-tooltip cloak"
          ng-show="shownTooltip && dayData.price">
          <span class="price">
          {tr("from")}
            <span class="price-format">
            { this.props.price }
            </span>
          </span>
          <span class="info">
            //<i>{{ meta.airlines[fare.airlineId].name }}</i><br />
          </span>
        </div>
      );
    }
    return ( //onMouseLeave={ this.props.onLeave }
      <div
        onOver={this.onOver}
        onLeave={this.onLeave}
        className="price-col-bar-wrap"
      >
        <div className="js-price-col price-col-bar" onClick={this.select}>
        </div>
        {tooltip}
      </div>
    );
  }
});

module.exports = PriceCol;
