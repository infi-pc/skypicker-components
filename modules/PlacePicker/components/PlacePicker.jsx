/** @jsx React.DOM */


var testShit = null;

var React = require('react');
React.initializeTouchEvents(true);
var tr = require('./../../tr.js');

var Places = require('./Places.jsx');
var ModalMenuMixin = require('./../../ModalMenuMixin.jsx');
var Place = require('./../../containers/Place.jsx');


var airportsAndCitiesTypes = [Place.TYPE_CITY, Place.TYPE_AIRPORT];
var countryTypes = [Place.TYPE_COUNTRY];

var PlacePicker = React.createClass({
  mixins: [ModalMenuMixin],
  getInitialState: function() {
    return {
      viewMode: this.getDefaultMode()
    };
  },

  getDefaultProps: function() {
    return {
      value: null,
      lang: 'en'
    };
  },

  getDefaultMode: function () {
    if (this.props.value.mode != "text" || this.props.value.isDefault) {
      return "countries";
    } else {
      return "all";
    }
  },

  componentDidMount: function () {
    var mode = this.state.viewMode;
    this.props.onSizeChange(this.props.sizes[mode]);
  },

  //TODO move it to options
  getModeLabel: function (mode) {
    var modeLabels = {
      all: tr("All places","all"),
      nearby: tr("Nearby","nearby"),
      cheapest: tr("Cheapest","cheapest"),
      citiesAndAirports: tr("Cities and airports","cities_and_airports"),
      countries: tr("Countries","countries"),
      anywhere: tr("Anywhere","anywhere"),
      radius: tr("Radius search","radius")
    };
    return modeLabels[mode];
  },

  checkMode: function () {
    if (this.props.value.mode == "text" && !this.props.value.isDefault) {
      if (this.state.viewMode != "all") {
        this.setState({
          viewMode: "all"
        });
      }
    }
  },

  componentDidUpdate: function (nextProps, nextState) {
    if (nextProps.value != this.props.value) {
      this.checkMode();
    }
  },

  selectValue: function (value) {
    this.props.onChange(value, "select");
  },

  renderAll: function () {
    return <Places search={this.props.value} onSelect={this.selectValue} />;
  },

  renderNearby: function () {
    return <Places search={this.props.value} onSelect={this.selectValue} nearby={true}/>;
  },

  renderCheapest: function () {
    return (<div>sss</div>)
  },

  renderCitiesAndAirports: function () {
    return <Places search={this.props.value} onSelect={this.selectValue} types={airportsAndCitiesTypes}/>;
  },

  renderCountries: function () {
    return <Places search={this.props.value} onSelect={this.selectValue} types={countryTypes}/>;
  },

  renderAnywhere: function () {
    return (<div></div>)
  },

  renderRadius: function () {
    return (<div></div>)
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
