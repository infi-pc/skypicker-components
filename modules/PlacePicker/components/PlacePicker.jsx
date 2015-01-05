/** @jsx React.DOM */

var React = require('react');
React.initializeTouchEvents(true);
var tr = require('./../../tr.js');
var PlacesAPI = require('./../../APIs/PlacesAPI.jsx');

var Place = require('./Place.jsx');
var PlacePicker = React.createClass({

  getInitialState: function() {
    return {
      value: this.props.value,
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
      <div>
        <span>{this.props.value.getText()}</span>
        {this.renderPlaces()}
      </div>
    )
  },

  renderNearby: function () {
    return (<div>sss</div>)
  },

  renderPlaces: function () {
    console.log(this.state.places);
    return this.state.places.map(function (place) {
      return (<Place place={place} />)
    });
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (prevProps.value.getText() != this.props.value.getText()) {
      this.setSearchText(this.props.value.getText());
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
