/** @jsx React.DOM */


var testShit = null;

var React = require('react');
React.initializeTouchEvents(true);
var tr = require('./../../tr.js');

var Places = require('./Places.jsx');
var Place = require('./../../containers/Place.jsx');

var PlacePicker = React.createClass({

  getInitialState: function() {
    return {

      viewMode: "all"
    };
  },

  getDefaultProps: function() {
    return {
      value: null,
      defaultMode: "single",
      lang: 'en'
    };
  },

  componentDidMount: function () {
    var mode = this.state.viewMode;
    this.props.onSizeChange(this.props.sizes[mode]);
  },

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

  switchModeTo: function (mode) {
    var self = this;
    return function () {
      self.setState({
        viewMode: mode
      });
    }
  },

  changeValue: function (value) {
    this.props.onChange(value);
  },

  renderBody: function() {
    var mode = this.state.viewMode;
    if (!mode ) {
      return "";
    }
    var methodName = "render"+mode.charAt(0).toUpperCase() + mode.slice(1);
    if (this[methodName]) {
      return this[methodName]();
    } else {
      throw new Error("no such method: " + methodName)
    }
  },

  renderAll: function () {
    return <Places key="allContent" search={this.props.value} onSelect={this.changeValue} />;
  },

  renderNearby: function () {
    return (<div>sss</div>)
  },

  renderCheapest: function () {
    return (<div>sss</div>)
  },

  renderCitiesAndAirports: function () {
    return <Places key="citiesAndAirportsContent" search={this.props.value} onSelect={this.changeValue} types={[Place.TYPE_CITY, Place.TYPE_AIRPORT]}/>;
  },

  renderCountries: function () {
    return <Places key="countriesContent" search={this.props.value} onSelect={this.changeValue} types={[Place.TYPE_COUNTRY]}/>;
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
