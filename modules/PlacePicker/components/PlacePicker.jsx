/** @jsx React.DOM */


var testShit = null;

var React = require('react');
React.initializeTouchEvents(true);
var tr = require('./../../tr.js');

var Places = require('./Places.jsx');
var ModalMenuMixin = require('./../../ModalMenuMixin.jsx');
var Place = require('./../../containers/Place.jsx');

var PlacePicker = React.createClass({
  mixins: [ModalMenuMixin],
  getInitialState: function() {
    return {
      viewMode: "all"
    };
  },

  getDefaultProps: function() {
    return {
      value: null,
      lang: 'en'
    };
  },

  componentDidMount: function () {
    var mode = this.state.viewMode;
    this.props.onSizeChange(this.props.sizes[mode]);
  },

  //TODO move it to options
  getModeLabel: function (mode) {
    var modeLabels = {
      all: tr("All","all"),
      nearby: tr("Nearby","nearby"),
      cheapest: tr("Cheapest","cheapest"),
      citiesAndAirports: tr("Cities and airports","cities_and_airports"),
      countries: tr("Countries","countries"),
      anywhere: tr("Anywhere","anywhere"),
      radius: tr("Radius search","radius")
    };
    return modeLabels[mode];
  },

  selectValue: function (value) {
    this.props.onChange(value, "select");
  },

  renderAll: function () {
    return <Places key="allContent" search={this.props.value} onSelect={this.selectValue} />;
  },

  renderNearby: function () {
    return (<div>sss</div>)
  },

  renderCheapest: function () {
    return (<div>sss</div>)
  },

  renderCitiesAndAirports: function () {
    return <Places key="citiesAndAirportsContent" search={this.props.value} onSelect={this.selectValue} types={[Place.TYPE_CITY, Place.TYPE_AIRPORT]}/>;
  },

  renderCountries: function () {
    return <Places key="countriesContent" search={this.props.value} onSelect={this.selectValue} types={[Place.TYPE_COUNTRY]}/>;
  },

  renderAnywhere: function () {
    return (<div>sss</div>)
  },

  renderRadius: function () {
    return (<div>sss</div>)
  },

  render: function() {
    var mode = this.state.viewMode;

    var modeOptions = [];
    for (var imode in this.props.modes) {
      if (this.props.modes[imode]) {
        modeOptions.push(<div key={imode} className={ (mode == imode) ? "active" : "" } onClick={ this.switchModeTo(imode) }>{ this.getModeLabel(imode) }</div>)
      }
    }

    return (
      <div className={'search-place-picker search-picker '+mode}>
        <div className="mode-selector">
          {modeOptions}
        </div>
        <div className="content">
          { this.renderBody() }
        </div>
        <div className='clear-both'></div>
      </div>
    );
  }
});


module.exports = PlacePicker;
