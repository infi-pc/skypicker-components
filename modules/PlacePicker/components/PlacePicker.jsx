/** @jsx React.DOM */


var testShit = null;

var React = require('react');
React.initializeTouchEvents(true);
var tr = require('./../../tr.js');
var PlacesAPI = require('./../../APIs/PlacesAPICached.jsx');

var Place = require('./Place.jsx');
var PlacePicker = React.createClass({

  getInitialState: function() {
    return {
      lastValue: new SearchPlace(""),
      viewMode: "all",
      places: [],
      apiError: false,
      loading: false
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
      citiesAndAirports: tr("Time to stay","cities_and_airports"),
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

  setSearchText: function (searchText) {
    var placesAPI = new PlacesAPI({lang: this.props.lang});
    this.setState({
      loading: true,
      searchText: searchText
    });
    placesAPI.findByName(searchText, (error, results) => {
      //TODO prevent race condition
      if (!error) {
        this.setState({
          places: results,
          apiError: false,
          loading: false
        });
      } else {
        this.setState({
          places: [],
          apiError: true,
          loading: false
        });
      }
    });
  },

  changeValue: function (value) {

    this.props.onChange(new SearchPlace(value));
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
    return (
      <div className="places">
        {this.renderPlaces()}
      </div>
    )
  },

  renderNearby: function () {
    return (<div>sss</div>)
  },

  renderCheapest: function () {
    return (<div>sss</div>)
  },

  renderCountries: function () {
    return (<div>sss</div>)
  },

  renderAnywhere: function () {
    return (<div>sss</div>)
  },

  renderRadius: function () {
    return (<div>sss</div>)
  },

  renderPlaces: function () {
    return this.state.places.map((place) => {
      return (<Place onSelect={this.changeValue} place={place} />)
    });
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (this.state.lastValue.getText() != this.props.value.getText()) {
      this.setSearchText(this.props.value.getText());
      this.setState({
        lastValue: this.props.value
      });
    }
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
